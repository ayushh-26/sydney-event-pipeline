// frontend/src/config.js

// 1. Look for the Vercel Environment Variable first
// 2. Fall back to the hardcoded Render URL if the variable is missing
// 3. Fall back to localhost if we are running on your computer
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                            (import.meta.env.MODE === 'production' 
                              ? 'https://sydney-event-api.onrender.com' 
                              : 'http://localhost:5000');