import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional reference to the related entity (like announcement ID)
  entityId: {
    type: String  // For service IDs like PRJ123456
  },
  mongoId: {
    type: mongoose.Schema.Types.ObjectId,  // For MongoDB references
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    enum: ['Announcement', 'Report', 'ProjectProposal', 'DocumentRequest', 'AmbulanceBooking', 'CourtReservation', 'HomepageContent', 'Other'],
    default: 'Other'
  }
});

const UserLog = mongoose.model('UserLog', userLogSchema);
export default UserLog;