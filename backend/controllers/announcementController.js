import Announcement from '../models/Announcement.js';
import UserLog from '../models/UserLog.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to log admin actions
const logAdminAction = async (adminName, action, details, entityId = null, entityType = 'Announcement') => {
  try {
    // Check if entityId is a MongoDB ObjectId or a service ID string
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(entityId);
    
    const newLog = new UserLog({
      adminName,
      action,
      details,
      timestamp: new Date(),
      entityType, // Add the entity type parameter
      // Set the appropriate ID field based on the ID format
      ...(isMongoId ? { mongoId: entityId, entityType } : { entityId: entityId || 'N/A' })
    });
    await newLog.save();
  } catch (error) {
    console.error('Error creating log entry:', error);
  }
};

// Create a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { content, postedBy, title, type } = req.body;
    const uploadedFiles = [];
    
    // Handle file uploads if files exist in request
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype.split('/')[0]; // image, video, application, etc.
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Save file to server
        fs.writeFileSync(filePath, file.buffer);
        
        // Store file info based on type
        uploadedFiles.push({
          name: fileName,
          originalName: file.originalname,
          path: `/uploads/${fileName}`,
          type: fileType,
          size: file.size
        });
      }
    }
    
    // Separate files by type
    const images = uploadedFiles.filter(file => file.type === 'image').map(file => file.path);
    const videos = uploadedFiles.filter(file => file.type === 'video').map(file => file.path);
    const files = uploadedFiles.filter(file => 
      file.type !== 'image' && file.type !== 'video').map(file => ({
        name: file.originalName,
        path: file.path
      }));
    
    const links = req.body.links ? JSON.parse(req.body.links) : [];
    
    const newAnnouncement = new Announcement({
      title: title || 'Brgy Maahas Update',
      content,
      postedBy,
      images,
      videos,
      files,
      links,
      postedAt: new Date(),
      type: type || 'General'
    });
    
    await newAnnouncement.save();
    
    // Log the action
    const fileInfo = uploadedFiles.length > 0 
      ? ` with ${images.length} image(s), ${videos.length} video(s), and ${files.length} file(s)` 
      : '';
    await logAdminAction(
      postedBy, 
      'CREATE_ANNOUNCEMENT', 
      `Created announcement "${title || 'Brgy Maahas Update'}: ${content.substring(0, 30)}..."${fileInfo}`,
      newAnnouncement._id,
      'Announcement' // Add the entity type here
    );
    
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
};

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const adminName = req.body.adminName || req.query.adminName;
    
    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required for logging' });
    }
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Delete associated files
    const allFiles = [...announcement.images, ...announcement.videos];
    announcement.files.forEach(file => allFiles.push(file.path));
    
    for (const filePath of allFiles) {
      const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    
    // Log the action
    await logAdminAction(
      adminName, 
      'DELETE_ANNOUNCEMENT', 
      `Deleted announcement "${announcement.title}: ${announcement.content.substring(0, 30)}..."`,
      id,
      'Announcement' // Add the entity type here
    );
    
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
};

// Update an announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, keepImages, keepVideos, keepFiles, links, postedBy, title, type } = req.body;
    
    if (!postedBy) {
      return res.status(400).json({ message: 'Admin name (postedBy) is required for logging' });
    }
    
    // Find the current announcement
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Prepare arrays for keeping existing files
    const imagesToKeep = keepImages ? JSON.parse(keepImages) : [];
    const videosToKeep = keepVideos ? JSON.parse(keepVideos) : [];
    const filesToKeep = keepFiles ? JSON.parse(keepFiles) : [];
    
    // Remove files that are not in the "keep" lists
    const imagesToRemove = announcement.images.filter(img => !imagesToKeep.includes(img));
    const videosToRemove = announcement.videos.filter(vid => !videosToKeep.includes(vid));
    const filesToRemove = announcement.files.filter(file => 
      !filesToKeep.some(keep => keep.path === file.path));
    
    // Delete removed files from the server
    const allFilesToRemove = [...imagesToRemove, ...videosToRemove];
    filesToRemove.forEach(file => allFilesToRemove.push(file.path));
    
    for (const filePath of allFilesToRemove) {
      const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    // Handle new file uploads
    const uploadedFiles = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype.split('/')[0]; // image, video, application, etc.
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Save file to server
        fs.writeFileSync(filePath, file.buffer);
        
        // Store file info based on type
        uploadedFiles.push({
          name: fileName,
          originalName: file.originalname,
          path: `/uploads/${fileName}`,
          type: fileType,
          size: file.size
        });
      }
    }
    
    // Add new files to kept files
    const newImages = uploadedFiles.filter(file => file.type === 'image').map(file => file.path);
    const newVideos = uploadedFiles.filter(file => file.type === 'video').map(file => file.path);
    const newFiles = uploadedFiles.filter(file => 
      file.type !== 'image' && file.type !== 'video').map(file => ({
        name: file.originalName,
        path: file.path
      }));
    
    const parsedLinks = links ? JSON.parse(links) : announcement.links;
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      {
        title: title || announcement.title,
        content,
        images: [...imagesToKeep, ...newImages],
        videos: [...videosToKeep, ...newVideos],
        files: [...filesToKeep, ...newFiles],
        links: parsedLinks,
        editedAt: new Date(),
        type: type || announcement.type
      },
      { new: true }
    );
    
    // Log the action
    const fileInfo = `now has ${updatedAnnouncement.images.length} image(s), ${updatedAnnouncement.videos.length} video(s), and ${updatedAnnouncement.files.length} file(s)`;
    await logAdminAction(
      postedBy, 
      'UPDATE_ANNOUNCEMENT', 
      `Updated announcement "${updatedAnnouncement.title}: ${content.substring(0, 30)}..." - ${fileInfo}`,
      id,
      'Announcement' // Add the entity type here
    );
  
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
};