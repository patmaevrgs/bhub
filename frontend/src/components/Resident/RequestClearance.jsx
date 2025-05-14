import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import WcIcon from '@mui/icons-material/Wc';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CreateIcon from '@mui/icons-material/Create';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';

function RequestClearance() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    address: '',
    purpose: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Submission state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Gender options
  const genderOptions = ['Male', 'Female'];
  
  // Purpose options
  const purposeOptions = [
    'LOCAL EMPLOYMENT',
    'BANK REQUIREMENT',
    'POLICE CLEARANCE',
    'NBI CLEARANCE',
    'SCHOLARSHIP',
    'SCHOOL REQUIREMENT',
    'TRAVEL REQUIREMENT',
    'BUSINESS PERMIT',
    'LOAN APPLICATION',
    'OTHER'
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field being updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = ['fullName', 'gender', 'address', 'purpose'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // If purpose is OTHER, check if custom purpose is provided
    if (formData.purpose === 'OTHER' && !formData.customPurpose) {
      newErrors.customPurpose = 'Please specify the purpose';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    // Open confirmation dialog instead of submitting directly
    setOpenConfirmDialog(true);
  };

  //for submitting after confirmation
  const confirmSubmit = async () => {
    setLoading(true);
    
    try {
      // If purpose is OTHER and we have a custom purpose, use that instead
      const finalPurpose = formData.purpose === 'OTHER' && formData.customPurpose
        ? formData.customPurpose
        : formData.purpose;
      
      // Create submission data
      const submissionData = {
        userId,
        documentType: 'barangay_clearance',
        formData: {
          ...formData,
          fullName: formData.fullName.toUpperCase(), // Ensure name is in uppercase
          gender: formData.gender.toLowerCase() // lowercase for controller logic
        },
        purpose: finalPurpose
      };
      
      // Remove customPurpose from formData if it exists
      if (submissionData.formData.customPurpose) {
        delete submissionData.formData.customPurpose;
      }
      
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }
      
      setSnackbar({
        open: true,
        message: 'Barangay Clearance request submitted successfully!',
        severity: 'success'
      });
      
      // Close dialog
      setOpenConfirmDialog(false);
      
      // Redirect to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setSnackbar({
        open: true,
        message: `Failed to submit request: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
  <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Barangay Clearance Request
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
          <VerifiedIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Barangay Clearance Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Fill out this form to request your Barangay Clearance. This document certifies that you have no derogatory record in the barangay and are of good moral character.
            There is a processing fee of ₱70.00 payable at the Barangay Hall when claiming your clearance.
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  error={!!errors.fullName}
                  helperText={errors.fullName || "Enter your complete name"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  required 
                  error={!!errors.gender}
                  size="small"
                >
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                    startAdornment={
                      <InputAdornment position="start">
                        <WcIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.gender && (
                    <FormHelperText>{errors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address Details"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  error={!!errors.address}
                  helperText={errors.address || "Enter your specific address in Barangay Maahas"}
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
            </Grid>
          </Box>
          
          {/* Purpose Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Purpose of Request
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={!!errors.purpose}
                  size="small"
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '215px' // Adjust this value as needed
                  }}}
                >
                  <InputLabel id="purpose-label">Purpose</InputLabel>
                  <Select
                    labelId="purpose-label"
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    label="Purpose"
                    startAdornment={
                      <InputAdornment position="start">
                        <AssignmentIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {purposeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.purpose && (
                    <FormHelperText>{errors.purpose}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Custom Purpose - Only shown if 'OTHER' is selected */}
              {formData.purpose === 'OTHER' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specify Purpose"
                    name="customPurpose"
                    value={formData.customPurpose || ''}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                    error={!!errors.customPurpose}
                    helperText={errors.customPurpose || "Please specify the purpose for your clearance request"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreateIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
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
                You understand that providing false information may result in rejection of your application
              </Typography>
              <Typography component="li" variant="body2">
                You are a resident of Barangay Maahas, Los Baños, Laguna
              </Typography>
              <Typography component="li" variant="body2">
                You agree to pay the ₱70.00 processing fee when claiming your clearance
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
                setFormData({
                  fullName: '',
                  gender: '',
                  address: '',
                  purpose: '',
                  customPurpose: ''
                });
                setErrors({});
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
      
      {/* Information about Barangay Clearance */}
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
            About Barangay Clearance
          </Typography>
        </Box>
        
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <VerifiedUserIcon color="primary" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Purpose and Benefits
                </Typography>
                <Typography variant="body2" paragraph>
                  A Barangay Clearance is an official document certifying that you have no derogatory record 
                  in the barangay and are of good moral character and reputation.
                </Typography>
                <Typography variant="body2">
                  This document is commonly used for:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Local employment requirements</Typography>
                  <Typography component="li" variant="body2">Business permit applications</Typography>
                  <Typography component="li" variant="body2">Police and NBI clearance requirements</Typography>
                  <Typography component="li" variant="body2">Bank transactions and loan applications</Typography>
                  <Typography component="li" variant="body2">School and scholarship applications</Typography>
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
                  Requirements for claiming your clearance:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0 }}>
                  <Typography component="li" variant="body2">Valid ID or proof of residency</Typography>
                  <Typography component="li" variant="body2">Payment of the ₱70.00 processing fee</Typography>
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
                  Standard processing only takes a day. You will be notified once your Barangay Clearance is ready for pickup.
                  Please bring a valid ID and ₱70.00 for the processing fee when claiming your clearance at the Barangay Hall.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Frequently Asked Questions */}
      <Paper elevation={3} sx={{ p: 3 }}>
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is a Barangay Clearance valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  A Barangay Clearance is typically valid for 6 months from the date of issuance, unless otherwise specified
                  for a particular purpose. Some institutions may require a more recent clearance, so it's advisable to check
                  with the requiring party about their specific validity requirements.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can someone else claim my Barangay Clearance for me?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  In general, personal appearance is required when claiming your Barangay Clearance. However, in certain
                  circumstances, you may authorize someone to claim it on your behalf through an authorization letter and
                  a copy of your valid ID. The authorized person must also present their own valid ID.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What if I have a pending case in the barangay?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If you have a pending case in the barangay, your clearance application may be put on hold until the
                  case is resolved. It's advisable to settle any pending issues with the barangay before applying for a clearance.
                  You can consult with the Barangay Secretary for guidance on how to proceed with your specific situation.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can I request multiple copies of my Barangay Clearance?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, you can request multiple copies of your Barangay Clearance. Each copy will require a separate payment
                  of the processing fee. When submitting your application, you can specify the number of copies you need, or
                  you can submit separate applications for each copy you require.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VerifiedIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Barangay Clearance Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Barangay Clearance request:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Full Name</Typography>
                <Typography variant="body2">{formData.fullName.toUpperCase() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary.main">Gender</Typography>
                <Typography variant="body2">{formData.gender || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary.main">Address</Typography>
                <Typography variant="body2">{formData.address || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Purpose</Typography>
                <Typography variant="body2">
                  {formData.purpose === 'OTHER' ? formData.customPurpose : formData.purpose || 'N/A'}
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
                There is a ₱70.00 processing fee payable at the Barangay Hall
              </Typography>
              <Typography component="li" variant="body2">
                Please bring a valid ID when claiming your clearance
              </Typography>
              <Typography component="li" variant="body2">
                Processing typically takes 1 working day
              </Typography>
            </Box>
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
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  </Container>
);
}

  
export default RequestClearance;