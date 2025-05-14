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

// Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);