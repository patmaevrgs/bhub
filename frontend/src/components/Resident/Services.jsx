import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Avatar,
  useTheme,
  useMediaQuery,
  Chip,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Explore as ExploreIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  ImportContacts as ImportContactsIcon,
  HowToReg as HowToRegIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  LocalHospital as LocalHospitalIcon,
  SportsBasketball as SportsCenterIcon,
  Construction as ConstructionIcon,
  Lightbulb as LightbulbIcon,
  HealthAndSafety as HealthIcon,
  Pets as PetsIcon,
  LocalPolice as SecurityIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  MonetizationOn as MoneyIcon,
  Business as BusinessIcon,
  EmojiPeople as ResidentIcon
} from '@mui/icons-material';

function Services() {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ExploreIcon sx={{ mr: 1.5, fontSize: 28 }} />
          Barangay Services
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary', 
            mb: 2,
            maxWidth: '80%',
            minWidth: {xs: '100%', sm: '100%', md: 'auto'}
          }}
        >
          Barangay Maahas offers various services to assist residents. Learn about what's available and how to access them.
        </Typography>
      </Box>

      {/* Login Reminder Banner */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 4, 
          borderRadius: 2,
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          display: 'flex',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            right: 0, 
            top: 0, 
            width: { xs: '100px', md: '150px' }, 
            height: '100%',
            opacity: 0.05,
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h20L0 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <Box sx={{ flex: 1, zIndex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Residents-Only Services
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: { xs: 2, sm: 0 } }}>
            Most services require resident verification. Please log in or register to access the full range of services offered by Barangay Maahas.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, zIndex: 1 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/signin"
            size="small"
            sx={{
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/signup"
            size="small"
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              bgcolor: 'background.paper'
            }}
          >
            Register
          </Button>
        </Box>
      </Paper>

      {/* Online Services Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          pb: 1,
          mb: 3,
          borderBottom: '2px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }}
      >
        <ImportContactsIcon sx={{ mr: 1, color: 'primary.main' }} />
        Digital Barangay Services
      </Typography>

      {/* Document Request - Highlighted Service */}
      <Box 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minWidth: '100%'
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: '40%' },
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544v2.83L25.456 30l-1.414 1.414-28-28L0 0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2v2.83l21.627 21.626-1.414 1.414L0 13.657v2.828l17.8 17.8-1.414 1.413L0 19.1v2.83l14.142 14.14L12.728 37.5 0 24.77v2.83l10.314 10.313L8.9 39.327 0 30.428v2.828l6.485 6.485L5.07 41.254 0 36.184v2.83l2.656 2.656L1.242 43.07 0 41.83v2.828l-1.414 1.414L0 44.657v2.828l2.828-2.83V60h2.83L0 55.172V60h2.828L60 2.828V0H57.172L0 57.17V60h2.828L60 2.828V0h-2.83L0 57.17V60h2.828L60 2.828V0h-2.83L0 57.17V60h2.828L60 2.828V0h-2.83L0 57.17V60h2.828L60 2.828V0h-2.83L0 57.17V60h2.828L60 2.828V0h-2.83L0 57.17V60h2.828L60 2.828V0h-2.83L0 57.17V60h2.828l28-28-1.414-1.414L0 59.172V60h60V57.172l-5.656 5.656-1.415-1.414L60 54.142V51.314l-8.485 8.484-1.414-1.414L60 48.97v-2.83l-11.314 11.315-1.414-1.414L60 43.8v-2.83l-14.142 14.143-1.414-1.414L60 38.656v-2.83L43.657 52.17 42.243 50.757 60 32.997v-2.83L39.8 50.485l-1.414-1.414L60 27.656v-2.83L36.485 47.07 35.07 45.657 60 20.728v-2.83L32.83 45.485 31.414 44.07 60 15.485v-2.83L29.142 42.244l-1.414-1.414L60 10.314V7.486L25.313 42.17 23.9 40.757 60 5.658V2.83L22.485 40.343 21.07 38.93 60 0h-2.83L17.657 39.516l-1.414-1.415L60 0h-2.83L13.828 43.97l-1.414-1.414L60 0h-2.83L10 47.8l-1.414-1.413L60 0h-2.83L6.17 51.626 4.757 50.213 60 0h-2.83L2.344 55.485.93 54.07 60 0h-2.83z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              zIndex: 0
            }}
          />
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 60, 
              height: 60, 
              mb: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1
            }}
          >
            <ImportContactsIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              position: 'relative', 
              zIndex: 1
            }}
          >
            Document Request Forms
          </Typography>
          <Typography 
            variant="body2" 
            paragraph 
            sx={{ 
              position: 'relative', 
              zIndex: 1
            }}
          >
            Request official documents from the barangay office without having to visit in person. Submit your requirements online and pick up the document when ready.
          </Typography>
          <Button
            component={RouterLink}
            to="/signin"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              alignSelf: 'flex-start',
              zIndex: 1,
              mt: 'auto'
            }}
            size="small"
          >
            Request Documents
          </Button>
        </Box>
        
        <Box 
          sx={{ 
            flex: 1, 
            p: 3,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Available Documents:
          </Typography>

          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Barangay ID" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Barangay Clearance" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Business Clearance" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Digging Permit" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Fencing Permit" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="No Objection Certificate" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Certificate of Indigency" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Certificate of Residency" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Request for Assistance" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip 
                  icon={<CheckCircleIcon fontSize="small" />} 
                  label="Lot Ownership" 
                  variant="outlined" 
                  size="small" 
                  sx={{ justifyContent: 'flex-start' }}
                />
              </Stack>
            </Grid>
          </Grid>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 2, 
              pt: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.05), 
              p: 1.5, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
            }}
          >
            <InfoIcon color="warning" sx={{ fontSize: 20, mr: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Need a document not listed here? Visit the Barangay Hall in person for assistance.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Other Services in Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Ambulance Service - Urgent Alert Style */}
        <Grid item xs={12} md={6} sx={{minWidth: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha('#f44336', 0.2),
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <Box 
              sx={{ 
                bgcolor: alpha('#f44336', 0.07),
                p: 2,
                borderBottom: '1px solid',
                borderColor: alpha('#f44336', 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#f44336', 
                  height: 40, 
                  width: 40 
                }}
              >
                <LocalHospitalIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Ambulance Booking
              </Typography>
            </Box>
            
            <Box sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Barangay Maahas provides an ambulance service for emergency medical transport. This service is available for residents, prioritizing emergency situations.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mb: 2
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: alpha('#f44336', 0.05), 
                    p: 1.5, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha('#f44336', 0.1),
                    flex: 1
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#d32f2f' }}>
                    Emergency Transport
                  </Typography>
                  <Typography variant="body2">
                    For urgent medical situations requiring immediate transport
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    bgcolor: alpha('#f44336', 0.02), 
                    p: 1.5, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha('#f44336', 0.1),
                    flex: 1
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#d32f2f' }}>
                    Scheduled Transport
                  </Typography>
                  <Typography variant="body2">
                    For non-emergency medical appointments (subject to availability)
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Priority given to elderly & PWDs
                </Typography>
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="outlined"
                  color="error"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                  size="small"
                >
                  Book Ambulance
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Court Reservation - Card with Diagonal Pattern */}
        <Grid item xs={12} md={6} sx={{minWidth: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha('#4caf50', 0.2),
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              position: 'relative'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                opacity: 0.02,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                zIndex: 0
              }}
            />
            
            <Box 
              sx={{ 
                bgcolor: alpha('#4caf50', 0.07),
                p: 2,
                borderBottom: '1px solid',
                borderColor: alpha('#4caf50', 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                position: 'relative',
                zIndex: 1
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#4caf50', 
                  height: 40, 
                  width: 40 
                }}
              >
                <SportsCenterIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Court Reservation
              </Typography>
            </Box>
            
            <Box sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Reserve the barangay basketball court for sports events, community gatherings, or private celebrations. Check availability and book in advance.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        Basketball Court
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Regulation-sized covered court
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        Facilities
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Basic lighting and seating
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        Reservation System
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Book through B-Hub app
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        Special Rates
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        For community events
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="outlined"
                  color="success"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                  size="small"
                >
                  Reserve Court
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Infrastructure Report - Workmans Style */}
        <Grid item xs={12} md={6} sx={{minWidth: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha('#ff9800', 0.2),
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box 
              sx={{ 
                bgcolor: alpha('#ff9800', 0.07),
                p: 2,
                borderBottom: '1px solid',
                borderColor: alpha('#ff9800', 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#ff9800', 
                  height: 40, 
                  width: 40 
                }}
              >
                <ConstructionIcon />
              </Avatar>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                Infrastructure Report
              </Typography>
            </Box>
            
            <Grid container sx={{ flexGrow: 1 }}>
              <Grid item xs={12} md={5} 
                sx={{ 
                  p: 2.5, 
                  bgcolor: alpha('#ff9800', 0.03),
                  borderRight: { xs: 'none', md: '1px dashed' },
                  borderBottom: { xs: '1px dashed', md: 'none' },
                  borderColor: alpha('#ff9800', 0.2)
                }}
              >
                <Typography variant="body2" paragraph>
                  Report infrastructure issues within the barangay that need attention. Help us maintain a safe community.
                </Typography>
                
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="outlined"
                  color="warning"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    mt: { xs: 0, md: 4 }
                  }}
                  size="small"
                >
                  Submit Report
                </Button>
              </Grid>
              
              <Grid item xs={12} md={7} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: alpha('#ff9800', 0.3),
                        bgcolor: alpha('#ff9800', 0.05)
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" color="warning" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Road Damage (potholes, cracks)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: alpha('#ff9800', 0.3),
                        bgcolor: alpha('#ff9800', 0.05)
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" color="warning" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Lighting Issues (broken lights)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: alpha('#ff9800', 0.3),
                        bgcolor: alpha('#ff9800', 0.05)
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" color="warning" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Drainage Problems (flooding)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: alpha('#ff9800', 0.3),
                        bgcolor: alpha('#ff9800', 0.05)
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" color="warning" />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Progress Tracking (follow status)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Project Proposal - Idea Style */}
        <Grid item xs={12} md={6} sx={{minWidth: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha('#26a69a', 0.2),
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', height: '100%' }}>
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '70%' },
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#26a69a', 
                      height: 40, 
                      width: 40 
                    }}
                  >
                    <LightbulbIcon />
                  </Avatar>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    Community Project Proposal
                  </Typography>
                </Box>
                
                <Typography variant="body2" paragraph>
                  Submit proposals for community improvement projects that can benefit Barangay Maahas. Your ideas can help shape the future of our community.
                </Typography>
                
                <Box 
                  sx={{ 
                    p: 1.5, 
                    mb: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha('#26a69a', 0.2),
                    bgcolor: alpha('#26a69a', 0.02)
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#26a69a', mb: 1 }}>
                    Proposal Categories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip size="small" label="Infrastructure" />
                    <Chip size="small" label="Environmental" />
                    <Chip size="small" label="Digital Services" />
                    <Chip size="small" label="Education" />
                    <Chip size="small" label="Welfare" />
                    <Chip size="small" label="Livelihood" />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <InfoIcon fontSize="small" sx={{ color: '#26a69a', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                    All proposals are reviewed by the Barangay Council.
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/signin"
                    variant="outlined"
                    sx={{ 
                      color: '#26a69a',
                      borderColor: '#26a69a',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#26a69a',
                        backgroundColor: alpha('#26a69a', 0.04)
                      }
                    }}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                  >
                    Submit Proposal
                  </Button>
                </Box>
              </Box>
              
              <Box 
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  width: '30%',
                  bgcolor: alpha('#26a69a', 0.1),
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    opacity: 0.1,
                    backgroundSize: '20px 20px',
                    backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`
                  }}
                />
                <LightbulbIcon sx={{ fontSize: 80, color: '#26a69a', opacity: 0.5 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Health Services Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          pb: 1,
          mb: 3,
          borderBottom: '2px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }}
      >
        <HealthIcon sx={{ mr: 1, color: 'primary.main' }} />
        Health Services
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Health Center - Timeline Style */}
        <Grid item xs={12} sx={{minWidth: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '30%' },
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  textAlign: { xs: 'left', md: 'center' }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 64, 
                    height: 64, 
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <HealthIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  Barangay Health Center
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Primary healthcare services for residents
                </Typography>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="outlined"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                  size="small"
                >
                  Contact Health Center
                </Button>
              </Box>
              
              <Box sx={{ flex: 1, p: 3 }}>
                <Typography variant="body2" paragraph>
                  The Barangay Health Center provides basic medical services for residents. Our healthcare workers offer consultations, preventive care, and health education.
                </Typography>
                
                <Box sx={{ position: 'relative' }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: 18, 
                      top: 0, 
                      bottom: 0, 
                      width: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.2) 
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: '2px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1
                        }}
                      >
                        <CheckCircleIcon fontSize="small" color="primary" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Medical Consultations
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Free basic check-ups and medical advice from healthcare workers every Wednesday morning at the Health Center
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: '2px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1
                        }}
                      >
                        <CheckCircleIcon fontSize="small" color="primary" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Free Rabies Immunization
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          The first three vaccines needed after being bitten by a rabid animal are free of charge
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: '2px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1
                        }}
                      >
                        <CheckCircleIcon fontSize="small" color="primary" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Basic Medicines
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Some free medicines available for qualified residents (subject to stock availability)
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: '2px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          zIndex: 1
                        }}
                      >
                        <CheckCircleIcon fontSize="small" color="primary" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Health Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Educational materials and health advisories for common conditions
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.05), 
                    borderRadius: 2, 
                    mt: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.info.main, 0.2)
                  }}
                >
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'info.main' }} />
                    For information about available medicines and other health services, please visit the Barangay Health Center directly. Medicine availability varies and is updated regularly.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Animal Welfare - Horizontal Card */}
        <Grid item xs={12} sx={{minWidth: '100%'}}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha('#9c27b0', 0.2),
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <Grid container>
              <Grid item xs={12} md={4} 
                sx={{ 
                  bgcolor: alpha('#9c27b0', 0.05),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: {xs: '100%', sm: '100%', md: '100%'}
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.03,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 20c-11.046 0-20 8.954-20 20s8.954 20 20 20c5.967 0 11.317-2.62 15-6.765 3.683 4.145 9.033 6.765 15 6.765 11.046 0 20-8.954 20-20s-8.954-20-20-20c-5.967 0-11.317 2.62-15 6.765-3.683-4.145-9.033-6.765-15-6.765zm0 5c8.284 0 15 6.716 15 15s-6.716 15-15 15c-8.284 0-15-6.716-15-15s6.716-15 15-15zm30 0c8.284 0 15 6.716 15 15s-6.716 15-15 15c-8.284 0-15-6.716-15-15s6.716-15 15-15z' /%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                  }}
                />
                <PetsIcon sx={{ fontSize: 100, color: '#9c27b0', opacity: 0.4 }} />
              </Grid>
              
              <Grid item xs={12} md={8} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                    <PetsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      Animal Welfare Programs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Occasional pet care services
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" paragraph>
                  The barangay occasionally collaborates with veterinary groups to provide basic pet care services. These are special events that are announced through the barangay's communication channels.
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={4} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                    <Box 
                      sx={{ 
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: alpha('#9c27b0', 0.3),
                        bgcolor: alpha('#9c27b0', 0.02),
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0', mb: 0.5 }}>
                        Anti-Rabies Vaccination
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        During scheduled vaccination drives
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                    <Box 
                      sx={{ 
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: alpha('#9c27b0', 0.3),
                        bgcolor: alpha('#9c27b0', 0.02),
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0', mb: 0.5 }}>
                        Pet Deworming
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Occasional free deworming sessions
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                    <Box 
                      sx={{ 
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: alpha('#9c27b0', 0.3),
                        bgcolor: alpha('#9c27b0', 0.02),
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0', mb: 0.5 }}>
                        Pet Health Education
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Information for pet owners
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    Services are subject to availability of partner organizations
                  </Typography>
                  
                  <Button
                    component={RouterLink}
                    to="/announcements"
                    variant="outlined"
                    sx={{ 
                      color: '#9c27b0',
                      borderColor: '#9c27b0',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: '#9c27b0',
                        backgroundColor: alpha('#9c27b0', 0.04)
                      },
                      minWidth: {xs: '50%', sm: '50%', md: 'auto'}
                    }}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                  >
                    Check Announcements
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Community Programs Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          pb: 1,
          mb: 3,
          borderBottom: '2px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }}
      >
        <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
        Community Programs
      </Typography>

      {/* Combined Security and Community Programs */}
      <Box 
        sx={{ 
          mb: 5, 
          p: 0,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          bgcolor: 'background.paper'
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            borderBottom: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Barangay Community Programs
          </Typography>
        </Box>
        
        {/* <Grid container> */}
          {/* Security Programs */}
          <Grid item xs={12} md={6} 
            sx={{ 
              p: 3, 
              borderRight: { xs: 'none', md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 'none' },
              borderColor: alpha(theme.palette.primary.main, 0.1),
              minWidth: {xs: '100%', sm: '100%', md: '100%'}
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <SecurityIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Security & Safety Programs
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              Barangay Maahas implements various security measures to ensure the safety of residents. Our barangay tanods work diligently to maintain peace and order.
            </Typography>
            
            <Grid container spacing={2} sx={{minWidth: {xs: '100%', sm: '100%', md: '100%'}}}>
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    bgcolor: alpha(theme.palette.primary.main, 0.01),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: {xs: '100%', sm: '100%', md: '260px'}
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                    Barangay Patrol
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regular patrols by trained barangay tanods
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    bgcolor: alpha(theme.palette.primary.main, 0.01),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: {xs: '100%', sm: '100%', md: '260px'}
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                    CCTV Monitoring
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Strategic cameras in select public areas
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    bgcolor: alpha(theme.palette.primary.main, 0.01),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: {xs: '100%', sm: '100%', md: '260px'}
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                    Emergency Response
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quick response to emergency situations
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    bgcolor: alpha(theme.palette.primary.main, 0.01),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: {xs: '100%', sm: '100%', md: '260px'}
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                    Community Watch
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Volunteer-based neighborhood monitoring
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Button
              component={RouterLink}
              to="/contact"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                mt: 2
              }}
              size="small"
            >
              Contact Barangay
            </Button>
          </Grid>
          
          {/* Youth & Community */}
          <Grid item xs={12} md={6} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <EventIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Youth Development & Community Events
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              Barangay Maahas occasionally organizes activities for youth development and community engagement. These events are announced through the barangay's official channels.
            </Typography>
            
            <Box 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderRadius: 2,
                p: 2,
                border: '1px dashed',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                mb: 2
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                    Youth Programs
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Sports Activities</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Educational Programs</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Leadership Training</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                    Community Events
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Barangay Celebrations</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Clean-up Drives</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">Community Gatherings</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Check announcements for upcoming activities
              </Typography>
              
              <Button
                component={RouterLink}
                to="/announcements"
                variant="outlined"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: {xs: '50%', sm: '50%', md: 'auto'}
                }}
                size="small"
              >
                View Announcements
              </Button>
            </Box>
          </Grid>
        {/* </Grid> */}
      </Box>

      {/* Service Process Section */}
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                pb: 1,
                mb: 3,
                borderBottom: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }}
            >
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              How to Access Services
            </Typography>
      
            <Paper sx={{ p: 3, mb: 4, borderRadius: 1, boxShadow: 1, minWidth: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Service Request Process
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1}}>
                <Grid item xs={12} md={3} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                  <Box sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 40, 
                      height: 40, 
                      mb: 1 
                    }}>
                      <HowToRegIcon />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Step 1: Register
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create an account in the B-HUB portal
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                  <Box sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 40, 
                      height: 40, 
                      mb: 1 
                    }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Step 2: Submit Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fill out the appropriate service form
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                  <Box sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 40, 
                      height: 40, 
                      mb: 1 
                    }}>
                      <VisibilityIcon />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Step 3: Track Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monitor your request through the system
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                  <Box sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 40, 
                      height: 40, 
                      mb: 1 
                    }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Step 4: Service Delivery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive an update when ready
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

      {/* Contact Information */}
      <Box 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: '60px', md: '100px' },
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
          Need Additional Help?
        </Typography>
        <Typography variant="body2" paragraph sx={{ position: 'relative', zIndex: 1, maxWidth: '80%' }}>
          If you have questions about services not covered here, please visit or contact the Barangay Maahas office:
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mt: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            component={RouterLink}
            to="/contact"
            size="small"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: 'background.paper'
            }}
          >
            Contact Barangay Office
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LocationIcon />}
            component={RouterLink}
            to="/contact"
            size="small"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: 'background.paper'
            }}
          >
            Visit Barangay Hall
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            component={RouterLink}
            to="/contact"
            size="small"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: 'background.paper'
            }}
          >
            View Contact Page
          </Button>
        </Box>
      </Box>

      {/* Registration Call to Action */}
      <Box 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          textAlign: 'center',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
        
        <Avatar 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.9), 
            width: { xs: 60, md: 80 }, 
            height: { xs: 60, md: 80 },
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            zIndex: 1,
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <HowToRegIcon sx={{ fontSize: 40 }} />
        </Avatar>
        
        <Box sx={{ flex: 1, zIndex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Join the Barangay Maahas Digital Community
          </Typography>
          <Typography variant="body2" sx={{ mb: { xs: 2, md: 0 } }}>
            Register as a resident to access all services, receive important announcements, and participate in barangay programs. Your registration ensures you don't miss out on essential services.
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/signup"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 500,
            textTransform: 'none',
            py: 1,
            px: 3,
            zIndex: 1,
            minWidth: { xs: '100%', md: 'auto' }
          }}
          size="medium"
        >
          Register Now
        </Button>
      </Box>
    </Container>
  );
}

export default Services;