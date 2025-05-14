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
// Add these additional imports to your existing imports:
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { Chip } from '@mui/material';
import API_BASE_URL from '../../config';

function AdminProfile() {
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
      const token = getToken();
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Include cookies in the request
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
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
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      console.log('Password update response:', data);
      
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
  <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Profile Management
      </Typography>
      <Box sx={{ mb: 4 }} />
      
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Avatar 
            sx={{ 
              width: { xs: 100, sm: 120 }, 
              height: { xs: 100, sm: 120 }, 
              bgcolor: 'primary.main',
              fontSize: { xs: '2rem', sm: '2.5rem' },
              fontWeight: 600,
              border: '4px solid',
              borderColor: 'primary.light'
            }}
          >
            {profile.firstName && profile.lastName ? 
              `${profile.firstName[0]}${profile.lastName[0]}` : 
              profile.firstName ? profile.firstName[0] : '?'
            }
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile.firstName && profile.lastName ? 
                `${profile.firstName} ${profile.lastName}` : 
                'Loading...'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {profile.userType && (
                <span style={{ textTransform: 'capitalize' }}>{profile.userType}</span>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your account information and security settings
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {loading && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading profile data...
          </Typography>
        </Paper>
      )}
      
      {!loading && (
        <>
          {/* Personal Information Section */}
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <PersonIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600, flex: 1 }}
              >
                Personal Information
              </Typography>
              {!editingProfile && (
                <Button 
                  startIcon={<EditIcon fontSize="small" />} 
                  onClick={() => setEditingProfile(true)}
                  variant="outlined"
                  size="small"
                  color="primary"
                >
                  Edit
                </Button>
              )}
            </Box>
            
            {!editingProfile ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      First Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {profile.firstName || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Middle Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {profile.middleName || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Last Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {profile.lastName || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {profile.email || '—'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Account Type
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={profile.userType || 'User'} 
                        color="primary" 
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Middle Name"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleProfileChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button 
                        onClick={handleCancelEdit}
                        variant="outlined"
                        color="inherit"
                        size="small"
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        size="small"
                        startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
          {/* Password Section */}
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <LockIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600, flex: 1 }}
              >
                Password & Security
              </Typography>
              {!changingPassword && (
                <Button 
                  onClick={() => setChangingPassword(true)}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<EditIcon fontSize="small" />}
                >
                  Change Password
                </Button>
              )}
            </Box>
            
            {!changingPassword ? (
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  Current Password
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}>
                    ••••••••••••••••
                  </Typography>
                  <Chip 
                    label="Secured" 
                    color="success" 
                    size="small" 
                    icon={<SecurityIcon fontSize="small" />}
                  />
                </Box>
              </Box>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Choose a strong password that you haven't used before. Your password should be at least 8 characters long and include a mix of letters, numbers, and special characters.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
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
                      size="small"
                      error={snackbar.open && snackbar.message === 'Current password is incorrect'}
                      helperText={snackbar.open && snackbar.message === 'Current password is incorrect' ? 'The password you entered is incorrect' : 'Enter your current password to proceed'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              edge="end"
                              size="small"
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
                      size="small"
                      helperText="Must be at least 8 characters long"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              edge="end"
                              size="small"
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
                      size="small"
                      error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                      helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : 'Re-enter your new password'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              edge="end"
                              size="small"
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
                        size="small"
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
                        size="small"
                        startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
          {/* Account Information Section */}
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <InfoIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600 }}
              >
                Account Information
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Status
                    </Typography>
                  </Box>
                  <Chip 
                    label="Active" 
                    color="success" 
                    size="small"
                    icon={<CheckCircleIcon fontSize="small" />}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AdminPanelSettingsIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Access Level
                    </Typography>
                  </Box>
                  <Chip 
                    label={profile.userType ? `${profile.userType.charAt(0).toUpperCase()}${profile.userType.slice(1)} Access` : 'User Access'} 
                    color="primary" 
                    size="small"
                    icon={<SecurityIcon fontSize="small" />}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Security Tips */}
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <SecurityIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600 }}
              >
                Security Tips
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Keep Your Account Secure
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    <Typography component="li" variant="body2">
                      Change your password regularly
                    </Typography>
                    <Typography component="li" variant="body2">
                      Use a strong, unique password
                    </Typography>
                    <Typography component="li" variant="body2">
                      Don't share your login credentials
                    </Typography>
                    <Typography component="li" variant="body2">
                      Log out when using shared computers
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
      
      {/* Feedback Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  </Container>
);
}

export default AdminProfile;