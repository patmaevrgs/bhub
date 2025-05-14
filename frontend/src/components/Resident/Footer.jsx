import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = ({ footerData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentYear = new Date().getFullYear();
  
  // Set default values or use the provided data
  const {
    title = 'BARANGAY MAAHAS',
    description = 'Your one-stop hub for essential barangay services and information. Stay updated with announcements, request forms, and connect with your local community.',
    address = 'Los Baños, Laguna, Philippines',
    phone = '+63 (049) 536-XXXX',
    email = 'contact@barangaymaahas.gov.ph'
  } = footerData || {};
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.03),
        borderTop: '1px solid',
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        pt: 4,
        pb: 2,
        mt: 'auto' // Pushes footer to bottom if content is short
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center">
          {/* Simplified Barangay Info Column - Now Full Width and Centered */}
          <Grid item xs={12} md={8} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box
              component={RouterLink}
              to="/resident/home"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                mb: 2,
                textDecoration: 'none',
              }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  mr: 1
                }}
              >
                {title}
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ mb: 2, color: 'text.secondary' }}
            >
              {description}
            </Typography>
            
            <Grid container spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
              <Grid item xs={12} sm="auto">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <LocationIcon 
                    fontSize="small" 
                    sx={{ color: 'primary.main', mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {address}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm="auto">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <PhoneIcon 
                    fontSize="small" 
                    sx={{ color: 'primary.main', mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {phone}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm="auto">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <EmailIcon 
                    fontSize="small" 
                    sx={{ color: 'primary.main', mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {email}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, borderColor: (theme) => alpha(theme.palette.primary.main, 0.1) }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
            }}
          >
            © {currentYear} Barangay Maahas. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;