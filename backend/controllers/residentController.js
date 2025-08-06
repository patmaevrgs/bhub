import Resident from '../models/Resident.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { createLog } from './userLogController.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Create log for resident database actions
const logResidentAction = async (userId, action, details) => {
    try {
      // Get admin information first to get the name
      const admin = await User.findById(userId);
      if (!admin) {
        console.error('Admin not found for logging');
        return;
      }
      
      await createLog({
        body: {
          userId,
          action,
          category: 'Database',
          details,
          adminName: `${admin.firstName} ${admin.lastName}` 
        }
      }, { 
        send: () => {},
        status: () => ({ json: () => {} }) 
      });
    } catch (error) {
      console.error('Error creating log:', error);
    }
  };

const parseNameFromCSV = (name) => {
  if (!name) return { firstName: '', middleName: '', lastName: '' };

  // Clean up the name string
  const cleanName = name.replace(/\s+/g, ' ').trim();
  
  // Check if the name is in "LastName, FirstName MiddleName" format
  if (cleanName.includes(',')) {
    const [lastName, firstMiddle] = cleanName.split(',').map(part => part.trim());
    const firstMiddleParts = firstMiddle.split(' ');
    
    const firstName = firstMiddleParts[0] || '';
    const middleName = firstMiddleParts.slice(1).join(' ') || '';
    
    return { firstName, middleName, lastName };
  } 
  // If no comma, assume it's just a full name that needs to be properly parsed
  else {
    const nameParts = cleanName.split(' ');
    
    if (nameParts.length === 1) {
      return { firstName: '', middleName: '', lastName: nameParts[0] };
    } else if (nameParts.length === 2) {
      return { firstName: nameParts[0], middleName: '', lastName: nameParts[1] };
    } else {
      // Assume last part is lastName, first part is firstName, and middle parts are middleName
      const lastName = nameParts.pop();
      const firstName = nameParts.shift();
      const middleName = nameParts.join(' ');
      
      return { firstName, middleName, lastName };
    }
  }
};
  

// CSV parser function
const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  if (lines.length === 0) return [];
  
  // Extract headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  const results = [];
  
  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split by comma, but handle quoted values
    let values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create an object from headers and values
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    
    results.push(row);
  }
  
  return results;
};

// Get userId from JWT cookie
const getUserIdFromCookie = (req) => {
  try {
    if (!req.cookies || !req.cookies.authToken) {
      return null;
    }
    
    const decoded = jwt.verify(req.cookies.authToken, 'THIS_IS_A_SECRET_STRING');
    return decoded._id;
  } catch (error) {
    console.error('Error decoding auth token:', error);
    return null;
  }
};

// Get all residents with filtering options
export const getAllResidents = async (req, res) => {
  try {
    const {
      name,
      address,
      precinctLevel,
      types,
      isVoter,
      isVerified,
      page = 1,
      limit = 10,
      sortBy = 'lastName',
      order = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (name) {
      const nameRegex = new RegExp(name, 'i');
      filter.$or = [
        { firstName: nameRegex },
        { middleName: nameRegex },
        { lastName: nameRegex }
      ];
    }
    
    if (address) filter.address = new RegExp(address, 'i');
    if (precinctLevel) filter.precinctLevel = precinctLevel;
    
    if (isVoter !== undefined) {
      filter.isVoter = isVoter === 'true' || isVoter === true;
    }
    
    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true' || isVerified === true;
    }
    
    if (types) {
      const typeList = types.split(',');
      filter.types = { $in: typeList };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Resident.countDocuments(filter);
    
    // Execute query
    const residents = await Resident.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: residents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting residents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving resident data',
      error: error.message
    });
  }
};

// Get a single resident by ID
export const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID format'
      });
    }

    const resident = await Resident.findById(id).lean();
    
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: resident
    });
  } catch (error) {
    console.error('Error getting resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving resident data',
      error: error.message
    });
  }
};

