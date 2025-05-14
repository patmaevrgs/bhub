import ProjectProposal from '../models/ProjectProposal.js';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Transaction from '../models/Transaction.js';
import UserLog from '../models/UserLog.js';

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
        entityType: 'ProjectProposal'
      })
    });
    
    if (!response.ok) {
      console.error('Failed to create admin log:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating admin log:', error);
  }
};

// Create a new project proposal
export const createProposal = async (req, res) => {
  try {
    // Check if there are files uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded' });
    }

    const {
      fullName,
      contactNumber,
      email,
      projectTitle,
      description
    } = req.body;

    // Validate required fields
    if (!fullName || !contactNumber || !email || !projectTitle || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Get the authenticated user ID from the request
    const userId = req.userId || req.body.userId;
    
    // Check if user ID is available
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required. Please ensure you are logged in.' 
      });
    }

    // Process the uploaded file
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    
    // Check file extension (allow only PDF and DOCX)
    if (!['.pdf', '.docx'].includes(fileExt.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file format. Only PDF and DOCX files are allowed.' 
      });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/proposals');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save the file
    fs.writeFileSync(filePath, file.buffer);

    // Create new project proposal
    const newProposal = new ProjectProposal({
      userId,
      fullName,
      contactNumber,
      email,
      projectTitle,
      description,
      documentPath: `/uploads/proposals/${uniqueFilename}`,
      documentFilename: file.originalname,
      status: 'pending'
    });

    await newProposal.save();

    // Create a transaction record for this proposal
    try {
      const transactionData = {
        userId,
        serviceType: 'project_proposal',
        status: 'pending',
        amount: 0,
        details: {
          projectTitle,
          description: description && description.length > 100 
            ? description.substring(0, 100) + '...' 
            : description,
          proposalId: newProposal._id,
          proposalStatus: 'pending' // Store the original proposal status
        },
        referenceId: newProposal._id
      };
      
      // Create transaction via API call instead of direct function import
      const transactionResponse = await fetch('http://localhost:3002/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!transactionResponse.ok) {
        console.warn('Failed to create transaction for proposal, but proposal was saved');
      }
    } catch (transactionError) {
      console.warn('Error creating transaction for proposal:', transactionError);
      // Continue even if transaction creation fails
    }

    return res.status(201).json({
      success: true,
      message: 'Project proposal submitted successfully',
      proposal: newProposal
    });
  } catch (error) {
    console.error('Error creating project proposal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error submitting project proposal', 
      error: error.message 
    });
  }
};

// Get all proposals with optional filtering
export const getProposals = async (req, res) => {
  try {
    const { userId, status, startDate, endDate } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // User filter (for resident view)
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    
    // Status filter
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Fetch proposals with applied filters
    const proposals = await ProjectProposal.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    return res.status(200).json({
      success: true,
      proposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching proposals', 
      error: error.message 
    });
  }
};

// Get a proposal by ID
export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proposal = await ProjectProposal.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project proposal not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching proposal', 
      error: error.message 
    });
  }
};

// Update a proposal's status
export const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment, adminName } = req.body;
    
    // Get admin ID from authenticated user
    const adminId = req.userId;
    
    // Validate status
    const validStatuses = ['pending', 'in_review', 'considered', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    // Find the proposal
    const proposal = await ProjectProposal.findById(id);

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project proposal not found' 
      });
    }
    
    const previousStatus = proposal.status;

    // Update fields
    if (status) proposal.status = status;
    if (adminComment !== undefined) proposal.adminComment = adminComment;
    
    // Set processed by admin
    proposal.processedBy = adminId;
    proposal.updatedAt = Date.now();
    
    await proposal.save();

    // Create admin log for the status update
    try {
      const logAction = 'UPDATE_PROPOSAL_STATUS';
      const logDetails = `Updated project proposal "${proposal.projectTitle}" (Service ID: ${proposal.serviceId}) status from ${previousStatus} to ${status}`;
      
      if (adminName) {
        await createAdminLog(adminName, logAction, logDetails, proposal.serviceId);
      }
    } catch (logError) {
      console.warn('Error creating log for proposal update:', logError);
      // Continue even if logging fails
    }
    
    // Also update the related transaction
    // Find and update the related transaction 
