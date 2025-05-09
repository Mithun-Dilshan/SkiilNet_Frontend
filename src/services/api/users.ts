import axios from './axiosConfig';
import { getStoredUserData } from '../../utils/userUtils';

export interface UserProfileApiResponse {
  id?: string;
  userId: string;
  bio?: string;
  profilePictureUrl?: string;
  fullName?: string;
  name?: string;
  email?: string;
  username?: string;
  totalPosts?: number;
  totalLikes?: number;
  totalComments?: number;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  following?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfileApiResponse | null> => {
  try {
    const storedUser = getStoredUserData();
    let localData: UserProfileApiResponse | null = null;
    
    console.log(`Attempting to get profile for user ID: ${userId}`);
    
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
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Using stored user data only - no token available');
        return localData;
      }
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token - skipping API call completely');
      
      if (localData) {
        return localData;
      }
      
      return {
        id: userId,
        userId: userId,
        fullName: userId,
        bio: '',
        profilePictureUrl: ''
      };
    }
    
    let apiUserId = userId;
    
    if (!userId.match(/^[0-9a-f]{24}$/i) && storedUser?.id?.match(/^[0-9a-f]{24}$/i) && 
        (storedUser.name.toLowerCase() === userId.toLowerCase() || 
         storedUser.username.toLowerCase() === userId.toLowerCase())) {
      console.log(`Converting name/username to MongoDB ID: ${storedUser.id}`);
      apiUserId = storedUser.id;
    }
    
    try {
      const sanitizedUserId = encodeURIComponent(apiUserId.trim());
      
      console.log(`Making API call to: /users/${sanitizedUserId}/profile`);
      
      const response = await axios.get(`/users/${sanitizedUserId}/profile`, {
        timeout: 10000,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      if (response.data) {
        console.log(`API returned profile data:`, response.data);
        return response.data as UserProfileApiResponse;
      }
    } catch (apiError: any) {
      if (apiError.response && apiError.response.status === 302) {
        console.error('Redirect to OAuth detected - using local data instead');
        if (localData) {
          return localData;
        }
      }
      
      if (localData) {
        console.log('API call failed, using local data instead:', apiError?.message);
        return localData;
      }
      
      throw apiError;
    }
    
    if (localData) {
      console.log('API returned no data, using local data instead');
      return localData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
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
    
    return {
      id: userId,
      userId: userId,
      fullName: userId,
      bio: '',
      profilePictureUrl: ''
    };
  }
};

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

export const getAllUsers = async (): Promise<UserProfileApiResponse[]> => {
  try {
    console.log('Fetching all users');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token - returning empty list');
      return [];
    }
    
    const storedUser = getStoredUserData();
    const currentUserId = storedUser?.id || '';
    
    const url = currentUserId ? `/users?currentUserId=${currentUserId}` : '/users';
    
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`API returned ${response.data.length} users`);
      const users = response.data as UserProfileApiResponse[];
      
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
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('Request timed out, retrying without currentUserId...');
      try {
        const retryResponse = await axios.get('/users', {
          timeout: 10000,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        
        if (retryResponse.data && Array.isArray(retryResponse.data)) {
          console.log(`Retry API call returned ${retryResponse.data.length} users`);
          const users = retryResponse.data as UserProfileApiResponse[];
          
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

export const followUser = async (userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    console.log(`Attempting to follow user: ${userId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Cannot follow user.');
      return {success: false, message: 'No authentication token found'};
    }
    
    const storedUser = getStoredUserData();
    if (!storedUser || !storedUser.id) {
      console.warn('No current user found. Cannot follow user.');
      return {success: false, message: 'No current user found'};
    }
    
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

export const unfollowUser = async (userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    console.log(`Attempting to unfollow user: ${userId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Cannot unfollow user.');
      return {success: false, message: 'No authentication token found'};
    }
    
    const storedUser = getStoredUserData();
    if (!storedUser || !storedUser.id) {
      console.warn('No current user found. Cannot unfollow user.');
      return {success: false, message: 'No current user found'};
    }
    
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

export const updateUserProfile = async (
  userId: string,
  profileData: {
    bio?: string;
    profilePictureUrl?: string;
    fullName?: string;
  }
): Promise<UserProfileApiResponse | null> => {
  console.log(`Attempting to update profile for user ID: ${userId}`);
  
  const storedUser = getStoredUserData();
  let localData: UserProfileApiResponse | null = null;
  
  if (storedUser && 
      (storedUser.id === userId || 
       storedUser.username?.toLowerCase() === userId.toLowerCase() || 
       storedUser.name?.toLowerCase() === userId.toLowerCase())) {
    console.log(`Found matching stored user data for update: ${userId}`);
    
    const updatedUser = {
      ...storedUser,
      name: profileData.fullName || storedUser.name,
      bio: profileData.bio || storedUser.bio,
      profilePictureUrl: profileData.profilePictureUrl || storedUser.profilePictureUrl
    };
    
    localStorage.setItem('skillnet_user', JSON.stringify(updatedUser));
    console.log(`Updated localStorage with new data`);
    
    localData = {
      id: storedUser.id,
      userId: storedUser.id,
      fullName: updatedUser.name,
      bio: updatedUser.bio || '',
      profilePictureUrl: updatedUser.profilePictureUrl
    };
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Updating local storage only.');
      return localData;
    }
  } else {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Cannot update profile.');
      return null;
    }
  }
  
  try {
    const sanitizedUserId = encodeURIComponent(userId.trim());
    
    console.log(`Making API update call to: /users/${sanitizedUserId}/profile`);
    const response = await axios.put(`/users/${sanitizedUserId}/profile`, profileData, {
      timeout: 10000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (response.data) {
      console.log(`API update successful:`, response.data);
      return response.data as UserProfileApiResponse;
    }
    
    if (localData) {
      console.log('API returned no data, but localStorage was updated');
      return localData;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    if (localData) {
      console.log('API update failed, but localStorage was updated');
      return localData;
    }
    
    return null;
  }
};

export const getUserProfileWithStatus = async (
  userId: string,
  currentUserId: string
): Promise<UserProfileApiResponse | null> => {
  try {
    console.log(`Getting profile with follow status for user: ${userId}`);
    
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
      
      const profileData = response.data as UserProfileApiResponse;
      
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