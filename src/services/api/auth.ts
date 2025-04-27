import axios from './axiosConfig';

// Types
export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get('/oauth2/user');
    // Check if the response is empty or not a valid user
    if (!response.data || typeof response.data !== 'object' || Object.keys(response.data as object).length === 0) {
      return null;
    }
    return response.data as User;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const getOAuthLoginUrl = (provider: 'google' | 'github') => {
  return `http://localhost:8080/oauth2/authorization/${provider}?redirect_uri=${encodeURIComponent('http://localhost:5173/oauth2/redirect')}`;
};

export const initiateOAuthLogin = (provider: 'google' | 'github') => {
  const url = getOAuthLoginUrl(provider);
  window.location.href = url;
};

export const handleOAuthCallback = (query: string): { token?: string; userId?: string; error?: string } => {
  const params = new URLSearchParams(query);
  
  if (params.has('error')) {
    return { error: params.get('error') || 'Authentication failed' };
  }
  
  if (params.has('token')) {
    const token = params.get('token') as string;
    const userId = params.get('userId') as string;
    
    localStorage.setItem('token', token);
    if (userId) {
      localStorage.setItem('userId', userId);
      console.log('User ID stored in localStorage:', userId);
    } else {
      console.warn('No user ID received from OAuth callback');
    }
    
    return { token, userId };
  }
  
  return { error: 'Invalid response' };
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('skillnet_user');
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    
    const data = response.data as { 
      success: boolean; 
      token: string; 
      user: User; 
      message?: string 
    };
    
    if (data && data.success) {
      const token = data.token;
      const user = data.user;
      
      localStorage.setItem('token', token);
      if (user && user.id) {
        localStorage.setItem('userId', user.id);
        console.log('User ID stored in localStorage during login:', user.id);
      }
      
      return { success: true, user };
    } else {
      return { success: false, error: data?.message || 'Login failed' };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'An error occurred during login' 
    };
  }
}; 