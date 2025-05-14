import React, { useEffect, useState, useRef } from 'react';
import { 
  Typography, 
  Container, 
  CircularProgress, 
  Box,
  CardMedia, 
  Grid,
  Chip,
  Link,
  Divider,
  Paper,
  useTheme,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  useMediaQuery
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VideocamIcon from '@mui/icons-material/Videocam';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import API_BASE_URL from '../../../config';

// Dialog transition effect
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ResidentAnnouncements Component
 * 
 * Simplified version for compatibility with existing setup
 */
const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const highlightedCardRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState('images');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Define color variables
  const primaryColor = theme.palette.primary.main;
  const primaryLight = alpha(primaryColor, 0.1);
  const primaryMedium = alpha(primaryColor, 0.5);

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/announcements`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch announcements: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        // Add fallback title for announcements without one
        const processedData = Array.isArray(data) 
          ? data.map(announcement => ({
              ...announcement,
              title: announcement.title || "Brgy Maahas Update"
            }))
          : [];
          
        // Sort newest first
        const sortedData = processedData.reverse();
        setAnnouncements(sortedData);
        setFilteredAnnouncements(sortedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Unable to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Add this new useEffect for handling hash navigation
  useEffect(() => {
    if (!loading && announcements.length > 0 && window.location.hash) {
      const id = window.location.hash.substring(1); // Remove the # symbol
      
      // Give time for the DOM to render the cards
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          // Scroll the element into view with smooth behavior
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Add a highlight effect using primaryColor
          element.style.boxShadow = `0 0 20px ${alpha(primaryColor, 0.8)}`;
          highlightedCardRef.current = element;
          
          // Remove the highlight effect after 3 seconds
          setTimeout(() => {
            if (highlightedCardRef.current) {
              highlightedCardRef.current.style.boxShadow = '';
            }
          }, 3000);
        }
      }, 300);
    }
  }, [loading, announcements]);
  
  // When component unmounts or navigates away, clean up any highlight
  useEffect(() => {
    return () => {
      if (highlightedCardRef.current) {
        highlightedCardRef.current.style.boxShadow = '';
      }
    };
  }, []);

  // Filter announcements based on search term and date
  useEffect(() => {
    let result = [...announcements];
    
    // Apply search filter - search in both title and content
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(announcement => 
        (announcement.title && announcement.title.toLowerCase().includes(searchTermLower)) || 
        (announcement.content && announcement.content.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(filterDate.getDate() + 1);
      
      result = result.filter(announcement => {
        const announcementDate = new Date(announcement.postedAt);
        return announcementDate >= filterDate && announcementDate < nextDay;
      });
    }
    
    setFilteredAnnouncements(result);
  }, [announcements, searchTerm, dateFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today, ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'long' }) + ', ' + 
             date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isRecent = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    // Consider "recent" as within the last 24 hours
    return (now - date) < (24 * 60 * 60 * 1000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter(null);
    setFilteredAnnouncements(announcements);
  };
  
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setSelectedImageIndex(0);
    setSelectedVideoIndex(0);
    
    const hasVideos = announcement.videos && announcement.videos.length > 0;
    const hasImages = announcement.images && announcement.images.length > 0;
    
    if (hasVideos && !hasImages) {
      setActiveMedia('videos');
    } else {
      setActiveMedia('images');
    }
    
    setOpenDialog(true);
};
  
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
  };
  
  const handleShare = (e) => {
    e.stopPropagation(); // Prevent the card click event
    console.log('Share clicked');
    // Implementation for share functionality would go here
  };
  
  const handleBookmark = (e) => {
    e.stopPropagation(); // Prevent the card click event
    console.log('Bookmark clicked');
    // Implementation for bookmark functionality would go here
  };
  
  const handleNextImage = () => {
    if (selectedAnnouncement && selectedAnnouncement.images) {
      setSelectedImageIndex((prev) => 
        prev === selectedAnnouncement.images.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  const handlePrevImage = () => {
    if (selectedAnnouncement && selectedAnnouncement.images) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? selectedAnnouncement.images.length - 1 : prev - 1
      );
    }
  };

  const renderFeaturedAnnouncement = () => {
    if (!filteredAnnouncements.length) return null;
    
    const announcement = filteredAnnouncements[0];
    const hasImages = announcement.images && announcement.images.length > 0;
    const hasVideos = announcement.videos && announcement.videos.length > 0;
    const mediaToShow = hasImages ? 'image' : (hasVideos ? 'video' : null);
    
    return (
      <Card 
        elevation={1} 
        sx={{ 
          mb: 4, 
          overflow: 'hidden',
          borderRadius: 2,
          position: 'relative',
          transition: 'box-shadow 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3
          }
        }}
        onClick={() => handleAnnouncementClick(announcement)}
      >
        {isRecent(announcement.postedAt) && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 0, 
              bgcolor: primaryColor,
              color: 'white',
              py: 0.5,
              px: 2,
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              boxShadow: 1
            }}
          >
            <NotificationsActiveIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" fontWeight="bold">NEW</Typography>
          </Box>
        )}
        
        <Grid container>
          {mediaToShow && (
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: '100%', maxHeight: 300 }}>
                {mediaToShow === 'image' ? (
                  <CardMedia
                    component="img"
                    image={`${API_BASE_URL}${announcement.images[0]}`}
                    alt="Featured announcement image"
                    sx={{ 
                      height: 300,
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box sx={{ height: 300, width: '100%', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardMedia
                      component="video"
                      src={`${API_BASE_URL}${announcement.videos[0].path}`}
                      sx={{ 
                        height: '100%',
                        maxWidth: '100%'
                      }}
                      image={announcement.videos[0].thumbnail ? `${API_BASE_URL}${announcement.videos[0].thumbnail}` : ''}
                    />
                    <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <VideocamIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                    </Box>
                  </Box>
                )}
                
                {mediaToShow === 'image' && announcement.images.length > 1 && (
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <PhotoLibraryIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">{announcement.images.length} Photos</Typography>
                  </Box>
                )}
                
                {mediaToShow === 'video' && announcement.videos.length > 1 && (
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <VideocamIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">{announcement.videos.length} Videos</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} md={hasImages ? 6 : 12}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    bgcolor: primaryColor, 
                    color: 'white',
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1
                  }}
                >
                  <LocalPoliceIcon fontSize="small" />
                </Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    letterSpacing: 1, 
                    color: primaryColor,
                    fontWeight: 600 
                  }}
                >
                  {announcement.type || "BARANGAY ANNOUNCEMENT"}
                </Typography>
              </Box>
              
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                {announcement.title}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3,
                  color: theme.palette.text.secondary,
                  lineHeight: 1.7,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {announcement.content}
              </Typography>
              
              <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(announcement.postedAt)}
                    {announcement.editedAt && (
                      <span> (edited)</span>
                    )}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    );
  };

  const renderAnnouncementsList = () => {
    // Skip the first announcement as it's already shown in the featured section
    const remainingAnnouncements = filteredAnnouncements.length > 1 
      ? filteredAnnouncements.slice(1) 
      : [];
      
    if (remainingAnnouncements.length === 0) {
      return (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: alpha(primaryColor, 0.05),
            borderRadius: 2,
            border: `1px dashed ${alpha(primaryColor, 0.3)}`
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No more announcements match your filters.
          </Typography>
          {(searchTerm || dateFilter) && (
            <Button 
              onClick={clearFilters}
              variant="outlined" 
              sx={{ mt: 2, color: primaryColor, borderColor: primaryColor }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      );
    }
    
    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: primaryColor }}>
            Recent Announcements
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {remainingAnnouncements.map((announcement) => (
            <Grid item xs={12} md={6} key={announcement._id} id={announcement._id} sx={{ display: 'flex', width: '100%' }}>
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%',
                  width: '100%', // Ensure full width
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                {/* Check for media content */}
                {(() => {
                  // We need to reference announcement here since we're in a code block
                  const hasImages = announcement.images && announcement.images.length > 0;
                  const hasVideos = announcement.videos && announcement.videos.length > 0;
                  
                  // Always render the media box with the same dimensions
                  return (
                    <Box sx={{ 
                      position: 'relative', 
                      height: 180, 
                      width: '100%',  // Ensure full width
                      overflow: 'hidden',
                      display: 'block' // Force block-level rendering
                    }}>
                      {hasImages ? (
                        <CardMedia
                          component="img"
                          image={`${API_BASE_URL}${announcement.images[0]}`}
                          alt={`Announcement image`}
                          sx={{ 
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      ) : hasVideos ? (
                        <Box sx={{ 
                          height: '100%', 
                          width: '100%', 
                          bgcolor: 'black', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {/* This first box ensures the entire container is filled */}
                          <Box sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'black'
                          }} />
                          
                          {/* Play button overlay */}
                          <Box sx={{ 
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            zIndex: 2
                          }}>
                            <PlayArrowIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                          </Box>
                          
                          {/* Video label */}
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 8, 
                              left: 8, 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '0.7rem',
                              zIndex: 2
                            }}
                          >
                            <VideocamIcon sx={{ fontSize: 14 }} />
                            <span>Video</span>
                          </Box>
                        </Box>
                      ) : (
                        // Placeholder when no media is present - same dimensions as other cases
                        <Box sx={{ 
                          height: '100%', 
                          width: '100%', 
                          bgcolor: theme.palette.grey[100], 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <CampaignIcon sx={{ fontSize: 48, color: theme.palette.grey[400] }} />
                        </Box>
                      )}
                      
                      {isRecent(announcement.postedAt) && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            left: 0, 
                            bgcolor: primaryColor,
                            color: 'white',
                            py: 0.25,
                            px: 1,
                            zIndex: 5,
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}
                        >
                          NEW
                        </Box>
                      )}
                    </Box>
                  );
                })()}
                
                <CardContent sx={{ p: 2, pt: 2, pb: 1, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        letterSpacing: 0.5, 
                        fontWeight: 600, 
                        color: primaryColor,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <LocalPoliceIcon sx={{ mr: 0.5, fontSize: 14 }} />
                      {announcement.type || "BARANGAY ANNOUNCEMENT"}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="subtitle1" 
                    component="h3" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      lineHeight: 1.3
                    }}
                  >
                    {announcement.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {announcement.content}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0, mt: 'auto', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(announcement.postedAt)}
                    </Typography>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderLoading = () => {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ color: primaryColor }} />
        <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>
          Loading latest announcements...
        </Typography>
      </Box>
    );
  };

  const renderEmpty = () => {
    return (
      <Paper 
        sx={{ 
          py: 8,
          px: 4, 
          textAlign: 'center',
          bgcolor: primaryLight,
          border: `1px dashed ${primaryMedium}`,
          borderRadius: 2
        }}
      >
        <CampaignIcon sx={{ fontSize: 64, color: primaryColor, opacity: 0.7, mb: 2 }} />
        <Typography variant="h5" sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}>
          No Announcements Available
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 500, mx: 'auto' }}>
          There are currently no announcements from Barangay Maahas. 
          Please check back later for important community updates.
        </Typography>
      </Paper>
    );
  };
  
  const renderAnnouncementDialog = () => {
    if (!selectedAnnouncement) return null;
    
    const hasImages = selectedAnnouncement.images && selectedAnnouncement.images.length > 0;
    const hasFiles = selectedAnnouncement.files && selectedAnnouncement.files.length > 0;
    const hasVideos = selectedAnnouncement.videos && selectedAnnouncement.videos.length > 0;
    
    return (
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        TransitionComponent={Transition}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {selectedAnnouncement.title}
          </Typography>
          <IconButton onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Type and date info */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={selectedAnnouncement.type || "BARANGAY ANNOUNCEMENT"} 
              size="small"
              color="primary"
              icon={<LocalPoliceIcon />}
            />
            <Typography variant="body2" color="text.secondary">
              Posted: {formatDate(selectedAnnouncement.postedAt)}
            </Typography>
          </Box>
          
          {/* Image display */}
          {hasImages && (
            <Box sx={{ mb: 3, position: 'relative' }}>
              <Paper 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  borderRadius: 1,
                  height: { xs: 250, sm: 400 },
                  bgcolor: 'black',
                  position: 'relative'
                }}
              >
                <CardMedia
                  component="img"
                  image={`${API_BASE_URL}${selectedAnnouncement.images[selectedImageIndex]}`}
                  alt={`Announcement image ${selectedImageIndex + 1}`}
                  sx={{ 
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                  }}
                />
                
                {selectedAnnouncement.images.length > 1 && (
                  <>
                    <IconButton 
                      onClick={handlePrevImage}
                      sx={{ 
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <KeyboardArrowLeft />
                    </IconButton>
                    
                    <IconButton 
                      onClick={handleNextImage}
                      sx={{ 
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                    
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {selectedImageIndex + 1} / {selectedAnnouncement.images.length}
                    </Box>
                  </>
                )}
              </Paper>
            </Box>
          )}
          
          {/* Content */}
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
            {selectedAnnouncement.content}
          </Typography>
          
          {/* Attachments */}
          {hasFiles && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Attachments
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedAnnouncement.files.map((file, index) => (
                  <Chip
                    key={index}
                    icon={<AttachFileIcon />}
                    label={file.name}
                    component={Link}
                    href={`${API_BASE_URL}${file.path}`}
                    target="_blank"
                    clickable
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Videos section */}
          {hasVideos && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                <VideocamIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Videos:
              </Typography>
              <Grid container spacing={1}>
                {selectedAnnouncement.videos.map((video, index) => {
                  // Handle both formats: string paths or objects with path property
                  const videoPath = typeof video === 'string' ? video : video.path;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        component="video"
                        controls
                        sx={{
                          width: '100%',
                          borderRadius: 1,
                          maxHeight: 200,
                        }}
                      >
                        <source src={`${API_BASE_URL}${videoPath}`} />
                        Your browser does not support video playback.
                      </Box>
                      {/* <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {typeof video === 'object' && video.name ? video.name : `Video ${index + 1}`}
                      </Typography> */}
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            variant="contained" 
            sx={{ 
              bgcolor: primaryColor,
              '&:hover': {
                bgcolor: alpha(primaryColor, 0.9)
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Header Bar */}
      <Paper 
        elevation={1} 
        sx={{ 
          bgcolor: primaryColor, 
          color: 'white',
          borderRadius: 2,
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CampaignIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              BARANGAY MAAHAS ANNOUNCEMENTS
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Search and Filter Bar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2
        }}
      >
        <TextField
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              borderColor: primaryColor,
              color: primaryColor,
              whiteSpace: 'nowrap'
            }}
          >
            Filters
          </Button>
          
          {(searchTerm || dateFilter) && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              sx={{ 
                borderColor: theme.palette.grey[300],
                color: theme.palette.text.secondary,
                whiteSpace: 'nowrap'
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Expanded Filters */}
      {showFilters && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: alpha(primaryColor, 0.03)
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Filter by date"
                  value={dateFilter}
                  onChange={(newValue) => setDateFilter(newValue)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      size="small" 
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button 
                variant="contained" 
                onClick={clearFilters}
                fullWidth
                sx={{ 
                  bgcolor: primaryColor,
                  '&:hover': {
                    bgcolor: alpha(primaryColor, 0.9)
                  }
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 4, 
            bgcolor: '#FFF4F4', 
            border: '1px solid #FFD7D7',
            color: '#D32F2F',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <PriorityHighIcon sx={{ mr: 1.5 }} />
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {loading ? (
        renderLoading()
      ) : (
        filteredAnnouncements.length > 0 ? (
          <>
            {renderFeaturedAnnouncement()}
            <Divider sx={{ my: 4, borderColor: primaryLight }} />
            {renderAnnouncementsList()}
          </>
        ) : (
          renderEmpty()
        )
      )}
      
      {/* Announcement Detail Dialog */}
      {renderAnnouncementDialog()}
    </Container>
  );
}
export default Announcements;