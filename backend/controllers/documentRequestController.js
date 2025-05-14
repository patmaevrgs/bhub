import DocumentRequest from '../models/DocumentRequest.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';
import UserLog from '../models/UserLog.js';
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
        entityType: 'DocumentRequest'
      })
    });
    
    if (!response.ok) {
      console.error('Failed to create admin log:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating admin log:', error);
  }
};

// Create a document request
export const createDocumentRequest = async (req, res) => {
  try {
    const {
      userId,
      documentType,
      formData,
      purpose
    } = req.body;
    
    // Create new document request
    const newDocumentRequest = new DocumentRequest({
      userId,
      documentType,
      formData,
      purpose
    });
    
    await newDocumentRequest.save();
    
    // Create a transaction for this document request
    const newTransaction = new Transaction({
      userId,
      serviceType: 'document_request',
      status: 'pending',
      details: {
        documentType,
        purpose,
        serviceId: newDocumentRequest.serviceId
      },
      referenceId: newDocumentRequest._id
    });
    
    await newTransaction.save();
    
    res.status(201).json({
      success: true,
      documentRequest: newDocumentRequest,
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Error creating document request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating document request',
      error: error.message
    });
  }
};

// Get all document requests with optional filtering
export const getDocumentRequests = async (req, res) => {
  try {
    const { userId, documentType, status, startDate, endDate } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // User filter
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    
    // Document type filter
    if (documentType) filter.documentType = documentType;
    
    // Status filter
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Fetch document requests with applied filters
    const documentRequests = await DocumentRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      documentRequests
    });
  } catch (error) {
    console.error('Error fetching document requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document requests',
      error: error.message
    });
  }
};

// Get a document request by ID
export const getDocumentRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const documentRequest = await DocumentRequest.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      documentRequest
    });
  } catch (error) {
    console.error('Error fetching document request:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document request',
      error: error.message
    });
  }
};

// Update a document request's status
export const updateDocumentRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment, adminName } = req.body;
    
    // Get admin ID from authenticated user
    const adminId = req.userId;
    
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Find the document request
    const documentRequest = await DocumentRequest.findById(id);
    
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Document request not found'
      });
    }
    
    // Store the original status before updating
    const previousStatus = documentRequest.status;

    // Update fields
    documentRequest.status = status;
    if (adminComment !== undefined) documentRequest.adminComment = adminComment;
    
    // Set processed by admin
    documentRequest.processedBy = adminId;
    documentRequest.updatedAt = Date.now();
    
    await documentRequest.save();
    
    // Create admin log for the status update
    try {
      const logAction = 'UPDATE_DOCUMENT_REQUEST_STATUS';
      const logDetails = `Updated document request for ${documentRequest.documentType} (Service ID: ${documentRequest.serviceId}) status from ${previousStatus} to ${status}`;
      
      if (adminName) {
        await createAdminLog(adminName, logAction, logDetails, documentRequest.serviceId);
      }
    } catch (logError) {
      console.warn('Error creating log for document request update:', logError);
      // Continue even if logging fails
    }

    // Update the corresponding transaction
    const transaction = await Transaction.findOne({
      serviceType: 'document_request',
      referenceId: id
    });
    
    if (transaction) {
      // Map document request status to transaction status
      let transactionStatus;
      switch(status) {
        case 'in_progress':
          transactionStatus = 'approved';
          break;
        case 'completed':
          transactionStatus = 'completed';
          break;
        case 'rejected':
          transactionStatus = 'cancelled';
          break;
        default:
          transactionStatus = status;
      }
      
      transaction.status = transactionStatus;
      if (adminComment !== undefined) transaction.adminComment = adminComment;
      transaction.processedBy = adminId;
      transaction.updatedAt = Date.now();
      
      await transaction.save();
    }
    
    const updatedDocumentRequest = await DocumentRequest.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      documentRequest: updatedDocumentRequest
    });
  } catch (error) {
    console.error('Error updating document request:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document request',
      error: error.message
    });
  }
};

// Cancel a document request (for residents)
export const cancelDocumentRequest = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, cancellationReason } = req.body;
      
      // Find the document request
      const documentRequest = await DocumentRequest.findById(id);
      
      if (!documentRequest) {
        return res.status(404).json({
          success: false, 
          message: 'Document request not found'
        });
      }
      
      // Check if the request belongs to the user
      if (documentRequest.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to cancel this request'
        });
      }
      
      // Check if the request can be cancelled (only pending requests can be cancelled by residents)
      if (documentRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending requests can be cancelled'
        });
      }
      
      // Update status to cancelled with clear resident cancellation indicator
      documentRequest.status = 'cancelled';
      // Make it very clear this was cancelled by a resident
      documentRequest.adminComment = cancellationReason 
        ? `Cancelled by resident: ${cancellationReason}` 
        : 'Cancelled by resident';
      documentRequest.updatedAt = Date.now();
      
      await documentRequest.save();
      
      // Update the corresponding transaction
      const transaction = await Transaction.findOne({
        serviceType: 'document_request',
        referenceId: id
      });
      
      if (transaction) {
        transaction.status = 'cancelled';
        // Also make clear in the transaction that it was cancelled by resident
        transaction.adminComment = cancellationReason 
          ? `Cancelled by resident: ${cancellationReason}` 
          : 'Cancelled by resident';
        transaction.updatedAt = Date.now();
        
        await transaction.save();
      }
      
      res.status(200).json({
        success: true,
        message: 'Document request cancelled successfully',
        documentRequest
      });
    } catch (error) {
      console.error('Error cancelling document request:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling document request',
        error: error.message
      });
    }
  };

// Helper function to create a transaction from a document request
export const createTransactionFromDocumentRequest = async (documentRequestId) => {
  try {
    const documentRequest = await DocumentRequest.findById(documentRequestId);
    
    if (!documentRequest) {
      throw new Error('Document request not found');
    }
    
    // Map document request status to transaction status
    let transactionStatus;
    switch(documentRequest.status) {
      case 'in_progress':
        transactionStatus = 'approved';
        break;
      case 'completed':
        transactionStatus = 'completed';
        break;
      case 'rejected':
        transactionStatus = 'cancelled';
        break;
      default:
        transactionStatus = documentRequest.status;
    }
    
    // Check if a transaction already exists for this document request
    const existingTransaction = await Transaction.findOne({
      serviceType: 'document_request',
      referenceId: documentRequestId
    });
    
    if (existingTransaction) {
      // Update existing transaction with current document request information
      existingTransaction.status = transactionStatus;
      existingTransaction.details = {
        documentType: documentRequest.documentType,
        purpose: documentRequest.purpose,
        serviceId: documentRequest.serviceId
      };
      existingTransaction.adminComment = documentRequest.adminComment;
      
      // Make sure processedBy is updated
      if (documentRequest.processedBy) {
        existingTransaction.processedBy = documentRequest.processedBy;
      }
      
      existingTransaction.updatedAt = Date.now();
      await existingTransaction.save();
      return existingTransaction;
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      userId: documentRequest.userId,
      serviceType: 'document_request',
      status: transactionStatus,
      amount: 0, // Most barangay documents are free or minimal fee
      details: {
        documentType: documentRequest.documentType,
        purpose: documentRequest.purpose,
        serviceId: documentRequest.serviceId
      },
      referenceId: documentRequestId,
      adminComment: documentRequest.adminComment,
      processedBy: documentRequest.processedBy
    });
    
    await newTransaction.save();
    return newTransaction;
  } catch (error) {
    console.error('Error creating/updating transaction from document request:', error);
    throw error;
  }
};