import { User } from 'lucide-react';
import axios from './axiosConfig';

// Types
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
}

interface UserResponse {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get('users/68184827f4e18f0beb266cc6/profile');
    // Check if the response is empty or not a valid user
    if (!response.data || typeof response.data !== 'object' || Object.keys(response.data as object).length === 0) {
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      return null;
    }
    const userData = response.data as UserResponse;
    const user: User = {
      id: userData.userId || userData.id,
      name: userData.fullName,
      username: userData.username,
      email: userData.email,
      profilePictureUrl: userData.profilePictureUrl,
      bio: userData.bio
    };
    // Store actual user ID in localStorage
    localStorage.setItem('userId', user.id);
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    return null;
  }
};

// Get user by userId
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Check if userId is undefined or empty
    if (!userId) {
      console.warn('getUserById called with undefined or empty userId');
      return null;
    }

    const response = await axios.get(`/users/${userId}/profile`);
    if (!response.data || typeof response.data !== 'object') {
      return null;
    }
    
    const userData = response.data as UserResponse;
    // Transform the response to match User interface
    const user: User = {
      id: userData.userId || userData.id,
      name: userData.fullName,
      username: userData.username,
      email: userData.email,
      profilePictureUrl: userData.profilePictureUrl,
      bio: userData.bio || ''
    };
    
    return user;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
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
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    return { error: params.get('error') || 'Authentication failed' };
  }
  
  if (params.has('token')) {
    const token = params.get('token') as string;
    const userId = params.get('userId') as string;
    
    localStorage.setItem('token', token);
    if (userId) {
      // Store the username as userId
      localStorage.setItem('userId', userId);
      console.log('User ID (username) stored in localStorage:', userId);
    } else {
      console.warn('No user ID received from OAuth callback');
      localStorage.removeItem('userId');
    }
    
    return { token, userId };
  }
  
  localStorage.removeItem('userId');
  localStorage.removeItem('token');
  return { error: 'Invalid response' };
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('skillnet_user');
  console.log('Cleared auth data from localStorage');
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    
    const data = response.data as { 
      success: boolean; 
      token: string; 
      user: UserResponse; 
      message?: string 
    };
    
    if (data && data.success) {
      const token = data.token;
      const userData = data.user;
      const user: User = {
        id: userData.userId || userData.id,
        name: userData.fullName,
        username: userData.username,
        email: userData.email,
        profilePictureUrl: userData.profilePictureUrl,
        bio: userData.bio
      };
      
      localStorage.setItem('token', token);
      if (user) {
        // Store actual user ID
        localStorage.setItem('userId', user.id);
        console.log('User ID stored in localStorage during login:', user.id);
      } else {
        console.warn('No user data received during login');
        localStorage.removeItem('userId');
      }
      
      return { success: true, user };
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      return { success: false, error: data?.message || 'Login failed' };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    return { 
      success: false, 
      error: error.response?.data?.message || 'An error occurred during login' 
    };
  }
};