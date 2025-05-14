import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Environment variables
export const PORT = process.env.PORT || 3002;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BHUB';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Check if Supabase credentials are available
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('WARNING: Supabase credentials missing. File uploads will not work.');
  console.warn('Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file');
}

// Supabase client with error handling
let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized successfully');
  } else {
    console.warn('Skipping Supabase client initialization due to missing credentials');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

export { supabase };