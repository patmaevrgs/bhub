import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Help as HelpIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  FilePresent as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TitleIcon from '@mui/icons-material/Title';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CategoryIcon from '@mui/icons-material/Category';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ParkIcon from '@mui/icons-material/Park';
import SchoolIcon from '@mui/icons-material/School';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import GroupsIcon from '@mui/icons-material/Groups';
import { format } from 'date-fns';
import API_BASE_URL from '../../config';

function ResidentProposal() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [userId] = useState(localStorage.getItem('user'));
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  // My Proposals state
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [openProposalDetails, setOpenProposalDetails] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // UI state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Load user's proposals
  useEffect(() => {
    if (userId) {
      fetchProposals();
    }
  }, [userId]);
  
  const fetchProposals = async () => {
    if (!userId) return;
    
    setProposalsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/proposals?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.proposals || []);
      } else {
        throw new Error(data.message || 'Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load your proposals',
        severity: 'error'
      });
    } finally {
      setProposalsLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    else if (!/^\d{10,11}$/.test(contactNumber.replace(/[^0-9]/g, ''))) {
      errors.contactNumber = 'Please enter a valid contact number';
    }
    
    if (!email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!projectTitle.trim()) errors.projectTitle = 'Project title is required';
    if (!description.trim()) errors.description = 'Project description is required';
    if (!file) errors.file = 'Project plan document is required';
    else {
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx'].includes(fileExt)) {
        errors.file = 'Only PDF or DOCX files are allowed';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // Clear any previous file error
      setFormErrors({
        ...formErrors,
        file: null
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    // If validation passes, open confirmation dialog
    setOpenConfirmDialog(true);
  };
  
  // Handle confirmed submission
  const confirmSubmit = async () => {
    setLoading(true);
    
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('user');
      if (!userId) {
        throw new Error('You must be logged in to submit a proposal');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('userId', userId); // Add the user ID to the form data
      formData.append('fullName', fullName);
      formData.append('contactNumber', contactNumber);
      formData.append('email', email);
      formData.append('projectTitle', projectTitle);
      formData.append('description', description);
      formData.append('document', file);
      
      // Submit the proposal
      const response = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error submitting proposal');
      }
      
      // Reset form on success
      setFullName('');
      setContactNumber('');
      setEmail('');
      setProjectTitle('');
      setDescription('');
      setFile(null);
      setFileName('');
      
      // Refresh proposals list
      fetchProposals();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your project proposal has been submitted successfully!',
        severity: 'success'
      });
      
      // Close the confirmation dialog
      setOpenConfirmDialog(false);
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit your proposal. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // View proposal details
  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setOpenProposalDetails(true);
  };
  
  // Cancel proposal
  const handleCancelProposal = (proposal) => {
    setSelectedProposal(proposal);
    setOpenCancelDialog(true);
  };
  
  // Confirm cancellation
  const confirmCancellation = async () => {
    if (!selectedProposal) return;
    
    setCancelLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${selectedProposal._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          cancellationReason
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel proposal');
      }
      
      // Close the dialog
      setOpenCancelDialog(false);
      setOpenProposalDetails(false);
      setCancellationReason('');
      
      // Refresh proposals list
      fetchProposals();
      
      setSnackbar({
        open: true,
        message: 'Your proposal has been cancelled successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error cancelling proposal:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to cancel your proposal',
        severity: 'error'
      });
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status chip for proposal
  const getStatusChip = (status) => {
    let color = 'default';
    let label = status;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'Pending';
        break;
      case 'in_review':
        color = 'info';
        label = 'In Review';
        break;
      case 'considered':
        color = 'primary';
        label = 'Considered';
        break;
      case 'approved':
        color = 'success';
        label = 'Approved';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      default:
        color = 'default';
        label = status.replace('_', ' ');
    }
    
    return <Chip size="small" label={label} color={color} />;
  };
  
  // Check if a proposal can be cancelled
  const canCancelProposal = (proposal) => {
    return !['approved', 'rejected'].includes(proposal.status);
  };
  
  // Close snackbar
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
        Project Proposal
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
          <DescriptionIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Project Proposal Form
          </Typography>
        </Box>
        
        {/* Form Introduction */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Help improve Barangay Maahas by submitting your project proposals. Fill out the form below with key details 
            of your idea. Projects can include infrastructure improvements, community services, environmental initiatives,
            or any idea that benefits our barangay.
          </Typography>
        </Alert>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Proposer Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Proposer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  variant="outlined"
                  size="small"
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '250px' // Adjust this value as needed
                  }}}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  variant="outlined"
                  size="small"
                  error={!!formErrors.contactNumber}
                  helperText={formErrors.contactNumber}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                  size="small"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  placeholder="e.g., email@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                  '& .MuiInputBase-root': {
                    minWidth: '240px' // Adjust this value as needed
                  }}}
                />
              </Grid>
            </Grid>
          </Box>
          {/* Project Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Project Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Title"
                  name="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  required
                  variant="outlined"
                  size="small"
                  error={!!formErrors.projectTitle}
                  helperText={formErrors.projectTitle}
                  placeholder="e.g., Community Garden Renovation"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                  size="small"
                  error={!!formErrors.description}
                  helperText={formErrors.description || "Provide details about objectives, location, beneficiaries, and expected impact"}
                  placeholder="Provide a detailed description of your project idea, including its purpose, objectives, and expected benefits to the community..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mt: '-48px' }}>
                        <DescriptionIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          
          {/* Document Upload Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Project Plan Document
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }} />
            <Box sx={{ mb: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  p: 1.5, 
                  borderStyle: 'dashed',
                  height: 100,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.01)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)'
                  }
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  hidden
                  onChange={handleFileChange}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Drag and drop or click to select file
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Supported formats: PDF, DOCX (Max 10MB)
                </Typography>
              </Button>
              {fileName && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1.5,
                    p: 1.5,
                    bgcolor: 'success.lighter', 
                    borderRadius: 1
                  }}
                >
                  <FileIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {fileName}
                  </Typography>
                </Box>
              )}
              {formErrors.file && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'error.lighter', borderRadius: 1 }}>
                  <Typography variant="caption" color="error" display="block" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                    {formErrors.file}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Your document should include details like project scope, timeline, resource requirements, and budget estimations if applicable. The more comprehensive your plan, the higher chance of consideration.
            </Typography>
          </Box>
          {/* Terms Section */}
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
                Your project proposal aims to benefit the Barangay Maahas community
              </Typography>
              <Typography component="li" variant="body2">
                You understand your proposal will be reviewed by the barangay officials
              </Typography>
              <Typography component="li" variant="body2">
                The more detailed your proposal, the better the chance of consideration
              </Typography>
            </Box>
          </Alert>
          
          {/* Status Messages */}
          {snackbar.open && (
            <Alert 
              severity={snackbar.severity} 
              onClose={handleCloseSnackbar}
              sx={{ mb: 2 }}
            >
              {snackbar.message}
            </Alert>
          )}
          
          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => {
                setFullName('');
                setContactNumber('');
                setEmail('');
                setProjectTitle('');
                setDescription('');
                setFile(null);
                setFileName('');
                setFormErrors({});
              }}
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
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Submission Guidelines - Full Width, More Organized */}
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
          <CheckCircleIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Submission Guidelines
          </Typography>
        </Box>
        
        <Typography variant="body2" paragraph sx={{ mb: 3, textAlign: 'center' }}>
          A well-crafted project proposal significantly increases your chances of receiving approval and funding. Please follow these guidelines to create an effective proposal:
        </Typography>
        
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                height: '100%',
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                Content Requirements
              </Typography>
              <List dense disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clearly define the project's purpose, objectives, and expected outcomes"
                  />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Include specific location details where the project will take place"
                  />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Identify the target beneficiaries and how they will benefit"
                  />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Provide an estimated timeline for implementation"
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                height: '100%',
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                Document Guidelines
              </Typography>
              <List dense disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Include a detailed budget breakdown if applicable"
                  />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Add visual materials like maps, diagrams, or photos as needed"
                  />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Reference any similar successful projects as examples"
                  />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Use a clear, organized format with section headings"
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
          
        </Grid>
      </Paper>

      {/* Project Categories & Ideas Section - Cleaner Organization */}
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
          <CategoryIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600 }}
          >
            Project Categories & Ideas
          </Typography>
        </Box>
        
        <Typography variant="body2" paragraph sx={{ mb: 3, textAlign: 'center' }}>
          Looking for inspiration? Here are some project categories and example ideas that could benefit our barangay:
        </Typography>
        
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          {/* Health & Wellness */}
          <Grid item xs={12} sm={6} md={4} sx={{ width: '45%' }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'error.lighter', 
                display: 'flex', 
                alignItems: 'center',
              }}>
                <LocalHospitalIcon sx={{ color: 'error.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2">Health & Wellness</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Projects that improve community health and wellbeing.
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Free health screening programs" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Community fitness stations" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Mental health awareness campaigns" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
          
          {/* Environment & Sustainability */}
          <Grid item xs={12} sm={6} md={4} sx={{ width: '45%' }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'success.lighter', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <ParkIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2">Environment & Sustainability</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Initiatives that protect our environment and promote sustainability.
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Urban gardening projects" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Waste segregation systems" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Tree planting campaigns" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
          
          {/* Education & Skills */}
          <Grid item xs={12} sm={6} md={4} sx={{ width: '45%' }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'primary.lighter', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <SchoolIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2">Education & Skills</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Programs that enhance knowledge and skills in the community.
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="After-school tutoring programs" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Digital literacy workshops" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Community library improvements" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
          
          {/* Infrastructure & Facilities */}
          <Grid item xs={12} sm={6} md={4} sx={{ width: '45%' }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'warning.lighter', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <EngineeringIcon sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2">Infrastructure & Facilities</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Projects that improve physical infrastructure in our barangay.
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Road repair and maintenance" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Street lighting improvements" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Drainage system upgrades" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
          
          {/* Community & Culture */}
          <Grid item xs={12} sm={6} md={4} sx={{ width: '45%' }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'secondary.lighter', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <CelebrationIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2">Community & Culture</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Initiatives that strengthen community bonds and preserve local culture.
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Community festivals and events" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Cultural heritage documentation" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Youth engagement programs" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
          
          {/* Safety & Emergency */}
          <Grid item xs={12} sm={6} md={4} sx={{ width: '45%' }}>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'info.lighter', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <SecurityIcon sx={{ color: 'info.main', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2">Safety & Emergency</Typography>
              </Box>
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Projects that enhance community safety and emergency preparedness.
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Disaster preparedness training" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Emergency equipment procurement" 
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowRightIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primaryTypographyProps={{ variant: 'body2' }}
                      primary="Community watch programs" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQs Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            pb: 0.5,
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
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What kind of projects can I propose?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  You can propose various projects that benefit the community, such as infrastructure improvements (road repairs, drainage systems),
                  community services and programs (health initiatives, educational workshops), environmental projects (waste management, tree planting),
                  social and cultural events (community festivals, youth programs), or public safety measures (streetlights, emergency response).
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>How long does it take to process a proposal?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  The initial review process typically takes 7-14 business days. Complex proposals may require additional time for thorough evaluation. 
                  You can track your proposal status in the Transactions page once submitted. The barangay council meets monthly to discuss proposals 
                  that have passed initial screening.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Do I need a detailed budget for my proposal?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  While a detailed budget is not strictly required for initial submission, proposals with well-researched cost estimates are more likely 
                  to receive serious consideration. At minimum, include a general budget range and key cost components in your project plan document.
                  For larger projects, a more detailed breakdown of expenses will strengthen your proposal.
                </Typography>
              </AccordionDetails>
            </Accordion>
          {/* </Grid> */}
          
          {/* <Grid item xs={12} md={6}> */}
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Can I submit multiple proposals?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Yes, you can submit multiple project proposals. However, we recommend focusing on quality rather than quantity. 
                  Each proposal should be well-thought-out and address distinct community needs. Consider submitting one proposal at a time and 
                  waiting for initial feedback before submitting additional ones.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What happens after my proposal is approved?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If your proposal is approved, a barangay representative will contact you to discuss next steps. This may include a planning meeting, 
                  resource allocation discussions, and establishing a timeline for implementation. You may be asked to participate in the project's 
                  execution, depending on the nature of your proposal and your availability.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>What if my proposal is rejected?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  If your proposal is not approved, you will receive feedback explaining the decision. Common reasons include budget constraints, 
                  scope limitations, or overlap with existing initiatives. We encourage you to review the feedback, revise your proposal, and 
                  resubmit if appropriate. Rejection doesn't mean your idea wasn't valuable - it may simply need refinement or better timing.
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
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
            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Confirm Project Proposal</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm you want to submit this project proposal:
          </DialogContentText>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Project Title</Typography>
                <Typography variant="body2">{projectTitle || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Proposer</Typography>
                <Typography variant="body2">{fullName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Category</Typography>
                <Typography variant="body2">Project Proposal</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary.main">Document</Typography>
                <Typography variant="body2">{fileName || 'No file attached'}</Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              Your proposal will be reviewed by the barangay officials. You can track its status in the Transactions page once submitted.
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
            Submit Proposal
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  </Container>
);
}

export default ResidentProposal;