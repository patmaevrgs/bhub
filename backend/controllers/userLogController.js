import UserLog from '../models/UserLog.js';

// Create a new log entry
export const createLog = async (req, res) => {
  try {
    const { adminName, action, details, entityId, entityType } = req.body;
    
    const newLog = new UserLog({
      adminName,
      action,
      details,
      timestamp: new Date(),
      entityId,
      entityType: entityType || 'Other'
    });
    
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Error creating log entry', error: error.message });
  }
};

// Get all logs 
export const getLogs = async (req, res) => {
  try {
    const { startDate, endDate, adminName, action, entityType, serviceId } = req.query;
    
    const filter = {};
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Admin name filter
    if (adminName) filter.adminName = adminName;
    
    // Action type filter
    if (action) filter.action = action;
    
    // Entity type filter
    if (entityType) filter.entityType = entityType;
    
    // Service ID filter (search in details field using regex)
    if (serviceId) {
      filter.details = { 
        $regex: serviceId, 
        $options: 'i'  
      };
    }

    // Fetch logs with applied filters, sort by newest first
    const logs = await UserLog.find(filter).sort({ timestamp: -1 });
    
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

// Delete logs older than a certain date (for maintenance)
export const deleteOldLogs = async (req, res) => {
  try {
    const { olderThan } = req.body; // Date string
    
    if (!olderThan) {
      return res.status(400).json({ message: 'Missing olderThan date parameter' });
    }
    
    const cutoffDate = new Date(olderThan);
    const result = await UserLog.deleteMany({ timestamp: { $lt: cutoffDate } });
    
    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} logs older than ${cutoffDate.toISOString()}` 
    });
  } catch (error) {
    console.error('Error deleting old logs:', error);
    res.status(500).json({ message: 'Error deleting old logs', error: error.message });
  }
};