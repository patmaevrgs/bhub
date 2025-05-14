import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Resident/Footer';
import { Box, Container } from '@mui/material';
import API_BASE_URL from '../config';

function LandingRoot() {
  const [footerData, setFooterData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch footer data
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/homepage`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFooterData(data.footerData); // Get the footer data from the homepage content
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      // Use default values if fetching fails
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'primary',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LandingNavbar />

      {/* Responsive Content Container */}
      <Container
        maxWidth={false} // limits width on larger screens
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3, md: 4 }, // horizontal padding per screen size
          py: { xs: 2, sm: 3 }, // vertical padding per screen size
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Container>
      
      {/* Footer Component with dynamic data */}
      <Footer footerData={footerData} />
    </Box>
  );
}

export default LandingRoot;