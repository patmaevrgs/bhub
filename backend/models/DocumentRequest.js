import mongoose from 'mongoose';

const documentRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'barangay_id', 
      'barangay_clearance', 
      'business_clearance', 
      'lot_ownership', 
      'digging_permit', 
      'fencing_permit', 
      'request_for_assistance', 
      'certificate_of_indigency', 
      'certificate_of_residency', 
      'no_objection_certificate',
    ]
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  formData: {
    type: Object,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  adminComment: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceId: {
    type: String,
    default: function() {
      // Generate a service ID with DOC prefix followed by timestamp
      return 'DOC' + Math.floor(100000 + Math.random() * 900000);
    }
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
documentRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DocumentRequest = mongoose.model('DocumentRequest', documentRequestSchema);
export default DocumentRequest;