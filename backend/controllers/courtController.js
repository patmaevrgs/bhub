import CourtReservation from '../models/CourtReservation.js';
import Transaction from '../models/Transaction.js';
import UserLog from '../models/UserLog.js';
import { format } from 'date-fns';
import mongoose from 'mongoose';

const createAdminLog = async (adminName, action, details, entityId, entityType = 'CourtReservation') => {
  try {
    const newLog = new UserLog({
      adminName,
      action,
      details,
      entityId,
      entityType
    });
    
    await newLog.save();
    return true;
  } catch (error) {
    console.error('Error creating admin log:', error);
    return false;
  }
};

// Helper functions for court logging
const getCourtLogActionType = (status) => {
  switch (status) {
    case 'approved': return 'COURT_RESERVATION_APPROVED';
    case 'rejected': return 'COURT_RESERVATION_REJECTED';
    case 'cancelled': return 'COURT_RESERVATION_CANCELLED';
    default: return 'COURT_RESERVATION_UPDATED';
  }
};

// Helper to get the correct verb based on status change
const getStatusActionVerb = (newStatus, oldStatus) => {
  switch (newStatus) {
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'cancelled': return 'Cancelled';
    default: return 'Updated';
  }
};

// Create a new court reservation
export const createCourtReservation = async (req, res) => {
  try {
    const {
      representativeName,
      reservationDate,
      startTime,
      duration,
      contactNumber,
      purpose,
      numberOfPeople,
      additionalNotes,
    } = req.body;
    
    // Get user ID from request body or token
    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check for booking conflicts
    const reservationDateObj = new Date(reservationDate);
    const hours = parseInt(startTime.split(':')[0]);
    const minutes = parseInt(startTime.split(':')[1]);
    const durationHours = parseFloat(duration);

    // Calculate start and end times in minutes for the new reservation
    const newStartMinutes = hours * 60 + minutes;
    const newEndMinutes = newStartMinutes + (durationHours * 60);

    // Find reservations on the same day with pending or approved status
    const conflictingReservations = await CourtReservation.find({
      reservationDate: { 
        $eq: new Date(reservationDateObj.toISOString().split('T')[0]) 
      },
      status: { $in: ['pending', 'approved'] }
    });

    // Check for time conflicts
    const hasConflict = conflictingReservations.some(existing => {
      const existingHours = parseInt(existing.startTime.split(':')[0]);
      const existingMinutes = parseInt(existing.startTime.split(':')[1]);
      const existingDuration = existing.duration;
      
      // Convert existing reservation times to minutes
      const existingStartMinutes = existingHours * 60 + existingMinutes;
      const existingEndMinutes = existingStartMinutes + (existingDuration * 60);
      
      // Check for overlap
      return (
        // New booking starts during existing booking
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        // New booking ends during existing booking
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        // New booking completely contains existing booking
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      );
    });

    if (hasConflict) {
      return res.status(409).json({ 
        success: false, 
        message: 'The requested time slot conflicts with an existing reservation' 
      });
    }
    
    // Create the new court reservation
    const newReservation = new CourtReservation({
      representativeName,
      bookedBy: userId,
      reservationDate: new Date(reservationDate),
      startTime,
      duration,
      contactNumber,
      purpose,
      numberOfPeople,
      additionalNotes: additionalNotes || ''
    });
    
    console.log('Creating new reservation:', newReservation);
    
    // Save the reservation
    const savedReservation = await newReservation.save();

    // Create transaction (optional, but recommended)
    const amount = calculateAmount(startTime, duration);
    const newTransaction = new Transaction({
      userId: userId,
      serviceType: 'court_reservation',
      status: 'pending',
      amount: amount,
      details: {
        representativeName,
        reservationDate,
        startTime,
        duration,
        purpose
      },
      referenceId: savedReservation._id
    });

    await newTransaction.save();
    
    // Send successful response
    res.status(201).json({
      success: true,
      reservation: savedReservation,
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Error creating court reservation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating court reservation', 
      error: error.message 
    });
  }
};

