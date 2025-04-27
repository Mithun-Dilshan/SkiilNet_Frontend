import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    console.log("OAuth callback received with search params:", location.search);

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const errorMsg = params.get('error');

    if (token) {
      console.log("Authentication successful, received token");
      
      handleAuthCallback(token);
      
      setTimeout(() => {
        console.log("Redirecting to home page after token processing");
        navigate('/', { replace: true });
      }, 500);
      
      return;
    }

    if (errorMsg) {
      console.error("OAuth error:", errorMsg);
      setError(decodeURIComponent(errorMsg));
      setIsProcessing(false);
      return;
    }

    console.error("No token or error found in callback");
    setError("Invalid OAuth response. No token or error message received.");
    setIsProcessing(false);
  }, [location.search, navigate, handleAuthCallback]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Finalizing your login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Failed</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "An unexpected error occurred during authentication."}
          </p>
          <Link to="/login" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage; 