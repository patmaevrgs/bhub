import Chat from '../models/Chat.js';
import { v4 as uuidv4 } from 'uuid';

// Create new chat session
export const createChat = async (req, res) => {
  try {
    const { userName } = req.body;
   
    console.log('Creating chat for user:', userName); // Debug log
   
    if (!userName || !userName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.authToken;
    const userType = token ? 'resident' : 'visitor';

    const chatId = uuidv4();
    console.log('Generated chatId:', chatId); // Debug log
   
    const newChat = new Chat({
      chatId,
      userName: userName.trim(),
      userType,
      messages: [],
      status: 'active',
      hasUnreadMessages: false
    });

    const savedChat = await newChat.save();
    console.log('Chat saved successfully:', savedChat.chatId); // Debug log

    res.status(201).json({
      success: true,
      chat: savedChat // Make sure to return the saved chat
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat'
    });
  }
};

// Send message with debugging
export const sendMessage = async (req, res) => {
  try {
    const { chatId, message, senderName } = req.body;
    
    console.log('Attempting to send message to chatId:', chatId); // Debug log

    if (!chatId || !message || !senderName) {
      console.log('Missing required fields:', { chatId, message: !!message, senderName }); // Debug log
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const chat = await Chat.findOne({ chatId });
    console.log('Chat found:', !!chat); // Debug log
    
    if (!chat) {
      console.log('Chat not found with chatId:', chatId); // Debug log
      // Let's also check if there are any chats in the database
      const allChats = await Chat.find({}).select('chatId userName');
      console.log('All chats in database:', allChats); // Debug log
      
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Rest of the function...
    if (chat.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Chat is closed'
      });
    }

    const isAdmin = req.headers['x-is-admin'] === 'true';
    const userTypeFromClient = req.headers['x-user-type'];
    
    let senderType = 'user';
    let senderUserType = 'visitor';
    
    if (isAdmin) {
      senderType = 'admin';
      senderUserType = userTypeFromClient || 'admin';
    } else {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.authToken;
      senderType = 'user';
      senderUserType = token ? 'resident' : 'visitor';
    }

    const newMessage = {
      sender: senderType,
      senderName: senderName.trim(),
      senderUserType,
      message: message.trim(),
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();

    if (senderType === 'user') {
      chat.hasUnreadMessages = true;
      chat.lastUserMessage = new Date();
    } else {
      chat.adminReadAt = new Date();
      chat.hasUnreadMessages = false;
    }

    await chat.save();

    const io = req.app.get('io');
    io.to(`chat_${chatId}`).emit('new_message', {
      chatId,
      message: newMessage
    });

    if (senderType === 'user') {
      if (chat.messages.length === 1) {
        io.to('admins').emit('new_chat', {
          chatId: chat.chatId,
          userName: chat.userName,
          userType: chat.userType,
          timestamp: new Date()
        });
      }

      io.to('admins').emit('user_message', {
        chatId,
        userName: chat.userName,
        message: newMessage,
        hasUnreadMessages: true
      });

      io.to('admins').emit('new_request', {
        type: 'user_message',
        id: chatId,
        message: `New message from ${chat.userName}`,
        timestamp: new Date(),
        data: { chatId, userName: chat.userName }
      });
    }

    res.status(200).json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Get specific chat
export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
   
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });

  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chat'
    });
  }
};

// Get all chats (for admin) - only show chats with messages
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      $expr: { $gt: [{ $size: "$messages" }, 0] }
    })
      .sort({ lastMessage: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      chats
    });

  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chats'
    });
  }
};

// Mark chat as read by admin
// Mark chat as read by admin - Updated with socket emit
export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
   
    const chat = await Chat.findOneAndUpdate(
      { chatId, hasUnreadMessages: true }, // Only update if it was actually unread
      { 
        hasUnreadMessages: false,
        adminReadAt: new Date()
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or already read'
      });
    }

    // Emit socket event to update sidebar counts
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('chat_read', {
        chatId: chat.chatId,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat marked as read'
    });

  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking chat as read'
    });
  }
};

// Close chat
export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
   
    const chat = await Chat.findOneAndUpdate(
      { chatId },
      { 
        status: 'closed',
        hasUnreadMessages: false
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const io = req.app.get('io');
    io.to(`chat_${chatId}`).emit('chat_closed', { chatId });

    res.status(200).json({
      success: true,
      message: 'Chat closed successfully'
    });

  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing chat'
    });
  }
};

// Delete chat - simplified without auth check
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
   
    const chat = await Chat.findOneAndDelete({ chatId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const io = req.app.get('io');
    io.to(`chat_${chatId}`).emit('chat_deleted', { chatId });

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chat'
    });
  }
};

// Get chat statistics
export const getChatStats = async (req, res) => {
  try {
    const unreadChats = await Chat.countDocuments({ 
      hasUnreadMessages: true,
      status: 'active',
      $expr: { $gt: [{ $size: "$messages" }, 0] }
    });

    const activeChats = await Chat.countDocuments({ 
      status: 'active',
      $expr: { $gt: [{ $size: "$messages" }, 0] }
    });

    const totalChats = await Chat.countDocuments({
      $expr: { $gt: [{ $size: "$messages" }, 0] }
    });

    res.status(200).json({
      success: true,
      stats: {
        unreadChats,
        activeChats,
        totalChats
      }
    });

  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chat stats'
    });
  }
};