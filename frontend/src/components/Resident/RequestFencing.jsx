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
  Card,
  CardContent,
  InputAdornment,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FenceIcon from '@mui/icons-material/Fence';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BadgeIcon from '@mui/icons-material/Badge';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import SquareIcon from '@mui/icons-material/Square';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

function RequestFencing() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Requester details
    fullName: '',
    residentAddress: '',
    
    // Property details
    propertyLocation: '',
    taxDeclarationNumber: '',
    propertyIdentificationNumber: '',
    propertyArea: '',
    areaUnit: 'square_meters',
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
    if (!formData.fullName || !formData.residentAddress || !formData.propertyLocation || 
        !formData.taxDeclarationNumber || !formData.propertyIdentificationNumber || 
        !formData.propertyArea) {
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

  // Add confirmation submit function
  const confirmSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentType: 'fencing_permit',
          formData: {
            fullName: formData.fullName,
            residentAddress: formData.residentAddress,
            propertyLocation: formData.propertyLocation,
            taxDeclarationNumber: formData.taxDeclarationNumber,
            propertyIdentificationNumber: formData.propertyIdentificationNumber,
            propertyArea: formData.propertyArea,
            areaUnit: formData.areaUnit
          },
          purpose: 'installation of Fence'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit fencing permit request');
      }

      // Close dialog
      setOpenConfirmDialog(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your fencing permit request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        fullName: '',
        residentAddress: '',
        propertyLocation: '',
        taxDeclarationNumber: '',
        propertyIdentificationNumber: '',
        propertyArea: '',
        areaUnit: 'square_meters',
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting fencing permit request:', error);
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
        Fencing Permit Request
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
          <FenceIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Fencing Permit Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting a Barangay Fencing Permit, which authorizes you to install a fence on your property within 
            the barangay jurisdiction. This permit helps ensure that fence installations comply with local regulations and 
            boundary guidelines.
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Residential Address"
                  name="residentAddress"
                  value={formData.residentAddress}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 123 Hillside, Tuntungin, Los Baños, Laguna"
                  helperText="Your current residential address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '290px', sm: '290px', md: '370px' }
                  }}}
                />
              </Grid>
            </Grid>
          </Box>
          {/* Property Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Property Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Location in Barangay Maahas"
                  name="propertyLocation"
                  value={formData.propertyLocation}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Anestville, Purok 4"
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Declaration Number"
                  name="taxDeclarationNumber"
                  value={formData.taxDeclarationNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 12-3456-78900"
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
                  label="Property Identification Number"
                  name="propertyIdentificationNumber"
                  value={formData.propertyIdentificationNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 123-45-6789-012-34"
                  helperText="PIN of the property"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '230px', sm: '230px', md: '230px' }
                  }}}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Area"
                  name="propertyArea"
                  type="number"
                  value={formData.propertyArea}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 170"
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
                    Unit of measurement for the property area
                  </FormHelperText>
                </FormControl>
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
                  Original or certified true copy of Tax Declaration
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Simple sketch or plan of the proposed fence
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Proof of property ownership (land title, deed of sale, etc.)
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
              By submitting this form, you confirm that:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5, fontSize: '0.8rem' }}>
              <Typography component="li" variant="body2">
                All information provided is accurate and complete to the best of your knowledge
              </Typography>
              <Typography component="li" variant="body2">
                The fence will be constructed within your property boundaries
              </Typography>
              <Typography component="li" variant="body2">
                You will comply with all local regulations regarding fence height and materials
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
                  fullName: '',
                  residentAddress: '',
                  propertyLocation: '',
                  taxDeclarationNumber: '',
                  propertyIdentificationNumber: '',
                  propertyArea: '',
                  areaUnit: 'square_meters',
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
      
      {/* About Fencing Permit */}
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
            About Fencing Permit
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
                  A Barangay Fencing Permit is an official document that authorizes property owners to install a fence 
                  around their property within the barangay. This ensures that fencing activities comply with local 
                  regulations and respect property boundaries.
                </Typography>
                <Typography variant="body2">
                  This permit is necessary for:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Marking clear property boundaries</Typography>
                  <Typography component="li" variant="body2">Ensuring compliance with local fence regulations</Typography>
                  <Typography component="li" variant="body2">Preventing boundary disputes with neighbors</Typography>
                  <Typography component="li" variant="body2">Maintaining community aesthetic standards</Typography>
                  <Typography component="li" variant="body2">Legal protection in case of disputes</Typography>
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
                  Standard processing takes 1-2 working days. You will be notified once your Fencing Permit is ready for pickup.
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Are there height restrictions for fences?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, there are height restrictions for fences in residential areas. Generally, front yard fences should not exceed 
                  4 feet (1.2 meters) in height, while side and rear fences may be up to 6 feet (1.8 meters). However, specific 
                  regulations may vary, so it's best to inquire at the Barangay Hall for details pertaining to your location.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the Fencing Permit valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The Fencing Permit is typically valid for 6 months from the date of issuance. If you haven't completed your 
                  fencing project within this timeframe, you may need to apply for an extension or a new permit depending on 
                  the circumstances.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What materials are allowed for fencing?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Most common fencing materials are allowed, including concrete, wood, metal, bamboo, and PVC. However, materials that 
                  may pose safety hazards (like barbed wire or broken glass) in residential areas may be restricted or require special 
                  permission. The barangay may also have guidelines regarding the aesthetic appearance of fences, especially in certain 
                  neighborhoods.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Do I need my neighbor's consent to build a fence?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If the fence is entirely within your property boundaries, you generally do not need your neighbor's consent. 
                  However, if there is any question about the exact property line or if the fence will be built on a shared boundary, 
                  it's advisable to discuss your plans with your neighbor to avoid disputes. In some cases, a survey may be needed to 
                  establish the exact property line.
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
            <FenceIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Fencing Permit Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Fencing Permit request:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Personal Information</Typography>
                <Typography variant="body2">Name: {formData.fullName}</Typography>
                <Typography variant="body2">Address: {formData.residentAddress}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Property Details</Typography>
                <Typography variant="body2">Location: {formData.propertyLocation}</Typography>
                <Typography variant="body2">Tax Declaration: {formData.taxDeclarationNumber}</Typography>
                <Typography variant="body2">Property ID: {formData.propertyIdentificationNumber}</Typography>
                <Typography variant="body2">
                  Area: {formData.propertyArea} {formData.areaUnit === 'square_meters' ? 'Square Meters' : 
                         formData.areaUnit === 'square_feet' ? 'Square Feet' : 'Hectares'}
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
                Bring all required documents when claiming your permit
              </Typography>
              <Typography component="li" variant="body2">
                There's a processing fee payable at the Barangay Hall
              </Typography>
              <Typography component="li" variant="body2">
                Processing typically takes 1-2 working days
              </Typography>
              <Typography component="li" variant="body2">
                The fence must comply with local height and material regulations
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

export default RequestFencing;