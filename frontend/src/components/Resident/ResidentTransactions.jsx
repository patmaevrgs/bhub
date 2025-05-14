import React, { useState, useEffect } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  List,
  Link,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  FilePresent as FileIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  Room as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Event as EventIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import AlertTitle from '@mui/material/AlertTitle';
import { 
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import { format } from 'date-fns';

const ResidentTransaction = () => {
  // Get userId from localStorage
  const userId = localStorage.getItem('user');
  
  const SERVICE_TYPES = {
    AMBULANCE: 'ambulance_booking',
    COURT: 'court_reservation',
    INFRASTRUCTURE: 'infrastructure_report',
    PROJECT_PROPOSAL: 'project_proposal',
    DOCUMENT: 'document_request',
    RESIDENT: 'resident_registration',
    OTHER: 'other'
  };
  
  const STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    BOOKED: 'booked',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    NEEDS_APPROVAL: 'needs_approval',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    CONSIDERED: 'considered',
    RESOLVED: 'resolved'
  };

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackReportId, setFeedbackReportId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackSatisfied, setFeedbackSatisfied] = useState(true);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filter, setFilter] = useState('all');
  
  // Diesel response states
  const [openDieselDialog, setOpenDieselDialog] = useState(false);
  const [dieselResponseLoading, setDieselResponseLoading] = useState(false);
  
  // Add this helper function below your state declarations
  const formatStatusText = (status) => {
  if (!status) return '';
  // Convert snake_case to Title Case
  return status.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/transactions?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();

      // Process the transactions to include service IDs where possible
    const processedTransactions = await Promise.all(data.map(async (transaction) => {
      // Skip if there's no referenceId or not a service type we handle
      if (!transaction.referenceId || 
          ![SERVICE_TYPES.AMBULANCE, SERVICE_TYPES.COURT, SERVICE_TYPES.INFRASTRUCTURE, 
          SERVICE_TYPES.PROJECT_PROPOSAL, SERVICE_TYPES.DOCUMENT, SERVICE_TYPES.RESIDENT].includes(transaction.serviceType)) {
        return transaction;
      }
      
      try {
        // Determine the correct endpoint based on service type
        let endpoint;
        switch(transaction.serviceType) {
          case SERVICE_TYPES.AMBULANCE:
            endpoint = `http://localhost:3002/ambulance/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.COURT:
            endpoint = `http://localhost:3002/court/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.INFRASTRUCTURE:
            endpoint = `http://localhost:3002/reports/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.PROJECT_PROPOSAL:
            endpoint = `http://localhost:3002/proposals/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.DOCUMENT:
            endpoint = `http://localhost:3002/documents/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.RESIDENT:
            endpoint = `http://localhost:3002/residents/${transaction.referenceId}`;
            break;
          default:
            endpoint = null;
        }
        
        if (endpoint) {
          const serviceResponse = await fetch(endpoint);
          if (serviceResponse.ok) {
            const serviceData = await serviceResponse.json();
            
            // Extract service ID based on the service type
            let serviceId = null;
            if (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && serviceData.report) {
              serviceId = serviceData.report.serviceId;
            } else if (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && serviceData.proposal) {
              serviceId = serviceData.proposal.serviceId;
            } else if (transaction.serviceType === SERVICE_TYPES.DOCUMENT && serviceData.documentRequest) {
              serviceId = serviceData.documentRequest.serviceId;
            } else if (serviceData.serviceId) {
              serviceId = serviceData.serviceId;
            }
            
            // Add the service ID to the transaction
            if (serviceId) {
              if (!transaction.details) {
                transaction.details = {};
              }
              transaction.details.serviceId = serviceId;
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching service details for transaction ${transaction._id}:`, err);
      }
      
      return transaction;
    }));

      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load your transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (transactionId) => {
    try {
      // First, get the transaction details
      const response = await fetch(`http://localhost:3002/transactions/${transactionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const transaction = await response.json();
      
      // Now, fetch the reference details based on service type
      let referenceDetails = null;
      
      if (transaction.serviceType === 'court_reservation' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/court/${transaction.referenceId}`);
        if (refResponse.ok) {
          referenceDetails = await refResponse.json();
        }
      } else if (transaction.serviceType === 'ambulance_booking' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/ambulance/${transaction.referenceId}`);
        if (refResponse.ok) {
          referenceDetails = await refResponse.json();
          console.log('Ambulance booking details:', referenceDetails); // Debug log
        }
      } else if (transaction.serviceType === 'infrastructure_report') {
        // Try to get the report ID from either referenceId or details.reportId
        let reportId = transaction.referenceId;
        
        // If referenceId is not available, check details.reportId
        if (!reportId && transaction.details && transaction.details.reportId) {
          reportId = transaction.details.reportId;
        }
        
        if (reportId) {
          const refResponse = await fetch(`http://localhost:3002/reports/${reportId}`);
          if (refResponse.ok) {
            const reportData = await refResponse.json();
            if (reportData.success && reportData.report) {
              referenceDetails = reportData.report;
            }
          }
        }
      }
      else if (transaction.serviceType === 'document_request' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/documents/${transaction.referenceId}`);
        if (refResponse.ok) {
          const documentData = await refResponse.json();
          if (documentData.success && documentData.documentRequest) {
            referenceDetails = documentData.documentRequest;
          }
        }
      }
      else if (transaction.serviceType === 'project_proposal' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/proposals/${transaction.referenceId}`);
        if (refResponse.ok) {
          const proposalData = await refResponse.json();
          if (proposalData.success && proposalData.proposal) {
            referenceDetails = proposalData.proposal;
            
            // Store the original proposal status in the transaction details
            if (transaction.details && !transaction.details.proposalStatus) {
              transaction.details = {
                ...transaction.details,
                proposalStatus: proposalData.proposal.status
              };
            }
          }
        }
      }
      else if (transaction.serviceType === 'resident_registration' && transaction.referenceId) {
        const refResponse = await fetch(`http://localhost:3002/residents/${transaction.referenceId}`);
        if (refResponse.ok) {
          const residentData = await refResponse.json();
          if (residentData.success && residentData.data) {
            referenceDetails = residentData.data;
          }
        }
      }
      
      // Combine the data
      setSelectedTransaction({
        ...transaction,
        referenceDetails: referenceDetails
      });
      
      setOpenDetails(true);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load transaction details',
        severity: 'error'
      });
    }
  };

  // ServiceIdCell component for displaying service IDs in the table
  const ServiceIdCell = ({ transaction }) => {
    const [serviceId, setServiceId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      // Only fetch if we have a referenceId and the service type is one we can handle
      if (transaction.referenceId && 
          [SERVICE_TYPES.AMBULANCE, SERVICE_TYPES.COURT, SERVICE_TYPES.INFRASTRUCTURE, 
          SERVICE_TYPES.PROJECT_PROPOSAL, SERVICE_TYPES.DOCUMENT, SERVICE_TYPES.RESIDENT].includes(transaction.serviceType)) {
        
        setLoading(true);
        
        // Determine the correct endpoint based on service type
        let endpoint;
        switch(transaction.serviceType) {
          case SERVICE_TYPES.AMBULANCE:
            endpoint = `http://localhost:3002/ambulance/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.COURT:
            endpoint = `http://localhost:3002/court/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.INFRASTRUCTURE:
            endpoint = `http://localhost:3002/reports/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.PROJECT_PROPOSAL:
            endpoint = `http://localhost:3002/proposals/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.DOCUMENT:
            endpoint = `http://localhost:3002/documents/${transaction.referenceId}`;
            break;
          case SERVICE_TYPES.RESIDENT:
            endpoint = `http://localhost:3002/residents/${transaction.referenceId}`;
            break;
          default:
            endpoint = null;
        }
        
        if (endpoint) {
          fetch(endpoint)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              // For reports and other specialized services, the data structure might be different
              if (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && data && data.report) {
                if (data.report.serviceId) {
                  setServiceId(data.report.serviceId);
                }
              } else if (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && data && data.proposal) {
                if (data.proposal.serviceId) {
                  setServiceId(data.proposal.serviceId);
                }
              } else if (transaction.serviceType === SERVICE_TYPES.DOCUMENT && data && data.documentRequest) {
                if (data.documentRequest.serviceId) {
                  setServiceId(data.documentRequest.serviceId);
                }
              } else if (data && data.serviceId) {
                setServiceId(data.serviceId);
              }
              setLoading(false);
            })
            .catch(err => {
              console.error(`Error fetching service ID for ${transaction.serviceType}:`, err);
              setLoading(false);
            });
        }
      } else if (transaction.details && transaction.details.serviceId) {
        // If the service ID is already in the transaction details, use it directly
        setServiceId(transaction.details.serviceId);
      }
    }, [transaction]);

    // Don't show anything for service types we don't handle
    if (![SERVICE_TYPES.AMBULANCE, SERVICE_TYPES.COURT, SERVICE_TYPES.INFRASTRUCTURE,
          SERVICE_TYPES.PROJECT_PROPOSAL, SERVICE_TYPES.DOCUMENT].includes(transaction.serviceType)) {
      return <span>-</span>;
    }

    return (
      <>
        {loading ? (
          <CircularProgress size={16} />
        ) : (
          serviceId || 
          transaction.details?.serviceId || 
          (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.referenceDetails?.serviceId) ||
          (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.referenceDetails?.serviceId) ||
          (transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.referenceDetails?.serviceId) ||
          'N/A'
        )}
      </>
    );
  };

  const submitFeedback = async () => {
    if (!feedbackReportId) {
      setSnackbar({
        open: true,
        message: 'Cannot submit feedback: Missing report reference',
        severity: 'error'
      });
      return;
    }
    
    setFeedbackSubmitting(true);
    
    try {
      console.log('Submitting feedback for report:', feedbackReportId);
      
      const response = await fetch(`http://localhost:3002/reports/${feedbackReportId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satisfied: feedbackSatisfied,
          comments: feedbackComments
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setOpenFeedbackDialog(false);
      setOpenDetails(false); // Close both dialogs
      setFeedbackComments('');
      setFeedbackSatisfied(true);
      setFeedbackReportId(null); // Clear the stored ID
      fetchTransactions();
      setSnackbar({
        open: true,
        message: 'Your feedback has been submitted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit your feedback: ' + err.message,
        severity: 'error'
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleCancelRequest = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenCancel(true);
  };

  const confirmCancel = async () => {
    try {
      let cancelEndpoint = '';
      let method = 'PATCH'; // Default method for ambulance and court
      
      if (selectedTransaction.serviceType === 'ambulance_booking' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/ambulance/${selectedTransaction.referenceId}/cancel`;
      } else if (selectedTransaction.serviceType === 'court_reservation' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/court/${selectedTransaction.referenceId}/cancel`;
      } else if (selectedTransaction.serviceType === 'infrastructure_report' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/reports/${selectedTransaction.referenceId}/cancel`;
        method = 'PUT'; // Use PUT for report cancellation as defined in your router
      } else if (selectedTransaction.serviceType === 'project_proposal' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/proposals/${selectedTransaction.referenceId}/cancel`;
        method = 'PATCH';
      } else if (selectedTransaction.serviceType === 'document_request' && selectedTransaction.referenceId) {
        cancelEndpoint = `http://localhost:3002/documents/${selectedTransaction.referenceId}/cancel`;
        method = 'PATCH';
      } else if (selectedTransaction.serviceType === 'resident_registration' && selectedTransaction.referenceId) {
          cancelEndpoint = `http://localhost:3002/residents/${selectedTransaction.referenceId}/cancel`;
          method = 'PATCH';
      } else {
        throw new Error('Cannot cancel this type of transaction');
      }
      
      const response = await fetch(cancelEndpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          cancellationReason
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel request');
      }
      
      setOpenCancel(false);
      setCancellationReason('');
      fetchTransactions();
      setSnackbar({
        open: true,
        message: 'Your request has been cancelled successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error cancelling request:', err);
      setSnackbar({
        open: true,
        message: 'Failed to cancel your request: ' + err.message,
        severity: 'error'
      });
    }
  };

  // Diesel cost response functions
  const handleRespondToDiesel = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDieselDialog(true);
  };

  const handleDieselCostDecision = async (accept) => {
    setDieselResponseLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3002/ambulance/${selectedTransaction.referenceId}/resident-response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          acceptDieselCost: accept,
          userId: userId 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Close the dialog and show success message
      setOpenDieselDialog(false);
      setSnackbar({
        open: true,
        message: accept 
          ? 'You have agreed to cover the diesel cost' 
          : 'You have declined to cover the diesel cost',
        severity: 'success'
      });
      
      // Refresh transactions list
      fetchTransactions();
    } catch (error) {
      console.error('Error responding to diesel cost:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit your response. Please try again.',
        severity: 'error'
      });
    } finally {
      setDieselResponseLoading(false);
    }
  };

  const needsDieselResponse = (transaction) => {
    return (
      transaction.status === 'needs_approval' && 
      transaction.serviceType === 'ambulance_booking'
    );
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedTransaction(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Updated getStatusChip function to display correct status for document requests
  const getStatusChip = (status, serviceType, transaction) => {
    let color = 'default';
    let label = status;
    
    // Add handling for resident_registration
    if (serviceType === SERVICE_TYPES.RESIDENT) {
      switch (status) {
        case STATUS.PENDING:
          return <Chip size="small" label="Pending" color="warning" />;
        case STATUS.APPROVED:
          return <Chip size="small" label="Approved" color="success" />;
        case STATUS.CANCELLED:
          const isCancelledByResident = transaction?.details?.cancellationReason && 
                                      !transaction?.processedBy;
          return <Chip 
            size="small" 
            label="Cancelled"
            color="error" 
          />;
        case STATUS.REJECTED:
          return <Chip size="small" label="Rejected" color="error" />;
        default:
          return <Chip size="small" label={formatStatusText(status)} color="default" />;
      }
    }

    // Document Request status mapping
    if (serviceType === SERVICE_TYPES.DOCUMENT) {
      // Use reference details status if available
      if (transaction?.referenceDetails?.status) {
        const docStatus = transaction.referenceDetails.status;
        
        switch (docStatus) {
          case STATUS.PENDING:
            color = 'warning';
            label = 'Pending';
            break;
          case STATUS.IN_PROGRESS:
            color = 'primary';
            label = 'In Progress';
            break;
          case STATUS.COMPLETED:
            color = 'success';
            label = 'Completed';
            break;
          case STATUS.REJECTED:
            color = 'error';
            label = 'Rejected';
            break;
          case STATUS.CANCELLED:
            color = 'default';
            label = 'Cancelled';
            break;
          default:
            color = 'default';
            label = formatStatusText(docStatus);
        }
        
        return <Chip size="small" label={label} color={color} />;
      }
      
      // If reference details not available, map from transaction status
      switch (status) {
        case STATUS.PENDING:
          color = 'warning';
          label = 'Pending';
          break;
        case STATUS.APPROVED:
          color = 'primary';
          label = 'In Progress';
          break;
        case STATUS.COMPLETED:
          color = 'success';
          label = 'Completed';
          break;
        case STATUS.CANCELLED:
        case STATUS.REJECTED:
          color = 'error';
          label = 'Cancelled';
          break;
        default:
          color = 'default';
          label = formatStatusText(status);
      }
      
      return <Chip size="small" label={label} color={color} />;
    }
    
    // Project Proposal status mapping
    if (serviceType === SERVICE_TYPES.PROJECT_PROPOSAL) {
      switch (status) {
        case STATUS.PENDING:
          color = 'warning';
          label = 'Pending';
          break;
        case STATUS.APPROVED: // Maps to 'considered' in proposal terms
          color = 'primary';
          label = 'Considered';
          break;
        case STATUS.COMPLETED: // Maps to 'approved' in proposal terms
          color = 'success';
          label = 'Approved';
          break;
        case STATUS.CANCELLED: // Maps to 'rejected' in proposal terms
        case STATUS.REJECTED:
          color = 'error';
          label = 'Rejected';
          break;
        case STATUS.NEEDS_APPROVAL:
          color = 'info';
          label = 'In Review';
          break;
        default:
          color = 'default';
          label = formatStatusText(status);
      }
      
      return <Chip size="small" label={label} color={color} />;
    }
  
    // Infrastructure Report status mapping
    if (serviceType === SERVICE_TYPES.INFRASTRUCTURE) {
      // Map transaction status back to Report status
      switch (status) {
        case STATUS.PENDING:
          color = 'warning';
          label = 'Pending';
          break;
        case STATUS.APPROVED:
          color = 'primary';
          label = 'In Progress';
          break;
        case STATUS.COMPLETED:
          color = 'success';
          label = 'Resolved';
          break;
        case STATUS.CANCELLED:
        case STATUS.REJECTED:
          color = 'error';
          label = 'Cancelled';
          break;
        default:
          color = 'default';
          label = formatStatusText(status);
      }
      return <Chip size="small" label={label} color={color} />;
    }
  
    // Regular transaction status handling for other service types
    switch (status) {
      case STATUS.PENDING:
        color = 'warning';
        label = 'Pending';
        break;
      case STATUS.APPROVED:
      case STATUS.BOOKED:
        color = 'primary';
        label = 'Approved';
        break;
      case STATUS.COMPLETED:
        color = 'success';
        label = 'Completed';
        break;
      case STATUS.CANCELLED:
      case STATUS.REJECTED:
        color = 'error';
        label = 'Cancelled';
        break;
      case STATUS.NEEDS_APPROVAL:
        color = 'info';
        label = 'Needs Approval';
        break;
      default:
        color = 'default';
        label = formatStatusText(status);
    }
  
    return <span className="status-chip-wrapper">{<Chip size="small" label={label} color={color} />}</span>;
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case SERVICE_TYPES.AMBULANCE:
        return 'Ambulance Booking';
      case SERVICE_TYPES.COURT:
        return 'Court Reservation';
      case SERVICE_TYPES.INFRASTRUCTURE:
        return 'Infrastructure Report';
      case SERVICE_TYPES.PROJECT_PROPOSAL:
        return 'Project Proposal';
      case SERVICE_TYPES.DOCUMENT:
        return 'Document Request';
      case SERVICE_TYPES.RESIDENT:
        return 'Resident Registration';
      case SERVICE_TYPES.OTHER:
        return 'Other Service';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  // Function to check if a transaction can be cancelled
  const canCancel = (transaction) => {
    // For document requests
    if (transaction.serviceType === SERVICE_TYPES.DOCUMENT) {
      // If we have reference details with original status
      if (transaction.referenceDetails && transaction.referenceDetails.status) {
        // Only allow cancellation if status is 'pending'
        return transaction.referenceDetails.status === STATUS.PENDING;
      }
      // Otherwise use transaction status
      return transaction.status === STATUS.PENDING;
    }
    
    // Special case for project proposals
    if (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL) {
      // First check if referenceDetails has a status
      if (transaction.referenceDetails && transaction.referenceDetails.status) {
        const status = transaction.referenceDetails.status.toLowerCase();
        // If status contains "reject" or "cancel" or is "approved" or "completed", don't allow cancellation
        if (status.includes('reject') || status.includes('cancel') || 
            status === 'approved' || status === 'completed') {
          return false;
        }
      }
      
      // Then check details.proposalStatus
      if (transaction.details && transaction.details.proposalStatus) {
        const status = transaction.details.proposalStatus.toLowerCase();
        // If status contains "reject" or "cancel" or is "approved" or "completed", don't allow cancellation
        if (status.includes('reject') || status.includes('cancel') || 
            status === 'approved' || status === 'completed') {
          return false;
        }
      }
      
      // Finally check transaction status
      const status = transaction.status.toLowerCase();
      // If status contains "reject" or "cancel" or is "approved" or "completed", don't allow cancellation
      if (status.includes('reject') || status.includes('cancel') || 
          status === 'approved' || status === 'completed') {
        return false;
      }
      
      // If none of the above conditions were met, allow cancellation
      return true;
    }
    
    // Special case for infrastructure reports
    if (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE) {
      // Only allow cancellation if status is 'pending' 
      return transaction.status === STATUS.PENDING;
    }
    
    // Special case for resident registration
    if (transaction.serviceType === SERVICE_TYPES.RESIDENT) {
      // Only allow cancellation if status is 'pending'
      return transaction.status === STATUS.PENDING;
    }

    // For other transaction types
    return [STATUS.PENDING, STATUS.NEEDS_APPROVAL, STATUS.BOOKED, STATUS.APPROVED].includes(transaction.status)
      && transaction.status !== STATUS.COMPLETED;
  };

  const searchFilter = (transaction) => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    
    // Search in service type
    if (getServiceTypeLabel(transaction.serviceType).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in status
    if (formatStatusText(transaction.status).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in dates
    if (formatDate(transaction.createdAt).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in service ID (now preloaded in details)
    if (transaction.details?.serviceId && 
      transaction.details.serviceId.toLowerCase().includes(searchLower)) {
        return true;
    }
    
    if (transaction.details?.serviceId && 
        transaction.details.serviceId.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in details fields based on service type
    if (transaction.serviceType === SERVICE_TYPES.AMBULANCE && transaction.details) {
      if ((transaction.details.patientName && transaction.details.patientName.toLowerCase().includes(searchLower)) ||
          (transaction.details.destination && transaction.details.destination.toLowerCase().includes(searchLower))) {
        return true;
      }
    } else if (transaction.serviceType === SERVICE_TYPES.COURT && transaction.details) {
      if ((transaction.details.purpose && transaction.details.purpose.toLowerCase().includes(searchLower)) ||
          (transaction.details.courtName && transaction.details.courtName.toLowerCase().includes(searchLower))) {
        return true;
      }
    } else if (transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.details) {
      if ((transaction.details.issueType && transaction.details.issueType.toLowerCase().includes(searchLower)) ||
          (transaction.details.location && transaction.details.location.toLowerCase().includes(searchLower))) {
        return true;
      }
    } else if (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.details) {
      if (transaction.details.projectTitle && transaction.details.projectTitle.toLowerCase().includes(searchLower)) {
        return true;
      }
    } else if (transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.details) {
      if (transaction.details.documentType && transaction.details.documentType.toLowerCase().includes(searchLower)) {
        return true;
      }
    } else if (transaction.serviceType === SERVICE_TYPES.RESIDENT && transaction.details) {
      if ((transaction.details.firstName && transaction.details.firstName.toLowerCase().includes(searchLower)) ||
          (transaction.details.lastName && transaction.details.lastName.toLowerCase().includes(searchLower)) ||
          (transaction.details.address && transaction.details.address.toLowerCase().includes(searchLower))) {
        return true;
      }
    }
    
    return false;
  };

  const filteredTransactions = filter === 'all' 
  ? transactions.filter(searchFilter) 
  : transactions.filter(transaction => {
      if (!searchFilter(transaction)) return false;
      if (filter === 'active') {
        return [STATUS.PENDING, STATUS.BOOKED, STATUS.NEEDS_APPROVAL, STATUS.APPROVED, STATUS.IN_PROGRESS].includes(transaction.status);
      } else if (filter === 'ambulance') {
        return transaction.serviceType === SERVICE_TYPES.AMBULANCE;
      } else if (filter === 'document') {
        return transaction.serviceType === SERVICE_TYPES.DOCUMENT;
      } else if (filter === 'court') {
        return transaction.serviceType === SERVICE_TYPES.COURT;
      } else if (filter === 'infrastructure') {
        return transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE;
      } else if (filter === 'project_proposal') {
        return transaction.serviceType && 
       (transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL || 
        transaction.serviceType.toLowerCase().trim() === 'project_proposal');
      } else if (filter === 'resident_registration') {
        return transaction.serviceType === SERVICE_TYPES.RESIDENT;
      } else if (filter === 'approved') {
        return [STATUS.APPROVED, STATUS.BOOKED].includes(transaction.status);
      } else if (filter === 'booked') {
        return [STATUS.BOOKED, STATUS.APPROVED].includes(transaction.status);
      } else if (filter === 'rejected') {
        return transaction.status === STATUS.REJECTED;
      } else {
        return transaction.status === filter;
      }
    });


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // No transactions found
  if (!loading && transactions.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Transactions
        </Typography>
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Box sx={{ py: 3 }}>
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'primary.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" gutterBottom>No transactions found</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              You don't have any transactions yet. When you book services or request documents, 
              they will appear here.
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={fetchTransactions}>
              <RefreshIcon sx={{ mr: 1 }} /> Refresh
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4, px: 1 }}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1">
                My Transactions
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'} found
              </Typography>
            </Box>
            <IconButton onClick={fetchTransactions} sx={{ color: 'white' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Paper>
        <Box sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="filter-select-label">Filter</InputLabel>
            <Select
              labelId="filter-select-label"
              value={filter}
              label="Filter"
              onChange={handleFilterChange}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="active">Active Transactions</MenuItem>
              <Divider />
              <MenuItem value="ambulance">Ambulance Bookings</MenuItem>
              <MenuItem value="court">Court Reservations</MenuItem>
              <MenuItem value="document">Document Requests</MenuItem>
              <MenuItem value="infrastructure">Infrastructure Reports</MenuItem>
              <MenuItem value="project_proposal">Project Proposals</MenuItem>
              <MenuItem value="resident_registration">Resident Registration</MenuItem>
              <Divider />
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mb: 1 }} />
          <TextField
            placeholder="Search transactions..."
            fullWidth
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ bgcolor: 'background.paper' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchText('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredTransactions.map((transaction) => (
            <Paper key={transaction._id} sx={{ mb: 2, overflow: 'hidden' }}>
              <ListItem 
                component="div" 
                onClick={() => handleViewDetails(transaction._id)}
                sx={{ 
                  borderLeft: '4px solid',
                  borderLeftColor: (() => {
                    switch(transaction.status) {
                      case 'pending': return 'warning.main';
                      case 'approved':
                      case 'booked': return 'primary.main';
                      case 'completed': return 'success.main';
                      case 'cancelled': return 'error.main';
                      case 'needs_approval': return 'info.main';
                      default: return 'grey.500';
                    }
                  })(),
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  py: 1.5
                }}
              >
                <ListItemText
                  primary={getServiceTypeLabel(transaction.serviceType)}
                  secondary={
                    <Box component="div">
                      <Box component="span" display="flex" alignItems="center">
                        <span>{getStatusChip(transaction.status, transaction.serviceType, transaction)}</span>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </Box>
                      {needsDieselResponse(transaction) && (
                        <Chip 
                          size="small" 
                          label="Action Required" 
                          color="secondary" 
                          sx={{ mt: 1 }}
                          variant="outlined"
                        />
                      )}
                      {/* Display consistent transaction details based on service type */}
                      {transaction.serviceType === SERVICE_TYPES.AMBULANCE && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.patientName || 'Patient N/A'} • {transaction.details.destination || 'Destination N/A'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.COURT && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {formatDate(transaction.details.reservationDate)} • {transaction.details.courtName || 'Court'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.issueType || 'Report'} • {transaction.details.location || 'Location N/A'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {transaction.details.projectTitle || 'Project Proposal'}
                        </Typography>
                      )}
                      {transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.details && (
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {(() => {
                            const docType = transaction.details.documentType;
                            switch(docType) {
                              case 'barangay_id': return 'Barangay ID';
                              case 'barangay_clearance': return 'Barangay Clearance';
                              case 'business_clearance': return 'Business Clearance';
                              case 'certificate_of_indigency': return 'Certificate of Indigency';
                              default: return docType?.replace('_', ' ') || 'Document';
                            }
                          })()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="view" onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(transaction._id);
                  }}>
                    <VisibilityIcon />
                  </IconButton>
                  {needsDieselResponse(transaction) && (
                    <IconButton 
                      edge="end" 
                      aria-label="respond" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRespondToDiesel(transaction);
                      }} 
                      color="secondary"
                    >
                      <ReplyIcon />
                    </IconButton>
                  )}
                  {canCancel(transaction) && (
                    <IconButton 
                      edge="end" 
                      aria-label="cancel" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelRequest(transaction);
                      }} 
                      color="error"
                    >
                      <CancelIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>
        {/* Transaction Details Dialog - Mobile & Desktop (shared) */}
        <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ 
            sx: { 
            borderRadius: '8px',
            overflow: 'hidden'
            } 
        }}
        >
        <DialogTitle sx={{ 
            borderBottom: '1px solid #eee', 
            backgroundColor: '#f8f9fa',
            px: 3, 
            py: 2 
        }}>
            {selectedTransaction && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                    {getServiceTypeLabel(selectedTransaction.serviceType)}
                </Typography>
                {getStatusChip(selectedTransaction.status, selectedTransaction.serviceType, selectedTransaction)}
                </Box>
                <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
                size="small"
                >
                <CancelIcon />
                </IconButton>
            </Box>
            )}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
            {selectedTransaction && (
                <Box sx={{ overflowX: 'hidden' }}>
                    {/* Transaction Summary Card */}
                    <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Service ID
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedTransaction.referenceDetails?.serviceId || 
                            selectedTransaction.details?.serviceId || 'N/A'}
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Status
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatStatusText(selectedTransaction.status)}
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Created
                        </Typography>
                        <Typography variant="body1">
                            {formatDate(selectedTransaction.createdAt)}
                        </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Last Updated
                        </Typography>
                        <Typography variant="body1">
                            {formatDate(selectedTransaction.updatedAt)}
                        </Typography>
                        </Grid>
                        {selectedTransaction.amount > 0 && (
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                            Amount
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            ₱{selectedTransaction.amount.toFixed(2)}
                            </Typography>
                        </Grid>
                        )}
                    </Grid>
                    </Paper>
                    
                    <Grid container spacing={2}>
                  
                    {/* Ambulance Booking Details */}
                    {selectedTransaction.serviceType === 'ambulance_booking' && (
                    <>
                        <Grid item xs={12}>
                        <Box sx={{ 
                            mt: 2, 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#f8f9fa', 
                            p: 1.5, 
                            borderRadius: '8px',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main' 
                        }}>
                            <HospitalIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" component="h3">
                            Ambulance Booking Information
                            </Typography>
                        </Box>
                        </Grid>
                        
                        {selectedTransaction.referenceDetails && (
                        <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                            <CardContent sx={{ px: 2, py: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    {selectedTransaction.referenceDetails.serviceId && (
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Service ID" 
                                        secondary={selectedTransaction.referenceDetails.serviceId} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                    </ListItem>
                                    )}
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Patient Name" 
                                        secondary={selectedTransaction.referenceDetails.patientName} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Pickup Date" 
                                        secondary={formatDate(selectedTransaction.referenceDetails.pickupDate)} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <TimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Pickup Time" 
                                        secondary={selectedTransaction.referenceDetails.pickupTime} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Duration" 
                                        secondary={selectedTransaction.referenceDetails.duration} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Pickup Address" 
                                        secondary={selectedTransaction.referenceDetails.pickupAddress} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Destination" 
                                        secondary={selectedTransaction.referenceDetails.destination} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Contact Number" 
                                        secondary={selectedTransaction.referenceDetails.contactNumber} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Submitter Relation" 
                                        secondary={selectedTransaction.referenceDetails.submitterRelation} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Diesel Cost Required" 
                                        secondary={selectedTransaction.details?.dieselCost ? 'Yes' : 'No'} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                {/* Additional Details Section */}
                                {(selectedTransaction.referenceDetails.emergencyDetails || 
                                selectedTransaction.referenceDetails.additionalNote) && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    {selectedTransaction.referenceDetails.emergencyDetails && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Emergency Details
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff9f0' }}>
                                        <Typography variant="body1">
                                            {selectedTransaction.referenceDetails.emergencyDetails}
                                        </Typography>
                                        </Paper>
                                    </Box>
                                    )}
                                    
                                    {selectedTransaction.referenceDetails.additionalNote && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Additional Notes
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                        <Typography variant="body1">
                                            {selectedTransaction.referenceDetails.additionalNote}
                                        </Typography>
                                        </Paper>
                                    </Box>
                                    )}
                                </Grid>
                                )}
                            </Grid>
                            </CardContent>
                        </Card>
                        )}
                    </>
                    )}
                  
                    {/* Court Reservation Details */}
                    {selectedTransaction.serviceType === 'court_reservation' && (
                    <>
                        <Grid item xs={12}>
                        <Box sx={{ 
                            mt: 2, 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#f8f9fa', 
                            p: 1.5, 
                            borderRadius: '8px',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main' 
                        }}>
                            <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" component="h3">
                            Court Reservation Information
                            </Typography>
                        </Box>
                        </Grid>
                        
                        {/* From referenceDetails - more comprehensive information */}
                        {selectedTransaction.referenceDetails && (
                        <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                            <CardContent sx={{ px: 2, py: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Service ID" 
                                        secondary={selectedTransaction.referenceDetails.serviceId || 'N/A'} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Representative" 
                                        secondary={selectedTransaction.referenceDetails.representativeName} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Date" 
                                        secondary={formatDate(selectedTransaction.referenceDetails.reservationDate)}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <TimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Time" 
                                        secondary={selectedTransaction.referenceDetails.startTime}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Duration" 
                                        secondary={`${selectedTransaction.referenceDetails.duration} hours`}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Contact Number" 
                                        secondary={selectedTransaction.referenceDetails.contactNumber}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Purpose" 
                                        secondary={selectedTransaction.referenceDetails.purpose}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Number of People" 
                                        secondary={selectedTransaction.referenceDetails.numberOfPeople}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                {selectedTransaction.referenceDetails.additionalNotes && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Additional Notes
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                                        {selectedTransaction.referenceDetails.additionalNotes}
                                    </Typography>
                                    </Box>
                                </Grid>
                                )}
                            </Grid>
                            </CardContent>
                        </Card>
                        )}
                    </>
                    )}
                  
                    {/* Document Request Details */}
                    {selectedTransaction?.serviceType === 'document_request' && (
                    <>
                        <Grid item xs={12}>
                        <Box sx={{ 
                            mt: 2, 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#f8f9fa', 
                            p: 1.5, 
                            borderRadius: '8px',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main' 
                        }}>
                            <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" component="h3">
                            Document Request Information
                            </Typography>
                        </Box>
                        </Grid>
                        
                        {selectedTransaction.referenceDetails && (
                        <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                            <CardContent sx={{ px: 2, py: 2 }}>
                            <Grid container spacing={2}>
                                {/* Document summary - Left column */}
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <FileIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Document Type" 
                                        secondary={
                                        (() => {
                                            const docType = selectedTransaction.details?.documentType;
                                            switch(docType) {
                                            case 'barangay_id': return 'Barangay ID';
                                            case 'barangay_clearance': return 'Barangay Clearance';
                                            case 'business_clearance': return 'Business Clearance';
                                            case 'lot_ownership': return 'Lot Ownership';
                                            case 'digging_permit': return 'Digging Permit';
                                            case 'fencing_permit': return 'Fencing Permit';
                                            case 'request_for_assistance': return 'Request for Assistance';
                                            case 'certificate_of_indigency': return 'Certificate of Indigency';
                                            case 'certificate_of_residency': return 'Certificate of Residency';
                                            case 'no_objection_certificate': return 'No Objection Certificate';
                                            default: return docType;
                                            }
                                        })()
                                        } 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Service ID" 
                                        secondary={selectedTransaction.referenceDetails.serviceId || 'N/A'} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                {/* Document summary - Right column */}
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Purpose" 
                                        secondary={
                                        selectedTransaction.referenceDetails.documentType === 'digging_permit' && 
                                        selectedTransaction.referenceDetails.formData && 
                                        selectedTransaction.referenceDetails.formData.diggingPurpose
                                            ? (() => {
                                                const purpose = selectedTransaction.referenceDetails.formData.diggingPurpose;
                                                switch(purpose) {
                                                case 'water_supply': return 'Water Supply Connection';
                                                case 'electrical': return 'Electrical Connection';
                                                case 'drainage': return 'Drainage System';
                                                case 'other': return 'Other';
                                                default: return purpose;
                                                }
                                            })()
                                            : selectedTransaction.referenceDetails.purpose
                                        }
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Status" 
                                        secondary={
                                        (() => {
                                            const status = selectedTransaction.referenceDetails.status;
                                            switch(status) {
                                            case 'pending': return 'Pending';
                                            case 'in_progress': return 'In Progress';
                                            case 'completed': return 'Completed';
                                            case 'rejected': return 'Rejected';
                                            case 'cancelled': return 'Cancelled';
                                            default: return status.replace('_', ' ');
                                            }
                                        })()
                                        }
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                {/* Document Type-specific Sections */}
                                {selectedTransaction.referenceDetails.documentType && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                    Document Details
                                    </Typography>
                                    
                                    {/* Certificate of Residency */}
                                    {selectedTransaction.referenceDetails.documentType === 'certificate_of_residency' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Age" 
                                                secondary={selectedTransaction.referenceDetails.formData.age} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address} Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Date of Birth" 
                                                secondary={
                                                selectedTransaction.referenceDetails.formData.dateOfBirth ? 
                                                format(new Date(selectedTransaction.referenceDetails.formData.dateOfBirth), 'MMM dd, yyyy') : 
                                                'N/A'
                                                } 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Place of Birth" 
                                                secondary={selectedTransaction.referenceDetails.formData.placeOfBirth} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                          <ListItem sx={{ px: 0, py: 0.75 }}>
                                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                              <ListItemText 
                                                  primary="Mother's Name" 
                                                  secondary={selectedTransaction.referenceDetails.formData.motherName || 'N/A'} 
                                                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                              />
                                              </ListItem>
                                              
                                              <ListItem sx={{ px: 0, py: 0.75 }}>
                                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                              <ListItemText 
                                                  primary="Father's Name" 
                                                  secondary={selectedTransaction.referenceDetails.formData.fatherName || 'N/A'} 
                                                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                              />
                                            </ListItem>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Nationality" 
                                                secondary={selectedTransaction.referenceDetails.formData.nationality} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Civil Status" 
                                                secondary={selectedTransaction.referenceDetails.formData.civilStatus} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Years of Stay" 
                                                secondary={selectedTransaction.referenceDetails.formData.yearsOfStay} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}
                                    
                                    {/* Barangay Clearance */}
                                    {selectedTransaction.referenceDetails.documentType === 'barangay_clearance' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Gender" 
                                                secondary={selectedTransaction.referenceDetails.formData.gender === 'male' ? 'Male' : 'Female'} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna 4030`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}
                                    
                                    {/* Continue with other document types in similar format */}
                                    {/* Lot Ownership */}
                                    {selectedTransaction.referenceDetails.documentType === 'lot_ownership' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="TD Number" 
                                                secondary={selectedTransaction.referenceDetails.formData.tdNumber} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Survey Number" 
                                                secondary={selectedTransaction.referenceDetails.formData.surveyNumber} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Lot Area" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.lotArea} ${
                                                (() => {
                                                    const areaUnit = selectedTransaction.referenceDetails.formData.areaUnit;
                                                    switch(areaUnit) {
                                                    case 'square_meters': return 'square meters';
                                                    case 'square_feet': return 'square feet';
                                                    case 'hectares': return 'hectares';
                                                    default: return areaUnit;
                                                    }
                                                })()
                                                }`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Property Location" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Owner Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Owner Address" 
                                                secondary={selectedTransaction.referenceDetails.formData.ownerAddress} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}
                                    
                                    {/* Barangay ID */}
                                    {selectedTransaction.referenceDetails.documentType === 'barangay_id' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="First Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.firstName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Middle Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.middleName || 'N/A'} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Last Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.lastName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Date of Birth" 
                                                secondary={selectedTransaction.referenceDetails.formData.birthDate} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Emergency Contact Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.emergencyContactName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Emergency Contact Number" 
                                                secondary={selectedTransaction.referenceDetails.formData.emergencyContactNumber} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}

                                    {/* Certificate of Indigency */}
                                    {selectedTransaction.referenceDetails.documentType === 'certificate_of_indigency' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Age" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.age} years old`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna 4030`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Certificate For" 
                                                secondary={selectedTransaction.referenceDetails.formData.isSelf ? 'Self' : 'Other Person'} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            {!selectedTransaction.referenceDetails.formData.isSelf ? (
                                            <>
                                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                                <ListItemText 
                                                    primary="Recipient" 
                                                    secondary={selectedTransaction.referenceDetails.formData.guardian} 
                                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                                />
                                                </ListItem>
                                                
                                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                                <ListItemText 
                                                    primary="Relationship" 
                                                    secondary={selectedTransaction.referenceDetails.formData.guardianRelation} 
                                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                                />
                                                </ListItem>
                                            </>
                                            ) : (
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                                <ListItemText 
                                                primary="Recipient" 
                                                secondary="Self (Same as applicant)" 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                                />
                                            </ListItem>
                                            )}
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Purpose" 
                                                secondary={selectedTransaction.referenceDetails.purpose} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}

                                    {/* Fencing Permit */}
                                    {selectedTransaction.referenceDetails.documentType === 'fencing_permit' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Residential Address" 
                                                secondary={selectedTransaction.referenceDetails.formData.residentAddress} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Property Location" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Tax Declaration No." 
                                                secondary={selectedTransaction.referenceDetails.formData.taxDeclarationNumber} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Property ID No." 
                                                secondary={selectedTransaction.referenceDetails.formData.propertyIdentificationNumber} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Property Area" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.propertyArea} ${
                                                (() => {
                                                    const areaUnit = selectedTransaction.referenceDetails.formData.areaUnit;
                                                    switch(areaUnit) {
                                                    case 'square_meters': return 'square meters';
                                                    case 'square_feet': return 'square feet';
                                                    case 'hectares': return 'hectares';
                                                    default: return areaUnit;
                                                    }
                                                })()
                                                }`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}

                                    {/* Digging Permit */}
                                    {selectedTransaction.referenceDetails.documentType === 'digging_permit' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Company" 
                                                secondary={selectedTransaction.referenceDetails.formData.companyName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Application Details" 
                                                secondary={selectedTransaction.referenceDetails.formData.applicationDetails} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}

                                    {/* Business Clearance */}
                                    {selectedTransaction.referenceDetails.documentType === 'business_clearance' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Business Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.businessName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Business Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Line of Business" 
                                                secondary={selectedTransaction.referenceDetails.formData.lineOfBusiness} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Business Status" 
                                                secondary={selectedTransaction.referenceDetails.formData.businessStatus} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Amount" 
                                                secondary={`₱${selectedTransaction.referenceDetails.formData.amount}`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}

                                    {/* No Objection Certificate */}
                                    {selectedTransaction.referenceDetails.documentType === 'no_objection_certificate' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Activity Type" 
                                                secondary={
                                                (() => {
                                                    const objectType = selectedTransaction.referenceDetails.formData.objectType;
                                                    switch(objectType) {
                                                    case 'tree_cutting': return 'Tree Cutting';
                                                    case 'construction': return 'Construction';
                                                    case 'event': return 'Event/Gathering';
                                                    case 'business': return 'Business Operation';
                                                    case 'other': return 'Other Activity';
                                                    default: return objectType;
                                                    }
                                                })()
                                                } 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Details" 
                                                secondary={selectedTransaction.referenceDetails.formData.objectDetails} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Quantity" 
                                                secondary={selectedTransaction.referenceDetails.formData.quantity} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            {selectedTransaction.referenceDetails.formData.objectType === 'other' && (
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                                <ListItemText 
                                                primary="Additional Info" 
                                                secondary={selectedTransaction.referenceDetails.formData.additionalInfo} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                                />
                                            </ListItem>
                                            )}
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}

                                    {/* Request for Assistance */}
                                    {selectedTransaction.referenceDetails.documentType === 'request_for_assistance' && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Full Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Address" 
                                                secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Years of Stay" 
                                                secondary={selectedTransaction.referenceDetails.formData.yearsOfStay} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Marginalized Group" 
                                                secondary={
                                                (() => {
                                                    const group = selectedTransaction.referenceDetails.formData.marginGroupType;
                                                    switch(group) {
                                                    case 'urban_poor': return 'Urban Poor';
                                                    case 'senior_citizen': return 'Senior Citizen';
                                                    case 'single_parent': return 'Single Parent';
                                                    case 'pwd': return 'Person with Disability (PWD)';
                                                    case 'indigenous': return 'Indigenous Person';
                                                    case 'solo_parent': return 'Solo Parent';
                                                    case 'other': return 'Other';
                                                    default: return group;
                                                    }
                                                })()
                                                } 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Request For" 
                                                secondary={selectedTransaction.referenceDetails.formData.isSelf ? 'Self' : 'Other Person'} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            {!selectedTransaction.referenceDetails.formData.isSelf && (
                                            <>
                                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                                <ListItemText 
                                                    primary="Beneficiary Name" 
                                                    secondary={selectedTransaction.referenceDetails.formData.beneficiaryName} 
                                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                                />
                                                </ListItem>
                                                
                                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                                <ListItemText 
                                                    primary="Relationship" 
                                                    secondary={selectedTransaction.referenceDetails.formData.beneficiaryRelation} 
                                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                                />
                                                </ListItem>
                                            </>
                                            )}
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Assistance Type" 
                                                secondary={
                                                (() => {
                                                    const type = selectedTransaction.referenceDetails.formData.assistanceType;
                                                    switch(type) {
                                                    case 'financial': return 'Financial Assistance';
                                                    case 'medical': return 'Medical Assistance';
                                                    case 'burial': return 'Burial Assistance';
                                                    case 'educational': return 'Educational Assistance';
                                                    case 'food': return 'Food Assistance';
                                                    case 'housing': return 'Housing Assistance';
                                                    case 'other': return selectedTransaction.referenceDetails.formData.otherAssistanceType || 'Other Assistance';
                                                    default: return type;
                                                    }
                                                })()
                                                } 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </List>
                                        </Grid>
                                    </Grid>
                                    )}
                                </Grid>
                                )}
                            </Grid>
                            </CardContent>
                        </Card>
                        )}
                    </>
                    )}

                    {/* Resident Registration Details */}
                    {selectedTransaction?.serviceType === 'resident_registration' && (
                    <>
                        <Grid item xs={12}>
                        <Box sx={{ 
                            mt: 2, 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#f8f9fa', 
                            p: 1.5, 
                            borderRadius: '8px',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main' 
                        }}>
                            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" component="h3">
                            Resident Registration Information
                            </Typography>
                        </Box>
                        </Grid>
                        
                        {(selectedTransaction.details || selectedTransaction.referenceDetails) && (
                        <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                            <CardContent sx={{ px: 2, py: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    {selectedTransaction.referenceDetails?.serviceId && (
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Service ID" 
                                        secondary={selectedTransaction.referenceDetails.serviceId} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                    </ListItem>
                                    )}
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Full Name" 
                                        secondary={
                                          selectedTransaction.referenceDetails ? 
                                          `${selectedTransaction.referenceDetails.firstName} ${selectedTransaction.referenceDetails.middleName ? selectedTransaction.referenceDetails.middleName + ' ' : ''}${selectedTransaction.referenceDetails.lastName}` : 
                                          `${selectedTransaction.details.firstName} ${selectedTransaction.details.middleName ? selectedTransaction.details.middleName + ' ' : ''}${selectedTransaction.details.lastName}`
                                        } 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Address" 
                                        secondary={selectedTransaction.referenceDetails?.address || selectedTransaction.details.address}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Contact Number" 
                                        secondary={selectedTransaction.referenceDetails?.contactNumber || selectedTransaction.details.contactNumber || 'N/A'} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Email" 
                                        secondary={selectedTransaction.referenceDetails?.email || selectedTransaction.details.email || 'N/A'} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Precinct Level" 
                                        secondary={selectedTransaction.referenceDetails?.precinctLevel || selectedTransaction.details.precinctLevel || 'N/A'}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                    </ListItem>
                                    </List>
                                </Grid>
                                
                                {/* Status section - works for all transaction statuses */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                    Registration Status
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                            primary="Registration Status" 
                                            secondary={
                                                (() => {
                                                    // For cancelled or rejected status
                                                    if (selectedTransaction.status === 'cancelled') {
                                                        return (
                                                            <Chip 
                                                            size="small"
                                                            label="Cancelled by Resident"
                                                            color="error"
                                                            sx={{ mt: 0.5 }}
                                                            />
                                                        );
                                                    } else if (selectedTransaction.status === 'rejected') {
                                                        return (
                                                            <Chip 
                                                            size="small"
                                                            label="Rejected by Admin"
                                                            color="error"
                                                            sx={{ mt: 0.5 }}
                                                            />
                                                        );
                                                    } 
                                                    // For verification status
                                                    else if (selectedTransaction.referenceDetails) {
                                                        return (
                                                            <Chip 
                                                            size="small"
                                                            label={selectedTransaction.referenceDetails.isVerified ? 'Verified' : 'Pending Verification'}
                                                            color={selectedTransaction.referenceDetails.isVerified ? 'success' : 'warning'}
                                                            sx={{ mt: 0.5 }}
                                                            />
                                                        );
                                                    } else {
                                                        return (
                                                            <Chip 
                                                            size="small"
                                                            label={selectedTransaction.status === 'approved' ? 'Approved' : 'Pending'}
                                                            color={selectedTransaction.status === 'approved' ? 'success' : 'warning'}
                                                            sx={{ mt: 0.5 }}
                                                            />
                                                        );
                                                    }
                                                })()
                                            }
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                            primary="Voter Status" 
                                            secondary={
                                                selectedTransaction.referenceDetails?.isVoter ? 'Yes' : 
                                                selectedTransaction.details?.isVoter ? 'Yes' : 'No'
                                            } 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                        </ListItem>
                                        </List>
                                    </Grid>
                                    
                                    {/* Types/Categories section - works for both referenceDetails and transaction details */}
                                    {((selectedTransaction.referenceDetails?.types && selectedTransaction.referenceDetails.types.length > 0) || 
                                      (selectedTransaction.details?.types && selectedTransaction.details.types.length > 0)) && (
                                        <Grid item xs={12} sm={6}>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                            primary="Categories" 
                                            secondary={
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                {(selectedTransaction.referenceDetails?.types || selectedTransaction.details?.types || []).map((type, index) => (
                                                    <Chip 
                                                    key={index}
                                                    size="small"
                                                    label={type}
                                                    color="primary"
                                                    variant="outlined"
                                                    />
                                                ))}
                                                </Box>
                                            }
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                        </Grid>
                                    )}
                                    </Grid>
                                </Grid>
                                
                                {/* Rejection/Cancellation Reason Section */}
                                {(selectedTransaction.status === 'rejected' || selectedTransaction.status === 'cancelled') && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                        {selectedTransaction.status === 'rejected' ? 'Rejection Details' : 'Cancellation Details'}
                                    </Typography>
                                    
                                    <Alert 
                                        severity={selectedTransaction.status === 'rejected' ? "error" : "warning"}
                                        sx={{ mb: 2 }}
                                    >
                                        <AlertTitle>
                                            {selectedTransaction.status === 'rejected' 
                                                ? "Your registration was rejected by an administrator" 
                                                : "Your registration was cancelled"}
                                        </AlertTitle>
                                        {selectedTransaction.status === 'rejected' && selectedTransaction.adminComment && (
                                            <Typography variant="body2">
                                                <strong>Reason:</strong> {selectedTransaction.adminComment}
                                            </Typography>
                                        )}
                                        {selectedTransaction.status === 'cancelled' && selectedTransaction.details?.cancellationReason && (
                                            <Typography variant="body2">
                                                <strong>Reason:</strong> {selectedTransaction.details.cancellationReason}
                                            </Typography>
                                        )}
                                    </Alert>
                                </Grid>
                                )}
                                
                                {/* Additional Information Section */}
                                {selectedTransaction.adminComment && selectedTransaction.status !== 'rejected' && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                        Administrator Comment
                                    </Typography>
                                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '4px' }}>
                                        <Typography variant="body2">
                                            {selectedTransaction.adminComment}
                                        </Typography>
                                    </Box>
                                </Grid>
                                )}
                            </Grid>
                            </CardContent>
                        </Card>
                        )}
                    </>
                    )}

                    {/* Project Proposal Details */}
                    {selectedTransaction?.serviceType === 'project_proposal' && (
                    <>
                        <Grid item xs={12}>
                        <Box sx={{ 
                            mt: 2, 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#f8f9fa', 
                            p: 1.5, 
                            borderRadius: '8px',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main' 
                        }}>
                            <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" component="h3">
                            Project Proposal Information
                            </Typography>
                        </Box>
                        </Grid>
                        
                        {selectedTransaction.referenceDetails && (
                        <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                            <CardContent sx={{ px: 2, py: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Proposal ID" 
                                        secondary={
                                        selectedTransaction.referenceDetails?.serviceId || 
                                        selectedTransaction.details?.serviceId || 
                                        'N/A'
                                        } 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Submitter" 
                                        secondary={selectedTransaction.referenceDetails.fullName} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Contact" 
                                        secondary={selectedTransaction.referenceDetails.contactNumber}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Email" 
                                        secondary={selectedTransaction.referenceDetails.email}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Project Title" 
                                        secondary={selectedTransaction.referenceDetails.projectTitle || selectedTransaction.details?.projectTitle || 'N/A'}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Submitted Date" 
                                        secondary={formatDate(selectedTransaction.referenceDetails.createdAt)}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Status" 
                                        secondary={
                                        (() => {
                                            const status = selectedTransaction.referenceDetails.status;
                                            switch(status) {
                                            case 'pending': return 'Pending';
                                            case 'in_review': return 'In Review';
                                            case 'considered': return 'Considered';
                                            case 'approved': return 'Approved';
                                            case 'rejected': return 'Rejected';
                                            default: return status.replace('_', ' ');
                                            }
                                        })()
                                        }
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                
                                {selectedTransaction.referenceDetails.documentPath && (
                                    <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<FileIcon />}
                                    component={Link}
                                    href={`http://localhost:3002${selectedTransaction.referenceDetails.documentPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ mt: 2 }}
                                    >
                                    View Proposal Document
                                    </Button>
                                )}
                                </Grid>
                                
                                <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Project Description
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                    {selectedTransaction.referenceDetails.description}
                                    </Typography>
                                </Paper>
                                </Grid>
                            </Grid>
                            </CardContent>
                        </Card>
                        )}
                    </>
                    )}

                    {/* Infrastructure Report Details */}
                    {selectedTransaction?.serviceType === 'infrastructure_report' && (
                    <>
                        <Grid item xs={12}>
                        <Box sx={{ 
                            mt: 2, 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#f8f9fa', 
                            p: 1.5, 
                            borderRadius: '8px',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main' 
                        }}>
                            <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="subtitle1" component="h3">
                            Infrastructure Report Information
                            </Typography>
                        </Box>
                        </Grid>
                        
                        {selectedTransaction.referenceDetails && (
                        <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                            <CardContent sx={{ px: 2, py: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Report ID" 
                                        secondary={selectedTransaction.referenceDetails?.serviceId || 'N/A'} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Reported By" 
                                        secondary={selectedTransaction.referenceDetails.fullName} 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Contact Number" 
                                        secondary={selectedTransaction.referenceDetails.contactNumber}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Date Observed" 
                                        secondary={formatDate(selectedTransaction.referenceDetails.dateObserved)}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Issue Type" 
                                        secondary={selectedTransaction.referenceDetails.issueType || selectedTransaction.details?.issueType || 'N/A'}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Location" 
                                        secondary={selectedTransaction.referenceDetails.location}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Nearest Landmark" 
                                        secondary={selectedTransaction.referenceDetails.nearestLandmark}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                        primary="Status" 
                                        secondary={selectedTransaction.referenceDetails.status}
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                    </ListItem>
                                </List>
                                </Grid>
                                
                                <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                                    {selectedTransaction.referenceDetails.description}
                                </Typography>
                                
                                {selectedTransaction.referenceDetails.additionalComments && (
                                    <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Additional Comments
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                                        {selectedTransaction.referenceDetails.additionalComments}
                                    </Typography>
                                    </Box>
                                )}
                                </Grid>
                                
                                {/* Resident Feedback Section */}
                                {selectedTransaction.referenceDetails.residentFeedback && 
                                (selectedTransaction.referenceDetails.residentFeedback.satisfied !== undefined || 
                                selectedTransaction.referenceDetails.residentFeedback.comments) && (
                                <Grid item xs={12}>
                                    <Card sx={{ mt: 2, bgcolor: '#f8f9fa', borderRadius: '8px', boxShadow: 'none', border: '1px solid #eeeeee' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f0f0f0', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                                        <ReplyIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                                        <Typography variant="subtitle2">
                                        Your Feedback
                                        </Typography>
                                    </Box>
                                    <CardContent>
                                        {selectedTransaction.referenceDetails.residentFeedback.satisfied !== undefined && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', minWidth: 100 }}>
                                            Satisfaction:
                                            </Typography>
                                            <Chip 
                                            size="small" 
                                            color={selectedTransaction.referenceDetails.residentFeedback.satisfied ? "success" : "error"}
                                            label={selectedTransaction.referenceDetails.residentFeedback.satisfied ? "Satisfied" : "Not Satisfied"}
                                            />
                                        </Box>
                                        )}
                                        
                                        {selectedTransaction.referenceDetails.residentFeedback.comments && (
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            Comments:
                                            </Typography>
                                            <Typography variant="body1" sx={{ pl: 2 }}>
                                            {selectedTransaction.referenceDetails.residentFeedback.comments}
                                            </Typography>
                                        </Box>
                                        )}
                                    </CardContent>
                                    </Card>
                                </Grid>
                                )}
                                
                                {/* Display attached media if available */}
                                {selectedTransaction.referenceDetails.mediaUrls && 
                                selectedTransaction.referenceDetails.mediaUrls.length > 0 && (
                                <Grid item xs={12}>
                                    <Box sx={{ mt: 2, border: '1px dashed #ccc', borderRadius: '8px', p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <FileIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                                        <Typography variant="subtitle2">
                                        Attached Media ({selectedTransaction.referenceDetails.mediaUrls.length})
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedTransaction.referenceDetails.mediaUrls.map((url, index) => (
                                        <Button
                                            key={index}
                                            component="a" 
                                            href={`http://localhost:3002${url}`} 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="outlined"
                                            size="small"
                                            startIcon={<FileIcon />}
                                        >
                                            Attachment {index + 1}
                                        </Button>
                                        ))}
                                    </Box>
                                    </Box>
                                </Grid>
                                )}
                            </Grid>
                            </CardContent>
                        </Card>
                        )}
                    </>
                    )}
                  
                  {/* Admin Comments Section */}
                    {selectedTransaction.adminComment && (
                    <Grid item xs={12}>
                        <Card sx={{ mt: 3, bgcolor: '#f5f5f5', borderRadius: '8px', boxShadow: 'none', border: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                            <InfoIcon fontSize="small" sx={{ color: 'info.main', mr: 1 }} />
                            <Typography variant="subtitle2">
                            Admin Comment
                            </Typography>
                        </Box>
                        <CardContent>
                            <Typography variant="body1">
                            {selectedTransaction.adminComment}
                            </Typography>
                        </CardContent>
                        </Card>
                    </Grid>
                    )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: '#f9f9f9', 
            borderTop: '1px solid #eee',
            justifyContent: 'flex-end' 
            }}>
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1.5, 
                width: '100%', 
                justifyContent: isMobile ? 'center' : 'flex-end' 
            }}>
              {selectedTransaction && 
              selectedTransaction.serviceType === 'infrastructure_report' && 
              (
                // If using transaction status (lowercase)
                (selectedTransaction.status === 'completed' || 
                // Or if using report status (PascalCase) from referenceDetails
                (selectedTransaction.referenceDetails?.status === 'Resolved'))
              ) && 
              !selectedTransaction.referenceDetails?.residentFeedback && (
                <Button 
                  onClick={() => {
                    // Store the report ID before opening feedback dialog
                    let reportId = null;
                    if (selectedTransaction.referenceId) {
                      reportId = selectedTransaction.referenceId;
                    } else if (selectedTransaction.details && selectedTransaction.details.reportId) {
                      reportId = selectedTransaction.details.reportId;
                    } else if (selectedTransaction.referenceDetails && selectedTransaction.referenceDetails._id) {
                      reportId = selectedTransaction.referenceDetails._id;
                    }
                    
                    if (reportId) {
                      setFeedbackReportId(reportId);
                      setOpenFeedbackDialog(true);
                    } else {
                      setSnackbar({
                        open: true,
                        message: 'Cannot determine report ID for feedback',
                        severity: 'error'
                      });
                    }
                  }} 
                  color="primary"
                  variant="contained"
                  startIcon={<ReplyIcon />}
                  size={isMobile ? "large" : "medium"}
                  sx={{ 
                    borderRadius: '4px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    ...(isMobile && { flex: '1 1 auto' })
                  }}
                >
                  Provide Feedback
                </Button>
              )}
              {selectedTransaction && needsDieselResponse(selectedTransaction) && (
                <Button 
                  onClick={() => {
                    handleCloseDetails();
                    handleRespondToDiesel(selectedTransaction);
                  }} 
                  color="secondary"
                  variant="contained"
                  startIcon={<ReplyIcon />}
                  size={isMobile ? "large" : "medium"}
                  sx={{ 
                    borderRadius: '4px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    ...(isMobile && { flex: '1 1 auto' })
                  }}
                >
                  Respond to Diesel Request
                </Button>
              )}
              {selectedTransaction && canCancel(selectedTransaction) && (
                <Button 
                  onClick={() => {
                    handleCloseDetails();
                    handleCancelRequest(selectedTransaction);
                  }} 
                  color="error"
                  variant="contained"
                  startIcon={<CancelIcon />}
                  size={isMobile ? "large" : "medium"}
                  sx={{ 
                    borderRadius: '4px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    ...(isMobile && { flex: '1 1 auto' })
                  }}
                >
                  Cancel Request
                </Button>
              )}
              <Button 
                onClick={handleCloseDetails}
                variant={isMobile ? "outlined" : "text"}
                size={isMobile ? "large" : "medium"}
                sx={{ ...(isMobile && { flex: '1 1 auto' }) }}
              >
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog 
          open={openCancel} 
          onClose={() => setOpenCancel(false)}
          fullWidth
        >
          <DialogTitle>Cancel Request</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this request? This action cannot be undone.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="reason"
              label="Reason for cancellation (optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancel(false)}>No, Keep Request</Button>
            <Button onClick={confirmCancel} color="error">
              Yes, Cancel Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diesel Cost Response Dialog */}
        <Dialog
          open={openDieselDialog}
          onClose={() => !dieselResponseLoading && setOpenDieselDialog(false)}
        >
          <DialogTitle>Diesel Cost Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The ambulance service requires you to cover the diesel cost for this trip. Do you agree to cover this cost?
            </DialogContentText>
            {selectedTransaction?.adminComment && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Admin Note:</strong> {selectedTransaction.adminComment}
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => handleDieselCostDecision(false)} 
              color="error"
              disabled={dieselResponseLoading}
            >
              Decline
            </Button>
            <Button 
              onClick={() => handleDieselCostDecision(true)} 
              color="primary" 
              variant="contained"
              disabled={dieselResponseLoading}
            >
              {dieselResponseLoading ? <CircularProgress size={24} /> : 'Accept'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Dialog for Infrastructure Reports */}
        <Dialog
          open={openFeedbackDialog}
          onClose={() => {
            setOpenFeedbackDialog(false);
            setFeedbackReportId(null); // Clear the ID when closing
          }}
        >
          <DialogTitle>Provide Your Feedback</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you satisfied with how your issue was resolved?
            </DialogContentText>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                value={feedbackSatisfied ? 'yes' : 'no'}
                onChange={(e) => setFeedbackSatisfied(e.target.value === 'yes')}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes, I'm satisfied" />
                <FormControlLabel value="no" control={<Radio />} label="No, I'm not satisfied" />
              </RadioGroup>
            </FormControl>
            <TextField
              margin="dense"
              id="feedback-comments"
              label="Comments (optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFeedbackDialog(false)}>Cancel</Button>
            <Button 
              onClick={submitFeedback} 
              color="primary"
              variant="contained"
              disabled={feedbackSubmitting}
            >
              {feedbackSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
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
      </Container>
    );
  }
  // Desktop view
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Transactions
      </Typography>
      <Box sx={{ mb: 4 }} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="filter-select-label">Filter</InputLabel>
            <Select
              labelId="filter-select-label"
              value={filter}
              label="Filter"
              onChange={handleFilterChange}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="active">Active Transactions</MenuItem>
              <Divider />
              <MenuItem value="ambulance">Ambulance Bookings</MenuItem>
              <MenuItem value="court">Court Reservations</MenuItem>
              <MenuItem value="document">Document Requests</MenuItem>
              <MenuItem value="infrastructure">Infrastructure Reports</MenuItem>
              <MenuItem value="project_proposal">Project Proposals</MenuItem>
              <MenuItem value="resident_registration">Resident Registration</MenuItem>
              <Divider />
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            placeholder="Search transactions..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400,
              "& .MuiInputBase-root": {
                bgcolor: 'background.paper'
              }
             }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchText('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchTransactions}
          startIcon={<RefreshIcon />}
          size="small"
        >
          Refresh
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
        borderRadius: '8px', 
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Service</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '11%' }}>Service ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '13%' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '26%' }}>Details</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction, index) => (
              <TableRow 
                key={transaction._id}
                sx={{ 
                  backgroundColor: index % 2 === 0 ? 'background.paper' : 'background.lightgrey',
                  '&:hover': { backgroundColor: 'background.yellow' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell>{getServiceTypeLabel(transaction.serviceType)}</TableCell>
                <TableCell>
                  {transaction.serviceType === 'ambulance_booking' || transaction.serviceType === 'court_reservation' || transaction.serviceType === 'infrastructure_report' || transaction.serviceType === 'document_request' || transaction.serviceType === 'project_proposal'? (
                    <ServiceIdCell transaction={transaction} />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell component="div">
                  {getStatusChip(transaction.status, transaction.serviceType, transaction)}
                  {needsDieselResponse(transaction) && (
                    <Chip 
                      size="small" 
                      label="Action Required" 
                      color="secondary" 
                      sx={{ ml: 0, mt: 1 }}
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell component="div">
                  {/* Ambulance booking details */}
                  {transaction.serviceType === SERVICE_TYPES.AMBULANCE && transaction.details && (
                    <>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Patient:</strong> {transaction.details.patientName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Destination:</strong> {transaction.details.destination || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Pickup Date:</strong> {formatDate(transaction.details.pickupDate)}
                      </Typography>
                    </>
                  )}
                  
                  {/* Court reservation details */}
                  {transaction.serviceType === SERVICE_TYPES.COURT && transaction.details && (
                    <>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Purpose:</strong> {transaction.details.purpose || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Date:</strong> {formatDate(transaction.details.reservationDate)}
                      </Typography>
                    </>
                  )}
                  
                  {/* Infrastructure report details */}
                  {transaction.serviceType === SERVICE_TYPES.INFRASTRUCTURE && transaction.details && (
                    <>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Issue:</strong> {transaction.details.issueType || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Location:</strong> {transaction.details.location || 'N/A'}
                      </Typography>
                    </>
                  )}
                  
                  {/* Project proposal details */}
                  {transaction.serviceType === SERVICE_TYPES.PROJECT_PROPOSAL && transaction.details && (
                    <>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Title:</strong> {transaction.details.projectTitle || 'N/A'}
                      </Typography>
                    </>
                  )}
                  
                  {/* Resident Registration details */}
                  {transaction.serviceType === SERVICE_TYPES.RESIDENT && transaction.details && (
                    <>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Name:</strong> {`${transaction.details.firstName} ${transaction.details.middleName ? transaction.details.middleName + ' ' : ''}${transaction.details.lastName}`}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Address:</strong> {transaction.details.address || 'N/A'}
                      </Typography>
                    </>
                  )}
  
                  {/* Document request details */}
                  {transaction.serviceType === SERVICE_TYPES.DOCUMENT && transaction.details && (
                    <>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Type:</strong> {
                          (() => {
                            const docType = transaction.details.documentType;
                            switch(docType) {
                              case 'barangay_id': return 'Barangay ID';
                              case 'barangay_clearance': return 'Barangay Clearance';
                              case 'business_clearance': return 'Business Clearance';
                              case 'lot_ownership': return 'Lot Ownership';
                              case 'digging_permit': return 'Digging Permit';
                              case 'fencing_permit': return 'Fencing Permit';
                              case 'request_for_assistance': return 'Request for Assistance';
                              case 'certificate_of_indigency': return 'Certificate of Indigency';
                              case 'certificate_of_residency': return 'Certificate of Residency';
                              case 'no_objection_certificate': return 'No Objection Certificate';
                              default: return docType ? docType.replace('_', ' ') : 'N/A';
                            }
                          })()
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Purpose:</strong> {transaction.details.purpose || transaction.referenceDetails?.purpose || 'N/A'}
                      </Typography>
                    </>
                  )}
                </TableCell>

                <TableCell sx={{ minWidth: '180px' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetails(transaction._id)}
                      sx={{ minWidth: '75px', width: '75px' }} // Fixed width for all buttons
                    >
                      View
                    </Button>
                    {needsDieselResponse(transaction) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleRespondToDiesel(transaction)}
                        sx={{ minWidth: '75px', width: '75px' }} // Fixed width for all buttons
                      >
                        Respond
                      </Button>
                    )}
                    {canCancel(transaction) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelRequest(transaction)}
                        sx={{ minWidth: '75px', width: '75px' }} // Fixed width for all buttons
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Transaction Details Dialog - Mobile & Desktop (shared) */}
        <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ 
            sx: { 
            borderRadius: '8px',
            overflow: 'hidden'
            } 
        }}
        >
        <DialogTitle sx={{ 
            borderBottom: '1px solid #eee', 
            backgroundColor: '#f8f9fa',
            px: 3, 
            py: 2 
        }}>
            {selectedTransaction && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                    {getServiceTypeLabel(selectedTransaction.serviceType)}
                </Typography>
                {getStatusChip(selectedTransaction.status, selectedTransaction.serviceType, selectedTransaction)}
                </Box>
                <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
                size="small"
                >
                <CancelIcon />
                </IconButton>
            </Box>
            )}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedTransaction && (
            <Box sx={{ overflowX: 'hidden' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ my: 0.5 }}>
                    <strong>Status:</strong> {formatStatusText(selectedTransaction.status)}
                  </Typography>
                  <Typography variant="body2" sx={{ my: 0.5 }}>
                    <strong>Created:</strong> {formatDateTime(selectedTransaction.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ my: 0.5 }}>
                    <strong>Last Updated:</strong> {formatDateTime(selectedTransaction.updatedAt)}
                  </Typography>
                  {selectedTransaction.amount > 0 && (
                    <Typography variant="body2" sx={{ my: 0.5 }}>
                      <strong>Amount:</strong> ₱{selectedTransaction.amount.toFixed(2)}
                    </Typography>
                  )}
                </Grid>
                
                {/* Ambulance Booking Details */}
                {selectedTransaction.serviceType === 'ambulance_booking' && (
                <>
                    <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f8f9fa', 
                        p: 1.5, 
                        borderRadius: '8px',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main' 
                    }}>
                        <HospitalIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle1" component="h3">
                        Ambulance Booking Information
                        </Typography>
                    </Box>
                    </Grid>
                    
                    {selectedTransaction.referenceDetails && (
                    <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                        <CardContent sx={{ px: 2, py: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                {selectedTransaction.referenceDetails.serviceId && (
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                    primary="Service ID" 
                                    secondary={selectedTransaction.referenceDetails.serviceId} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                </ListItem>
                                )}
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Patient Name" 
                                    secondary={selectedTransaction.referenceDetails.patientName} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Pickup Date" 
                                    secondary={formatDate(selectedTransaction.referenceDetails.pickupDate)} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <TimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Pickup Time" 
                                    secondary={selectedTransaction.referenceDetails.pickupTime} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Duration" 
                                    secondary={selectedTransaction.referenceDetails.duration} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Pickup Address" 
                                    secondary={selectedTransaction.referenceDetails.pickupAddress} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Destination" 
                                    secondary={selectedTransaction.referenceDetails.destination} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Contact Number" 
                                    secondary={selectedTransaction.referenceDetails.contactNumber} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Submitter Relation" 
                                    secondary={selectedTransaction.referenceDetails.submitterRelation} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Diesel Cost Required" 
                                    secondary={selectedTransaction.details?.dieselCost ? 'Yes' : 'No'} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            {/* Additional Details Section */}
                            {(selectedTransaction.referenceDetails.emergencyDetails || 
                            selectedTransaction.referenceDetails.additionalNote) && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                
                                {selectedTransaction.referenceDetails.emergencyDetails && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Emergency Details
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff9f0' }}>
                                    <Typography variant="body1">
                                        {selectedTransaction.referenceDetails.emergencyDetails}
                                    </Typography>
                                    </Paper>
                                </Box>
                                )}
                                
                                {selectedTransaction.referenceDetails.additionalNote && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Additional Notes
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                    <Typography variant="body1">
                                        {selectedTransaction.referenceDetails.additionalNote}
                                    </Typography>
                                    </Paper>
                                </Box>
                                )}
                            </Grid>
                            )}
                        </Grid>
                        </CardContent>
                    </Card>
                    )}
                </>
                )}
                
                {/* All other service type sections copied from above */}
                {/* Court Reservation Details */}
                {selectedTransaction.serviceType === 'court_reservation' && (
                <>
                    <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f8f9fa', 
                        p: 1.5, 
                        borderRadius: '8px',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main' 
                    }}>
                        <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle1" component="h3">
                        Court Reservation Information
                        </Typography>
                    </Box>
                    </Grid>
                    
                    {/* From referenceDetails - more comprehensive information */}
                    {selectedTransaction.referenceDetails && (
                    <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                        <CardContent sx={{ px: 2, py: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Service ID" 
                                    secondary={selectedTransaction.referenceDetails.serviceId || 'N/A'} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Representative" 
                                    secondary={selectedTransaction.referenceDetails.representativeName} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Date" 
                                    secondary={formatDate(selectedTransaction.referenceDetails.reservationDate)}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <TimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Time" 
                                    secondary={selectedTransaction.referenceDetails.startTime}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Duration" 
                                    secondary={`${selectedTransaction.referenceDetails.duration} hours`}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Contact Number" 
                                    secondary={selectedTransaction.referenceDetails.contactNumber}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Purpose" 
                                    secondary={selectedTransaction.referenceDetails.purpose}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Number of People" 
                                    secondary={selectedTransaction.referenceDetails.numberOfPeople}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            {selectedTransaction.referenceDetails.additionalNotes && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Additional Notes
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                                    {selectedTransaction.referenceDetails.additionalNotes}
                                </Typography>
                                </Box>
                            </Grid>
                            )}
                        </Grid>
                        </CardContent>
                    </Card>
                    )}
                </>
                )}
                
                {/* Document Request Details */}
                {selectedTransaction?.serviceType === 'document_request' && (
                <>
                    <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f8f9fa', 
                        p: 1.5, 
                        borderRadius: '8px',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main' 
                    }}>
                        <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle1" component="h3">
                        Document Request Information
                        </Typography>
                    </Box>
                    </Grid>
                    
                    {selectedTransaction.referenceDetails && (
                    <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                        <CardContent sx={{ px: 2, py: 2 }}>
                        <Grid container spacing={2}>
                            {/* Document summary - Left column */}
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <FileIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Document Type" 
                                    secondary={
                                    (() => {
                                        const docType = selectedTransaction.details?.documentType;
                                        switch(docType) {
                                        case 'barangay_id': return 'Barangay ID';
                                        case 'barangay_clearance': return 'Barangay Clearance';
                                        case 'business_clearance': return 'Business Clearance';
                                        case 'lot_ownership': return 'Lot Ownership';
                                        case 'digging_permit': return 'Digging Permit';
                                        case 'fencing_permit': return 'Fencing Permit';
                                        case 'request_for_assistance': return 'Request for Assistance';
                                        case 'certificate_of_indigency': return 'Certificate of Indigency';
                                        case 'certificate_of_residency': return 'Certificate of Residency';
                                        case 'no_objection_certificate': return 'No Objection Certificate';
                                        default: return docType;
                                        }
                                    })()
                                    } 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Service ID" 
                                    secondary={selectedTransaction.referenceDetails.serviceId || 'N/A'} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            {/* Document summary - Right column */}
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Purpose" 
                                    secondary={
                                    selectedTransaction.referenceDetails.documentType === 'digging_permit' && 
                                    selectedTransaction.referenceDetails.formData && 
                                    selectedTransaction.referenceDetails.formData.diggingPurpose
                                        ? (() => {
                                            const purpose = selectedTransaction.referenceDetails.formData.diggingPurpose;
                                            switch(purpose) {
                                            case 'water_supply': return 'Water Supply Connection';
                                            case 'electrical': return 'Electrical Connection';
                                            case 'drainage': return 'Drainage System';
                                            case 'other': return 'Other';
                                            default: return purpose;
                                            }
                                        })()
                                        : selectedTransaction.referenceDetails.purpose
                                    }
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Status" 
                                    secondary={
                                    (() => {
                                        const status = selectedTransaction.referenceDetails.status;
                                        switch(status) {
                                        case 'pending': return 'Pending';
                                        case 'in_progress': return 'In Progress';
                                        case 'completed': return 'Completed';
                                        case 'rejected': return 'Rejected';
                                        case 'cancelled': return 'Cancelled';
                                        default: return status.replace('_', ' ');
                                        }
                                    })()
                                    }
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            {/* Document Type-specific Sections */}
                            {selectedTransaction.referenceDetails.documentType && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                Document Details
                                </Typography>
                                
                                {/* Certificate of Residency */}
                                {selectedTransaction.referenceDetails.documentType === 'certificate_of_residency' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Age" 
                                            secondary={selectedTransaction.referenceDetails.formData.age} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address} Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Date of Birth" 
                                            secondary={
                                            selectedTransaction.referenceDetails.formData.dateOfBirth ? 
                                            format(new Date(selectedTransaction.referenceDetails.formData.dateOfBirth), 'MMM dd, yyyy') : 
                                            'N/A'
                                            } 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Place of Birth" 
                                            secondary={selectedTransaction.referenceDetails.formData.placeOfBirth} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                      <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Mother's Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.motherName || 'N/A'} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Father's Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fatherName || 'N/A'} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                      </ListItem>

                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Nationality" 
                                            secondary={selectedTransaction.referenceDetails.formData.nationality} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Civil Status" 
                                            secondary={selectedTransaction.referenceDetails.formData.civilStatus} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Years of Stay" 
                                            secondary={selectedTransaction.referenceDetails.formData.yearsOfStay} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}
                                
                                {/* Barangay Clearance */}
                                {selectedTransaction.referenceDetails.documentType === 'barangay_clearance' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Gender" 
                                            secondary={selectedTransaction.referenceDetails.formData.gender === 'male' ? 'Male' : 'Female'} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna 4030`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}
                                
                                {/* Continue with other document types in similar format */}
                                {/* Lot Ownership */}
                                {selectedTransaction.referenceDetails.documentType === 'lot_ownership' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="TD Number" 
                                            secondary={selectedTransaction.referenceDetails.formData.tdNumber} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Survey Number" 
                                            secondary={selectedTransaction.referenceDetails.formData.surveyNumber} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Lot Area" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.lotArea} ${
                                            (() => {
                                                const areaUnit = selectedTransaction.referenceDetails.formData.areaUnit;
                                                switch(areaUnit) {
                                                case 'square_meters': return 'square meters';
                                                case 'square_feet': return 'square feet';
                                                case 'hectares': return 'hectares';
                                                default: return areaUnit;
                                                }
                                            })()
                                            }`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Property Location" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.lotLocation}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Owner Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Owner Address" 
                                            secondary={selectedTransaction.referenceDetails.formData.ownerAddress} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}
                                
                                {/* Barangay ID */}
                                {selectedTransaction.referenceDetails.documentType === 'barangay_id' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="First Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.firstName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Middle Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.middleName || 'N/A'} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Last Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.lastName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Date of Birth" 
                                            secondary={selectedTransaction.referenceDetails.formData.birthDate} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Emergency Contact Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.emergencyContactName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Emergency Contact Number" 
                                            secondary={selectedTransaction.referenceDetails.formData.emergencyContactNumber} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}

                                {/* Certificate of Indigency */}
                                {selectedTransaction.referenceDetails.documentType === 'certificate_of_indigency' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Age" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.age} years old`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna 4030`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Certificate For" 
                                            secondary={selectedTransaction.referenceDetails.formData.isSelf ? 'Self' : 'Other Person'} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        {!selectedTransaction.referenceDetails.formData.isSelf ? (
                                        <>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Recipient" 
                                                secondary={selectedTransaction.referenceDetails.formData.guardian} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Relationship" 
                                                secondary={selectedTransaction.referenceDetails.formData.guardianRelation} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </>
                                        ) : (
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                            primary="Recipient" 
                                            secondary="Self (Same as applicant)" 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                        </ListItem>
                                        )}
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Purpose" 
                                            secondary={selectedTransaction.referenceDetails.purpose} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}

                                {/* Fencing Permit */}
                                {selectedTransaction.referenceDetails.documentType === 'fencing_permit' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Residential Address" 
                                            secondary={selectedTransaction.referenceDetails.formData.residentAddress} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Property Location" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.propertyLocation}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Tax Declaration No." 
                                            secondary={selectedTransaction.referenceDetails.formData.taxDeclarationNumber} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Property ID No." 
                                            secondary={selectedTransaction.referenceDetails.formData.propertyIdentificationNumber} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Property Area" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.propertyArea} ${
                                            (() => {
                                                const areaUnit = selectedTransaction.referenceDetails.formData.areaUnit;
                                                switch(areaUnit) {
                                                case 'square_meters': return 'square meters';
                                                case 'square_feet': return 'square feet';
                                                case 'hectares': return 'hectares';
                                                default: return areaUnit;
                                                }
                                            })()
                                            }`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}

                                {/* Digging Permit */}
                                {selectedTransaction.referenceDetails.documentType === 'digging_permit' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Company" 
                                            secondary={selectedTransaction.referenceDetails.formData.companyName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Application Details" 
                                            secondary={selectedTransaction.referenceDetails.formData.applicationDetails} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}

                                {/* Business Clearance */}
                                {selectedTransaction.referenceDetails.documentType === 'business_clearance' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Business Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.businessName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Business Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.businessAddress}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Line of Business" 
                                            secondary={selectedTransaction.referenceDetails.formData.lineOfBusiness} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Business Status" 
                                            secondary={selectedTransaction.referenceDetails.formData.businessStatus} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Amount" 
                                            secondary={`₱${selectedTransaction.referenceDetails.formData.amount}`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}

                                {/* No Objection Certificate */}
                                {selectedTransaction.referenceDetails.documentType === 'no_objection_certificate' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Activity Type" 
                                            secondary={
                                            (() => {
                                                const objectType = selectedTransaction.referenceDetails.formData.objectType;
                                                switch(objectType) {
                                                case 'tree_cutting': return 'Tree Cutting';
                                                case 'construction': return 'Construction';
                                                case 'event': return 'Event/Gathering';
                                                case 'business': return 'Business Operation';
                                                case 'other': return 'Other Activity';
                                                default: return objectType;
                                                }
                                            })()
                                            } 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Details" 
                                            secondary={selectedTransaction.referenceDetails.formData.objectDetails} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Quantity" 
                                            secondary={selectedTransaction.referenceDetails.formData.quantity} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        {selectedTransaction.referenceDetails.formData.objectType === 'other' && (
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                            primary="Additional Info" 
                                            secondary={selectedTransaction.referenceDetails.formData.additionalInfo} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                        </ListItem>
                                        )}
                                    </List>
                                    </Grid>
                                </Grid>
                                )}

                                {/* Request for Assistance */}
                                {selectedTransaction.referenceDetails.documentType === 'request_for_assistance' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Full Name" 
                                            secondary={selectedTransaction.referenceDetails.formData.fullName} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Address" 
                                            secondary={`${selectedTransaction.referenceDetails.formData.address}, Barangay Maahas, Los Baños, Laguna`} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Years of Stay" 
                                            secondary={selectedTransaction.referenceDetails.formData.yearsOfStay} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Marginalized Group" 
                                            secondary={
                                            (() => {
                                                const group = selectedTransaction.referenceDetails.formData.marginGroupType;
                                                switch(group) {
                                                case 'urban_poor': return 'Urban Poor';
                                                case 'senior_citizen': return 'Senior Citizen';
                                                case 'single_parent': return 'Single Parent';
                                                case 'pwd': return 'Person with Disability (PWD)';
                                                case 'indigenous': return 'Indigenous Person';
                                                case 'solo_parent': return 'Solo Parent';
                                                case 'other': return 'Other';
                                                default: return group;
                                                }
                                            })()
                                            } 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Request For" 
                                            secondary={selectedTransaction.referenceDetails.formData.isSelf ? 'Self' : 'Other Person'} 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                        
                                        {!selectedTransaction.referenceDetails.formData.isSelf && (
                                        <>
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Beneficiary Name" 
                                                secondary={selectedTransaction.referenceDetails.formData.beneficiaryName} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0, py: 0.75 }}>
                                            <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                            <ListItemText 
                                                primary="Relationship" 
                                                secondary={selectedTransaction.referenceDetails.formData.beneficiaryRelation} 
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                            />
                                            </ListItem>
                                        </>
                                        )}
                                        
                                        <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                            primary="Assistance Type" 
                                            secondary={
                                            (() => {
                                                const type = selectedTransaction.referenceDetails.formData.assistanceType;
                                                switch(type) {
                                                case 'financial': return 'Financial Assistance';
                                                case 'medical': return 'Medical Assistance';
                                                case 'burial': return 'Burial Assistance';
                                                case 'educational': return 'Educational Assistance';
                                                case 'food': return 'Food Assistance';
                                                case 'housing': return 'Housing Assistance';
                                                case 'other': return selectedTransaction.referenceDetails.formData.otherAssistanceType || 'Other Assistance';
                                                default: return type;
                                                }
                                            })()
                                            } 
                                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                        </ListItem>
                                    </List>
                                    </Grid>
                                </Grid>
                                )}
                            </Grid>
                            )}
                        </Grid>
                        </CardContent>
                    </Card>
                    )}
                </>
                )}
                
                {/* Resident Registration Details */}
                {selectedTransaction?.serviceType === 'resident_registration' && (
                <>
                    <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f8f9fa', 
                        p: 1.5, 
                        borderRadius: '8px',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main' 
                    }}>
                        <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle1" component="h3">
                        Resident Registration Information
                        </Typography>
                    </Box>
                    </Grid>
                    
                    {(selectedTransaction.details || selectedTransaction.referenceDetails) && (
                    <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                        <CardContent sx={{ px: 2, py: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                {selectedTransaction.referenceDetails?.serviceId && (
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                    primary="Service ID" 
                                    secondary={selectedTransaction.referenceDetails.serviceId} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                </ListItem>
                                )}
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Full Name" 
                                    secondary={
                                      selectedTransaction.referenceDetails ? 
                                      `${selectedTransaction.referenceDetails.firstName} ${selectedTransaction.referenceDetails.middleName ? selectedTransaction.referenceDetails.middleName + ' ' : ''}${selectedTransaction.referenceDetails.lastName}` : 
                                      `${selectedTransaction.details.firstName} ${selectedTransaction.details.middleName ? selectedTransaction.details.middleName + ' ' : ''}${selectedTransaction.details.lastName}`
                                    } 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Address" 
                                    secondary={selectedTransaction.referenceDetails?.address || selectedTransaction.details.address}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                    primary="Contact Number" 
                                    secondary={selectedTransaction.referenceDetails?.contactNumber || selectedTransaction.details.contactNumber || 'N/A'} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                    primary="Email" 
                                    secondary={selectedTransaction.referenceDetails?.email || selectedTransaction.details.email || 'N/A'} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                    <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                    <ListItemText 
                                    primary="Precinct Level" 
                                    secondary={selectedTransaction.referenceDetails?.precinctLevel || selectedTransaction.details.precinctLevel || 'N/A'}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                    />
                                </ListItem>
                                </List>
                            </Grid>
                            
                            {/* Status section - works for all transaction statuses */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                Registration Status
                                </Typography>
                                
                                <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <List dense disablePadding>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Registration Status" 
                                        secondary={
                                            (() => {
                                                // For cancelled or rejected status
                                                if (selectedTransaction.status === 'cancelled') {
                                                    return (
                                                        <Chip 
                                                        size="small"
                                                        label="Cancelled by Resident"
                                                        color="error"
                                                        sx={{ mt: 0.5 }}
                                                        />
                                                    );
                                                } else if (selectedTransaction.status === 'rejected') {
                                                    return (
                                                        <Chip 
                                                        size="small"
                                                        label="Rejected by Admin"
                                                        color="error"
                                                        sx={{ mt: 0.5 }}
                                                        />
                                                    );
                                                } 
                                                // For verification status
                                                else if (selectedTransaction.referenceDetails) {
                                                    return (
                                                        <Chip 
                                                        size="small"
                                                        label={selectedTransaction.referenceDetails.isVerified ? 'Verified' : 'Pending Verification'}
                                                        color={selectedTransaction.referenceDetails.isVerified ? 'success' : 'warning'}
                                                        sx={{ mt: 0.5 }}
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <Chip 
                                                        size="small"
                                                        label={selectedTransaction.status === 'approved' ? 'Approved' : 'Pending'}
                                                        color={selectedTransaction.status === 'approved' ? 'success' : 'warning'}
                                                        sx={{ mt: 0.5 }}
                                                        />
                                                    );
                                                }
                                            })()
                                        }
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        />
                                    </ListItem>
                                    
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Voter Status" 
                                        secondary={
                                            selectedTransaction.referenceDetails?.isVoter ? 'Yes' : 
                                            selectedTransaction.details?.isVoter ? 'Yes' : 'No'
                                        } 
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                        />
                                    </ListItem>
                                    </List>
                                </Grid>
                                
                                {/* Types/Categories section - works for both referenceDetails and transaction details */}
                                {((selectedTransaction.referenceDetails?.types && selectedTransaction.referenceDetails.types.length > 0) || 
                                  (selectedTransaction.details?.types && selectedTransaction.details.types.length > 0)) && (
                                    <Grid item xs={12} sm={6}>
                                    <ListItem sx={{ px: 0, py: 0.75 }}>
                                        <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                        <ListItemText 
                                        primary="Categories" 
                                        secondary={
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {(selectedTransaction.referenceDetails?.types || selectedTransaction.details?.types || []).map((type, index) => (
                                                <Chip 
                                                key={index}
                                                size="small"
                                                label={type}
                                                color="primary"
                                                variant="outlined"
                                                />
                                            ))}
                                            </Box>
                                        }
                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                        />
                                    </ListItem>
                                    </Grid>
                                )}
                                </Grid>
                            </Grid>
                            
                            {/* Rejection/Cancellation Reason Section */}
                            {(selectedTransaction.status === 'rejected' || selectedTransaction.status === 'cancelled') && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                    {selectedTransaction.status === 'rejected' ? 'Rejection Details' : 'Cancellation Details'}
                                </Typography>
                                
                                <Alert 
                                    severity={selectedTransaction.status === 'rejected' ? "error" : "warning"}
                                    sx={{ mb: 2 }}
                                >
                                    <AlertTitle>
                                        {selectedTransaction.status === 'rejected' 
                                            ? "Your registration was rejected by an administrator" 
                                            : "Your registration was cancelled"}
                                    </AlertTitle>
                                    {selectedTransaction.status === 'rejected' && selectedTransaction.adminComment && (
                                        <Typography variant="body2">
                                            <strong>Reason:</strong> {selectedTransaction.adminComment}
                                        </Typography>
                                    )}
                                    {selectedTransaction.status === 'cancelled' && selectedTransaction.details?.cancellationReason && (
                                        <Typography variant="body2">
                                            <strong>Reason:</strong> {selectedTransaction.details.cancellationReason}
                                        </Typography>
                                    )}
                                </Alert>
                            </Grid>
                            )}
                            
                            {/* Additional Information Section */}
                            {selectedTransaction.adminComment && selectedTransaction.status !== 'rejected' && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                    Administrator Comment
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '4px' }}>
                                    <Typography variant="body2">
                                        {selectedTransaction.adminComment}
                                    </Typography>
                                </Box>
                            </Grid>
                            )}
                        </Grid>
                        </CardContent>
                    </Card>
                    )}
                </>
                )}
                
                {/* Project Proposal Details */}
                {selectedTransaction?.serviceType === 'project_proposal' && (
                <>
                    <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f8f9fa', 
                        p: 1.5, 
                        borderRadius: '8px',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main' 
                    }}>
                        <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle1" component="h3">
                        Project Proposal Information
                        </Typography>
                    </Box>
                    </Grid>
                    
                    {selectedTransaction.referenceDetails && (
                    <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                        <CardContent sx={{ px: 2, py: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Proposal ID" 
                                    secondary={
                                    selectedTransaction.referenceDetails?.serviceId || 
                                    selectedTransaction.details?.serviceId || 
                                    'N/A'
                                    } 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Submitter" 
                                    secondary={selectedTransaction.referenceDetails.fullName} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Contact" 
                                    secondary={selectedTransaction.referenceDetails.contactNumber}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Email" 
                                    secondary={selectedTransaction.referenceDetails.email}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Project Title" 
                                    secondary={selectedTransaction.referenceDetails.projectTitle || selectedTransaction.details?.projectTitle || 'N/A'}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Submitted Date" 
                                    secondary={formatDate(selectedTransaction.referenceDetails.createdAt)}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Status" 
                                    secondary={
                                    (() => {
                                        const status = selectedTransaction.referenceDetails.status;
                                        switch(status) {
                                        case 'pending': return 'Pending';
                                        case 'in_review': return 'In Review';
                                        case 'considered': return 'Considered';
                                        case 'approved': return 'Approved';
                                        case 'rejected': return 'Rejected';
                                        default: return status.replace('_', ' ');
                                        }
                                    })()
                                    }
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            
                            {selectedTransaction.referenceDetails.documentPath && (
                                <Button
                                variant="outlined"
                                size="small"
                                startIcon={<FileIcon />}
                                component={Link}
                                href={`http://localhost:3002${selectedTransaction.referenceDetails.documentPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ mt: 2 }}
                                >
                                View Proposal Document
                                </Button>
                            )}
                            </Grid>
                            
                            <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Project Description
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                {selectedTransaction.referenceDetails.description}
                                </Typography>
                            </Paper>
                            </Grid>
                        </Grid>
                        </CardContent>
                    </Card>
                    )}
                </>
                )}
                
                {/* Infrastructure Report Details */}
                {selectedTransaction?.serviceType === 'infrastructure_report' && (
                <>
                    <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: '#f8f9fa', 
                        p: 1.5, 
                        borderRadius: '8px',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main' 
                    }}>
                        <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="subtitle1" component="h3">
                        Infrastructure Report Information
                        </Typography>
                    </Box>
                    </Grid>
                    
                    {selectedTransaction.referenceDetails && (
                    <Card variant="outlined" sx={{ borderRadius: '8px', mb: 2, width: '100%' }}>
                        <CardContent sx={{ px: 2, py: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Report ID" 
                                    secondary={selectedTransaction.referenceDetails?.serviceId || 'N/A'} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Reported By" 
                                    secondary={selectedTransaction.referenceDetails.fullName} 
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Contact Number" 
                                    secondary={selectedTransaction.referenceDetails.contactNumber}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <EventIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Date Observed" 
                                    secondary={formatDate(selectedTransaction.referenceDetails.dateObserved)}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                            <List dense disablePadding>
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Issue Type" 
                                    secondary={selectedTransaction.referenceDetails.issueType || selectedTransaction.details?.issueType || 'N/A'}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Location" 
                                    secondary={selectedTransaction.referenceDetails.location}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Nearest Landmark" 
                                    secondary={selectedTransaction.referenceDetails.nearestLandmark}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                                
                                <ListItem sx={{ px: 0, py: 0.75 }}>
                                <InfoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 2 }} />
                                <ListItemText 
                                    primary="Status" 
                                    secondary={selectedTransaction.referenceDetails.status}
                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                                />
                                </ListItem>
                            </List>
                            </Grid>
                            
                            <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Description
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                                {selectedTransaction.referenceDetails.description}
                            </Typography>
                            
                            {selectedTransaction.referenceDetails.additionalComments && (
                                <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Additional Comments
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                                    {selectedTransaction.referenceDetails.additionalComments}
                                </Typography>
                                </Box>
                            )}
                            </Grid>
                            
                            {/* Resident Feedback Section */}
                            {selectedTransaction.referenceDetails.residentFeedback && 
                            (selectedTransaction.referenceDetails.residentFeedback.satisfied !== undefined || 
                            selectedTransaction.referenceDetails.residentFeedback.comments) && (
                            <Grid item xs={12}>
                                <Card sx={{ mt: 2, bgcolor: '#f8f9fa', borderRadius: '8px', boxShadow: 'none', border: '1px solid #eeeeee' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f0f0f0', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                                    <ReplyIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                                    <Typography variant="subtitle2">
                                    Your Feedback
                                    </Typography>
                                </Box>
                                <CardContent>
                                    {selectedTransaction.referenceDetails.residentFeedback.satisfied !== undefined && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', minWidth: 100 }}>
                                        Satisfaction:
                                        </Typography>
                                        <Chip 
                                        size="small" 
                                        color={selectedTransaction.referenceDetails.residentFeedback.satisfied ? "success" : "error"}
                                        label={selectedTransaction.referenceDetails.residentFeedback.satisfied ? "Satisfied" : "Not Satisfied"}
                                        />
                                    </Box>
                                    )}
                                    
                                    {selectedTransaction.referenceDetails.residentFeedback.comments && (
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Comments:
                                        </Typography>
                                        <Typography variant="body1" sx={{ pl: 2 }}>
                                        {selectedTransaction.referenceDetails.residentFeedback.comments}
                                        </Typography>
                                    </Box>
                                    )}
                                </CardContent>
                                </Card>
                            </Grid>
                            )}
                            
                            {/* Display attached media if available */}
                            {selectedTransaction.referenceDetails.mediaUrls && 
                            selectedTransaction.referenceDetails.mediaUrls.length > 0 && (
                            <Grid item xs={12}>
                                <Box sx={{ mt: 2, border: '1px dashed #ccc', borderRadius: '8px', p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FileIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                                    <Typography variant="subtitle2">
                                    Attached Media ({selectedTransaction.referenceDetails.mediaUrls.length})
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedTransaction.referenceDetails.mediaUrls.map((url, index) => (
                                    <Button
                                        key={index}
                                        component="a" 
                                        href={`http://localhost:3002${url}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FileIcon />}
                                    >
                                        Attachment {index + 1}
                                    </Button>
                                    ))}
                                </Box>
                                </Box>
                            </Grid>
                            )}
                        </Grid>
                        </CardContent>
                    </Card>
                    )}
                </>
                )}
                
                {/* Admin Comments Section */}
                {selectedTransaction.adminComment && (
                <Grid item xs={12}>
                    <Card sx={{ mt: 3, bgcolor: '#f5f5f5', borderRadius: '8px', boxShadow: 'none', border: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                        <InfoIcon fontSize="small" sx={{ color: 'info.main', mr: 1 }} />
                        <Typography variant="subtitle2">
                        Admin Comment
                        </Typography>
                    </Box>
                    <CardContent>
                        <Typography variant="body1">
                        {selectedTransaction.adminComment}
                        </Typography>
                    </CardContent>
                    </Card>
                </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: '#f9f9f9', 
            borderTop: '1px solid #eee',
            justifyContent: 'flex-end' 
            }}>
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1.5, 
                width: '100%', 
                justifyContent: isMobile ? 'center' : 'flex-end' 
            }}>
            {selectedTransaction && 
            selectedTransaction.serviceType === 'infrastructure_report' && 
            (
              // If using transaction status (lowercase)
              (selectedTransaction.status === 'completed' || 
              // Or if using report status (PascalCase) from referenceDetails
              (selectedTransaction.referenceDetails?.status === 'Resolved'))
            ) && 
            !selectedTransaction.referenceDetails?.residentFeedback && (
              <Button 
                onClick={() => {
                  // Store the report ID before opening feedback dialog
                  let reportId = null;
                  if (selectedTransaction.referenceId) {
                    reportId = selectedTransaction.referenceId;
                  } else if (selectedTransaction.details && selectedTransaction.details.reportId) {
                    reportId = selectedTransaction.details.reportId;
                  } else if (selectedTransaction.referenceDetails && selectedTransaction.referenceDetails._id) {
                    reportId = selectedTransaction.referenceDetails._id;
                  }
                  
                  if (reportId) {
                    setFeedbackReportId(reportId);
                    setOpenFeedbackDialog(true);
                  } else {
                    setSnackbar({
                      open: true,
                      message: 'Cannot determine report ID for feedback',
                      severity: 'error'
                    });
                  }
                }} 
                color="primary"
                variant="contained"
                startIcon={<ReplyIcon />}
                size={isMobile ? "large" : "medium"}
                sx={{ 
                  borderRadius: '4px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  ...(isMobile && { flex: '1 1 auto' })
                }}
              >
                Provide Feedback
              </Button>
            )}
            {selectedTransaction && needsDieselResponse(selectedTransaction) && (
              <Button 
                onClick={() => {
                  handleCloseDetails();
                  handleRespondToDiesel(selectedTransaction);
                }} 
                color="secondary"
                variant="contained"
                startIcon={<ReplyIcon />}
                size={isMobile ? "large" : "medium"}
                sx={{ 
                  borderRadius: '4px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  ...(isMobile && { flex: '1 1 auto' })
                }}
              >
                Respond to Diesel Request
              </Button>
            )}
            {selectedTransaction && canCancel(selectedTransaction) && (
              <Button 
                onClick={() => {
                  handleCloseDetails();
                  handleCancelRequest(selectedTransaction);
                }} 
                color="error"
                variant="contained"
                startIcon={<CancelIcon />}
                size={isMobile ? "large" : "medium"}
                sx={{ 
                  borderRadius: '4px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  ...(isMobile && { flex: '1 1 auto' })
                }}
              >
                Cancel Request
              </Button>
            )}
            <Button 
              onClick={handleCloseDetails}
              variant={isMobile ? "outlined" : "text"}
              size={isMobile ? "large" : "medium"}
              sx={{ ...(isMobile && { flex: '1 1 auto' }) }}
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={openCancel} onClose={() => setOpenCancel(false)}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this request? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for cancellation (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancel(false)}>No, Keep Request</Button>
          <Button onClick={confirmCancel} color="error">
            Yes, Cancel Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog for Infrastructure Reports */}
      <Dialog
        open={openFeedbackDialog}
        onClose={() => {
          setOpenFeedbackDialog(false);
          setFeedbackReportId(null); // Clear the ID when closing
        }}
      >
        <DialogTitle>Provide Your Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you satisfied with how your issue was resolved?
          </DialogContentText>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={feedbackSatisfied ? 'yes' : 'no'}
              onChange={(e) => setFeedbackSatisfied(e.target.value === 'yes')}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes, I'm satisfied" />
              <FormControlLabel value="no" control={<Radio />} label="No, I'm not satisfied" />
            </RadioGroup>
          </FormControl>
          <TextField
            margin="dense"
            id="feedback-comments"
            label="Comments (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={feedbackComments}
            onChange={(e) => setFeedbackComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFeedbackDialog(false)}>Cancel</Button>
          <Button 
            onClick={submitFeedback} 
            color="primary"
            variant="contained"
            disabled={feedbackSubmitting}
          >
            {feedbackSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diesel Cost Response Dialog */}
      <Dialog
        open={openDieselDialog}
        onClose={() => !dieselResponseLoading && setOpenDieselDialog(false)}
      >
        <DialogTitle>Diesel Cost Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The ambulance service requires you to cover the diesel cost for this trip. Do you agree to cover this cost?
          </DialogContentText>
          {selectedTransaction?.adminComment && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Admin Note:</strong> {selectedTransaction.adminComment}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleDieselCostDecision(false)} 
            color="error"
            disabled={dieselResponseLoading}
          >
            Decline
          </Button>
          <Button 
            onClick={() => handleDieselCostDecision(true)} 
            color="primary" 
            variant="contained"
            disabled={dieselResponseLoading}
          >
            {dieselResponseLoading ? <CircularProgress size={24} /> : 'Accept'}
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
    </Container>
  );
};

export default ResidentTransaction;