// Create a new resident 
export const createResident = async (req, res) => {
    try {
      const { 
        firstName, 
        middleName, 
        lastName, 
        address, 
        precinctLevel, 
        contactNumber,
        email,
        types,
        isVoter
      } = req.body;
  
      // Check if required fields are present
      if (!firstName || !lastName || !address) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and address are required'
        });
      }
  
      // Get user ID from cookie
      const userId = getUserIdFromCookie(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
  
      // Check for potential duplicates
      const duplicateCheck = await Resident.findOne({
        firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
        lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
      });
  
      // Create the new resident
      const resident = new Resident({
        firstName,
        middleName: middleName || '',
        lastName,
        address,
        precinctLevel,
        contactNumber,
        email,
        types: types || [],
        isVoter: isVoter || false,
        isVerified: true, // Admin-created residents are verified by default
        addedBy: userId,
        updatedBy: userId
      });
  
      const savedResident = await resident.save();
  
      // Log the action
      await logResidentAction(
        userId,
        'CREATE',
        `Created resident: ${firstName} ${lastName}`
      );
  
      return res.status(201).json({
        success: true,
        data: savedResident,
        hasDuplicate: !!duplicateCheck,
        duplicateInfo: duplicateCheck ? {
          _id: duplicateCheck._id,
          name: `${duplicateCheck.firstName} ${duplicateCheck.lastName}`,
          address: duplicateCheck.address
        } : null
      });
    } catch (error) {
      console.error('Error creating resident:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating resident',
        error: error.message
      });
    }
  };

// Update a resident
export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...updateData } = req.body;
    
    // Require password for verification
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to update resident information'
      });
    }

    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if resident exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID format'
      });
    }

    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    // Check for potential duplicates if name is changing
    let duplicateCheck = null;
    if (
      (updateData.firstName && updateData.firstName !== resident.firstName) || 
      (updateData.lastName && updateData.lastName !== resident.lastName)
    ) {
      const firstName = updateData.firstName || resident.firstName;
      const lastName = updateData.lastName || resident.lastName;
      
      duplicateCheck = await Resident.findOne({
        _id: { $ne: id }, // Exclude current resident
        firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
        lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
      });
    }

    // Apply updates and add updatedBy field
    updateData.updatedBy = userId;
    
    const updatedResident = await Resident.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Log the action
    await logResidentAction(
      userId,
      'UPDATE',
      `Updated resident: ${updatedResident.firstName} ${updatedResident.lastName}`
    );

    return res.status(200).json({
      success: true,
      data: updatedResident,
      hasDuplicate: !!duplicateCheck,
      duplicateInfo: duplicateCheck ? {
        _id: duplicateCheck._id,
        name: `${duplicateCheck.firstName} ${duplicateCheck.lastName}`,
        address: duplicateCheck.address
      } : null
    });
  } catch (error) {
    console.error('Error updating resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating resident',
      error: error.message
    });
  }
};

// Delete a resident
export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    // Require password for verification
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete a resident'
      });
    }

    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if resident exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID format'
      });
    }

    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    await Resident.findByIdAndDelete(id);

    // Log the action
    await logResidentAction(
      userId,
      'DELETE',
      `Deleted resident: ${resident.firstName} ${resident.lastName}`
    );

    return res.status(200).json({
      success: true,
      message: 'Resident deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting resident',
      error: error.message
    });
  }
};

// Register new resident request (from resident side)
export const requestAddToDatabase = async (req, res) => {
  try {
    const { 
      firstName, 
      middleName, 
      lastName, 
      address, 
      precinctLevel, 
      contactNumber,
      email,
      types,
      isVoter
    } = req.body;

    // Check if required fields are present
    if (!firstName || !lastName || !address) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and address are required'
      });
    }

    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check for potential duplicates
    const duplicateCheck = await Resident.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
    });

    // Create the new unverified resident
    const resident = new Resident({
      firstName,
      middleName: middleName || '',
      lastName,
      address,
      precinctLevel,
      contactNumber,
      email,
      types: types || [],
      isVoter: isVoter || false,
      isVerified: false, // Resident-submitted requests are unverified by default
      registeredBy: userId,
      addedBy: userId
    });

    const savedResident = await resident.save();
    
    // Create a transaction for the resident request
    try {
      await createTransactionFromResidentRequest(savedResident._id);
    } catch (transactionError) {
      console.error('Error creating transaction for resident request:', transactionError);
      // Continue with response even if transaction creation fails
    }

    return res.status(201).json({
      success: true,
      data: savedResident,
      hasDuplicate: !!duplicateCheck,
      message: 'Your request has been submitted and is pending approval.'
    });
  } catch (error) {
    console.error('Error submitting resident request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting request',
      error: error.message
    });
  }
};

