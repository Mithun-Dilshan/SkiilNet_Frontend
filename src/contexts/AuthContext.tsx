import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Types
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name: string;
    bio: string;
    profilePicture: File | null;
    skills: string[];
  }) => Promise<void>;
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
    bio: 'Science enthusiast and math teacher passionate about helping others learn!',
    skills: ['Maths', 'Science']
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
  
  const updateProfile = async (data: {
    name: string;
    bio: string;
    profilePicture: File | null;
    skills: string[];
  }) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user state with new data
      const updatedUser = {
        ...user!,
        name: data.name,
        bio: data.bio,
        skills: data.skills,
        // In a real app, we'd upload the image and get a URL back
        profilePicture: data.profilePicture 
          ? URL.createObjectURL(data.profilePicture)
          : user?.profilePicture
      };
      
      setUser(updatedUser);
      localStorage.setItem('skillnet_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};