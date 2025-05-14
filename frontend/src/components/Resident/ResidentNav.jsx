import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  Collapse,
  ListItemIcon,
  styled,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HelpIcon from '@mui/icons-material/Help';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PersonIcon from '@mui/icons-material/Person';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import DescriptionIcon from '@mui/icons-material/Description';
import AmbulanceIcon from '@mui/icons-material/LocalHospital';
import SportsIcon from '@mui/icons-material/SportsCricket';
import ReportIcon from '@mui/icons-material/Report';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bhubLogo from '../../assets/bhub-logo.png';
import API_BASE_URL from '../../../config';

// Styled components for better readability
const NavLink = styled(Link)(({ theme, active }) => ({
  textDecoration: 'none',
  color: active === 'true' ? theme.palette.primary.main : theme.palette.text.primary,
  position: 'relative',
  padding: '4px 0',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: active === 'true' ? '100%' : '0%',
    height: '2px',
    bottom: 0,
    left: 0,
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease-in-out'
  },
  '&:hover': {
    color: theme.palette.primary.main,
    '&::after': {
      width: '100%'
    }
  }
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: 4,
  margin: '2px 8px',
  padding: '6px 16px',
  minWidth: 180,
  fontSize: '0.875rem',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  }
}));

const StyledServicesMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    marginTop: 8,
    minWidth: 220,
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
    '& .MuiMenu-list': {
      padding: '8px 0'
    }
  }
}));

const SubNavLink = styled(Typography)({
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  display: 'flex', 
  alignItems: 'center'
});

const ProfileButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 500,
  textTransform: 'none',
  padding: '6px 12px',
  borderRadius: 20,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  }
}));

const LogoutButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: 8,
  padding: 8,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  }
}));

// Mobile drawer styled components
const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const DrawerListItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: 8,
  margin: '4px 8px',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  }
}));

