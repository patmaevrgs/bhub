import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  FormControlLabel,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';

// Resident type options - keeping original values
const residentTypes = ['Minor', '18-30', 'Illiterate', 'PWD', 'Senior Citizen', 'Indigent'];

function ResidentRegistration() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State variables - keeping only the original fields
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
  
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [successDialog, setSuccessDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

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

  const checkForDuplicates = async (data) => {
    if (!data.firstName || !data.lastName) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/residents/check-duplicate?firstName=${encodeURIComponent(data.firstName)}&lastName=${encodeURIComponent(data.lastName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Add this for cookies
      });
  
      const result = await response.json();
      
      if (result.success && result.hasDuplicates) {
        setDuplicateWarning(result.duplicates);
      } else {
        setDuplicateWarning(null);
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.address) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/residents/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // This is important for sending cookies
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
      
      if (data.success) {
        setSuccessDialog(true);
        // Reset form
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
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting registration request',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/'); // Changed from '/' to '/resident/home'
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 500,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              transform: 'translateX(-3px)'
            }
          }}
        >
          Back to Home
        </Button>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, // Less padding on mobile
          mb: 4, 
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.6)})`,
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            mb: 1,
            textAlign: { xs: 'center', sm: 'left' }, // Center text on mobile
            fontSize: { xs: '1.75rem', sm: '2.125rem' } // Smaller font on mobile
          }}
        >
          Barangay Maahas Resident Registration
        </Typography>
        
        <Typography 
          variant="body1" 
          paragraph 
          sx={{ 
            mb: 4,
            color: alpha(theme.palette.text.primary, 0.8),
            textAlign: { xs: 'center', sm: 'left' } // Center text on mobile
          }}
        >
          Register your information in the Barangay Maahas resident database to ensure fast access to services 
          and stay updated on future community benefits and programs.
        </Typography>
        
        <Box 
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            alignItems: { xs: 'center', sm: 'center' }, // Center on mobile
            flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
            textAlign: { xs: 'center', sm: 'left' } // Center text on mobile
          }}
        >
          <PersonIcon 
            sx={{
              mr: { xs: 0, sm: 2 },
              mb: { xs: 1, sm: 0 },
              color: theme.palette.primary.main,
              fontSize: 28
            }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Why Register?</Typography>
            <Typography variant="body2">
              Registration ensures you're included in the official barangay database for government assistance programs,
              aid distribution, and essential community services.
            </Typography>
          </Box>
        </Box>

        {duplicateWarning && (
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ 
              mb: 3,
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '& .MuiAlert-icon': {
                color: theme.palette.warning.main
              },
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>Possible Duplicate Found</Typography>
            <Typography variant="body2">
              You may already be registered in our database. Please check with the barangay office if you're unsure.
            </Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography 
            variant="h6" 
            sx={{ 
              pb: 2, 
              mb: 3, 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              color: theme.palette.text.primary,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', sm: 'flex-start' }, // Center on mobile
              textAlign: { xs: 'center', sm: 'left' } // Center text on mobile
            }}
          >
            <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
            Personal Information
          </Typography>
          
          <Grid 
            container 
            spacing={isMobile ? 2 : 3}
            justifyContent={{ xs: 'center', sm: 'flex-start' }} // Center grid on mobile
          >
            {/* Name fields */}
            <Grid item xs={12} sm={4} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            {/* Address field */}
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="Complete Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  placeholder="House #, Street, Barangay Maahas, Los Baños, Laguna"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            {/* Precinct and Contact fields - ensure they're evenly spaced */}
            <Grid item xs={12} md={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="Precinct Level (if known)"
                  name="precinctLevel"
                  value={formData.precinctLevel}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            {/* Email field */}
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: alpha(theme.palette.text.primary, 0.7) }
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            {/* Categories dropdown - FIXED THE INPUT BOX WIDTH */}
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, width: '100%' }}>
                <FormControl 
                  fullWidth
                  variant="outlined"
                  sx={{
                    width: '100%',
                  }}
                >
                  <InputLabel id="types-select-label">
                    Resident Categories
                  </InputLabel>
                  <Select
                    labelId="types-select-label"
                    multiple
                    value={formData.types}
                    onChange={handleTypesChange}
                    input={
                      <OutlinedInput 
                        label="Resident Categories"
                        // Extra width for the input to show more of the label
                        sx={{
                          '& .MuiSelect-select': {
                            minWidth: '140px', // Make the dropdown box wider
                            paddingRight: '32px' // Ensure space for the dropdown arrow
                          }
                        }}
                      />
                    }
                    MenuProps={{
                      // Make the dropdown menu wider
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          width: 250 // Make the menu wider
                        }
                      }
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              borderRadius: '16px'
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
              </Box>
            </Grid>
            
            {/* Voter checkbox */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isVoter}
                      onChange={handleCheckboxChange}
                      name="isVoter"
                      color="primary"
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label="I am a registered voter in Barangay Maahas"
                />
              </Box>
            </Grid>
            
            {/* Action buttons */}
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', // Always center buttons
                flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
                gap: { xs: 2, sm: 2 }, 
                mt: 2 
              }}>
                <Button
                  variant="outlined"
                  onClick={handleBackClick}
                  fullWidth={isMobile} // Full width on mobile
                  sx={{ 
                    py: 1.2,
                    px: 3,
                    borderRadius: 2,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    }
                  }}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth={isMobile} // Full width on mobile
                  startIcon={loading ? null : <CheckCircleIcon />}
                  sx={{ 
                    py: 1.2,
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1rem',
                    width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                    backgroundColor: theme.palette.primary.main,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.25)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            width: isMobile ? '90%' : 'auto' // Responsive width
          }
        }}
      >
        <Box sx={{ 
          bgcolor: theme.palette.success.main, 
          color: 'white',
          p: 3,
          textAlign: 'center',
          position: 'relative'
        }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CheckCircleIcon 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.success.main 
              }} 
            />
          </Box>
          <Typography variant="h5" fontWeight={600}>Registration Successful</Typography>
        </Box>
        
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText color="textPrimary">
            Your registration request has been submitted to the Barangay Maahas administration.
            Your information will be reviewed and verified by a barangay staff member.
            You will be able to access all services once your registration is approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button 
            onClick={() => setSuccessDialog(false)} 
            variant="contained"
            fullWidth={isMobile} // Full width on mobile
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              borderRadius: 2,
              px: 3
            }}
          >
            OK
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
          variant="filled"
          sx={{ 
            width: isMobile ? '90%' : 'auto', // Responsive width
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: 1
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ResidentRegistration;