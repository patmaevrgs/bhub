import mongoose from 'mongoose';

const homepageContentSchema = new mongoose.Schema({
  // Hero section
  welcomeTitle: {
    type: String,
    default: 'Barangay Maahas, Los Baños, Laguna Digital Hub'
  },
  welcomeText: {
    type: String,
    default: 'Welcome to the Barangay Maahas Digital Hub - your one-stop platform for accessing essential barangay services and information. Stay updated with the latest announcements and events, request forms and permits, book services, and share your concerns or proposals with ease.'
  },
  
  // Carousel/Banner images
  carouselImages: [{
    name: String,
    path: String,
    caption: String
  }],
  
  // About section
  aboutText: {
    type: String,
    default: 'Maahas is a barangay in the municipality of Los Baños, in the province of Laguna. Its population as determined by the 2020 Census was 8,785. This represented 7.62% of the total population of Los Baños.'
  },
  
  // Summary data
  summaryData: {
    type: {
      type: String,
      default: 'barangay'
    },
    islandGroup: {
      type: String,
      default: 'Luzon'
    },
    region: {
      type: String,
      default: 'CALABARZON (Region IV‑A)'
    },
    province: {
      type: String,
      default: 'Laguna'
    },
    municipality: {
      type: String,
      default: 'Los Baños'
    },
    postalCode: {
      type: String,
      default: '4030'
    },
    population: {
      type: String,
      default: '8,785'
    },
    majorIsland: {
      type: String,
      default: 'Luzon'
    },
    coordinates: {
      type: String,
      default: '14.1766, 121.2566 (14° 11\' North, 121° 15\' East)'
    },
    elevation: {
      type: String,
      default: '16.0 meters (52.5 feet)'
    }
  },
  
  // Emergency hotlines
  emergencyHotlines: [{
    name: {
      type: String,
      required: true
    },
    numbers: [{
      type: String,
      required: true
    }]
  }],
  
  // Map coordinates
  mapCoordinates: {
    latitude: {
      type: Number,
      default: 14.1766
    },
    longitude: {
      type: Number,
      default: 121.2566
    }
  },
  
  // Current officials
  officials: [{
    name: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    }
  }],
  
  // Footer data
  footerData: {
    title: {
      type: String,
      default: 'BARANGAY MAAHAS'
    },
    description: {
      type: String,
      default: 'Your one-stop hub for essential barangay services and information. Stay updated with announcements, request forms, and connect with your local community.'
    },
    address: {
      type: String,
      default: 'Los Baños, Laguna, Philippines'
    },
    phone: {
      type: String,
      default: '0926-935-6540'
    },
    email: {
      type: String,
      default: 'barangaymaahas2@gmail.com'
    }
  },
  
  // Last updated info
  lastUpdatedBy: {
    type: String
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

const HomepageContent = mongoose.model('HomepageContent', homepageContentSchema);

// Create default homepage content if none exists
HomepageContent.createDefaultIfNone = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultEmergencyHotlines = [
      { name: 'LB Bureau of Fire Protection', numbers: ['123-4567'] },
      { name: 'LB MDRRMO', numbers: ['234-5678'] },
      { name: 'LB Municipal Action Center', numbers: ['345-6789'] },
      { name: 'UPLB University Health Service', numbers: ['456-7890'] },
      { name: 'UPLB University Police Force', numbers: ['567-8901'] },
      { name: 'Los Banos Doctors Hospital', numbers: ['678-9012'] },
      { name: 'Los Banos PNP', numbers: ['789-0123'] },
      { name: 'Brgy. Maahas', numbers: ['890-1234'] },
      { name: 'LARC', numbers: ['901-2345'] }
    ];
    
    const defaultOfficials = [
      { name: 'Juan Dela Cruz', position: 'Barangay Captain' },
      { name: 'Maria Santos', position: 'Barangay Secretary' },
      { name: 'Pedro Reyes', position: 'Barangay Treasurer' },
      { name: 'Ana Gonzales', position: 'Barangay Kagawad' },
      { name: 'Roberto Lim', position: 'Barangay Kagawad' },
      { name: 'Elena Magtanggol', position: 'Barangay Kagawad' },
      { name: 'Ricardo Castro', position: 'Barangay Kagawad' }
    ];
    
    const defaultContent = new this({
      emergencyHotlines: defaultEmergencyHotlines,
      officials: defaultOfficials,
      lastUpdatedBy: 'System',
      lastUpdatedAt: new Date()
    });
    
    await defaultContent.save();
    console.log('Created default homepage content');
    return defaultContent;
  }
  
  return null;
};

export default HomepageContent;