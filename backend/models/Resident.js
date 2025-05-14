import mongoose from 'mongoose';

const ResidentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String, 
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  precinctLevel: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  types: {
    type: [String], 
    enum: ['Minor', '18-30', 'Illiterate', 'PWD', 'Senior Citizen', 'Indigent'],
    default: []
  },
  isVoter: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster searches
ResidentSchema.index({ firstName: 1, lastName: 1 });
ResidentSchema.index({ types: 1 });
ResidentSchema.index({ isVoter: 1 });
ResidentSchema.index({ precinctLevel: 1 });

const Resident = mongoose.model('Resident', ResidentSchema);

export default Resident;