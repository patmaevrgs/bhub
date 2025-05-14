import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Photo as PhotoIcon
} from '@mui/icons-material';
import Slider from "react-slick";
import { alpha } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import InfoIcon from '@mui/icons-material/Info';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import CollectionsIcon from '@mui/icons-material/Collections';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import TitleIcon from '@mui/icons-material/Title';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DescriptionIcon from '@mui/icons-material/Description';
import InputAdornment from '@mui/material/InputAdornment';
import BusinessIcon from '@mui/icons-material/Business';
import ExploreIcon from '@mui/icons-material/Explore';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chip from '@mui/material/Chip';
import PersonIcon from '@mui/icons-material/Person';
import AlertTitle from '@mui/material/AlertTitle';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import API_BASE_URL from '../../config';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`homepage-tabpanel-${index}`}
      aria-labelledby={`homepage-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminManageHomepage() {
  const [tabValue, setTabValue] = useState(0);
  const [homepageContent, setHomepageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Welcome Section State
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  
  // About Section State
  const [aboutText, setAboutText] = useState('');
  
  // Summary Data State
  const [summaryData, setSummaryData] = useState({
    type: '',
    islandGroup: '',
    region: '',
    province: '',
    municipality: '',
    postalCode: '',
    population: '',
    majorIsland: '',
    coordinates: '',
    elevation: ''
  });
  
  // Carousel Images State
  const [carouselImages, setCarouselImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [carouselCaptions, setCarouselCaptions] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);
  
  // Emergency Hotlines State
  const [emergencyHotlines, setEmergencyHotlines] = useState([]);
  const [newHotline, setNewHotline] = useState({ name: '', numbers: [''] });
  const [editingHotlineIndex, setEditingHotlineIndex] = useState(-1);
  
  // Map Coordinates State
  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 14.1766,
    longitude: 121.2566
  });
  
    // Officials State
    const [officials, setOfficials] = useState([]);
    const [newOfficial, setNewOfficial] = useState({ name: '', position: '', imageUrl: '' });
    const [editingOfficialIndex, setEditingOfficialIndex] = useState(-1);
    const [selectedOfficialImage, setSelectedOfficialImage] = useState(null);
    const [officialImagePreview, setOfficialImagePreview] = useState('');
    const [footerData, setFooterData] = useState({
        title: '',
        description: '',
        address: '',
        phone: '',
        email: ''
      });

  
  useEffect(() => {
    fetchHomepageContent();
  }, []);
  
  useEffect(() => {
  // Add this in your component to force slider resize when tab changes
    if (tabValue === 3 && carouselImages.length > 0) {
      const timer = setTimeout(() => {
        // Force resize event for slick to recalculate dimensions
        window.dispatchEvent(new Event('resize'));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tabValue, carouselImages]);

  const fetchHomepageContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/homepage`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHomepageContent(data);
      
      // Set welcome section state
      setWelcomeTitle(data.welcomeTitle || '');
      setWelcomeText(data.welcomeText || '');
      
      // Set about section state
      setAboutText(data.aboutText || '');
      
      // Set summary data state
      setSummaryData(data.summaryData || {
        type: '',
        islandGroup: '',
        region: '',
        province: '',
        municipality: '',
        postalCode: '',
        population: '',
        majorIsland: '',
        coordinates: '',
        elevation: ''
      });
      
      // Set carousel images state
      setCarouselImages(data.carouselImages || []);
      
      // Set emergency hotlines state
      setEmergencyHotlines(data.emergencyHotlines || []);
      
      // Set map coordinates state
      setMapCoordinates(data.mapCoordinates || {
        latitude: 14.1766,
        longitude: 121.2566
      });
      
      // Set officials state
      setOfficials(data.officials || []);

      setFooterData(data.footerData || {
        title: 'BARANGAY MAAHAS',
        description: 'Your one-stop hub for essential barangay services and information. Stay updated with announcements, request forms, and connect with your local community.',
        address: 'Los Baños, Laguna, Philippines',
        phone: '0926-935-6540',
        email: 'barangaymaahas2@gmail.com'
      });
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      showAlert('Error fetching homepage content. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };
  
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  // ======== Welcome Section Handlers ========
  const saveWelcomeSection = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch(`${API_BASE_URL}/homepage/welcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          welcomeTitle,
          welcomeText,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('Welcome section updated successfully!');
    } catch (error) {
      console.error('Error updating welcome section:', error);
      showAlert('Error updating welcome section. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Footer Data Handlers ========
const handleFooterDataChange = (e) => {
  const { name, value } = e.target;
  setFooterData(prev => ({
    ...prev,
    [name]: value
  }));
};

const saveFooterData = async () => {
  try {
    setSaving(true);
    const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
    
    const response = await fetch(`${API_BASE_URL}/homepage/footer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        footerData,
        adminName
      }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    setHomepageContent(data);
    showAlert('Footer information updated successfully!');
  } catch (error) {
    console.error('Error updating footer information:', error);
    showAlert('Error updating footer information. Please try again.', 'error');
  } finally {
    setSaving(false);
  }
};

  // ======== About Section Handlers ========
  const saveAboutSection = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch(`${API_BASE_URL}/homepage/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aboutText,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('About section updated successfully!');
    } catch (error) {
      console.error('Error updating about section:', error);
      showAlert('Error updating about section. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Summary Data Handlers ========
  const handleSummaryDataChange = (e) => {
    const { name, value } = e.target;
    setSummaryData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSummaryData = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch(`${API_BASE_URL}/homepage/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryData,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('Summary data updated successfully!');
    } catch (error) {
      console.error('Error updating summary data:', error);
      showAlert('Error updating summary data. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Carousel Images Handlers ========
  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Create preview URLs
      const newFilePreviewUrls = files.map(file => URL.createObjectURL(file));
      setFilePreviewUrls(newFilePreviewUrls);
      
      // Initialize captions array
      setCarouselCaptions(Array(files.length).fill(''));
    }
  };
  
  const handleCaptionChange = (index, value) => {
    const newCaptions = [...carouselCaptions];
    newCaptions[index] = value;
    setCarouselCaptions(newCaptions);
  };
  
  const uploadCarouselImages = async (action = 'append') => {
    if (selectedFiles.length === 0) {
      showAlert('Please select files to upload', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      formData.append('captions', JSON.stringify(carouselCaptions));
      formData.append('adminName', adminName);
      formData.append('action', action);
      
      const response = await fetch(`${API_BASE_URL}/homepage/carousel`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      setCarouselImages(data.carouselImages || []);
      
      // Reset file selection state
      setSelectedFiles([]);
      setFilePreviewUrls([]);
      setCarouselCaptions([]);
      
      showAlert(`Carousel images ${action === 'replace' ? 'replaced' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error uploading carousel images:', error);
      showAlert('Error uploading carousel images. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteImageClick = (image) => {
    setImageToDelete(image);
    setOpenDeleteDialog(true);
  };
  
  const deleteCarouselImage = async () => {
    if (!imageToDelete) return;
    
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch(`${API_BASE_URL}/homepage/carousel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: imageToDelete._id,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      setCarouselImages(data.carouselImages || []);
      showAlert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting carousel image:', error);
      showAlert('Error deleting carousel image. Please try again.', 'error');
    } finally {
      setSaving(false);
      setOpenDeleteDialog(false);
      setImageToDelete(null);
    }
  };
  
  // ======== Emergency Hotlines Handlers ========
  const handleHotlineChange = (e, index) => {
    const { name, value } = e.target;
    const updatedHotline = { ...newHotline };
    
    if (name === 'numbers') {
      updatedHotline.numbers[index] = value;
    } else {
      updatedHotline[name] = value;
    }
    
    setNewHotline(updatedHotline);
  };

  const saveHotlinesToBackend = async (hotlinesToSave) => {
    try {
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      console.log("Saving hotlines to backend:", hotlinesToSave);
      
      const response = await fetch(`${API_BASE_URL}/homepage/hotlines`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyHotlines: hotlinesToSave,
          adminName
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Save hotlines response:", data);
      setHomepageContent(data);
      
      return true;
    } catch (error) {
      console.error('Error saving hotlines to backend:', error);
      throw error;
    }
  };
  
  const addHotlineNumber = () => {
    setNewHotline({
      ...newHotline,
      numbers: [...newHotline.numbers, '']
    });
  };
  
  const removeHotlineNumber = (index) => {
    const updatedNumbers = newHotline.numbers.filter((_, i) => i !== index);
    setNewHotline({
      ...newHotline,
      numbers: updatedNumbers
    });
  };
  
  const addHotline = async () => {
    if (!newHotline.name || newHotline.numbers.some(num => !num)) {
      showAlert('Please fill in all hotline fields', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      
      let updatedHotlines;
      if (editingHotlineIndex >= 0) {
        // Update existing hotline
        updatedHotlines = [...emergencyHotlines];
        updatedHotlines[editingHotlineIndex] = { ...newHotline };
      } else {
        // Add new hotline
        updatedHotlines = [...emergencyHotlines, { ...newHotline }];
      }
      
      // Update state
      setEmergencyHotlines(updatedHotlines);
      
      // Reset form
      setNewHotline({ name: '', numbers: [''] });
      setEditingHotlineIndex(-1);
      
      // Save to backend immediately
      await saveHotlinesToBackend(updatedHotlines);
      
      showAlert(editingHotlineIndex >= 0 ? 'Hotline updated successfully!' : 'Hotline added successfully!');
    } catch (error) {
      console.error('Error adding/updating hotline:', error);
      showAlert('Error adding/updating hotline. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const editHotline = (index) => {
    setNewHotline({ ...emergencyHotlines[index] });
    setEditingHotlineIndex(index);
  };
  
  const removeHotline = async (index) => {
    try {
      setSaving(true);
      
      const updatedHotlines = emergencyHotlines.filter((_, i) => i !== index);
      setEmergencyHotlines(updatedHotlines);
      
      // Save to backend immediately
      await saveHotlinesToBackend(updatedHotlines);
      
      showAlert('Hotline removed successfully!');
    } catch (error) {
      console.error('Error removing hotline:', error);
      showAlert('Error removing hotline. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const saveEmergencyHotlines = async () => {
    try {
      setSaving(true);
      await saveHotlinesToBackend(emergencyHotlines);
      showAlert('Emergency hotlines updated successfully!');
    } catch (error) {
      console.error('Error updating emergency hotlines:', error);
      showAlert('Error updating emergency hotlines. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Map Coordinates Handlers ========
  const handleMapCoordinateChange = (e) => {
    const { name, value } = e.target;
    setMapCoordinates(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const saveMapCoordinates = async () => {
    try {
      setSaving(true);
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      const response = await fetch(`${API_BASE_URL}/homepage/map`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapCoordinates,
          adminName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setHomepageContent(data);
      showAlert('Map coordinates updated successfully!');
    } catch (error) {
      console.error('Error updating map coordinates:', error);
      showAlert('Error updating map coordinates. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // ======== Officials Handlers ========
  const handleOfficialImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setSelectedOfficialImage(selectedFile);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setOfficialImagePreview(previewUrl);
      
      // We'll set the image path later when we add or update the official
    }
  };
  
  const handleOfficialChange = (e) => {
    const { name, value } = e.target;
    setNewOfficial(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addOfficial = async () => {
    if (!newOfficial.name || !newOfficial.position) {
      showAlert('Please fill in name and position', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      // First, if we have a new image, upload it
      let imagePath = newOfficial.imageUrl; // Keep existing path by default
      
      if (selectedOfficialImage) {
        const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
        
        const formData = new FormData();
        formData.append('image', selectedOfficialImage);
        formData.append('adminName', adminName);
        
        const response = await fetch(`${API_BASE_URL}/homepage/official-image`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload official image');
        }
        
        const data = await response.json();
        imagePath = data.imagePath; // Get the path of the uploaded image
        console.log("Image path received:", imagePath);
      }
      
      // Now proceed with adding/updating the official with the new image path
      const officialWithImage = {
        ...newOfficial,
        imageUrl: imagePath
      };
      
      if (editingOfficialIndex >= 0) {
        // Update existing official
        const updatedOfficials = [...officials];
        updatedOfficials[editingOfficialIndex] = officialWithImage;
        setOfficials(updatedOfficials);
      } else {
        // Add new official
        setOfficials([...officials, officialWithImage]);
      }
      
      // Reset form and states
      setNewOfficial({ name: '', position: '', imageUrl: '' });
      setEditingOfficialIndex(-1);
      setSelectedOfficialImage(null);
      setOfficialImagePreview('');
      
      // Important: Save the officials to backend right away
      await saveOfficialsToBackend([...officials, officialWithImage]);
      
      showAlert('Official added successfully!');
    } catch (error) {
      console.error('Error adding official:', error);
      showAlert('Error adding official. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveOfficialsToBackend = async (officialsToSave) => {
    try {
      const adminName = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      
      console.log("Saving officials to backend:", officialsToSave);
      
      const response = await fetch(`${API_BASE_URL}/homepage/officials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          officials: officialsToSave,
          adminName
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Save officials response:", data);
      setHomepageContent(data);
      
      // We don't need to reload since we're already updating state
      return true;
    } catch (error) {
      console.error('Error saving officials to backend:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };
  
  
  const editOfficial = (index) => {
    setNewOfficial({ ...officials[index] });
    setEditingOfficialIndex(index);
    setOfficialImagePreview(''); // Reset image preview
    setSelectedOfficialImage(null); // Reset selected image
  };
  
  const removeOfficial = async (index) => {
    try {
      setSaving(true);
      
      const updatedOfficials = officials.filter((_, i) => i !== index);
      setOfficials(updatedOfficials);
      
      // Save to backend right away
      await saveOfficialsToBackend(updatedOfficials);
      
      showAlert('Official removed successfully!');
    } catch (error) {
      console.error('Error removing official:', error);
      showAlert('Error removing official. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const saveOfficials = async () => {
    try {
      setSaving(true);
      await saveOfficialsToBackend(officials);
      showAlert('All officials updated successfully!');
    } catch (error) {
      console.error('Error updating all officials:', error);
      showAlert('Error updating officials. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
  <Box sx={{ p: 3 }}>
    {/* Header */}
    <Box 
      sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography 
        variant="h5" 
        component="h2"
        sx={{ 
          fontWeight: 600,
          display: 'flex', 
          alignItems: 'center'
        }}
      >
        <HomeIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        Manage Homepage Content
      </Typography>
      <Button
        variant="outlined"
        onClick={fetchHomepageContent}
        startIcon={<RefreshIcon />}
        size="small"
        sx={{ 
          borderRadius: 1.5,
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.85rem'
        }}
      >
        Refresh Content
      </Button>
    </Box>
    
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading homepage content...
        </Typography>
      </Box>
    ) : (
      <Paper 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
          overflow: 'hidden',
          p: 2
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              py: 1.5,
              minHeight: 'auto',
            }
          }}
        >
          <Tab 
            label="Welcome Section" 
            icon={<WavingHandIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="About Section" 
            icon={<InfoIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Summary Data" 
            icon={<DataUsageIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Carousel Images" 
            icon={<CollectionsIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Emergency Hotlines" 
            icon={<LocalPhoneIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Map Location" 
            icon={<LocationOnIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Officials" 
            icon={<PeopleIcon fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Footer" 
            icon={<VerticalAlignBottomIcon fontSize="small" />} 
            iconPosition="start"
          />
        </Tabs>
        {/* Welcome Section Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5),
            }}
          >
            <WavingHandIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Welcome Section
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is the first section visitors see when they visit your homepage.
              </Typography>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{minWidth: '100%'}}>
                <TextField
                  label="Welcome Title"
                  variant="outlined"
                  fullWidth
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  margin="normal"
                  helperText="Main headline displayed on the homepage"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{minWidth: '100%'}}>
                <TextField
                  label="Welcome Text"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={welcomeText}
                  onChange={(e) => setWelcomeText(e.target.value)}
                  margin="normal"
                  helperText="Introductory paragraph displayed below the title"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <TextFieldsIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Preview Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    borderRadius: 2, 
                    p: 2, 
                    mt: 1, 
                    backgroundColor: alpha('#e3f2fd', 0.5),
                    border: '1px dashed',
                    borderColor: 'primary.light'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Preview:
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {welcomeTitle || 'Welcome Title Will Appear Here'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {welcomeText || 'Welcome text will appear here. This text will introduce visitors to your barangay website.'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveWelcomeSection}
              disabled={saving}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save Welcome Section'}
            </Button>
          </Box>
        </TabPanel>
        {/* About Section Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <InfoIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                About Section
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Information about Barangay Maahas displayed on the homepage.
              </Typography>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{minWidth: '100%'}}>
                <TextField
                  label="About Text"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={6}
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  margin="normal"
                  helperText="Description of Barangay Maahas"
                  size="small"
                />
              </Grid>
              
              {/* Preview Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    borderRadius: 2, 
                    p: 2, 
                    mt: 1, 
                    backgroundColor: alpha('#e3f2fd', 0.5),
                    border: '1px dashed',
                    borderColor: 'primary.light'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Preview:
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 700 }}>
                    About Barangay Maahas
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {aboutText || 'About text will appear here. This text will provide information about Barangay Maahas.'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveAboutSection}
              disabled={saving}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save About Section'}
            </Button>
          </Box>
        </TabPanel>
        {/* Summary Data Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <DataUsageIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Summary Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Statistical information about Barangay Maahas.
              </Typography>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Barangay Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="type"
                  label="Type"
                  variant="outlined"
                  fullWidth
                  value={summaryData.type || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., Barangay"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="islandGroup"
                  label="Island Group"
                  variant="outlined"
                  fullWidth
                  value={summaryData.islandGroup || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., Luzon"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="region"
                  label="Region"
                  variant="outlined"
                  fullWidth
                  value={summaryData.region || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., CALABARZON"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="province"
                  label="Province"
                  variant="outlined"
                  fullWidth
                  value={summaryData.province || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., Laguna"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="municipality"
                  label="Municipality"
                  variant="outlined"
                  fullWidth
                  value={summaryData.municipality || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., Los Baños"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="postalCode"
                  label="Postal Code"
                  variant="outlined"
                  fullWidth
                  value={summaryData.postalCode || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., 4030"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="population"
                  label="Population"
                  variant="outlined"
                  fullWidth
                  value={summaryData.population || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., 5,000"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="majorIsland"
                  label="Major Island"
                  variant="outlined"
                  fullWidth
                  value={summaryData.majorIsland || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., Luzon"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="coordinates"
                  label="Coordinates"
                  variant="outlined"
                  fullWidth
                  value={summaryData.coordinates || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., 14.1766° N, 121.2566° E"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="elevation"
                  label="Elevation"
                  variant="outlined"
                  fullWidth
                  value={summaryData.elevation || ''}
                  onChange={handleSummaryDataChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., 50 m"
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveSummaryData}
              disabled={saving}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save Summary Data'}
            </Button>
          </Box>
        </TabPanel>
        {/* Carousel Images Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <CollectionsIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Carousel Images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                These images will be displayed in the homepage carousel.
              </Typography>
            </Box>
          </Box>
          
          {/* Current Images */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
              maxWidth: '100%', // Ensure it doesn't exceed container width
              overflow: 'hidden'
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <VisibilityIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
              Current Carousel Images
            </Typography>
            
            {carouselImages.length > 0 ? (
              <Box>
                {/* Regular Image Gallery Instead of Slider */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    {carouselImages.map((image, index) => (
                      <Grid item xs={12} md={6} lg={4} key={image._id || index}>
                        <Paper 
                          elevation={1}
                          sx={{ 
                            borderRadius: 2, 
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box 
                            sx={{ 
                              position: 'relative',
                              height: 240,
                              width: '100%'
                            }}
                          >
                            <img
                              src={`${API_BASE_URL}${image.path}`}
                              alt={image.caption || `Carousel image ${index + 1}`}
                              style={{ 
                                width: '300px', 
                                height: '100%', 
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                p: 1.5
                              }}
                            >
                              <Typography variant="body2">
                                {image.caption || 'No caption'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ 
                            p: 1, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: alpha('#f5f5f5', 0.5)
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              Image {index + 1} of {carouselImages.length}
                            </Typography>
                            <Button 
                              size="small" 
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteImageClick(image)}
                              sx={{ 
                                fontSize: '0.8rem',
                                textTransform: 'none'
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Current Display Order:
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={(theme) => ({ backgroundColor: alpha(theme.palette.primary.main, 0.05) })}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', width: 80 }}>Order</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Image</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Caption</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.85rem', width: 100 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {carouselImages.map((image, index) => (
                        <TableRow key={image._id || index} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Chip 
                              label={`#${index + 1}`} 
                              size="small" 
                              sx={{ 
                                fontWeight: 600, 
                                height: 24, 
                                fontSize: '0.75rem'
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                component="img" 
                                src={`${API_BASE_URL}${image.path}`}
                                alt={`Thumbnail ${index + 1}`}
                                sx={{ 
                                  width: 50, 
                                  height: 50, 
                                  borderRadius: 1, 
                                  mr: 1,
                                  objectFit: 'cover'
                                }}
                              />
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                Image {index + 1}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {image.caption || <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No caption</Typography>}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteImageClick(image)}
                              sx={(theme) => ({ 
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                                },
                                p: 0.75
                              })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <CollectionsIcon sx={{ fontSize: '3rem', color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No carousel images have been uploaded yet.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Upload New Images */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <UploadIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
              Upload New Images
            </Typography>
            
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {filePreviewUrls.length > 0 ? 'Add More Images' : 'Select Images'}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files) {
                      // Don't replace existing files, add to them
                      const newFiles = Array.from(e.target.files);
                      
                      // Create new preview URLs
                      const newFilePreviewUrls = newFiles.map(file => URL.createObjectURL(file));
                      
                      // Add to existing files and previews
                      setSelectedFiles(prev => [...prev, ...newFiles]);
                      setFilePreviewUrls(prev => [...prev, ...newFilePreviewUrls]);
                      
                      // Extend the captions array with empty strings for new images
                      setCarouselCaptions(prev => [...prev, ...Array(newFiles.length).fill('')]);
                      
                      // Reset the file input value so the same file can be selected again if needed
                      e.target.value = '';
                    }
                  }}
                />
              </Button>
              
              {filePreviewUrls.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => {
                    setSelectedFiles([]);
                    setFilePreviewUrls([]);
                    setCarouselCaptions([]);
                  }}
                  sx={{ 
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Clear All
                </Button>
              )}
            </Box>
            
            {/* File Preview */}
            {filePreviewUrls.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 1.5 
                }}>
                  <Typography variant="subtitle2">
                    Selected Images: ({filePreviewUrls.length})
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {filePreviewUrls.map((url, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          position: 'relative'
                        }}
                      >
                        {/* X button to remove this specific image */}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            // Create new arrays without this image
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            const newPreviewUrls = filePreviewUrls.filter((_, i) => i !== index);
                            const newCaptions = carouselCaptions.filter((_, i) => i !== index);
                            
                            // Update state
                            setSelectedFiles(newFiles);
                            setFilePreviewUrls(newPreviewUrls);
                            setCarouselCaptions(newCaptions);
                          }}
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                            border: '1px solid',
                            borderColor: 'error.light'
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        
                        <CardMedia
                          component="img"
                          height="160"
                          image={url}
                          alt={`Preview ${index + 1}`}
                        />
                        <CardContent>
                          <TextField
                            label="Caption (optional)"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={carouselCaptions[index] || ''}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => uploadCarouselImages('append')}
                disabled={saving || selectedFiles.length === 0}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {saving ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : 'Add to Carousel'}
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RefreshIcon />}
                onClick={() => uploadCarouselImages('replace')}
                disabled={saving || selectedFiles.length === 0}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Replace All Images
              </Button>
            </Box>
          </Paper>
        </TabPanel>
        {/* Emergency Hotlines Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <LocalPhoneIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Emergency Hotlines
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact numbers displayed on the homepage for emergency situations.
              </Typography>
            </Box>
          </Box>
          
          {/* Current Hotlines */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <VisibilityIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
              Current Emergency Hotlines
            </Typography>
            
            {emergencyHotlines.length > 0 ? (
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={(theme) => ({ backgroundColor: alpha(theme.palette.primary.main, 0.05) })}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Contact Numbers</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emergencyHotlines.map((hotline, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{hotline.name}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {hotline.numbers.map((number, i) => (
                            <Chip
                              key={i}
                              label={number}
                              size="small"
                              icon={<LocalPhoneIcon sx={{ fontSize: '1rem !important' }} />}
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5, 
                                height: 24, 
                                fontSize: '0.75rem',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          ))}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => editHotline(index)}
                              sx={(theme) => ({ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                },
                                p: 0.75,
                                mr: 1
                              })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeHotline(index)}
                              sx={(theme) => ({ 
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                                },
                                p: 0.75
                              })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <LocalPhoneIcon sx={{ fontSize: '3rem', color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No emergency hotlines have been added yet.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Add/Edit Hotline */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                color: editingHotlineIndex >= 0 ? 'warning.main' : 'primary.main',
                fontWeight: 600
              }}
            >
              {editingHotlineIndex >= 0 ? (
                <EditIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              ) : (
                <AddIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              )}
              {editingHotlineIndex >= 0 ? 'Edit Hotline' : 'Add New Hotline'}
            </Typography>
            
            <Box>
              {/* Hotline Name Input */}
              <TextField
                label="Hotline Name"
                variant="outlined"
                fullWidth
                name="name"
                value={newHotline.name}
                onChange={(e) => handleHotlineChange(e)}
                margin="normal"
                placeholder="E.g., LB Bureau of Fire Protection"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
               
              {newHotline.numbers.map((number, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    label={`Phone Number ${index + 1}`}
                    variant="outlined"
                    fullWidth
                    name="numbers"
                    value={number}
                    onChange={(e) => handleHotlineChange(e, index)}
                    placeholder="E.g., 123-4567"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon fontSize="small" sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {newHotline.numbers.length > 1 && (
                    <IconButton 
                      color="error" 
                      onClick={() => removeHotlineNumber(index)}
                      sx={(theme) => ({ 
                        ml: 1,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.2),
                        },
                      })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
              
              {/* Add Another Number Button - On its own row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={addHotlineNumber}
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Add Another Number
                </Button>

                <Button
                  variant="contained"
                  color={editingHotlineIndex >= 0 ? 'warning' : 'primary'}
                  onClick={addHotline}
                  startIcon={editingHotlineIndex >= 0 ? <EditIcon /> : <AddIcon />}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  {editingHotlineIndex >= 0 ? 'Update Hotline' : 'Add Hotline'}
                </Button>

                {editingHotlineIndex >= 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setNewHotline({ name: '', numbers: [''] });
                      setEditingHotlineIndex(-1);
                    }}
                    startIcon={<CloseIcon />}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveEmergencyHotlines}
              disabled={saving}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save All Hotlines'}
            </Button>
          </Box>
        </TabPanel>
        {/* Map Location Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <LocationOnIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Map Location
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set the coordinates for the embedded Google Map displayed on the homepage.
              </Typography>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="latitude"
                  label="Latitude"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={mapCoordinates.latitude || ''}
                  onChange={handleMapCoordinateChange}
                  margin="normal"
                  InputProps={{ 
                    inputProps: { step: 0.0001 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <ExploreIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  helperText="Example: 14.1766"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="longitude"
                  label="Longitude"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={mapCoordinates.longitude || ''}
                  onChange={handleMapCoordinateChange}
                  margin="normal"
                  InputProps={{ 
                    inputProps: { step: 0.0001 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <ExploreIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  helperText="Example: 121.2566"
                />
              </Grid>
              
              <Grid item xs={12} sx={{minWidth: '500px'}}>
                <Box sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: 400,
                  mb: 2
                }}>
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${mapCoordinates.latitude},${mapCoordinates.longitude}&z=15&output=embed`}
                    title="Google Map"
                  ></iframe>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Preview: The map as it will appear on the homepage
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveMapCoordinates}
              disabled={saving}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save Map Location'}
            </Button>
          </Box>
        </TabPanel>
        {/* Officials Tab */}
        <TabPanel value={tabValue} index={6}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <PeopleIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Barangay Officials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Information about officials displayed on the homepage.
              </Typography>
            </Box>
          </Box>
          
          {/* Current Officials */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              <VisibilityIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
              Current Officials
            </Typography>
            
            {officials.length > 0 ? (
              <Grid container spacing={2}>
                {officials.map((official, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)'
                        },
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: 200, 
                          position: 'relative',
                          backgroundColor: 'grey.100'
                        }}
                      >
                        {official.imageUrl ? (
                          <img
                            src={`${API_BASE_URL}${official.imageUrl}`}
                            alt={official.name}
                            style={{ 
                              width: '200px', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                            }}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              height: '100%'
                            }}
                          >
                            <PersonIcon sx={{ fontSize: '5rem', color: 'text.disabled' }} />
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '1rem',
                            mb: 0.5
                          }}
                        >
                          {official.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {official.position}
                        </Typography>
                      </CardContent>
                      <CardActions 
                        sx={{ 
                          backgroundColor: alpha('#f5f5f5', 0.5),
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          justifyContent: 'center'
                        }}
                      >
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => editOfficial(index)}
                          sx={{ 
                            fontSize: '0.8rem',
                            textTransform: 'none'
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => removeOfficial(index)}
                          sx={{ 
                            fontSize: '0.8rem',
                            textTransform: 'none'
                          }}
                        >
                          Remove
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <PeopleIcon sx={{ fontSize: '3rem', color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No officials have been added yet.
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Add/Edit Official */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                color: editingOfficialIndex >= 0 ? 'warning.main' : 'primary.main',
                fontWeight: 600
              }}
            >
              {editingOfficialIndex >= 0 ? (
                <EditIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              ) : (
                <AddIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              )}
              {editingOfficialIndex >= 0 ? 'Edit Official' : 'Add New Official'}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  name="name"
                  value={newOfficial.name}
                  onChange={handleOfficialChange}
                  margin="normal"
                  size="small"
                  placeholder="Full name of official"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Position"
                  variant="outlined"
                  fullWidth
                  name="position"
                  value={newOfficial.position}
                  onChange={handleOfficialChange}
                  margin="normal"
                  size="small"
                  placeholder="e.g., Barangay Captain"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom
                  sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                >
                  Official Photo
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: 'background.paper'
                    }}
                  >
                    {officialImagePreview ? (
                      <img 
                        src={officialImagePreview} 
                        alt="Official preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : newOfficial.imageUrl ? (
                      <img 
                        src={`${API_BASE_URL}${newOfficial.imageUrl}`} 
                        alt="Current official" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/120?text=No+Image';
                        }}
                      />
                    ) : (
                      <PhotoIcon color="disabled" sx={{ fontSize: '3rem' }} />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<UploadIcon />}
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        mb: 1
                      }}
                    >
                      Upload Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleOfficialImageChange}
                      />
                    </Button>
                    
                    {(officialImagePreview || newOfficial.imageUrl) && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setSelectedOfficialImage(null);
                          setOfficialImagePreview('');
                          setNewOfficial({...newOfficial, imageUrl: ''});
                        }}
                        sx={{ 
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 500
                        }}
                      >
                        Remove Photo
                      </Button>
                    )}
                    
                    <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                      Recommended: Square image (1:1 ratio)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color={editingOfficialIndex >= 0 ? "warning" : "primary"}
                    onClick={addOfficial}
                    startIcon={editingOfficialIndex >= 0 ? <SaveIcon /> : <AddIcon />}
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    {editingOfficialIndex >= 0 ? 'Update Official' : 'Add Official'}
                  </Button>
                  {editingOfficialIndex >= 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setNewOfficial({ name: '', position: '', imageUrl: '' });
                        setEditingOfficialIndex(-1);
                        setOfficialImagePreview('');
                        setSelectedOfficialImage(null);
                      }}
                      startIcon={<CloseIcon />}
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveOfficials}
              disabled={saving || officials.length === 0}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save All Officials'}
            </Button>
          </Box>
        </TabPanel>
        {/* Footer Tab */}
        <TabPanel value={tabValue} index={7}>
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#000', 0.08),
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha('#f5f5f5', 0.5)
            }}
          >
            <VerticalAlignBottomIcon sx={{ mr: 2, color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Footer Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update the information displayed in the site footer.
              </Typography>
            </Box>
          </Box>
          
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Footer Title"
                  variant="outlined"
                  fullWidth
                  value={footerData.title || ''}
                  onChange={handleFooterDataChange}
                  margin="normal"
                  helperText="Title displayed in the footer (usually barangay name)"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{minWidth: '500px'}}>
                <TextField
                  name="description"
                  label="Footer Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={footerData.description || ''}
                  onChange={handleFooterDataChange}
                  margin="normal"
                  helperText="Brief description of the barangay or site"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <DescriptionIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={{minWidth: '300px'}}>
                <TextField
                  name="address"
                  label="Address"
                  variant="outlined"
                  fullWidth
                  value={footerData.address || ''}
                  onChange={handleFooterDataChange}
                  margin="normal"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  value={footerData.phone || ''}
                  onChange={handleFooterDataChange}
                  margin="normal"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={{minWidth: '320px'}}>
                <TextField
                  name="email"
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  value={footerData.email || ''}
                  onChange={handleFooterDataChange}
                  margin="normal"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Preview Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    borderRadius: 2, 
                    p: 3, 
                    mt: 1, 
                    backgroundColor: 'grey.900',
                    color: 'white'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'grey.400', fontWeight: 600, mb: 2 }}>
                    Footer Preview:
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    {footerData.title || 'BARANGAY MAAHAS'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'grey.400' }}>
                    {footerData.description || 'Your one-stop hub for essential barangay services and information.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'primary.light' }} />
                      <Typography variant="body2">
                        {footerData.address || 'Los Baños, Laguna, Philippines'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocalPhoneIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'primary.light' }} />
                      <Typography variant="body2">
                        {footerData.phone || '0926-935-6540'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'primary.light' }} />
                      <Typography variant="body2">
                        {footerData.email || 'barangaymaahas2@gmail.com'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveFooterData}
              disabled={saving}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : 'Save Footer Information'}
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={(theme) => ({ 
          backgroundColor: alpha(theme.palette.error.main, 0.05),
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          color: 'error.main',
          fontSize: '1.1rem'
        })}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Carousel Image
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            <AlertTitle sx={{ fontWeight: 600 }}>This action cannot be undone</AlertTitle>
            <Typography variant="body2">
              The image will be permanently removed from the carousel.
            </Typography>
          </Alert>
          {imageToDelete && (
            <Box 
              sx={{ 
                width: '100%', 
                height: 200, 
                overflow: 'hidden', 
                borderRadius: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <img 
                src={`${API_BASE_URL}${imageToDelete.path}`} 
                alt="Image to delete" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </Box>
          )}
          <DialogContentText sx={{ color: 'text.primary', fontWeight: 500 }}>
            Are you sure you want to delete this image?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={deleteCarouselImage} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Delete Image
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminManageHomepage;