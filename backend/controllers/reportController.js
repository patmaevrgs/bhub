import Report from '../models/Report.js';
import Transaction from '../models/Transaction.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createAdminLog = async (adminName, action, details, entityId) => {
  try {
    const response = await fetch('http://localhost:3002/logs', {
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

    const uploadedFiles = [];
    
    // Handle file uploads if files exist in request
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype.split('/')[0]; // image, video, application, etc.
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Save file to server
        fs.writeFileSync(filePath, file.buffer);
        
        // Store file info
        uploadedFiles.push({
          name: fileName,
          originalName: file.originalname,
          path: `/uploads/reports/${fileName}`,
          type: fileType,
          size: file.size
        });
      }
    }
    
    // Separate files by type
    const mediaUrls = uploadedFiles.map(file => file.path);
    
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
    
    // Clean up uploaded files if report creation fails
    if (req.files) {
      req.files.forEach(file => {
        try {
          // Remove the uploaded file
          const filePath = path.join(uploadsDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('Error removing uploaded file:', unlinkError);
        }
      });
    }
    
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