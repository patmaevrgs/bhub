import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['resident', 'visitor'],
    default: 'visitor'
  },
  userId: {
    type: String, // Store user ID for logged-in residents
    default: null
  },
  messages: [{
    sender: {
      type: String,
      required: true // 'user' or 'admin'
    },
    senderName: {
      type: String,
      required: true
    },
    senderUserType: {
      type: String,
      enum: ['admin', 'superadmin', 'resident', 'visitor'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  lastMessage: {
    type: Date,
    default: Date.now
  },
  hasUnreadMessages: {
    type: Boolean,
    default: false
  },
  lastUserMessage: {
    type: Date,
    default: null
  },
  adminReadAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add index for better performance
chatSchema.index({ chatId: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ hasUnreadMessages: 1 });

export default mongoose.model('Chat', chatSchema);