import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  FormControlLabel, 
  Checkbox,
  InputLabel, 
  MenuItem, 
  Select, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import InputAdornment from '@mui/material/InputAdornment';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import { format, parseISO, isAfter, addHours, isBefore, startOfDay } from 'date-fns';
import API_BASE_URL from '../../config';

function ResidentCourt() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservations, setReservations] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [eventInfoOpen, setEventInfoOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [formData, setFormData] = useState({
    representativeName: '',
    reservationDate: null,
    startTime: null,
    duration: '',
    contactNumber: '',
    purpose: '',
    numberOfPeople: '',
    additionalNotes: ''
  });
  
  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' }
  ];
  
  const peopleRangeOptions = [
    { value: '1-10', label: '1-10 people' },
    { value: '11-20', label: '11-20 people' },
    { value: '21-30', label: '21-30 people' },
    { value: '31-50', label: '31-50 people' },
    { value: '51-100', label: '51-100 people' },
    { value: '100+', label: 'More than 100 people' }
  ];
  
  const purposeOptions = [
    'Sports Activity',
    'Community Event',
    'Personal Celebration',
    'Meeting',
    'Practice Session',
    'Other'
  ];
  
  // Fetch user's court reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const userId = localStorage.getItem('user');
        
        if (!userId) return;
        
        const response = await fetch(`${API_BASE_URL}/court?userId=${userId}`, {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservations');
        }
        
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setError('Failed to load your reservations');
      }
    };
    
    fetchReservations();
  }, []);
  
  // Fetch calendar data
  useEffect(() => {
  const fetchCalendarData = async () => {
    try {
      const today = new Date();
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      
      const response = await fetch(`${API_BASE_URL}/court-calendar?start=${today.toISOString().split('T')[0]}&end=${threeMonthsLater.toISOString().split('T')[0]}`, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      
      const data = await response.json();
      
      // Process the event data to ensure it's properly formatted for all views
      const formattedEvents = data.map(event => ({
        ...event,
        id: event.id,
        title: event.title,
        start: event.start, // This should already be in ISO format from the API
        end: event.end,     // This should already be in ISO format from the API
        backgroundColor: event.status === 'approved' ? '#4caf50' : '#ff9800',
        borderColor: event.status === 'approved' ? '#4caf50' : '#ff9800',
        textColor: 'white',
        allDay: false // Set to false for time-based events in day/week views
      }));
      
      console.log('Formatted calendar events:', formattedEvents);
      setCalendarEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };
  
  if (showCalendar) {
    fetchCalendarData();
  }
}, [showCalendar]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle date and time pickers
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      reservationDate: date
    });
  };
  
  const handleTimeChange = (time) => {
    setFormData({
      ...formData,
      startTime: time
    });
  };

  // Check for time conflicts with existing reservations
  const checkTimeConflict = async () => {
    try {
      if (!formData.reservationDate || !formData.startTime || !formData.duration) {
        return false; // Can't check without complete data
      }
      
      const formattedDate = format(formData.reservationDate, 'yyyy-MM-dd');
      const formattedTime = format(formData.startTime, 'HH:mm');
      
      console.log('Checking conflict with:', {
        date: formattedDate,
        startTime: formattedTime,
        duration: formData.duration
      });
      
      const response = await fetch(
        `${API_BASE_URL}/court-conflict?date=${formattedDate}&startTime=${formattedTime}&duration=${formData.duration}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const data = await response.json();
      console.log('Conflict check result:', data);
      
      return data.hasConflict;
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return true; // Assume conflict on error (safer)
    }
  };

  // And update your handleSubmit function to properly call this:
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAgreed) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    // Validate form
    const requiredFields = ['representativeName', 'reservationDate', 'startTime', 'duration', 'contactNumber', 'purpose', 'numberOfPeople'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in all required fields`);
        return;
      }
    }
    
    // Check if date is in the past
    if (isBefore(formData.reservationDate, startOfDay(new Date()))) {
      setError('Cannot book reservations for past dates');
      return;
    }
    
    // Check for time conflicts
    setLoading(true);
    const hasTimeConflict = await checkTimeConflict();
    setLoading(false);
    
    if (hasTimeConflict) {
      setError('The selected time conflicts with an existing reservation. Please choose a different time.');
      return;
    }
    
    // Open confirmation dialog if no conflicts
    setConfirmDialogOpen(true);
  };
  
  // Submit reservation after confirmation
  const submitReservation = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    setError('');
  
    try {
      const userId = localStorage.getItem('user');
      
      console.log('User ID from localStorage:', userId);
      
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Format date and time
      const formattedData = {
        ...formData,
        userId: userId,
        reservationDate: format(formData.reservationDate, 'yyyy-MM-dd'),
        startTime: format(formData.startTime, 'HH:mm')
      };
      
      console.log('Submitting reservation data:', formattedData);
      
      const response = await fetch(`${API_BASE_URL}/court`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit reservation');
      }
      
      // Success handling
      setReservations([responseData.reservation, ...reservations]);
      setSuccess('Court reservation submitted successfully!');
      
      // Reset form
      setFormData({
        representativeName: '',
        reservationDate: null,
        startTime: null,
        duration: '',
        contactNumber: '',
        purpose: '',
        numberOfPeople: '',
        additionalNotes: ''
      });
      
      setTermsAgreed(false);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setError(error.message || 'Failed to submit reservation');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel reservation
  const handleCancelReservation = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/court/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: localStorage.getItem('user') // Send user ID in the request body
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to cancel reservation');
      }
      
      // Update local state
      setReservations(reservations.map(res => 
        res._id === id ? { ...res, status: 'cancelled' } : res
      ));
      
      setSuccess('Reservation cancelled successfully');
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError(error.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };
  
  // View reservation details
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Calculate payment information based on selected time
  const calculatePayment = () => {
    if (!formData.startTime) return 'Free';
    
    const hour = formData.startTime.getHours();
    if (hour >= 18) {
      return formData.duration ? `₱${200 * formData.duration} (₱200/hour after 6PM)` : 'Rate: ₱200/hour after 6PM';
    }
    
    return 'Free (Morning hours)';
  };
  
  // Toggle calendar view
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  
  return (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Court Reservation
      </Typography>
      <Box sx={{ mb: 4 }} />
      {/* <Grid container spacing={3}> */}
        {/* Booking Form */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 1
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 0.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <EventAvailableIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600 }}
              >
                Book the Barangay Maahas Covered Court
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                The covered court is available for sports activities, community events, and other gatherings. 
                Reservation is required to ensure availability.
              </Typography>
            </Alert>
            
            <Box component="form" noValidate>
              <TextField
                margin="dense"
                required
                fullWidth
                id="representativeName"
                label="Representative Full Name"
                name="representativeName"
                value={formData.representativeName}
                onChange={handleInputChange}
                size="small"
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Reservation Date *"
                    value={formData.reservationDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required size="small" />}
                    disablePast
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Start Time *"
                    value={formData.startTime}
                    onChange={handleTimeChange}
                    renderInput={(params) => <TextField {...params} fullWidth required size="small" />}
                    minutesStep={30}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel id="duration-label">Duration</InputLabel>
                    <Select
                      labelId="duration-label"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      label="Duration"
                    >
                      {durationOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="contactNumber"
                    label="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    size="small"
                    placeholder="e.g., 09XX-XXX-XXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mb: 0.5 }} />
              <FormControl fullWidth margin="dense" required size="small">
                <InputLabel id="purpose-label">Purpose of Reservation</InputLabel>
                <Select
                  labelId="purpose-label"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  label="Purpose of Reservation"
                >
                  {purposeOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense" required size="small">
                <InputLabel id="people-label">Estimated Number of People</InputLabel>
                <Select
                  labelId="people-label"
                  id="numberOfPeople"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleInputChange}
                  label="Estimated Number of People"
                >
                  {peopleRangeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="dense"
                fullWidth
                id="additionalNotes"
                label="Additional Notes"
                name="additionalNotes"
                multiline
                rows={2}
                value={formData.additionalNotes}
                onChange={handleInputChange}
                size="small"
              />
              <Paper 
                variant="outlined" 
                sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}
              >
                <Typography variant="subtitle2" gutterBottom color="primary.main">
                  Payment Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Rate: {calculatePayment()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Payment will be collected face-to-face on the day of your reservation. 
                  Court usage is free before 6PM. Night usage (after 6PM) has a fee of ₱200/hour to cover lighting costs.
                </Typography>
              </Paper>
              
              <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  By checking the box below, you agree to:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, fontSize: '0.8rem' }}>
                  <Typography component="li" variant="body2">
                    Keep the venue clean and properly dispose of waste
                  </Typography>
                  <Typography component="li" variant="body2">
                    Be responsible for any damages during your reservation
                  </Typography>
                  <Typography component="li" variant="body2">
                    Respect the time limits of your booking
                  </Typography>
                  <Typography component="li" variant="body2">
                    Follow all barangay regulations for public spaces
                  </Typography>
                </Box>
              </Alert>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the terms and conditions
                  </Typography>
                }
                sx={{ mt: 1 }}
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  {success}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => {
                    setFormData({
                      representativeName: '',
                      reservationDate: null,
                      startTime: null,
                      duration: '',
                      contactNumber: '',
                      purpose: '',
                      numberOfPeople: '',
                      additionalNotes: ''
                    });
                    setTermsAgreed(false);
                  }}
                >
                  Clear Form
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                  {loading ? 'Submitting...' : 'Submit Reservation'}
                </Button>
              </Box>
            </Box>
          </Paper>
          
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={toggleCalendar}
            size="small"
            sx={{ mt: 3 }}
          >
            {showCalendar ? 'Hide Availability Calendar' : 'View Availability Calendar'}
          </Button>
        </Grid>
        <Box sx={{ mb: 3 }} />
        {/* Calendar Section */}
        <Grid item xs={12} md={6}>
          {showCalendar ? (
            <Paper sx={{ p: 3, height: '100%', borderRadius: 1 }}>
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
                    Court Availability Calendar
                  </Typography>
                </Box>
                <Button 
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => setEventInfoOpen(true)}
                  sx={{ height: 28 }}
                >
                  Legend
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  This calendar shows all existing court reservations. Select different views (month/week/day) 
                  to check availability before making your booking.
                </Typography>
              </Alert>
              
              {/* Legend Section */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', mr: 0.5 }} />
                  <Typography variant="caption">Approved</Typography>
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
                  slotMaxTime="22:00:00"
                  eventDisplay="block"    
                  displayEventTime={true}  
                  displayEventEnd={true}
                  allDaySlot={false}   
                />
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, height: '100%', borderRadius: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <InfoIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600 }}
                >
                  Court Reservation Guidelines
                </Typography>
              </Box>
              
              {/* Information Cards */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" paragraph>
                  The Barangay Maahas Covered Court is available for various community activities. 
                  Please review these guidelines before making a reservation:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>
                        Operating Hours
                      </Typography>
                      <Typography variant="body2">
                        • Morning to Evening: 6:00 AM - 10:00 PM<br />
                        • Free usage: 6:00 AM - 6:00 PM<br />
                        • With fee (₱200/hour): 6:00 PM - 10:00 PM
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>
                        Reservation Policies
                      </Typography>
                      <Typography variant="body2">
                        • Advance booking is required for all usage<br />
                        • Maximum reservation duration: 4 hours per booking<br />
                        • Reservations can be made up to 3 months in advance<br />
                        • Priority given to barangay-sponsored events
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>
                        Facilities Available
                      </Typography>
                      <Typography variant="body2">
                        • Basketball court with standard markings<br />
                        • Basic seating for spectators<br />
                        • Lighting system for night games<br />
                        • Public restrooms nearby
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}
        </Grid>
      {/* </Grid> */}
      {/* Dialogs */}
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventAvailableIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Reservation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please review your reservation details:
          </DialogContentText>
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="primary.main">Date</Typography>
                <Typography variant="body2">
                  {formData.reservationDate ? format(formData.reservationDate, 'MMMM d, yyyy') : ''}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="primary.main">Time</Typography>
                <Typography variant="body2">
                  {formData.startTime ? format(formData.startTime, 'h:mm a') : ''} ({formData.duration} hour{formData.duration > 1 ? 's' : ''})
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Representative</Typography>
                <Typography variant="body2">
                  {formData.representativeName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="primary.main">Purpose</Typography>
                <Typography variant="body2">
                  {formData.purpose}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="primary.main">Group Size</Typography>
                <Typography variant="body2">
                  {formData.numberOfPeople}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Payment</Typography>
                <Typography variant="body2">
                  {calculatePayment()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Alert severity="info" sx={{ mt: 2 }} variant="outlined">
            <Typography variant="body2">
              Once submitted, your reservation will be reviewed by the barangay staff. You'll receive a notification once it's approved.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} size="small">
            Cancel
          </Button>
          <Button onClick={submitReservation} variant="contained" size="small">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Calendar Info Dialog */}
      <Dialog
        open={eventInfoOpen}
        onClose={() => setEventInfoOpen(false)}
      >
        <DialogTitle>Calendar Legend</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The calendar shows all existing court reservations. Booked time slots are not available for reservation.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
              <Typography variant="body2">Approved Reservations</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ff9800', mr: 1 }} />
              <Typography variant="body2">Pending Reservations</Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              How to use the calendar:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Switch between Month, Week, and Day views using the buttons in the top-right</li>
              <li>Navigate between dates using the prev/next buttons</li>
              <li>Look for open time slots when planning your reservation</li>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventInfoOpen(false)} size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbars for feedback */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  </LocalizationProvider>
);
}
export default ResidentCourt;