export default function ResidentNav({ title, name, func }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesAnchorEl, setServicesAnchorEl] = useState(null);
  const [requestFormsAnchorEl, setRequestFormsAnchorEl] = useState(null);
  const [mobileRequestOpen, setMobileRequestOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleServicesClick = (e) => setServicesAnchorEl(e.currentTarget);
  const handleServicesClose = () => {
    setServicesAnchorEl(null);
    setRequestFormsAnchorEl(null);
  };
  const handleRequestFormsClick = (e) => setRequestFormsAnchorEl(e.currentTarget);

  // Nav links with icons for both desktop and mobile
  const navLinks = [
    { text: 'Home', path: '/resident', icon: <HomeIcon fontSize="small" /> },
    { text: 'Announcements', path: '/resident/announcements', icon: <AnnouncementIcon fontSize="small" /> },
    { text: 'Transactions', path: '/resident/transactions', icon: <ReceiptIcon fontSize="small" /> },
    { text: 'FAQs', path: '/resident/faqs', icon: <HelpIcon fontSize="small" /> },
    { text: 'Contact', path: '/resident/contact', icon: <ContactSupportIcon fontSize="small" /> },
  ];

  const requestFormsLinks = [
    { text: 'Barangay ID', path: '/resident/services/request/id', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Barangay Clearance', path: '/resident/services/request/clearance', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Barangay Business Clearance', path: '/resident/services/request/business', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Lot Ownership', path: '/resident/services/request/lot', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Digging Permit', path: '/resident/services/request/digging', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Fencing Permit', path: '/resident/services/request/fencing', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Request for Assistance', path: '/resident/services/request/assistance', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Certificate of Indigency', path: '/resident/services/request/indigency', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'Certificate of Residency', path: '/resident/services/request/residency', icon: <DescriptionIcon fontSize="small" /> },
    { text: 'No Objection Certificate', path: '/resident/services/request/objection', icon: <DescriptionIcon fontSize="small" /> },
  ];

  const otherServicesLinks = [
    { text: 'Ambulance Booking', path: '/resident/services/ambulance', icon: <AmbulanceIcon fontSize="small" /> },
    { text: 'Court Reservation', path: '/resident/services/court', icon: <SportsIcon fontSize="small" /> },
    { text: 'Report Infrastructure', path: '/resident/services/report', icon: <ReportIcon fontSize="small" /> },
    { text: 'Project Proposal', path: '/resident/services/proposal', icon: <LightbulbIcon fontSize="small" /> },
  ];

  const isActive = (path) => location.pathname === path;
  
  // Check if any service path is active
  const isServiceActive = () => {
    const allServicePaths = [
      ...requestFormsLinks.map(link => link.path),
      ...otherServicesLinks.map(link => link.path)
    ];
    return allServicePaths.some(path => location.pathname === path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          px: { xs: 2, md: 4, lg: 8 },
          minHeight: { xs: '64px', md: '70px' }
        }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 2,
            }}
          >
            <img
              src={bhubLogo}
              alt="Barangay Hub Logo"
              style={{
                height: 'auto',
                width: '140px',
                maxHeight: '50px',
              }}
            />
          </Box>

          {/* Desktop Navigation - Centered */}
          {!isMobile && (
            <Box sx={{ 
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: { md: 2, lg: 4 },
            }}>
              {[...navLinks.slice(0, 2)].map(({ text, path }) => (
                <NavLink
                  key={text}
                  to={path}
                  active={isActive(path).toString()}
                >
                  <SubNavLink>
                    {text}
                  </SubNavLink>
                </NavLink>
              ))}

              {/* Services Dropdown */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '4px 0',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: isServiceActive() ? '100%' : '0%',
                    height: '2px',
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover': {
                    color: 'primary.main',
                    '&::after': {
                      width: '100%'
                    }
                  }
                }} 
                onClick={handleServicesClick}
              >
                <SubNavLink 
                  sx={{ 
                    color: isServiceActive() ? 'primary.main' : 'text.primary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Services <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5 }} />
                </SubNavLink>
              </Box>

              {/* Services Menu */}
              <StyledServicesMenu 
                anchorEl={servicesAnchorEl} 
                open={Boolean(servicesAnchorEl)} 
                onClose={handleServicesClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <StyledMenuItem onClick={handleRequestFormsClick}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DescriptionIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={500}>Request Forms</Typography>
                        <ExpandMoreIcon fontSize="small" />
                      </Box>
                    } 
                  />
                </StyledMenuItem>
                
                {/* Request Forms Submenu */}
                <Menu
                  anchorEl={requestFormsAnchorEl}
                  open={Boolean(requestFormsAnchorEl)}
                  onClose={() => setRequestFormsAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
                      maxHeight: '70vh',
                    }
                  }}
                >
                  {requestFormsLinks.map(({ text, path, icon }) => (
                    <StyledMenuItem 
                      key={text} 
                      onClick={() => { 
                        handleServicesClose(); 
                        navigate(path); 
                      }}
                      sx={{
                        backgroundColor: isActive(path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </StyledMenuItem>
                  ))}
                </Menu>
                
                <Divider sx={{ my: 1, mx: 2 }} />
                
                {/* Other Services */}
                {otherServicesLinks.map(({ text, path, icon }) => (
                  <StyledMenuItem 
                    key={text} 
                    onClick={() => { 
                      handleServicesClose(); 
                      navigate(path); 
                    }}
                    sx={{
                      backgroundColor: isActive(path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </StyledMenuItem>
                ))}
              </StyledServicesMenu>

              {/* Remaining nav links */}
              {[...navLinks.slice(2)].map(({ text, path }) => (
                <NavLink
                  key={text}
                  to={path}
                  active={isActive(path).toString()}
                >
                  <SubNavLink>
                    {text}
                  </SubNavLink>
                </NavLink>
              ))}
            </Box>
          )}

          {/* Profile and Logout Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <>
                <ProfileButton
                  onClick={() => navigate('/resident/profile')}
                  startIcon={
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {name?.[0]?.toUpperCase()}
                    </Avatar>
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    {name}
                  </Typography>
                </ProfileButton>

                <LogoutButton
                  onClick={func}
                  aria-label="Logout"
                  title="Logout"
                >
                  <ExitToAppIcon fontSize="small" />
                </LogoutButton>
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  color: 'primary.main',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={handleDrawerToggle} 
        PaperProps={{ 
          sx: { 
            width: 280,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          } 
        }}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                mr: 1.5
              }}
            >
              {name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={500}>
              {name}
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        
        <List sx={{ p: 1 }}>
          {navLinks.map(({ text, path, icon }) => (
            <DrawerListItem 
              button 
              key={text} 
              onClick={() => { 
                navigate(path); 
                setDrawerOpen(false); 
              }}
              active={isActive(path)}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive(path) ? 'primary.main' : 'inherit' }}>
                {icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body2" fontWeight={500}>
                    {text}
                  </Typography>
                } 
              />
            </DrawerListItem>
          ))}

          {/* Services Dropdown */}
          <DrawerListItem
            button
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            active={isServiceActive()}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isServiceActive() ? 'primary.main' : 'inherit' }}>
              <MiscellaneousServicesIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body2" fontWeight={500}>
                  Services
                </Typography>
              } 
            />
            <ExpandMoreIcon 
              sx={{ 
                transform: mobileServicesOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: '0.3s',
                color: isServiceActive() ? 'primary.main' : 'inherit'
              }} 
            />
          </DrawerListItem>

          {/* Services Submenu */}
          <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Request Forms Category */}
              <ListItem 
                button 
                sx={{ pl: 4 }} 
                onClick={() => setMobileRequestOpen(!mobileRequestOpen)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <DescriptionIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      Request Forms
                    </Typography>
                  } 
                />
                <ExpandMoreIcon 
                  sx={{ 
                    transform: mobileRequestOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: '0.3s' 
                  }} 
                />
              </ListItem>

              {/* Request Forms Items */}
              <Collapse in={mobileRequestOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {requestFormsLinks.map(({ text, path }) => (
                    <ListItem 
                      button 
                      key={text} 
                      sx={{ pl: 7 }} 
                      onClick={() => { 
                        navigate(path); 
                        setDrawerOpen(false); 
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: isActive(path) ? 'primary.main' : 'text.secondary',
                              fontSize: '0.8rem'
                            }}
                          >
                            {text}
                          </Typography>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {/* Other Services */}
              {otherServicesLinks.map(({ text, path, icon }) => (
                <ListItem 
                  button 
                  key={text} 
                  sx={{ pl: 4 }} 
                  onClick={() => { 
                    navigate(path); 
                    setDrawerOpen(false); 
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: isActive(path) ? 'primary.main' : 'text.secondary' 
                        }}
                      >
                        {text}
                      </Typography>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>

          <Divider sx={{ my: 2 }} />

          {/* User Actions */}
          <DrawerListItem 
            button 
            onClick={() => { 
              navigate('/resident/profile'); 
              setDrawerOpen(false); 
            }}
            active={isActive('/resident/profile')}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isActive('/resident/profile') ? 'primary.main' : 'inherit' }}>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body2" fontWeight={500}>
                  Profile
                </Typography>
              } 
            />
          </DrawerListItem>
          
          <DrawerListItem 
            button 
            onClick={() => { 
              func(); 
              setDrawerOpen(false); 
            }}
            sx={{ color: 'primary.main' }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body2" fontWeight={500}>
                  Logout
                </Typography>
              } 
            />
          </DrawerListItem>
        </List>
      </Drawer>
    </>
  );
}