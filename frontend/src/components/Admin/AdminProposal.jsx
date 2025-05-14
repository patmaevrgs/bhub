import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch,
  Avatar,
  alpha
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { format } from 'date-fns';
import API_BASE_URL from '../../config';

function AdminProposal() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch proposals data
  useEffect(() => {
    fetchProposals();
  }, [statusFilter, showArchived]);
  
  // Add this useEffect to handle filtering and searching
  useEffect(() => {
    if (!proposals.length) {
      setFilteredProposals([]);
      return;
    }
    
    let filtered = [...proposals];
    
    // Filter by status if not 'all'
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }
    
    // Apply search filter if searchTerm exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(proposal => 
        proposal.projectTitle.toLowerCase().includes(term) ||
        proposal.fullName.toLowerCase().includes(term) ||
        (proposal.serviceId && proposal.serviceId.toLowerCase().includes(term))
      );
    }
    
    setFilteredProposals(filtered);
  }, [proposals, statusFilter, searchTerm, showArchived]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      
      // If not showing archived, only fetch non-rejected proposals
      if (!showArchived) {
        queryParams.append('excludeStatus', 'rejected');
      }
      
      const response = await fetch(`${API_BASE_URL}/proposals?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.proposals);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch proposals');
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle viewing proposal details
  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setOpenDetailsDialog(true);
  };
  
  // Handle updating proposal status
  const handleUpdateStatus = (proposal) => {
    setSelectedProposal(proposal);
    setStatusValue(proposal.status);
    setAdminComment(proposal.adminComment || '');
    setOpenStatusDialog(true);
  };
  
  // Submit status update
  const submitStatusUpdate = async () => {
    if (!selectedProposal || !statusValue) return;
    
    setUpdateLoading(true);
    
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

      const response = await fetch(`${API_BASE_URL}/proposals/${selectedProposal._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusValue,
          adminComment: adminComment,
          adminName: adminName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update proposal status');
      }
      
      // Update the proposals list with the updated proposal
      setProposals(proposals.map(proposal => 
        proposal._id === selectedProposal._id ? data.proposal : proposal
      ));
      
      setOpenStatusDialog(false);
      setSnackbar({
        open: true,
        message: 'Proposal status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update proposal status',
        severity: 'error'
      });
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Handle deleting a proposal
  const handleDeleteProposal = (proposal) => {
    setSelectedProposal(proposal);
    setOpenDeleteDialog(true);
  };
  
  // Confirm proposal deletion
  const confirmDeleteProposal = async () => {
    if (!selectedProposal) return;
    
    setDeleteLoading(true);
    
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

      const response = await fetch(`${API_BASE_URL}/proposals/${selectedProposal._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminName: adminName // Send admin name with delete request
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete proposal');
      }
      
      // Remove the deleted proposal from the list
      setProposals(proposals.filter(proposal => proposal._id !== selectedProposal._id));
      
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Proposal deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete proposal',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString || 'N/A';
    }
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    let color = 'default';
    let label = status;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'Pending';
        break;
      case 'in_review':
        color = 'info';
        label = 'In Review';
        break;
      case 'considered':
        color = 'primary';
        label = 'Considered';
        break;
      case 'approved':
        color = 'success';
        label = 'Approved';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      default:
        color = 'default';
        label = status.replace('_', ' ');
    }
    
    return <Chip size="small" label={label} color={color} />;
  };
  
  // Render loading state
  if (loading && proposals.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
  
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
        <FileIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        Project Proposals Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchProposals}
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

    {/* Search */}
    <Paper 
      sx={{ 
        mb: 3, 
        p: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Search bar */}
        <Grid item xs={12} sm={6} md={4} sx={{minWidth:'320px'}}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by title, name or service ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            onClick={() => setSearchTerm('')}
            fullWidth
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            Clear Search
          </Button>
        </Grid>
      </Grid>
    </Paper>
    {/* Main Content with Tabs */}
    <Paper 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={statusFilter === 'all' ? 0 : 
                 statusFilter === 'pending' ? 1 : 
                 statusFilter === 'in_review' ? 2 : 
                 statusFilter === 'considered' ? 3 : 
                 statusFilter === 'approved' ? 4 : 5}
          onChange={(e, newValue) => {
            switch(newValue) {
              case 0: setStatusFilter('all'); break;
              case 1: setStatusFilter('pending'); break;
              case 2: setStatusFilter('in_review'); break;
              case 3: setStatusFilter('considered'); break;
              case 4: setStatusFilter('approved'); break;
              case 5: setStatusFilter('rejected'); break;
              default: setStatusFilter('all');
            }
          }}
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
                All Proposals
                <Chip 
                  label={proposals.length} 
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
                  label={proposals.filter(p => p.status === 'pending').length} 
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: proposals.filter(p => p.status === 'pending').length > 0 ? 'warning.main' : 'grey.400',
                    color: 'white',
                    display: proposals.filter(p => p.status === 'pending').length > 0 ? 'flex' : 'none'
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                In Review
                <Chip 
                  label={proposals.filter(p => p.status === 'in_review').length} 
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: proposals.filter(p => p.status === 'in_review').length > 0 ? 'info.main' : 'grey.400',
                    color: 'white',
                    display: proposals.filter(p => p.status === 'in_review').length > 0 ? 'flex' : 'none'
                  }}
                />
              </Box>
            } 
          />
          <Tab label="Considered" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>
      {loading && proposals.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={32} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading proposals...
          </Typography>
        </Box>
      ) : filteredProposals.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FileIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No project proposals found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try changing your filters or refreshing the page
          </Typography>
        </Box>
      ) : !isMobile ? (
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
                  Project Title
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
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Submitted By
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Submission Date
                </TableCell>
                {statusFilter === 'all' && (
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                      fontSize: '0.8rem'
                    }}
                  >
                    Status
                  </TableCell>
                )}
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
              {filteredProposals.map((proposal) => (
                <TableRow 
                  key={proposal._id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {proposal.projectTitle}
                  </TableCell>
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
                      {proposal.serviceId || 'N/A'}
                    </Box>
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
                        {proposal.fullName ? 
                          proposal.fullName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2) : 
                          'U'}
                      </Avatar>
                      {proposal.fullName}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatDate(proposal.createdAt)}
                  </TableCell>
                  {statusFilter === 'all' && (
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {getStatusChip(proposal.status)}
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={() => handleViewDetails(proposal)}
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
                      
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={() => handleUpdateStatus(proposal)}
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
                      
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon sx={{ fontSize: '0.9rem' }} />}
                        onClick={() => handleDeleteProposal(proposal)}
                        sx={{ 
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1,
                          minWidth: 0
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        ) : (
        <Box sx={{ p: 2 }}>
          {proposals.map((proposal) => (
            <Paper
              key={proposal._id}
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2,
                borderLeft: 6,
                borderColor: theme => {
                  switch (proposal.status) {
                    case 'pending': return 'warning.main';
                    case 'in_review': return 'info.main';
                    case 'considered': return 'primary.main';
                    case 'approved': return 'success.main';
                    case 'rejected': return 'error.main';
                    default: return 'grey.400';
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                  {proposal.projectTitle}
                </Typography>
                {getStatusChip(proposal.status)}
              </Box>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ID: {proposal.serviceId || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        mr: 1, 
                        bgcolor: 'primary.light',
                        fontSize: '0.7rem'
                      }}
                    >
                      {proposal.fullName ? 
                        proposal.fullName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2) : 
                        'U'}
                    </Avatar>
                    {proposal.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Submitted on
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(proposal.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                  onClick={() => handleViewDetails(proposal)}
                  sx={{ 
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                  }}
                >
                  View
                </Button>
                
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                  onClick={() => handleUpdateStatus(proposal)}
                  sx={{ 
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                  }}
                >
                  Update
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon sx={{ fontSize: '0.9rem' }} />}
                  onClick={() => handleDeleteProposal(proposal)}
                  sx={{ 
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
    {/* Proposal Details Dialog */}
    <Dialog
      open={openDetailsDialog}
      onClose={() => setOpenDetailsDialog(false)}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      {selectedProposal && (
        <>
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6" component="span">
                Project Proposal Details
              </Typography>
              <Chip 
                label={selectedProposal.status.replace('_', ' ').toUpperCase()} 
                color={
                  selectedProposal.status === 'pending' ? 'warning' :
                  selectedProposal.status === 'in_review' ? 'info' :
                  selectedProposal.status === 'considered' ? 'primary' :
                  selectedProposal.status === 'approved' ? 'success' :
                  selectedProposal.status === 'rejected' ? 'error' : 'default'
                }
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setOpenDetailsDialog(false)}
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
                        {selectedProposal.projectTitle}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                      <Chip 
                        label={`Service ID: ${selectedProposal.serviceId || 'N/A'}`}
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
                  Submitter Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedProposal.fullName}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Contact Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedProposal.contactNumber}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedProposal.email}
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
                  Submission Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Date Submitted
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(selectedProposal.createdAt)}
                    </Typography>
                  </Box>
                  
                  {selectedProposal.updatedAt && selectedProposal.updatedAt !== selectedProposal.createdAt && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedProposal.updatedAt)}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedProposal.processedBy && selectedProposal.processedBy.firstName && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Processed By
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedProposal.processedBy.firstName} {selectedProposal.processedBy.lastName}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Current Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {getStatusChip(selectedProposal.status)}
                    </Box>
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
                  <DescriptionIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                  Project Description
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 1,
                      bgcolor: alpha('#f5f5f5', 0.7),
                      borderRadius: 2
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-line',
                        fontSize: '0.9rem',
                        lineHeight: 1.6
                      }}
                    >
                      {selectedProposal.description}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
              
              {/* Admin comments section */}
              {selectedProposal.adminComment && (
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
                    <CommentIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                    Admin Comments
                  </Typography>
                  
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
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          fontSize: '0.9rem',
                          lineHeight: 1.6
                        }}
                      >
                        {selectedProposal.adminComment}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              )}
              
              {/* Project Document */}
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
                  <AttachFileIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                  Project Document
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      py: 2,
                      px: 3,
                      bgcolor: alpha('#f5f5f5', 0.7),
                      border: '1px dashed',
                      borderColor: 'primary.light',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      width: 'fit-content'
                    }}
                  >
                    <FileIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, mr: 2 }}>
                      {selectedProposal.documentFilename || 'Project Document'}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      component="a"
                      href={`${API_BASE_URL}${selectedProposal.documentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        ml: 2,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      View Document
                    </Button>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button 
              onClick={() => handleUpdateStatus(selectedProposal)} 
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
            <Button 
              onClick={() => setOpenDetailsDialog(false)} 
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
        </>
      )}
    </Dialog>
    
    {/* Update Status Dialog */}
    <Dialog
      open={openStatusDialog}
      onClose={() => !updateLoading && setOpenStatusDialog(false)}
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
        Update Proposal Status
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update the status of "{selectedProposal?.projectTitle}" submitted by {selectedProposal?.fullName}.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={statusValue}
              label="Status"
              onChange={(e) => setStatusValue(e.target.value)}
              disabled={updateLoading}
              sx={{ 
                borderRadius: 1.5,
              }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="considered">Considered</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Admin Comments"
            multiline
            rows={4}
            fullWidth
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            disabled={updateLoading}
            placeholder="Optional: Provide feedback, explanation, or additional information for the resident"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              } 
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={() => {
            setOpenStatusDialog(false);
            setSelectedProposal(null);
          }}
          disabled={updateLoading}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={submitStatusUpdate} 
          color="primary" 
          variant="contained"
          disabled={updateLoading}
          sx={{ 
            borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 500,
          position: 'relative'
        }}
      >
        {updateLoading ? (
          <CircularProgress size={24} sx={{ position: 'absolute' }} />
        ) : (
          'Update Status'
        )}
      </Button>
    </DialogActions>
  </Dialog>
  
  {/* Delete Confirmation Dialog */}
  <Dialog
    open={openDeleteDialog}
    onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
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
      <DeleteIcon sx={{ mr: 1.5, color: 'error.main' }} />
      Confirm Deletion
    </DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <Box sx={{ pt: 1 }}>
        <Typography variant="body2">
          Are you sure you want to delete the proposal "{selectedProposal?.projectTitle}"? This action cannot be undone.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button 
        onClick={() => {
          setOpenDeleteDialog(false);
          setSelectedProposal(null);
        }}
        disabled={deleteLoading}
        sx={{ 
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={confirmDeleteProposal} 
        color="error" 
        variant="contained"
        disabled={deleteLoading}
        sx={{ 
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 500,
          position: 'relative'
        }}
      >
        {deleteLoading ? (
          <CircularProgress size={24} sx={{ position: 'absolute' }} />
        ) : (
          'Delete'
        )}
      </Button>
    </DialogActions>
  </Dialog>
  {/* Snackbar for notifications */}
  <Snackbar
    open={snackbar.open}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert 
      onClose={handleCloseSnackbar} 
      severity={snackbar.severity} 
      sx={{ 
        width: '100%',
        borderRadius: 1.5,
        '& .MuiAlert-icon': {
          fontSize: '1.25rem'
        }
      }}
    >
      {snackbar.message}
    </Alert>
  </Snackbar>
</Box>
  );
}
  
export default AdminProposal;