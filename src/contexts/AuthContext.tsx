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
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (provider: 'google' | 'github') => void;
  loginWithCredentials: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
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

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Function to load the current user
  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      
      if (userData) {
        console.log("User data loaded:", userData);
        setUser(userData);
      } else {
        console.log("No user data found");
        // Create a temporary user based on token presence
        // This ensures the user stays logged in even if API fails
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (token) {
          console.log("Token found, creating temp user");
          setUser({
            id: userId || 'temp-id',
            name: 'User',
            email: 'user@example.com'
          });
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
      
      // Even if API fails, keep user logged in if token exists
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token) {
        console.log("API error but token found, creating temp user");
        setUser({
          id: userId || 'temp-id',
          name: 'User',
          email: 'user@example.com'
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Regular login with email and password
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await regularLogin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log("Regular login successful, user set:", result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error during regular login:", error);
      return { success: false, error: "Login failed" };
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Check for auth token on load
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Token found at startup, loading user");
      loadUser();
    } else {
      console.log("No token found at startup");
      setLoading(false);
    }
    
    // Listen for OAuth callback messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data && event.data.type === 'oauth_callback') {
        const { token, error } = event.data;
        if (token) {
          handleAuthCallback(token);
        } else if (error) {
          console.error('OAuth error:', error);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  const login = (provider: 'google' | 'github') => {
    // Open OAuth popup window
    initiateOAuthLogin(provider);
  };
  
  const logout = () => {
    console.log("Logging out user");
    authLogout();
    setUser(null);
  };
  
  const handleAuthCallback = async (token: string, userId?: string) => {
    try {
      console.log("Token received in handleAuthCallback:", token ? "Valid token" : "No token");
      console.log("User ID received in handleAuthCallback:", userId || "No user ID");
      
      localStorage.setItem('token', token);
      
      // Store the userId in localStorage if provided
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      
      // Create a temporary user immediately to maintain auth state
      if (!user) {
        setUser({
          id: userId || 'temp-id',
          name: 'Loading...',
          email: 'loading@example.com',
          username: 'Loading...'
        });
      }
      
      console.log("Attempting to load user profile with token");
      const userData = await getCurrentUser();
      console.log("User profile loaded:", userData ? "Success" : "Failed");
      
      if (userData) {
        setUser(userData);
        // Also update the userId in localStorage with the real user ID from userData
        localStorage.setItem('userId', userData.id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error in handleAuthCallback:", error);
      // Even if there's an error loading the user profile, keep the token
      // This allows protected routes to still work
      setLoading(false);
    }
  };
  
  const removeAuthToken = () => {
    console.log("Removing auth token and user ID from localStorage");
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };
  
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log("Checking auth status, token exists:", !!token);
    
    if (!token) {
      console.log("No token found, user not authenticated");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Token found, attempting to load user profile");
      const userData = await getCurrentUser();
      console.log("User profile loaded:", userData ? "Success" : "Failed");
      
      if (userData) {
        setUser(userData);
      } else {
        console.log("No user data returned despite valid token, clearing token");
        removeAuthToken();
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      removeAuthToken();
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effect to check authentication status on component mount
  useEffect(() => {
    console.log("Auth context mounted, checking authentication");
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