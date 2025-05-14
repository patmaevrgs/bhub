import React, { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { TablePagination } from '@mui/material';

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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneIcon from '@mui/icons-material/Done';
import CommentIcon from '@mui/icons-material/Comment';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import API_BASE_URL from '../../../config';

// Tab panel component for the bookings tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Styled badge for calendar events
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

// Responsive Dialog wrapper
const ResponsiveDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    [theme.breakpoints.down('sm')]: {
      margin: '16px',
      width: 'calc(100% - 32px)',
      maxHeight: 'calc(100% - 32px)',
    },
  },
}));

const AdminAmbulance = () => {
  const calendarRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [needsApprovalCount, setNeedsApprovalCount] = useState(0);
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // Options: 'newest', 'oldest'

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [dieselDialogOpen, setDieselDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  
  // For pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Admin info for logging
  const [adminName, setAdminName] = useState('');

  // Handle calendar view change
  const handleCalendarViewChange = (view) => {
    setCalendarView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };
  
  // Get admin name from localStorage
  useEffect(() => {
    try {
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      
      if (firstName && lastName) {
        setAdminName(`${firstName} ${lastName}`);
      } else if (localStorage.getItem("fullName")) {
        setAdminName(localStorage.getItem("fullName"));
      } else {
        setAdminName(localStorage.getItem("user") || "Unknown Admin");
      }
    } catch (e) {
      console.error("Error getting admin name:", e);
      setAdminName("Unknown Admin");
    }
  }, []);
  
  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ambulance`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data);
      
      // Count bookings by status
      const pendingBookings = data.filter(booking => booking.status === 'pending');
      const bookedBookings = data.filter(booking => booking.status === 'booked');
      const needsApprovalBookings = data.filter(booking => booking.status === 'needs_approval');
      
      setPendingCount(pendingBookings.length);
      setBookedCount(bookedBookings.length);
      setNeedsApprovalCount(needsApprovalBookings.length);
      
      // Initialize filtered bookings based on current status filter
      if (statusFilter === '') {
        setFilteredBookings(data);
      } else {
        setFilteredBookings(data.filter(booking => booking.status === statusFilter));
      }
      
      // Reset search query when refreshing data
      setSearchQuery('');

      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);
  
  // filter bookings when search query changes
  useEffect(() => {
    if (bookings.length === 0) return;
    
    // Start with all bookings
    let filtered = [...bookings];
    
    // Apply tab filter first
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Pending
        filtered = filtered.filter(booking => booking.status === 'pending');
        break;
      case 2: // Booked
        filtered = filtered.filter(booking => booking.status === 'booked');
        break;
      case 3: // Needs Approval
        filtered = filtered.filter(booking => booking.status === 'needs_approval');
        break;
      case 4: // Completed
        filtered = filtered.filter(booking => booking.status === 'completed');
        break;
      case 5: // Cancelled
        filtered = filtered.filter(booking => booking.status === 'cancelled');
        break;
      default:
        break;
    }
    
    // Apply status filter if one is selected (overrides tab)
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.pickupDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === filterDate.getTime();
      });
    }
    
    // Apply search filter for both serviceId and patientName
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => {
        const matchesServiceId = booking.serviceId && booking.serviceId.toLowerCase().includes(query);
        const matchesPatientName = booking.patientName && booking.patientName.toLowerCase().includes(query);
        
        // Match either serviceId OR patientName
        return matchesServiceId || matchesPatientName;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.pickupDate);
      const dateB = new Date(b.pickupDate);
      
      if (sortOrder === 'newest') {
        return dateB - dateA; // Newest first (descending)
      } else {
        return dateA - dateB; // Oldest first (ascending)
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, tabValue, statusFilter, dateFilter, searchQuery, sortOrder]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Toggle calendar view
const toggleCalendar = () => {
  setShowCalendar(prev => !prev);
};

// Manual refresh of calendar
const handleRefreshCalendar = () => {
  if (showCalendar) {
    fetchCalendarData();
  }
};

  // Handle pagination changes
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFilter(null);
    setSearchQuery('');
    setSortOrder('newest');
    setPage(0); // Reset to first page
  };
  
  // Format booking for calendar
  const getCalendarEvents = () => {
    return bookings
      .filter(booking => booking.status === 'booked')
      .map(booking => {
        const startDateTime = new Date(`${format(new Date(booking.pickupDate), 'yyyy-MM-dd')}T${booking.pickupTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000)); // 2-hour duration
  
        return {
          id: booking._id,
          title: `${booking.patientName} - ${booking.destination}`,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          color: theme.palette.primary.main,
          extendedProps: { booking }
        };
      });
  };
  
  const BookingCard = ({ 
    booking, 
    onViewDetails, 
    onAccept, 
    onCancel, 
    onComplete,
    onDieselRequest,
    formatDate,
    getStatusColor,
    getStatusIcon,
    formatStatus,
    isMobile
  }) => {
    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '4px',
            bgcolor: theme => 
              booking.status === 'pending' ? theme.palette.warning.main : 
              booking.status === 'booked' ? theme.palette.success.main : 
              booking.status === 'cancelled' ? theme.palette.error.main : 
              booking.status === 'completed' ? theme.palette.primary.main : 
              booking.status === 'needs_approval' ? theme.palette.secondary.main : 
              theme.palette.grey[500]
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography 
                variant="subtitle1" 
                title={booking.patientName}
                sx={{ 
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '170px'
                }}
              >
                {booking.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {booking.serviceId || 'N/A'}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={formatStatus(booking.status)}
              color={getStatusColor(booking.status)}
              sx={{ 
                height: 24, 
                fontSize: '0.75rem',
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
              <Typography variant="body2">
                {formatDate(booking.pickupDate)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
              <Typography variant="body2">
                {booking.pickupTime} ({booking.duration})
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
              <Typography 
                variant="body2" 
                title={booking.destination}
                sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '90%'
                }}
              >
                To: {booking.destination}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
              <Typography variant="body2">
                {booking.contactNumber}
              </Typography>
            </Box>
          </Box>
          
          {booking.adminComment && (
            <Box sx={{ 
              mt: 1.5, 
              p: 1, 
              borderRadius: 1,
              bgcolor: 'background.default',
              borderLeft: '3px solid',
              borderColor: 'primary.light',
            }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}
              >
                Admin Comment:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical',
                  fontSize: '0.8rem'
                }}
              >
                {booking.adminComment}
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ 
          p: 2, 
          pt: 0,
          gap: 1, 
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
            onClick={onViewDetails}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.5,
              minWidth: 0,
            }}
          >
            View
          </Button>
          
          {booking.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Request Diesel Cost Coverage">
                <IconButton 
                  size="small" 
                  color="warning" 
                  onClick={onDieselRequest}
                  sx={{ p: 0.5 }}
                >
                  <LocalGasStationIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={onCancel}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minWidth: 0
                }}
              >
                Reject
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={onAccept}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minWidth: 0
                }}
              >
                Accept
              </Button>
            </Box>
          )}
          
          {booking.status === 'booked' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={onCancel}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minWidth: 0
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={onComplete}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minWidth: 0
                }}
              >
                Complete
              </Button>
            </Box>
          )}
          
          {booking.status === 'needs_approval' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={onCancel}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minWidth: 0
                }}
              >
                Reject
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={onAccept}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minWidth: 0
                }}
              >
                Accept
              </Button>
            </Box>
          )}
        </CardActions>
      </Card>
    );
  };

  // Handle calendar event click
  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps.booking);
    setDetailsDialogOpen(true);
  };
  
  // Update booking status
  const updateBookingStatus = async (id, status, comment = null, dieselCost = null) => {
    try {
      // Get admin ID from localStorage
      const adminId = localStorage.getItem('userId') || localStorage.getItem('user');
      
      // Get admin name
      const firstName = localStorage.getItem("firstName") || '';
      const lastName = localStorage.getItem("lastName") || '';
      const adminName = `${firstName} ${lastName}`;

      if (!adminId) {
        throw new Error('Admin ID not found. Please log in again.');
      }
      
      const updateData = { 
        status,
        adminId, // Include adminId in the request body
        adminName
      };
      
      if (comment !== null) updateData.adminComment = comment;
      if (dieselCost !== null) updateData.dieselCost = dieselCost;
      
      const response = await fetch(`${API_BASE_URL}/ambulance/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      // Refresh bookings
      fetchBookings();
      
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(error.message || 'Failed to update booking status');
      return false;
    }
  };
  
  // Helper function to get action type
  const getActionType = (action) => {
    switch (action) {
      case 'booked': return 'AMBULANCE_BOOKING_ACCEPTED';
      case 'cancelled': return 'AMBULANCE_BOOKING_CANCELLED';
      case 'completed': return 'AMBULANCE_BOOKING_COMPLETED';
      case 'needs_approval': return 'AMBULANCE_BOOKING_NEEDS_APPROVAL';
      default: return 'AMBULANCE_BOOKING_UPDATED';
    }
  };
  
  // Helper function to get action details
  const getActionDetails = (action, details) => {
    if (!selectedBooking) return '';
    
    let actionDetails = '';
    switch (action) {
      case 'booked':
        actionDetails = `Accepted ambulance booking ${selectedBooking.serviceId} for ${selectedBooking.patientName}`;
        break;
      case 'cancelled':
        actionDetails = `Cancelled ambulance booking ${selectedBooking.serviceId} for ${selectedBooking.patientName}`;
        break;
      case 'completed':
        actionDetails = `Marked ambulance booking ${selectedBooking.serviceId} as completed for ${selectedBooking.patientName}`;
        break;
      case 'needs_approval':
        actionDetails = `Requested diesel cost approval for ${selectedBooking.patientName}'s ambulance booking ${selectedBooking.serviceId}`;
        break;
      default:
        actionDetails = `Updated ambulance booking ${selectedBooking.serviceId} for ${selectedBooking.patientName}`;
    }
    
    if (details) {
      actionDetails += ` - ${details}`;
    }
    
    return actionDetails;
  };
  
  // Handle accepting a booking
  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(selectedBooking._id, 'booked');
    if (success) {
      setAcceptDialogOpen(false);
    }
  };
  
  // Handle cancelling a booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(
      selectedBooking._id, 
      'cancelled',
      adminComment || 'Cancelled by admin'
    );
    
    if (success) {
      setCancelDialogOpen(false);
      setAdminComment('');
    }
  };
  
  // Handle completing a booking
  const handleCompleteBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(selectedBooking._id, 'completed');
    if (success) {
      setCompleteDialogOpen(false);
    }
  };
  
  // Handle diesel cost request
  const handleDieselCostRequest = async () => {
    if (!selectedBooking) return;
    
    const success = await updateBookingStatus(
      selectedBooking._id,
      'needs_approval',
      adminComment || 'Please confirm if you can cover the diesel cost for this ambulance service.'
    );
    
    if (success) {
      setDieselDialogOpen(false);
      setAdminComment('');
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
  
  // Format date with relative terms
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        <DirectionsCarIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
        Ambulance Booking Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant={showCalendar ? "contained" : "outlined"}
          startIcon={<CalendarMonthIcon />}
          onClick={toggleCalendar}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.85rem'
          }}
        >
          {showCalendar ? 'List View' : 'Calendar View'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={showCalendar ? handleRefreshCalendar : fetchBookings}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          Refresh
        </Button>
      </Box>
    </Box>

    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}
    {/* Search and Filter */}
    <Paper 
      sx={{ 
        mb: 3, 
        p: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Search by Patient Name */}
        <Grid item xs={12} sm={6} md={4} sx={{minWidth:'310px'}}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Patient Name or Service ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
            }}
            sx={{ 
              '& .MuiInputBase-root': {
                borderRadius: 1.5,
              },
              minWidth: '250px'
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="Filter by Date"
            value={dateFilter}
            onChange={(newDate) => setDateFilter(newDate)}
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              }
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} sx={{minWidth:'120px'}}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ 
                borderRadius: 1.5,
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
              <MenuItem value="needs_approval">Needs Approval</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
          
        {/* Sort order - NEW! */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort by Date</InputLabel>
            <Select
              value={sortOrder}
              label="Sort by Date"
              onChange={(e) => setSortOrder(e.target.value)}
              sx={{ 
                borderRadius: 1.5,
              }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            fullWidth
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
    {/* Calendar View */}
    {showCalendar ? (
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          height: { xs: '450px', sm: '550px', md: '650px' },
          borderRadius: 2,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
          overflow: 'hidden' 
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CalendarMonthIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
            Ambulance Booking Calendar
          </Typography>
          
          {calendarLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Loading calendar...
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ height: 'calc(100% - 40px)' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: isMobile ? 'timeGridDay,timeGridWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={getCalendarEvents()}
            eventClick={handleEventClick}
            height="100%"
            eventDisplay="block"
            displayEventTime={true}
            displayEventEnd={true}
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
          />
        </Box>
      </Paper>
    ) : (
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.85rem',
                py: 1.5
              },
              '& .Mui-selected': {
                fontWeight: 600
              },
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  All Bookings
                  <Chip 
                    label={bookings.length} 
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'grey.600',
                      color: 'white'
                    }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Pending
                  <Chip 
                    label={pendingCount} 
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'warning.main',
                      color: 'white',
                      display: pendingCount > 0 ? 'flex' : 'none'
                    }}
                  />
                </Box>
              } 
            />
            <Tab label="Booked" />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Needs Approval
                  <Chip 
                    label={needsApprovalCount} 
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      display: needsApprovalCount > 0 ? 'flex' : 'none'
                    }}
                  />
                </Box>
              } 
            />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>
        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading bookings...
            </Typography>
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DirectionsCarIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No ambulance bookings found</Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 && "No bookings match your search criteria"}
              {tabValue === 1 && "There are no pending bookings"}
              {tabValue === 2 && "There are no active bookings"}
              {tabValue === 3 && "There are no bookings requiring approval"}
              {tabValue === 4 && "There are no completed bookings"}
              {tabValue === 5 && "There are no cancelled bookings"}
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ maxHeight: { xs: '450px', sm: '600px' } }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Service ID
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Patient
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Time
                    </TableCell>
                    {!isMobile && (
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Destination
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Contact
                      </TableCell>
                    )}
                    {tabValue === 0 && (
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                          fontSize: '0.8rem'
                        }}
                      >
                        Status
                      </TableCell>
                    )}
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                        fontSize: '0.8rem'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : filteredBookings
                  ).map((booking) => (
                    <TableRow 
                      key={booking._id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          bgcolor: '#f5f5f5',
                          width: 'fit-content',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                        }}>
                          {booking.serviceId || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              mr: 1, 
                              bgcolor: 'primary.light',
                              fontSize: '0.7rem'
                            }}
                          >
                            {booking.patientName ? 
                              booking.patientName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2) : 
                              'P'}
                          </Avatar>
                          {booking.patientName}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {formatDate(booking.pickupDate)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {booking.pickupTime}
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {booking.destination.length > 30
                            ? `${booking.destination.substring(0, 30)}...`
                            : booking.destination}
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {booking.contactNumber}
                        </TableCell>
                      )}
                      {tabValue === 0 && (
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          <Chip
                            label={formatStatus(booking.status)}
                            color={getStatusColor(booking.status)}
                            size="small"
                            sx={{ 
                              height: 24, 
                              fontSize: '0.75rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setDetailsDialogOpen(true);
                            }}
                            sx={{ 
                              borderRadius: 1.5,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              py: 0.5,
                              minWidth: 0,
                            }}
                          >
                            View
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Tooltip title="Request Diesel Cost Coverage">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setDieselDialogOpen(true);
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  <LocalGasStationIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelDialogOpen(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 0
                                }}
                              >
                                Reject
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setAcceptDialogOpen(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 0
                                }}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'booked' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelDialogOpen(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 0
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCompleteDialogOpen(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 0
                                }}
                              >
                                Complete
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'needs_approval' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelDialogOpen(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 0
                                }}
                              >
                                Reject
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setAcceptDialogOpen(true);
                                }}
                                sx={{ 
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 0
                                }}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              px: 2
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {filteredBookings.length > 0 ? 
                  `Showing ${Math.min(page * rowsPerPage + 1, filteredBookings.length)} to ${Math.min((page + 1) * rowsPerPage, filteredBookings.length)} of ${filteredBookings.length} bookings` : 
                  'No bookings found'}
              </Typography>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredBookings.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    fontSize: '0.75rem',
                    color: 'text.secondary'
                  },
                  '.MuiTablePagination-select': {
                    fontSize: '0.8rem'
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </Paper>
    )}
        {/* Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          {selectedBooking && (
            <>
              <DialogTitle sx={{ 
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsCarIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                  <Typography variant="h6" component="span">
                    Ambulance Booking Details
                  </Typography>
                  <Chip 
                    label={formatStatus(selectedBooking.status)} 
                    color={getStatusColor(selectedBooking.status)}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                <IconButton
                  aria-label="close"
                  onClick={() => setDetailsDialogOpen(false)}
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: alpha('#f5f5f5', 0.8),
                      color: 'text.primary'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </DialogTitle>
              <Box sx={{md:5}} />
              <DialogContent sx={{ px: 3, py: 2 }}>
                {/* Header info */}
                <Box sx={{ mb: 3 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: alpha('#e3f2fd', 0.3),
                      border: '1px solid',
                      borderColor: alpha('#2196f3', 0.1),
                      borderRadius: 2
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {format(new Date(selectedBooking.pickupDate), 'MMMM d, yyyy')} at {selectedBooking.pickupTime}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                          <Chip 
                            label={`Service ID: ${selectedBooking.serviceId || 'Processing...'}`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 28,
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                              borderRadius: 1,
                              bgcolor: '#f5f5f5'
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
                {/* Main content */}
                <Grid container spacing={3}>
                  {/* Left column */}
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <PersonIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                      Patient Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Patient Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.patientName}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Submitted By
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.bookedBy?.firstName} {selectedBooking.bookedBy?.lastName} ({selectedBooking.submitterRelation})
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Contact Number
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.contactNumber}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        pb: 1,
                        mt: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <DirectionsCarIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                      Ambulance Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Pickup Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {format(new Date(selectedBooking.pickupDate), 'MMMM d, yyyy')} ({formatDate(selectedBooking.pickupDate)})
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Pickup Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.pickupTime}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Duration
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.duration}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  {/* Right column */}
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <LocationOnIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                      Location Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Pickup Address
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.pickupAddress}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Destination
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedBooking.destination}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        pb: 1,
                        mt: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <LocalHospitalIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                      Emergency Details
                    </Typography>
                    
                    <Box sx={{ my: 2 }}>
                      <Typography variant="body1">
                        {selectedBooking.emergencyDetails}
                      </Typography>
                    </Box>
                    {selectedBooking.additionalNote && (
                      <Box sx={{ mt: 2 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            pb: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <NoteIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
                          Additional Notes
                        </Typography>
                        <Typography variant="body1">
                          {selectedBooking.additionalNote}
                        </Typography>
                      </Box>
                    )}
                    
                    {selectedBooking.adminComment && (
                      <Box sx={{ mt: 2 }}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: alpha('#f5f5f5', 0.7),
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                          }}
                        >
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'text.secondary',
                              fontSize: '0.8rem'
                            }}
                          >
                            <CommentIcon sx={{ mr: 1, fontSize: '1rem' }} />
                            Admin Comment
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                            {selectedBooking.adminComment}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ 
                px: 3, 
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setDieselDialogOpen(true);
                      }}
                      color="warning"
                      startIcon={<LocalGasStationIcon />}
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Diesel Cost
                    </Button>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setCancelDialogOpen(true);
                      }}
                      color="error"
                      variant="contained"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setAcceptDialogOpen(true);
                      }}
                      color="success"
                      variant="contained"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Accept
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'needs_approval' && (
                  <>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setCancelDialogOpen(true);
                      }}
                      color="error"
                      variant="contained"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setAcceptDialogOpen(true);
                      }}
                      color="success"
                      variant="contained"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Accept
                    </Button>
                  </>
                )}
                
                {selectedBooking.status === 'booked' && (
                  <>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setCancelDialogOpen(true);
                      }}
                      color="error"
                      variant="contained"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setCompleteDialogOpen(true);
                      }}
                      color="success"
                      variant="contained"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Mark Completed
                    </Button>
                  </>
                )}
                
                <Button 
                  onClick={() => setDetailsDialogOpen(false)} 
                  variant="outlined"
                  sx={{ 
                    ml: 1,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Accept Dialog */}
        <Dialog
          open={acceptDialogOpen}
          onClose={() => setAcceptDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <CheckCircleIcon sx={{ mr: 1.5, color: 'success.main' }} />
            Accept Ambulance Booking
          </DialogTitle>
          <Box sx={{md:5}} />
          <DialogContent sx={{ pt: 2 }}>
            <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
              Are you sure you want to accept this ambulance booking for {selectedBooking?.patientName}?
            </DialogContentText>
            
            {selectedBooking?.status === 'needs_approval' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                This booking has diesel cost approval from the resident.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setAcceptDialogOpen(false)}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptBooking} 
              color="success"
              variant="contained"
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Accept Booking
            </Button>
          </DialogActions>
        </Dialog>
        {/* Cancel Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <CancelIcon sx={{ mr: 1.5, color: 'error.main' }} />
            {selectedBooking?.status === 'pending' ? 'Reject' : 'Cancel'} Ambulance Booking
          </DialogTitle>
          <Box sx={{md:5}} />
          <DialogContent sx={{ pt: 2 }}>
            <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
              Are you sure you want to {selectedBooking?.status === 'pending' ? 'reject' : 'cancel'} this ambulance booking for {selectedBooking?.patientName}?
            </DialogContentText>
            
            <TextField
              autoFocus
              margin="normal"
              id="adminComment"
              label={`Reason for ${selectedBooking?.status === 'pending' ? 'Rejection' : 'Cancellation'}`}
              type="text"
              fullWidth
              multiline
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              required
              variant="outlined"
              size="small"
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: '0.9rem'
                }
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setCancelDialogOpen(false)}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Back
            </Button>
            <Button 
              onClick={handleCancelBooking} 
              color="error"
              variant="contained"
              disabled={!adminComment}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {selectedBooking?.status === 'pending' ? 'Reject' : 'Cancel'} Booking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog
          open={completeDialogOpen}
          onClose={() => setCompleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <CheckCircleIcon sx={{ mr: 1.5, color: 'success.main' }} />
            Mark Booking as Completed
          </DialogTitle>
          <Box sx={{md:5}} />
          <DialogContent sx={{ pt: 2 }}>
            <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
              Are you sure you want to mark this ambulance service for {selectedBooking?.patientName} as completed?
            </DialogContentText>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setCompleteDialogOpen(false)}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteBooking} 
              color="success"
              variant="contained"
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Mark as Completed
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diesel Cost Dialog */}
        <Dialog
          open={dieselDialogOpen}
          onClose={() => setDieselDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <LocalGasStationIcon sx={{ mr: 1.5, color: 'warning.main' }} />
            Request Diesel Cost Coverage
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
              Due to budget constraints, you need to ask the resident to cover the diesel cost for this ambulance service.
            </DialogContentText>
            
            <TextField
              autoFocus
              margin="normal"
              id="adminComment"
              label="Message to Resident"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Please confirm if you can cover the diesel cost for this ambulance service."
              variant="outlined"
              size="small"
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: '0.9rem'
                }
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setDieselDialogOpen(false)}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDieselCostRequest} 
              color="warning"
              variant="contained"
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Send Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default AdminAmbulance;