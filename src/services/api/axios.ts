import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with custom config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Important for handling cookies/sessions
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage or your auth context
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ensure headers are properly set for the request
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    }, {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    });
                    
                    const { token } = response.data;
                    localStorage.setItem('authToken', token);
                    
                    // Retry the original request
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // If refresh token fails, redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle specific error cases
        if (error.response?.status === 403) {
            // Redirect to login if forbidden
            window.location.href = '/login';
        } else if (error.code === 'ERR_NETWORK') {
            // Handle network errors (like CORS issues)
            console.error('Network Error - Please check if the backend server is running and accessible');
            return Promise.reject(new Error('Network Error - Unable to connect to the server'));
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 