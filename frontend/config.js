// src/config.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-name.onrender.com' 
  : 'http://localhost:3002';

export default API_BASE_URL;