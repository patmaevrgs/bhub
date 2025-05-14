import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import {
  FiberManualRecord as FiberManualRecordIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  FilterAlt as FilterAltIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import AlertTitle from '@mui/material/AlertTitle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { alpha } from '@mui/material/styles';
import PendingIcon from '@mui/icons-material/Pending';
import Avatar from '@mui/material/Avatar';
import API_BASE_URL from '../../config';


// Resident type options
const residentTypes = ['Minor', '18-30', 'Illiterate', 'PWD', 'Senior Citizen', 'Indigent'];

function AdminDatabase() {
  // State variables
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPrecinct, setSelectedPrecinct] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [voterStatus, setVoterStatus] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [openVerifyConfirmDialog, setOpenVerifyConfirmDialog] = useState(false);
  const [openRejectConfirmDialog, setOpenRejectConfirmDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [sortField, setSortField] = useState('lastName'); // Default sort by lastName
  const [rejectReason, setRejectReason] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    precinctLevel: '',
    contactNumber: '',
    email: '',
    types: [],
    isVoter: false
  });
  const [password, setPassword] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [precinctOptions, setPrecinctOptions] = useState([]);
  const [addressOptions, setAddressOptions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [openPendingDialog, setOpenPendingDialog] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [duplicatesList, setDuplicatesList] = useState([]);
  const [openDuplicatesDialog, setOpenDuplicatesDialog] = useState(false);

  // Fetch residents and options on component mount
  useEffect(() => {
    fetchResidents();
    fetchOptions();
    fetchPendingRequests();
  }, [page, rowsPerPage, searchTerm, selectedAddress, selectedPrecinct, selectedTypes, voterStatus, sortField, sortOrder]);

   // Add a new useEffect for checking duplicates when selectedResident changes
   useEffect(() => {
    if (selectedResident) {
      console.log("Selected resident for duplicate check:", selectedResident);
      checkForDuplicates({
        firstName: selectedResident.firstName,
        lastName: selectedResident.lastName
      });
    }
  }, [selectedResident]);

  // Fetch residents from API
  const fetchResidents = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        isVerified: true,
        sortBy: sortField,    
        order: sortOrder
      });

      if (searchTerm) queryParams.append('name', searchTerm);
      if (selectedAddress) queryParams.append('address', selectedAddress);
      if (selectedPrecinct) queryParams.append('precinctLevel', selectedPrecinct);
      if (selectedTypes.length > 0) queryParams.append('types', selectedTypes.join(','));
      if (voterStatus) queryParams.append('isVoter', voterStatus === 'yes');

      // if (sortField) {
      //   queryParams.append('sortBy', sortField);
      //   queryParams.append('sortOrder', sortOrder);
      // }
      const response = await fetch(`${API_BASE_URL}/residents?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setResidents(data.data);
        setTotalRows(data.pagination.total);
      } else {
        console.error('Failed to fetch residents:', data.message);
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching resident data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch precinct and address options
  const fetchOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/residents?limit=1000&isVerified=true`, {
        method: 'GET',
        credentials: 'include' // Important for sending cookies
      });

      const data = await response.json();
      
      if (data.success) {
        // Extract unique precinct levels and addresses
        const precincts = [...new Set(data.data.map(res => res.precinctLevel).filter(Boolean))];
        const addresses = [...new Set(data.data.map(res => res.address).filter(Boolean))];
        
        setPrecinctOptions(precincts.sort());
        setAddressOptions(addresses.sort());
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  // Fetch pending resident requests
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/residents?isVerified=false`, {
        method: 'GET',
        credentials: 'include' // Important for sending cookies
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAddress('');
    setSelectedPrecinct('');
    setSelectedTypes([]);
    setVoterStatus('');
    setSortField('lastName');
    setSortOrder('asc');
    setPage(0);
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      address: '',
      precinctLevel: '',
      contactNumber: '',
      email: '',
      types: [],
      isVoter: false
    });
    setDuplicateWarning(null);
    setOpenAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (resident) => {
    setSelectedResident(resident);
    setFormData({
      firstName: resident.firstName,
      middleName: resident.middleName || '',
      lastName: resident.lastName,
      address: resident.address,
      precinctLevel: resident.precinctLevel || '',
      contactNumber: resident.contactNumber || '',
      email: resident.email || '',
      types: resident.types || [],
      isVoter: resident.isVoter || false
    });
    setDuplicateWarning(null);
    setPassword('');
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (resident) => {
    setSelectedResident(resident);
    setPassword('');
    setOpenDeleteDialog(true);
  };

  // Open upload dialog
  const handleOpenUploadDialog = () => {
    setCsvFile(null);
    setPassword('');
    setOpenUploadDialog(true);
  };

  // Open verify dialog
  const handleOpenVerifyDialog = (resident) => {
    setSelectedResident(resident);
    setOpenVerifyDialog(true);
  };

  // Open pending requests dialog
  const handleOpenPendingDialog = () => {
    fetchPendingRequests();
    setOpenPendingDialog(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check for duplicates on name changes
    if (name === 'firstName' || name === 'lastName') {
      checkForDuplicates({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle types selection change
  const handleTypesChange = (e) => {
    setFormData({
      ...formData,
      types: e.target.value
    });
  };

  // Enhanced duplicate check function with more flexible matching
  const checkForDuplicates = async (data) => {
    if (!data.firstName || !data.lastName) return;
    
    try {
      // First try an exact match (case insensitive)
      const exactMatches = await fetch(`${API_BASE_URL}/residents/check-duplicate?firstName=${encodeURIComponent(data.firstName)}&lastName=${encodeURIComponent(data.lastName)}&isVerified=true`, {
        method: 'GET',
        credentials: 'include'
      });

      const exactResult = await exactMatches.json();
      
      if (exactResult.success && exactResult.hasDuplicates) {
        console.log("Found exact duplicate matches:", exactResult.duplicates);
        setDuplicateWarning(exactResult.duplicates);
        
        // Set a warning in the snackbar
        setSnackbar({
          open: true,
          message: 'Warning: Exact name matches found in the database!',
          severity: 'warning'
        });
        
        return;
      }
      
      // If no exact match, try a more flexible match (partial name match)
      // This could be implemented with a different endpoint on your backend
      // For now, we'll just check for partial last name matches as an example
      const partialLastName = data.lastName.length > 3 ? data.lastName.substring(0, Math.floor(data.lastName.length * 0.7)) : data.lastName;
      
      const partialMatches = await fetch(`${API_BASE_URL}/residents?name=${encodeURIComponent(partialLastName)}&limit=5&isVerified=true`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const partialResult = await partialMatches.json();
      
      if (partialResult.success && partialResult.data.length > 0) {
        // Filter out any irrelevant results
        const similarNames = partialResult.data.filter(res => 
          res.lastName.toLowerCase().includes(data.lastName.toLowerCase().substring(0, 3)) ||
          data.lastName.toLowerCase().includes(res.lastName.toLowerCase().substring(0, 3)) ||
          res.firstName.toLowerCase().includes(data.firstName.toLowerCase().substring(0, 3)) ||
          data.firstName.toLowerCase().includes(res.firstName.toLowerCase().substring(0, 3))
        );
        
        if (similarNames.length > 0) {
          console.log("Found similar name matches:", similarNames);
          setDuplicateWarning(similarNames);
          
          // Notify about similar matches
          setSnackbar({
            open: true,
            message: 'Warning: Similar name matches found in the database',
            severity: 'info'
          });
          
          return;
        }
      }
      
      // No duplicates found
      setDuplicateWarning(null);
      
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      setDuplicateWarning(null);
    }
  };

  // Create new resident - without password verification
  const handleAddResident = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/residents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident added successfully',
          severity: 'success'
        });
        setOpenAddDialog(false);
        fetchResidents();
        fetchOptions();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      setSnackbar({
        open: true,
        message: 'Error adding resident',
        severity: 'error'
      });
    }
  };

  const handleUpdateResident = async () => {
    if (!password) {
      setSnackbar({
        open: true,
        message: 'Password is required to update resident information',
        severity: 'error'
      });
      return;
    }
  
    try {
      // This is the correct URL and method
      const response = await fetch(`${API_BASE_URL}/residents/${selectedResident._id}`, {
        method: 'PUT', // Using correct method
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          password // Include password
        })
      });
  
      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident updated successfully',
          severity: 'success'
        });
        setOpenEditDialog(false);
        setPassword('');
        fetchResidents();
        fetchOptions();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      setSnackbar({
        open: true,
        message: 'Error updating resident',
        severity: 'error'
      });
    }
  };

  // Delete resident - FIX
  const handleDeleteResident = async () => {
    if (!password) {
      setSnackbar({
        open: true,
        message: 'Password is required to delete a resident',
        severity: 'error'
      });
      return;
    }

    try {
      // This is the correct URL and method
      const response = await fetch(`${API_BASE_URL}/residents/${selectedResident._id}`, {
        method: 'DELETE', // Using correct method
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password }) // Only send the password
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident deleted successfully',
          severity: 'success'
        });
        setOpenDeleteDialog(false);
        setPassword('');
        fetchResidents();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting resident',
        severity: 'error'
      });
    }
  };

  // Handle CSV file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  // Import residents from CSV
  const handleImportResidents = async () => {
    if (!csvFile) {
      setSnackbar({
        open: true,
        message: 'Please select a CSV file to import',
        severity: 'error'
      });
      return;
    }

    if (!password) {
      setSnackbar({
        open: true,
        message: 'Password is required to import residents',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('password', password);

    try {
      setLoading(true); // Add loading state while importing

      const response = await fetch(`${API_BASE_URL}/residents/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      // Handle different response scenarios
      if (data.success) {
        // Success case - some residents were imported
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'success'
        });
        setOpenUploadDialog(false);
        setCsvFile(null);
        setPassword('');
        fetchResidents();
        fetchOptions();
      } else if (data.isDuplicateError) {
        // Special case - all residents were duplicates
        setSnackbar({
          open: true,
          message: data.message,
          severity: 'error' // Use error for clearer notification
        });
        
        // If we have duplicates to show, display them in the duplicates dialog
        if (data.duplicates && data.duplicates.length > 0) {
          setDuplicatesList(data.duplicates);
          setOpenDuplicatesDialog(true);
        }
        
        // Keep the dialog open to allow the user to try a different file
        setCsvFile(null);
      } else {
        // Error case - other types of failures
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error importing residents:', error);
      setSnackbar({
        open: true,
        message: 'Error importing residents: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify resident - FIX
  const handleVerifyResident = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/residents/${selectedResident._id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Add this for cookies
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident verified successfully',
          severity: 'success'
        });
        setOpenVerifyDialog(false);
        fetchResidents();
        fetchPendingRequests();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying resident:', error);
      setSnackbar({
        open: true,
        message: 'Error verifying resident',
        severity: 'error'
      });
    }
  };

  // Reject resident request with reason
  const handleRejectWithReason = async () => {
    try {
      // Make sure there's a rejection reason
      if (!rejectReason.trim()) {
        setSnackbar({
          open: true,
          message: 'Rejection reason is required',
          severity: 'error'
        });
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/residents/${selectedResident._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          rejectReason: rejectReason  // Send the rejection reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Resident request rejected successfully',
          severity: 'success'
        });
        // Clear the state variables
        setRejectReason('');
        fetchPendingRequests();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error rejecting resident request:', error);
      setSnackbar({
        open: true,
        message: 'Error rejecting resident request',
        severity: 'error'
      });
    }
  };

  // Render resident types as chips
  const renderTypes = (types) => {
    if (!types || types.length === 0) return <Typography variant="body2">-</Typography>;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {types.map((type) => (
          <Chip 
            key={type} 
            label={type} 
            size="small" 
            sx={{ 
              backgroundColor: getTypeColor(type),
              color: '#fff'
            }} 
          />
        ))}
      </Box>
    );
  };

  // Get color for resident type
  const getTypeColor = (type) => {
    switch(type) {
      case 'Minor': return '#3f51b5';
      case '18-30': return '#009688';
      case 'Illiterate': return '#ff9800';
      case 'PWD': return '#e91e63';
      case 'Senior Citizen': return '#673ab7';
      case 'Indigent': return '#795548';
      default: return '#9e9e9e';
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
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
        <PeopleAltIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        Resident Database
      </Typography>
      <Box>
        {pendingRequests.length > 0 && (
          <Button
            variant="outlined"
            color="warning"
            onClick={handleOpenPendingDialog}
            startIcon={<WarningIcon />}
            size="small"
            sx={{ 
              mr: 1,
              borderRadius: 1.5,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.85rem'
            }}
          >
            Pending Requests ({pendingRequests.length})
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={handleOpenUploadDialog}
          startIcon={<UploadIcon />}
          size="small"
          sx={{ 
            mr: 1,
            borderRadius: 1.5,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          Import CSV
        </Button>
        <Button
          variant="contained"
          onClick={handleOpenAddDialog}
          startIcon={<AddIcon />}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          Add Resident
        </Button>
      </Box>
    </Box>

    {/* Filters */}
    <Paper 
      sx={{ 
        p: 2, 
        mb: 3, 
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
        <FilterAltIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
        Filter Residents
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search by Name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.2rem', color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2} sx={{minWidth: '100px'}}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="address-select-label">Address</InputLabel>
            <Select
              labelId="address-select-label"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              label="Address"
            >
              <MenuItem value="">
                <em>All Addresses</em>
              </MenuItem>
              {addressOptions.map((address) => (
                <MenuItem key={address} value={address}>
                  {address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2} sx={{minWidth: '100px'}}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="precinct-select-label">Precinct</InputLabel>
            <Select
              labelId="precinct-select-label"
              value={selectedPrecinct}
              onChange={(e) => setSelectedPrecinct(e.target.value)}
              label="Precinct"
            >
              <MenuItem value="">
                <em>All Precincts</em>
              </MenuItem>
              {precinctOptions.map((precinct) => (
                <MenuItem key={precinct} value={precinct}>
                  {precinct}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2} sx={{minWidth: '140px'}}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="types-select-label">Resident Type</InputLabel>
            <Select
              labelId="types-select-label"
              multiple
              value={selectedTypes}
              onChange={(e) => setSelectedTypes(e.target.value)}
              input={<OutlinedInput label="Resident Type" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        height: 20, 
                        '& .MuiChip-label': { p: '0 8px' } 
                      }} 
                    />
                  ))}
                </Box>
              )}
            >
              {residentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={1} sx={{minWidth: '80px'}}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="voter-select-label">Voter</InputLabel>
            <Select
              labelId="voter-select-label"
              value={voterStatus}
              onChange={(e) => setVoterStatus(e.target.value)}
              label="Voter"
            >
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order);
                setPage(0); // Reset to first page when sorting changes
              }}
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon fontSize="small" sx={{ color: 'action.active' }} />
                </InputAdornment>
              }
              sx={{ fontSize: '0.85rem' }}
            >
              <MenuItem value="lastName-asc">Last Name (A-Z)</MenuItem>
              <MenuItem value="lastName-desc">Last Name (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Reset Filters button Grid item */}
        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResetFilters}
            startIcon={<RefreshIcon />}
            size="small"
            sx={{ 
              height: '40px', 
              borderRadius: 1, 
              textTransform: 'none', 
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>

    {/* Residents Table */}
    <Paper 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
        mb: 2
      }}
    >
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
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
                Full Name
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.8rem'
                }}
              >
                Address
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.8rem'
                }}
              >
                Precinct
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.8rem'
                }}
              >
                Contact
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.8rem'
                }}
              >
                Types
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.8rem'
                }}
              >
                Voter
              </TableCell>
              <TableCell 
                align="right"
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={28} sx={{ mb: 1 }} />
                  <Typography variant="body2" display="block" sx={{ color: 'text.secondary' }}>
                    Loading residents...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : residents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PeopleAltIcon sx={{ fontSize: '2rem', color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No residents found matching your filters
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
                <TableRow key={resident._id} hover>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1.5, 
                          bgcolor: resident.isVerified ? 'primary.light' : 'warning.light',
                          fontSize: '0.7rem'
                        }}
                      >
                        {resident.firstName ? resident.firstName.charAt(0) : ''}
                        {resident.lastName ? resident.lastName.charAt(0) : ''}
                      </Avatar>
                      <Box>
                        {resident.firstName === 'Resident' 
                          ? resident.lastName 
                          : `${resident.lastName}, ${resident.firstName} ${resident.middleName || ''}`}
                        {!resident.isVerified && (
                          <Chip 
                            label="Pending" 
                            size="small" 
                            color="warning" 
                            sx={{ 
                              ml: 1, 
                              height: 18, 
                              fontSize: '0.7rem',
                              '& .MuiChip-label': { px: 1 } 
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{resident.address}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{resident.precinctLevel || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{resident.contactNumber || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{renderTypes(resident.types)}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {resident.isVoter ? 
                      <Chip 
                        label="Yes" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.75rem' }} 
                      /> : 
                      <Chip 
                        label="No" 
                        size="small" 
                        color="default" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.75rem' }} 
                      />
                    }
                  </TableCell>
                  <TableCell align="right">
                    {!resident.isVerified ? (
                      <Tooltip title="Verify">
                        <IconButton 
                          color="success" 
                          onClick={() => handleOpenVerifyDialog(resident)}
                          size="small"
                          sx={{ 
                            bgcolor: theme => alpha(theme.palette.success.main, 0.1),
                            '&:hover': {
                              bgcolor: theme => alpha(theme.palette.success.main, 0.2),
                            },
                            p: 0.75
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(resident)}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: theme => alpha(theme.palette.primary.main, 0.2),
                              },
                              p: 0.75
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(resident)}
                            size="small"
                            sx={{ 
                              bgcolor: theme => alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                bgcolor: theme => alpha(theme.palette.error.main, 0.2),
                              },
                              p: 0.75
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ 
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.8rem'
          }
        }}
      />
    </Paper>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        Total Verified Residents: {totalRows}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>

    {/* Add Resident Dialog */}
    <Dialog 
      open={openAddDialog} 
      onClose={() => setOpenAddDialog(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
        fontWeight: 600, 
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
        Add New Resident
      </DialogTitle>
      <Box sx={{ md: 5 }} />
      <DialogContent sx={{ pt: 3 }}>
        {duplicateWarning && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              '.MuiAlert-message': { width: '100%' }
            }}
            icon={<WarningIcon fontSize="inherit" />}
            variant="outlined"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Potential duplicate found
              </Typography>
            </Box>
            <Typography variant="body2">
              {duplicateWarning.map(r => 
                r.firstName === 'Resident' 
                  ? r.lastName
                  : `${r.lastName}, ${r.firstName} ${r.middleName || ''}`
              ).join(', ')}
            </Typography>
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Precinct Level"
              name="precinctLevel"
              value={formData.precinctLevel}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="add-types-label">Resident Types</InputLabel>
              <Select
                labelId="add-types-label"
                multiple
                value={formData.types}
                onChange={handleTypesChange}
                input={<OutlinedInput label="Resident Types" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getTypeColor(value),
                          color: '#fff',
                          fontSize: '0.75rem',
                          height: 24
                        }} 
                      />
                    ))}
                  </Box>
                )}
              >
                {residentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isVoter}
                  onChange={handleCheckboxChange}
                  name="isVoter"
                  size="small"
                  color="primary"
                />
              }
              label={<Typography variant="body2">Registered Voter</Typography>}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => setOpenAddDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleAddResident} 
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Add Resident
        </Button>
      </DialogActions>
    </Dialog>

    {/* Edit Resident Dialog */}
    <Dialog 
      open={openEditDialog} 
      onClose={() => setOpenEditDialog(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
        Edit Resident Information
      </DialogTitle>
      <Box sx={{ md: 5 }} />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Precinct Level"
              name="precinctLevel"
              value={formData.precinctLevel}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="edit-types-label">Resident Types</InputLabel>
              <Select
                labelId="edit-types-label"
                multiple
                value={formData.types}
                onChange={handleTypesChange}
                input={<OutlinedInput label="Resident Types" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getTypeColor(value),
                          color: '#fff',
                          fontSize: '0.75rem',
                          height: 24
                        }} 
                      />
                    ))}
                  </Box>
                )}
              >
                {residentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isVoter}
                  onChange={handleCheckboxChange}
                  name="isVoter"
                  size="small"
                  color="primary"
                />
              }
              label={<Typography variant="body2">Registered Voter</Typography>}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Enter your password to confirm changes"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
              size="small"
              helperText="For security reasons, please enter your password to modify resident information"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => setOpenEditDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpdateResident} 
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          disabled={!password}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Update Resident
        </Button>
      </DialogActions>
    </Dialog>

    {/* Delete Resident Dialog */}
    <Dialog 
      open={openDeleteDialog} 
      onClose={() => setOpenDeleteDialog(false)}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.error.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        color: 'error.main',
        fontSize: '1.1rem'
      }}>
        <DeleteIcon sx={{ mr: 1 }} />
        Delete Resident
      </DialogTitle>
      <Box sx={{ md: 5 }} />
      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>This action cannot be undone</AlertTitle>
          <Typography variant="body2">
            You are about to permanently delete this resident's record from the database.
          </Typography>
        </Alert>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: alpha('#f5f5f5', 0.5), 
          borderRadius: 1, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Resident Information:
          </Typography>
          <Typography variant="body2">
            <strong>Name:</strong> {selectedResident?.lastName}, {selectedResident?.firstName} {selectedResident?.middleName}
          </Typography>
          <Typography variant="body2">
            <strong>Address:</strong> {selectedResident?.address}
          </Typography>
          {selectedResident?.contactNumber && (
            <Typography variant="body2">
              <strong>Contact:</strong> {selectedResident?.contactNumber}
            </Typography>
          )}
        </Box>
        
        <TextField
          fullWidth
          margin="dense"
          label="Enter your password to confirm"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
          error={!password}
          helperText={!password ? "Password is required to delete resident" : ""}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={() => setOpenDeleteDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDeleteResident} 
          color="error" 
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          disabled={!password}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Delete Resident
        </Button>
      </DialogActions>
    </Dialog>

    {/* Upload CSV Dialog */}
    <Dialog 
      open={openUploadDialog} 
      onClose={() => setOpenUploadDialog(false)}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.info.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <UploadIcon sx={{ mr: 1, color: 'info.main' }} />
        Import Residents from CSV
      </DialogTitle>
      <Box sx={{ md: 5 }} />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: alpha('#f5f5f5', 0.5), 
          borderRadius: 1, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ fontSize: '1.1rem', mr: 0.5, color: 'info.main' }} />
            CSV Format Guidelines:
          </Typography>
          
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>Required Columns:</Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Name (format: "Last name, First name Middle name")
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Address
          </Typography>
          
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>Optional Columns:</Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Precinct Level
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Type (comma-separated values)
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Voter (Yes/No)
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Contact Number
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontSize: '0.85rem' }}>
            <FiberManualRecordIcon sx={{ fontSize: '0.6rem', mr: 0.5 }} />
            Email
          </Typography>
        </Box>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          fullWidth
          sx={{ 
            mb: 2, 
            p: 1.5, 
            borderStyle: 'dashed', 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Select CSV File
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        
        {csvFile && (
          <Alert 
            severity="info" 
            variant="outlined"
            icon={<AttachFileIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              Selected file: <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(2)} KB)
            </Typography>
          </Alert>
        )}
        
        <TextField
          fullWidth
          margin="dense"
          label="Enter your password to confirm import"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
          error={!password && csvFile}
          helperText={!password && csvFile ? "Password is required to import residents" : ""}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => setOpenUploadDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleImportResidents} 
          variant="contained"
          size="small"
          startIcon={<CloudUploadIcon />}
          disabled={!csvFile || !password}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Import Residents
        </Button>
      </DialogActions>
    </Dialog>

    {/* Rejection Reason Dialog */}
    <Dialog 
      open={openRejectConfirmDialog} 
      onClose={() => setOpenRejectConfirmDialog(false)}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.error.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <CancelIcon sx={{ mr: 1, color: 'error.main' }} />
        Provide Rejection Reason
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Please provide a reason for rejecting the registration request from:
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: alpha('#f5f5f5', 0.5), 
          borderRadius: 1, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2">
            <strong>Name:</strong> {selectedResident?.firstName} {selectedResident?.lastName}
          </Typography>
          <Typography variant="body2">
            <strong>Address:</strong> {selectedResident?.address}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
          This information will be visible to the resident.
        </Typography>
        
        <TextField
          autoFocus
          margin="dense"
          label="Rejection Reason"
          type="text"
          fullWidth
          required
          multiline
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          error={!rejectReason}
          helperText={!rejectReason ? "Rejection reason is required" : ""}
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => setOpenRejectConfirmDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => {
            if (!rejectReason.trim()) {
              setSnackbar({
                open: true,
                message: 'Please provide a rejection reason',
                severity: 'error'
              });
              return;
            }
            handleRejectWithReason();
            setOpenRejectConfirmDialog(false);
          }} 
          color="error" 
          variant="contained"
          size="small"
          startIcon={<CancelIcon />}
          disabled={!rejectReason.trim()}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Reject Request
        </Button>
      </DialogActions>
    </Dialog>

    {/* Verify Resident Dialog */}
    <Dialog 
      open={openVerifyDialog} 
      onClose={() => setOpenVerifyDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.success.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <VerifiedUserIcon sx={{ mr: 1, color: 'success.main' }} />
        Verify Resident Request
      </DialogTitle>
      <Box sx={{ md: 5 }} />
      <DialogContent sx={{ pt: 3 }}>
        {selectedResident && (
          <>
            {duplicateWarning && duplicateWarning.length > 0 && (
              <Alert 
                severity="warning" 
                variant="outlined"
                sx={{ mb: 3 }}
                icon={<WarningIcon />}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>Potential Duplicate Records Found</AlertTitle>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  The following similar records were found in the database:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {duplicateWarning.map((resident, index) => (
                    <li key={index}>
                      <Typography variant="body2">
                        {resident.lastName}, {resident.firstName} - {resident.address}
                      </Typography>
                    </li>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: 'text.primary' }}>
                  You can still verify this resident if the information is correct and represents a different person.
                </Typography>
              </Alert>
            )}
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 3 
            }}>
              <Box sx={{ 
                bgcolor: alpha('#f5f5f5', 0.5), 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Resident Information
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>First Name:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.firstName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Middle Name:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.middleName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Last Name:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.lastName}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Address:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.address}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Precinct Level:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.precinctLevel || '-'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Contact Number:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.contactNumber || '-'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Email:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedResident.email || '-'}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Resident Types:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedResident.types && selectedResident.types.length > 0 ? (
                        selectedResident.types.map((type) => (
                          <Chip 
                            key={type} 
                            label={type} 
                            size="small" 
                            sx={{ 
                              backgroundColor: getTypeColor(type),
                              color: '#fff',
                              fontSize: '0.75rem',
                              height: 24
                            }} 
                          />
                        ))
                      ) : (
                        <Typography variant="body2">None specified</Typography>
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>Registered Voter:</Typography>
                    <Chip 
                      label={selectedResident.isVoter ? "Yes" : "No"} 
                      size="small" 
                      color={selectedResident.isVoter ? "success" : "default"} 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', height: 24 }} 
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => {
            setOpenVerifyDialog(false);
            setOpenRejectConfirmDialog(true);
          }} 
          color="error"
          startIcon={<CancelIcon />}
          size="small"
          variant="outlined"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Reject
        </Button>
        <Button 
          onClick={() => {
            setOpenVerifyDialog(false);
            setOpenVerifyConfirmDialog(true);
          }} 
          color="success" 
          variant="contained"
          startIcon={<CheckCircleIcon />}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>

    {/* Pending Requests Dialog - Enhanced with more details */}
    <Dialog 
      open={openPendingDialog} 
      onClose={() => setOpenPendingDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.warning.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <PendingIcon sx={{ mr: 1, color: 'warning.main' }} />
        Pending Resident Requests ({pendingRequests.length})
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {pendingRequests.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: '3rem', color: 'success.light', mb: 1, opacity: 0.5 }} />
            <Typography align="center" variant="body1" sx={{ fontWeight: 500 }}>
              No pending requests
            </Typography>
            <Typography align="center" variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              All resident registration requests have been processed
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: '60vh', mt: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Submitted On</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((resident) => (
                  <TableRow key={resident._id} hover>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1, 
                            bgcolor: 'warning.light',
                            fontSize: '0.6rem'
                          }}
                        >
                          {resident.firstName.charAt(0)}{resident.lastName.charAt(0)}
                        </Avatar>
                        {resident.lastName}, {resident.firstName} {resident.middleName && resident.middleName}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{resident.address}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{resident.contactNumber || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {resident.createdAt ? new Date(resident.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="info"
                          onClick={() => {
                            setSelectedResident(resident);
                            setOpenPendingDialog(false);
                            setOpenVerifyDialog(true);
                          }}
                          sx={{ 
                            fontSize: '0.75rem',
                            py: 0.5,
                            minWidth: 0,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                        >
                          View
                        </Button>
                        <Tooltip title="Verify">
                          <IconButton 
                            color="success" 
                            onClick={() => {
                              setSelectedResident(resident);
                              setOpenPendingDialog(false);
                              setOpenVerifyConfirmDialog(true);
                            }}
                            size="small"
                            sx={{ 
                              bgcolor: theme => alpha(theme.palette.success.main, 0.1),
                              '&:hover': {
                                bgcolor: theme => alpha(theme.palette.success.main, 0.2),
                              },
                              p: 0.5
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              setSelectedResident(resident);
                              setOpenPendingDialog(false);
                              setOpenRejectConfirmDialog(true);
                            }}
                            size="small"
                            sx={{ 
                              bgcolor: theme => alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                bgcolor: theme => alpha(theme.palette.error.main, 0.2),
                              },
                              p: 0.5
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => setOpenPendingDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Verify Confirmation Dialog */}
    <Dialog 
      open={openVerifyConfirmDialog} 
      onClose={() => setOpenVerifyConfirmDialog(false)}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme => alpha(theme.palette.success.main, 0.05),
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.1rem'
      }}>
        <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
        Confirm Verification
      </DialogTitle>
      <Box sx={{ md: 5 }} />
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" gutterBottom>
          Are you sure you want to verify and add {selectedResident?.firstName} {selectedResident?.lastName} to the resident database?
        </Typography>
        
        {duplicateWarning && duplicateWarning.length > 0 && (
          <Alert 
            severity="warning" 
            variant="outlined"
            sx={{ mt: 2 }}
            icon={<WarningIcon />}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Warning: Duplicate Records Found!</AlertTitle>
            <Typography variant="body2">
              The following similar records already exist in the database:
            </Typography>
            <Box sx={{ ml: 2, mt: 1 }}>
              {duplicateWarning.map((resident, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {resident.lastName}, {resident.firstName} {resident.middleName || ''}
                  </Typography>
                  <Typography variant="body2" fontSize="0.85rem">
                    Address: {resident.address}
                  </Typography>
                  {resident.contactNumber && (
                    <Typography variant="body2" fontSize="0.85rem">
                      Contact: {resident.contactNumber}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: 'error.main' }}>
              Do you still want to add this resident despite the potential duplicates?
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={() => setOpenVerifyConfirmDialog(false)}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => {
            handleVerifyResident();
            setOpenVerifyConfirmDialog(false);
          }} 
          color="success" 
          variant="contained"
          startIcon={<CheckCircleIcon />}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Yes, Verify Resident
        </Button>
      </DialogActions>
    </Dialog>
      
      <Dialog 
        open={openDuplicatesDialog} 
        onClose={() => setOpenDuplicatesDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme => alpha(theme.palette.warning.main, 0.05),
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.1rem'
        }}>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Duplicate Residents Found ({duplicatesList.length})
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Import Skipped</AlertTitle>
            <Typography variant="body2">
              The following residents already exist in the database and were not imported.
            </Typography>
          </Alert>
          <TableContainer sx={{ maxHeight: '60vh' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {duplicatesList.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {item.existingResident.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {item.existingResident.address}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setOpenDuplicatesDialog(false)}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setOpenDuplicatesDialog(false);
              setOpenUploadDialog(false);
            }}
            variant="contained"
            color="primary"
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            OK, Understand
          </Button>
        </DialogActions>
      </Dialog>

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={5000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
);
}

export default AdminDatabase;