import Transaction from '../models/Transaction.js';
import AmbulanceBooking from '../models/AmbulanceBooking.js';
import mongoose from 'mongoose';

// Create a transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      userId,
      serviceType,
      status,
      amount,
      details,
      referenceId,
      adminComment
    } = req.body;
    
    const newTransaction = new Transaction({
      userId,
      serviceType,
      status: status || 'pending',
      amount: amount || 0,
      details: details || {},
      referenceId,
      adminComment: adminComment || ''
    });
    
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// Get all transactions with optional filtering
export const getTransactions = async (req, res) => {
  try {
    const { userId, serviceType, status, startDate, endDate } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // User filter
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    
    // Service type filter
    if (serviceType) filter.serviceType = serviceType;
    
    // Status filter
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Fetch transactions with applied filters
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get a transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // If it's an ambulance booking, fetch the related booking
    if (transaction.serviceType === 'ambulance_booking' && transaction.referenceId) {
      const booking = await AmbulanceBooking.findById(transaction.referenceId);
      transaction._doc.referenceDetails = booking;
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

// Update a transaction's status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    
    // Get admin ID from authenticated user
    const adminId = req.userId;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'completed', 'cancelled', 'needs_approval'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find the transaction
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update fields
    if (status) transaction.status = status;
    if (adminComment !== undefined) transaction.adminComment = adminComment;
    
    // Set processed by admin
    transaction.processedBy = adminId;
    transaction.updatedAt = Date.now();
    
    await transaction.save();
    
    // If it's an ambulance booking, update the related booking
    if (transaction.serviceType === 'ambulance_booking' && transaction.referenceId) {
      const booking = await AmbulanceBooking.findById(transaction.referenceId);
      
      if (booking) {
        let bookingStatus = status;

        if (status==='approved'){
          bookingStatus = 'booked';
        }

        booking.status = bookingStatus;
        
        if (adminComment !== undefined) booking.adminComment = adminComment;
        booking.processedBy = adminId;
        await booking.save();
      }
    }
    
    const updatedTransaction = await Transaction.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

// Create a transaction from an ambulance booking
// Create a transaction from an ambulance booking
export const createTransactionFromBooking = async (bookingId) => {
  try {
    const booking = await AmbulanceBooking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Ambulance booking not found');
    }
    
    // Map ambulance booking status to transaction status
    let transactionStatus;
    switch(booking.status) {
      case 'booked':
        transactionStatus = 'approved'; // Map 'booked' in ambulance to 'approved' in transactions
        break;
      case 'pending':
        transactionStatus = 'pending';
        break;
      case 'cancelled':
        transactionStatus = 'cancelled';
        break;
      case 'completed':
        transactionStatus = 'completed';
        break;
      case 'needs_approval':
        transactionStatus = 'needs_approval';
        break;
      default:
        transactionStatus = booking.status;
    }
    
    // Check if a transaction already exists for this booking
    const existingTransaction = await Transaction.findOne({
      serviceType: 'ambulance_booking',
      referenceId: bookingId
    });
    
    if (existingTransaction) {
      // Update existing transaction with current booking information
      existingTransaction.status = transactionStatus;
      existingTransaction.details = {
        patientName: booking.patientName,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        destination: booking.destination,
        dieselCost: booking.dieselCost
      };
      existingTransaction.adminComment = booking.adminComment;
      
      // Make sure processedBy is updated
      if (booking.processedBy) {
        existingTransaction.processedBy = booking.processedBy;
      }
      
      existingTransaction.updatedAt = Date.now();
      await existingTransaction.save();
      console.log('Updated existing transaction for booking:', bookingId, 'New status:', transactionStatus);
      return existingTransaction;
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      userId: booking.bookedBy,
      serviceType: 'ambulance_booking',
      status: transactionStatus,
      amount: 0, // Free service
      details: {
        patientName: booking.patientName,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        destination: booking.destination,
        dieselCost: booking.dieselCost
      },
      referenceId: bookingId,
      adminComment: booking.adminComment,
      processedBy: booking.processedBy
    });
    
    await newTransaction.save();
    console.log('Created new transaction for booking:', bookingId, 'Status:', transactionStatus);
    return newTransaction;
  } catch (error) {
    console.error('Error creating/updating transaction from booking:', error);
    throw error;
  }
};