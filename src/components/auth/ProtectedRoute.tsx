import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [hasToken, setHasToken] = useState<boolean>(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user && hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-300">Loading user data...</p>
      </div>
    );
  }
  
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;