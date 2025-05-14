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
import LandscapeIcon from '@mui/icons-material/Landscape';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StraightenIcon from '@mui/icons-material/Straighten';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import SquareIcon from '@mui/icons-material/Square';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../config';

function RequestLot() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Property details
    tdNumber: '',
    surveyNumber: '',
    lotArea: '',
    areaUnit: 'square_meters',
    lotLocation: '',

    // Owner details
    fullName: '',
    ownerAddress: '',
    
    // Additional details
    purpose: '',
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
    if (!formData.tdNumber || !formData.surveyNumber || !formData.lotArea || 
        !formData.lotLocation || !formData.fullName || !formData.ownerAddress || 
        !formData.purpose) {
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

  // Add new function to handle submission after confirmation
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
          documentType: 'lot_ownership',
          formData: {
            tdNumber: formData.tdNumber,
            surveyNumber: formData.surveyNumber,
            lotArea: formData.lotArea,
            areaUnit: formData.areaUnit,
            lotLocation: formData.lotLocation,
            fullName: formData.fullName,
            ownerAddress: formData.ownerAddress
          },
          purpose: formData.purpose
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit lot ownership request');
      }

      // Close dialog
      setOpenConfirmDialog(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your lot ownership certification request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        tdNumber: '',
        surveyNumber: '',
        lotArea: '',
        areaUnit: 'square_meters',
        lotLocation: '',
        fullName: '',
        ownerAddress: '',
        purpose: ''
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting lot ownership request:', error);
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
        Lot Ownership Certification Request
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
          <LandscapeIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Lot Ownership Certification Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting a Barangay Certification of Lot Ownership, which verifies property ownership details based on records presented to the Barangay.
            This document certifies that the specified lot is registered in the name provided and is free from legal impediments or tenancy issues as far as barangay records show.
          </Typography>
        </Alert>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Property Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Property Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TD Number"
                  name="tdNumber"
                  value={formData.tdNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 11 0008 0454"
                  helperText="Tax Declaration Number issued by Assessor's Office"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Survey Number"
                  name="surveyNumber"
                  value={formData.surveyNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 4975(CAD-450)"
                  helperText="Cadastral/Property Survey Number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StraightenIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lot Area"
                  name="lotArea"
                  type="number"
                  value={formData.lotArea}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 79"
                  helperText="Size of the property"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SquareFootIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  required
                  size="small"
                >
                  <InputLabel id="area-unit-label">Area Unit</InputLabel>
                  <Select
                    labelId="area-unit-label"
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    label="Area Unit"
                    startAdornment={
                      <InputAdornment position="start">
                        <SquareIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="square_meters">Square Meters</MenuItem>
                    <MenuItem value="square_feet">Square Feet</MenuItem>
                    <MenuItem value="hectares">Hectares</MenuItem>
                  </Select>
                  <FormHelperText>
                    Unit of measurement for the lot area
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Location"
                  name="lotLocation"
                  value={formData.lotLocation}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Purok 4, near Elementary School"
                  helperText="Specific location within Barangay Maahas, Los Baños, Laguna"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          {/* Owner Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Owner Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Owner Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., JUAN M. DELA CRUZ"
                  helperText="Full name of the registered owner (preferably in UPPERCASE)"
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
                  label="Owner Address"
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Brgy. Anos, Los Baños, Laguna"
                  helperText="Complete address of the registered owner"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '300px' // Adjust this value as needed
                  }}}
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
                <TextField
                  fullWidth
                  label="Purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  placeholder="e.g., For bank loan application, for property sale transaction"
                  helperText="Please specify the purpose for requesting this certification"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mt: '-36px' }}>
                        <AssignmentIcon fontSize="small" />
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
                Please bring the following documents when claiming your certification:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 0, mt: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Valid ID of the property owner
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Original or certified true copy of Tax Declaration
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Original or certified true copy of the property survey plan
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Deed of Sale/Title of the property (if available)
                </Typography>
                <Typography component="li" variant="body2">
                  Authorization letter (if the requestor is not the owner)
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
              By submitting this form, you confirm that:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, fontSize: '0.8rem' }}>
              <Typography component="li" variant="body2">
                All information provided is accurate and complete to the best of your knowledge
              </Typography>
              <Typography component="li" variant="body2">
                You have legitimate interest in or ownership of the specified property
              </Typography>
              <Typography component="li" variant="body2">
                You will present all required documents when claiming your certification
              </Typography>
              <Typography component="li" variant="body2">
                You understand that false information may lead to rejection of your application
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
                  tdNumber: '',
                  surveyNumber: '',
                  lotArea: '',
                  areaUnit: 'square_meters',
                  lotLocation: '',
                  fullName: '',
                  ownerAddress: '',
                  purpose: ''
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
      
      {/* About Lot Ownership Certification */}
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
            About Lot Ownership Certification
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
                  A Barangay Certification of Lot Ownership is an official document that verifies ownership details of a property
                  based on records presented to and verified by the Barangay.
                </Typography>
                <Typography variant="body2">
                  This document is commonly used for:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Bank loan applications</Typography>
                  <Typography component="li" variant="body2">Property sale transactions</Typography>
                  <Typography component="li" variant="body2">Building permit applications</Typography>
                  <Typography component="li" variant="body2">Verification of property ownership status</Typography>
                  <Typography component="li" variant="body2">Supporting document for legal proceedings</Typography>
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
                  Standard processing only takes 1-2 days. You will be notified once your Lot Ownership Certificate is ready for pickup.
                  Please bring the essential documents when claiming your certification at the Barangay Hall.
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Is this certification equivalent to a land title?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  No, this certification is not equivalent to a land title. It only verifies that based on the records presented 
                  to the barangay, the specified person is the recognized owner of the property. For official land titling, 
                  you should consult with the Register of Deeds or Land Registration Authority.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the Lot Ownership Certification valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The certification is typically valid for 6 months from the date of issuance. However, some institutions 
                  might require a more recent certification, so it's advisable to check with the requiring party about their 
                  specific validity requirements.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can someone else request this certification on my behalf?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, someone else can request and pick up the certification on your behalf, but they need to present an 
                  authorization letter signed by you, along with a copy of your valid ID and their own valid ID. The authorization 
                  letter should specifically state that they are authorized to request and receive the Lot Ownership Certification.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What if there is a discrepancy in my property details?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If there are discrepancies in your property details (e.g., differences between the tax declaration and 
                  survey plan), you may need to resolve these issues first with the Municipal Assessor's Office or the 
                  appropriate government agency before the barangay can issue the certification. The barangay can only 
                  certify based on consistent and verified information.
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
            <LandscapeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Lot Ownership Certification Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Lot Ownership Certification request:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Property Details</Typography>
                <Typography variant="body2">TD Number: {formData.tdNumber}</Typography>
                <Typography variant="body2">Survey Number: {formData.surveyNumber}</Typography>
                <Typography variant="body2">
                  Lot Area: {formData.lotArea} {formData.areaUnit === 'square_meters' ? 'Square Meters' : 
                             formData.areaUnit === 'square_feet' ? 'Square Feet' : 'Hectares'}
                </Typography>
                <Typography variant="body2">Location: {formData.lotLocation}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Owner Information</Typography>
                <Typography variant="body2">Name: {formData.fullName}</Typography>
                <Typography variant="body2">Address: {formData.ownerAddress}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Purpose</Typography>
                <Typography variant="body2">{formData.purpose}</Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Important Reminders:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <Typography component="li" variant="body2">
                Bring all required documents when claiming your certification
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

export default RequestLot;