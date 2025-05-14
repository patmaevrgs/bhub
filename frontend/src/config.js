// src/config.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
console.log("API BASE URL:", API_BASE_URL); // Add this for debugging

export default API_BASE_URL;