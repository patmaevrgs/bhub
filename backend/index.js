import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import router from './router.js';
import { addAdmin, addSuperAdmin } from './controllers/authController.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MONGODB_URI, PORT, FRONTEND_URL, SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable trust proxy - add this EARLY
app.enable('trust proxy');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB database');
  // Once connected, add admin users
  addSuperAdmin();
  addAdmin();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// CORS configuration - keep only ONE CORS setup
const allowedOrigins = [
  FRONTEND_URL,
  'https://bhub-maahas.netlify.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // This is essential for cookies to work cross-origin
  exposedHeaders: ['set-cookie'] // Expose cookie headers
}));

// Additional headers for better CORS support
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers,Access-Control-Allow-Methods,Origin,Accept,Content-Type,X-Requested-With,Cookie,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Set secure cookie settings for ALL environments, not just production
app.use((req, res, next) => {
  res.originalCookie = res.cookie;
  res.cookie = function(name, value, options) {
    const enhancedOptions = {
      ...options,
      sameSite: 'None',
      secure: true,
      httpOnly: options?.httpOnly !== false,
      // Don't set domain explicitly unless you have a specific reason
      // as it can cause issues with subdomains
      path: options?.path || '/'
    };
    return res.originalCookie(name, value, enhancedOptions);
  };
  next();
});

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('Supabase URL:', SUPABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Key:', SUPABASE_KEY ? 'Set (length: ' + SUPABASE_KEY.length + ')' : 'Not set');
console.log('Frontend URL:', FRONTEND_URL);

// Routes
app.use(router);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});