// Helper function to calculate amount (free in morning, 200 PHP/hour after 6PM)
const calculateAmount = (startTime, duration) => {
  const hour = parseInt(startTime.split(':')[0]);
  
  // Free in morning hours, 200 PHP/hour after 6 PM
  if (hour >= 18) {
    return 200 * duration;
  }
  
  return 0;
};

// Get all court reservations with optional filtering
export const getCourtReservations = async (req, res) => {
  try {
    const { userId, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    // User filter
    if (userId) filter.bookedBy = new mongoose.Types.ObjectId(userId);
    
    // Status filter
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.reservationDate = {};
      if (startDate) filter.reservationDate.$gte = new Date(startDate);
      if (endDate) filter.reservationDate.$lte = new Date(endDate);
    }
    
    // Fetch reservations with applied filters
    const reservations = await CourtReservation.find(filter)
      .sort({ reservationDate: 1, startTime: 1 })
      .populate('bookedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching court reservations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching court reservations', 
      error: error.message 
    });
  }
};

// Get a court reservation by ID
export const getCourtReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await CourtReservation.findById(id)
      .populate('bookedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Court reservation not found' 
      });
    }
    
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error fetching court reservation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching court reservation', 
      error: error.message 
    });
  }
};

// Update a court reservation's status (for admin use)
export const updateCourtReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment, adminId, adminName } = req.body;
    
    console.log('Incoming update request:', { 
      id, 
      status, 
      adminComment, 
      adminId, 
      reqUserId: req.userId 
    });
    
    // Get admin ID from authenticated user or request body
    const processedBy = req.userId || adminId;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'cancelled', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    // Additional validation for rejection
    if (status === 'rejected') {
      if (!adminComment || adminComment.trim().length < 3) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin comment is required and must be at least 3 characters long for rejection' 
        });
      }
    }
    
    // Find the court reservation
    const reservation = await CourtReservation.findById(id);
    
    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Court reservation not found' 
      });
    }
    
    // Additional checks to prevent status manipulation
    if (reservation.status === 'cancelled' || reservation.status === 'rejected') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot change status of a ${reservation.status} reservation` 
      });
    }
    
    const previousStatus = reservation.status;
    // Update fields
    if (status) reservation.status = status;
    if (adminComment !== undefined) {
      reservation.adminComment = adminComment;
    }
    
    // Set processed by admin
    if (processedBy) {
      reservation.processedBy = processedBy;
    }
    reservation.updatedAt = Date.now();
    
    // Save with detailed error handling
    try {
      await reservation.save();
      console.log('Reservation saved successfully');
    } catch (saveError) {
      console.error('Error saving reservation:', saveError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving reservation', 
        error: saveError.message 
      });
    }
    
    // Create admin log for the status update
    if (adminName) {
      const actionType = getCourtLogActionType(status);
      const formattedDate = format(new Date(reservation.reservationDate), 'MMM d, yyyy');
      const logDetails = `${getStatusActionVerb(status, previousStatus)} court reservation for ${reservation.representativeName} on ${formattedDate} (Service ID: ${reservation.serviceId || id})`;
      
      await createAdminLog(
        adminName,
        actionType,
        logDetails,
        reservation.serviceId || id,
        'CourtReservation'
      );
    }

    // Update corresponding transaction
    const transaction = await Transaction.findOne({
      serviceType: 'court_reservation',
      referenceId: id
    });
    
    if (transaction) {
      // Map court reservation status to transaction status
      let transactionStatus;
      if (status === 'rejected') {
        // Map 'rejected' to 'cancelled' in transaction
        transactionStatus = 'cancelled';
        console.log('Mapping rejected status to cancelled in transaction');
      } else {
        transactionStatus = status;
      }
      
      transaction.status = transactionStatus;
      if (adminComment !== undefined) transaction.adminComment = adminComment;
      if (processedBy) transaction.processedBy = processedBy;
      transaction.updatedAt = Date.now();
      
      try {
        await transaction.save();
        console.log('Transaction updated successfully with status:', transactionStatus);
      } catch (transactionSaveError) {
        console.error('Error saving transaction:', transactionSaveError);
        // Non-critical error, so we'll continue
      }
    } else {
      console.log('No transaction found for court reservation:', id);
      // Create a new transaction if none exists
      
      // Determine transaction status based on court reservation status
      let transactionStatus;
      if (status === 'rejected') {
        transactionStatus = 'cancelled';
      } else {
        transactionStatus = status;
      }
      
      const newTransaction = new Transaction({
        userId: reservation.bookedBy,
        serviceType: 'court_reservation',
        status: transactionStatus,
        amount: calculateAmount(reservation.startTime, reservation.duration),
        details: {
          representativeName: reservation.representativeName,
          reservationDate: reservation.reservationDate,
          startTime: reservation.startTime,
          duration: reservation.duration,
          purpose: reservation.purpose
        },
        referenceId: id,
        adminComment: adminComment,
        processedBy: processedBy
      });
      
      try {
        await newTransaction.save();
        console.log('New transaction created successfully with status:', transactionStatus);
      } catch (newTransactionError) {
        console.error('Error creating new transaction:', newTransactionError);
        // Non-critical error, so we'll continue
      }
    }
    
    const updatedReservation = await CourtReservation.findById(id)
      .populate('bookedBy', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName');
    
    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Comprehensive error updating court reservation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating court reservation', 
      error: error.message,
      errorStack: error.stack // Only for debugging
    });
  }
};

// Cancel a court reservation (for resident use)
// Cancel a court reservation (for resident use)
export const cancelCourtReservation = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body; // Get userId from request body
      
      // Get user ID from authenticated user or request body
      const bookedBy = req.userId || userId;
      
      if (!bookedBy) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }
      
      // Find the court reservation
      const reservation = await CourtReservation.findById(id);
      
      if (!reservation) {
        return res.status(404).json({ 
          success: false, 
          message: 'Court reservation not found' 
        });
      }
      
      // Check if the user is the one who made the reservation
      if (reservation.bookedBy.toString() !== bookedBy) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized to cancel this reservation' 
        });
      }
      
      // Check if the reservation can be cancelled (not already cancelled/rejected)
      if (reservation.status === 'cancelled' || reservation.status === 'rejected') {
        return res.status(400).json({ 
          success: false, 
          message: 'This reservation is already cancelled or rejected' 
        });
      }
      
      // Update status
      reservation.status = 'cancelled';
      reservation.updatedAt = Date.now();
      
      await reservation.save();
      
      // Update the corresponding transaction
      const transaction = await Transaction.findOne({ 
        serviceType: 'court_reservation',
        referenceId: id
      });
      
      if (transaction) {
        transaction.status = 'cancelled';
        await transaction.save();
      }
      
      // Send a successful response
      res.status(200).json({ 
        success: true, 
        message: 'Court reservation cancelled successfully',
        reservation: reservation
      });
    } catch (error) {
      console.error('Error cancelling court reservation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error cancelling court reservation', 
        error: error.message 
      });
    }
  };

// Get court reservations calendar data
export const getCourtReservationsCalendar = async (req, res) => {
  try {
    const { month, year, startDate, endDate, view, start, end, userType } = req.query;
    
    // Use the same filtering logic as in your ambulance controller
    let dateFilter = {};
    
    // For specific date range (used in week and day views)
    if (start && end) {
      dateFilter = {
        reservationDate: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      };
    } else if (startDate && endDate) {
      dateFilter = {
        reservationDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else if (month && year) {
      // If month and year are provided, filter by that month (used in month view)
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      dateFilter = {
        reservationDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };
    }
    
    // Determine which statuses to include based on userType
    let statusFilter;
    let fieldsToSelect;
    
    if (userType === 'resident') {
      // For residents, show approved and pending (to help avoid conflicts)
      statusFilter = { $in: ['approved', 'pending'] };
      // Residents don't need to see reservation details
      fieldsToSelect = 'reservationDate startTime duration status _id';
    } else {
      // For admin and superadmin, show approved and pending
      statusFilter = { $in: ['approved', 'pending'] };
      // Admins can see all details
      fieldsToSelect = 'reservationDate startTime duration status representativeName purpose';
    }
    
    // Fetch reservations with applied filters
    const reservations = await CourtReservation.find({
      ...dateFilter,
      status: statusFilter
    }).select(fieldsToSelect);
    
    // For debugging
    console.log(`Calendar view: ${view || 'not specified'}, Found ${reservations.length} reservations within date range, User type: ${userType || 'admin'}`);
    
    // Format for calendar - Using the exact same pattern as your ambulance controller
    const calendarData = reservations.map(reservation => {
      // Format the date and time
      const bookingDate = new Date(reservation.reservationDate);
      const [hours, minutes] = reservation.startTime.split(':').map(Number);
      
      // Set the correct time on the date
      bookingDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on duration
      const endDate = new Date(bookingDate);
      const duration = Number(reservation.duration) || 1; // Default to 1 hour if missing
      endDate.setHours(endDate.getHours() + duration);
      
      return {
        id: reservation._id,
        title: userType === 'admin' ? 
          `${reservation.representativeName || 'Reserved'} - ${reservation.purpose || 'Court use'}` : 
          'Reserved', // No personal info shown for residents
        start: bookingDate.toISOString(), // Convert to ISO string format
        end: endDate.toISOString(),     // Convert to ISO string format
        backgroundColor: reservation.status === 'approved' ? '#4caf50' : '#ff9800', // Green for approved, Orange for pending
        borderColor: reservation.status === 'approved' ? '#2e7d32' : '#f57c00',
        textColor: '#ffffff'
      };
    });
    
    res.status(200).json(calendarData);
  } catch (error) {
    console.error('Error fetching court reservations calendar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching court reservations calendar', 
      error: error.message 
    });
  }
};
  
// Check if a requested time slot has any conflicts
export const checkReservationConflict = async (req, res) => {
  try {
    const { date, startTime, duration } = req.query;
    
    if (!date || !startTime || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters',
        hasConflict: false  // Default to no conflict if missing params
      });
    }
    
    // Convert parameters
    const reservationDate = new Date(date);
    const hours = parseInt(startTime.split(':')[0]);
    const minutes = parseInt(startTime.split(':')[1]);
    const durationHours = parseFloat(duration);
    
    // Find reservations on the same day with pending or approved status
    const conflictingReservations = await CourtReservation.find({
      reservationDate: { 
        $eq: new Date(reservationDate.toISOString().split('T')[0]) 
      },
      status: { $in: ['pending', 'approved'] }
    });
    
    console.log(`Found ${conflictingReservations.length} reservations on the same day`);
    
    // Check for time conflicts using JavaScript instead of MongoDB query operators
    const newStartMinutes = hours * 60 + minutes;
    const newEndMinutes = newStartMinutes + (durationHours * 60);
    
    const hasConflict = conflictingReservations.some(existing => {
      const existingHours = parseInt(existing.startTime.split(':')[0]);
      const existingMinutes = parseInt(existing.startTime.split(':')[1]);
      const existingDuration = existing.duration;
      
      // Convert everything to minutes for easier comparison
      const existingStartMinutes = existingHours * 60 + existingMinutes;
      const existingEndMinutes = existingStartMinutes + (existingDuration * 60);
      
      // Check if there's an overlap by comparing start and end times
      const overlap = (
        // New booking starts during existing booking
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        // New booking ends during existing booking
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        // New booking completely contains existing booking
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      );
      
      if (overlap) {
        console.log(`Conflict found: New booking ${startTime}-${newEndMinutes / 60} conflicts with existing ${existing.startTime}-${existingEndMinutes / 60}`);
      }
      
      return overlap;
    });
    
    res.status(200).json({ hasConflict });
  } catch (error) {
    console.error('Error checking reservation conflict:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking reservation conflict', 
      error: error.message,
      hasConflict: true  // Default to conflict on error (safer)
    });
  }
};