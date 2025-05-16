import React, { useState } from 'react';
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
  MenuItem,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  AlertTitle,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EngineeringIcon from '@mui/icons-material/Engineering';
import BusinessIcon from '@mui/icons-material/Business';
import StraightenIcon from '@mui/icons-material/Straighten';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';

function RequestDigging() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Personal details
    fullName: '',
    address: '',
    
    // Digging details
    diggingPurpose: 'water_supply',
    companyName: '',
    applicationDetails: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add validation if needed
    if (!formData.fullName || !formData.address || !formData.companyName || 
        !formData.applicationDetails) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Open confirmation dialog
    setOpenConfirmDialog(true);
  };

  // new function to handle submission after confirmation
  const confirmSubmit = async () => {
    setLoading(true);

    // Create purpose string based on selection
    let purposeText = '';
    let applicationText = '';
    
    if (formData.diggingPurpose === 'water_supply') {
      purposeText = `to dig across the road for their water supply as required by the ${formData.companyName}`;
      applicationText = `in connection with ${formData.applicationDetails}`;
    } else if (formData.diggingPurpose === 'electrical') {
      purposeText = `to dig across the road for electrical connections as required by the ${formData.companyName}`;
      applicationText = `in connection with ${formData.applicationDetails}`;
    } else if (formData.diggingPurpose === 'drainage') {
      purposeText = `to dig for drainage system installation as required by the ${formData.companyName}`;
      applicationText = `in connection with ${formData.applicationDetails}`;
    } else {
      purposeText = formData.diggingPurpose;
      applicationText = `in connection with ${formData.applicationDetails}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentType: 'digging_permit',
          formData: {
            fullName: formData.fullName,
            address: formData.address,
            diggingPurpose: formData.diggingPurpose,
            companyName: formData.companyName,
            applicationDetails: formData.applicationDetails,
            purposeText: purposeText,
            applicationText: applicationText
          },
          purpose: purposeText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit digging permit request');
      }

      // Close dialog
      setOpenConfirmDialog(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your digging permit request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        fullName: '',
        address: '',
        diggingPurpose: 'water_supply',
        companyName: '',
        applicationDetails: '',
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting digging permit request:', error);
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
    setSnackbar({ ...snackbar, open: false });
  };

  return (
  <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Digging Permit Request
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
          <StraightenIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Digging Permit Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting a Barangay Digging Permit, which authorizes you to dig across roads or public areas within 
            the barangay for utility connections, drainage systems, or other approved purposes. This permit helps ensure that 
            digging activities are properly documented and monitored for public safety.
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
              <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., JUAN M. DELA CRUZ"
                  helperText="Your complete name with middle initial if applicable (preferably in UPPERCASE)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                <TextField
                  fullWidth
                  label="Complete Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Purok 2, Sampalukan"
                  helperText="Your specific location within Barangay Maahas, Los Baños, Laguna"
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
          
          {/* Digging Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Digging Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                <FormControl 
                  fullWidth 
                  required
                  size="small"
                >
                  <InputLabel id="digging-purpose-label">Digging Purpose</InputLabel>
                  <Select
                    labelId="digging-purpose-label"
                    name="diggingPurpose"
                    value={formData.diggingPurpose}
                    onChange={handleChange}
                    label="Digging Purpose"
                    startAdornment={
                      <InputAdornment position="start">
                        <EngineeringIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="water_supply">Water Supply Connection</MenuItem>
                    <MenuItem value="electrical">Electrical Connection</MenuItem>
                    <MenuItem value="drainage">Drainage System</MenuItem>
                    <MenuItem value="other">Other (Please specify in Connection Details)</MenuItem>
                  </Select>
                  <FormHelperText>
                    Primary purpose for the digging activity
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} sx={{minWidth: {xs: '100%', sm: '100%', md: '410px'}}}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Laguna Aquatech Resources Corporation (LARC)"
                  helperText="Name of the company requiring or overseeing the work"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
                <TextField
                  fullWidth
                  label="Connection/Application Details"
                  name="applicationDetails"
                  value={formData.applicationDetails}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., LARC Water Connection Application"
                  helperText="Specific details about this application (application number, project name, etc.)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          
          {/* Required Documents */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Required Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start', fontWeight: 500 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 20, mt: 0.3 }} />
                Please bring the following documents when claiming your permit:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 0, mt: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Valid ID (original and photocopy)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Approval letter or application form from the utility company (LARC, Meralco, etc.)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Simple sketch or diagram of the proposed digging location
                </Typography>
                <Typography component="li" variant="body2">
                  Authorization letter (if the requestor is not the property owner)
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Terms & Conditions */}
          <Alert 
            severity="warning" 
            variant="outlined" 
            sx={{ mb: 3 }}
          >
            <AlertTitle>Important</AlertTitle>
            <Typography variant="body2">
              By submitting this form, you agree to:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, fontSize: '0.8rem' }}>
              <Typography component="li" variant="body2">
                Ensure all information provided is accurate and complete
              </Typography>
              <Typography component="li" variant="body2">
                Install proper safety barriers and signage around the digging area
              </Typography>
              <Typography component="li" variant="body2">
                Restore the road or public area to its original condition after work completion
              </Typography>
              <Typography component="li" variant="body2">
                Complete the work within the timeframe specified in this application
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
                  address: '',
                  diggingPurpose: 'water_supply',
                  companyName: '',
                  applicationDetails: '',
                });
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
      
      {/* About Digging Permit */}
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
            About Digging Permit
          </Typography>
        </Box>
        
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <DescriptionIcon color="primary" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Purpose and Benefits
                </Typography>
                <Typography variant="body2" paragraph>
                  A Barangay Digging Permit is an official document that authorizes individuals or companies to perform digging activities on public roads or areas within the barangay jurisdiction.
                </Typography>
                <Typography variant="body2">
                  This permit is necessary for:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Water supply connections</Typography>
                  <Typography component="li" variant="body2">Electrical line installations</Typography>
                  <Typography component="li" variant="body2">Drainage system construction</Typography>
                  <Typography component="li" variant="body2">Telecommunication cable laying</Typography>
                  <Typography component="li" variant="body2">Other utility connection works</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              mt: 0, 
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
                  Standard processing takes 1-2 working days. You will be notified once your Digging Permit is ready for pickup.
                  Please bring the essential documents when claiming your permit at the Barangay Hall and be prepared to pay the required fees.
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the Digging Permit valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The Digging Permit is typically valid for 30 days from the date of issuance. If your project 
                  exceeds this timeframe, you will need to apply for an extension at the Barangay Hall.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Is there a fee for obtaining a Digging Permit?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, there is a processing fee for the Digging Permit. The exact amount varies depending on the scope 
                  and duration of your digging project. You will be informed of the specific fee when you submit your 
                  application at the Barangay Hall.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can someone else apply for the permit on my behalf?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, someone else can apply for the permit on your behalf, but they must present an authorization letter 
                  signed by you along with a photocopy of your valid ID and their own valid ID. The authorization letter 
                  should clearly state that they are authorized to apply for and receive the Digging Permit.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What happens if I dig without a permit?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Digging without a permit is a violation of barangay regulations and may result in fines or penalties. 
                  Additionally, you may be held liable for any damage to public property or utility lines. It's always 
                  best to secure the proper permit before conducting any digging activities.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
      
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
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StraightenIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Digging Permit Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Digging Permit request:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Personal Information</Typography>
                <Typography variant="body2">Name: {formData.fullName}</Typography>
                <Typography variant="body2">Address: {formData.address}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Digging Details</Typography>
                <Typography variant="body2">
                  Purpose: {formData.diggingPurpose === 'water_supply' ? 'Water Supply Connection' : 
                          formData.diggingPurpose === 'electrical' ? 'Electrical Connection' : 
                          formData.diggingPurpose === 'drainage' ? 'Drainage System' : 'Other'}
                </Typography>
                <Typography variant="body2">Company: {formData.companyName}</Typography>
                <Typography variant="body2">Connection Details: {formData.applicationDetails}</Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Important Reminders:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <Typography component="li" variant="body2">
                You must restore the digging area to its original condition after work completion
              </Typography>
              <Typography component="li" variant="body2">
                There's a processing fee payable at the Barangay Hall
              </Typography>
              <Typography component="li" variant="body2">
                Processing typically takes 1-2 working days
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
    </Box>
  </Container>
);
}

export default RequestDigging;