try {
    const transaction = await Transaction.findOne({ 
      referenceId: proposal._id,
      serviceType: 'project_proposal'
    });
    
    if (transaction) {
      // Map proposal status to transaction status while preserving original names
      let transactionStatus;
      switch(status) {
        case 'in_review':
          transactionStatus = 'pending'; 
          break;
        case 'considered':
          transactionStatus = 'approved'; 
          break;
        case 'approved':
          transactionStatus = 'completed'; 
          break;
        case 'rejected':
          transactionStatus = 'cancelled'; 
          break;
        default:
          transactionStatus = status; 
      }
      
      // Update transaction
      transaction.status = transactionStatus;
      transaction.adminComment = adminComment;
      transaction.details = {
        ...transaction.details,
        proposalStatus: status,
        projectTitle: proposal.projectTitle,
        description: proposal.description && proposal.description.length > 100 
          ? proposal.description.substring(0, 100) + '...' 
          : proposal.description
      };
      
      await transaction.save();
    }
  } catch (transactionError) {
    console.error('Error updating related transaction:', transactionError);
    // Continue even if transaction update fails
  }
    
    const updatedProposal = await ProjectProposal.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    return res.status(200).json({
      success: true,
      message: 'Project proposal status updated successfully',
      proposal: updatedProposal
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error updating proposal status', 
      error: error.message 
    });
  }
};

// Cancel a proposal (resident)
export const cancelProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, cancellationReason } = req.body;
    
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Find the proposal
    const proposal = await ProjectProposal.findById(id);
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project proposal not found' 
      });
    }
    
    // Verify that the user owns this proposal
    if (proposal.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to cancel this proposal' 
      });
    }
    
    // Check if the proposal is already approved or rejected
    if (['approved', 'rejected'].includes(proposal.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `This proposal cannot be cancelled because it is already ${proposal.status}` 
      });
    }
    
    // Update proposal status to rejected (cancelled by resident)
    proposal.status = 'rejected';
    proposal.adminComment = cancellationReason 
      ? `Cancelled by resident. Reason: ${cancellationReason}`
      : 'Cancelled by resident';
    proposal.updatedAt = Date.now();
    
    await proposal.save();
    
    // Also update the related transaction
    try {
      const transactionResponse = await fetch(`http://localhost:3002/transactions?referenceId=${id}`);
      const transactions = await transactionResponse.json();
      
      if (transactions && transactions.length > 0) {
        const transaction = transactions[0];
        
        await fetch(`http://localhost:3002/transactions/${transaction._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'cancelled',
            adminComment: proposal.adminComment,
            details: {
              ...transaction.details,
              proposalStatus: 'rejected' // Store the original proposal status
            }
          }),
        });
      }
    } catch (transactionError) {
      console.error('Error updating related transaction:', transactionError);
      // Continue even if transaction update fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'Project proposal cancelled successfully',
      proposal
    });
  } catch (error) {
    console.error('Error cancelling proposal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error cancelling proposal', 
      error: error.message 
    });
  }
};

// Delete a proposal (admin only)
export const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName } = req.body;

    const proposal = await ProjectProposal.findById(id);
    
    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project proposal not found' 
      });
    }
    
    // Delete the associated file
    if (proposal.documentPath) {
      const filePath = path.join(__dirname, '..', proposal.documentPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Create admin log for the deletion
    try {
      const logAction = 'DELETE_PROPOSAL';
      const logDetails = `Deleted project proposal "${proposal.projectTitle}" (Service ID: ${proposal.serviceId})`;
      
      if (adminName) {
        await createAdminLog(adminName, logAction, logDetails, proposal.serviceId);
      }
    } catch (logError) {
      console.warn('Error creating log for proposal deletion:', logError);
      // Continue even if logging fails
    }

    await ProjectProposal.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Project proposal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error deleting proposal', 
      error: error.message 
    });
  }
};