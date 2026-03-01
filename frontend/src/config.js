// frontend/src/config.js

// 1. Look for the Vercel Environment Variable first
// 2. Fall back to your VERCEL URL in production (Because Vercel is now our proxy!)
// 3. Fall back to localhost if we are running on your computer locally
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                            (import.meta.env.MODE === 'production' 
                              ? 'https://pulsesyd.vercel.app' 
                              : 'http://localhost:5000');