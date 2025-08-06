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
  CardMedia,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Link,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Announcement as AnnouncementIcon,
  Explore as ExploreIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  ArrowForward as ArrowForwardIcon,
  ImportContacts as ImportContactsIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import API_BASE_URL from '../../config';

// Carousel
function SimpleCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const getProperImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
  };
  
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [images]);
  
  // Simple arrow navigation
  const goToNext = (e) => {
    e.stopPropagation();
    if (!images || images.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
  };
  
  const goToPrev = (e) => {
    e.stopPropagation();
    if (!images || images.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };
  
  // Touch handling for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left - go next
      goToNext({ stopPropagation: () => {} });
    }
    
    if (touchEnd - touchStart > 50) {
      // Swipe right - go prev
      goToPrev({ stopPropagation: () => {} });
    }
  };
  
  // If no images available
  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f7fa',
        }}
      >
        <Typography variant="body1">No images available</Typography>
      </Box>
    );
  }

  // Calculate background gradients for nav elements
  const arrowBg = 'rgba(0, 0, 0, 0.3)';
  const arrowHoverBg = 'rgba(0, 0, 0, 0.5)';
  
  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f5f7fa',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Static image - no animations or fancy transitions for speed */}
      <Box
        component="img"
        src={getProperImageUrl(images[currentIndex]?.path || '')}
        alt={images[currentIndex]?.caption || 'Carousel image'}
        onError={(e) => {
          e.target.src = '/placeholder-image.jpg';
          e.target.style.objectFit = 'contain';
        }}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      
      {/* Caption */}
      {images[currentIndex]?.caption && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            p: 2,
            pt: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {images[currentIndex].caption}
          </Typography>
        </Box>
      )}
      
      {/* Simple Arrow Navigation - No SVG or complex styling */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          <Box
            onClick={goToPrev}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '15%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              '&:hover': {
                '& .arrow': {
                  backgroundColor: arrowHoverBg,
                },
              },
            }}
          >
            <Box
              className="arrow"
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: arrowBg,
                borderRadius: '50%',
                color: 'white',
                fontSize: 24,
                transition: 'background-color 0.2s',
              }}
            >
              ‹
            </Box>
          </Box>
          
          {/* Right Arrow */}
          <Box
            onClick={goToNext}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '15%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              '&:hover': {
                '& .arrow': {
                  backgroundColor: arrowHoverBg,
                },
              },
            }}
          >
            <Box
              className="arrow"
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: arrowBg,
                borderRadius: '50%',
                color: 'white',
                fontSize: 24,
                transition: 'background-color 0.2s',
              }}
            >
              ›
            </Box>
          </Box>
        </>
      )}
      
      {/* Simple Dots */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            zIndex: 2,
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: currentIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ResidentHome() {
  const [firstName, setFirstName] = useState('');
  const [homepageContent, setHomepageContent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Get user's first name from localStorage
    const storedFirstName = localStorage.getItem('firstName');
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }
    
    // Fetch homepage content
    fetchHomepageContent();
    
    // Fetch latest announcements
    fetchLatestAnnouncements();
  }, [refreshKey]);
  
  const refreshData = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const fetchHomepageContent = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/homepage?t=${timestamp}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHomepageContent(data);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getProperImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  const fetchLatestAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Sort by date (newest first) and take only the latest 4
      const latestAnnouncements = data
        .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
        .slice(0, 4);
      setAnnouncements(latestAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      
      {/* Hero Section with SimpleCarousel */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          border: '1px solid rgb(209, 208, 208)',
        }}
      >
        <Box sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {homepageContent?.welcomeTitle || 'Barangay Maahas, Los Baños, Laguna Digital Hub'}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            lineHeight: 1.6,
            mb: 4,
            fontSize: '0.95rem',
          }}
        >
          {homepageContent?.welcomeText || 
          'Welcome to the Barangay Maahas Digital Hub – your one-stop platform for accessing essential barangay services and information. Stay updated with the latest announcements and events, request forms and permits, book services, and share your concerns or proposals with ease.'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="contained"
            component={RouterLink}
            to="/resident/announcements"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 500,
              textTransform: 'none',
              py: 1,
            }}
          >
            Latest Announcements
          </Button>

          <Button
            variant="outlined"
            component={RouterLink}
            to="/resident/services/ambulance"
            sx={{
              color: 'primary.main',
              borderColor: 'primary.main',
              fontWeight: 500,
              textTransform: 'none',
              py: 1,
            }}
          >
            Explore Services
          </Button>
        </Box>
      </Box>
    </Paper>

    {/* Carousel Area Below Welcome Area */}
    <Box
      sx={{
        width: '100%',
        height: '360px',
        mb: 5,
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
      }}
    >
            {homepageContent?.carouselImages && homepageContent.carouselImages.length > 0 ? (
              <SimpleCarousel images={homepageContent.carouselImages} />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No images available
                </Typography>
              </Box>
            )}
          </Box>

          {/* Latest Announcements - Fixed layout */}
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '3px solid',
                borderColor: 'primary.grey',
                pb: 1
              }}
            >
              <AnnouncementIcon sx={{ mr: 1, color: 'primary.main' }} />
              Latest Announcements
            </Typography>
            
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
              mt: 3,
              // Responsive layout
              '@media (max-width: 1200px)': {
                gridTemplateColumns: 'repeat(3, 1fr)',
              },
              '@media (max-width: 900px)': {
                gridTemplateColumns: 'repeat(2, 1fr)',
              },
              '@media (max-width: 600px)': {
                gridTemplateColumns: '1fr',
              }
            }}>
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <Card 
                    key={announcement._id} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: 300, // Increased height to accommodate content
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      }
                    }}
                  >
                    {/* Image Section */}
                    <CardMedia
                      component="img"
                      height="120"
                      image={announcement.images && announcement.images.length > 0 
                        ? getProperImageUrl(announcement.images[0]) 
                        : '/placeholder-image.jpg'
                      }
                      alt={announcement.title}
                      sx={{ 
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                    
                    {/* Announcement Type Badge */}
                    <Box 
                      sx={{ 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        px: 1.5, 
                        py: 0.5,
                        position: 'relative',
                        top: -12,
                        left: 12,
                        width: 'fit-content',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {announcement.type}
                    </Box>
                    
                    <CardContent sx={{ 
                      pt: 0, 
                      pb: 1, 
                      px: 2, 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <Typography 
                        variant="caption" 
                        component="div"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {formatDate(announcement.postedAt)}
                      </Typography>
                      
                      <Typography 
                        variant="subtitle1" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.95rem',
                          lineHeight: 1.2,
                          mb: 1,
                          height: '2.4em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {announcement.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.85rem',
                          height: '3em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 2, // Add bottom margin to separate from button
                        }}
                      >
                        {announcement.content}
                      </Typography>
                      
                      {/* The button is now part of the card content with margin-top:auto to push it to the bottom */}
                      <Button 
                        component={RouterLink} 
                        to={`/resident/announcements#${announcement._id}`}
                        size="small" 
                        endIcon={<ArrowForwardIcon fontSize="small" />}
                        sx={{ 
                          fontSize: '0.8rem', 
                          p: 0, 
                          width: 'fit-content',
                          mt: 'auto'
                        }}
                      >
                        Read more
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', gridColumn: '1 / -1' }}>
                  <Typography variant="body1">No announcements available.</Typography>
                </Paper>
              )}
            </Box>
            
            {/* "View All Announcements" button with proper alignment */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'flex-start',
              mt: 3,
              mb: 1
            }}>
              <Button 
                component={RouterLink} 
                to="/resident/announcements" 
                variant="outlined"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                View All Announcements
              </Button>
            </Box>
          </Box>

          {/* Side-by-side Summary Data and Emergency Hotlines with equal width */}
          <Grid container spacing={4} sx={{ mb: 5 }}>
            {/* First make sure the About section is full width */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                bgcolor: 'background.paper',
                borderRadius: 1
              }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '2px solid',
                    borderColor: 'primary.grey',
                    pb: 1
                  }}
                >
                  <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                  About Barangay Maahas
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {homepageContent?.aboutText || 'Information about Barangay Maahas.'}
                </Typography>
                
                {/* Added resident registration information section */}
                <Box 
                  sx={{ 
                    mt: 3, 
                    mb: 3, 
                    p: 2, 
                    borderLeft: '4px solid', 
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper',
                    borderRadius: '0 8px 8px 0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <PersonAddIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    Resident Registration
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Register in the B-Hub database to ensure you're included in Barangay Maahas's official resident directory. This digital database helps the barangay identify all legitimate residents, especially when distributing government benefits, aid, and other assistance programs.
                  </Typography>
                  
                  <Typography variant="body2" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    If you're not yet registered, you may miss out on important benefits like TUPAD, ayuda, and other government programs. Registration ensures fair distribution of resources and prevents the same households from receiving multiple benefits while others receive none.
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                  <Button 
                      component={RouterLink}
                      to="/resident/register-database"
                      variant="contained" 
                      startIcon={<PersonAddIcon />}
                      sx={(theme) => ({ 
                        px: 3,
                        py: 1,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white', // Ensure text color contrasts with background
                        boxShadow: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.9), // Slightly lighter on hover
                          boxShadow: 4,
                        }
                      })}
                    >
                      Register as Resident
                    </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Second row: Summary Data and Emergency Hotlines - FORCE FULL WIDTH */}
            <Box 
              sx={{ 
                width: '100%', 
                display: 'flex', 
                mt: 1,
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 3 
              }}
            >
              <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
                <Paper sx={{ 
                  p: 3, 
                  height: 400,
                  width: '100%',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '2px solid',
                      borderColor: 'primary.grey',
                      pb: 1
                    }}
                  >
                    <ImportContactsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Barangay Summary Data
                  </Typography>
                  
                  <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>Type</TableCell>
                          <TableCell>{homepageContent?.summaryData?.type || 'barangay'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Island group</TableCell>
                          <TableCell>{homepageContent?.summaryData?.islandGroup || 'Luzon'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Region</TableCell>
                          <TableCell>{homepageContent?.summaryData?.region || 'CALABARZON (Region IV‑A)'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Province</TableCell>
                          <TableCell>{homepageContent?.summaryData?.province || 'Laguna'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Municipality</TableCell>
                          <TableCell>{homepageContent?.summaryData?.municipality || 'Los Baños'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Postal code</TableCell>
                          <TableCell>{homepageContent?.summaryData?.postalCode || '4030'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Population (2020)</TableCell>
                          <TableCell>{homepageContent?.summaryData?.population || '8,785'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Major island</TableCell>
                          <TableCell>{homepageContent?.summaryData?.majorIsland || 'Luzon'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Coordinates</TableCell>
                          <TableCell>{homepageContent?.summaryData?.coordinates || '14.1766, 121.2566'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Elevation</TableCell>
                          <TableCell>{homepageContent?.summaryData?.elevation || '16.0 meters (52.5 feet)'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
              
              <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
                <Paper sx={{ 
                  p: 3, 
                  height: 400,
                  width: '100%',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '2px solid',
                      borderColor: 'primary.grey',
                      pb: 1
                    }}
                  >
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Emergency Hotlines
                  </Typography>
                  
                  <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableBody>
                        {homepageContent?.emergencyHotlines && homepageContent.emergencyHotlines.length > 0 ? (
                          homepageContent.emergencyHotlines.map((hotline, index) => (
                            <TableRow key={index}>
                              <TableCell 
                                component="th" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  width: '30%',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {hotline.name}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {hotline.numbers.map((number, idx) => (
                                    <Typography 
                                      key={idx}
                                      variant="body2" 
                                      component="a" 
                                      href={`tel:${number.replace(/\s+/g, '')}`}
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                        mr: 1,
                                        '&:hover': {
                                          textDecoration: 'underline'
                                        }
                                      }}
                                    >
                                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                      {number}
                                    </Typography>
                                  ))}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} sx={{ textAlign: 'center' }}>
                              No hotlines available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
              </Box>
          </Grid>
          {/* Full Width Barangay Location - with consistent styling */}
          <Paper sx={{ 
            p: 3, 
            mb: 5,
            borderRadius: 1 
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: 'primary.grey',
                pb: 1
              }}
            >
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              Barangay Location
            </Typography>
            
            <Box sx={{ width: '100%', height: '400px', mt: 2 }}>
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${homepageContent?.mapCoordinates?.latitude || 14.1766},${homepageContent?.mapCoordinates?.longitude || 121.2566}&z=15&output=embed`}
              ></iframe>
            </Box>
            
            <Box 
              sx={{ 
                mt: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Typography variant="body2">
                <LocationOnIcon color="primary" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Coordinates: {homepageContent?.summaryData?.coordinates || '14.1766, 121.2566'}
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ExploreIcon />}
                component="a"
                href={`https://www.google.com/maps/dir/?api=1&destination=${homepageContent?.mapCoordinates?.latitude || 14.1766},${homepageContent?.mapCoordinates?.longitude || 121.2566}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  textTransform: 'none'
                }}
              >
                Get Directions
              </Button>
            </Box>
          </Paper>
  
          {/* Enhanced Barangay Officials Section */}
          <Paper sx={{ 
            p: 3, 
            mb: 5,
            borderRadius: 1,
            width: '100%',
            backgroundColor: 'background.paper'
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: 'primary.grey',
                pb: 1
              }}
            >
              <CelebrationIcon sx={{ mr: 1, color: 'primary.main' }} />
              Current Barangay Officials
            </Typography>
            
            {homepageContent?.officials && homepageContent.officials.length > 0 ? (
              <>
                {/* Special Styling for Barangay Captain/Chairman */}
                {homepageContent.officials.filter(official => 
                  official.position.toLowerCase().includes('captain') || 
                  official.position.toLowerCase().includes('chairman')
                ).length > 0 && (
                  <Box sx={{ 
                    mb: 1, 
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    {homepageContent.officials
                      .filter(official => 
                        official.position.toLowerCase().includes('captain') || 
                        official.position.toLowerCase().includes('chairman')
                      )
                      .map((official, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            p: 2,
                            maxWidth: 320,
                            width: '100%'
                          }}
                        >
                          <Avatar
                            src={getProperImageUrl(official.imageUrl)}
                            alt={official.name}
                            sx={{ 
                              width: 120, 
                              height: 120, 
                              mb: 1,
                              border: '3px solid',
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                            imgProps={{
                              onError: (e) => {
                                console.log('Official image failed to load:', official.imageUrl);
                                e.target.src = '/placeholder-person.png';
                              }
                            }}
                          />
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              fontWeight: 700,
                              color: 'primary.main'
                            }}
                          >
                            {official.name}
                          </Typography>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 500,
                              mb: 1,
                              color: 'text.secondary'
                            }}
                          >
                            {official.position}
                          </Typography>
                          
                          <Box 
                            sx={{ 
                              width: '40%', 
                              height: 4, 
                              bgcolor: 'primary.main', 
                              borderRadius: 2,
                              my: 1 
                            }} 
                          />
                        </Box>
                      ))}
                  </Box>
                )}
                
                {/* Divider between Captain and other officials */}
                {homepageContent.officials.filter(official => 
                  !official.position.toLowerCase().includes('captain') && 
                  !official.position.toLowerCase().includes('chairman')
                ).length > 0 && (
                  <Typography 
                    variant="subtitle1"
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.secondary',
                      pb: 2,
                      width: '100%',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      mb: 3
                    }}
                  >
                    Barangay Kagawads and Staff
                  </Typography>
                )}
                
                {/* Remaining Officials in Grid */}
                <Grid 
                  container 
                  spacing={3} 
                  sx={{ 
                    mt: 0,
                    justifyContent: 'center'
                  }}
                >
                  {homepageContent.officials
                    .filter(official => 
                      !official.position.toLowerCase().includes('captain') && 
                      !official.position.toLowerCase().includes('chairman')
                    )
                    .map((official, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            p: 2,
                            height: '100%',
                            borderRadius: 2,
                            backgroundColor: 'background.default',
                            border: '1px solid',
                            borderColor: 'rgba(33, 150, 243, 0.08)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'background.default',
                              transform: 'translateY(-4px)',
                              boxShadow: (theme) => `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          }}
                        >
                          <Avatar
                            src={getProperImageUrl(official.imageUrl)}
                            alt={official.name}
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              mb: 2,
                              border: '2px solid',
                              borderColor: 'primary.main',
                            }}
                            imgProps={{
                              onError: (e) => {
                                console.log('Official image failed to load:', official.imageUrl);
                                e.target.src = '/placeholder-person.png';
                              }
                            }}
                          />
                          <Typography 
                            variant="subtitle1" 
                            component="div" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              lineHeight: 1.3,
                              mb: 0.5
                            }}
                          >
                            {official.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.85rem',
                              fontWeight: 500 
                            }}
                          >
                            {official.position}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No officials information available.</Typography>
              </Box>
            )}
          </Paper>
    </Container>
  );
}
  
export default ResidentHome;