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
  ListItemIcon,
  styled,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import HelpIcon from '@mui/icons-material/Help';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import bhubLogo from '/src/assets/bhub-logo.png';

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

const SubNavLink = styled(Typography)({
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  display: 'flex', 
  alignItems: 'center'
});

const LoginButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 500,
  textTransform: 'none',
  padding: '6px 12px',
  borderRadius: 20,
  borderColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
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

export default function LandingNavbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  // Nav links with icons for both desktop and mobile
  const navLinks = [
    { text: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> },
    { text: 'Announcements', path: '/announcements', icon: <AnnouncementIcon fontSize="small" /> },
    { text: 'Services', path: '/services', icon: <MiscellaneousServicesIcon fontSize="small" /> },
    { text: 'FAQs', path: '/faqs', icon: <HelpIcon fontSize="small" /> },
    { text: 'Contact', path: '/contact', icon: <ContactSupportIcon fontSize="small" /> },
  ];

  const isActive = (path) => location.pathname === path;

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
              {navLinks.map(({ text, path }) => (
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

          {/* Login Button */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <LoginButton
                variant="outlined"
                onClick={() => navigate('/signin')}
              >
                Log In
              </LoginButton>
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
          <Typography variant="h6" fontWeight={500}>
            Barangay Hub
          </Typography>
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

          <Divider sx={{ my: 2 }} />
          
          {/* Login Button in Drawer */}
          <DrawerListItem 
            button 
            onClick={() => { 
              navigate('/signin'); 
              setDrawerOpen(false); 
            }}
            sx={{ color: 'primary.main' }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <MenuIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body2" fontWeight={500}>
                  Log In
                </Typography>
              } 
            />
          </DrawerListItem>
        </List>
      </Drawer>
    </>
  );
}