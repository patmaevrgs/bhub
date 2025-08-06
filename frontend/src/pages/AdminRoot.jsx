import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLoaderData } from 'react-router-dom';
import Cookies from 'universal-cookie';
import {
  Box,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  alpha,
  Chip,
  Tooltip,
  InputBase,
  Popover,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ClickAwayListener
} from '@mui/material';

import AdminSidebar from '../components/Admin/AdminSidebar';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import ContactMailIcon from '@mui/icons-material/ContactMail'
import { useLocation } from 'react-router-dom';

function AdminRoot() {
  const [isLoggedIn, setIsLoggedIn] = useState(useLoaderData());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Search menu items that can be searched
  const searchMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Announcements', path: '/admin/announcements', icon: <AnnouncementIcon fontSize="small" /> },
    { label: 'Accounts', path: '/admin/accounts', icon: <AccountsIcon fontSize="small" /> },
    { label: 'Residents Database', path: '/admin/database', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Contact Messages', path: '/admin/contact-messages', icon: <ContactMailIcon fontSize="small" /> },
    { label: 'Request Forms', path: '/admin/services/request-forms', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Ambulance Booking', path: '/admin/services/ambulance-booking', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Court Reservation', path: '/admin/services/court-reservation', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Infrastructure Reports', path: '/admin/services/infrastructure-reports', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Project Proposals', path: '/admin/services/project-proposals', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'User Logs', path: '/admin/logs', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Manage Application', path: '/admin/manage-app', icon: <SettingsIcon fontSize="small" /> },
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Filter menu items based on search query
    const results = searchMenuItems.filter(
      item => item.label.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  };

  // Handle search result click
  const handleSearchResultClick = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Toggle search open/closed
  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) {
      // Focus the search input when opened
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      // Clear search when closed
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'admin')) {
      return [{ label: 'Dashboard', path: '/admin' }];
    }
    
    const breadcrumbs = [];
    
    // Add Dashboard as first item
    breadcrumbs.push({ label: 'Dashboard', path: '/admin' });
    
    // Add other path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (segment === 'admin') return; // Skip the admin part
      
      currentPath += `/${segment}`;
      
      // Format the label (capitalize and replace hyphens with spaces)
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      breadcrumbs.push({
        label,
        path: index === pathSegments.length - 1 ? null : `/admin${currentPath}`
      });
    });
    
    return breadcrumbs;
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'primary' }}>
      {/* Sidebar */}
      {!isMobile && (
        <Box component="nav" sx={{ width: 250, flexShrink: 0 }}>
          <AdminSidebar />
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            color: 'text.primary',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            zIndex: 10
          }}
        >
          <Toolbar sx={{ minHeight: '60px', px: { xs: 2, md: 3 } }}>
            {/* Breadcrumbs - Left side */}
            <Box sx={{ 
              display: searchOpen ? 'none' : 'flex',
              alignItems: 'center', 
              flex: 1,
              mr: 2,
            }}>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
              >
                {getBreadcrumbs().map((breadcrumb, index) => {
                  const isLast = index === getBreadcrumbs().length - 1;
                  
                  return isLast ? (
                    <Typography 
                      key={breadcrumb.label} 
                      color="text.primary" 
                      fontWeight={600}
                      sx={{ 
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {breadcrumb.label}
                    </Typography>
                  ) : (
                    <MuiLink
                      key={breadcrumb.label}
                      color="inherit"
                      href={breadcrumb.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(breadcrumb.path);
                      }}
                      sx={{ 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {breadcrumb.label}
                    </MuiLink>
                  );
                })}
              </Breadcrumbs>
            </Box>

            {/* Search bar - expands when search is clicked */}
            {searchOpen && (
              <ClickAwayListener onClickAway={() => searchQuery.trim() === '' && setSearchOpen(false)}>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderRadius: 1,
                  px: 2,
                  mr: 2
                }}>
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <InputBase
                    ref={searchInputRef}
                    placeholder="Search admin panel..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ 
                      flex: 1,
                      py: 1,
                      fontSize: '0.875rem',
                      '& .MuiInputBase-input': {
                        width: '100%',
                      }
                    }}
                  />
                  {searchQuery !== '' && (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchQuery('')}
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </ClickAwayListener>
            )}

            {/* Search Results Popover */}
            {searchOpen && searchQuery !== '' && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '60px',
                  left: isMobile ? '16px' : '266px', // Adjust based on sidebar width
                  right: '16px',
                  zIndex: 1000,
                  mt: 1,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  borderRadius: 1,
                  maxHeight: '70vh',
                  overflow: 'auto'
                }}
              >
                <List sx={{ py: 1 }}>
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <ListItem 
                        key={index} 
                        button 
                        onClick={() => handleSearchResultClick(result.path)}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08)
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                          {result.icon}
                        </ListItemIcon>
                        <ListItemText primary={result.label} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem sx={{ px: 3 }}>
                      <ListItemText 
                        primary="No results found" 
                        secondary="Try a different search term" 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            color: 'text.secondary',
                            fontWeight: 500
                          }
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Environment chip */}
              <Chip 
                label="Development" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ 
                  borderRadius: '4px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  mr: 1,
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
              
              <Tooltip title={searchOpen ? "Close search" : "Search"}>
                <IconButton 
                  size="small" 
                  onClick={toggleSearch}
                  sx={{ 
                    color: searchOpen ? 'primary.main' : 'text.secondary',
                    bgcolor: searchOpen 
                      ? alpha(theme.palette.primary.main, 0.1) 
                      : alpha(theme.palette.primary.main, 0.04),
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Drawer for Mobile */}
        {isMobile && <AdminSidebar mobile />}

        {/* Main Outlet Content */}
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            flexGrow: 1, 
            overflowY: 'auto',
            pt: isMobile ? 5 : 3 
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AdminRoot;