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
        
        // Store the complete user data in localStorage
        localStorage.setItem('skillnet_user', JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          profilePictureUrl: userData.profilePictureUrl
        }));
      } else {
        console.log("No user data found from API");
        // Check for stored user data in localStorage
        const storedUser = localStorage.getItem('skillnet_user');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Using stored user data from localStorage:", parsedUser.id);
            setUser(parsedUser as AuthUser);
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            // Create a temporary user if token exists
            if (token) {
              console.log("Token found, creating temp user");
              setUser({
                id: userId || 'temp-id',
                name: 'User',
                email: 'user@example.com',
                username: userId || 'user'
              });
            } else {
              setUser(null);
            }
          }
        } else if (token) {
          // Create a temporary user if token exists but no stored user data
          console.log("Token found, creating temp user");
          setUser({
            id: userId || 'temp-id',
            name: 'User',
            email: 'user@example.com',
            username: userId || 'user'
          });
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
      
      // Check for stored user data in localStorage if API call fails
      const storedUser = localStorage.getItem('skillnet_user');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Using stored user data after API error:", parsedUser.id);
          setUser(parsedUser as AuthUser);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // Create a temporary user if token exists
          if (token) {
            console.log("API error but token found, creating temp user");
            setUser({
              id: userId || 'temp-id',
              name: 'User',
              email: 'user@example.com',
              username: userId || 'user'
            });
          } else {
            setUser(null);
          }
        }
      } else if (token) {
        // Create a temporary user if token exists but no stored user data
        console.log("API error but token found, creating temp user");
        setUser({
          id: userId || 'temp-id',
          name: 'User',
          email: 'user@example.com',
          username: userId || 'user'
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
        
        // Store complete user data in localStorage
        localStorage.setItem('skillnet_user', JSON.stringify({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          username: result.user.username || result.user.email.split('@')[0],
          profilePictureUrl: result.user.profilePictureUrl
        }));
        console.log("User data stored in localStorage during login:", result.user.id);
        
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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('skillnet_user');
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
        console.log("User ID saved to localStorage:", userId);
        
        // Save a minimal user object until we get the full profile
        localStorage.setItem('skillnet_user', JSON.stringify({
          id: userId,
          name: userId,
          email: `${userId.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          username: userId.toLowerCase().replace(/\s+/g, '.'),
        }));
      }
      
      // Create a temporary user immediately to maintain auth state
      if (!user) {
        setUser({
          id: userId || 'temp-id',
          name: userId || 'Loading...',
          email: userId ? `${userId.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'loading@example.com',
          username: userId ? userId.toLowerCase().replace(/\s+/g, '.') : 'Loading...'
        });
      }
      
      console.log("Attempting to load user profile with token");
      const userData = await getCurrentUser();
      console.log("User profile loaded:", userData ? "Success" : "Failed");
      
      if (userData) {
        setUser(userData);
        // Also update the userId in localStorage with the real user ID from userData
        localStorage.setItem('userId', userData.id);
        
        // Store complete user data in localStorage
        localStorage.setItem('skillnet_user', JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          profilePictureUrl: userData.profilePictureUrl
        }));
        console.log("User data stored in localStorage:", userData.id);
      } else if (userId) {
        // If no user data from API but we have userId from params
        console.log("No user data from API, but using userId from params");
        const userObj = {
          id: userId,
          name: userId,
          email: `${userId.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          username: userId.toLowerCase().replace(/\s+/g, '.'),
        };
        setUser(userObj as AuthUser);
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
    localStorage.removeItem('skillnet_user');
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
        // Store complete user data in localStorage
        localStorage.setItem('skillnet_user', JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          profilePictureUrl: userData.profilePictureUrl
        }));
      } else {
        // Check for stored user data in localStorage
        const storedUser = localStorage.getItem('skillnet_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Using stored user data from localStorage:", parsedUser.id);
            setUser(parsedUser as AuthUser);
          } catch (parseError) {
            console.error("Error parsing stored user data:", parseError);
            removeAuthToken();
          }
        } else {
          console.log("No user data returned despite valid token, clearing token");
          removeAuthToken();
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      // Check for stored user data in localStorage if API call fails
      const storedUser = localStorage.getItem('skillnet_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Using stored user data after API error:", parsedUser.id);
          setUser(parsedUser as AuthUser);
        } catch (parseError) {
          console.error("Error parsing stored user data:", parseError);
          removeAuthToken();
        }
      } else {
        removeAuthToken();
      }
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