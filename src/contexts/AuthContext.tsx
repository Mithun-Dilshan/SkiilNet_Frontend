import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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
  user: User | null;
  loading: boolean;
  login: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
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

// Mock OAuth implementation
const mockOAuthLogin = async (provider: 'google' | 'facebook'): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  return {
    id: '1',
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@example.com',
    profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'Science enthusiast and math teacher passionate about helping others learn!'
  };
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for saved auth state on load
    const savedUser = localStorage.getItem('skillnet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  
  const login = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      const user = await mockOAuthLogin(provider);
      setUser(user);
      localStorage.setItem('skillnet_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillnet_user');
  };
  
  const value = {
    user,
    loading,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};