// Verify a resident (approve request)
export const verifyResident = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if resident exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID format'
      });
    }

    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    if (resident.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Resident is already verified'
      });
    }

    const updatedResident = await Resident.findByIdAndUpdate(
      id,
      { 
        isVerified: true,
        updatedBy: userId
      },
      { new: true }
    );

    // Update the transaction status to approved
    try {
      // First check if a transaction exists for this resident request
      const transaction = await Transaction.findOne({
        serviceType: 'resident_registration',
        referenceId: id
      });

      if (transaction) {
        transaction.status = 'approved';
        transaction.processedBy = userId;
        transaction.updatedAt = Date.now();
        await transaction.save();
      } else {
        // Create a new transaction if one doesn't exist
        await createTransactionFromResidentRequest(id);
      }
    } catch (transactionError) {
      console.error('Error updating transaction for resident verification:', transactionError);
      // Continue with response even if transaction update fails
    }

    // Log the action
    await logResidentAction(
      userId,
      'VERIFY',
      `Verified resident: ${resident.firstName} ${resident.lastName}`
    );

    return res.status(200).json({
      success: true,
      data: updatedResident,
      message: 'Resident verified successfully'
    });
  } catch (error) {
    console.error('Error verifying resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying resident',
      error: error.message
    });
  }
};

// Reject a resident verification request
export const rejectResidentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body; // Extract the rejection reason
    
    // Require a rejection reason
    if (!rejectReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if resident exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID format'
      });
    }

    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident request not found'
      });
    }

    if (resident.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already verified resident'
      });
    }

    // Make a copy of the resident data before deleting it
    const residentData = {
      firstName: resident.firstName,
      middleName: resident.middleName,
      lastName: resident.lastName,
      address: resident.address,
      precinctLevel: resident.precinctLevel,
      contactNumber: resident.contactNumber,
      email: resident.email,
      types: resident.types,
      isVoter: resident.isVoter
    };

    // Update the transaction to rejected and include the rejection reason
    try {
      const transaction = await Transaction.findOne({
        serviceType: 'resident_registration',
        referenceId: id
      });

      if (transaction) {
        // Store all resident data in the transaction
        transaction.status = 'rejected';
        transaction.processedBy = userId;
        transaction.updatedAt = Date.now();
        transaction.adminComment = rejectReason; // Save rejection reason as admin comment
        transaction.details = {
          ...transaction.details,
          ...residentData,
          rejectionReason: rejectReason
        };
        await transaction.save();
      } else {
        // Create a new transaction if none exists
        const newTransaction = new Transaction({
          userId: resident.registeredBy || resident.addedBy,
          serviceType: 'resident_registration',
          status: 'rejected',
          details: {
            ...residentData,
            rejectionReason: rejectReason
          },
          referenceId: id,
          processedBy: userId,
          adminComment: rejectReason
        });
        await newTransaction.save();
      }
    } catch (transactionError) {
      console.error('Error updating transaction for resident rejection:', transactionError);
      // Continue with response even if transaction update fails
    }

    await Resident.findByIdAndDelete(id);

    // Log the action
    await logResidentAction(
      userId,
      'REJECT',
      `Rejected resident request: ${resident.firstName} ${resident.lastName}`
    );

    return res.status(200).json({
      success: true,
      message: 'Resident request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting resident request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rejecting resident request',
      error: error.message
    });
  }
};

