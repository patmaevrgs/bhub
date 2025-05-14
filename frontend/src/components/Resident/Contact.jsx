import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  TextField,
  Divider,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Facebook as FacebookIcon,
  Send as SendIcon,
  ContactMail as ContactMailIcon,
  ContactPhone as ContactPhoneIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';

function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitStatus('loading');
      
      try {
        const response = await fetch('http://localhost:3002/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmitStatus('success');
          setSnackbarOpen(true);
          
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          });
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setSubmitStatus('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
  <Container maxWidth="lg" sx={{ py: 3 }}>
    {/* Refined Header - Smaller Text */}
    <Box sx={{ mb: 4, position: 'relative' }}>
      {/* Decorative background shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -15,
          left: -15,
          width: 60,
          height: 60,
          bgcolor: alpha(theme.palette.secondary.main, 0.08),
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ContactPhoneIcon 
            sx={{ 
              fontSize: 28,
              color: 'primary.main',
              mr: 1.5,
            }} 
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '1.2rem', sm: '1.2rem', md: '1.23rem' }
            }}
          >
            Contact Barangay Maahas
          </Typography>
        </Box>
        <Typography
          variant="body1" // Changed from body1
          sx={{
            color: 'text.secondary',
            maxWidth: '600px',
            lineHeight: 1.6,
            fontSize: '0.9rem' // Added specific smaller size
          }}
        >
          We're here to serve you. Get in touch with us through any of our contact channels below.
        </Typography>
      </Box>
    </Box>

    {/* Creative Contact Methods - Smaller Text */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4} sx={{minWidth: {sx: '100%', sm: '100%', md: 'auto'}}}>
        <Paper 
          sx={{ 
            p: 3,
            height: '100%',
            borderRadius: 3,
            border: '2px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              '& .contact-icon': {
                transform: 'rotate(360deg) scale(1.1)',
                color: 'primary.main'
              }
            }
          }}
        >
          {/* Decorative corner */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderBottomLeftRadius: '50%'
            }}
          />
          
          <Avatar
            className="contact-icon"
            sx={{
              width: 48,
              height: 48,
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              transition: 'all 0.3s ease'
            }}
          >
            <PhoneIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}> {/* Changed from h5 */}
            Call Us
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Speak directly with our staff during office hours
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography 
              component="a"
              href="tel:+63495360000"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              (049) 536-XXXX
            </Typography>
            <Typography 
              component="a"
              href="tel:+639000000000"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              +63 9XX XXX XXXX
            </Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4} sx={{minWidth: {sx: '100%', sm: '100%', md: 'auto'}}}>
        <Paper 
          sx={{ 
            p: 3,
            height: '100%',
            borderRadius: 3,
            border: '2px solid',
            borderColor: alpha(theme.palette.info.main, 0.1),
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'info.main',
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              '& .contact-icon': {
                transform: 'rotate(360deg) scale(1.1)',
                color: 'info.main'
              }
            }
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderBottomLeftRadius: '50%'
            }}
          />
          
          <Avatar
            className="contact-icon"
            sx={{
              width: 48,
              height: 48,
              mb: 2,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: 'info.main',
              transition: 'all 0.3s ease'
            }}
          >
            <EmailIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}> {/* Changed from h5 */}
            Email Us
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send us your inquiries and we'll respond promptly
          </Typography>
          <Typography 
            component="a"
            href="mailto:brgy.maahas2@gmail.com"
            variant="body2"
            sx={{
              color: 'info.main',
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            brgy.maahas2@gmail.com
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4} sx={{minWidth: {sx: '100%', sm: '100%', md: '360px'}}}>
        <Paper 
          sx={{ 
            p: 3,
            height: '100%',
            borderRadius: 3,
            border: '2px solid',
            borderColor: alpha(theme.palette.success.main, 0.1),
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'success.main',
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              '& .contact-icon': {
                transform: 'rotate(360deg) scale(1.1)',
                color: 'success.main'
              }
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 60,
              height: 60,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderBottomLeftRadius: '50%'
            }}
          />
          
          <Avatar
            className="contact-icon"
            sx={{
              width: 48,
              height: 48,
              mb: 2,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: 'success.main',
              transition: 'all 0.3s ease'
            }}
          >
            <LocationOnIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}> {/* Changed from h5 */}
            Visit Us
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drop by our office, it is open from Mon-Sun 8-5 PM
          </Typography>
          <Typography 
            variant="body2"
            sx={{
              color: 'success.main',
              fontWeight: 500,
              lineHeight: 1.4
            }}
          >
            Barangay Maahas Hall<br />
            Los Baños, Laguna
          </Typography>
        </Paper>
      </Grid>
    </Grid>

    {/* Main Content - Form Section Header */}
    <Grid container spacing={4}>
      {/* Contact Form */}
      <Grid item xs={12} lg={7}>
        <Paper 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" // Changed from h4
              component="h2" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.1rem' // Added specific size
              }}
            >
              <ContactMailIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} /> {/* Reduced icon size */}
              Send Us a Message
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}> {/* Added specific size */}
              Fill out the form below and we'll get back to you within 1-2 business days.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Form fields remain the same */}
              <Grid item xs={12} sm={4} sx={{minWidth: '100%'}}>
                <TextField 
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth 
                  required
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{minWidth: '100%'}}>
                <TextField 
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth 
                  required
                  variant="outlined"
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{minWidth: '100%'}}>
                <TextField 
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth 
                  variant="outlined"
                  placeholder="Optional"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{minWidth: '100%'}}>
                <TextField 
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  fullWidth 
                  required
                  variant="outlined"
                  error={!!errors.subject}
                  helperText={errors.subject}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{minWidth: '100%'}}>
                <TextField 
                  label="Your Message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  fullWidth 
                  required
                  variant="outlined"
                  multiline
                  rows={5}
                  error={!!errors.message}
                  helperText={errors.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} >
                <Button
                  type="submit"
                  variant="contained"
                  size="medium" // Changed from large
                  disabled={submitStatus === 'loading'}
                  startIcon={submitStatus === 'loading' ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{
                    py: 1.25, // Reduced padding
                    px: 2.5,  // Reduced padding
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem', // Added specific size
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {submitStatus === 'loading' ? 'Sending Message...' : 'Send Message'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>

    </Grid>

    {/* Snackbar */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleCloseSnackbar} 
        severity={submitStatus === 'success' ? 'success' : 'error'} 
        sx={{ 
          width: '100%',
          borderRadius: 2
        }}
      >
        {submitStatus === 'success' ? 
          "Your message has been sent successfully! We'll get back to you soon." :
          "Failed to send message. Please try again later."
        }
      </Alert>
    </Snackbar>
  </Container>
);
}

export default Contact;