import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Divider,
  useMediaQuery,
  InputAdornment,
  useTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CampaignIcon from '@mui/icons-material/Campaign';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import ReportIcon from '@mui/icons-material/Report';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import API_BASE_URL from '../config';
import bhubLogo from '../assets/bhub-logo.png';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // New state variables for validation and dialogs
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const MuiLink = Link;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    
    // Validate form
    let isValid = true;
    
    // First name validation
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    }
    
    // Last name validation
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    }
    
    // Email validation
    if (!email) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setPasswordError('Password must contain both letters and numbers');
      isValid = false;
    }
    
    // If validation passes, submit the form
    if (isValid) {
      setIsLoading(true); // Show loading state immediately
      
      // Create a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 8000); // 8 seconds timeout
      });
      
      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName, middleName, lastName, email, password, userType: "resident" }),
        });
        
        const data = await response.json();
        
        setIsLoading(false);
        
        if (data.success) {
          setShowSuccessSnackbar(true);
          setTimeout(() => {
            navigate('/signin');
          }, 1500);
        } else {
          // Handle the error from the server
          setErrorMessage(data.message || "Unable to create account. Please try again later.");
          setShowErrorDialog(true);
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Error creating account:', error);
        setErrorMessage('A network error occurred. Please check your connection and try again.');
        setShowErrorDialog(true);
      }
    }
  };

  return (
  <Box
    sx={{
      // minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      bgcolor: '#f7f7f7',
    }}
  >
    {/* Top decorative wave - visible on all devices */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: { xs: '160px', md: '220px' },
        zIndex: 0,
        background: 'linear-gradient(160deg, #0a8a0d 0%, #26a69a 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 100%)',
      }}
    />
    
    {/* Logo and nav bar - visible on all devices */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            bgcolor: 'white',
            p: 1,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <img 
            src={bhubLogo} 
            alt="B-Hub Logo" 
            style={{ height: '30px' }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            ml: 2,
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Barangay Maahas
        </Typography>
      </Box>
      
      <Button
        onClick={() => navigate('/')}
        variant="outlined"
        size="small"
        startIcon={<ArrowBackIcon />}
        sx={{
          color: 'white',
          borderColor: 'rgba(255,255,255,0.5)',
          textTransform: 'none',
          '&:hover': {
            borderColor: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
          },
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        }}
      >
        Back to Home
      </Button>
    </Box>
    {/* Main Content */}
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        py: { xs: 3, sm: 5 },
        px: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        zIndex: 1,
        gap: 4,
      }}
    >
        
      {/* Signup form - SHOWN ON ALL DEVICES */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: '100%', md: '60%' },
          maxWidth: { xs: '100%', md: '600px' },  // Full width on mobile
          borderRadius: '16px',
          p: { xs: 3, sm: 4 },
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          mx: 'auto', // Center on mobile
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(90deg, #0a8a0d, #26a69a)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
          }}
        >
          Create Your Account
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Register as a resident of Barangay Maahas to access digital services
        </Typography>
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          {/* Name fields row */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              required
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (firstNameError) setFirstNameError('');
              }}
              error={!!firstNameError}
              helperText={firstNameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon 
                      sx={{ color: firstNameError ? 'error.main' : 'rgba(0, 0, 0, 0.54)' }} 
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f5f7fa',
                  pl: 1,
                  '&:hover': {
                    backgroundColor: '#e9ecef',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                  },
                  '&.Mui-error': {
                    boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.2)',
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: firstNameError ? 'error.main' : '#0a8a0d',
                },
                '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'error.main',
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: firstNameError ? 'error.main' : '#0a8a0d',
                },
                '& .MuiFormHelperText-root': {
                  marginLeft: 1,
                  marginTop: 0.5,
                }
              }}
            />
            <TextField
              fullWidth
              label="Middle Name (Optional)"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f5f7fa',
                  pl: 1,
                  '&:hover': {
                    backgroundColor: '#e9ecef',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a8a0d',
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#0a8a0d',
                },
              }}
            />
          </Box>
          
          <TextField
            required
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (lastNameError) setLastNameError('');
            }}
            error={!!lastNameError}
            helperText={lastNameError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon 
                    sx={{ color: lastNameError ? 'error.main' : 'rgba(0, 0, 0, 0.54)' }} 
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: lastNameError ? 1 : 2,
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                backgroundColor: '#f5f7fa',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                },
                '&.Mui-error': {
                  boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.2)',
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: lastNameError ? 'error.main' : '#0a8a0d',
              },
              '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: lastNameError ? 'error.main' : '#0a8a0d',
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 1,
                marginTop: 0.5,
              }
            }}
          />
          <TextField
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            error={!!emailError}
            helperText={emailError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon 
                    sx={{ color: emailError ? 'error.main' : 'rgba(0, 0, 0, 0.54)' }} 
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: emailError ? 1 : 2,
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                backgroundColor: '#f5f7fa',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                },
                '&.Mui-error': {
                  boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.2)',
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: emailError ? 'error.main' : '#0a8a0d',
              },
              '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: emailError ? 'error.main' : '#0a8a0d',
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 1,
                marginTop: 0.5,
              }
            }}
          />
          
          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon 
                    sx={{ color: passwordError ? 'error.main' : 'rgba(0, 0, 0, 0.54)' }} 
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: passwordError ? 1 : 3,
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                backgroundColor: '#f5f7fa',
                pl: 1,
                '&:hover': {
                  backgroundColor: '#e9ecef',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 2px rgba(10, 138, 13, 0.2)',
                },
                '&.Mui-error': {
                  boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.2)',
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: passwordError ? 'error.main' : '#0a8a0d',
              },
              '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: passwordError ? 'error.main' : '#0a8a0d',
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 1,
                marginTop: 0.5,
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
              position: 'relative',
              background: isLoading ? 'rgba(10, 138, 13, 0.7)' : 'linear-gradient(90deg, #0a8a0d, #26a69a)',
              boxShadow: '0 4px 15px rgba(10, 138, 13, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(10, 138, 13, 0.4)',
                transform: isLoading ? 'none' : 'translateY(-2px)',
                background: isLoading ? 'rgba(10, 138, 13, 0.7)' : 'linear-gradient(90deg, #0a8a0d, #26a69a)',
                filter: isLoading ? 'none' : 'brightness(1.05)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress 
                  size={24} 
                  color="inherit" 
                  sx={{ 
                    position: 'absolute',
                    left: 'calc(50% - 12px)',
                    color: 'white'
                  }} 
                />
                <span style={{ visibility: 'hidden' }}>Create Account</span>
              </>
            ) : (
              'Create Account'
            )}
          </Button>
          
          {/* Optional social login section - can be hidden on smallest screens if desired */}
          <Box sx={{ display: { xs: 'block', sm: 'block' } }}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                or
              </Typography>
            </Divider>
            
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                to="/signin"
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: '#0a8a0d',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Log in
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>

    {/* Footer with wave shape - HIDDEN ON MOBILE */}
    <Box
      sx={{
        position: 'relative',
        height: '80px',
        overflow: 'hidden',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '150px',
          background: 'linear-gradient(160deg, #0a8a0d 0%, #26a69a 100%)',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 35%, 0 70%)',
        }}
      />
    </Box>
    {/* Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        aria-labelledby="registration-error-dialog"
        TransitionProps={{ timeout: 50 }} // Minimal transition time
        PaperProps={{
          sx: {
            borderRadius: '8px',
            maxWidth: '450px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle 
          id="registration-error-dialog"
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: '#424242',
            fontWeight: 600
          }}
        >
          <ErrorOutlineIcon sx={{ color: '#d32f2f' }} />
          Registration Error
        </DialogTitle>
        <Box sx={{md:5}} />
        <DialogContent sx={{ py: 3, px: 3 }}>
          <DialogContentText 
            sx={{ 
              color: '#212121',
              fontSize: '0.95rem'
            }}
          >
            {errorMessage}
          </DialogContentText>
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: '4px',
            borderLeft: '3px solid #0a8a0d'
          }}>
            <Typography variant="body2" color="text.secondary">
              If you continue to experience issues, please contact the Barangay Maahas administrative office for assistance.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: '1px solid #e0e0e0',
        }}>
          <Button 
            onClick={() => setShowErrorDialog(false)} 
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#0a8a0d',
              color: 'white',
              textTransform: 'none',
              borderRadius: '4px',
              px: 3,
              '&:hover': {
                bgcolor: '#097a0c',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionProps={{ appear: false, timeout: 100 }}
      >
        <Alert 
          onClose={() => setShowSuccessSnackbar(false)} 
          severity="success"
          variant="filled"
          sx={{ 
            width: '100%',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Account created successfully! Redirecting to login page...
          </Typography>
        </Alert>
      </Snackbar>

  </Box>
);
}

export default SignUp;
