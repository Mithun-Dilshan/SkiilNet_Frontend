import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',  // Updated to include /api prefix to match Spring Boot controller paths
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Enable sending cookies in cross-origin requests
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
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        default:
          // Handle other errors
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 