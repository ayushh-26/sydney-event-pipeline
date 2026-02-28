import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-emerald-500">Authenticating...</div>;
  
  return user ? children : <Navigate to="/login" />;
}