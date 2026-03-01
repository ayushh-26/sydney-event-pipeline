import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Import the dynamic base URL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Sanitize the URL to avoid double slashes
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
    
    // 2. Point to the live Render backend instead of localhost
    axios.get(`${cleanBaseUrl}/auth/current-user`, { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Session check failed (logged out or server error)", err.message);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);