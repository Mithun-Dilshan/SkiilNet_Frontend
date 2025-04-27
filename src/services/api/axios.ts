import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with custom config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, 
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        config.headers = config.headers || {};
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            originalUrl: originalRequest?.url,
            method: originalRequest?.method
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
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
                    
                    const responseData = response.data as { token: string };
                    const { token } = responseData;
                    localStorage.setItem('authToken', token);
                    
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
               
                if (!originalRequest.url?.includes('/public/')) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 302) {
            console.log('Received a redirect response:', error.response.headers?.location);
            if (error.response.headers?.location?.includes('accounts.google.com')) {
                return Promise.reject(new Error('Authentication required. Please login.'));
            }
        }

        if (error.response?.status === 403) {
            if (!originalRequest.url?.includes('/public/')) {
                window.location.href = '/login';
            }
        } else if (error.code === 'ERR_NETWORK') {
            console.error('Network Error - Please check if the backend server is running and accessible');
            return Promise.reject(new Error('Network Error - Unable to connect to the server'));
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 