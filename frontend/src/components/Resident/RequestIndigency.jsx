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
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from '@mui/material/Accordion';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

function RequestIndigency() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    address: '',
    isSelf: false, // New property to track if certificate is for self
    guardian: '', // Will be auto-filled with fullName if isSelf is true
    guardianRelation: '', // Will be set to "SARILI (SELF)" if isSelf is true
    purpose: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Submission state
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Guardian relation options
  const relationOptions = ['Ama (Father)', 'Ina (Mother)', 'Asawa (Spouse)', 'Kapatid (Sibling)', 'Anak (Child)', 'Iba pa (Other)'];
  
  // Purpose options
  const purposeOptions = [
    'MEDICAL ASSISTANCE',
    'EDUCATIONAL ASSISTANCE',
    'BURIAL ASSISTANCE',
    'FINANCIAL ASSISTANCE',
    'HOSPITAL REQUIREMENTS',
    'OTHER'
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for fullName field when isSelf is true
    if (name === 'fullName' && formData.isSelf) {
      setFormData({
        ...formData,
        [name]: value,
        guardian: value // Auto-update guardian when fullName changes and isSelf is true
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
    
    // Required fields validation - always required
    const alwaysRequiredFields = ['fullName', 'age', 'address', 'purpose'];
    
    alwaysRequiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Guardian fields only required if not for self
    if (!formData.isSelf) {
      if (!formData.guardian) {
        newErrors.guardian = 'This field is required';
      }
      if (!formData.guardianRelation) {
        newErrors.guardianRelation = 'This field is required';
      }
    }
    
    // Age validation - must be a positive number
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) <= 0)) {
      newErrors.age = 'Age must be a positive number';
    }
    
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

  // Add this new function for the confirmation dialog submission
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
        documentType: 'certificate_of_indigency',
        formData: {
          ...formData,
          fullName: formData.fullName.toUpperCase(), // Ensure name is in uppercase
          // Make sure guardian is updated if this is a self-application
          guardian: formData.isSelf ? formData.fullName.toUpperCase() : formData.guardian.toUpperCase(),
          guardianRelation: formData.isSelf ? 'SARILI (SELF)' : formData.guardianRelation
        },
        purpose: finalPurpose
      };
      
      // Remove customPurpose from formData if it exists
      if (submissionData.formData.customPurpose) {
        delete submissionData.formData.customPurpose;
      }
      
      const response = await fetch('http://localhost:3002/documents', {
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
      
      // Close confirmation dialog
      setOpenConfirmDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Certificate of Indigency request submitted successfully!',
        severity: 'success'
      });
      
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
        Certificate of Indigency Request
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
          <ArticleIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Certificate of Indigency Application Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This form is for requesting a Certificate of Indigency from the Barangay, which certifies that you or a family member 
            are classified as indigent (low-income) residents. This certificate can be used for various purposes such as medical 
            assistance, educational assistance, burial assistance, financial assistance, and fee waivers at hospitals and other 
            institutions.
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
                  required
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName || "Enter your full name"}
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="age"
                  name="age"
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={!!errors.age}
                  helperText={errors.age || "Your current age"}
                  InputProps={{ 
                    inputProps: { min: 1 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <CakeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="address"
                  name="address"
                  label="Address Details"
                  placeholder="e.g., Purok 4"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address || "Your specific address (Barangay Maahas, Los Baños, Laguna will be added automatically)"}
                  variant="outlined"
                  size="small"
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
          {/* Recipient Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Recipient Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Who will be using this certificate? (If for yourself, select "Self")
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1 
                }}>
                  <PersonPinCircleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      name="isSelf"
                      value={formData.isSelf ? 'self' : 'other'}
                      onChange={(e) => {
                        const isSelf = e.target.value === 'self';
                        setFormData({
                          ...formData,
                          isSelf: isSelf,
                          // If self is selected, pre-fill guardian with full name and clear errors
                          guardian: isSelf ? formData.fullName : '',
                          guardianRelation: isSelf ? 'SARILI (SELF)' : '',
                        });
                        // Clear any errors for these fields
                        if (errors.guardian || errors.guardianRelation) {
                          setErrors({
                            ...errors,
                            guardian: '',
                            guardianRelation: ''
                          });
                        }
                      }}
                    >
                      <FormControlLabel value="self" control={<Radio size="small" />} label="Self (For my own use)" />
                      <FormControlLabel value="other" control={<Radio size="small" />} label="Other Person" />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>

              {/* Guardian fields - shown only if "Other" is selected */}
              {formData.isSelf !== true && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="guardian"
                      name="guardian"
                      label="Recipient Name"
                      value={formData.guardian}
                      onChange={handleChange}
                      error={!!errors.guardian}
                      helperText={errors.guardian || "Enter the full name of the person who will use this certificate"}
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
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      required 
                      error={!!errors.guardianRelation}
                      size="small"
                    >
                      <InputLabel id="relation-label">Relationship to Recipient</InputLabel>
                      <Select
                        labelId="relation-label"
                        id="guardianRelation"
                        name="guardianRelation"
                        value={formData.guardianRelation}
                        onChange={handleChange}
                        label="Relationship to Recipient"
                        startAdornment={
                          <InputAdornment position="start">
                            <FamilyRestroomIcon fontSize="small" />
                          </InputAdornment>
                        }
                      >
                        {relationOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.guardianRelation ? (
                        <FormHelperText>{errors.guardianRelation}</FormHelperText>
                      ) : (
                        <FormHelperText>Your relationship to the certificate recipient</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          
          {/* Purpose Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Purpose Information
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
                  {errors.purpose ? (
                    <FormHelperText>{errors.purpose}</FormHelperText>
                  ) : (
                    <FormHelperText>The purpose for requesting this certificate</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Custom Purpose - Only shown if 'OTHER' is selected */}
              {formData.purpose === 'OTHER' && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="customPurpose"
                    name="customPurpose"
                    label="Specify Purpose"
                    value={formData.customPurpose || ''}
                    onChange={handleChange}
                    error={!!errors.customPurpose}
                    helperText={errors.customPurpose || "Please specify the purpose for your certificate request"}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
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
                Please bring the following documents when claiming your certificate:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 0, mt: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Valid ID (original and photocopy)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Proof of residence (utility bill, rental agreement, etc.)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Barangay ID or Barangay Residency Certificate (if available)
                </Typography>
                
                {formData.purpose === 'MEDICAL ASSISTANCE' && (
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    Medical abstract or prescription (if available)
                  </Typography>
                )}
                
                {formData.purpose === 'EDUCATIONAL ASSISTANCE' && (
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    School registration or enrollment form
                  </Typography>
                )}
                
                {formData.purpose === 'BURIAL ASSISTANCE' && (
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    Death certificate of deceased family member
                  </Typography>
                )}
                
                {!formData.isSelf && (
                  <Typography component="li" variant="body2">
                    Authorization letter (if you are requesting on behalf of someone else)
                  </Typography>
                )}
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
                You or the recipient meets the criteria for indigency classification
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
                  age: '',
                  address: '',
                  isSelf: false,
                  guardian: '',
                  guardianRelation: '',
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
      
      {/* About Certificate of Indigency */}
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
            About Certificate of Indigency
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
                  A Certificate of Indigency is an official document that certifies that you or your family 
                  are classified as indigent (low-income) residents of the barangay and may not have sufficient 
                  means to pay for certain services or fees.
                </Typography>
                <Typography variant="body2">
                  This certificate is commonly used for:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
                  <Typography component="li" variant="body2">Medical assistance from hospitals and government agencies</Typography>
                  <Typography component="li" variant="body2">Educational assistance and scholarship applications</Typography>
                  <Typography component="li" variant="body2">Burial assistance programs</Typography>
                  <Typography component="li" variant="body2">Financial assistance from government agencies and NGOs</Typography>
                  <Typography component="li" variant="body2">Fee waivers at hospitals and other institutions</Typography>
                  <Typography component="li" variant="body2">Legal aid services</Typography>
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
                  Standard processing takes 1-2 working days. You will be notified once your Certificate of Indigency is ready for pickup.
                  Please bring the essential documents when claiming your certificate at the Barangay Hall.
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
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Who qualifies as indigent?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  An indigent person or family is one who has insufficient income for subsistence as defined by the Department 
                  of Social Welfare and Development (DSWD). Generally, this includes those who belong to the lowest income 
                  bracket, have limited means of livelihood, or are unable to meet basic needs. The Barangay may conduct a 
                  simple verification process to determine if you qualify.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long is the Certificate of Indigency valid?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The Certificate of Indigency is typically valid for 3-6 months from the date of issuance, depending on the 
                  institution where you will use it. Some agencies might require a more recent certificate, so it's advisable 
                  to check with the requiring agency about their specific validity requirements.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can someone else request and claim the certificate for me?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, someone else can request and claim the certificate on your behalf. However, they must present an 
                  authorization letter signed by you, along with photocopies of your valid ID and their own valid ID. The 
                  authorization letter should clearly state that they are authorized to request and receive the Certificate 
                  of Indigency on your behalf.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Does this certificate guarantee assistance?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  A Certificate of Indigency does not guarantee that you will receive assistance from the agency or organization 
                  where you present it. It is a supporting document that verifies your financial status, but the final decision 
                  to provide assistance depends on the specific program's guidelines and available resources. Some programs may 
                  have additional requirements or limited slots.
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
            <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Certificate of Indigency Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the following details for your Certificate of Indigency request:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Personal Information</Typography>
                <Typography variant="body2">Name: {formData.fullName}</Typography>
                <Typography variant="body2">Age: {formData.age}</Typography>
                <Typography variant="body2">Address: {formData.address}, Barangay Maahas, Los Baños, Laguna</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Certificate Details</Typography>
                <Typography variant="body2">
                  Certificate for: {formData.isSelf ? 'Self (own use)' : `${formData.guardian} (${formData.guardianRelation})`}
                </Typography>
                <Typography variant="body2">
                  Purpose: {formData.purpose === 'OTHER' ? formData.customPurpose : formData.purpose}
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
                Bring all required documents when claiming your certificate
              </Typography>
              <Typography component="li" variant="body2">
                The certificate is typically valid for 3-6 months
              </Typography>
              <Typography component="li" variant="body2">
                The certificate does not guarantee assistance from other agencies
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
  
export default RequestIndigency;