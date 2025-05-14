import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get all users (for admin dashboard)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is logged in and is admin/superadmin
    if (!req.cookies || !req.cookies.authToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
    
    try {
      // Verify the token
      const tokenPayload = jwt.verify(req.cookies.authToken, 'THIS_IS_A_SECRET_STRING');
      const adminId = tokenPayload._id;

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
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Update user's userType (superadmin only)
const updateUserType = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.cookies || !req.cookies.authToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
    
    try {
      // Verify the token
      const tokenPayload = jwt.verify(req.cookies.authToken, 'THIS_IS_A_SECRET_STRING');
      const adminId = tokenPayload._id;

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
        await fetch('http://localhost:3002/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
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
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error updating user type:', error);
    return res.status(500).json({ success: false, message: 'Error updating user type' });
  }
};

// Get profile of the currently logged-in user
const getUserProfile = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'THIS_IS_A_SECRET_STRING');
    const userId = decoded._id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
    return res.status(500).json({ success: false, message: 'Error fetching user profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'THIS_IS_A_SECRET_STRING');
    const userId = decoded._id;

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
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'THIS_IS_A_SECRET_STRING');
    const userId = decoded._id;

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