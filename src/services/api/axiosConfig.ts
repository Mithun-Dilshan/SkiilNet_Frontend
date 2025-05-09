import axios from 'axios';

// Create an axios instance with default config
const instance = axios.create({
  baseURL: 'http://localhost:8080/api',  // Updated to include /api prefix
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug middleware to log requests and responses
if (process.env.NODE_ENV !== 'production') {
  instance.interceptors.request.use(request => {
    console.log('Starting Request', {
      method: request.method,
      url: request.url,
      headers: request.headers,
      data: request.data
    });
    return request;
  });

  instance.interceptors.response.use(response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  }, error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      request: error.request ? {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data
      } : 'No request'
    });
    return Promise.reject(error);
  });
}

// Request interceptor for API calls
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Special handling for user profile endpoints
    if (config.url && config.url.includes('/users/')) {
      // Make sure we have proper URL encoding without double-encoding
      const segments = config.url.split('/');
      for (let i = 0; i < segments.length; i++) {
        if (i > 0 && segments[i-1] === 'users') {
          // This is a user identifier - ensure it's properly encoded once
          // First decode in case it's already encoded
          const decoded = decodeURIComponent(segments[i]);
          // Then encode correctly
          segments[i] = encodeURIComponent(decoded);
        }
      }
      config.url = segments.join('/');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is due to an expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Custom error types we can check for in our UI logic
      error.isAuthError = true;
      
      // You might implement token refresh logic here
      // For now, just return the error with a flag
      return Promise.reject(error);
    }
    
    // Add custom error flags to help with UI error handling
    if (error.response) {
      // Server responded with a status outside the 2xx range
      error.isApiError = true;
      
      if (error.response.status === 401 || error.response.status === 403) {
        error.isAuthError = true;
      }
    } else if (error.request) {
      // Request was made but no response received
      error.isNetworkError = true;
    } else {
      // Error in setting up the request
      error.isRequestError = true;
    }
    
    return Promise.reject(error);
  }
);

export default instance; 