import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Avatar, 
  Divider,
  alpha
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  WavingHand as WavingHandIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AdminDashboard from './AdminDashboard';
import QuickStats from './QuickStats';
import API_BASE_URL from '../../config';

function AdminHome() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Function to format today's date
  const formatToday = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Function to get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch user data using localStorage as a reliable fallback
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Always load data from localStorage first for immediate display
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        const email = localStorage.getItem('email');

        if (firstName && lastName && email) {
          setUserData({
            firstName,
            lastName,
            email
          });
        }

      } catch (error) {
        console.error('Error in user data handling:', error);
      } finally {
        // Always finish loading after a short delay
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 3 }}>
      {/* Welcome Header with Date */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 0, 
              mb: 2, 
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                p: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 0 } }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mr: 2,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  <WavingHandIcon />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h5" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {getGreeting()}, {userData.firstName ? userData.firstName : 'Admin'}!
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      mt: 0.5,
                      fontSize: '0.85rem'
                    }}
                  >
                    Welcome to the Barangay Maahas Admin Dashboard
                  </Typography>
                </Box>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  p: 1,
                  px: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)'
                }}
              >
                <CalendarIcon 
                  sx={{ 
                    color: 'primary.main', 
                    mr: 1,
                    fontSize: '1rem'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: '0.8rem'
                  }}
                >
                  Today is {formatToday()}
                </Typography>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.5,
                      fontSize: '0.85rem'
                    }}
                  >
                    This dashboard provides comprehensive insights on service usage, resident needs, and activity statistics. 
                    Use these analytics to optimize resource planning and improve service delivery for Barangay Maahas residents.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      justifyContent: { xs: 'flex-start', md: 'flex-end' }
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <InsightsIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                        Real-time Analytics
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <TimelineIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'success.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                        Service Trends
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'warning.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                        Auto-updating
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        {/* Quick Stats Section */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 0, 
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Box 
              sx={{ 
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.info.main, 0.05)}, ${alpha(theme.palette.info.main, 0.02)})`,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <TrendingUpIcon 
                sx={{ 
                  color: 'info.main',
                  mr: 1,
                  fontSize: '1.2rem'
                }} 
              />
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.primary'
                }}
              >
                Quick Overview
              </Typography>
            </Box>
            
            <Box sx={{ px: 2, pt: 1, pb: 2 }}>
              <QuickStats />
            </Box>
          </Paper>
        </Grid>
        
        {/* Main Dashboard */}
        <AdminDashboard />
      </Grid>
      
      {/* Footer */}
      <Box 
        sx={{ 
          mt: 3, 
          pt: 2, 
          pb: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'flex-end' },
          opacity: 0.8
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 1, sm: 0 }
          }}
        >
          <DashboardIcon 
            sx={{ 
              fontSize: '0.9rem',
              mr: 0.75,
              color: 'primary.main'
            }} 
          />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 500,
              color: 'text.secondary',
              fontSize: '0.7rem'
            }}
          >
            Barangay Maahas Admin Portal
          </Typography>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.65rem'
          }}
        >
          © 2025 Barangay Maahas. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
}
export default AdminHome;