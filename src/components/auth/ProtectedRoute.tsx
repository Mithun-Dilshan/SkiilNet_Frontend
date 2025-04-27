import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [hasToken, setHasToken] = useState<boolean>(false);
  
  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);
  
  // While checking authentication status, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // If no user but we have a token, show loading while we wait for user data
  if (!user && hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-300">Loading user data...</p>
      </div>
    );
  }
  
  // If not authenticated and no token, redirect to login
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated or has token, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;