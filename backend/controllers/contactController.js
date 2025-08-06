import ContactMessage from '../models/ContactMessage.js';
import nodemailer from 'nodemailer';

// Create contact message
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required'
      });
    }

    // Create new contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });

    await contactMessage.save();

    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Send to admin
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Message: ${subject}`,
        text: `
          New contact message received:
          
          Name: ${name}
          Email: ${email}
          Phone: ${phone || 'Not provided'}
          Subject: ${subject}
          
          Message:
          ${message}
          
          Reply to this email to respond directly to the sender.
        `,
        replyTo: email
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: contactMessage
    });

  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send contact message',
      error: error.message
    });
  }
};

// Get all contact messages (admin only)
export const getContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contactMessages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(query);
    
    // Count by status
    const statusCounts = await ContactMessage.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      unread: 0,
      read: 0,
      total: total
    };

    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: contactMessages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + contactMessages.length < total,
        hasPrev: parseInt(page) > 1
      },
      counts
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
};

// Get single contact message by ID
export const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contactMessage = await ContactMessage.findById(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: contactMessage
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message
    });
  }
};

// Mark contact message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contactMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message marked as read',
      data: contactMessage
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Delete contact message
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contactMessage = await ContactMessage.findByIdAndDelete(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
};

// Get count of unread messages for sidebar badge
export const getUnreadCount = async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({ status: 'unread' });
    
    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};