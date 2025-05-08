import axios from './axiosConfig';
import { getStoredUserData } from '../../utils/userUtils';

// API response types matching backend structures
export interface UserProfileApiResponse {
  id: string;
  userId: string;
  bio?: string;
  profilePictureUrl?: string;
  fullName?: string;
}

/**
 * Get a user's profile by their user ID
 * @param userId The ID of the user to fetch the profile for
 * @returns User profile data or null if there was an error
 */
export const getUserProfile = async (userId: string): Promise<UserProfileApiResponse | null> => {
  try {
    // Always check localStorage first for immediate data (local-first approach)
    const storedUser = getStoredUserData();
    let localData: UserProfileApiResponse | null = null;
    
    // If we have matching local data, prepare it for possible use
    if (storedUser && 
        (storedUser.id === userId || 
         storedUser.username?.toLowerCase() === userId.toLowerCase() || 
         storedUser.name?.toLowerCase() === userId.toLowerCase())) {
      
      localData = {
        id: storedUser.id,
        userId: storedUser.id,
        fullName: storedUser.name,
        bio: storedUser.bio || '',
        profilePictureUrl: storedUser.profilePictureUrl
      };
      
      // If we don't have a token, just return the local data immediately without attempting an API call
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Using stored user data only - no token available');
        return localData;
      }
    }
    
    // Check if we have a token before attempting any API call
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token - skipping API call completely');
      
      // If we have local data for this user, use it
      if (localData) {
        return localData;
      }
      
      // Otherwise, return a minimal profile with just the ID/username
      return {
        id: userId,
        userId: userId,
        fullName: userId,
        bio: '',
        profilePictureUrl: ''
      };
    }
    
    try {
      // Make sure we're not sending a user ID with spaces or special characters
      const sanitizedUserId = encodeURIComponent(userId.trim());
      
      // The path should match exactly what the backend expects
      const response = await axios.get(`/users/${sanitizedUserId}/profile`, {
        timeout: 8000, // Add timeout to prevent hanging on redirect
      });
      
      if (response.data) {
        return response.data as UserProfileApiResponse;
      }
    } catch (apiError: any) {
      // If API call fails and we have local data, use it
      if (localData) {
        console.log('API call failed, using local data instead:', apiError?.message);
        return localData;
      }
      
      // Otherwise, re-throw for the outer catch
      throw apiError;
    }
    
    // If API returned no data but we have local data, use it
    if (localData) {
      console.log('API returned no data, using local data instead');
      return localData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Final fallback to localStorage
    const storedUser = getStoredUserData();
    if (storedUser && 
        (storedUser.id === userId || 
         storedUser.username?.toLowerCase() === userId.toLowerCase() || 
         storedUser.name?.toLowerCase() === userId.toLowerCase())) {
      console.log('Fallback to localStorage data after API error');
      return {
        id: storedUser.id,
        userId: storedUser.id,
        fullName: storedUser.name,
        bio: storedUser.bio || '',
        profilePictureUrl: storedUser.profilePictureUrl
      };
    }
    
    // If all else fails, return minimal data
    return {
      id: userId,
      userId: userId,
      fullName: userId,
      bio: '',
      profilePictureUrl: ''
    };
  }
};

/**
 * Get the current user's profile
 * @returns The current user's profile or null if there was an error
 */
export const getCurrentUserProfile = async (): Promise<UserProfileApiResponse | null> => {
  try {
    const storedUser = getStoredUserData();
    if (!storedUser || !storedUser.id) {
      console.warn('No stored user data found.');
      return null;
    }
    
    return await getUserProfile(storedUser.id);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
};

/**
 * Update a user's profile
 * @param userId The ID of the user to update the profile for
 * @param profileData The profile data to update
 * @returns The updated profile or null if there was an error
 */
export const updateUserProfile = async (
  userId: string,
  profileData: {
    bio?: string;
    profilePictureUrl?: string;
    fullName?: string;
  }
): Promise<UserProfileApiResponse | null> => {
  // Always update localStorage first for immediate feedback
  const storedUser = getStoredUserData();
  let localData: UserProfileApiResponse | null = null;
  
  if (storedUser && storedUser.id === userId) {
    // Update localStorage first (optimistic update)
    const updatedUser = {
      ...storedUser,
      name: profileData.fullName || storedUser.name,
      bio: profileData.bio || storedUser.bio,
      profilePictureUrl: profileData.profilePictureUrl || storedUser.profilePictureUrl
    };
    
    localStorage.setItem('skillnet_user', JSON.stringify(updatedUser));
    
    // Create local data response
    localData = {
      id: storedUser.id,
      userId: storedUser.id,
      fullName: updatedUser.name,
      bio: updatedUser.bio || '',
      profilePictureUrl: updatedUser.profilePictureUrl
    };
    
    // If there's no token, just return the local data
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Updating local storage only.');
      return localData;
    }
  } else {
    // If we don't have a matching stored user, check auth
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Cannot update profile.');
      return null;
    }
  }
  
  try {
    // Make sure we're not sending a user ID with spaces or special characters
    const sanitizedUserId = encodeURIComponent(userId.trim());
    
    // Try the API update
    const response = await axios.put(`/users/${sanitizedUserId}/profile`, profileData, {
      timeout: 8000 // Add timeout to prevent hanging
    });
    
    if (response.data) {
      return response.data as UserProfileApiResponse;
    }
    
    // If API returns no data but we updated localStorage, return that
    if (localData) {
      console.log('API returned no data, but localStorage was updated');
      return localData;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    // If we at least updated localStorage, consider it a partial success
    if (localData) {
      console.log('API update failed, but localStorage was updated');
      return localData;
    }
    
    return null;
  }
}; 