import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Schedule as ScheduleIcon,
  Reply as ReplyIcon,
  FilterList as FilterIcon,
  MailOutline as MailOutlineIcon,
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Avatar from '@mui/material/Avatar';
import { formatDistanceToNow } from 'date-fns';

function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0
  });
  const [counts, setCounts] = useState({
    unread: 0,
    read: 0,
    total: 0
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const theme = useTheme();

  const fetchMessages = async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);
      let url = `http://localhost:3002/contact?page=${page}&limit=10`;
      
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data);
        setPagination(data.pagination);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(1, currentTab, searchTerm);
  }, [currentTab, searchTerm]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handlePageChange = (event, value) => {
    fetchMessages(value, currentTab, searchTerm);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3002/contact/${message._id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Refresh messages to update status
        fetchMessages(pagination.current, currentTab, searchTerm);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDeleteMessage = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    try {
        setDeleteLoading(true);
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3002/contact/${messageToDelete._id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });
        
        // Refresh messages
        fetchMessages(pagination.current, currentTab, searchTerm);
        setDeleteDialogOpen(false);
        setMessageToDelete(null);
    } catch (error) {
        console.error('Error deleting message:', error);
    } finally {
        setDeleteLoading(false);
    }
    };

    const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
    };

  const handleReply = (email, subject) => {
    const mailtoLink = `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`;
    window.open(mailtoLink, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return 'warning';
      case 'read':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ 
            fontWeight: 600,
            display: 'flex', 
            alignItems: 'center'
          }}
        >
          <MailOutlineIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.8rem' }} />
          Contact Messages
        </Typography>
        <Button
          variant="outlined"
          onClick={() => fetchMessages(pagination.current, currentTab, searchTerm)}
          startIcon={<RefreshIcon />}
          size="small"
          sx={{ 
            borderRadius: 1.5,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.85rem'
          }}
        >
          Refresh Messages
        </Button>
      </Box>

      {/* Description */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 3, fontSize: '0.9rem' }}
      >
        Manage and respond to contact form submissions from public users
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography 
                    color="text.secondary" 
                    variant="caption" 
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Total Messages
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ fontWeight: 700, fontSize: '1.75rem' }}
                  >
                    {counts.total}
                  </Typography>
                </Box>
                <MailOutlineIcon sx={{ fontSize: 32, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2)
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography 
                    color="warning.dark" 
                    variant="caption" 
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Unread Messages
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    color="warning.main" 
                    sx={{ fontWeight: 700, fontSize: '1.75rem' }}
                  >
                    {counts.unread}
                  </Typography>
                </Box>
                <BookmarkIcon sx={{ fontSize: 32, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
              border: '1px solid',
              borderColor: alpha(theme.palette.success.main, 0.2)
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography 
                    color="success.dark" 
                    variant="caption" 
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Read Messages
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    color="success.main" 
                    sx={{ fontWeight: 700, fontSize: '1.75rem' }}
                  >
                    {counts.read}
                  </Typography>
                </Box>
                <VisibilityIcon sx={{ fontSize: 32, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Search and Filters */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)'
        }}
      >
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 2, 
            fontWeight: 600, 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center' 
          }}
        >
          <FilterIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
          Search & Filter Messages
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              label="Search by name, email, or subject"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '1.2rem', color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 2
                }
              }}
            >
              <Tab label="All Messages" value="all" />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Unread
                    {counts.unread > 0 && (
                      <Chip 
                        label={counts.unread} 
                        size="small"
                        color="warning"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          minWidth: 16,
                          '& .MuiChip-label': {
                            padding: '0 4px'
                          }
                        }}
                      />
                    )}
                  </Box>
                }
                value="unread"
              />
              <Tab label="Read" value="read" />
            </Tabs>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setCurrentTab('all');
              }}
              startIcon={<RefreshIcon />}
              size="small"
              sx={{ 
                height: '40px', 
                borderRadius: 1, 
                textTransform: 'none', 
                fontWeight: 500,
                fontSize: '0.85rem'
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Messages Table */}
      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
          mb: 2
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Status
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Name
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Email
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Subject
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Date
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    fontSize: '0.8rem'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={28} sx={{ mb: 1 }} />
                    <Typography variant="body2" display="block" sx={{ color: 'text.secondary' }}>
                      Loading messages...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <MailOutlineIcon sx={{ fontSize: '2rem', color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No contact messages found matching your search criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message._id} hover>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <Chip
                        label={message.status}
                        color={getStatusColor(message.status)}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          fontWeight: message.status === 'unread' ? 600 : 400,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.85rem',
                      fontWeight: message.status === 'unread' ? 600 : 400 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            mr: 1.5, 
                            bgcolor: message.status === 'unread' ? 'warning.light' : 'primary.light',
                            fontSize: '0.7rem'
                          }}
                        >
                          {message.name.charAt(0).toUpperCase()}
                        </Avatar>
                        {message.name}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {message.email}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.85rem',
                      maxWidth: 200, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontWeight: message.status === 'unread' ? 600 : 400
                    }}>
                      {message.subject}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {formatDate(message.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="View Message">
                          <IconButton
                            size="small"
                            onClick={() => handleViewMessage(message)}
                            color="primary"
                            sx={{ 
                              bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: theme => alpha(theme.palette.primary.main, 0.2),
                              },
                              p: 0.75
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reply via Email">
                          <IconButton
                            size="small"
                            onClick={() => handleReply(message.email, message.subject)}
                            color="info"
                            sx={{ 
                              bgcolor: theme => alpha(theme.palette.info.main, 0.1),
                              '&:hover': {
                                bgcolor: theme => alpha(theme.palette.info.main, 0.2),
                              },
                              p: 0.75
                            }}
                          >
                            <ReplyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Message">
                            <IconButton
                                size="small"
                                onClick={() => handleDeleteMessage(message)} // Changed this line
                                color="error"
                                disabled={deleteLoading}
                                sx={{ 
                                bgcolor: theme => alpha(theme.palette.error.main, 0.1),
                                '&:hover': {
                                    bgcolor: theme => alpha(theme.palette.error.main, 0.2),
                                },
                                p: 0.75
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                            </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {pagination.total > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Pagination
              count={pagination.total}
              page={pagination.current}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* Footer Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          {messages.length} of {counts.total} Messages Shown
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
      {/* View Message Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ 
              bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
              fontWeight: 600, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '1.1rem'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
                Message Details
              </Box>
              <Chip
                label={selectedMessage.status}
                color={getStatusColor(selectedMessage.status)}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              />
            </DialogTitle>
            <Box sx={{md:5}} />
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha('#f5f5f5', 0.5), 
                borderRadius: 1, 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                  Contact Information:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.1rem' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Full Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {selectedMessage.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.1rem' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Email Address
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {selectedMessage.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  {selectedMessage.phone && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <PhoneIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.1rem' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Phone Number
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {selectedMessage.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.1rem' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Date Submitted
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {formatDate(selectedMessage.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <SubjectIcon sx={{ mr: 1, color: 'primary.main', mt: 0.5, fontSize: '1.1rem' }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Subject
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {selectedMessage.subject}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.75rem' }}>
                Message Content
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {selectedMessage.message}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                onClick={() => handleReply(selectedMessage.email, selectedMessage.subject)}
                startIcon={<ReplyIcon />}
                variant="contained"
                color="primary"
                size="small"
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Reply via Email
              </Button>
              <Button 
                onClick={() => setViewDialogOpen(false)}
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme => alpha(theme.palette.error.main, 0.05),
          fontWeight: 600, 
          display: 'flex',
          alignItems: 'center',
          fontSize: '1.1rem',
          color: 'error.main'
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Contact Message
        </DialogTitle>
        <Box sx={{md:5}} />
        <DialogContent sx={{ pt: 3 }}>
          {messageToDelete && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Are you sure you want to delete this message?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This action cannot be undone. The message will be permanently removed from the system.
                </Typography>
              </Alert>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha('#f5f5f5', 0.5), 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                  Message Details:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        From
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {messageToDelete.name}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {messageToDelete.email}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Subject
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {messageToDelete.subject}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {formatDate(messageToDelete.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            size="small"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminContact;