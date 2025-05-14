import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import API_BASE_URL from '../../../config';

function RequestID() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    birthDate: null,
    emergencyContactName: '',
    emergencyContactNumber: ''
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Get user information from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setFormData(prevData => ({
        ...prevData,
        firstName: userInfo.firstName || '',
        middleName: userInfo.middleName || '',
        lastName: userInfo.lastName || '',
        address: userInfo.address || '',
        birthDate: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth) : null
      }));
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    setFormErrors({
      ...formErrors,
      [name]: ''
    });

    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormErrors({
      ...formErrors,
      birthDate: ''
    });

    setFormData({
      ...formData,
      birthDate: date
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.middleName) errors.middleName = 'Middle name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.birthDate) errors.birthDate = 'Date of birth is required';
    if (!formData.emergencyContactName) errors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactNumber) errors.emergencyContactNumber = 'Emergency contact number is required';
    
    // Validate phone number format
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (formData.emergencyContactNumber && !phoneRegex.test(formData.emergencyContactNumber)) {
      errors.emergencyContactNumber = 'Please enter a valid Philippine mobile number (e.g., 09XX-XXX-XXXX)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Open confirmation dialog
    setOpenConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setOpenConfirmDialog(false);
    
    try {
      const userId = localStorage.getItem('user');
      
      // Format birth date
      const formattedBirthDate = formData.birthDate ? format(new Date(formData.birthDate), 'MMM. dd, yyyy') : '';
      
      const requestData = {
        userId,
        documentType: 'barangay_id',
        formData: {
          firstName: formData.firstName.toUpperCase(),
          middleName: formData.middleName ? formData.middleName.toUpperCase() : '',
          lastName: formData.lastName.toUpperCase(),
          address: formData.address,
          birthDate: formattedBirthDate,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactNumber: formData.emergencyContactNumber
        },
        purpose: 'Barangay Identification Card'
      };
      
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Reset form after success
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          address: '',
          birthDate: null,
          emergencyContactName: '',
          emergencyContactNumber: ''
        });
        
        // Redirect to transactions page after 2 seconds
        setTimeout(() => {
          navigate('/resident/transactions');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit Barangay ID request');
      }
    } catch (err) {
      console.error('Error submitting Barangay ID request:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError('');
  };

  return (
  <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Barangay ID Request
      </Typography>
      <Box sx={{ mb: 4 }} />
      
      {/* Main Form Paper */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 1 }}>
        {/* Form Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <CardMembershipIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Barangay ID Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Fill out this form to request your Barangay ID. Please ensure all information is accurate.
            <strong> Important:</strong> Bring a 1x1 ID picture with white background when claiming your ID. 
            There is a processing fee of ₱50.00 payable at the Barangay Hall.
          </Typography>
        </Alert>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  error={!!formErrors.middleName}
                  helperText={formErrors.middleName}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address in Maahas"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address || "Enter your complete address in Barangay Maahas"}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 5143 Purok 2"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.birthDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!formErrors.birthDate}
                        helperText={formErrors.birthDate}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CakeIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
          
          {/* Emergency Contact Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Emergency Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  error={!!formErrors.emergencyContactName}
                  helperText={formErrors.emergencyContactName || "Person to contact in case of emergency"}
                  required
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ContactEmergencyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Number"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                  error={!!formErrors.emergencyContactNumber}
                  helperText={formErrors.emergencyContactNumber || "e.g., 09XX-XXX-XXXX"}
                  required
                  variant="outlined"
                  size="small"
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
          </Box>
          {/* Terms & Conditions */}
          <Alert 
            severity="warning" 
            variant="outlined" 
            sx={{ mb: 3 }}
          >
            <AlertTitle>Important</AlertTitle>
            <Typography variant="body2">
              By submitting this form, you confirm that:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, fontSize: '0.8rem' }}>
              <Typography component="li" variant="body2">
                All information provided is accurate and complete to the best of your knowledge
              </Typography>
              <Typography component="li" variant="body2">
                You are a resident of Barangay Maahas, Los Baños, Laguna
              </Typography>
              <Typography component="li" variant="body2">
                You understand that providing false information may result in rejection of your application
              </Typography>
              <Typography component="li" variant="body2">
                You will bring a 1x1 ID picture when claiming your Barangay ID
              </Typography>
            </Box>
          </Alert>
          
          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => {
                // Reset form to initial values from userInfo
                const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                setFormData({
                  firstName: userInfo.firstName || '',
                  middleName: userInfo.middleName || '',
                  lastName: userInfo.lastName || '',
                  address: userInfo.address || '',
                  birthDate: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth) : null,
                  emergencyContactName: '',
                  emergencyContactNumber: ''
                });
                setFormErrors({});
              }}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Information about Barangay ID */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <InfoIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            About Barangay ID
          </Typography>
        </Box>
        
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <VerifiedUserIcon color="primary" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Purpose and Benefits
                </Typography>
                <Typography variant="body2" paragraph>
                  The Barangay ID serves as an official government-issued identification card for residents of Barangay Maahas.
                  It can be used for various transactions within the barangay and municipality.
                </Typography>
                <Typography variant="body2">
                  Benefits include:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Proof of residency for local transactions</Typography>
                  <Typography component="li" variant="body2">Access to barangay services and programs</Typography>
                  <Typography component="li" variant="body2">Identification for emergency situations</Typography>
                  <Typography component="li" variant="body2">Secondary ID for various applications</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <DescriptionIcon color="primary" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Requirements and Process
                </Typography>
                <Typography variant="body2" paragraph>
                  After submitting this form, your request will be processed by the Barangay Maahas administration.
                </Typography>
                <Typography variant="body2">
                  Requirements for claiming your ID:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0 }}>
                  <Typography component="li" variant="body2">1x1 colored ID picture with white background</Typography>
                  <Typography component="li" variant="body2">Valid ID or proof of residency</Typography>
                  <Typography component="li" variant="body2">Payment of ₱50.00 processing fee</Typography>
                  <Typography component="li" variant="body2">Personal appearance for signature and verification</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              mt: 2, 
              p: 0, 
              bgcolor: 'info.lighter', 
              borderRadius: 1, 
              display: 'flex', 
              alignItems: 'flex-start' 
            }}>
              <AccessTimeIcon color="info" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2">
                  Processing Time
                </Typography>
                <Typography variant="body2">
                  Standard processing takes 1-2 working days. Please review your transactions to track the status of your request. You will be notified once your Barangay ID is ready for pickup.
                  Please bring the requirements mentioned above when claiming your ID at the Barangay Hall.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Frequently Asked Questions */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <HelpIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Frequently Asked Questions
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the Barangay ID valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The Barangay ID is typically valid until the end of the year from the date of issuance, depending on current barangay policies.
                  The expiration date will be printed on your ID. You will need to renew it before it expires to maintain its validity.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can someone else claim my Barangay ID for me?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  No, personal appearance is required when claiming your Barangay ID as you need to sign the ID in person.
                  This is to verify your identity and ensure the signature on the ID matches your actual signature.
                </Typography>
              </AccordionDetails>
            </Accordion>
          
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What if I need to update information on my Barangay ID?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If you need to update information on your Barangay ID (e.g., change of address within the barangay),
                  you will need to apply for a replacement ID. Submit a new application form with your updated information
                  and follow the same process as requesting a new ID.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Is there a fee for the Barangay ID?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, there is a processing fee of ₱50.00 for the Barangay ID. This fee covers the cost of materials,
                  printing, and lamination. The fee is payable at the Barangay Hall when you pick up your ID.
                  Please bring the exact amount to facilitate quick processing.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your Barangay ID request has been submitted successfully! Redirecting to transactions page...
        </Alert>
      </Snackbar>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog - Add this just before the closing </Box> tag */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CardMembershipIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Barangay ID Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Barangay ID application:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Name</Typography>
                <Typography variant="body2">
                  {`${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Address</Typography>
                <Typography variant="body2">{formData.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary.main">Date of Birth</Typography>
                <Typography variant="body2">
                  {formData.birthDate ? format(new Date(formData.birthDate), 'MMMM d, yyyy') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary.main">Emergency Contact</Typography>
                <Typography variant="body2">
                  {formData.emergencyContactName} ({formData.emergencyContactNumber})
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Important Reminders:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <Typography component="li" variant="body2">
                You must bring a 1x1 ID picture with white background when claiming your ID
              </Typography>
              <Typography component="li" variant="body2">
                There is a processing fee of ₱50.00 payable at the Barangay Hall
              </Typography>
              <Typography component="li" variant="body2">
                Personal appearance is required when claiming your ID
              </Typography>
            </Box>
          </Alert>
          
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              Your Barangay ID application will be processed within 1-2 working days. You will be notified when it's ready for pickup.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenConfirmDialog(false)} 
            variant="outlined"
            size="small"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmSubmit} 
            color="primary" 
            variant="contained"
            size="small"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Confirm & Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Container>
);
}

export default RequestID;