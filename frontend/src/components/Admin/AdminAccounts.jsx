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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { alpha } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import API_BASE_URL from '../../../config';

function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserType, setNewUserType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('lastName');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch all users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users.length) {
      setFilteredUsers([]);
      return;
    }
    
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        (user.middleName && user.middleName.toLowerCase().includes(searchLower)) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply user type filter
    if (selectedUserType) {
      result = result.filter(user => user.userType === selectedUserType);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField] ? a[sortField].toLowerCase() : '';
      let valueB = b[sortField] ? b[sortField].toLowerCase() : '';
      
      if (sortOrder === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, selectedUserType, sortField, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setIsSuperAdmin(data.isSuper);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewUserType(user.userType);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateUserType = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/updateType`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          userId: selectedUser._id,
          userType: newUserType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the user in the local state
        setUsers(users.map(user => 
          user._id === selectedUser._id ? { ...user, userType: newUserType } : user
        ));
        
        setSnackbar({
          open: true,
          message: 'User type updated successfully',
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to update user type');
      }
    } catch (err) {
      console.error('Error updating user type:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update user type',
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }} 
          onClick={fetchUsers}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
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
        <AdminPanelSettingsIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        User Accounts
      </Typography>
      <Button
        variant="outlined"
        onClick={fetchUsers}
        startIcon={<RefreshIcon />}
        size="small"
        sx={{ 
          borderRadius: 1.5,
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.85rem'
        }}
      >
        Refresh List
      </Button>
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
        Filter Users
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search by Name or Email"
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
        <Grid item xs={12} sm={6} md={3} sx={{minWidth: '120px'}}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="user-type-select-label">User Type</InputLabel>
            <Select
              labelId="user-type-select-label"
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              label="User Type"
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              <MenuItem value="resident">Resident</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Superadmin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order);
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
        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setSelectedUserType('');
              setSortField('lastName');
              setSortOrder('asc');
            }}
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

    {/* Users Table */}
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
                Email
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.8rem'
                }}
              >
                User Type
              </TableCell>
              {isSuperAdmin && (
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
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 4 : 3} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={28} sx={{ mb: 1 }} />
                  <Typography variant="body2" display="block" sx={{ color: 'text.secondary' }}>
                    Loading accounts...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 4 : 3} align="center" sx={{ py: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: '2rem', color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No user accounts found matching your search criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1.5, 
                          bgcolor: user.userType === 'superadmin' ? 'warning.light' : user.userType === 'admin' ? 'primary.light' : 'success.light',
                          fontSize: '0.7rem'
                        }}
                      >
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        {`${user.lastName}, ${user.firstName} ${user.middleName || ''}`}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{user.email}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Chip 
                      label={user.userType} 
                      size="small" 
                      color={
                        user.userType === 'superadmin' ? 'warning' : 
                        user.userType === 'admin' ? 'primary' : 
                        'success'
                      }
                      variant="outlined"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.75rem',
                        textTransform: 'capitalize' 
                      }} 
                    />
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell align="right">
                      <Tooltip title="Edit User Type">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditClick(user)}
                          size="small"
                          sx={{ 
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
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        {filteredUsers.length} of {users.length} Users Shown
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
        Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>

    {/* Edit User Type Dialog */}
    <Dialog 
      open={openDialog} 
      onClose={handleCloseDialog}
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
        Edit User Access Level
      </DialogTitle>
      <Box sx={{md: 5}} />
      <DialogContent sx={{ pt: 3 }}>
        {selectedUser && (
          <Box>
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha('#f5f5f5', 0.5), 
              borderRadius: 1, 
              mb: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                User Information:
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {selectedUser.lastName}, {selectedUser.firstName} {selectedUser.middleName || ''}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Current Access Level:</strong> 
                <Chip 
                  label={selectedUser.userType} 
                  size="small" 
                  color={
                    selectedUser.userType === 'superadmin' ? 'warning' : 
                    selectedUser.userType === 'admin' ? 'primary' : 
                    'success'
                  }
                  variant="outlined"
                  sx={{ 
                    ml: 1,
                    height: 20, 
                    fontSize: '0.75rem',
                    textTransform: 'capitalize' 
                  }} 
                />
              </Typography>
            </Box>
            
            <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
              <InputLabel id="new-user-type-label">New Access Level</InputLabel>
              <Select
                labelId="new-user-type-label"
                value={newUserType}
                label="New Access Level"
                onChange={(e) => setNewUserType(e.target.value)}
              >
                <MenuItem value="resident">Resident</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superadmin">Superadmin</MenuItem>
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 3, fontSize: '0.85rem' }} variant="outlined">
              <strong>Access level permissions:</strong>
              <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                <li><strong>Resident:</strong> Basic access to resident portal</li>
                <li><strong>Admin:</strong> Manage residents database</li>
                <li><strong>Superadmin:</strong> Full system access, manage users</li>
              </Box>
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={handleCloseDialog}
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
          onClick={handleUpdateUserType} 
          variant="contained" 
          disabled={!selectedUser || selectedUser.userType === newUserType}
          size="small"
          startIcon={<SaveIcon />}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Update Access
        </Button>
      </DialogActions>
    </Dialog>
    {/* Success/Error Snackbar */}
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

export default AdminAccounts;