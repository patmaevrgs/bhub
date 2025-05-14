import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Outlet, useNavigate } from 'react-router-dom';
import ResidentNav from '../components/Resident/ResidentNav';
import Footer from '../components/Resident/Footer';
import { Box, Container } from '@mui/material';
import API_BASE_URL from '../../config';

function ResidentRoot() {
  const [ResidentFirstName, setResidentFirstName] = useState('');
  const [footerData, setFooterData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const firstName = localStorage.getItem('firstName');
    if (userType === 'resident' && firstName) {
      setResidentFirstName(firstName);
    }
    
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

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove('authToken', { path: '/' });
    localStorage.removeItem('userType');
    localStorage.removeItem('firstName');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    navigate('/');
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
      <ResidentNav title="B-HUB" name={ResidentFirstName} func={handleLogout} />

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
        <Outlet context={{ firstName: ResidentFirstName }} />
      </Container>
      
      {/* Footer Component with dynamic data */}
      <Footer footerData={footerData} />
    </Box>
  );
}

export default ResidentRoot;