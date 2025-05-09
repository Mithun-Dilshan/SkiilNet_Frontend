import axios from './axiosConfig';

// Types
export interface UserProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  profilePictureUrl?: string;
  bio?: string;
  createdAt?: string;
  lastActiveAt?: string;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
  oauthProvider?: string;
  oauthId?: string;
  userProfile?: UserProfile;
  followers?: string[];
  following?: string[];
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Use the correct OAuth2 endpoint, which may be different from the regular API paths
    const response = await axios.get('/oauth2/user', {
      baseURL: 'http://localhost:8080/api' // Explicitly set base URL
    });
    
    // Log the raw response data for debugging
    console.log('getCurrentUser raw response:', response.data);
    
    // Check if the response is empty or not a valid user
    if (!response.data || typeof response.data !== 'object' || Object.keys(response.data as object).length === 0) {
      console.log('getCurrentUser received empty or invalid response');
      return null;
    }
    
    const userData = response.data as User;
    console.log('getCurrentUser processed user data:', userData);
    
    // Save the complete user data to localStorage to ensure it's always up-to-date
    if (userData && userData.id) {
      localStorage.setItem('skillnet_user', JSON.stringify(userData));
      console.log('Updated user data in localStorage from API call');
    }
    
    return userData;
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
    const encodedUserId = params.get('userId');
    const encodedUserName = params.get('userName');
    const userId = encodedUserId ? decodeURIComponent(encodedUserId) : undefined;
    const userName = encodedUserName ? decodeURIComponent(encodedUserName) : userId;
    
    console.log('OAuth callback received:', { token, userId, userName });
    
    localStorage.setItem('token', token);
    if (userId) {
      localStorage.setItem('userId', userId);
      console.log('User ID stored in localStorage:', userId);
      
      const userData: Record<string, any> = {
        id: userId,
        name: userName || userId, 
        email: params.get('email') || `${(userName || userId).toLowerCase().replace(/\s+/g, '.')}@example.com`,
        username: params.get('username') || (userName || userId).toLowerCase().replace(/\s+/g, '.'),
      };
      
      if (params.has('profilePictureUrl')) {
        const encodedPictureUrl = params.get('profilePictureUrl');
        userData.profilePictureUrl = encodedPictureUrl ? decodeURIComponent(encodedPictureUrl) : undefined;
      }
      
      params.forEach((value, key) => {
        if (!['token', 'userId', 'userName', 'profilePictureUrl', 'email'].includes(key)) {
          userData[key] = value;
        }
      });
      
      localStorage.setItem('skillnet_user', JSON.stringify(userData));
      console.log('Complete user data stored in localStorage from OAuth callback:', userData);
      
      setTimeout(async () => {
        try {
          const apiUserData = await getUserById(userId);
          if (apiUserData) {
            console.log('Fetched complete user data by ID after OAuth callback:', apiUserData);
          } else {
            console.warn('Failed to get user data by ID, attempting getCurrentUser...');
            const oauthUserData = await getCurrentUser();
            console.log('Fetched user data via getCurrentUser after OAuth callback:', oauthUserData);
          }
        } catch (error) {
          console.error('Failed to fetch additional user data after OAuth callback:', error);
        }
      }, 500); 
    } else {
      console.warn('No user ID received from OAuth callback');
    }
    
    return { token, userId };
  }
  
  return { error: 'Invalid response' };
};

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
        
        // Store ALL user data in localStorage
        localStorage.setItem('skillnet_user', JSON.stringify(user));
        console.log('Complete user data stored in localStorage during login:', user.id);
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

export const getUserById = async (userId: string): Promise<User | null> => {
  if (!userId) {
    console.error('Cannot fetch user: No user ID provided');
    return null;
  }

  try {
    console.log(`Fetching user data for ID: ${userId}`);
    
    const response = await axios.get(`/users/${userId}`);
    
    console.log('getUserById raw response:', response.data);
    
    if (!response.data || typeof response.data !== 'object' || Object.keys(response.data as object).length === 0) {
      console.log('getUserById received empty or invalid response');
      return null;
    }
    
    const userData = response.data as Record<string, any>;
    
    const user: User = {
      id: userData.id || userId,
      name: userData.name || '',
      email: userData.email || '',
      username: userData.username || 
                (userData.email ? userData.email.split('@')[0] : '') || 
                (userData.name ? userData.name.toLowerCase().replace(/\s+/g, '.') : userId),
      profilePictureUrl: userData.profilePictureUrl || 
                        (userData.userProfile ? userData.userProfile.profilePictureUrl : undefined),
      bio: userData.bio || (userData.userProfile ? userData.userProfile.bio : undefined),
      oauthProvider: userData.oauthProvider,
      oauthId: userData.oauthId,
      userProfile: userData.userProfile,
      followers: userData.followers || [],
      following: userData.following || []
    };
    
    console.log('getUserById processed user data:', user);
    
    if (user && user.id) {
      localStorage.setItem('skillnet_user', JSON.stringify(user));
      console.log('Updated user data in localStorage from getUserById');
    }
    
    return user;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    return null;
  }
}; 