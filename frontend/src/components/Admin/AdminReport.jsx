import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper, Grid, Box, TextField, Button,
  Tab, Tabs, MenuItem, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, Snackbar, Alert, Chip,
  CardMedia, Card, Avatar, Tooltip, IconButton, TableContainer,
  Table, TableHead, TableBody, TableRow, TableCell,
  FormControl, InputLabel, Select
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

function AdminReport() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    adminComments: ''
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch all reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on tab selection and search term
  useEffect(() => {
    if (!reports.length) return;
    
    let filtered = [...reports];
    
    // Filter by status based on tab
    if (tabValue === 1) {
      filtered = filtered.filter(report => report.status === 'Pending');
    } else if (tabValue === 2) {
      filtered = filtered.filter(report => report.status === 'In Progress');
    } else if (tabValue === 3) {
      filtered = filtered.filter(report => report.status === 'Resolved');
    } else if (tabValue === 4) {
      filtered = filtered.filter(report => report.status === 'Cancelled');
    }

    // Filter by issue type if not set to 'all'
    if (issueTypeFilter !== 'all') {
      filtered = filtered.filter(report => report.issueType === issueTypeFilter);
    }
    
    // Apply search filter if searchTerm exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        (report.serviceId && report.serviceId.toLowerCase().includes(term)) ||
        report.fullName.toLowerCase().includes(term) ||
        report.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, tabValue, searchTerm, issueTypeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/reports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        setFilteredReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      handleAlert('Failed to fetch reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    // Reset status update when opening details
    setStatusUpdate({
      status: report.status,
      adminComments: report.adminComments || ''
    });
  };

  const handleUpdateStatus = () => {
    setUpdateDialogOpen(true);
  };

  const handleStatusInputChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdate(prev => ({ ...prev, [name]: value }));
  };

  const submitStatusUpdate = async () => {
    try {
      // Get admin's name from localStorage
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      let adminName = '';
      
      if (firstName && lastName) {
        adminName = `${firstName} ${lastName}`;
      } else if (localStorage.getItem("fullName")) {
        adminName = localStorage.getItem("fullName");
      } else {
        adminName = localStorage.getItem("user") || "Unknown Admin";
      }
      
      const response = await fetch(
        `http://localhost:3002/reports/${selectedReport._id}/status`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...statusUpdate,
            adminName // Add admin name to the request
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Update the reports array with the updated report
        const updatedReports = reports.map(report => 
          report._id === selectedReport._id ? data.report : report
        );
        setReports(updatedReports);
        
        handleAlert('Report status updated successfully', 'success');
        
        // Close both dialogs
        setUpdateDialogOpen(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      handleAlert('Failed to update report status', 'error');
    }
  };

  const handleAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Resolved': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  // Render media galleries
  const renderMedia = (report) => {
    return (
      <>
        {report.mediaUrls && report.mediaUrls.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
              Media ({report.mediaUrls.length}):
            </Typography>
            <Grid container spacing={1}>
              {report.mediaUrls.map((url, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      image={`http://localhost:3002${url}`}
                      alt={`Report image ${index + 1}`}
                      sx={{ 
                        height: 150, 
                        objectFit: 'cover',
                        '&:hover': {
                          cursor: 'pointer',
                          opacity: 0.9
                        }
                      }}
                      onClick={() => window.open(`http://localhost:3002${url}`, '_blank')}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </>
    );
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
        <InfoIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        Infrastructure Reports Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReports}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          Refresh
        </Button>
      </Box>
    </Box>

    {/* Search and Filter */}
    <Paper 
      sx={{ 
        mb: 3, 
        p: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Search by Name or Location */}
        <Grid item xs={12} sm={6} md={4} sx={{minWidth:'320px'}}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Name, Location, or Service ID"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
            }}
            sx={{ 
              '& .MuiInputBase-root': {
                borderRadius: 1.5,
              },
              minWidth: '250px'
            }}
          />
        </Grid>
        
        {/* Filter by Issue Type */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Issue Type</InputLabel>
            <Select
              value={issueTypeFilter}
              label="Filter by Issue Type"
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              sx={{ 
                borderRadius: 1.5,
              }}
            >
              <MenuItem value="all">All Issue Types</MenuItem>
              {/* Dynamically generate issue type options from existing reports */}
              {Array.from(new Set(reports.map(report => report.issueType))).map((issueType) => (
                <MenuItem key={issueType} value={issueType}>{issueType}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setIssueTypeFilter('all');
            }}
            fullWidth
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
    {/* Tabs and List View */}
    <Paper 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
              py: 1.5
            },
            '& .Mui-selected': {
              fontWeight: 600
            },
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                All Reports
                <Chip 
                  label={reports.length} 
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: 'grey.600',
                    color: 'white'
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pending
                <Chip 
                  label={reports.filter(r => r.status === 'Pending').length} 
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: reports.filter(r => r.status === 'Pending').length > 0 ? 'warning.main' : 'grey.400',
                    color: 'white',
                    display: reports.filter(r => r.status === 'Pending').length > 0 ? 'flex' : 'none'
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                In Progress
                <Chip 
                  label={reports.filter(r => r.status === 'In Progress').length} 
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: reports.filter(r => r.status === 'In Progress').length > 0 ? 'info.main' : 'grey.400',
                    color: 'white',
                    display: reports.filter(r => r.status === 'In Progress').length > 0 ? 'flex' : 'none'
                  }}
                />
              </Box>
            } 
          />
          <Tab label="Resolved" />
          <Tab label="Cancelled" />
        </Tabs>
      </Box>
      {/* Reports List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={32} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading reports...
          </Typography>
        </Box>
      ) : filteredReports.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InfoIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No {tabValue !== 0 ? (tabValue === 1 ? 'Pending' : tabValue === 2 ? 'In Progress' : tabValue === 3 ? 'Resolved' : 'Cancelled') : ''} reports found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try changing your filters or refreshing the page
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: { xs: '450px', sm: '600px' } }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Service ID
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Issue Type
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Location
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Reported By
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Date Reported
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Status
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow 
                  key={report._id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: '#f5f5f5',
                      width: 'fit-content',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                    }}>
                      {report.serviceId || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {report.issueType}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Tooltip title={`Near ${report.nearestLandmark}`} arrow>
                      <span>{report.location}</span>
                    </Tooltip>
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
                        {report.fullName ? 
                          report.fullName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2) : 
                          'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                          {report.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.contactNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatDate(report.createdAt)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Chip
                      label={report.status.toUpperCase()}
                      color={getStatusColor(report.status)}
                      size="small"
                      sx={{ 
                        height: 24, 
                        fontSize: '0.75rem',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                    {report.residentFeedback && (
                      <Tooltip 
                        title={`Resident ${report.residentFeedback.satisfied ? 'Satisfied' : 'Not Satisfied'}: "${report.residentFeedback.comments || ''}"`}
                        arrow
                      >
                        <Chip
                          size="small"
                          icon={report.residentFeedback.satisfied ? <ThumbUpIcon fontSize="small" /> : <ThumbDownIcon fontSize="small" />}
                          label="Feedback"
                          variant="outlined"
                          color={report.residentFeedback.satisfied ? "success" : "error"}
                          sx={{ ml: 0, mt:1, height: 24, fontSize: '0.75rem' }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={() => handleViewReport(report)}
                        sx={{ 
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          py: 0.5,
                          minWidth: 0,
                        }}
                      >
                        View
                      </Button>
                      
                      {report.status !== 'Cancelled' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            handleViewReport(report);
                            handleUpdateStatus();
                          }}
                          sx={{ 
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1,
                            minWidth: 0
                          }}
                        >
                          Update
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
    {/* Report Detail Dialog */}
    {selectedReport && !updateDialogOpen && (
      <Dialog 
        open={Boolean(selectedReport)} 
        onClose={() => setSelectedReport(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h6" component="span">
              Infrastructure Report Details
            </Typography>
            <Chip 
              label={selectedReport.status.toUpperCase()} 
              color={getStatusColor(selectedReport.status)}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setSelectedReport(null)}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#f5f5f5', 0.8),
                color: 'text.primary'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Box sx={{md: 5}} />
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Header info */}
          <Box sx={{ mb: 3 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: alpha('#e3f2fd', 0.3),
                border: '1px solid',
                borderColor: alpha('#2196f3', 0.1),
                borderRadius: 2
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedReport.issueType}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Chip 
                      label={`Service ID: ${selectedReport.serviceId || 'N/A'}`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        height: 28,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        borderRadius: 1,
                        bgcolor: '#f5f5f5'
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          {/* Main content */}
          <Grid container spacing={3}>
            {/* Left column */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <PersonIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                Reporter Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Reported By
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedReport.fullName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Contact Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedReport.contactNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedReport.location}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Nearest Landmark
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedReport.nearestLandmark}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Right column */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <InfoIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                Report Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Issue Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedReport.issueType}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Date Observed
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(selectedReport.dateObserved)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Report Submitted
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(selectedReport.createdAt)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    <Chip 
                      label={selectedReport.status.toUpperCase()}
                      color={getStatusColor(selectedReport.status)}
                      size="small"
                    />
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ChatIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                Description & Comments
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Description
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mt: 1,
                    bgcolor: alpha('#f5f5f5', 0.7),
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1">
                    {selectedReport.description}
                  </Typography>
                </Paper>
              </Box>
              
              {selectedReport.additionalComments && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Additional Comments
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 1,
                      bgcolor: alpha('#f5f5f5', 0.7),
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1">
                      {selectedReport.additionalComments}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Grid>
            
            {/* Media section */}
            {selectedReport.mediaUrls && selectedReport.mediaUrls.length > 0 && (
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <PhotoLibraryIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                  Media Attachments
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {selectedReport.mediaUrls.map((url, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }
                        }}
                        onClick={() => window.open(`http://localhost:3002${url}`, '_blank')}
                      >
                        <CardMedia
                          component="img"
                          image={`http://localhost:3002${url}`}
                          alt={`Attachment ${index + 1}`}
                          sx={{ height: 200, objectFit: 'cover' }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
            {/* Admin comments section */}
            {selectedReport.adminComments && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: alpha('#f5f5f5', 0.7),
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary',
                        fontSize: '0.8rem'
                      }}
                    >
                      <CommentIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      Admin Notes
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                      {selectedReport.adminComments}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            )}
            
            {/* Resident feedback section */}
            {selectedReport.residentFeedback && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: selectedReport.residentFeedback.satisfied 
                        ? alpha('#4caf50', 0.1) 
                        : alpha('#f44336', 0.1),
                      border: '1px solid',
                      borderColor: selectedReport.residentFeedback.satisfied 
                        ? alpha('#4caf50', 0.3) 
                        : alpha('#f44336', 0.3),
                      borderRadius: 2
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: selectedReport.residentFeedback.satisfied 
                          ? 'success.main' 
                          : 'error.main'
                      }}
                    >
                      {selectedReport.residentFeedback.satisfied 
                        ? <ThumbUpIcon sx={{ mr: 1, fontSize: '1rem' }} /> 
                        : <ThumbDownIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      }
                      Resident Feedback: {selectedReport.residentFeedback.satisfied ? 'Satisfied' : 'Not Satisfied'}
                    </Typography>
                    {selectedReport.residentFeedback.comments && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, fontStyle: 'italic' }}>
                        "{selectedReport.residentFeedback.comments}"
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          {selectedReport.status !== 'Cancelled' && (
            <Button 
              onClick={() => {
                setUpdateDialogOpen(true);
              }} 
              color="primary"
              variant="contained"
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Update Status
            </Button>
          )}
          <Button 
            onClick={() => setSelectedReport(null)} 
            variant="outlined"
            sx={{ 
              ml: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )}
    {/* Status Update Dialog */}
    <Dialog
      open={updateDialogOpen}
      onClose={() => {
        setUpdateDialogOpen(false);
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <EditIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        Update Report
        </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={statusUpdate.status}
            onChange={handleStatusInputChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              } 
            }}
            size="small"
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          
          <TextField
            fullWidth
            label="Admin Comments"
            name="adminComments"
            value={statusUpdate.adminComments}
            onChange={handleStatusInputChange}
            multiline
            rows={4}
            placeholder="Add notes about the status update or resolution details..."
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              } 
            }}
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={() => {
            setUpdateDialogOpen(false);
            setSelectedReport(null);
          }}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={submitStatusUpdate}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Alert/Snackbar for notifications */}
    <Snackbar 
      open={alert.open} 
      autoHideDuration={6000} 
      onClose={closeAlert}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeAlert} 
        severity={alert.severity} 
        sx={{ 
          width: '100%',
          borderRadius: 1.5,
          '& .MuiAlert-icon': {
            fontSize: '1.25rem'
          }
        }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  </Box>
);
}

export default AdminReport;