import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const signUp = async (req, res) => {
    try {
        // First check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        
        if (existingUser) {
            // Return a specific error for duplicate email
            return res.status(409).json({ 
                success: false, 
                message: "Email address already registered. Please use a different email or log in." 
            });
        }
        
        // If email doesn't exist, proceed with creating the account
        const { password, ...userData } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ ...userData, password: hashedPassword });
        const result = await newUser.save();

        if (result._id) {
            res.status(201).json({ success: true });
        } else {
            res.status(400).json({ 
                success: false, 
                message: "Error creating account. Please try again." 
            });
        }
    } catch (error) {
        // Handle any other errors that might occur
        console.error("SignUp error:", error);
        
        // Check if it's a MongoDB duplicate key error (another way to catch duplicates)
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: "Email address already registered. Please use a different email or log in."
            });
        }
        
        // Generic error response
        res.status(500).json({ 
            success: false, 
            message: "An unexpected error occurred. Please try again later."
        });
    }
};

const login = async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // Check if email exists
  const user = await User.findOne({ email })

  //  Scenario 1: FAIL - User doesn't exist
  if (!user) {
    return res.send({ success: false })
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  // Scenario 3: SUCCESS - time to create a token
  const tokenPayload = {
    _id: user._id
  }

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "THIS_IS_A_SECRET_STRING");

  // return the token to the client
  return res.send({ success: true, userType: user.userType, token, user: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email});
};

const checkIfLoggedIn = async (req, res) => {

  if (!req.cookies || !req.cookies.authToken) {
    // FAIL Scenario 1 - No cookies / no authToken cookie sent
    return res.send({ isLoggedIn: false });
  }

  try {
    // try to verify the token
    const tokenPayload = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET || 'THIS_IS_A_SECRET_STRING');

    // check if the _id in the payload is an existing user id
    const user = await User.findById(tokenPayload._id)
    if (user) {
    // SUCCESS Scenario - User is found
      return res.send({ isLoggedIn: true, userType: user.userType });
    } else {
    // FAIL Scenario 2 - Token is valid but user id not found
      return res.send({ isLoggedIn: false })
    }
  } catch {
      // FAIL Scenario 3 - Error in validating token / Token is not valid
      return res.send({ isLoggedIn: false });
  }
};

const addAdmin = async (req, res) => {
    const adminExists = await User.findOne({ userType: 'admin' });
    if(!adminExists){
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
        firstName: 'Admin',
        middleName: 'User',
        lastName: 'User',
        email: 'admin@123.com',
        userType: 'admin',
        password: hashedPassword,
        });
        admin.save();
    }
}

const addSuperAdmin = async (req, res) => {
  const superAdminExists = await User.findOne({ userType: 'superadmin' });
  if(!superAdminExists){
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const superAdmin = new User({
      firstName: 'Super',
      middleName: 'Admin',
      lastName: 'User',
      email: 'superadmin@123.com',
      userType: 'superadmin',
      password: hashedPassword,
      });
      superAdmin.save();
  }
}

export { signUp, login, checkIfLoggedIn, addAdmin, addSuperAdmin };
