import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  serviceId: { 
    type: String,
    unique: true,
    default: function() {
      return 'REP' + Math.floor(100000 + Math.random() * 900000);
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
  location: { 
    type: String, 
    required: true 
  },
  nearestLandmark: { 
    type: String, 
    required: true 
  },
  issueType: { 
    type: String, 
    required: true 
  },
  dateObserved: { 
    type: Date, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  additionalComments: { 
    type: String 
  },
  mediaUrls: [{ 
    type: String 
  }],
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Cancelled'], 
    default: 'Pending' 
  },
  adminComments: { 
    type: String 
  },
  residentFeedback: {
    satisfied: { 
      type: Boolean 
    },
    comments: { 
      type: String 
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

export default mongoose.model("Report", reportSchema);