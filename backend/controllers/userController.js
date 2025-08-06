import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const API_URL = process.env.API_URL || 'http://localhost:3002';

// Get all users 
const getAllUsers = async (req, res) => {
  try {
    // Check for authentication in multiple places
    let adminId = null;
    
    // First try Authorization header (for mobile)
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.startsWith('Bearer ') 
          ? req.headers.authorization.substring(7) 
          : req.headers.authorization;
          
        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        adminId = tokenPayload._id;
      } catch (error) {
        console.error('Error verifying auth header token:', error);
      }
    }
    
    // If not found in Authorization header, try cookie
    if (!adminId && req.cookies && req.cookies.authToken) {
      try {
        const tokenPayload = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        adminId = tokenPayload._id;
      } catch (error) {
        console.error('Error verifying cookie token:', error);
      }
    }
    
    // If no valid authentication found
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    // Find the admin user to check their type
    const adminUser = await User.findById(adminId);
    if (!adminUser || (adminUser.userType !== 'admin' && adminUser.userType !== 'superadmin')) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Get all users, excluding password field
    const users = await User.find({}, '-password');
    
    return res.status(200).json({
      success: true,
      users,
      isSuper: adminUser.userType === 'superadmin' // Send flag if current user is superadmin
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Update user's userType (superadmin only)
const updateUserType = async (req, res) => {
  try {
    // Check for authentication in multiple places
    let adminId = null;
    
    // First try Authorization header (for mobile)
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.startsWith('Bearer ') 
          ? req.headers.authorization.substring(7) 
          : req.headers.authorization;
          
        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        adminId = tokenPayload._id;
      } catch (error) {
        console.error('Error verifying auth header token:', error);
      }
    }
    
    // If not found in Authorization header, try cookie
    if (!adminId && req.cookies && req.cookies.authToken) {
      try {
        const tokenPayload = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        adminId = tokenPayload._id;
      } catch (error) {
        console.error('Error verifying cookie token:', error);
      }
    }
    
    // If no valid authentication found
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    // Find the admin to check if they're a superadmin
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Superadmin access required' });
    }

    // Get the user ID and new userType from request body
    const { userId, userType } = req.body;
    
    // Validate userType
    if (!['resident', 'admin', 'superadmin'].includes(userType)) {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { userType },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create log entry for this admin action
    try {
      await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          action: `Updated user type`,
          adminId: adminId,
          adminName: `${adminUser.firstName} ${adminUser.lastName}`,
          details: `Changed ${user.firstName} ${user.lastName}'s user type from ${user.userType} to ${userType}`
        })
      });
    } catch (logError) {
      console.error('Error creating log:', logError);
      // Continue execution even if logging fails
    }

    return res.status(200).json({
      success: true,
      message: 'User type updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user type:', error);
    return res.status(500).json({ success: false, message: 'Error updating user type' });
  }
};

// Get profile of the currently logged-in user
const getUserProfile = async (req, res) => {
  try {
    // First try authorization header (for mobile)
    let token = null;
    let userId = null;
    
    // Check for token in Authorization header first (prioritize this for mobile)
    if (req.headers.authorization) {
      try {
        // Handle both formats: with or without "Bearer " prefix
        token = req.headers.authorization.startsWith('Bearer ') 
          ? req.headers.authorization.substring(7) 
          : req.headers.authorization;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        userId = decoded._id;
      } catch (err) {
        console.error('Error verifying header token:', err);
      }
    }
    
    // If not found in Authorization header, try cookies as fallback
    if (!userId && req.cookies && req.cookies.authToken) {
      try {
        const decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        userId = decoded._id;
      } catch (err) {
        console.error('Error verifying cookie token:', err);
      }
    }
    
    // If no valid token found
    if (!userId) {
      console.log('No valid token found in headers or cookies');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.' 
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Return user data without password
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    // Extract user ID from JWT token
    let userId;
    
    // Check for token in Auth header (from Bearer token)
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        userId = decoded._id;
      } catch (err) {
        console.error('Error verifying header token:', err);
      }
    }
    
    // If not found in auth header, try cookies
    if (!userId && req.cookies && req.cookies.authToken) {
      try {
        const decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        userId = decoded._id;
      } catch (err) {
        console.error('Error verifying cookie token:', err);
      }
    }
    
    // If no valid token found
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.' 
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update profile fields
    const { firstName, middleName, lastName, email } = req.body;
    
    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.middleName = middleName; // Can be null
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: 'Error updating user profile' });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  try {
    // Extract user ID from JWT token
    let userId;
    
    // Check for token in Auth header (from Bearer token)
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        userId = decoded._id;
      } catch (err) {
        console.error('Error verifying header token:', err);
      }
    }
    
    // If not found in auth header, try cookies
    if (!userId && req.cookies && req.cookies.authToken) {
      try {
        const decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');
        userId = decoded._id;
      } catch (err) {
        console.error('Error verifying cookie token:', err);
      }
    }
    
    // If no valid token found
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.' 
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get current and new password from request
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    return res.status(500).json({ success: false, message: 'Error updating user password' });
  }
};

export { getUserProfile, updateUserProfile, updateUserPassword, getAllUsers, updateUserType};