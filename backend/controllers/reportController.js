import Report from '../models/Report.js';
import Transaction from '../models/Transaction.js';
import { uploadFile, deleteFile } from '../supabaseUpload.js';
const API_URL = process.env.API_URL || 'http://localhost:3002';

const createAdminLog = async (adminName, action, details, entityId) => {
  try {
    const response = await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminName,
        action,
        details,
        entityId,
        entityType: 'Report'
      })
    });
    
    if (!response.ok) {
      console.error('Failed to create admin log:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating admin log:', error);
  }
};

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { 
      fullName, 
      contactNumber, 
      location, 
      nearestLandmark, 
      issueType, 
      dateObserved, 
      description, 
      additionalComments 
    } = req.body;

    // Get user ID from request body or token
    const userId = req.body.userId || req.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

    const mediaUrls = [];
    
    // Handle file uploads if files exist in request
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Supabase
        const publicUrl = await uploadFile(
          'reports',
          file.originalname,
          file.buffer,
          file.mimetype
        );
        
        // Add to media URLs array
        mediaUrls.push(publicUrl);
      }
    }
    
    // Create the report
    const report = new Report({
      userId,
      fullName,
      contactNumber,
      location,
      nearestLandmark,
      issueType,
      dateObserved,
      description,
      additionalComments: additionalComments || '',
      mediaUrls: mediaUrls
    });
    
    const savedReport = await report.save();

    // Create a transaction for the report
    const transaction = new Transaction({
      userId,
      serviceType: 'infrastructure_report',
      status: 'pending', // This is correct - lowercase matches Transaction model
      details: {
        reportId: savedReport._id,
        issueType: savedReport.issueType,
        location: savedReport.location,
        description: savedReport.description
      },
      referenceId: savedReport._id // This was missing - add the reportId as referenceId
    });
    
    await transaction.save();

    res.status(201).json({ 
      success: true, 
      report: savedReport,
      transaction: transaction,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.toString() 
    });
  }
};

// Get all reports (for admin)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports by user ID (for residents)
export const getUserReports = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Fetch reports for the specified user
    const reports = await Report.find({ 
      userId: userId 
    }).sort({ 
      createdAt: -1 
    });

    res.status(200).json({ 
      success: true, 
      reports 
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reports',error: error.message 
    });
  }
};

// Update report status (for admin)
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminComments, adminName } = req.body;
    
    // Find the report first to get previous status for logging
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    const previousStatus = report.status;
    
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { 
        status, 
        adminComments, 
        updatedAt: Date.now() 
      },
      { new: true }
    );
    
    // Map Report status (PascalCase) to Transaction status (lowercase)
    let transactionStatus;
    switch(status) {
      case 'Pending':
        transactionStatus = 'pending';
        break;
      case 'In Progress':
        transactionStatus = 'approved'; // Map 'In Progress' to 'approved'
        break;
      case 'Resolved':
        transactionStatus = 'completed'; // Map 'Resolved' to 'completed'
        break;
      case 'Cancelled':
        transactionStatus = 'cancelled'; // This mapping is straightforward
        break;
      default:
        transactionStatus = 'pending';
    }
    
    // Update the associated transaction
    await Transaction.findOneAndUpdate(
      { 
        serviceType: 'infrastructure_report',
        referenceId: reportId 
      },
      {
        status: transactionStatus,
        adminComment: adminComments || '',
        updatedAt: Date.now()
      }
    );
    
    // Create admin log for the status update
    if (adminName) {
      const logAction = 'UPDATE_REPORT_STATUS';
      const logDetails = `Updated infrastructure report status from ${previousStatus} to ${status}. Report Type: ${report.issueType}, Location: ${report.location} (Service ID: ${report.serviceId || reportId})`;
      
      // Using axios would be more appropriate, but we'll create a direct call to your API
      await createAdminLog(adminName, logAction, logDetails, report.serviceId || reportId);
    }
    
    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add resident feedback (for residents)
export const addResidentFeedback = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { satisfied, comments } = req.body;
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    report.residentFeedback = { satisfied, comments };
    report.updatedAt = Date.now();
    
    const updatedReport = await report.save();
    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId, adminName } = req.body;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Only allow cancellation of pending reports
    if (report.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: "Only pending reports can be cancelled" 
      });
    }

    // Update report status to cancelled
    report.status = 'Cancelled';
    report.updatedAt = Date.now();

    const updatedReport = await report.save();

    // Update the associated transaction status to 'cancelled'
    await Transaction.findOneAndUpdate(
      { 
        serviceType: 'infrastructure_report', 
        referenceId: reportId 
      }, 
      { 
        status: 'cancelled',
        updatedAt: Date.now()
      }
    );

    // Create admin log if this was cancelled by admin
    if (adminName) {
      const logAction = 'CANCEL_REPORT';
      const logDetails = `Cancelled infrastructure report. Report Type: ${report.issueType}, Location: ${report.location} (Service ID: ${report.serviceId || reportId})`;
      
      await createAdminLog(adminName, logAction, logDetails, report.serviceId || reportId);
    }

    res.status(200).json({ 
      success: true, 
      report: updatedReport,
      message: 'Report cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling report:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.toString() 
    });
  }
};


export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};