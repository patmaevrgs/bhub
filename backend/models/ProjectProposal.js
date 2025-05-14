import mongoose from 'mongoose';

const projectProposalSchema = new mongoose.Schema({
  serviceId: { 
    type: String,
    unique: true,
    default: function() {
      return 'PRJ' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  documentPath: {
    type: String,
    required: true
  },
  documentFilename: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_review', 'considered', 'approved', 'rejected'],
    default: 'pending'
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
projectProposalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ProjectProposal = mongoose.model('ProjectProposal', projectProposalSchema);
export default ProjectProposal;