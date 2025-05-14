import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  useMediaQuery,
  Pagination,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CategoryIcon from '@mui/icons-material/Category';
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState(''); // New filter for entity type
  const [uniqueAdmins, setUniqueAdmins] = useState([]);
  const [uniqueActions, setUniqueActions] = useState([]);
  const [uniqueEntityTypes, setUniqueEntityTypes] = useState([]); // New state for entity types
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [serviceIdSearch, setServiceIdSearch] = useState('');

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // The list of all possible entity types
  const allEntityTypes = [
    'Announcement',
    'Report',
    'ProjectProposal',
    'DocumentRequest',
    'AmbulanceBooking',
    'CourtReservation',
    'Other'
  ];

  useEffect(() => {
    // Get current admin's full name from localStorage
    try {
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      
      if (firstName && lastName) {
        setCurrentAdmin(`${firstName} ${lastName}`);
      } else if (localStorage.getItem("fullName")) {
        setCurrentAdmin(localStorage.getItem("fullName"));
      } else {
        setCurrentAdmin(localStorage.getItem("user") || "Unknown Admin");
      }
    } catch (e) {
      console.error("Error getting admin name:", e);
      setCurrentAdmin("Unknown Admin");
    }
  }, []);

  const fetchLogs = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.adminName) params.append('adminName', filters.adminName);
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType); // Add entity type to query params
      if (filters.serviceId) params.append('serviceId', filters.serviceId);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`http://localhost:3002/logs${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data);
      
      // Calculate total pages
      setTotalPages(Math.ceil(data.length / logsPerPage));
      
      // Extract unique admins, actions, and entity types for filters
      const admins = [...new Set(data.map(log => log.adminName))];
      const actions = [...new Set(data.map(log => log.action))];
      const entityTypes = [...new Set(data.map(log => log.entityType))];
      
      setUniqueAdmins(admins);
      setUniqueActions(actions);
      setUniqueEntityTypes(entityTypes);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please try again later.');
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    const filters = {
      startDate,
      endDate,
      adminName: adminFilter,
      action: actionFilter,
      entityType: entityTypeFilter // Include entity type in filters
    };
    fetchLogs(filters);
    setCurrentPage(1); // Reset to first page when filtering
    if (isMobile) {
      setFilterExpanded(false); // Collapse filter on mobile after applying
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setAdminFilter('');
    setServiceIdSearch('');
    setActionFilter('');
    setEntityTypeFilter(''); // Clear entity type filter
    fetchLogs();
    setCurrentPage(1);
  };

  // Get human-readable action type
  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE_ANNOUNCEMENT': return 'Created Announcement';
      case 'UPDATE_ANNOUNCEMENT': return 'Updated Announcement';
      case 'DELETE_ANNOUNCEMENT': return 'Deleted Announcement';
      case 'UPDATE_REPORT_STATUS': return 'Updated Report Status';
      case 'CANCEL_REPORT': return 'Cancelled Report';
      case 'UPDATE_PROPOSAL_STATUS': return 'Updated Proposal Status';
      case 'UPDATE_DOCUMENT_REQUEST_STATUS': return 'Updated Document Request';
      case 'DELETE_PROPOSAL': return 'Deleted Proposal';
      // Add new action types for ambulance bookings
      case 'AMBULANCE_BOOKING_ACCEPTED': return 'Accepted Ambulance Booking';
      case 'AMBULANCE_BOOKING_CANCELLED': return 'Cancelled Ambulance Booking';
      case 'AMBULANCE_BOOKING_COMPLETED': return 'Completed Ambulance Booking';
      case 'AMBULANCE_BOOKING_NEEDS_APPROVAL': return 'Requested Diesel Cost Approval';
      case 'AMBULANCE_BOOKING_UPDATED': return 'Updated Ambulance Booking';
      // Add new action types for court reservations
      case 'COURT_RESERVATION_APPROVED': return 'Approved Court Reservation';
      case 'COURT_RESERVATION_REJECTED': return 'Rejected Court Reservation';
      case 'COURT_RESERVATION_CANCELLED': return 'Cancelled Court Reservation';
      case 'COURT_RESERVATION_UPDATED': return 'Updated Court Reservation';
      // Add resident database actions
      case 'CREATE': return 'Created Resident';
      case 'UPDATE': return 'Updated Resident';
      case 'DELETE': return 'Deleted Resident';
      case 'VERIFY': return 'Verified Resident';
      case 'REJECT': return 'Rejected Resident Request';
      case 'IMPORT': return 'Imported CSV to Database'

      default: return action.replace(/_/g, ' ').toLowerCase();
    }
  };
  
  // Get action chip color
  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE_ANNOUNCEMENT': return 'primary';
      case 'UPDATE_ANNOUNCEMENT': return 'warning';
      case 'DELETE_ANNOUNCEMENT': return 'error';
      case 'UPDATE_REPORT_STATUS': return 'info';
      case 'CANCEL_REPORT': return 'error';
      case 'UPDATE_PROPOSAL_STATUS': return 'success';
      case 'UPDATE_DOCUMENT_REQUEST_STATUS': return 'secondary';
      case 'DELETE_PROPOSAL': return 'error';
      // Add colors for ambulance booking actions
      case 'AMBULANCE_BOOKING_ACCEPTED': return 'success';
      case 'AMBULANCE_BOOKING_CANCELLED': return 'error';
      case 'AMBULANCE_BOOKING_COMPLETED': return 'primary';
      case 'AMBULANCE_BOOKING_NEEDS_APPROVAL': return 'warning';
      case 'AMBULANCE_BOOKING_UPDATED': return 'info';
      // Add colors for court reservation actions
      case 'COURT_RESERVATION_APPROVED': return 'success';
      case 'COURT_RESERVATION_REJECTED': return 'error';
      case 'COURT_RESERVATION_CANCELLED': return 'error';
      case 'COURT_RESERVATION_UPDATED': return 'info';

      // Add resident database actions with appropriate colors
      case 'CREATE': return 'primary';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      case 'VERIFY': return 'success';
      case 'REJECT': return 'error';
      case 'IMPORT': return 'primary'

      default: return 'default';
    }
  };

  // Get entity type label
  const getEntityTypeLabel = (entityType) => {
    switch(entityType) {
      case 'Announcement': return 'Announcement';
      case 'Report': return 'Infrastructure Report';
      case 'ProjectProposal': return 'Project Proposal';
      case 'DocumentRequest': return 'Document Request';
      case 'AmbulanceBooking': return 'Ambulance Booking';
      case 'CourtReservation': return 'Court Reservation';
      case 'Other': return 'Other';
      default: return entityType;
    }
  };

  // Get entity type color
  const getEntityTypeColor = (entityType) => {
    switch(entityType) {
      case 'Announcement': return 'primary';
      case 'Report': return 'info';
      case 'ProjectProposal': return 'success';
      case 'DocumentRequest': return 'secondary';
      case 'AmbulanceBooking': return 'error';
      case 'CourtReservation': return 'warning';
      case 'Other': return 'default';
      default: return 'default';
    }
  };

  // Extract service ID from details string if present
  const extractServiceId = (details) => {
    // First try to match Service ID pattern
    const serviceIdRegex = /\(Service ID: ([a-zA-Z0-9-]+)\)/i;
    const serviceIdMatch = details.match(serviceIdRegex);
    
    if (serviceIdMatch) {
      return serviceIdMatch[1];
    }
    
    // If no Service ID is found, try to match the MongoDB ID pattern
    const idRegex = /\(ID: ([a-f\d]{24})\)/i;
    const idMatch = details.match(idRegex);
    return idMatch ? idMatch[1] : null;
  };

  // Copy ID to clipboard
  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Pagination logic
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDateChange = (e, field) => {
    if (field === 'start') {
      setStartDate(e.target.value);
      setTimeout(() => {
        fetchLogs({
          startDate: e.target.value,
          endDate,
          adminName: adminFilter,
          action: actionFilter,
          entityType: entityTypeFilter,
          serviceId: serviceIdSearch
        });
      }, 300);
    } else {
      setEndDate(e.target.value);
      setTimeout(() => {
        fetchLogs({
          startDate,
          endDate: e.target.value,
          adminName: adminFilter,
          action: actionFilter,
          entityType: entityTypeFilter,
          serviceId: serviceIdSearch
        });
      }, 300);
    }
  };

  const handleAdminFilterChange = (e) => {
    setAdminFilter(e.target.value);
    fetchLogs({
      startDate,
      endDate,
      adminName: e.target.value,
      action: actionFilter,
      entityType: entityTypeFilter,
      serviceId: serviceIdSearch
    });
  };

  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
    fetchLogs({
      startDate,
      endDate,
      adminName: adminFilter,
      action: e.target.value,
      entityType: entityTypeFilter,
      serviceId: serviceIdSearch
    });
  };

  const handleEntityTypeFilterChange = (e) => {
    setEntityTypeFilter(e.target.value);
    fetchLogs({
      startDate,
      endDate,
      adminName: adminFilter,
      action: actionFilter,
      entityType: e.target.value,
      serviceId: serviceIdSearch
    });
  };

  const handleServiceIdSearch = (e) => {
    setServiceIdSearch(e.target.value);
    // Small delay to prevent too many requests while typing
    if (e.target.value.length >= 3 || e.target.value === '') {
      setTimeout(() => {
        fetchLogs({
          startDate,
          endDate,
          adminName: adminFilter,
          action: actionFilter,
          entityType: entityTypeFilter,
          serviceId: e.target.value
        });
      }, 300);
    }
  };

  // Get current logs for the page
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  // Toggle filter section on mobile
  const toggleFilter = () => {
    setFilterExpanded(!filterExpanded);
  };

  return (
  <Box sx={{ p: 3 }}>
    {/* Header */}
    <Box 
      sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography 
        variant="h5" 
        component="h2"
        sx={{ 
          fontWeight: 600,
          display: 'flex', 
          alignItems: 'center'
        }}
      >
        <EventNoteIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        Admin Activity Logs
      </Typography>
      <Button
        variant="outlined"
        onClick={fetchLogs}
        startIcon={<RefreshIcon />}
        size="small"
        sx={{ 
          borderRadius: 1.5,
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.85rem'
        }}
      >
        Refresh Logs
      </Button>
    </Box>

    {currentAdmin && (
      <Alert 
        severity="info" 
        variant="outlined"
        sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center',
          '& .MuiAlert-icon': {
            color: 'primary.main'
          }
        }}
        icon={<PersonIcon />}
      >
        <Typography variant="body2">
          Logged in as: <strong>{currentAdmin}</strong>
        </Typography>
      </Alert>
    )}
    
    {/* Mobile filter toggle */}
    {isMobile && (
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={toggleFilter}
        startIcon={filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ 
          mb: 2,
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        {filterExpanded ? 'Hide Filters' : 'Show Filters'}
      </Button>
    )}
    
    {/* Filter section */}
    <Paper 
      sx={{ 
        display: isMobile && !filterExpanded ? 'none' : 'block',
        mb: 3,
        p: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 2, 
          fontWeight: 600, 
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center' 
        }}
      >
        <FilterListIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
        Filter Activity Logs
      </Typography>
      
      <Grid container spacing={2}>
        {/* Add Service ID Search Bar */}
        <Grid item xs={12} lg={6} xl={4}>
          <TextField
            fullWidth
            label="Search by Service ID"
            placeholder="Enter service ID to search"
            value={serviceIdSearch}
            onChange={handleServiceIdSearch}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.2rem', color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '180px', sm: '180px', md: '240px' }
                  },
                  bgcolor: 'background.paper'
                }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e, 'start')}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(e, 'end')}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2} sx={{minWidth:'90px'}}>
          <FormControl fullWidth size="small">
            <InputLabel id="admin-filter-label">Admin</InputLabel>
            <Select
              labelId="admin-filter-label"
              value={adminFilter}
              label="Admin"
              onChange={handleAdminFilterChange}
            >
              <MenuItem value="">All Admins</MenuItem>
              {uniqueAdmins.map(admin => (
                <MenuItem key={admin} value={admin}>{admin}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2} sx={{minWidth:'90px'}}>
          <FormControl fullWidth size="small">
            <InputLabel id="action-filter-label">Action</InputLabel>
            <Select
              labelId="action-filter-label"
              value={actionFilter}
              label="Action"
              onChange={handleActionFilterChange}
            >
              <MenuItem value="">All Actions</MenuItem>
              {uniqueActions.map(action => (
                <MenuItem key={action} value={action}>{getActionLabel(action)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2} sx={{minWidth:'130px'}}>
          <FormControl fullWidth size="small">
            <InputLabel id="entity-filter-label">Service Type</InputLabel>
            <Select
              labelId="entity-filter-label"
              value={entityTypeFilter}
              label="Service Type"
              onChange={handleEntityTypeFilterChange}
            >
              <MenuItem value="">All Services</MenuItem>
              {allEntityTypes.map(type => (
                <MenuItem key={type} value={type}>{getEntityTypeLabel(type)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 0,
          gap: 0,
          flexWrap: 'wrap'
        }}>
          <Button
            type="button"
            variant="outlined"
            onClick={clearFilters}
            startIcon={<ClearAllIcon />}
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Clear Filters
          </Button>
      </Box>
      </Grid>
    </Paper>

    {/* Active filters display */}
    {!loading && !error && logs.length > 0 && (
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Showing {logs.length} log {logs.length === 1 ? 'entry' : 'entries'}
          </Typography>
          
          {(startDate || endDate || adminFilter || actionFilter || entityTypeFilter) && (
            <Button 
              size="small" 
              onClick={clearFilters}
              startIcon={<ClearAllIcon fontSize="small" />}
              sx={{ 
                fontSize: '0.75rem',
                textTransform: 'none'
              }}
            >
              Clear all filters
            </Button>
          )}
        </Box>
        
        {/* Filter chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          {serviceIdSearch && (
            <Chip 
              size="small" 
              icon={<SearchIcon fontSize="small" />} 
              label={`Service ID: ${serviceIdSearch}`}
              color="primary"
              variant="outlined"
              onDelete={() => {
                setServiceIdSearch('');
                fetchLogs({ 
                  startDate, 
                  endDate, 
                  adminName: adminFilter, 
                  action: actionFilter,
                  entityType: entityTypeFilter
                });
              }}
              sx={{ 
                height: 24, 
                '& .MuiChip-label': { 
                  px: 1,
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
          {adminFilter && (
            <Chip 
              size="small" 
              icon={<PersonIcon fontSize="small" />} 
              label={`Admin: ${adminFilter}`}
              onDelete={() => {
                setAdminFilter('');
                fetchLogs({ 
                  startDate, 
                  endDate, 
                  action: actionFilter,
                  entityType: entityTypeFilter 
                });
              }}
              sx={{ 
                height: 24, 
                '& .MuiChip-label': { 
                  px: 1,
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
          
          {actionFilter && (
            <Chip 
              size="small" 
              icon={<EventNoteIcon fontSize="small" />} 
              label={`Action: ${getActionLabel(actionFilter)}`}
              color={getActionColor(actionFilter)}
              variant="outlined"
              onDelete={() => {
                setActionFilter('');
                fetchLogs({ 
                  startDate, 
                  endDate, 
                  adminName: adminFilter,
                  entityType: entityTypeFilter 
                });
              }}
              sx={{ 
                height: 24, 
                '& .MuiChip-label': { 
                  px: 1,
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
          
          {entityTypeFilter && (
            <Chip 
              size="small" 
              icon={<CategoryIcon fontSize="small" />} 
              label={`Service: ${getEntityTypeLabel(entityTypeFilter)}`}
              color={getEntityTypeColor(entityTypeFilter)}
              variant="outlined"
              onDelete={() => {
                setEntityTypeFilter('');
                fetchLogs({ 
                  startDate, 
                  endDate, 
                  adminName: adminFilter,
                  action: actionFilter
                });
              }}
              sx={{ 
                height: 24, 
                '& .MuiChip-label': { 
                  px: 1,
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
          
          {(startDate || endDate) && (
            <Chip 
              size="small" 
              icon={<CalendarTodayIcon fontSize="small" />} 
              label={startDate && endDate ? `${startDate} to ${endDate}` : (startDate ? `From ${startDate}` : `Until ${endDate}`)}
              onDelete={() => {
                setStartDate('');
                setEndDate('');
                fetchLogs({ 
                  adminName: adminFilter, 
                  action: actionFilter,
                  entityType: entityTypeFilter
                });
              }}
              sx={{ 
                height: 24, 
                '& .MuiChip-label': { 
                  px: 1,
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
        </Box>
      </Box>
    )}
    
    {/* Logs display section */}
    <Paper 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
        mb: 2
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={28} sx={{ mb: 1 }} />
          <Typography variant="body2" display="block" sx={{ ml: 2, color: 'text.secondary' }}>
            Loading activity logs...
          </Typography>
        </Box>
      ) : error ? (
        <Alert 
          severity="error"
          variant="outlined"
          sx={{ m: 2 }}
        >
          {error}
        </Alert>
      ) : logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <EventNoteIcon sx={{ fontSize: '2rem', color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No activity logs found matching your criteria
          </Typography>
        </Box>
      ) : (
        <>
          {/* Table view for desktop/tablet */}
          {!isMobile && (
            <TableContainer sx={{ 
              maxHeight: 'calc(100vh - 300px)',
              overflowX: 'auto',  // Add horizontal scroll for small screens
              width: '100%'
            }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Date & Time
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Admin
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Action
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Service Type
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem',
                        width: '30%'
                      }}
                    >
                      Details
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Service ID
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentLogs.map((log) => {
                    const serviceId = extractServiceId(log.details);
                    return (
                      <TableRow key={log._id} hover>
                        <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1, 
                                bgcolor: 'primary.light',
                                fontSize: '0.7rem'
                              }}
                            >
                              {log.adminName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2)}
                            </Avatar>
                            {log.adminName}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          <Chip 
                            label={getActionLabel(log.action)}
                            size="small"
                            color={getActionColor(log.action)}
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.75rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          <Chip 
                            label={getEntityTypeLabel(log.entityType)}
                            size="small"
                            color={getEntityTypeColor(log.entityType)}
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.75rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: '0.85rem',
                          maxWidth: '200px',  // Limit the width
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {log.details}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {serviceId ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ 
                                mr: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.8rem'
                              }}>
                                {serviceId.length > 10 ? `${serviceId.substring(0, 8)}...` : serviceId}
                              </Typography>
                              <Tooltip title={copiedId === serviceId ? "Copied!" : "Copy ID"}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => copyToClipboard(serviceId)}
                                  color={copiedId === serviceId ? "success" : "default"}
                                  sx={{ p: 0.5 }}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Card view for mobile */}
          {isMobile && (
            <Box sx={{ p: 1 }}>
              {currentLogs.map((log) => {
                const serviceId = extractServiceId(log.details);
                return (
                  <Paper
                    key={log._id}
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 1, 
                      flexWrap: 'wrap',
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1, 
                            bgcolor: 'primary.light',
                            fontSize: '0.7rem'
                          }}
                        >
                          {log.adminName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2)}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
                          {log.adminName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.8, 
                      mt: 1.5, 
                      mb: 1.5,
                      flexWrap: 'wrap'
                    }}>
                      <Chip 
                        label={getActionLabel(log.action)}
                        size="small"
                        color={getActionColor(log.action)}
                        variant="outlined"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.75rem',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                      
                      <Chip 
                        label={getEntityTypeLabel(log.entityType)}
                        size="small"
                        color={getEntityTypeColor(log.entityType)}
                        variant="outlined"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.75rem',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem',
                        backgroundColor: alpha('#f5f5f5', 0.5),
                        p: 1,
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      {log.details}
                    </Typography>
                    
                    {serviceId && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 1,
                        bgcolor: alpha('#e3f2fd', 0.5),
                        p: 0.5,
                        pl: 1,
                        borderRadius: 1,
                        width: 'fit-content'
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mr: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          ID: {serviceId.length > 12 ? `${serviceId.substring(0, 10)}...` : serviceId}
                        </Typography>
                        <Tooltip title={copiedId === serviceId ? "Copied!" : "Copy ID"}>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(serviceId)}
                            color={copiedId === serviceId ? "success" : "primary"}
                            sx={{ p: 0.3 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
                siblingCount={isMobile ? 0 : 1}
              />
            </Box>
          )}
        </>
      )}
    </Paper>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        {logs.length > 0 ? `Showing ${Math.min(indexOfFirstLog + 1, logs.length)} to ${Math.min(indexOfLastLog, logs.length)} of ${logs.length} logs` : 'No logs found'}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>
  </Box>
);
}

export default AdminLogs;