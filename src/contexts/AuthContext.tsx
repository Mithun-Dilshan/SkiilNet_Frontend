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
  error: string | null;
  login: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    bio?: string;
    profilePicture?: File | null;
    skills?: string[];
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
    id: '9396b756-d8ac-4883-9266-3a51c1054b3e', // Using the same ID from your sample code
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
  const [error, setError] = useState<string | null>(null);
  
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
      setError(null);
      const user = await mockOAuthLogin(provider);
      setUser(user);
      localStorage.setItem('skillnet_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to login. Please try again.');
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
    name?: string;
    bio?: string;
    profilePicture?: File | null;
    skills?: string[];
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user state with new data
      const updatedUser = {
        ...user,
        name: data.name || user.name,
        bio: data.bio || user.bio,
        skills: data.skills || user.skills,
        // In a real app, we'd upload the image and get a URL back
        profilePicture: data.profilePicture 
          ? URL.createObjectURL(data.profilePicture)
          : user.profilePicture
      };
      
      setUser(updatedUser);
      localStorage.setItem('skillnet_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};