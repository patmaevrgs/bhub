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
  Divider,
  Card,
  CardContent
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import AlertTitle from '@mui/material/AlertTitle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PaymentsIcon from '@mui/icons-material/Payments';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
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

function RequestBusiness() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Business details
    businessName: '',
    businessAddress: '',
    lineOfBusiness: '',
    businessStatus: 'NEW' // Default to NEW, admin can change to RENEW if needed
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
    if (!formData.businessName || !formData.businessAddress || !formData.lineOfBusiness) {
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

  const confirmSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentType: 'business_clearance',
          formData: {
            businessName: formData.businessName.toUpperCase(),
            businessAddress: formData.businessAddress.toUpperCase(),
            lineOfBusiness: formData.lineOfBusiness.toUpperCase(),
            businessStatus: formData.businessStatus,
            // Default amount that admin can change later
            amount: '00.00'
          },
          purpose: 'Business Permit Application'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit business clearance request');
      }

      // Close dialog
      setOpenConfirmDialog(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your business clearance request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        businessName: '',
        businessAddress: '',
        lineOfBusiness: '',
        businessStatus: 'NEW'
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting business clearance request:', error);
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
        Business Clearance Request
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
          <StorefrontIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Business Clearance Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting a Barangay Business Clearance, which certifies that your business establishment 
            conforms to the requirements for operating within Barangay Maahas. This document is required for business 
            permit applications and renewals with the Municipal Business Permits and Licensing Office.
          </Typography>
        </Alert>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Business Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Business Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., ALPEREY ICE CREAM DISTRIBUTION"
                  helperText="Enter the complete registered name of your business"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Address"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., PUROK 2, SAMPALUKAN"
                  helperText="Specific location within Barangay Maahas"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Line of Business"
                  name="lineOfBusiness"
                  value={formData.lineOfBusiness}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., FOOD RETAIL, COMPUTER REPAIR"
                  helperText="Type of business or primary products/services"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiInputBase-root': {
                      minWidth: '310px' // Adjust this value as needed
                  }}}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl 
                  fullWidth
                  required
                  size="small"
                >
                  <InputLabel id="business-status-label">Business Status</InputLabel>
                  <Select
                    labelId="business-status-label"
                    name="businessStatus"
                    value={formData.businessStatus}
                    onChange={handleChange}
                    label="Business Status"
                    startAdornment={
                      <InputAdornment position="start">
                        <NewReleasesIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="NEW">NEW</MenuItem>
                    <MenuItem value="RENEW">RENEW</MenuItem>
                  </Select>
                  <FormHelperText>
                    Select NEW for first-time application or RENEW for existing business
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          {/* Fee Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Fee Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <PaymentsIcon sx={{ mr: 1, color: 'info.main', fontSize: 20, mt: 0.3 }} />
                The fee for Business Clearance varies based on business type and size:
              </Typography>
              <Grid container spacing={2} sx={{ ml: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Typical fee ranges:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0 }}>
                      <Typography component="li" variant="body2">Small/Micro businesses: ₱150.00 - ₱500.00</Typography>
                      <Typography component="li" variant="body2">Medium businesses: ₱500.00 - ₱1,000.00</Typography>
                      <Typography component="li" variant="body2">Large businesses: ₱1,000.00 - ₱2,000.00</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Fee factors:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0 }}>
                      <Typography component="li" variant="body2">Business size and type</Typography>
                      <Typography component="li" variant="body2">NEW vs RENEWAL application</Typography>
                      <Typography component="li" variant="body2">Nature of business activities</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note: The exact fee will be determined by the Barangay based on their assessment of your business. The final amount will be confirmed upon approval.
              </Typography>
            </Box>
          </Box>
          {/* Requirements Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Required Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20, mt: 0.3 }} />
                  <Typography variant="body2">
                    For NEW applications:
                  </Typography>
                </Box>
                <Box component="ul" sx={{ pl: 4, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Barangay Business Application Form</Typography>
                  <Typography component="li" variant="body2">Valid ID of business owner</Typography>
                  <Typography component="li" variant="body2">DTI Business Name Registration</Typography>
                  <Typography component="li" variant="body2">Proof of business location (contract/title)</Typography>
                  <Typography component="li" variant="body2">Sketch of business location</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20, mt: 0.3 }} />
                  <Typography variant="body2">
                    For RENEWAL applications:
                  </Typography>
                </Box>
                <Box component="ul" sx={{ pl: 4, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Previous Barangay Business Clearance</Typography>
                  <Typography component="li" variant="body2">Barangay Business Application Form</Typography>
                  <Typography component="li" variant="body2">Valid ID of business owner</Typography>
                  <Typography component="li" variant="body2">Business Permit from previous year</Typography>
                </Box>
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
                Your business complies with all barangay ordinances and regulations
              </Typography>
              <Typography component="li" variant="body2">
                You will present all required documents when claiming your Business Clearance
              </Typography>
              <Typography component="li" variant="body2">
                You agree to pay the applicable processing fee based on your business type
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
                  businessName: '',
                  businessAddress: '',
                  lineOfBusiness: '',
                  businessStatus: 'NEW'
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
      {/* About Barangay Business Clearance */}
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
            About Barangay Business Clearance
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
                  A Barangay Business Clearance is an official document that certifies your business complies with 
                  local barangay regulations and has no pending violations or issues within the barangay.
                </Typography>
                <Typography variant="body2">
                  This document is essential for:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Applying for a Municipal/City Business Permit</Typography>
                  <Typography component="li" variant="body2">Annual renewal of Business Permits</Typography>
                  <Typography component="li" variant="body2">Proving legitimate operation within the barangay</Typography>
                  <Typography component="li" variant="body2">Accessing certain business services and benefits</Typography>
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
                  Standard processing only takes 1-2 days. You will be notified once your Barangay Clearance is ready for pickup.
                  Please bring the essential documents when claiming your business clearance at the Barangay Hall.
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the Barangay Business Clearance valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The Barangay Business Clearance is typically valid for one year from the date of issuance and needs to be
                  renewed annually along with your business permit. For seasonal businesses, special validity periods may apply.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What if my business operates in multiple locations?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If your business has multiple branches or locations within Barangay Maahas, you need to apply for a separate
                  Barangay Business Clearance for each location. If you have branches in different barangays, you'll need to
                  apply for clearance from each respective barangay office.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Does my home-based online business need a clearance?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, even home-based and online businesses operating within Barangay Maahas require a Barangay Business Clearance.
                  This ensures that all business activities within the barangay are properly registered and regulated. Home-based
                  businesses may qualify for reduced fees depending on the nature and scale of the business.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What happens if I operate without a Business Clearance?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Operating a business without a Barangay Business Clearance is a violation of local ordinances and may result in
                  penalties, fines, or closure of your business. Additionally, you won't be able to obtain a Municipal Business
                  Permit, which is required for legal business operations. It's always best to ensure your business is properly
                  registered and compliant with all local regulations.
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
            <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Business Clearance Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Business Clearance application:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Business Name</Typography>
                <Typography variant="body2">{formData.businessName.toUpperCase() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Business Address</Typography>
                <Typography variant="body2">{formData.businessAddress.toUpperCase() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary.main">Line of Business</Typography>
                <Typography variant="body2">{formData.lineOfBusiness.toUpperCase() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary.main">Business Status</Typography>
                <Typography variant="body2">{formData.businessStatus || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Important Reminders:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <Typography component="li" variant="body2">
                Bring all required documents when claiming your clearance
              </Typography>
              <Typography component="li" variant="body2">
                Processing fee will vary based on business type and status
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

export default RequestBusiness;