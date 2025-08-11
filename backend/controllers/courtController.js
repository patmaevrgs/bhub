import CourtReservation from '../models/CourtReservation.js';
import Transaction from '../models/Transaction.js';
import UserLog from '../models/UserLog.js';
import { format } from 'date-fns';
import mongoose from 'mongoose';

// Add this function at the top of each controller file
const emitNotification = (req, eventType, data) => {
  const io = req.app.get('io');
  if (io) {
    if (eventType.includes('new_request') || eventType.includes('request_submitted')) {
      // Notify all admins
      io.to('admins').emit(eventType, data);
    } else if (eventType.includes('status_update')) {
      // Notify specific resident
      io.to(`user_${data.userId}`).emit(eventType, data);
    }
  }
};

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

// For court logging
const getCourtLogActionType = (status) => {
  switch (status) {
    case 'approved': return 'COURT_RESERVATION_APPROVED';
    case 'rejected': return 'COURT_RESERVATION_REJECTED';
    case 'cancelled': return 'COURT_RESERVATION_CANCELLED';
    default: return 'COURT_RESERVATION_UPDATED';
  }
};

// Get the correct verb based on status change
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

    // Emit notification to admins
    emitNotification(req, 'new_request', {
      type: 'court_reservation',
      id: savedReservation._id,
      serviceId: savedReservation.serviceId,
      message: `New court reservation from ${savedReservation.representativeName}`,
      timestamp: new Date(),
      data: savedReservation
    });

    // Create transaction 
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

// Calculate amount (free in morning, 200 PHP/hour after 6PM)
const calculateAmount = (startTime, duration) => {
  const hour = parseInt(startTime.split(':')[0]);
  
  // Free in morning hours, 200 PHP/hour after 6 PM
  if (hour >= 18) {
    return 200 * duration;
  }
  
  return 0;
};

// Get all court reservations 
export const getCourtReservations = async (req, res) => {
  try {
    const { userId, status, startDate, endDate } = req.query;
    
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
    
    // Get admin ID
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
    
    // Save
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
      }
    } else {
      console.log('No transaction found for court reservation:', id);
      
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
export const cancelCourtReservation = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      // Get user ID 
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
    const { start, end, userType } = req.query;
    console.log('Calendar Query Parameters:', { start, end, userType });
    
    // When getting calendar data for admin, show only approved reservations
    // When getting for a regular user, show both pending and approved
    const statusFilter = userType === 'admin' 
      ? ['approved'] 
      : ['pending', 'approved'];
      
    const filter = {
      status: { $in: statusFilter }
    };
    
    // Date range filter
    if (start || end) {
      filter.reservationDate = {};
      if (start) filter.reservationDate.$gte = new Date(start);
      if (end) filter.reservationDate.$lte = new Date(end);
    }
    
    console.log('Calendar filter:', JSON.stringify(filter, null, 2));
    
    // Fetch reservations for calendar
    const reservations = await CourtReservation.find(filter)
      .select('_id reservationDate startTime duration status representativeName purpose')
      .sort({ reservationDate: 1, startTime: 1 });
    
    console.log(`Found ${reservations.length} reservations for calendar`);
    
    // Format for calendar 
    const calendarData = reservations.map(reservation => {
      // Parse the reservation date and time properly
      const reservationDate = reservation.reservationDate;
      const datePart = reservationDate.toISOString().split('T')[0];
      
      // Ensure startTime has proper format (HH:MM)
      let startTime = reservation.startTime;
      if (!startTime.includes(':')) {
        startTime = `${startTime}:00`;
      }
      
      // Parse hours and minutes properly
      const [hours, minutes] = startTime.split(':').map(Number);
      
      // Create proper ISO datetime strings for start and end
      const startDateTime = new Date(`${datePart}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      
      // Calculate end time based on duration
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + Number(reservation.duration));
      
      // Format title based on userType
      const title = userType === 'admin' 
        ? `${reservation.representativeName} - ${reservation.purpose}` 
        : 'Reserved';
      
      console.log('Event being created:', {
        id: reservation._id,
        title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      });
      
      return {
        id: reservation._id,
        title,
        start: startDateTime.toISOString(), 
        end: endDateTime.toISOString(),     
        status: reservation.status,
        allDay: false                        
      };
    });
    
    console.log(`Returning ${calendarData.length} calendar events`);
    
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
    
    // Check for time conflicts 
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
      hasConflict: true 
    });
  }
};