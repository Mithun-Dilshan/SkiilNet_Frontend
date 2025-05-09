import axios from './axiosConfig';
import { getStoredUserData } from '../../utils/userUtils';

// API response types matching backend structures
export interface UserProfileApiResponse {
  id: string;
  userId: string;
  bio?: string;
  profilePictureUrl?: string;
  fullName?: string;
  // Activity stats
  totalPosts?: number;
  totalLikes?: number;
  totalComments?: number;
  // Follow info
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  following?: boolean;  // Added to match backend response format
  // Activity timestamps
  createdAt?: string;
  lastActiveAt?: string;
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
    
    console.log(`Attempting to get profile for user ID: ${userId}`);
    
    // If we have matching local data, prepare it for possible use
    if (storedUser && 
        (storedUser.id === userId || 
         storedUser.username?.toLowerCase() === userId.toLowerCase() || 
         storedUser.name?.toLowerCase() === userId.toLowerCase())) {
      
      console.log(`Found matching stored user data for ${userId}`);
      
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
    
    // Prefer MongoDB ID format if available
    let apiUserId = userId;
    
    // If userId doesn't look like a MongoDB ID but we have a stored ID that does, use that
    if (!userId.match(/^[0-9a-f]{24}$/i) && storedUser?.id?.match(/^[0-9a-f]{24}$/i) && 
        (storedUser.name.toLowerCase() === userId.toLowerCase() || 
         storedUser.username.toLowerCase() === userId.toLowerCase())) {
      console.log(`Converting name/username to MongoDB ID: ${storedUser.id}`);
      apiUserId = storedUser.id;
    }
    
    try {
      // Make sure we're not sending a user ID with spaces or special characters
      const sanitizedUserId = encodeURIComponent(apiUserId.trim());
      
      // The path should match exactly what the backend expects
      console.log(`Making API call to: /users/${sanitizedUserId}/profile`);
      
      // Set specific axios options to prevent redirect to OAuth
      const response = await axios.get(`/users/${sanitizedUserId}/profile`, {
        timeout: 10000, // Add timeout to prevent hanging
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // Add header to signal this is an AJAX request
        }
      });
      
      if (response.data) {
        console.log(`API returned profile data:`, response.data);
        return response.data as UserProfileApiResponse;
      }
    } catch (apiError: any) {
      // Check if it's a redirect to OAuth
      if (apiError.response && apiError.response.status === 302) {
        console.error('Redirect to OAuth detected - using local data instead');
        if (localData) {
          return localData;
        }
      }
      
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
 * Get all users
 * @returns List of user profiles or empty array if there was an error
 */
export const getAllUsers = async (): Promise<UserProfileApiResponse[]> => {
  try {
    console.log('Fetching all users');
    
    // Check if we have a token before attempting API call
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token - returning empty list');
      return [];
    }
    
    // Get current user ID if available
    const storedUser = getStoredUserData();
    const currentUserId = storedUser?.id || '';
    
    // Add currentUserId as query parameter if available
    const url = currentUserId ? `/users?currentUserId=${currentUserId}` : '/users';
    
    // Increase timeout to 20 seconds
    const response = await axios.get(url, {
      timeout: 20000, // Longer timeout (20 seconds)
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`API returned ${response.data.length} users`);
      const users = response.data as UserProfileApiResponse[];
      
      // Ensure all users have consistent follow status fields
      users.forEach(user => {
        if (typeof user.following === 'boolean' && user.isFollowing === undefined) {
          user.isFollowing = user.following;
        } else if (typeof user.isFollowing === 'boolean' && user.following === undefined) {
          user.following = user.isFollowing;
        }
      });
      
      return users;
    }
    
    return [];
  } catch (error: any) {
    // If we get a timeout error, try again without the currentUserId
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('Request timed out, retrying without currentUserId...');
      try {
        // Retry with a simpler request
        const retryResponse = await axios.get('/users', {
          timeout: 10000,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        
        if (retryResponse.data && Array.isArray(retryResponse.data)) {
          console.log(`Retry API call returned ${retryResponse.data.length} users`);
          const users = retryResponse.data as UserProfileApiResponse[];
          
          // Ensure all users have consistent follow status fields
          users.forEach(user => {
            if (typeof user.following === 'boolean' && user.isFollowing === undefined) {
              user.isFollowing = user.following;
            } else if (typeof user.isFollowing === 'boolean' && user.following === undefined) {
              user.following = user.isFollowing;
            }
          });
          
          return users;
        }
      } catch (retryError) {
        console.error('Retry attempt also failed:', retryError);
      }
    }
    
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Follow a user
 * @param userId The ID of the user to follow
 * @returns Object with success status and any error message
 */
export const followUser = async (userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    console.log(`Attempting to follow user: ${userId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Cannot follow user.');
      return {success: false, message: 'No authentication token found'};
    }
    
    // Get the current user's ID
    const storedUser = getStoredUserData();
    if (!storedUser || !storedUser.id) {
      console.warn('No current user found. Cannot follow user.');
      return {success: false, message: 'No current user found'};
    }
    
    // Call the backend follow endpoint with proper ID
    // Make sure we're using IDs, not usernames
    const followerId = storedUser.id;
    
    console.log(`Making follow request with follower ID: ${followerId} and target ID: ${userId}`);
    
    const response = await axios.post(`/users/${followerId}/follow?targetUserId=${userId}`, null, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (response.status === 200) {
      console.log(`Successfully followed user: ${userId}`);
      return {success: true};
    } else {
      console.error('Follow request failed:', response.data);
      return {success: false, message: 'Server returned an error'};
    }
  } catch (error) {
    console.error('Error following user:', error);
    return {success: false, message: 'Error following user'};
  }
};

/**
 * Unfollow a user
 * @param userId The ID of the user to unfollow
 * @returns Object with success status and any error message
 */
export const unfollowUser = async (userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    console.log(`Attempting to unfollow user: ${userId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Cannot unfollow user.');
      return {success: false, message: 'No authentication token found'};
    }
    
    // Get the current user's ID
    const storedUser = getStoredUserData();
    if (!storedUser || !storedUser.id) {
      console.warn('No current user found. Cannot unfollow user.');
      return {success: false, message: 'No current user found'};
    }
    
    // Use proper IDs for both follower and target
    const followerId = storedUser.id;
    
    console.log(`Making unfollow request with follower ID: ${followerId} and target ID: ${userId}`);
    
    const response = await axios.post(`/users/${followerId}/unfollow?targetUserId=${userId}`, null, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (response.status === 200) {
      console.log(`Successfully unfollowed user: ${userId}`);
      return {success: true};
    } else {
      console.error('Unfollow request failed:', response.data);
      return {success: false, message: 'Server returned an error'};
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return {success: false, message: 'Error unfollowing user'};
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
  console.log(`Attempting to update profile for user ID: ${userId}`);
  
  // Always update localStorage first for immediate feedback
  const storedUser = getStoredUserData();
  let localData: UserProfileApiResponse | null = null;
  
  if (storedUser && 
      (storedUser.id === userId || 
       storedUser.username?.toLowerCase() === userId.toLowerCase() || 
       storedUser.name?.toLowerCase() === userId.toLowerCase())) {
    console.log(`Found matching stored user data for update: ${userId}`);
    
    // Update localStorage first (optimistic update)
    const updatedUser = {
      ...storedUser,
      name: profileData.fullName || storedUser.name,
      bio: profileData.bio || storedUser.bio,
      profilePictureUrl: profileData.profilePictureUrl || storedUser.profilePictureUrl
    };
    
    localStorage.setItem('skillnet_user', JSON.stringify(updatedUser));
    console.log(`Updated localStorage with new data`);
    
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
    console.log(`Making API update call to: /users/${sanitizedUserId}/profile`);
    const response = await axios.put(`/users/${sanitizedUserId}/profile`, profileData, {
      timeout: 10000, // Add timeout to prevent hanging
      headers: {
        'X-Requested-With': 'XMLHttpRequest', // Add header to signal this is an AJAX request
      }
    });
    
    if (response.data) {
      console.log(`API update successful:`, response.data);
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

/**
 * Get a user's profile with follow status information
 * @param userId The ID of the user to fetch the profile for
 * @param currentUserId The ID of the current user (to check follow status)
 * @returns User profile data with follow status or null if there was an error
 */
export const getUserProfileWithStatus = async (
  userId: string,
  currentUserId: string
): Promise<UserProfileApiResponse | null> => {
  try {
    console.log(`Getting profile with follow status for user: ${userId}`);
    
    // Check if we have a token before attempting API call
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token - skipping API call');
      return null;
    }
    
    const response = await axios.get(`/users/${userId}/profile-with-status?currentUserId=${currentUserId}`, {
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (response.data) {
      console.log(`Received profile with follow status:`, response.data);
      
      // Ensure consistent field naming by mapping backend fields to our interface
      const profileData = response.data as UserProfileApiResponse;
      
      // Make sure both fields are set - this ensures compatibility with any component
      // using either isFollowing or following field
      if (typeof profileData.following === 'boolean' && profileData.isFollowing === undefined) {
        profileData.isFollowing = profileData.following;
      } else if (typeof profileData.isFollowing === 'boolean' && profileData.following === undefined) {
        profileData.following = profileData.isFollowing;
      }
      
      return profileData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile with status:', error);
    return null;
  }
}; 