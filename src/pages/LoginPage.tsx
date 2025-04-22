import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { user, login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (provider: 'google' | 'facebook') => {
    try {
      setError(null);
      await login(provider);
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white dark:from-indigo-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">SkillNet</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Connect, learn, and share skills in English, Maths, and Science
          </p>
        </div>
        
        {/* Login Options */}
        <div className="space-y-4">
          <button
            onClick={() => handleLogin('google')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition text-gray-700 dark:text-gray-200 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <button
            onClick={() => handleLogin('facebook')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {/* Info Text */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to SkillNet's</p>
          <div className="flex justify-center space-x-3 mt-1">
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>
            <span>&amp;</span>
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          SkillNet - Empowering learning through community
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          &copy; 2025 SkillNet, Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;