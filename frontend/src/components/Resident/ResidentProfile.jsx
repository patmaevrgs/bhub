import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Edit } from '@mui/icons-material';
import Cookies from 'universal-cookie'; // Import Cookies
import API_BASE_URL from '../../config';

function ResidentProfile() {
  // State for user profile
  const [profile, setProfile] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    userType: ''
  });

  // State for form modes (view/edit)
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: ''
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const getToken = () => {
    // Get token from different sources
    const cookies = new Cookies();
    const cookieToken = cookies.get('authToken');
    const localToken = localStorage.getItem('token');
    
    // Return cookie token first (if exists), then localStorage token, or empty string
    return cookieToken || localToken || '';
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Get token from localStorage if available
      const token = localStorage.getItem('token');
      
      // Try one more option - maybe it was stored with a different key
      const altToken = localStorage.getItem('authToken');
      
      // Use whichever token is available
      const authToken = token || altToken || '';
      
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        credentials: 'include' // Include cookies for desktop browsers
      });
      
      if (!response.ok) {
        console.error('Response not OK:', response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Profile data received:', data); // For debugging
      
      if (data.success) {
        setProfile(data.user);
        setFormData({
          firstName: data.user.firstName,
          middleName: data.user.middleName || '',
          lastName: data.user.lastName,
          email: data.user.email
        });
      } else {
        showSnackbar(data.message || 'Failed to load profile data', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset error messages when typing in the current password field
    if (name === 'currentPassword' && snackbar.message === 'Current password is incorrect') {
      closeSnackbar();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    if (field === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else if (field === 'confirm') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set up headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/profile/update`, {
      method: 'PUT',
      headers: headers,
      credentials: 'include', // Include cookies
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      setProfile(data.user);
      setEditingProfile(false);
      // Update local storage with new values
      localStorage.setItem('firstName', data.user.firstName);
      localStorage.setItem('lastName', data.user.lastName);
      localStorage.setItem('email', data.user.email);
      showSnackbar('Profile updated successfully', 'success');
    } else {
      showSnackbar(data.message || 'Failed to update profile', 'error');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showSnackbar('Error connecting to server', 'error');
  } finally {
    setLoading(false);
  }
};

  // Handle password update submission
  const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  
  // Validate passwords match
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    showSnackbar('New passwords do not match', 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set up headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/profile/password`, {
      method: 'PUT',
      headers: headers,
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showSnackbar('Password updated successfully', 'success');
    } else {
      // Check for specific error messages from the server
      if (data.message && (
          data.message.includes('incorrect') || 
          data.message.includes('Current password is incorrect')
      )) {
        showSnackbar('Current password is incorrect', 'error');
      } else {
        showSnackbar(data.message || 'Failed to update password', 'error');
      }
    }
  } catch (error) {
    console.error('Error updating password:', error);
    showSnackbar('Error connecting to server', 'error');
  } finally {
    setLoading(false);
  }
};

  // Handle snackbar display
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle snackbar close
  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProfile(false);
    setFormData({
      firstName: profile.firstName,
      middleName: profile.middleName || '',
      lastName: profile.lastName,
      email: profile.email
    });
  };

  // Cancel password change
  const handleCancelPasswordChange = () => {
    setChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {profile.firstName && profile.firstName[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              User Profile
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your account information
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
            {/* Personal Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Personal Information
                </Typography>
                {!editingProfile && (
                  <Button 
                    startIcon={<Edit />} 
                    onClick={() => setEditingProfile(true)}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                )}
              </Box>

              {!editingProfile ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                    <Typography variant="body1">{profile.firstName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">Middle Name</Typography>
                    <Typography variant="body1">{profile.middleName || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                    <Typography variant="body1">{profile.lastName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{profile.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">User Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {profile.userType}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Middle Name"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleProfileChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          onClick={handleCancelEdit}
                          variant="outlined"
                          color="inherit"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Box>
            
            <Divider sx={{ mb: 4 }} />
            
            {/* Password Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Password
                </Typography>
                {!changingPassword && (
                  <Button 
                    onClick={() => setChangingPassword(true)}
                    variant="outlined"
                    color="primary"
                  >
                    Change Password
                  </Button>
                )}
              </Box>
              
              {!changingPassword ? (
                <Typography variant="body2" color="text.secondary">
                  ••••••••••••
                </Typography>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        variant="outlined"
                        error={snackbar.open && snackbar.message === 'Current password is incorrect'}
                        helperText={snackbar.open && snackbar.message === 'Current password is incorrect' ? 'The password you entered is incorrect' : ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('new')}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        variant="outlined"
                        error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                        helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('confirm')}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          onClick={handleCancelPasswordChange}
                          variant="outlined"
                          color="inherit"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          Update Password
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Box>
          </>
        )}
      </Paper>
      
      {/* Feedback Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ResidentProfile;