import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['ambulance_booking', 'document_request', 'payment', 'court_reservation', 'other', 'infrastructure_report', 'project_proposal', 'resident_registration']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'completed', 'cancelled', 'needs_approval', 'rejected'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  details: {
    type: Object,
    default: {}
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'serviceType'
  },
  adminComment: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;