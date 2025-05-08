import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',  // Updated to include /api prefix to match Spring Boot controller paths
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Enable sending cookies in cross-origin requests
  timeout: 10000,  // Add a default timeout of 10 seconds to prevent hanging
  validateStatus: (status) => status < 300,  // Only consider 2xx responses as valid, reject redirects
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detect redirects and block them early
    const originalRequest = error.config;
    
    // If there's no response object at all, it's likely a CORS or network error
    if (!error.response) {
      console.error('Network error or CORS issue:', error.message);
      
      // Detect OAuth redirects that cause CORS errors (check both the error message and the URL if available)
      const isOAuthRedirect = 
        error.message === 'Network Error' || 
        (error.request?.responseURL && 
         (error.request.responseURL.includes('oauth2') || 
          error.request.responseURL.includes('accounts.google.com'))) ||
        (error.request?.responseText && 
         (error.request.responseText.includes('oauth2') || 
          error.request.responseText.includes('accounts.google.com')));
      
      if (isOAuthRedirect) {
        console.warn('Detected OAuth redirect - user likely needs to log in');
        
        // Instead of redirecting, just return a specific error that can be handled
        return Promise.reject({
          isAuthError: true,
          message: 'Authentication required. Please log in.',
          originalError: error
        });
      }
      
      // For other network errors, return a specific indicator
      return Promise.reject({
        isNetworkError: true,
        message: 'Network error. Please check your connection.',
        originalError: error
      });
    }
    
    // Regular error with a response
    console.error('Response error:', error.response?.status, error.message);
    
    // Check if we're being redirected to OAuth
    if (error.response?.status === 302 || 
        (error.message === 'Network Error' && error.request?.responseURL?.includes('accounts.google.com'))) {
      console.log('Detected redirect to OAuth login');
      
      // Avoid automatic redirects, let the application code handle this
      return Promise.reject({
        isAuthError: true,
        message: 'Authentication required. Please log in.',
        originalError: error
      });
    }
    
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          console.log('401 Unauthorized - Authentication required');
          return Promise.reject({
            isAuthError: true,
            status: 401,
            message: 'Authentication required. Please log in.',
            originalError: error
          });
          
        case 403:
          // Handle forbidden
          console.log('403 Forbidden - Access denied');
          return Promise.reject({
            isAuthError: true,
            status: 403,
            message: 'Access denied. You do not have permission.',
            originalError: error
          });
          
        case 404:
          // Handle not found
          console.log('404 Not Found');
          break;
          
        case 500:
          console.log('500 Server Error:', error.response.data);
          break;
          
        default:
          // Handle other errors
          console.log(`${error.response.status} Error`, error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 