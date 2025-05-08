import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',  
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  
  timeout: 10000,  
  validateStatus: (status) => status < 300,  
});


instance.interceptors.request.use(
  (config) => {
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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (!error.response) {
      console.error('Network error or CORS issue:', error.message);
      
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
        
        return Promise.reject({
          isAuthError: true,
          message: 'Authentication required. Please log in.',
          originalError: error
        });
      }
      
      return Promise.reject({
        isNetworkError: true,
        message: 'Network error. Please check your connection.',
        originalError: error
      });
    }
    
    console.error('Response error:', error.response?.status, error.message);
    
    if (error.response?.status === 302 || 
        (error.message === 'Network Error' && error.request?.responseURL?.includes('accounts.google.com'))) {
      console.log('Detected redirect to OAuth login');
      
      return Promise.reject({
        isAuthError: true,
        message: 'Authentication required. Please log in.',
        originalError: error
      });
    }
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log('401 Unauthorized - Authentication required');
          return Promise.reject({
            isAuthError: true,
            status: 401,
            message: 'Authentication required. Please log in.',
            originalError: error
          });
          
        case 403:
          console.log('403 Forbidden - Access denied');
          return Promise.reject({
            isAuthError: true,
            status: 403,
            message: 'Access denied. You do not have permission.',
            originalError: error
          });
          
        case 404:
          console.log('404 Not Found');
          break;
          
        case 500:
          console.log('500 Server Error:', error.response.data);
          break;
          
        default:
          console.log(`${error.response.status} Error`, error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 