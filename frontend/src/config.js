// frontend/src/config.js

// Vite automatically knows if it is running locally or on Vercel (production)
export const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://sydney-event-api.onrender.com' 
  : 'http://localhost:5000'; 