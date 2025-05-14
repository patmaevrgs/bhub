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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import CategoryIcon from '@mui/icons-material/Category';
import NatureIcon from '@mui/icons-material/Nature';
import ConstructionIcon from '@mui/icons-material/Construction';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import MeasureIcon from '@mui/icons-material/Straighten';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../config';

function RequestObjection() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  // Form state
  const [formData, setFormData] = useState({
    // Personal details
    fullName: '',
    address: '',
    
    // Certificate details
    objectType: 'tree_cutting',
    objectDetails: '',
    quantity: '',
    additionalInfo: ''
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
    
    // Simple validation
    if (!formData.fullName || !formData.address || !formData.objectDetails || !formData.quantity || 
        (formData.objectType === 'other' && !formData.additionalInfo)) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Open confirmation dialog instead of submitting directly
    setOpenConfirmDialog(true);
  };

  // Add this new function for the confirmation dialog submission
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
          documentType: 'no_objection_certificate',
          formData: {
            fullName: formData.fullName.toUpperCase(),
            address: formData.address,
            objectType: formData.objectType,
            objectDetails: formData.objectDetails,
            quantity: formData.quantity,
            additionalInfo: formData.additionalInfo
          },
          purpose: getFormattedPurpose()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit No Objection Certificate request');
      }

      // Close confirmation dialog
      setOpenConfirmDialog(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your No Objection Certificate request has been submitted successfully',
        severity: 'success'
      });

      // Reset form after successful submission
      setFormData({
        fullName: '',
        address: '',
        objectType: 'tree_cutting',
        objectDetails: '',
        quantity: '',
        additionalInfo: ''
      });

      // Navigate to transactions page after 2 seconds
      setTimeout(() => {
        navigate('/resident/transactions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting No Objection Certificate request:', error);
      setSnackbar({
        open: true,
        message: `Failed to submit request: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get formatted purpose text based on object type
  const getFormattedPurpose = () => {
    switch (formData.objectType) {
      case 'tree_cutting':
        return `will cut ${formData.quantity} ${formData.objectDetails}. This office has no objection for the said cutting of the tree as part of requirements of PENRO Los Baños, Laguna.`;
      case 'construction':
        return `will conduct construction of ${formData.objectDetails}${formData.quantity ? ' (' + formData.quantity + ')' : ''}. This office has no objection for the said construction as part of local permitting requirements.`;
      case 'event':
        return `will organize ${formData.objectDetails}${formData.quantity ? ' for ' + formData.quantity + ' participants' : ''}. This office has no objection for the said event as part of permit application requirements.`;
      case 'business':
        return `will operate ${formData.objectDetails}${formData.quantity ? ' with capacity of ' + formData.quantity : ''}. This office has no objection for the said business operation as part of permit application requirements.`;
      case 'other':
        return formData.additionalInfo || 'will proceed with the stated activity. This office has no objection as part of local permitting requirements.';
      default:
        return 'will proceed with the stated activity. This office has no objection as part of local permitting requirements.';
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
        No Objection Certificate Request
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
          <GavelIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            No Objection Certificate Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting a No Objection Certificate (NOC) from the Barangay, which confirms that the 
            Barangay has no objection to a specific activity you plan to undertake within its jurisdiction. This certificate 
            is commonly required for tree cutting permits, construction approvals, event permits, or business operations 
            within the Barangay area.
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
                  placeholder="e.g., RAULITO M. CALIZO"
                  helperText="Your complete name with middle initial if applicable"
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
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  placeholder="e.g., Sitio Ibaba"
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
          {/* Certificate Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Certificate Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required
                  size="small"
                >
                  <InputLabel id="object-type-label">Type of Activity</InputLabel>
                  <Select
                    labelId="object-type-label"
                    name="objectType"
                    value={formData.objectType}
                    onChange={handleChange}
                    label="Type of Activity"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="tree_cutting">Tree Cutting</MenuItem>
                    <MenuItem value="construction">Construction</MenuItem>
                    <MenuItem value="event">Event/Gathering</MenuItem>
                    <MenuItem value="business">Business Operation</MenuItem>
                    <MenuItem value="other">Other Activity</MenuItem>
                  </Select>
                  <FormHelperText>
                    Select the type of activity for which you need the No Objection Certificate
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={formData.objectType === 'tree_cutting' ? "Tree Type/Species" : "Details of Activity"}
                  name="objectDetails"
                  value={formData.objectDetails}
                  onChange={handleChange}
                  placeholder={formData.objectType === 'tree_cutting' ? "e.g., Mahogany Tree" : "e.g., Residential Building"}
                  helperText={formData.objectType === 'tree_cutting' ? "Specify the type of tree to be cut" : "Provide specific details about the activity"}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {formData.objectType === 'tree_cutting' ? (
                          <NatureIcon fontSize="small" />
                        ) : formData.objectType === 'construction' ? (
                          <ConstructionIcon fontSize="small" />
                        ) : formData.objectType === 'event' ? (
                          <EventIcon fontSize="small" />
                        ) : formData.objectType === 'business' ? (
                          <BusinessIcon fontSize="small" />
                        ) : (
                          <DescriptionIcon fontSize="small" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={formData.objectType === 'tree_cutting' ? "Number of Trees" : "Quantity/Size/Capacity"}
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder={formData.objectType === 'tree_cutting' ? "e.g., 1" : "e.g., 150 sqm"}
                  helperText={formData.objectType === 'tree_cutting' ? "Number of trees to be cut" : "Relevant quantity, size, or capacity information"}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MeasureIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {formData.objectType === 'other' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Additional Information"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="e.g., will install solar panels on the roof of my house. This office has no objection as part of local permitting requirements."
                    helperText="Please provide a detailed description of the activity, and make sure it follows the format below."
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mt: '-36px' }}>
                          <InfoIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          
          {/* Preview Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Certificate Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              p: 3, 
              border: '1px dashed', 
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: '#f9f9f9',
              position: 'relative',
              mb: 2
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: '-10px', 
                left: '20px', 
                bgcolor: '#f9f9f9', 
                px: 1,
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}>
                Preview
              </Box>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6 }}>
                {`This is to further certify that ${formData.fullName ? formData.fullName.toUpperCase() : '[YOUR NAME]'}, ${getFormattedPurpose()}`}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              This is how your certificate will be formatted. Please review the details before submitting.
            </Typography>
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
                Please bring the following documents when claiming your certificate:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 0, mt: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Valid ID (original and photocopy)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Proof of residence (utility bill, etc.)
                </Typography>
                
                {formData.objectType === 'tree_cutting' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Letter of request to PENRO/CENRO for tree cutting
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Photos of the tree(s) to be cut
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Proof of ownership of the property where tree is located
                    </Typography>
                  </>
                )}
                
                {formData.objectType === 'construction' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Building/construction plan (blueprint)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Proof of ownership of the property
                    </Typography>
                  </>
                )}
                
                {formData.objectType === 'event' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Event plan/program
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Security plan (for large gatherings)
                    </Typography>
                  </>
                )}
                
                {formData.objectType === 'business' && (
                  <>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Business plan or proposal
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Proof of compliance with zoning regulations
                    </Typography>
                  </>
                )}
                
                <Typography component="li" variant="body2">
                  Application fee (may vary based on the type of certificate)
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
                You understand that this certificate does not replace permits required by other agencies
              </Typography>
              <Typography component="li" variant="body2">
                You will present all required documents when claiming your certificate
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
                  address: '',
                  objectType: 'tree_cutting',
                  objectDetails: '',
                  quantity: '',
                  additionalInfo: ''
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
      {/* About No Objection Certificate */}
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
            About No Objection Certificate
          </Typography>
        </Box>
        
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <DescriptionIcon color="primary" sx={{ mr: 1.5, fontSize: 20, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Purpose and Uses
                </Typography>
                <Typography variant="body2" paragraph>
                  A No Objection Certificate (NOC) is an official document issued by the Barangay stating that it has no objection 
                  to a specific activity you plan to undertake within its jurisdiction. This certificate is often required by various 
                  regulatory agencies before they issue permits.
                </Typography>
                <Typography variant="body2">
                  Common uses include:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Tree cutting permits from DENR/PENRO</Typography>
                  <Typography component="li" variant="body2">Construction permits from engineering department</Typography>
                  <Typography component="li" variant="body2">Event permits from local police and fire department</Typography>
                  <Typography component="li" variant="body2">Business permits from municipal or city government</Typography>
                  <Typography component="li" variant="body2">Other activities that might impact the community</Typography>
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
                  Standard processing takes 1-2 working days. For tree cutting certificates, the Barangay may need to conduct 
                  an inspection of the site before issuing the NOC. You will be notified once your certificate is ready for pickup.
                  Please bring all required documents when claiming your certificate at the Barangay Hall.
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Is this the only permit I need for my activity?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  No, a No Objection Certificate from the Barangay is usually just one of several documents you may need. For example, 
                  for tree cutting, you will still need approval from DENR/PENRO. For construction, you'll need building permits from 
                  the municipal engineering office. This certificate merely confirms that the Barangay has no objection to your planned activity.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the No Objection Certificate valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The validity period depends on the type of activity. For tree cutting, the certificate is typically valid for 
                  3-6 months. For construction and business operations, it's usually valid for 1 year. For events, it's valid only 
                  for the duration of the event. If your certificate expires before you complete your activity, you may need to 
                  apply for a new one.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Will there be an inspection before the certificate is issued?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  For some activities like tree cutting and major construction projects, the Barangay may conduct an inspection of 
                  the site before issuing the certificate. This is to verify the information provided in your application and assess 
                  any potential impact on the community. If an inspection is required, the Barangay office will contact you to 
                  schedule a convenient time.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can the Barangay refuse to issue a No Objection Certificate?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, the Barangay can refuse to issue a No Objection Certificate if your planned activity violates local ordinances, 
                  poses a risk to the community, or conflicts with the Barangay's development plan. If your application is denied, 
                  you will be informed of the reasons and, if possible, what you can do to address the concerns.
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
            <GavelIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm No Objection Certificate Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your No Objection Certificate request:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Personal Information</Typography>
                <Typography variant="body2">Name: {formData.fullName?.toUpperCase()}</Typography>
                <Typography variant="body2">Address: {formData.address}, Barangay Maahas, Los Baños, Laguna</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Activity Details</Typography>
                <Typography variant="body2">
                  Type: {
                    formData.objectType === 'tree_cutting' ? 'Tree Cutting' :
                    formData.objectType === 'construction' ? 'Construction' :
                    formData.objectType === 'event' ? 'Event/Gathering' :
                    formData.objectType === 'business' ? 'Business Operation' :
                    'Other Activity'
                  }
                </Typography>
                <Typography variant="body2">Details: {formData.objectDetails}</Typography>
                <Typography variant="body2">Quantity/Size: {formData.quantity}</Typography>
                {formData.objectType === 'other' && (
                  <Typography variant="body2">Additional Info: {formData.additionalInfo}</Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Important Reminders:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <Typography component="li" variant="body2">
                Bring all required documents when claiming your certificate
              </Typography>
              <Typography component="li" variant="body2">
                This certificate is just one of the requirements for your activity
              </Typography>
              <Typography component="li" variant="body2">
                Processing typically takes 1-2 working days
              </Typography>
              <Typography component="li" variant="body2">
                An inspection may be required for some activities
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

export default RequestObjection;