// Import residents from CSV
export const importResidentsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { password } = req.body;
    
    // Require password for verification
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to import residents'
      });
    }

    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Convert buffer to string and parse CSV
    const csvText = req.file.buffer.toString('utf8');
    const results = parseCSV(csvText);
    
    const duplicates = [];
    let successCount = 0;
    let errorCount = 0;
    let totalCount = results.length;

    // Get admin name for logging
    const adminName = `${admin.firstName} ${admin.lastName}`;

    // Process each row
    for (const row of results) {
      try {
        // Get name from the "NAME" field
        const nameData = parseNameFromCSV(row.NAME || row.Name || row.name);
        
        // Skip rows with missing required fields
        if (!nameData.lastName || !row.ADDRESS) {
          errorCount++;
          continue;
        }

        // Check for duplicates
        const duplicate = await Resident.findOne({
          $or: [
            // Check if matches exact first and last name
            {
              firstName: { $regex: new RegExp(`^${nameData.firstName}$`, 'i') },
              lastName: { $regex: new RegExp(`^${nameData.lastName}$`, 'i') }
            },
            // Check if matches full name in lastName field (for legacy data)
            {
              firstName: 'Resident',
              lastName: { $regex: new RegExp(`${nameData.lastName},\\s*${nameData.firstName}`, 'i') }
            }
          ]
        });

        if (duplicate) {
          duplicates.push({
            rowData: row,
            existingResident: {
              _id: duplicate._id,
              name: `${duplicate.lastName}, ${duplicate.firstName} ${duplicate.middleName || ''}`.trim(),
              address: duplicate.address
            }
          });
          continue;
        }

        // Process types
        let types = [];
        if (row.TYPE || row.Types || row.types) {
          types = (row.TYPE || row.Types || row.types).split(',').map(type => type.trim());
        }

        // Create new resident with properly parsed name
        const resident = new Resident({
          firstName: nameData.firstName,
          middleName: nameData.middleName,
          lastName: nameData.lastName,
          address: row.ADDRESS || row.Address || row.address || '',
          precinctLevel: row['PRECINCT LEVEL'] || row.Precinct || row.precinct || '',
          contactNumber: row['CONTACT NUMBER'] || row.Contact || row.contact || '',
          email: row.EMAIL || row.Email || row.email || '',
          types: types,
          isVoter: row.VOTER === 'Yes' || row.Voter === 'Yes' || row.voter === 'Yes' || 
                   row.VOTER === 'true' || row.Voter === 'true' || row.voter === 'true' || 
                   row.VOTER === 'TRUE' || row.Voter === 'TRUE' || row.voter === 'TRUE',
          isVerified: true,
          addedBy: userId,
          updatedBy: userId
        });

        await resident.save();
        successCount++;
      } catch (error) {
        console.error('Error processing CSV row:', error);
        errorCount++;
      }
    }

    // Log action 
    console.log(`Import: Admin ${adminName} imported ${successCount} residents`);

    if (successCount === 0 && duplicates.length > 0) {
      // All valid rows were duplicates
      return res.status(200).json({
        success: false, // Set to false to trigger error styling in frontend
        message: `Import failed: All ${duplicates.length} residents already exist in the database`,
        isDuplicateError: true, // Special flag to identify duplicate errors
        errors: errorCount,
        duplicates: duplicates
      });
    } else if (successCount === 0 && errorCount > 0) {
      // No success due to errors
      return res.status(200).json({
        success: false,
        message: `Import failed: All ${errorCount} entries had errors`,
        errors: errorCount,
        duplicates: duplicates
      });
    } else if (duplicates.length > 0) {
      // Partial success with some duplicates
      return res.status(200).json({
        success: true,
        message: `Imported ${successCount} residents. ${duplicates.length} residents were skipped (duplicates)`,
        errors: errorCount,
        duplicates: duplicates
      });
    } else {
      // Complete success
      return res.status(200).json({
        success: true,
        message: `Successfully imported ${successCount} residents`,
        errors: errorCount,
        duplicates: duplicates
      });
    }
  } catch (error) {
    console.error('Error importing residents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error importing residents',
      error: error.message
    });
  }
};

