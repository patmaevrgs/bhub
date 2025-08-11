import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  alpha,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import { Chat as ChatSupportIcon } from '@mui/icons-material';
import {
  Dashboard as DashboardIcon,
  Campaign as AnnouncementsIcon,
  Build as ServicesIcon,
  People as ResidentsIcon,
  ManageAccounts as AccountsIcon,
  History as LogsIcon,
  Menu as MenuIcon,
  Article as FormsIcon,
  LocalHospital as AmbulanceIcon,
  SportsBasketball as CourtIcon,
  Construction as InfraIcon,
  Assignment as ProjectIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ContactMail as ContactMailIcon,
} from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useSocket } from '../../contexts/SocketContext';
import API_BASE_URL from '../../config';
import bhubLogo from '../../assets/bhub-logo.png';

const drawerWidth = 250;

export default function AdminSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [userType, setUserType] = useState('admin');
  const { notifications, socket } = useSocket(); // Get both notifications AND socket
  const [pendingCounts, setPendingCounts] = useState({
    ambulance: 0,
    court: 0,
    reports: 0,
    projects: 0,
    forms: 0,
    residents: 0,
    contact: 0,
    chat: 0,
    total: 0
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
      console.log('User type from localStorage:', storedUserType);
    } else {
      // If not in localStorage, try to get it from the server
      const checkUserType = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/checkifloggedin`, {
            method: 'POST',
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.isLoggedIn && data.userType) {
              setUserType(data.userType);
              localStorage.setItem('userType', data.userType);
              console.log('User type from server:', data.userType);
            }
          }
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      };
      
      checkUserType();
    }
    
    // Check if we should expand the services menu initially
    const isServiceActive = navItems.some(item => 
      item.submenu && item.submenu.some(sub => location.pathname === sub.path)
    );
    
    if (isServiceActive) {
      setOpenServices(true);
    }
  }, [location.pathname]);

  // Fetch pending counts less frequently (every 5 minutes)
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? {
          'Authorization': `Bearer ${token}`
        } : {};

        let counts = {
          ambulance: 0,
          court: 0,
          reports: 0,
          projects: 0,
          forms: 0,
          residents: 0,
          contact: 0,
          chat: 0,
          total: 0
        };

        const safeFetch = async (url) => {
          try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
              console.warn(`Error fetching ${url}: ${response.status} ${response.statusText}`);
              return null;
            }
            const text = await response.text();
            try {
              return JSON.parse(text);
            } catch (e) {
              console.warn(`Invalid JSON from ${url}:`, text.substring(0, 100) + '...');
              return null;
            }
          } catch (error) {
            console.warn(`Network error fetching ${url}:`, error);
            return null;
          }
        };

        // Fetch ambulance bookings
        const ambulanceData = await safeFetch(`${API_BASE_URL}/ambulance?status=pending`);
        if (ambulanceData) {
          counts.ambulance = Array.isArray(ambulanceData) ? ambulanceData.length : 0;
        }

        // Fetch court reservations
        const courtData = await safeFetch(`${API_BASE_URL}/court?status=pending`);
        if (courtData) {
          counts.court = Array.isArray(courtData) ? courtData.length : 0;
        }

        // Fetch infrastructure reports
        const reportsData = await safeFetch(`${API_BASE_URL}/reports`);
        if (reportsData && reportsData.reports) {
          counts.reports = reportsData.reports.filter(r => r.status === 'Pending').length;
        } else if (reportsData && Array.isArray(reportsData)) {
          counts.reports = reportsData.filter(r => r.status === 'Pending').length;
        }

        // Fetch unread contact messages
        const contactData = await safeFetch(`${API_BASE_URL}/contact/unread-count`);
        if (contactData && contactData.success) {
          counts.contact = contactData.count;
        } else {
          counts.contact = 0;
        }

        // Fetch project proposals
        const projectsData = await safeFetch(`${API_BASE_URL}/proposals?status=pending`);
        if (projectsData && projectsData.proposals) {
          counts.projects = projectsData.proposals.length;
        } else if (projectsData && Array.isArray(projectsData)) {
          counts.projects = projectsData.length;
        }

        // Fetch document requests
        const formsData = await safeFetch(`${API_BASE_URL}/documents?status=pending`);
        if (formsData) {
          if (formsData.success && formsData.documentRequests) {
            counts.forms = formsData.documentRequests.length;
          } else if (Array.isArray(formsData)) {
            counts.forms = formsData.length;
          } else if (formsData.success && Array.isArray(formsData.data)) {
            counts.forms = formsData.data.length;
          } else {
            console.warn('Unexpected format for forms data:', formsData);
            counts.forms = 0;
          }
        }
        
        // Fetch unverified resident requests
        const residentsData = await safeFetch(`${API_BASE_URL}/residents?isVerified=false`);
        if (residentsData) {
          if (residentsData.success && residentsData.data) {
            counts.residents = residentsData.data.length;
          } else if (Array.isArray(residentsData)) {
            counts.residents = residentsData.length;
          } else if (residentsData.pagination && residentsData.data) {
            counts.residents = residentsData.pagination.total || residentsData.data.length;
          }
        }

        const chatStatsData = await safeFetch(`${API_BASE_URL}/admin/chat-stats`);
        if (chatStatsData && chatStatsData.success) {
          counts.chat = chatStatsData.stats.unreadChats || 0;
        }

        // Calculate total
        counts.total = counts.ambulance + counts.court + counts.reports + counts.projects + counts.forms;

        console.log('Pending counts:', counts);
        setPendingCounts(counts);
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };
    
    // Initial fetch
    fetchPendingCounts();
    
    // Refresh every 5 minutes instead of constantly
    const refreshInterval = setInterval(() => {
      fetchPendingCounts();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Handle real-time notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      setPendingCounts(prev => {
        const newCounts = { ...prev };
        
        switch (latestNotification.type) {
          case 'ambulance_booking':
            newCounts.ambulance += 1;
            break;
          case 'court_reservation':
            newCounts.court += 1;
            break;
          case 'document_request':
            newCounts.forms += 1;
            break;
          case 'infrastructure_report':
            newCounts.reports += 1;
            break;
          case 'project_proposal':
            newCounts.projects += 1;
            break;
          case 'resident_registration':
            newCounts.residents += 1;
            break;
          case 'contact_message':
            newCounts.contact += 1;
            break;
          case 'new_chat':
          case 'user_message':
            newCounts.chat += 1;
            break;
        }
        
        newCounts.total = newCounts.ambulance + newCounts.court + 
                         newCounts.reports + newCounts.projects + newCounts.forms;
        
        return newCounts;
      });
    }
  }, [notifications]);

  // NEW: Handle chat-specific socket events for real-time count updates
  useEffect(() => {
    if (!socket) return;

    const handleChatRead = () => {
      console.log('Chat marked as read - updating count'); // Debug log
      setPendingCounts(prev => {
        const newCount = Math.max(0, prev.chat - 1);
        console.log('Chat count updated from', prev.chat, 'to', newCount); // Debug log
        return {
          ...prev,
          chat: newCount
        };
      });
    };

    const handleUserMessage = (data) => {
      console.log('New user message - updating count'); // Debug log
      setPendingCounts(prev => ({
        ...prev,
        chat: prev.chat + 1
      }));
    };

    socket.on('chat_read', handleChatRead);
    socket.on('user_message', handleUserMessage);

    return () => {
      socket.off('chat_read', handleChatRead);
      socket.off('user_message', handleUserMessage);
    };
  }, [socket]); // Using the existing socket from useSocket

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  // Base navigation items
  const baseNavItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      label: 'Announcements',
      icon: <AnnouncementsIcon />,
      path: '/admin/announcements',
    },
    {
      label: 'Services',
      icon: <ServicesIcon />,
      submenu: [
        { label: 'Request forms', icon: <FormsIcon />, path: '/admin/services/request-forms' },
        { label: 'Ambulance booking', icon: <AmbulanceIcon />, path: '/admin/services/ambulance-booking' },
        { label: 'Court reservation', icon: <CourtIcon />, path: '/admin/services/court-reservation' },
        { label: 'Infrastructure reports', icon: <InfraIcon />, path: '/admin/services/infrastructure-reports' },
        { label: 'Project proposals', icon: <ProjectIcon />, path: '/admin/services/project-proposals' },
      ],
    },
    {
      label: 'Contact Messages',
      icon: <ContactMailIcon />,
      path: '/admin/contact-messages',
    },
    {
      label: 'Chat Support',
      icon: <ChatSupportIcon />,
      path: '/admin/chat-support',
    },
    {
      label: 'Resident Database',
      icon: <ResidentsIcon />,
      path: '/admin/database',
    },
    {
      label: 'Accounts',
      icon: <AccountsIcon />,
      path: '/admin/accounts',
    },
    {
      label: 'User log',
      icon: <LogsIcon />,
      path: '/admin/logs',
    },
  ];
  
  // Add Manage Application for superadmin only
  const navItems = userType === 'superadmin' ? [
    ...baseNavItems,
    {
      label: 'Manage Application',
      icon: <SettingsIcon />,
      path: '/admin/manage-app',
    }
  ] : baseNavItems;

  // Rest of your component remains the same...
  const renderDrawerContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* All your existing renderDrawerContent code stays exactly the same */}
      {/* Logo Header Section */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 1.5
        }}
      >
        <img
          src={bhubLogo}
          alt="B-Hub Logo"
          style={{
            height: 'auto',
            width: '150px',
            maxHeight: '50px',
          }}
        />
      </Box>

      {/* Admin Info Section */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          display: 'flex', 
          alignItems: 'center',
          mb: 1.5,
          cursor: 'pointer',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
        onClick={() => navigate('/admin/profile')}
      >
        <Avatar 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1), 
            color: 'primary.main',
            width: 42,
            height: 42,
            border: '2px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box sx={{ ml: 1.5 }}>
          <Typography 
            variant="subtitle2" 
            fontWeight={600} 
            sx={{ color: 'text.primary', lineHeight: 1.2 }}
          >
            {localStorage.getItem('firstName')} {localStorage.getItem('lastName')}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CircleIcon sx={{ fontSize: '8px', color: 'success.main', mr: 0.8 }} />
            Online
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box 
        sx={{ 
          overflowY: 'auto',
          flex: 1,
          py: 1,
          px: 2
        }}
      >
        {/* Section Label */}
        <Typography 
          variant="overline" 
          sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: 'text.secondary',
            opacity: 0.8,
            pl: 1.5,
            mb: 1,
            letterSpacing: '0.08em',
            display: 'block'
          }}
        >
          MAIN NAVIGATION
        </Typography>
        {/* Navigation List */}
        <List sx={{ pt: 0 }}>
          {navItems.map((item, index) => {
            if (!item.submenu) {
              return (
                <ListItemButton
                  key={index}
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    mx: 0.5,
                    borderRadius: 2,
                    mb: 0.75,
                    py: 1,
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    backgroundColor: location.pathname === item.path 
                      ? alpha(theme.palette.primary.main, 0.08) 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === item.path ? 'primary.main' : alpha(theme.palette.text.primary, 0.7),
                      minWidth: 36,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{item.label}</span>
                        {item.label === 'Services' && pendingCounts.total > 0 && (
                          <Chip 
                            label={pendingCounts.total} 
                            size="small"
                            color="warning"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              minWidth: 20,
                              ml: 1
                            }}
                          />
                        )}
                        {item.label === 'Resident Database' && pendingCounts.residents > 0 && (
                          <Chip 
                            label={pendingCounts.residents}
                            size="small"
                            color="warning"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              minWidth: 24,
                              ml: 1,
                              '& .MuiChip-label': {
                                padding: '0 6px',
                                overflow: 'visible'
                              }
                            }}
                          />
                        )}
                        {item.label === 'Contact Messages' && pendingCounts.contact > 0 && (
                          <Chip 
                            label={pendingCounts.contact}
                            size="small"
                            color="warning"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              minWidth: 20,
                              ml: 1,
                              '& .MuiChip-label': {
                                padding: '0 6px',
                                overflow: 'visible'
                              }
                            }}
                          />
                        )}
                        {item.label === 'Chat Support' && pendingCounts.chat > 0 && (
                          <Chip 
                            label={pendingCounts.chat}
                            size="small"
                            color="error" // Use red for urgent chat notifications
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              minWidth: 20,
                              ml: 1,
                              '& .MuiChip-label': {
                                padding: '0 6px',
                                overflow: 'visible'
                              }
                            }}
                          />
                        )}
                      </Box>
                    }
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.875rem'
                      } 
                    }}
                  />
                </ListItemButton>
              );
            } else {
              return (
                <React.Fragment key={index}>
                  <ListItemButton
                    onClick={() => setOpenServices(!openServices)}
                    sx={{
                      mx: 0.5,
                      borderRadius: 2,
                      mb: 0.75,
                      py: 1,
                      color: openServices || 
                             item.submenu.some(sub => location.pathname === sub.path) ? 
                             'primary.main' : 'text.primary',
                      backgroundColor: openServices || 
                                       item.submenu.some(sub => location.pathname === sub.path) ? 
                                       alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: openServices || 
                               item.submenu.some(sub => location.pathname === sub.path) ? 
                               'primary.main' : alpha(theme.palette.text.primary, 0.7),
                        minWidth: 36,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{item.label}</span>
                          {pendingCounts.total > 0 && (
                            <Chip 
                              label={pendingCounts.total} 
                              size="small"
                              color="warning"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                minWidth: 20,
                                ml: 1
                              }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ 
                        '& .MuiTypography-root': { 
                          fontWeight: openServices || 
                                      item.submenu.some(sub => location.pathname === sub.path) ? 
                                      600 : 500,
                          fontSize: '0.875rem'
                        } 
                      }}
                    />
                    {openServices ? 
                      <ExpandLess sx={{ color: 'primary.main' }} /> : 
                      <ExpandMore sx={{ color: alpha(theme.palette.text.primary, 0.7) }} />
                    }
                  </ListItemButton>
                  <Collapse in={openServices} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu.map((sub, i) => (
                        <ListItemButton
                          key={i}
                          component={Link}
                          to={sub.path}
                          selected={location.pathname === sub.path}
                          sx={{
                            pl: 4.5,
                            py: 0.75,
                            mx: 0.5,
                            borderRadius: 2,
                            color: location.pathname === sub.path ? 'primary.main' : alpha(theme.palette.text.primary, 0.75),
                            backgroundColor: location.pathname === sub.path ? 
                                            alpha(theme.palette.primary.main, 0.08) : 'transparent',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            }
                          }}
                        >
                          <ListItemIcon 
                            sx={{ 
                              color: location.pathname === sub.path ? 'primary.main' : alpha(theme.palette.text.primary, 0.6),
                              minWidth: 28,
                              fontSize: '0.875rem'
                            }}
                          >
                            {sub.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>{sub.label}</span>
                                {/* Display pending count badges */}
                                {sub.label === 'Ambulance booking' && pendingCounts.ambulance > 0 && (
                                  <Chip 
                                    label={pendingCounts.ambulance} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1,
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                        overflow: 'visible'
                                      }
                                    }}
                                  />
                                )}
                                {sub.label === 'Court reservation' && pendingCounts.court > 0 && (
                                  <Chip 
                                    label={pendingCounts.court} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1,
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                        overflow: 'visible'
                                      }
                                    }}
                                  />
                                )}
                                {sub.label === 'Infrastructure reports' && pendingCounts.reports > 0 && (
                                  <Chip 
                                    label={pendingCounts.reports} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1,
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                        overflow: 'visible'
                                      }
                                    }}
                                  />
                                )}
                                {sub.label === 'Project proposals' && pendingCounts.projects > 0 && (
                                  <Chip 
                                    label={pendingCounts.projects} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1,
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                        overflow: 'visible'
                                      }
                                    }}
                                  />
                                )}
                                {sub.label === 'Request forms' && pendingCounts.forms > 0 && (
                                  <Chip 
                                    label={pendingCounts.forms} 
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      minWidth: 20,
                                      ml: 1,
                                      '& .MuiChip-label': {
                                        padding: '0 6px',
                                        overflow: 'visible'
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            sx={{ 
                              '& .MuiTypography-root': { 
                                fontWeight: location.pathname === sub.path ? 600 : 400,
                                fontSize: '0.815rem'
                              } 
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }
          })}
        </List>

        {/* Divider for system section */}
        <Divider sx={{ my: 2, mx: 1.5, opacity: 0.6 }} />

        {/* System Section Label */}
        <Typography 
          variant="overline" 
          sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: 'text.secondary',
            opacity: 0.8,
            pl: 1.5,
            mb: 1,
            letterSpacing: '0.08em',
            display: 'block'
          }}
        >
          SYSTEM
        </Typography>
        {/* System Items */}
        <List sx={{ pt: 0 }}>
          {/* Settings - Only for superadmin */}
          {userType === 'superadmin' && (
            <ListItemButton
              component={Link}
              to="/admin/manage-app"
              selected={location.pathname === '/admin/manage-app'}
              sx={{
                mx: 0.5,
                borderRadius: 2,
                mb: 0.75,
                py: 1,
                color: location.pathname === '/admin/manage-app' ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname === '/admin/manage-app' 
                  ? alpha(theme.palette.primary.main, 0.08) 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === '/admin/manage-app' ? 'primary.main' : alpha(theme.palette.text.primary, 0.7),
                  minWidth: 36,
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Manage Application" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: location.pathname === '/admin/manage-app' ? 600 : 500,
                    fontSize: '0.875rem'
                  } 
                }}
              />
            </ListItemButton>
          )}

          {/* Logout Button */}
          <ListItemButton
            onClick={async () => {
            try {
              // Get the token from localStorage for the authorization header
              const token = localStorage.getItem('token');
              const headers = {
                'Content-Type': 'application/json'
              };
              
              // Add token to Authorization header if it exists
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }
              
              // Call the logout API endpoint with proper headers
              const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: headers
              });
              
              // Clear ALL localStorage items, including the token
              localStorage.clear();
              
              // Explicitly remove the auth token
              localStorage.removeItem('token');
              localStorage.removeItem('userType');
              localStorage.removeItem('firstName');
              localStorage.removeItem('lastName');
              localStorage.removeItem('email');
              localStorage.removeItem('user');
              
              // Force a full page reload to clear any in-memory state
              window.location.href = '/';
            } catch (error) {
              console.error('Error during logout:', error);
              // Even if there's an error, still try to clear everything and navigate away
              localStorage.clear();
              window.location.href = '/';
            }
          }}
            sx={{
              mx: 0.5,
              borderRadius: 2,
              mb: 0.75,
              py: 1,
              color: 'error.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'error.main',
                minWidth: 36,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  fontSize: '0.875rem'
                } 
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer Section */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            display: 'block',
            fontSize: '0.7rem'
          }}
        >
          B-Hub Admin Panel
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: alpha(theme.palette.text.secondary, 0.7),
            fontSize: '0.65rem'
          }}
        >
          © 2025 Barangay Maahas
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={toggleDrawer}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: theme.palette.primary.main,
              zIndex: 1300,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={toggleDrawer}
            PaperProps={{
              sx: {
                width: drawerWidth,
                backgroundColor: '#f8f9fa',
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
              },
            }}
          >
            {renderDrawerContent()}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          anchor="left"
          PaperProps={{
            sx: {
              width: drawerWidth,
              backgroundColor: '#f8f9fa',
              borderRight: 'none',
              height: '100vh',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.07)',
            },
          }}
        >
          {renderDrawerContent()}
        </Drawer>
      )}
    </>
  );
}