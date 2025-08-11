import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import API_BASE_URL from '../../config';

const AdminChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');
  const [adminUserType, setAdminUserType] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuChatId, setMenuChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    const userType = localStorage.getItem('userType') || '';
    setAdminName(`${firstName} ${lastName}`.trim());
    setAdminUserType(userType);

    fetchChats();

    if (socket) {
      socket.emit('join_admin_chat');
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_chat', (data) => {
        fetchChats();
    });

    socket.on('new_message', (data) => {
        if (selectedChat && data.chatId === selectedChat.chatId) {
        setSelectedChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), data.message]
        }));
        
        // Mark as read when admin is viewing the chat
        markChatAsRead(data.chatId);
        }

        setChats(prev => prev.map(chat =>
        chat.chatId === data.chatId
            ? { 
                ...chat, 
                lastMessage: new Date(), 
                messages: [...(chat.messages || []), data.message],
                hasUnreadMessages: selectedChat?.chatId !== data.chatId || data.message.senderUserType !== 'admin'
            }
            : chat
        ));
    });

    socket.on('user_message', (data) => {
        fetchChats();
    });

    socket.on('chat_deleted', (data) => {
        setChats(prev => prev.filter(chat => chat.chatId !== data.chatId));
        if (selectedChat?.chatId === data.chatId) {
        setSelectedChat(null);
        }
    });

    return () => {
        socket.off('new_chat');
        socket.off('new_message');
        socket.off('user_message');
        socket.off('chat_deleted');
    };
    }, [socket, selectedChat]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const markChatAsRead = async (chatId) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/chat/${chatId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    // Leave previous room and join new one
    if (socket && selectedChat) {
      socket.emit('leave_chat', selectedChat.chatId);
    }
    
    setSelectedChat(chat);
    
    if (socket) {
      socket.emit('join_chat', chat.chatId);
    }

    // Mark as read when opening
    if (chat.hasUnreadMessages) {
      await markChatAsRead(chat.chatId);
      setChats(prev => prev.map(c => 
        c.chatId === chat.chatId 
          ? { ...c, hasUnreadMessages: false }
          : c
      ));
    }
  };

  const sendMessage = async () => {
  if (!message.trim() || !selectedChat) return;

  try {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType'); // Get from localStorage
    
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-is-admin': 'true',
        'x-user-type': userType // Pass the userType from localStorage
      },
      credentials: 'include',
      body: JSON.stringify({
        chatId: selectedChat.chatId,
        message: message.trim(),
        senderName: adminName
      })
    });

    const data = await response.json();
    if (data.success) {
      setMessage('');
    } else {
      alert('Error sending message: ' + data.message);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  }
};

  const closeChat = async (chatId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        fetchChats();
        if (selectedChat?.chatId === chatId) {
          setSelectedChat(null);
        }
      } else {
        alert('Error closing chat: ' + data.message);
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      alert('Error closing chat. Please try again.');
    }
  };

  const handleDeleteChat = (chat) => {
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/chat/${chatToDelete.chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        fetchChats();
        if (selectedChat?.chatId === chatToDelete.chatId) {
          setSelectedChat(null);
        }
        setDeleteDialogOpen(false);
        setChatToDelete(null);
      } else {
        alert('Error deleting chat: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMenuClick = (event, chatId) => {
    setAnchorEl(event.currentTarget);
    setMenuChatId(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuChatId(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 'No messages yet';
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message.length > 50
      ? `${lastMsg.message.substring(0, 50)}...`
      : lastMsg.message;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Chat Support</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage conversations with residents and visitors
      </Typography>

      <Grid container spacing={2}>
        {/* Chat List */}
        <Grid item xs={12} md={4} sx={{width: '30%'}}>
          <Paper sx={{ height: 605, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <Typography variant="h6">Active Chats ({chats.length})</Typography>
              <IconButton size="small" onClick={fetchChats}>
                <RefreshIcon />
              </IconButton>
            </Box>

            <Divider />

            
            <List sx={{ overflowY: 'auto', flex: '1 1 auto', py: 0 }}>
            {chats.length === 0 ? (
                <ListItem>
                <ListItemText
                    primary="No active chats"
                    secondary="Chats will appear here when users start conversations"
                    sx={{ textAlign: 'center' }}
                />
                </ListItem>
            ) : (
                chats.map((chat) => (
                <ListItem
                    key={chat._id || chat.chatId}
                    component="div" // Add this to fix button attribute issue
                    onClick={() => handleSelectChat(chat)}
                    selected={selectedChat?.chatId === chat.chatId}
                    sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer', // Add cursor pointer since we removed button
                    '&.Mui-selected': { 
                        bgcolor: 'primary.light', 
                        color: 'primary.contrastText' 
                    },
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                    }}
                    secondaryAction={
                    <IconButton
                        size="small"
                        onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(e, chat.chatId);
                        }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    }
                >
                    <ListItemAvatar>
                    <Avatar>
                        <PersonIcon />
                    </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                    primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                            <Typography 
                            component="span" // Use span instead of p
                            variant="subtitle2" 
                            noWrap
                            sx={{ 
                                fontWeight: chat.hasUnreadMessages ? 700 : 500,
                                mr: 1
                            }}
                            >
                            {chat.userName}
                            </Typography>
                            {chat.hasUnreadMessages && (
                            <CircleIcon 
                                sx={{ 
                                fontSize: 8, 
                                color: 'error.main',
                                ml: 0.5
                                }} 
                            />
                            )}
                        </Box>
                        <Typography component="span" variant="caption" color="text.secondary">
                            {formatTime(chat.lastMessage)}
                        </Typography>
                        </Box>
                    }
                    secondary={
                        <Box component="div"> {/* Use div container for secondary content */}
                        <Typography 
                            component="span" // Use span instead of p
                            variant="body2" 
                            color="text.secondary" 
                            noWrap
                            sx={{ 
                            fontWeight: chat.hasUnreadMessages ? 600 : 400,
                            display: 'block',
                            mb: 0.5
                            }}
                        >
                            {getLastMessage(chat)}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                            <Chip 
                            label={chat.status} 
                            size="small" 
                            color={chat.status === 'active' ? 'success' : 'default'} 
                            />
                            <Chip 
                            label={chat.userType} 
                            size="small" 
                            variant="outlined" 
                            />
                            {chat.hasUnreadMessages && (
                            <Chip 
                                label="New" 
                                size="small" 
                                color="error"
                                sx={{ fontSize: '0.65rem' }}
                            />
                            )}
                        </Box>
                        </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                    />
                </ListItem>
                ))
            )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={8} sx={{width: '50%'}}>
          <Paper sx={{ height: 605, display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <>
                {/* Header */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider', 
                  bgcolor: 'grey.50' 
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{selectedChat.userName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedChat.userType} • Chat ID: {selectedChat.chatId}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => closeChat(selectedChat.chatId)}
                      disabled={selectedChat.status === 'closed'}
                    >
                      Close Chat
                    </Button>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ 
                flex: '1 1 auto', 
                overflowY: 'auto', 
                p: 2, 
                bgcolor: 'grey.50' 
                }}>
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
                    {selectedChat.messages?.map((msg, index) => {
                    const isAdminMessage = msg.senderUserType === 'admin' || msg.senderUserType === 'superadmin';

                    return (
                        <ListItem
                        key={index}
                        component="div" // Use div instead of li
                        sx={{
                            display: 'flex',
                            justifyContent: isAdminMessage ? 'flex-end' : 'flex-start',
                            py: 0,
                            px: 0 // Remove padding to avoid layout issues
                        }}
                        >
                        <Paper
                            elevation={1}
                            sx={{
                            p: 1.25,
                            maxWidth: '75%',
                            bgcolor: isAdminMessage ? 'primary.main' : 'grey.200',
                            color: isAdminMessage ? 'white' : 'text.primary',
                            borderRadius: 2,
                            textAlign: isAdminMessage ? 'right' : 'left'
                            }}
                        >
                            <Typography 
                            component="div" // Use div instead of p
                            variant="caption" 
                            sx={{ 
                                opacity: 0.85, 
                                display: 'block', 
                                mb: 0.25 
                            }}
                            >
                            <Box component="span">{msg.senderName}</Box>
                            {isAdminMessage && (
                                <Chip 
                                label={msg.senderUserType} 
                                size="small" 
                                sx={{ 
                                    ml: 1, 
                                    height: 16, 
                                    fontSize: '0.6rem',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white'
                                }} 
                                />
                            )}
                            </Typography>
                            <Typography 
                            component="div" // Use div instead of p
                            variant="body2" 
                            sx={{ whiteSpace: 'pre-wrap' }}
                            >
                            {msg.message}
                            </Typography>
                            <Typography 
                            component="div" // Use div instead of p
                            variant="caption" 
                            sx={{ 
                                opacity: 0.7, 
                                display: 'block', 
                                mt: 0.5 
                            }}
                            >
                            {formatTime(msg.timestamp)}
                            </Typography>
                        </Paper>
                        </ListItem>
                    );
                    })}
                    <div ref={messagesEndRef} />
                </List>
                </Box>

                {/* Input */}
                {selectedChat.status === 'active' && (
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid', 
                    borderColor: 'divider' 
                  }}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your response..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={3}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={sendMessage} 
                        disabled={!message.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}

                {selectedChat.status === 'closed' && (
                  <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      This chat has been closed
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'column', 
                gap: 2 
              }}>
                <ChatIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  Select a chat to start messaging
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a conversation from the list to view and respond to messages
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const chat = chats.find(c => c.chatId === menuChatId);
          if (chat) closeChat(chat.chatId);
          handleMenuClose();
        }}>
          <CloseIcon sx={{ mr: 1 }} />
          Close Chat
        </MenuItem>
        <MenuItem onClick={() => {
          const chat = chats.find(c => c.chatId === menuChatId);
          if (chat) handleDeleteChat(chat);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Chat
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          {chatToDelete && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete the chat with {chatToDelete.userName}? 
              This action cannot be undone and all messages will be permanently removed.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteChat}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Chat'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminChat;