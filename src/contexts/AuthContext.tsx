// contexts/AuthProvider.tsx
import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import {
  User as AuthUser,
  getCurrentUser,
  initiateOAuthLogin,
  login as regularLogin,
  logout as authLogout
} from '../services/api/auth';

// Types
export type User = {
  id: string;
  name: string;
  username?: string;
  email: string;
  profilePicture?: string;
  bio?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (provider: 'google' | 'github') => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  handleAuthCallback: (token: string, userId?: string) => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Map AuthUser to User
const mapToUser = (userData: AuthUser): User => ({
  id: userData.id,
  name: userData.name,
  username: userData.username,
  email: userData.email,
  profilePicture: userData.profilePictureUrl, // Map profilePictureUrl to profilePicture
  bio: userData.bio
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();

      if (userData) {
        console.log('User data loaded:', userData);
        setUser(mapToUser(userData));
      } else {
        console.log('No user data found');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (token) {
          console.log('Token found, creating temp user');
          setUser({
            id: userId || 'temp-id',
            name: 'User',
            email: 'user@example.com',
            username: 'user',
            profilePicture: undefined,
            bio: undefined
          });
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token) {
        console.log('API error but token found, creating temp user');
        setUser({
          id: userId || 'temp-id',
          name: 'User',
          email: 'user@example.com',
          username: 'user',
          profilePicture: undefined,
          bio: undefined
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await regularLogin(email, password);

      if (result.success && result.user) {
        setUser(mapToUser(result.user));
        console.log('Regular login successful, user set:', result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error during regular login:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const login = (provider: 'google' | 'github') => {
    initiateOAuthLogin(provider);
  };

  const logout = () => {
    console.log('Logging out user');
    authLogout();
    setUser(null);
  };

  const handleAuthCallback = async (token: string, userId?: string) => {
    try {
      console.log('Token received in handleAuthCallback:', token ? 'Valid token' : 'No token');
      console.log('User ID received in handleAuthCallback:', userId || 'No user ID');

      localStorage.setItem('token', token);
      if (userId) {
        localStorage.setItem('userId', userId);
      }

      if (!user) {
        setUser({
          id: userId || 'temp-id',
          name: 'Loading...',
          email: 'loading@example.com',
          username: 'loading',
          profilePicture: undefined,
          bio: undefined
        });
      }

      console.log('Attempting to load user profile with token');
      const userData = await getCurrentUser();
      console.log('User profile loaded:', userData ? 'Success' : 'Failed');

      if (userData) {
        setUser(mapToUser(userData));
        localStorage.setItem('userId', userData.id);
      } else {
        console.warn('No user data loaded, keeping temporary user');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in handleAuthCallback:', error);
      setLoading(false);
    }
  };

  const removeAuthToken = () => {
    console.log('Removing auth token and user ID from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('Checking auth status, token exists:', !!token);

    if (!token) {
 
      console.log('No token found, user not authenticated');
      setLoading(false);
      return;
    }

    try {
      console.log('Token found, attempting to load user profile');
      const userData = await getCurrentUser();
      console.log('User profile loaded:', userData ? 'Success' : 'Failed');

      if (userData) {
        setUser(mapToUser(userData));
      } else {
        console.log('No user data returned despite valid token, clearing token');
        removeAuthToken();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      removeAuthToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Auth context mounted, checking authentication');
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    login,
    loginWithCredentials,
    logout,
    handleAuthCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};