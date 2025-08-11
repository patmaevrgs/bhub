import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Collapse,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import API_BASE_URL from '../config';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(null); // Store the full chat object
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    
    if (token && firstName) {
      setIsLoggedIn(true);
      setUserName(`${firstName} ${lastName || ''}`.trim());
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.chatId === currentChat?.chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleChatClosed = (data) => {
      if (data.chatId === currentChat?.chatId) {
        setSnackbar({
          open: true,
          message: 'Chat has been closed by administrator',
          severity: 'info'
        });
        setTimeout(() => {
          setIsOpen(false);
          setCurrentChat(null);
          setMessages([]);
        }, 2000);
      }
    };

    const handleChatDeleted = (data) => {
      if (data.chatId === currentChat?.chatId) {
        setSnackbar({
          open: true,
          message: 'Chat has been deleted by administrator',
          severity: 'warning'
        });
        setTimeout(() => {
          setIsOpen(false);
          setCurrentChat(null);
          setMessages([]);
        }, 2000);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('chat_closed', handleChatClosed);
    socket.on('chat_deleted', handleChatDeleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('chat_closed', handleChatClosed);
      socket.off('chat_deleted', handleChatDeleted);
    };
  }, [socket, currentChat]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = () => {
    if (isLoggedIn) {
      createChat(userName);
    } else {
      setShowNameDialog(true);
    }
  };

  // CREATE CHAT FUNCTION - This was missing!
  const createChat = async (name) => {
    if (!name.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter your name',
        severity: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if logged in
      if (isLoggedIn) {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/chat/create`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ userName: name.trim() })
      });

      const data = await response.json();
      console.log('Create chat response:', data); // Debug log
      
      if (data.success) {
        setCurrentChat(data.chat);
        setMessages(data.chat.messages || []);
        setIsOpen(true);
        setShowNameDialog(false);
        
        // Join chat room
        if (socket) {
          socket.emit('join_chat', data.chat.chatId);
        }
        
        setSnackbar({
          open: true,
          message: 'Chat started! Send a message to connect with support.',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to create chat',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentChat) {
      console.log('Cannot send message:', { 
        message: message.trim(), 
        isLoading, 
        currentChat: !!currentChat 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if logged in
      if (isLoggedIn) {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log('Sending message to chatId:', currentChat.chatId); // Debug log

      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          chatId: currentChat.chatId,
          message: message.trim(),
          senderName: userName
        })
      });

      const data = await response.json();
      console.log('Send message response:', data); // Debug log
      
      if (data.success) {
        setMessage('');
        // Message will be added via socket
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to send message',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closeChat = () => {
    if (socket && currentChat) {
      socket.emit('leave_chat', currentChat.chatId);
    }
    setIsOpen(false);
    setCurrentChat(null);
    setMessages([]);
    setMessage('');
    
    setSnackbar({
      open: true,
      message: 'Chat closed',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      {/* Chat Fab Button */}
      {!isOpen && (
        <Fab
          color="primary"
          onClick={handleStartChat}
          disabled={isLoading}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            background: 'linear-gradient(45deg, #0a8a0d, #26a69a)',
            boxShadow: '0 4px 20px rgba(10,138,13,0.3)',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out',
              boxShadow: '0 6px 25px rgba(10,138,13,0.4)',
            },
            '&.Mui-disabled': {
              bgcolor: '#e0e0e0'
            }
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Name Dialog for Visitors */}
      <Dialog 
        open={showNameDialog} 
        onClose={() => !isLoading && setShowNameDialog(false)}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #0a8a0d, #26a69a)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600
        }}>
          💬 Start Chat Support
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Please enter your name to start chatting with our support team.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && userName.trim() && !isLoading && createChat(userName)}
            placeholder="Enter your full name"
            variant="outlined"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a8a0d',
                },
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#0a8a0d',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowNameDialog(false)} 
            color="inherit"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => createChat(userName)} 
            variant="contained"
            disabled={!userName.trim() || isLoading}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #0a8a0d, #26a69a)',
              '&:hover': {
                background: 'linear-gradient(45deg, #097a0c, #239a94)',
              }
            }}
          >
            {isLoading ? 'Creating...' : 'Start Chat'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: '90vw', sm: 380 },
            maxWidth: 380,
            height: isMinimized ? 60 : 550,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(45deg, #0a8a0d, #26a69a)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                <AdminIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Support Chat
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                  Barangay Maahas Staff
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={0.5}>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={closeChat}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Collapse in={!isMinimized}>
            {/* Welcome Message */}
            {messages.length === 0 && (
              <Box sx={{ 
                p: 2.5, 
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  👋 Hello <strong>{userName}</strong>! <br/>
                  Send your first message to connect with our support team.
                </Typography>
              </Box>
            )}

            {/* Messages Container */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1,
                bgcolor: '#fafafa',
                height: 380,
                backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              <List sx={{ py: 0.5 }}>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.sender === 'user';
                  
                  return (
                    <ListItem
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        py: 0.75,
                        px: 1
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: 1,
                          maxWidth: '85%'
                        }}
                      >
                        {/* Avatar */}
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isOwnMessage ? '#0a8a0d' : '#757575',
                            fontSize: '0.75rem'
                          }}
                        >
                          {isOwnMessage ? (
                            <PersonIcon fontSize="small" />
                          ) : (
                            <AdminIcon fontSize="small" />
                          )}
                        </Avatar>
                        
                        {/* Message Bubble */}
                        <Paper
                          elevation={3}
                          sx={{
                            p: 1.5,
                            bgcolor: isOwnMessage ? '#0a8a0d' : 'white',
                            color: isOwnMessage ? 'white' : 'text.primary',
                            borderRadius: isOwnMessage 
                              ? '18px 18px 4px 18px' 
                              : '18px 18px 18px 4px',
                            position: 'relative',
                            wordBreak: 'break-word',
                            boxShadow: isOwnMessage 
                              ? '0 2px 12px rgba(10,138,13,0.3)' 
                              : '0 2px 8px rgba(0,0,0,0.1)',
                            border: isOwnMessage ? 'none' : '1px solid rgba(0,0,0,0.05)'
                          }}
                        >
                          {/* Sender Name */}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.8,
                              display: 'block',
                              mb: 0.5,
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}
                          >
                            {msg.senderName}
                          </Typography>
                          
                          {/* Message Text */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.875rem',
                              lineHeight: 1.4
                            }}
                          >
                            {msg.message}
                          </Typography>
                          
                          {/* Timestamp */}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.7,
                              display: 'block',
                              mt: 0.5,
                              textAlign: 'right',
                              fontSize: '0.65rem'
                            }}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </Paper>
                      </Box>
                    </ListItem>
                  );
                })}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'white',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end'
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                variant="outlined"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    bgcolor: '#f8f9fa',
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: '#e9ecef'
                    },
                    '&.Mui-focused': {
                      bgcolor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0a8a0d',
                      }
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0,0,0,0.1)'
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!message.trim() || isLoading || !currentChat}
                sx={{
                  bgcolor: '#0a8a0d',
                  color: 'white',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: '#097a0c'
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#bdbdbd'
                  }
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatWidget;