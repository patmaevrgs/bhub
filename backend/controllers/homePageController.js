import HomepageContent from '../models/HomepageContent.js';
import UserLog from '../models/UserLog.js';
import { uploadFile, deleteFile } from '../supabaseUpload.js';

// Helper function to log admin actions
const logAdminAction = async (adminName, action, details, entityId = null, entityType = 'Other') => {
    try {
      // Check if entityType is valid
      const validEntityTypes = ['Announcement', 'Report', 'ProjectProposal', 'DocumentRequest', 
        'AmbulanceBooking', 'CourtReservation', 'HomepageContent', 'Other'];
      
      // Default to 'Other' if not valid
      if (!validEntityTypes.includes(entityType)) {
        console.warn(`Invalid entityType '${entityType}', defaulting to 'Other'`);
        entityType = 'Other';
      }
      
      // Check if entityId is a MongoDB ObjectId or a service ID string
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(entityId);
      
      const newLog = new UserLog({
        adminName,
        action,
        details,
        timestamp: new Date(),
        entityType,
        // Set the appropriate ID field based on the ID format
        ...(isMongoId ? { mongoId: entityId } : { entityId: entityId || 'N/A' })
      });
      
      await newLog.save();
      return true;
    } catch (error) {
      console.warn('Error creating log entry:', error);
      return false; // Return false instead of throwing, so we don't break the main operation
    }
  };

// Get homepage content
export const getHomepageContent = async (req, res) => {
  try {
    // Find the single homepage content document or create default if none exists
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ message: 'Error fetching homepage content', error: error.message });
  }
};

