import mongoose from 'mongoose';

const ambulanceBookingSchema = new mongoose.Schema({
  serviceId: { 
    type: String,
    unique: true,
    default: function() {
      return 'AMB' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  patientName: { 
    type: String, 
    required: true 
  },
  pickupDate: { 
    type: Date, 
    required: true 
  },
  pickupTime: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String, 
    required: true 
  },
  pickupAddress: { 
    type: String, 
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  emergencyDetails: { 
    type: String, 
    required: true 
  },
  additionalNote: { 
    type: String,
    default: ''
  },
  submitterRelation: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'booked', 'cancelled', 'completed', 'needs_approval'],
    default: 'pending'
  },
  adminComment: {
    type: String,
    default: ''
  },
  dieselCost: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Update the timestamp before saving
ambulanceBookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const AmbulanceBooking = mongoose.model('AmbulanceBooking', ambulanceBookingSchema);
export default AmbulanceBooking;