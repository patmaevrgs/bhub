import mongoose from 'mongoose';

const courtReservationSchema = new mongoose.Schema({
  serviceId: { 
    type: String,
    unique: true,
    default: function() {
      return 'CRT' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  
  representativeName: {
    type: String,
    required: true
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservationDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  numberOfPeople: {
    type: String, // Will store a range or number
    required: true
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled', 'rejected'],
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

// Update the timestamp before saving
courtReservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CourtReservation = mongoose.model('CourtReservation', courtReservationSchema);
export default CourtReservation;