// Update welcome section
export const updateWelcomeSection = async (req, res) => {
  try {
    const { welcomeTitle, welcomeText, adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    homepageContent.welcomeTitle = welcomeTitle;
    homepageContent.welcomeText = welcomeText;
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'UPDATE_HOMEPAGE_WELCOME',
      `Updated homepage welcome section`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error updating welcome section:', error);
    res.status(500).json({ message: 'Error updating welcome section', error: error.message });
  }
};

// Update about section
export const updateAboutSection = async (req, res) => {
  try {
    const { aboutText, adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    homepageContent.aboutText = aboutText;
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'UPDATE_HOMEPAGE_ABOUT',
      `Updated homepage about section`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({ message: 'Error updating about section', error: error.message });
  }
};

// Update summary data
export const updateSummaryData = async (req, res) => {
  try {
    const { summaryData, adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    homepageContent.summaryData = summaryData;
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'UPDATE_HOMEPAGE_SUMMARY',
      `Updated homepage summary data`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error updating summary data:', error);
    res.status(500).json({ message: 'Error updating summary data', error: error.message });
  }
};

// Update emergency hotlines
export const updateEmergencyHotlines = async (req, res) => {
    try {
      const { emergencyHotlines, adminName } = req.body;
      
      if (!adminName) {
        return res.status(400).json({ message: 'Admin name is required for logging' });
      }
      
      // Log received data for debugging
      console.log("Received hotlines data:", JSON.stringify(emergencyHotlines));
      
      // Check if hotlines is valid
      if (!Array.isArray(emergencyHotlines)) {
        return res.status(400).json({ message: 'Emergency hotlines must be an array' });
      }
      
      let homepageContent = await HomepageContent.findOne();
      
      if (!homepageContent) {
        homepageContent = await HomepageContent.createDefaultIfNone();
      }
      
      // Make sure we're replacing the entire array, not trying to merge
      homepageContent.emergencyHotlines = [...emergencyHotlines];
      homepageContent.lastUpdatedBy = adminName;
      homepageContent.lastUpdatedAt = new Date();
      
      // Save changes
      await homepageContent.save();
      
      // Verify data was saved by retrieving it again
      const updatedContent = await HomepageContent.findOne();
      console.log("Saved hotlines count:", updatedContent.emergencyHotlines.length);
      
      try {
        // Try to log the action
        await logAdminAction(
          adminName,
          'UPDATE_HOMEPAGE_HOTLINES',
          `Updated emergency hotlines (${emergencyHotlines.length} hotlines)`,
          homepageContent._id,
          'Other' // Use 'Other' instead of 'HomepageContent'
        );
      } catch (logError) {
        console.warn('Error creating log entry:', logError);
        // Don't fail if logging fails
      }
      
      res.status(200).json(updatedContent);
    } catch (error) {
      console.error('Error updating emergency hotlines:', error.stack);
      res.status(500).json({ message: 'Error updating emergency hotlines', error: error.message });
    }
  };

// Update map coordinates
export const updateMapCoordinates = async (req, res) => {
  try {
    const { mapCoordinates, adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    homepageContent.mapCoordinates = mapCoordinates;
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'UPDATE_HOMEPAGE_MAP',
      `Updated map coordinates`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error updating map coordinates:', error);
    res.status(500).json({ message: 'Error updating map coordinates', error: error.message });
  }
};

// Update officials
export const updateOfficials = async (req, res) => {
    try {
      const { officials, adminName } = req.body;
      
      if (!adminName) {
        return res.status(400).json({ message: 'Admin name is required for logging' });
      }
      
      // Log received data for debugging
      console.log("Received officials data:", JSON.stringify(officials));
      
      // Check if officials is valid
      if (!Array.isArray(officials)) {
        return res.status(400).json({ message: 'Officials must be an array' });
      }
      
      let homepageContent = await HomepageContent.findOne();
      
      if (!homepageContent) {
        homepageContent = await HomepageContent.createDefaultIfNone();
      }
      
      // Important: Make sure we're replacing the entire array, not trying to merge
      homepageContent.officials = [...officials];
      homepageContent.lastUpdatedBy = adminName;
      homepageContent.lastUpdatedAt = new Date();
      
      // Save and verify changes
      await homepageContent.save();
      
      // Verify data was saved by retrieving it again
      const updatedContent = await HomepageContent.findOne();
      console.log("Saved officials count:", updatedContent.officials.length);
      
      try {
        // Try to log the action
        await logAdminAction(
          adminName,
          'UPDATE_HOMEPAGE_OFFICIALS',
          `Updated barangay officials (${officials.length} officials)`,
          homepageContent._id,
          'Other' // Use 'Other' instead of 'HomepageContent'
        );
      } catch (logError) {
        console.warn('Error creating log entry:', logError);
      }
      
      res.status(200).json(updatedContent);
    } catch (error) {
      console.error('Error updating officials:', error.stack);
      res.status(500).json({ message: 'Error updating officials', error: error.message });
    }
  };

// Upload carousel images
export const uploadCarouselImages = async (req, res) => {
  try {
    const { adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    const uploadedImages = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Supabase
        const publicUrl = await uploadFile(
          'homepage',
          file.originalname,
          file.buffer,
          file.mimetype
        );
        
        // Add to carousel images array
        uploadedImages.push({
          name: file.originalname,
          path: publicUrl,
          caption: req.body.captions ? JSON.parse(req.body.captions)[uploadedImages.length] || '' : ''
        });
      }
    }
    
    // Update or replace carousel images based on action
    if (req.body.action === 'replace') {
      // Delete old images first
      for (const image of homepageContent.carouselImages) {
        // Only delete from Supabase if the path contains supabase.co
        if (image.path.includes('supabase.co')) {
          await deleteFile('homepage', image.path);
        }
      }
      
      homepageContent.carouselImages = uploadedImages;
    } else {
      // Append new images
      homepageContent.carouselImages = [...homepageContent.carouselImages, ...uploadedImages];
    }
    
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'UPDATE_HOMEPAGE_CAROUSEL',
      `${req.body.action === 'replace' ? 'Replaced' : 'Added'} carousel images`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error uploading carousel images:', error);
    res.status(500).json({ message: 'Error uploading carousel images', error: error.message });
  }
};

// Delete carousel image
export const deleteCarouselImage = async (req, res) => {
  try {
    const { imageId, adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      return res.status(404).json({ message: 'Homepage content not found' });
    }
    
    // Find the image to delete
    const imageToDelete = homepageContent.carouselImages.find(img => img._id.toString() === imageId);
    
    if (!imageToDelete) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete the file from Supabase
    if (imageToDelete.path.includes('supabase.co')) {
      await deleteFile('homepage', imageToDelete.path);
    }
    
    // Remove from array
    homepageContent.carouselImages = homepageContent.carouselImages.filter(
      img => img._id.toString() !== imageId
    );
    
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'DELETE_HOMEPAGE_CAROUSEL_IMAGE',
      `Deleted carousel image: ${imageToDelete.name}`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error deleting carousel image:', error);
    res.status(500).json({ message: 'Error deleting carousel image', error: error.message });
  }
};

export const uploadOfficialImage = async (req, res) => {
    try {
      console.log("Official image upload request received");
      
      if (!req.file) {
        console.log("No file received in request");
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      const { adminName } = req.body;
      console.log("Admin name:", adminName);
      
      if (!adminName) {
        return res.status(400).json({ message: 'Admin name is required for logging' });
      }
      
      // Upload to Supabase
      const publicUrl = await uploadFile(
        'homepage',
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype
      );
      
      console.log("Image saved, path:", publicUrl);
      
      // Try to log action, but don't fail if logging fails
      try {
        await logAdminAction(
          adminName,
          'UPLOAD_OFFICIAL_IMAGE',
          `Uploaded image for official: ${req.file.originalname}`,
          null,
          'Other' // Use 'Other' instead of 'HomepageContent' to avoid validation issues
        );
      } catch (logError) {
        console.warn('Error logging official image upload:', logError);
        // Continue anyway
      }
      
      res.status(200).json({ success: true, imagePath: publicUrl });
    } catch (error) {
      console.error('Error uploading official image:', error);
      res.status(500).json({ message: 'Error uploading official image', error: error.message });
    }
  };

// Update footer data (continued)
export const updateFooterData = async (req, res) => {
  try {
    const { footerData, adminName } = req.body;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    let homepageContent = await HomepageContent.findOne();
    
    if (!homepageContent) {
      homepageContent = await HomepageContent.createDefaultIfNone();
    }
    
    homepageContent.footerData = footerData;
    homepageContent.lastUpdatedBy = adminName;
    homepageContent.lastUpdatedAt = new Date();
    
    await homepageContent.save();
    
    await logAdminAction(
      adminName,
      'UPDATE_HOMEPAGE_FOOTER',
      `Updated footer information`,
      homepageContent._id
    );
    
    res.status(200).json(homepageContent);
  } catch (error) {
    console.error('Error updating footer data:', error);
    res.status(500).json({ message: 'Error updating footer data', error: error.message });
  }
};