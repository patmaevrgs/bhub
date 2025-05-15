import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Card,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import API_BASE_URL from '../../config';

function AdminRequestForms() {
  // State for document requests
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docxGenerating, setDocxGenerating] = useState(false);
  const [clearanceNumber, setClearanceNumber] = useState('');
  const [amountField, setAmountField] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering
  const [filter, setFilter] = useState({
    status: 'all',
    documentType: 'all',
    searchTerm: ''
  });
  
  // Selected request for viewing details
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  
  // Status update dialog
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Print preview dialog
  const [openPrintPreview, setOpenPrintPreview] = useState(false);
  
  // Tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Document type mapping
  const documentTypeMap = {
    barangay_id: 'Barangay ID',
    barangay_clearance: 'Barangay Clearance',
    business_clearance: 'Business Clearance',
    lot_ownership: 'Lot Ownership',
    digging_permit: 'Digging Permit',
    fencing_permit: 'Fencing Permit',
    request_for_assistance: 'Request for Assistance',
    certificate_of_indigency: 'Certificate of Indigency',
    certificate_of_residency: 'Certificate of Residency',
    no_objection_certificate: 'No Objection Certificate',
  };
  
  // Fetch all document requests
  useEffect(() => {
    fetchRequests();
  }, []);
  
  // Updated fetchRequests to properly handle the filtering
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/documents`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Filter out document requests that were cancelled by residents
        const filteredRequests = data.documentRequests.filter(req => {
          // Keep all non-cancelled requests
          if (req.status !== 'cancelled') {
            return true;
          }
          
          // If it's cancelled, check if it was cancelled by a resident
          if (req.adminComment && 
              (req.adminComment.includes('Cancelled by resident') || 
              req.adminComment.toLowerCase().includes('cancel'))) {
            return false; // Filter out resident-cancelled requests
          }
          
          return true; // Keep admin-cancelled requests
        });
        
        setRequests(filteredRequests);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to load document requests');
      }
    } catch (err) {
      console.error('Error fetching document requests:', err);
      setError('Failed to load document requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Set filter based on tab
    switch (newValue) {
      case 0: // All
        setFilter({ ...filter, status: 'all' });
        break;
      case 1: // Pending
        setFilter({ ...filter, status: 'pending' });
        break;
      case 2: // In Progress
        setFilter({ ...filter, status: 'in_progress' });
        break;
      case 3: // Completed
        setFilter({ ...filter, status: 'completed' });
        break;
      case 4: // Rejected
        setFilter({ ...filter, status: 'rejected' });
        break;
      default:
        setFilter({ ...filter, status: 'all' });
    }
    
    setPage(0); // Reset to first page when changing tabs
  };
  
  // Handle document type filter change
  const handleDocumentTypeFilterChange = (event) => {
    setFilter({ ...filter, documentType: event.target.value });
    setPage(0); // Reset to first page when changing filter
  };
  
  // Handle search
  const handleSearch = (event) => {
    setFilter({ ...filter, searchTerm: event.target.value });
    setPage(0); // Reset to first page when searching
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter requests based on current filter
  // Updated filteredRequests to exclude document requests cancelled by residents
  const filteredRequests = requests
    .filter(request => {
      // Filter out requests cancelled by residents
      // Check if it's cancelled AND the admin comment indicates it was cancelled by a resident
      if (request.status === 'cancelled' && 
          request.adminComment && 
          (request.adminComment.includes('Cancelled by resident') || 
          request.adminComment.toLowerCase().includes('cancel'))) {
        return false;
      }
      
      // Status filter
      if (filter.status !== 'all' && request.status !== filter.status) {
        return false;
      }
      
      // Document type filter
      if (filter.documentType !== 'all' && request.documentType !== filter.documentType) {
        return false;
      }
      
      // Search term filter (case insensitive)
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const fullName = request.formData.fullName ? request.formData.fullName.toLowerCase() : '';
        const purpose = request.purpose ? request.purpose.toLowerCase() : '';
        const serviceId = request.serviceId ? request.serviceId.toLowerCase() : '';
        
        // Search in name, purpose, or service ID
        return fullName.includes(searchLower) || 
              purpose.includes(searchLower) || 
              serviceId.includes(searchLower);
      }
      
      return true;
    });
    
  // View request details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDetails(true);
  };
  
  // Open update status dialog
  const handleOpenUpdateStatus = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setAdminComment(request.adminComment || '');
    setOpenUpdateStatus(true);
  };
  
  // Update request status
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    
    setStatusUpdateLoading(true);
    
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

      const response = await fetch(`${API_BASE_URL}/documents/${selectedRequest._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminComment: adminComment,
          userId: localStorage.getItem('user'), // Admin ID
          adminName: adminName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }
      
      // Update the local state
      setRequests(prev => prev.map(req => 
        req._id === selectedRequest._id ? data.documentRequest : req
      ));
      
      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus.replace('_', ' ')}`,
        severity: 'success'
      });
      
      setOpenUpdateStatus(false);
      
      // If we just completed a document, show print dialog
      if (newStatus === 'completed') {
        setSelectedRequest(data.documentRequest);
        setOpenPrintPreview(true);
      }
      
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: `Failed to update status: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  
  // Open print preview
  const handlePrintPreview = (request) => {
    setSelectedRequest(request);
    setOpenPrintPreview(true);
  };
  
  // Generate and download DOCX document
  const handleGenerateDocument = async () => {
    if (!selectedRequest) return;
    
    // Validate clearance number for barangay clearance
    if (selectedRequest.documentType === 'barangay_clearance' && !clearanceNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a clearance number',
        severity: 'error'
      });
      return;
    }
    
    setDocxGenerating(true);
    
    try {
      // Prepare request body with additional clearance number for barangay clearance
      const requestBody = {
        documentType: selectedRequest.documentType,
        formData: selectedRequest.formData,
        purpose: selectedRequest.purpose
      };
      
      // Add clearance number for barangay clearance
      if (selectedRequest.documentType === 'barangay_clearance') {
        requestBody.clearanceNumber = clearanceNumber;
      }
      
      // Add ID number for barangay ID
      if (selectedRequest.documentType === 'barangay_id') {
        requestBody.idNumber = idNumber;
      }

      // Generate a DOCX document
      const response = await fetch(`${API_BASE_URL}/documents/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const a = document.createElement('a');
      
      // Set link properties
      a.href = url;
      a.download = `${selectedRequest.documentType}_${Date.now()}.docx`;
      
      // Append to the body
      document.body.appendChild(a);
      
      // Trigger the download
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: 'Document generated successfully. Downloading now...',
        severity: 'success'
      });
      
      // Reset clearance number after successful generation
      if (selectedRequest.documentType === 'barangay_clearance') {
        setClearanceNumber('');
      }
      
      if (selectedRequest.documentType === 'barangay_id') {
        setIdNumber('');
      }

      // Close the print preview dialog after successful generation
      setOpenPrintPreview(false);
    } catch (error) {
      console.error('Error generating document:', error);
      setSnackbar({
        open: true,
        message: `Failed to generate document: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setDocxGenerating(false);
    }
  };

  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setNewStatus('rejected');
    setAdminComment(request.adminComment || '');
    setOpenUpdateStatus(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    let color = 'default';
    let label = status;
    let customSx = {};
    
    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'Pending';
        break;
      case 'in_progress':
        color = 'primary'; // We'll override this with custom styling
        label = 'In Progress';
        customSx = {
          bgcolor: '#8e24aa', 
          color: '#ffffff',   // Dark purple text
          borderColor: '#8e24aa',
          '& .MuiChip-label': { color: '#ffffff' }
        };
        break;
      case 'completed':
        color = 'success';
        label = 'Completed';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      case 'cancelled':
        color = 'default';
        label = 'Cancelled';
        break;
      default:
        color = 'default';
        label = status.replace('_', ' ');
    }
    
    return (
      <Chip 
        size="small" 
        label={label} 
        color={color}
        variant={status === 'in_progress' ? 'outlined' : undefined}
        sx={{ 
          height: status === 'in_progress' ? 24 : 20, 
          fontSize: '0.75rem',
          '& .MuiChip-label': { px: 1 },
          ...customSx
        }}
      />
    );
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Get ordinal suffix for day of month
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
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
        Document Requests
      </Typography>
      <Box sx={{ display: 'flex', gap: 1}}>
        <TextField
          size="small"
          placeholder="Search by name or service ID"
          value={filter.searchTerm}
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
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRequests}
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

    {/* Tabs Section with Count Badges */}
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
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              All Requests
              <Chip 
                label={requests.length} 
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: 'grey.200',
                  color: 'text.secondary'
                }}
              />
            </Box>
          } />
          {/* Pending Tab - With Badge (if count > 0) */}
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pending
                {requests.filter(r => r.status === 'pending').length > 0 && (
                  <Chip 
                    label={requests.filter(r => r.status === 'pending').length} 
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'warning.main',
                      color: 'white'
                    }}
                  />
                )}
              </Box>
            } 
          />
          
          {/* In Progress Tab - With Badge (if count > 0) */}
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                In Progress
                {requests.filter(r => r.status === 'in_progress').length > 0 && (
                  <Chip 
                    label={requests.filter(r => r.status === 'in_progress').length} 
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: '#8e24aa', // Darker purple for better contrast
                      color: 'white'
                    }}
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Completed" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="document-type-filter-label">Document Type</InputLabel>
          <Select
            labelId="document-type-filter-label"
            value={filter.documentType}
            onChange={handleDocumentTypeFilterChange}
            label="Document Type"
            sx={{ 
              borderRadius: 1.5,
              fontSize: '0.85rem',
            }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.entries(documentTypeMap).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Active filters display */}
        {!loading && !error && filteredRequests.length > 0 && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>
            Showing {filteredRequests.length} request{filteredRequests.length === 1 ? '' : 's'}
          </Typography>
        )}
      </Box>
    </Paper>
    {/* Error message */}
    {error && (
      <Alert 
        severity="error" 
        variant="outlined"
        sx={{ mb: 3 }}
      >
        {error}
      </Alert>
    )}
    
    {/* Loading state */}
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={32} sx={{ mr: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading document requests...
        </Typography>
      </Box>
    ) : (
      <>
        {/* Empty state */}
        {filteredRequests.length === 0 ? (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <EventNoteIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No document requests found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try changing your filters or refresh the page
            </Typography>
          </Paper>
        ) : (
          /* Table showing document requests */
          <Paper 
            sx={{ 
              width: '100%', 
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
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
                      Type
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Requester
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Date Requested
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Purpose
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
                  {filteredRequests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <TableRow 
                        key={request._id} 
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
                            {request.serviceId}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          <Chip 
                            label={documentTypeMap[request.documentType]}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ 
                              height: 24, 
                              fontSize: '0.75rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
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
                              {request.formData.fullName ? 
                                request.formData.fullName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2) :
                                request.formData.firstName ? 
                                  (request.formData.firstName.charAt(0) + (request.formData.lastName ? request.formData.lastName.charAt(0) : '')) :
                                  'U'
                              }
                            </Avatar>
                            {request.formData.fullName || 
                              (request.formData.firstName && request.formData.lastName ? 
                                `${request.formData.firstName} ${request.formData.lastName}` : 
                                'Unknown User')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {request.documentType === 'digging_permit' && request.formData.diggingPurpose
                            ? (() => {
                                const purpose = request.formData.diggingPurpose;
                                switch(purpose) {
                                  case 'water_supply': return 'Water Supply Connection';
                                  case 'electrical': return 'Electrical Connection';
                                  case 'drainage': return 'Drainage System';
                                  case 'other': return 'Other';
                                  default: return purpose;
                                }
                              })()
                            : (request.purpose.length > 30
                                ? `${request.purpose.substring(0, 30)}...`
                                : request.purpose)
                          }
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {getStatusChip(request.status)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {/* View Details Button */}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                              onClick={() => handleViewDetails(request)}
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
                            {/* Approve Button - Only for pending requests */}
                            {request.status === 'pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setNewStatus('in_progress');
                                  setAdminComment(request.adminComment || '');
                                  setOpenUpdateStatus(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5
                                }}
                              >
                                Approve
                              </Button>
                            )}
                            
                            {/* Complete Button - Only for in_progress requests */}
                            {request.status === 'in_progress' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setNewStatus('completed');
                                  setAdminComment(request.adminComment ? 
                                    `${request.adminComment}\nReady for pickup!` : 
                                    'Ready for pickup!');
                                  setOpenUpdateStatus(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5
                                }}
                              >
                                Complete
                              </Button>
                            )}
                            
                            {/* Reject Button - Only for pending and in_progress requests */}
                            {(request.status === 'pending' || request.status === 'in_progress') && (
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => handleRejectRequest(request)}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5
                                }}
                              >
                                Reject
                              </Button>
                            )}
                            
                            {/* Generate Document Button - Only for completed requests */}
                            {request.status === 'completed' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                startIcon={<PrintIcon sx={{ fontSize: '0.9rem' }} />}
                                onClick={() => handlePrintPreview(request)}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                }}
                              >
                                Generate
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              px: 2
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {filteredRequests.length > 0 ? 
                  `Showing ${Math.min(page * rowsPerPage + 1, filteredRequests.length)} to ${Math.min((page + 1) * rowsPerPage, filteredRequests.length)} of ${filteredRequests.length} requests` : 
                  'No requests found'}
              </Typography>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRequests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    fontSize: '0.75rem',
                    color: 'text.secondary'
                  },
                  '.MuiTablePagination-select': {
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Box>
          </Paper>
        )}
      </>
    )}
    {/* Request Details Dialog */}
    <Dialog
      open={openDetails}
      onClose={() => setOpenDetails(false)}
      maxWidth="md"
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
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventNoteIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Document Request Details
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => setOpenDetails(false)}
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
      <Box sx={{md:5}} />
      <DialogContent sx={{ px: 3, py: 2 }}>
      {selectedRequest && (
        <>
          {/* Header section with key details */}
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
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {documentTypeMap[selectedRequest.documentType]}
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {getStatusChip(selectedRequest.status)}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Chip 
                      label={`Service ID: ${selectedRequest.serviceId}`}
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

          {/* Timeline info */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 1.5, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                bgcolor: alpha('#f5f5f5', 0.5) 
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Requested On
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(selectedRequest.createdAt)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 1.5, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                bgcolor: alpha('#f5f5f5', 0.5) 
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Last Updated
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(selectedRequest.updatedAt)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box sx={{ 
                p: 1.5, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1,
                bgcolor: alpha('#f5f5f5', 0.5),
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Purpose
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedRequest.documentType === 'digging_permit' && selectedRequest.formData.diggingPurpose
                    ? (() => {
                        const purpose = selectedRequest.formData.diggingPurpose;
                        switch(purpose) {
                          case 'water_supply': return 'Water Supply Connection';
                          case 'electrical': return 'Electrical Connection';
                          case 'drainage': return 'Drainage System';
                          case 'other': return 'Other';
                          default: return purpose;
                        }
                      })()
                    : selectedRequest.purpose
                  }
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Requester Information */}
          <Box sx={{ mb: 3 }}>
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
              Requester Information
            </Typography>

            <Paper elevation={0} sx={{ 
              p: 2.5, 
              borderRadius: 2,
              bgcolor: '#fff',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {/* Conditional render based on document type */}
              <Grid container spacing={3}>
                {/* Certificate of Residency fields */}
                {selectedRequest.documentType === 'certificate_of_residency' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Full Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.fullName}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Age
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.age}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Address
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.address}
                          </Typography>
                        </Box>
                        {/* Add mother's name if it exists */}
                        {selectedRequest.formData.motherName && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Mother's Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedRequest.formData.motherName}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Add father's name if it exists */}
                        {selectedRequest.formData.fatherName && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Father's Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedRequest.formData.fatherName}
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Date of Birth
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatDate(selectedRequest.formData.dateOfBirth)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Place of Birth
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.placeOfBirth}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Nationality
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.nationality}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Civil Status
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.civilStatus}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Years of Stay
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.yearsOfStay}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )}
                {/* Barangay ID fields */}
                {selectedRequest && selectedRequest.documentType === 'barangay_id' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            First Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.firstName}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Middle Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.middleName || 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Last Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Address
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Date of Birth
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.birthDate}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Emergency Contact
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedRequest.formData.emergencyContactName}, {selectedRequest.formData.emergencyContactNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )}
                {/* Barangay Clearance fields */}
                {selectedRequest.documentType === 'barangay_clearance' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Gender:</strong> {selectedRequest.formData.gender === 'male' ? 'Male' : 'Female'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna 4030
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                {/* Lot Ownership fields */}
                {selectedRequest && selectedRequest.documentType === 'lot_ownership' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>TD Number:</strong> {selectedRequest.formData.tdNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Survey Number:</strong> {selectedRequest.formData.surveyNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Lot Area:</strong> {selectedRequest.formData.lotArea} {
                            (() => {
                              switch(selectedRequest.formData.areaUnit) {
                                case 'square_meters': return 'square meters';
                                case 'square_feet': return 'square feet';
                                case 'hectares': return 'hectares';
                                default: return selectedRequest.formData.areaUnit;
                              }
                            })()
                          }
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Property Location:</strong> {selectedRequest.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Owner Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Owner Address:</strong> {selectedRequest.formData.ownerAddress}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                
                {/* More document types as needed... */}
                {/* Digging Permit fields in details dialog */}
                {selectedRequest && selectedRequest.documentType === 'digging_permit' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Company:</strong> {selectedRequest.formData.companyName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Application Details:</strong> {selectedRequest.formData.applicationDetails}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
      
                {/* No Objection Certificate fields in details dialog */}
                {selectedRequest && selectedRequest.documentType === 'no_objection_certificate' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Activity Type:</strong> {
                            (() => {
                              const objectType = selectedRequest.formData.objectType;
                              switch(objectType) {
                                case 'tree_cutting': return 'Tree Cutting';
                                case 'construction': return 'Construction';
                                case 'event': return 'Event/Gathering';
                                case 'business': return 'Business Operation';
                                case 'other': return 'Other Activity';
                                default: return objectType;
                              }
                            })()
                          }
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Details:</strong> {selectedRequest.formData.objectDetails}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Quantity:</strong> {selectedRequest.formData.quantity}
                        </Typography>
                        {selectedRequest.formData.objectType === 'other' && (
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Additional Info:</strong> {selectedRequest.formData.additionalInfo}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </>
                )}
      
                {/* Business Clearance fields in details dialog */}
                {selectedRequest && selectedRequest.documentType === 'business_clearance' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Business Name:</strong> {selectedRequest.formData.businessName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Business Address:</strong> {selectedRequest.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Line of Business:</strong> {selectedRequest.formData.lineOfBusiness}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Business Status:</strong> {selectedRequest.formData.businessStatus}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Amount:</strong> ₱{selectedRequest.formData.amount}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
      
                {/* Request for Assistance fields in details dialog */}
                {selectedRequest && selectedRequest.documentType === 'request_for_assistance' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Marginalized Group:</strong> {
                            (() => {
                              const group = selectedRequest.formData.marginGroupType;
                              switch(group) {
                                case 'urban_poor': return 'Urban Poor';
                                case 'senior_citizen': return 'Senior Citizen';
                                case 'single_parent': return 'Single Parent';
                                case 'pwd': return 'Person with Disability (PWD)';
                                case 'indigenous': return 'Indigenous Person';
                                case 'solo_parent': return 'Solo Parent';
                                case 'other': return 'Other';
                                default: return group;
                              }
                            })()
                          }
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Request For:</strong> {selectedRequest.formData.isSelf ? 'Self' : 'Other Person'}
                        </Typography>
                        {!selectedRequest.formData.isSelf && (
                          <>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Beneficiary Name:</strong> {selectedRequest.formData.beneficiaryName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Relationship:</strong> {selectedRequest.formData.beneficiaryRelation}
                            </Typography>
                          </>
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Assistance Type:</strong> {
                            (() => {
                              const type = selectedRequest.formData.assistanceType;
                              switch(type) {
                                case 'financial': return 'Financial Assistance';
                                case 'medical': return 'Medical Assistance';
                                case 'burial': return 'Burial Assistance';
                                case 'educational': return 'Educational Assistance';
                                case 'food': return 'Food Assistance';
                                case 'housing': return 'Housing Assistance';
                                case 'other': return selectedRequest.formData.otherAssistanceType || 'Other Assistance';
                                default: return type;
                              }
                            })()
                          }
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                {/* Fencing Permit fields in details dialog */}
                {selectedRequest && selectedRequest.documentType === 'fencing_permit' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Residential Address:</strong> {selectedRequest.formData.residentAddress}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Property Location:</strong> {selectedRequest.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Tax Declaration No.:</strong> {selectedRequest.formData.taxDeclarationNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Property ID No.:</strong> {selectedRequest.formData.propertyIdentificationNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Property Area:</strong> {selectedRequest.formData.propertyArea} {
                            (() => {
                              switch(selectedRequest.formData.areaUnit) {
                                case 'square_meters': return 'square meters';
                                case 'square_feet': return 'square feet';
                                case 'hectares': return 'hectares';
                                default: return selectedRequest.formData.areaUnit;
                              }
                            })()
                          }
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
      
                {/* Certificate of Indigency fields in details dialog */}
                {selectedRequest.documentType === 'certificate_of_indigency' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Age:</strong> {selectedRequest.formData.age}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Address:</strong> {selectedRequest.formData.address}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Certificate For:</strong> {selectedRequest.formData.isSelf ? 'Self' : 'Other Person'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {!selectedRequest.formData.isSelf ? (
                          <>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Recipient:</strong> {selectedRequest.formData.guardian}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Relationship:</strong> {selectedRequest.formData.guardianRelation}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Recipient:</strong> Self (Same as applicant)
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          <strong>Purpose:</strong> {selectedRequest.purpose}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                </Grid>
            </Paper>
          </Box>
          
          {/* Admin comment section */}
          {selectedRequest.adminComment && (
            <Box sx={{ mb: 3 }}>
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
                Admin Notes
              </Typography>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  bgcolor: alpha('#f5f5f5', 0.5),
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedRequest.adminComment}
                </Typography>
              </Paper>
            </Box>
          )}
        </>
      )}
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        {/* Approve Button - Only for pending requests */}
        {selectedRequest && selectedRequest.status === 'pending' && (
          <Button 
            onClick={() => {
              setOpenDetails(false);
              setSelectedRequest(selectedRequest);
              setNewStatus('in_progress');
              setAdminComment(selectedRequest.adminComment || '');
              setOpenUpdateStatus(true);
            }} 
            variant="contained"
            color="primary"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              px: 2
            }}
          >
            Approve
          </Button>
        )}
        
        {/* Complete Button - Only for in_progress requests */}
        {selectedRequest && selectedRequest.status === 'in_progress' && (
          <Button 
            onClick={() => {
              setOpenDetails(false);
              setSelectedRequest(selectedRequest);
              setNewStatus('completed');
              setAdminComment(selectedRequest.adminComment ? 
                `${selectedRequest.adminComment}\nReady for pickup!` : 
                'Ready for pickup!');
              setOpenUpdateStatus(true);
            }} 
            variant="contained"
            color="success"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              px: 2
            }}
          >
            Complete
          </Button>
        )}
        
        {/* Reject Button - For pending and in_progress requests */}
        {selectedRequest && (selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
          <Button 
            onClick={() => {
              setOpenDetails(false);
              handleRejectRequest(selectedRequest);
            }} 
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              px: 2
            }}
          >
            Reject
          </Button>
        )}
        
        {/* Generate Document Button - Only for completed requests */}
        {selectedRequest && selectedRequest.status === 'completed' && (
          <Button 
            onClick={() => {
              setOpenDetails(false);
              handlePrintPreview(selectedRequest);
            }} 
            color="secondary"
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              px: 2
            }}
          >
            Generate Document
          </Button>
        )}
        
        <Button 
          onClick={() => setOpenDetails(false)} 
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

    {/* Update Status Dialog */}
    <Dialog
      open={openUpdateStatus}
      onClose={() => !statusUpdateLoading && setOpenUpdateStatus(false)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <EventNoteIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        Update Request Status
      </DialogTitle>
      <Box sx={{md:5}} />
      <DialogContent sx={{ pt: 2 }}>
        <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
          Update the status of this {selectedRequest && documentTypeMap[selectedRequest.documentType]} request.
        </DialogContentText>
        
        <FormControl fullWidth margin="normal" variant="outlined" size="small">
          <InputLabel id="status-update-label">Status</InputLabel>
          <Select
            labelId="status-update-label"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            label="Status"
            sx={{ 
              borderRadius: 1.5,
              fontSize: '0.9rem'
            }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          margin="normal"
          label="Admin Comment"
          fullWidth
          multiline
          rows={3}
          value={adminComment}
          onChange={(e) => setAdminComment(e.target.value)}
          placeholder="Add a comment or note about this request"
          variant="outlined"
          size="small"
          sx={{ 
            mt: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize: '0.9rem'
            }
          }}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => setOpenUpdateStatus(false)}
          disabled={statusUpdateLoading}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdateStatus}
          color="primary"
          variant="contained"
          disabled={statusUpdateLoading}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            position: 'relative'
          }}
        >
          {statusUpdateLoading ? (
            <>
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute',
                  color: 'inherit'
                }} 
              />
              <span style={{ opacity: 0 }}>Update</span>
            </>
          ) : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
    {/* Document Preview Dialog */}
    <Dialog
      open={openPrintPreview}
      onClose={() => setOpenPrintPreview(false)}
      maxWidth="md"
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
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PrintIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" component="span">
            Document Preview
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => setOpenPrintPreview(false)}
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
      
      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <Alert 
          severity="info" 
          variant="outlined"
          icon={<InfoIcon />}
          sx={{ 
            mb: 3,
            '& .MuiAlert-icon': {
              color: 'primary.main'
            }
          }}
        >
          <Typography variant="body2">
            Click the "Download Document" button to generate a Microsoft Word document based on the resident's information.
            You can open, edit, and print the document after downloading.
          </Typography>
        </Alert>
        
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            p: 3,
            borderRadius: 2
          }}
        >
          {selectedRequest && (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {documentTypeMap[selectedRequest.documentType]}
                </Typography>
                <Chip 
                  label={`Service ID: ${selectedRequest.serviceId}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    fontFamily: 'monospace'
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              {/* Clearance Number input field - Only for Barangay Clearance */}
              {selectedRequest.documentType === 'barangay_clearance' && (
                <Box sx={{ 
                  mb: 3,
                  p: 2,
                  bgcolor: alpha('#e3f2fd', 0.3),
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#2196f3', 0.1)
                }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Clearance Details
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    label="Clearance Number"
                    value={clearanceNumber}
                    onChange={(e) => setClearanceNumber(e.target.value)}
                    placeholder="e.g., 2025-S-511"
                    helperText="Enter the Barangay Clearance number"
                    size="small"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.9rem'
                      }
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="subtitle1" gutterBottom sx={{ 
                fontWeight: 600, 
                display: 'flex',
                alignItems: 'center',
                mb: 2
              }}>
                <EventNoteIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                Document will include:
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha('#f5f5f5', 0.5),
                borderRadius: 2,
                mb: 2
              }}>
                <Grid container spacing={2}>
                  {/* Document type specific preview */}
                  {/* Certificate of Residency fields in preview dialog */}
                  {selectedRequest.documentType === 'certificate_of_residency' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Age:</strong> {selectedRequest.formData.age} years old
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Date of Birth:</strong> {formatDate(selectedRequest.formData.dateOfBirth)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Place of Birth:</strong> {selectedRequest.formData.placeOfBirth}
                          </Typography>
                          
                          {/* Add mother's name if it exists */}
                          {selectedRequest.formData.motherName && (
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Mother's Name:</strong> {selectedRequest.formData.motherName}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Nationality:</strong> {selectedRequest.formData.nationality}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Civil Status:</strong> {selectedRequest.formData.civilStatus}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay} years
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Purpose:</strong> {selectedRequest.purpose}
                          </Typography>
                          
                          {/* Add father's name if it exists */}
                          {selectedRequest.formData.fatherName && (
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Father's Name:</strong> {selectedRequest.formData.fatherName}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </>
                  )}
                  {selectedRequest.documentType === 'barangay_clearance' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Clearance Number:</strong> {clearanceNumber || '[Enter clearance number above]'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Gender:</strong> {selectedRequest.formData.gender === 'male' ? 'Male' : 'Female'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna 4030
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Purpose:</strong> {selectedRequest.purpose}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {selectedRequest && selectedRequest.documentType === 'barangay_id' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Name:</strong> {selectedRequest.formData.firstName} {selectedRequest.formData.middleName ? selectedRequest.formData.middleName + ' ' : ''}{selectedRequest.formData.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Date of Birth:</strong> {selectedRequest.formData.birthDate}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Emergency Contact:</strong> {selectedRequest.formData.emergencyContactName}, {selectedRequest.formData.emergencyContactNumber}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* ID Number input field - For Barangay ID */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          my: 2, 
                          p: 2, 
                          bgcolor: alpha('#e3f2fd', 0.3),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#2196f3', 0.1)
                        }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Barangay ID Details
                          </Typography>
                          <TextField
                            required
                            fullWidth
                            label="ID Number"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="e.g., 246"
                            helperText="Enter the Barangay ID number"
                            size="small"
                            sx={{ 
                              mb: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontSize: '0.9rem'
                              }
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            This ID number will be printed on the resident's Barangay ID.
                          </Typography>
                        </Box>
                        
                        <Alert 
                          severity="warning" 
                          variant="outlined"
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="body2">
                            <strong>Reminder:</strong> Inform the resident to bring a 1x1 ID picture for attachment and to sign the ID upon pickup at the Barangay Hall.
                          </Typography>
                        </Alert>
                      </Grid>
                    </>
                  )}
                  {/* Add other document types as needed */}
                  {/* Certificate of Indigency fields */}
                  {selectedRequest.documentType === 'certificate_of_indigency' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Age:</strong> {selectedRequest.formData.age} years old
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Certificate For:</strong> {selectedRequest.formData.isSelf ? 'Self' : 'Other Person'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {!selectedRequest.formData.isSelf ? (
                            <>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                <strong>Recipient:</strong> {selectedRequest.formData.guardian}
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                <strong>Relationship:</strong> {selectedRequest.formData.guardianRelation}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Recipient:</strong> Self (Same as applicant)
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Purpose:</strong> {selectedRequest.purpose}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic', mt: 1 }}>
                            <strong>Document Format:</strong> This certificate will be generated in Filipino with proper formatting.
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Lot Ownership fields */}
                  {selectedRequest && selectedRequest.documentType === 'lot_ownership' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>TD Number:</strong> {selectedRequest.formData.tdNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Survey Number:</strong> {selectedRequest.formData.surveyNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Lot Area:</strong> {selectedRequest.formData.lotArea} {
                              (() => {
                                switch(selectedRequest.formData.areaUnit) {
                                  case 'square_meters': return 'square meters';
                                  case 'square_feet': return 'square feet';
                                  case 'hectares': return 'hectares';
                                  default: return selectedRequest.formData.areaUnit;
                                }
                              })()
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Property Location:</strong> {selectedRequest.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Owner Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Owner Address:</strong> {selectedRequest.formData.ownerAddress}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Fencing Permit fields */}
                  {selectedRequest && selectedRequest.documentType === 'fencing_permit' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Residential Address:</strong> {selectedRequest.formData.residentAddress}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Property Location:</strong> {selectedRequest.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Tax Declaration No.:</strong> {selectedRequest.formData.taxDeclarationNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Property ID No.:</strong> {selectedRequest.formData.propertyIdentificationNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Property Area:</strong> {selectedRequest.formData.propertyArea} {
                              (() => {
                                switch(selectedRequest.formData.areaUnit) {
                                  case 'square_meters': return 'square meters';
                                  case 'square_feet': return 'square feet';
                                  case 'hectares': return 'hectares';
                                  default: return selectedRequest.formData.areaUnit;
                                }
                              })()
                            }
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Digging Permit fields */}
                  {selectedRequest && selectedRequest.documentType === 'digging_permit' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Digging Purpose:</strong> {
                              (() => {
                                const purpose = selectedRequest.formData.diggingPurpose;
                                switch(purpose) {
                                  case 'water_supply': return 'Water Supply Connection';
                                  case 'electrical': return 'Electrical Connection';
                                  case 'drainage': return 'Drainage System';
                                  case 'other': return 'Other';
                                  default: return purpose;
                                }
                              })()
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Company:</strong> {selectedRequest.formData.companyName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Application Details:</strong> {selectedRequest.formData.applicationDetails}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Business Clearance fields */}
                  {selectedRequest && selectedRequest.documentType === 'business_clearance' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Business Name:</strong> {selectedRequest.formData.businessName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Business Address:</strong> {selectedRequest.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Line of Business:</strong> {selectedRequest.formData.lineOfBusiness}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Business Status:</strong> {selectedRequest.formData.businessStatus}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Add amount field that admin can modify */}
                      <Grid item xs={12}>
                        <Box sx={{ 
                          my: 2, 
                          p: 2, 
                          bgcolor: alpha('#e3f2fd', 0.3),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#2196f3', 0.1)
                        }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Fee Details
                          </Typography>
                          <TextField
                            fullWidth
                            label="Amount (₱)"
                            value={amountField || selectedRequest.formData.amount}
                            onChange={(e) => setAmountField(e.target.value)}
                            placeholder="e.g., 300.00"
                            size="small"
                            InputProps={{
                              startAdornment: <Typography variant="body1">₱</Typography>
                            }}
                            sx={{ 
                              mb: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontSize: '0.9rem'
                              }
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Default amount is ₱300.00. You can modify the amount if needed.
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* No Objection Certificate fields */}
                  {selectedRequest && selectedRequest.documentType === 'no_objection_certificate' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Full Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Activity Type:</strong> {
                              (() => {
                                const objectType = selectedRequest.formData.objectType;
                                switch(objectType) {
                                  case 'tree_cutting': return 'Tree Cutting';
                                  case 'construction': return 'Construction';
                                  case 'event': return 'Event/Gathering';
                                  case 'business': return 'Business Operation';
                                  case 'other': return 'Other Activity';
                                  default: return objectType;
                                }
                              })()
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Details:</strong> {selectedRequest.formData.objectDetails}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Quantity:</strong> {selectedRequest.formData.quantity}
                          </Typography>
                          {selectedRequest.formData.objectType === 'other' && (
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>Additional Info:</strong> {selectedRequest.formData.additionalInfo}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          mt: 1, 
                          p: 2, 
                          bgcolor: alpha('#f5f5f5', 0.7),
                          borderRadius: 2,
                          border: '1px dashed',
                          borderColor: 'divider',
                          fontStyle: 'italic' 
                        }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Certificate Text:</strong> {`This is to further certify that ${selectedRequest.formData.fullName}, ${selectedRequest.purpose}`}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Request for Assistance fields */}
                  {selectedRequest && selectedRequest.documentType === 'request_for_assistance' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Name:</strong> {selectedRequest.formData.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Address:</strong> {selectedRequest.formData.address}, Barangay Maahas, Los Baños, Laguna
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Years of Stay:</strong> {selectedRequest.formData.yearsOfStay} years
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Marginalized Group:</strong> {
                              (() => {
                                const group = selectedRequest.formData.marginGroupType;
                                switch(group) {
                                  case 'urban_poor': return 'URBAN POOR';
                                  case 'senior_citizen': return 'SENIOR CITIZEN';
                                  case 'single_parent': return 'SINGLE PARENT';
                                  case 'pwd': return 'PERSON WITH DISABILITY (PWD)';
                                  case 'indigenous': return 'INDIGENOUS PERSON';
                                  case 'solo_parent': return 'SOLO PARENT';
                                  case 'other': return 'OTHER';
                                  default: return group?.toUpperCase();
                                }
                              })()
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Assistance Type:</strong> {
                              (() => {
                                const type = selectedRequest.formData.assistanceType;
                                switch(type) {
                                  case 'financial': return 'Financial Assistance';
                                  case 'medical': return 'Medical Assistance';
                                  case 'burial': return 'Burial Assistance';
                                  case 'educational': return 'Educational Assistance';
                                  case 'food': return 'Food Assistance';
                                  case 'housing': return 'Housing Assistance';
                                  case 'other': return selectedRequest.formData.otherAssistanceType || 'Other Assistance';
                                  default: return type;
                                }
                              })()
                            }
                          </Typography>
                          {!selectedRequest.formData.isSelf && (
                            <>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                <strong>Beneficiary:</strong> {selectedRequest.formData.beneficiaryName} ({selectedRequest.formData.beneficiaryRelation})
                              </Typography>
                            </>
                          )}
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            <strong>Purpose:</strong> {selectedRequest.purpose}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Alert 
                          severity="info" 
                          variant="outlined"
                          sx={{ mt: 1 }}
                        >
                          <Typography variant="body2">
                            <strong>Note:</strong> This document serves as an official request for assistance and will be processed according to barangay guidelines.
                          </Typography>
                        </Alert>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </>
          )}
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => setOpenPrintPreview(false)}
          disabled={docxGenerating}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleGenerateDocument}
          color="primary"
          variant="contained"
          startIcon={docxGenerating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          disabled={docxGenerating || (selectedRequest?.documentType === 'barangay_clearance' && !clearanceNumber)}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            position: 'relative'
          }}
        >
          {docxGenerating ? (
            <>
              <span style={{ marginLeft: 24 }}>Generating...</span>
            </>
          ) : 'Download Document'}
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

export default AdminRequestForms;