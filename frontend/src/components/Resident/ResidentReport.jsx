import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, MenuItem, 
  Grid, Paper, CircularProgress, Snackbar, Alert, CardMedia, Card, 
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import LocationIcon from '@mui/icons-material/LocationOn';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import CommentIcon from '@mui/icons-material/Comment';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import InputAdornment from '@mui/material/InputAdornment';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AlertTitle from '@mui/material/AlertTitle';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import API_BASE_URL from '../../config';

function ResidentReport() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [userReports, setUserReports] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    location: '',
    nearestLandmark: '',
    issueType: '',
    dateObserved: '',
    description: '',
    additionalComments: '',
  });
  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);

  // Fetch user's reports on component mount
  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      // Get user ID from local storage
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');

      if (!userId) {
        handleAlert('User ID not found', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reports/user?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();

      if (data.success) {
        setUserReports(data.reports);
      } else {
        handleAlert(data.message || 'Failed to fetch your reports', 'error');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user edits it
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file uploads with react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Handle accepted files
      const processedFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setFiles(processedFiles);

      // Handle rejected files
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map(e => {
          switch(e.code) {
            case 'file-too-large':
              return `${file.name} is too large (max 10MB)`;
            case 'file-invalid-type':
              return `${file.name} is not a supported file type`;
            default:
              return `${file.name} could not be uploaded`;
          }
        });
        return errorMessages;
      }).flat();
      
      setFileErrors(errors);
    }
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const validationErrors = {};
    let firstErrorField = null;
    
    // Required fields validation - add all fields that need validation
    const requiredFields = [
      { name: 'fullName', label: 'Full Name' },
      { name: 'contactNumber', label: 'Contact Number' },
      { name: 'location', label: 'Location' },
      { name: 'nearestLandmark', label: 'Nearest Landmark' },
      { name: 'issueType', label: 'Issue Type' },
      { name: 'dateObserved', label: 'Date Observed' },
      { name: 'description', label: 'Description' }
    ];
    
    // Check for empty required fields
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        validationErrors[field.name] = `${field.label} is required`;
        if (!firstErrorField) firstErrorField = field.name;
      }
    }
    
    // Phone number validation (basic)
    if (formData.contactNumber && !/^\d{10,11}$/.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      validationErrors.contactNumber = 'Please enter a valid phone number (10-11 digits)';
      if (!firstErrorField) firstErrorField = 'contactNumber';
    }
    
    // Check if the date is not in the future
    if (formData.dateObserved) {
      const selectedDate = new Date(formData.dateObserved);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        validationErrors.dateObserved = 'Date cannot be in the future';
        if (!firstErrorField) firstErrorField = 'dateObserved';
      }
    }
    
    // If there are validation errors, display only the first one and mark all invalid fields
    if (Object.keys(validationErrors).length > 0) {
      // Show alert with just the first error
      handleAlert(validationErrors[firstErrorField], 'error');
      
      // Mark all fields with errors
      setErrors(validationErrors);
      
      // Focus the first field with an error (this requires refs which might be complex to add)
      // We'll skip this for now but it's a good UX enhancement
      
      return; // Stop form submission
    }
    
    // Reset any previous errors
    setErrors({});
    
    // If validation passes, open confirmation dialog
    setOpenConfirmDialog(true);
  };

  // Create a new function for actual submission after confirmation
  const confirmSubmit = async () => {
    setLoading(true);

    try {
      // Get user ID from local storage
      const userId = localStorage.getItem('userId') || localStorage.getItem('user');

      if (!userId) {
        handleAlert('User ID not available. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      const formDataToSubmit = new FormData();
      
      // Add user ID to form data
      formDataToSubmit.append('userId', userId);

      // Add other form fields
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      
      // Add files to FormData
      if (files.length > 0) {
        console.log(`Attempting to upload ${files.length} files`);
        
        files.forEach((file, index) => {
          console.log(`Adding file to form: ${file.name}, size: ${file.size}, type: ${file.type}`);
          formDataToSubmit.append('media', file);
        });
      } else {
        console.log('No files to upload');
      }

      console.log('Submitting report data...');
      
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        body: formDataToSubmit
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        handleAlert(data.message || 'Report submitted successfully!', 'success');
        resetForm();
        fetchUserReports();
        setOpenConfirmDialog(false); // Close the dialog
      } else {
        handleAlert(data.message || 'Failed to submit report', 'error');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback for a report
  const submitFeedback = async (reportId, satisfied, comments) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ satisfied, comments })
      });

      const data = await response.json();

      if (data.success) {
        handleAlert('Feedback submitted successfully!', 'success');
        fetchUserReports();
      } else {
        handleAlert(data.message || 'Failed to submit feedback', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      fullName: '',
      contactNumber: '',
      location: '',
      nearestLandmark: '',
      issueType: '',
      dateObserved: '',
      description: '',
      additionalComments: '',
    });
    setFiles([]);
    setFileErrors([]);
  };

  // Handle alert messages
  const handleAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Render file previews
  const thumbs = files.map(file => {
  const isVideo = file.type.startsWith('video/');
  
  return (
    <Box
      key={file.name}
      sx={{
        display: 'inline-flex',
        borderRadius: 1,
        border: '1px solid #eaeaea',
        marginBottom: 1,
        marginRight: 1,
        width: 100,
        height: 100,
        padding: 0.5,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isVideo ? (
        // Video thumbnail with icon
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <VideoLibraryIcon sx={{ fontSize: 32 }} />
            <Typography variant="caption" display="block" sx={{ color: 'white', mt: 0.5 }}>
              Video
            </Typography>
          </Box>
        </Box>
      ) : (
        // Image thumbnail
        <Box sx={{ display: 'flex', minWidth: 0, overflow: 'hidden' }}>
          <img
            src={file.preview}
            style={{
              display: 'block',
              width: 'auto',
              height: '100%'
            }}
            onLoad={() => { URL.revokeObjectURL(file.preview) }}
            alt="preview"
          />
        </Box>
      )}
      
      {/* Filename label at the bottom */}
      <Box 
        sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '2px 4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
          {file.name.length > 14 ? file.name.substring(0, 12) + '...' : file.name}
        </Typography>
      </Box>
    </Box>
  );
});

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const issueTypes = [
    'Road Damage',
    'Street Light Issue',
    'Drainage Problem',
    'Waste Management',
    'Water Supply',
    'Electrical Issue',
    'Public Safety',
    'Others'
  ];

  // Add this method to your existing ResidentReport component
  const cancelReport = async (reportId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/cancel`, {
        method: 'PUT', // or 'PATCH' depending on your backend route
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        handleAlert('Report cancelled successfully!', 'success');
        fetchUserReports(); // Refresh the list of reports
      } else {
        handleAlert(data.message || 'Failed to cancel report', 'error');
      }
    } catch (error) {
      console.error('Error cancelling report:', error);
      handleAlert(error.message || 'An error occurred', 'error');
    }
  };

  // Helper function to render media galleries
  const renderMedia = (report) => {
    return (
      <>
        {/* Images Gallery */}
        {report.mediaUrls && report.mediaUrls.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={1}>
              {report.mediaUrls.map((imgPath, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      image={`${API_BASE_URL}${imgPath}`}
                      alt={`Report image ${index + 1}`}
                      sx={{ 
                        height: 200, 
                        objectFit: 'cover',
                        '&:hover': {
                          cursor: 'pointer',
                          opacity: 0.9
                        }
                      }}
                      onClick={() => window.open(`${API_BASE_URL}${imgPath}`, '_blank')}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
  <Box sx={{ width: '100%' }}>
    <Typography variant="h4" gutterBottom>
      Report Infrastructure Issue
    </Typography>
    <Box sx={{ mb: 4 }} />
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
        <ReportProblemOutlinedIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
        <Typography 
          variant="subtitle1" 
          sx={{ fontWeight: 600 }}
        >
          Infrastructure Issue Report Form
        </Typography>
      </Box>
      
      {/* Form Introduction */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Use this form to report any infrastructure issues in Barangay Maahas such as road damage, 
          street light problems, or drainage issues. Include photos to help our maintenance team address the problem quickly.
        </Typography>
      </Alert>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Reporter Information
          </Typography>
          <Box sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
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
                helperText={errors.fullName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                error={!!errors.contactNumber}
                helperText={errors.contactNumber}
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
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Issue Location Details
          </Typography>
          <Box sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                fullWidth
                label="Location of Issue"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                error={!!errors.location}
                helperText={errors.location}
                placeholder="e.g., Purok 2 Sampalukan"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '260px', sm: '260px', md: '280px' }
                  }}}
              />
            </Grid>
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                fullWidth
                label="Nearest Landmark"
                name="nearestLandmark"
                value={formData.nearestLandmark}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                error={!!errors.nearestLandmark}
                helperText={errors.nearestLandmark}
                placeholder="e.g., In front of Maahas 7/11"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '250px' // Adjust this value as needed
                  }}}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Issue Information
          </Typography>
          <Box sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                select
                fullWidth
                label="Issue Type"
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                error={!!errors.issueType}
                helperText={errors.issueType}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '180px' // Adjust this value as needed
                  }}}
              >
                {issueTypes.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                fullWidth
                label="Date of Observation"
                name="dateObserved"
                type="date"
                value={formData.dateObserved}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
                error={!!errors.dateObserved}
                helperText={errors.dateObserved}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                fullWidth
                label="Description of the Issue"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={3}
                variant="outlined"
                size="small"
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Provide a detailed description of the issue including its severity and impact..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: '-36px' }}>
                      <DescriptionIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiInputBase-root': {
                    width: '100%',
                    minWidth: { xs: '270px', sm: '280px', md: '300px' }
                  }}}
              />
            </Grid>
            <Grid item xs={12} sx={{minWidth: {xs: '100%', sm: '100%', md: 'auto'}}}>
              <TextField
                fullWidth
                label="Additional Comments/Suggestions"
                name="additionalComments"
                value={formData.additionalComments}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                size="small"
                placeholder="Any additional information that might help..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: '-24px' }}>
                      <CommentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '250px' // Adjust this value as needed
                  }}}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Upload Evidence
          </Typography>
          <Box sx={{ mb: 3 }} />
          <Box 
            {...getRootProps()} 
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(0, 0, 0, 0.03)'
              }
            }}
          >
            <input {...getInputProps()} name="media" />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <AddPhotoAlternateIcon color="primary" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="body2">
                Drag and drop files here, or click to select files
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                Supported formats: JPEG, PNG, MP4, MOV (Max 5 files, 10MB each)
              </Typography>
            </Box>
          </Box>
          {/* File error messages */}
          {fileErrors.length > 0 && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1 }}>
              {fileErrors.map((error, index) => (
                <Typography key={index} variant="caption" color="error" display="block" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                  {error}
                </Typography>
              ))}
            </Box>
          )}
          
          {/* File previews */}
          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                {files.length} file(s) selected:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {thumbs}
              </Box>
            </Box>
          )}
        </Box>
        
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
              All information provided is accurate to the best of your knowledge
            </Typography>
            <Typography component="li" variant="body2">
              You have included the exact location details for proper identification
            </Typography>
            <Typography component="li" variant="body2">
              You understand your report will be reviewed by our maintenance team before action
            </Typography>
            <Typography component="li" variant="body2">
              The more details and clearer photos you provide, the faster we can address the issue.
            </Typography>
          </Box>
        </Alert>
        
        {/* Alert messages */}
        {alert.open && (
          <Alert 
            severity={alert.severity} 
            onClose={closeAlert}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        )}
        
        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={resetForm}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Box>
      </Box>
    </Paper>

    {/* Alert/Snackbar for notifications */}
    <Snackbar 
      open={alert.open} 
      autoHideDuration={6000} 
      onClose={closeAlert}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
        {alert.message}
      </Alert>
    </Snackbar>
    {/* Confirmation Dialog */}
    <Dialog
      open={openConfirmDialog}
      onClose={() => setOpenConfirmDialog(false)}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReportProblemOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Confirm Infrastructure Issue Report</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please confirm you want to submit this infrastructure issue report:
        </DialogContentText>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary.main">Issue Type</Typography>
              <Typography variant="body2">{formData.issueType || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary.main">Location</Typography>
              <Typography variant="body2">{formData.location || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary.main">Nearest Landmark</Typography>
              <Typography variant="body2">{formData.nearestLandmark || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary.main">Description</Typography>
              <Typography variant="body2" 
                sx={{ 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {formData.description || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary.main">Media Files</Typography>
              <Typography variant="body2">{files.length} file(s) attached</Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Alert severity="info" variant="outlined">
          <Typography variant="body2">
            Your report will be reviewed by our maintenance team. We may contact you for additional information if needed.
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
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
        >
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
  </Container>
);
}
export default ResidentReport;