// Update the checkDuplicateResident function
export const checkDuplicateResident = async (req, res) => {
  try {
    const { firstName, lastName, isVerified } = req.query;
    
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Build filter object for more comprehensive duplicate checking
    const filters = [
      // Check standard format (firstName, lastName as separate fields)
      {
        firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
        lastName: { $regex: new RegExp(`^${lastName}$`, 'i') }
      },
      // Check legacy format where full name is in lastName
      {
        firstName: 'Resident',
        lastName: { $regex: new RegExp(`${lastName},\\s*${firstName}`, 'i') }
      }
    ];
    
    // Add isVerified filter 
    if (isVerified !== undefined) {
      filters.forEach(filter => {
        filter.isVerified = isVerified === 'true';
      });
    }

    const duplicates = await Resident.find({ $or: filters }).lean();

    return res.status(200).json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking for duplicate residents',
      error: error.message
    });
  }
};

// Create a transaction from a resident registration request
export const createTransactionFromResidentRequest = async (residentId) => {
  try {
    const resident = await Resident.findById(residentId);
    
    if (!resident) {
      throw new Error('Resident request not found');
    }
    
    // Check if a transaction already exists for this request
    const existingTransaction = await Transaction.findOne({
      serviceType: 'resident_registration',
      referenceId: residentId
    });
    
    if (existingTransaction) {
      // Update existing transaction status based on resident verification status
      existingTransaction.status = resident.isVerified ? 'approved' : 'pending';
      existingTransaction.details = {
        firstName: resident.firstName,
        middleName: resident.middleName,
        lastName: resident.lastName,
        address: resident.address,
        contactNumber: resident.contactNumber,
        email: resident.email
      };
      
      existingTransaction.updatedAt = Date.now();
      await existingTransaction.save();
      console.log('Updated existing transaction for resident registration:', residentId);
      return existingTransaction;
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      userId: resident.registeredBy || resident.addedBy,
      serviceType: 'resident_registration',
      status: resident.isVerified ? 'approved' : 'pending',
      details: {
        firstName: resident.firstName,
        middleName: resident.middleName,
        lastName: resident.lastName,
        address: resident.address,
        contactNumber: resident.contactNumber,
        email: resident.email
      },
      referenceId: residentId,
      processedBy: resident.updatedBy
    });
    
    await newTransaction.save();
    console.log('Created new transaction for resident request:', residentId);
    return newTransaction;
  } catch (error) {
    console.error('Error creating/updating transaction from resident request:', error);
    throw error;
  }
};

// Cancel resident registration request (by resident)
export const cancelResidentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body; 
    
    // Get user ID from cookie
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Check if resident exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID format'
      });
    }

    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident request not found'
      });
    }

    // Only allow cancellation if not verified and if requested by the same user
    if (resident.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already verified resident registration'
      });
    }

    if (resident.registeredBy.toString() !== userId && resident.addedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this registration request'
      });
    }

    // Make a copy of the resident data before deleting it
    const residentData = {
      firstName: resident.firstName,
      middleName: resident.middleName,
      lastName: resident.lastName,
      address: resident.address,
      precinctLevel: resident.precinctLevel,
      contactNumber: resident.contactNumber,
      email: resident.email,
      types: resident.types,
      isVoter: resident.isVoter
    };

    // Update the transaction status to cancelled before deleting the resident
    try {
      const transaction = await Transaction.findOne({
        serviceType: 'resident_registration',
        referenceId: id
      });

      if (transaction) {
        // Store complete resident data in the transaction
        transaction.status = 'cancelled';
        transaction.updatedAt = Date.now();
        transaction.details = {
          ...transaction.details,
          ...residentData,
          cancellationReason: cancellationReason || 'Cancelled by resident'
        };
        await transaction.save();
      } else {
        // Create a new transaction if none exists
        const newTransaction = new Transaction({
          userId: resident.registeredBy || resident.addedBy,
          serviceType: 'resident_registration',
          status: 'cancelled',
          details: {
            ...residentData,
            cancellationReason: cancellationReason || 'Cancelled by resident'
          },
          referenceId: id
        });
        await newTransaction.save();
      }
    } catch (transactionError) {
      console.error('Error updating transaction for resident cancellation:', transactionError);
    }

    await Resident.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Resident registration request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling resident request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling resident request',
      error: error.message
    });
  }
};