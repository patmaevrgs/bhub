import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  FormHelperText,
  Chip,
  Card,
  CardContent,
  CardActions,
  useMediaQuery
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMonths } from 'date-fns';

// Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const ResidentAmbulance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    pickupDate: null,
    pickupTime: null,
    duration: '',
    pickupAddress: '',
    contactNumber: '',
    destination: '',
    emergencyDetails: '',
    additionalNote: '',
    submitterRelation: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingConflict, setBookingConflict] = useState(false);
  
  // Dialog states
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDecisionDialog, setOpenDecisionDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [cancellationReason, setCancellationReason] = useState('');

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  // Get user ID and load data on component mount
  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserBookings(storedUserId);
    }
    fetchCalendarData();
  }, []);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Get current date and calculate 2 months later
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        // Use your existing ambulance-calendar endpoint
        const response = await fetch(`http://localhost:3002/ambulance-calendar?month=${month}&year=${year}&userType=resident`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch calendar data');
        }
        
        const data = await response.json();
        
        // Convert the bookings to calendar events
        const events = data.map(booking => {
          // Parse the date and time
          const bookingDate = new Date(booking.pickupDate);
          const [hours, minutes] = booking.pickupTime.split(':').map(Number);
          
          // Set the correct time on the date
          bookingDate.setHours(hours, minutes, 0, 0);
          
          // Calculate end time based on duration
          const endDate = new Date(bookingDate);
          let durationHours = 1; // Default 1 hour
          
          if (booking.duration === '1-2 hours') {
            durationHours = 2;
          } else if (booking.duration === '2-4 hours') {
            durationHours = 4;
          } else if (booking.duration === '4-6 hours') {
            durationHours = 6;
          } else if (booking.duration === '6+ hours') {
            durationHours = 8;
          }
          
          endDate.setHours(endDate.getHours() + durationHours);
          
          return {
            id: booking._id,
            title: 'Reserved', // No personal info shown
            start: bookingDate,
            end: endDate,
            backgroundColor: booking.status === 'booked' ? '#4caf50' : '#ff9800', // Green for booked, Orange for pending
            borderColor: booking.status === 'booked' ? '#2e7d32' : '#f57c00',
            textColor: '#ffffff'
          };
        });
        
        setCalendarEvents(events);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };
    
    if (showCalendar) {
      fetchCalendarData();
    }
  }, [showCalendar]);

  // Fetch calendar data to show booked dates
  const fetchCalendarData = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await fetch(`http://localhost:3002/ambulance-calendar?month=${month}&year=${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  // Fetch user's bookings
  const fetchUserBookings = async (userId) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`http://localhost:3002/ambulance?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setUserBookings(data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle date and time picker changes
  const handleDateChange = (date) => {
    setFormData({ ...formData, pickupDate: date });
    if (errors.pickupDate) {
      setErrors({ ...errors, pickupDate: null });
    }
  };

  const handleTimeChange = (time) => {
    setFormData({ ...formData, pickupTime: time });
    if (errors.pickupTime) {
      setErrors({ ...errors, pickupTime: null });
    }
  };

  // Check for booking conflicts
  const checkBookingConflict = async () => {
    try {
      if (!formData.pickupDate || !formData.pickupTime) {
        return false;
      }
      
      const formattedDate = format(formData.pickupDate, 'yyyy-MM-dd');
      const formattedTime = format(formData.pickupTime, 'HH:mm');
      
      const response = await fetch(
        `http://localhost:3002/ambulance-conflict?pickupDate=${formattedDate}&pickupTime=${formattedTime}&duration=${formData.duration}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check booking conflict');
      }
      
      const data = await response.json();
      setBookingConflict(data.hasConflict);
      return data.hasConflict;
    } catch (error) {
      console.error('Error checking booking conflict:', error);
      return false;
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.patientName) newErrors.patientName = 'Patient name is required';
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.pickupAddress) newErrors.pickupAddress = 'Pickup address is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (!formData.emergencyDetails) newErrors.emergencyDetails = 'Emergency details are required';
    if (!formData.submitterRelation) newErrors.submitterRelation = 'Your relation to the patient is required';
    
    // Validate date is not in the past
    if (formData.pickupDate && formData.pickupDate < new Date().setHours(0, 0, 0, 0)) {
      newErrors.pickupDate = 'Pickup date cannot be in the past';
    }
    
    // Validate time is within operating hours (6am to 9pm)
    if (formData.pickupTime) {
      const hours = formData.pickupTime.getHours();
      if (hours < 6 || hours >= 21) {
        newErrors.pickupTime = 'Pickup time must be between 6am and 9pm';
      }
    }

    // Validate contact number format (simple check)
    if (formData.contactNumber && !/^\d{10,11}$/.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number (10-11 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const hasConflict = await checkBookingConflict();
    if (hasConflict) {
      setBookingConflict(true);
      return;
    }
    
    setOpenConfirmDialog(true);
  };

  // Submit booking to server
  const submitBooking = async () => {
    setLoading(true);
    setBookingError(null);
    
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const formattedDate = format(formData.pickupDate, 'yyyy-MM-dd');
      const formattedTime = format(formData.pickupTime, 'HH:mm');
      
      const bookingData = {
        ...formData,
        pickupDate: formattedDate,
        pickupTime: formattedTime,
        userId: userId // Include userId in the request body
      };
      
      const response = await fetch('http://localhost:3002/ambulance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const data = await response.json();
      
      // Clear form and show success message
      setFormData({
        patientName: '',
        pickupDate: null,
        pickupTime: null,
        duration: '',
        pickupAddress: '',
        contactNumber: '',
        destination: '',
        emergencyDetails: '',
        additionalNote: '',
        submitterRelation: ''
      });
      
      setBookingSuccess(true);
      setOpenConfirmDialog(false);
      
      // Refresh bookings list
      fetchUserBookings(userId);
      fetchCalendarData();
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Handle diesel cost decision
  const handleDieselCostDecision = async (accept) => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId || !currentBooking) {
        throw new Error('Missing required data');
      }
      
      const response = await fetch(`http://localhost:3002/ambulance/${currentBooking._id}/resident-response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          acceptDieselCost: accept,
          userId: userId 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update response');
      }
      
      // Refresh bookings list
      fetchUserBookings(userId);
      setOpenDecisionDialog(false);
    } catch (error) {
      console.error('Error updating response:', error);
      setBookingError(error.message || 'Failed to update response');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async () => {
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      if (!userId || !currentBooking) {
        throw new Error('Missing required data');
      }
      
      const response = await fetch(`http://localhost:3002/ambulance/${currentBooking._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: userId,
          cancellationReason: cancellationReason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      // Show success message
      setBookingSuccess(true);
      
      // Refresh bookings list
      fetchUserBookings(userId);
      setOpenCancelDialog(false);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setBookingError(error.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'booked': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      case 'needs_approval': return 'secondary';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'booked': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'needs_approval': return <WarningIcon />;
      default: return null;
    }
  };

  // Format status text for display
  const formatStatus = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'booked': return 'Booked';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'needs_approval': return 'Needs Approval';
      default: return status;
    }
  };

  return (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ambulance Service
      </Typography>
      <Box sx={{ mb: 4 }} />
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 3 }, 
          borderRadius: 1,
          mb: 4
        }}
      >
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          justifyContent: 'space-between',
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                }}
              >
                Emergency Medical Transport
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                Request an ambulance for emergency situations
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<DirectionsCarIcon />}
            label="Emergency Service"
            color="primary"
            size="small"
            sx={{ height: 28 }}
          />
        </Box>

        {/* Information Card */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <AlertTitle>About Our Ambulance Service</AlertTitle>
          <Typography variant="body2">
            Barangay Maahas provides free ambulance service for residents in emergency situations. Our service aims to provide timely transport to medical facilities for urgent care needs.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
            <strong>Note:</strong> In the latter months of the year, due to budget constraints, residents may be requested to cover diesel costs.
          </Typography>
        </Alert>

        {/* Status Messages */}
        {bookingConflict && (
          <Alert 
            severity="error"
            sx={{ mb: 3 }}
          >
            <AlertTitle>Booking Conflict</AlertTitle>
            <Typography variant="body2">
              This time slot conflicts with an existing booking. The ambulance is already scheduled during this time window based on the requested duration. Please select a different date or time.
            </Typography>
          </Alert>
        )}
        
        {bookingSuccess && (
          <Alert 
            severity="success"
            sx={{ mb: 3 }}
          >
            <AlertTitle>Booking Successful</AlertTitle>
            <Typography variant="body2">
              Your ambulance booking has been submitted successfully! The admin will review your request.
            </Typography>
          </Alert>
        )}
        
        {bookingError && (
          <Alert 
            severity="error"
            sx={{ mb: 3 }}
          >
            <AlertTitle>Error</AlertTitle>
            <Typography variant="body2">
              {bookingError}
            </Typography>
          </Alert>
        )}
        {/* Booking Form */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
        >
          {/* Patient Information Section */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                component="h2" 
                sx={{ fontWeight: 600 }}
              >
                Patient Information
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Patient Full Name"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  error={!!errors.patientName}
                  helperText={errors.patientName}
                  InputLabelProps={{ shrink: true }}
                  placeholder="Enter patient's complete name"
                  size="small"
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '250px' // Adjust this value as needed
                  }}}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Relation to Patient"
                  name="submitterRelation"
                  value={formData.submitterRelation}
                  onChange={handleInputChange}
                  required
                  error={!!errors.submitterRelation}
                  helperText={errors.submitterRelation}
                  placeholder="e.g., Self, Parent, etc."
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '210px' // Adjust this value as needed
                  }}}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber || "For emergency communications"}
                  placeholder="e.g., 09XX-XXX-XXXX"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
          {/* Pickup Details Section */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <AccessTimeIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                component="h2" 
                sx={{ fontWeight: 600 }}
              >
                Pickup Details
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Pickup Date"
                  value={formData.pickupDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.pickupDate}
                      helperText={errors.pickupDate}
                      size="small"
                    />
                  )}
                  minDate={new Date()}
                  maxDate={addMonths(new Date(), 2)}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TimePicker
                  label="Pickup Time"
                  value={formData.pickupTime}
                  onChange={handleTimeChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.pickupTime}
                      helperText={errors.pickupTime || "Available from 6am to 9pm only"}
                      size="small"
                    />
                  )}
                  minTime={new Date(0, 0, 0, 6)} // 6:00 AM
                  maxTime={new Date(0, 0, 0, 21)} // 9:00 PM
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl 
                  fullWidth 
                  required 
                  error={!!errors.duration}
                  size="small"
                  sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '180px', sm: '180px', md: '180px' }
                  }}}
                >
                  <InputLabel>Estimated Duration</InputLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    label="Estimated Duration"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="1-2 hours">1-2 hours</MenuItem>
                    <MenuItem value="2-4 hours">2-4 hours</MenuItem>
                    <MenuItem value="4-6 hours">4-6 hours</MenuItem>
                    <MenuItem value="6+ hours">6+ hours</MenuItem>
                  </Select>
                  {errors.duration && <FormHelperText>{errors.duration}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Address"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  required
                  error={!!errors.pickupAddress}
                  helperText={errors.pickupAddress || "Enter complete address for the ambulance to pickup"}
                  multiline
                  rows={2}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mt: '-24px' }}>
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  error={!!errors.destination}
                  helperText={errors.destination || "Hospital name or complete address"}
                  placeholder="e.g., Healthserv Hospital, etc."
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '250px', sm: '250px', md: '270px' }
                  }}}
                />
              </Grid>
            </Grid>
          </Box>
          {/* Emergency Details Section */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <LocalHospitalIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                component="h2" 
                sx={{ fontWeight: 600 }}
              >
                Emergency Details
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Details of Emergency"
                  name="emergencyDetails"
                  value={formData.emergencyDetails}
                  onChange={handleInputChange}
                  required
                  error={!!errors.emergencyDetails}
                  helperText={errors.emergencyDetails || "Please provide information about the patient's condition"}
                  multiline
                  rows={3}
                  placeholder="Please describe the emergency situation or medical condition"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mt: '-40px' }}>
                        <NoteIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  name="additionalNote"
                  value={formData.additionalNote}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  placeholder="Any additional information we should know (optional)"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mt: '-24px' }}>
                        <NoteIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '250px' // Adjust this value as needed
                  }}}
                />
              </Grid>
            </Grid>
          </Box>
          
          {/* Terms and Action Buttons */}
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity="warning" 
              variant="outlined" 
              sx={{ mb: 3 }}
            >
              <AlertTitle>Important</AlertTitle>
              <Typography variant="body2">By submitting this form, you confirm that:</Typography>
              <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                <Typography component="li" variant="body2">
                  This is a genuine medical emergency requiring ambulance transport
                </Typography>
                <Typography component="li" variant="body2">
                  All information provided is accurate to the best of your knowledge
                </Typography>
                <Typography component="li" variant="body2">
                  You understand that ambulance service prioritization is based on emergency severity
                </Typography>
              </Box>
            </Alert>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2 
            }}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setFormData({
                    patientName: '',
                    pickupDate: null,
                    pickupTime: null,
                    duration: '',
                    pickupAddress: '',
                    contactNumber: '',
                    destination: '',
                    emergencyDetails: '',
                    additionalNote: '',
                    submitterRelation: ''
                  });
                  setErrors({});
                }}
              >
                Clear Form
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <LocalHospitalIcon />}
              >
                {loading ? 'Submitting...' : 'Request Ambulance'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      <Button
        variant="outlined"
        startIcon={<CalendarMonthIcon />}
        onClick={toggleCalendar}
        size="small"
        sx={{ mt: 3, mb: 2 }}
      >
        {showCalendar ? 'Hide Availability Calendar' : 'View Availability Calendar'}
      </Button>

      {showCalendar && (
        <Paper sx={{ p: 3, borderRadius: 1, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            pb: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600 }}
              >
                Ambulance Availability Calendar
              </Typography>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This calendar shows all existing ambulance reservations. Reserved time slots may not be available.
              No personal information is displayed to protect privacy.
            </Typography>
          </Alert>
          
          {/* Legend Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', mr: 0.5 }} />
              <Typography variant="caption">Booked</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800', mr: 0.5 }} />
              <Typography variant="caption">Pending</Typography>
            </Box>
          </Box>
          
          <Box sx={{ height: '450px' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              height="100%"
              slotMinTime="06:00:00"
              slotMaxTime="21:00:00"
            />
          </Box>
        </Paper>
      )}
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Ambulance Booking</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are requesting an ambulance for:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Patient</Typography>
                <Typography variant="body2">{formData.patientName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="primary.main">Date</Typography>
                <Typography variant="body2">
                  {formData.pickupDate && format(formData.pickupDate, 'MMMM d, yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="primary.main">Time</Typography>
                <Typography variant="body2">
                  {formData.pickupTime && format(formData.pickupTime, 'h:mm a')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Destination</Typography>
                <Typography variant="body2">{formData.destination || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              Barangay Maahas provides free ambulance service for emergencies, but in the latter months of the year, residents may need to cover diesel costs due to budget constraints.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenConfirmDialog(false)} 
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button 
            onClick={submitBooking} 
            color="primary" 
            variant="contained"
            size="small"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success Snackbar */}
      <Snackbar
        open={bookingSuccess}
        autoHideDuration={6000}
        onClose={() => setBookingSuccess(false)}
        message="Ambulance booking submitted successfully"
      />
    </Container>
  </LocalizationProvider>
);
}

export default ResidentAmbulance;