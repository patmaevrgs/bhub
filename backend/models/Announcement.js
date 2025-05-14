import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { // Added title field
    type: String,
    required: true,
    default: 'Brgy Maahas Update'
  },
  content: String,
  postedBy: String,
  images: [String],
  videos: [String],
  files: [{ 
    name: String,
    path: String
  }],
  links: [String],
  postedAt: { type: Date, default: Date.now },
  editedAt: { type: Date },
  // Add a type field for categorizing announcements
  type: {
    type: String,
    enum: ['General', 'Event', 'Emergency', 'Notice', 'Other'],
    default: 'General'
  }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;