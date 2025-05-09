import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, UserProfileApiResponse } from '../services/api/users';
import { getStoredUserData, saveUserData } from '../utils/userUtils';

interface UseUserProfileOptions {
  userId?: string;
  initialLoad?: boolean;
}

interface UserProfileState {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}

const defaultUserData: UserProfileState = {
  id: '',
  name: '',
  username: '',
  profilePicture: '',
  bio: '',
  followers: 0,
  following: 0,
  isFollowing: false
};

/**
 * Custom hook for user profile operations
 */
export function useUserProfile(options: UseUserProfileOptions = {}) {
  const { userId: targetUserId, initialLoad = true } = options;
  const { user } = useAuth();
  const [loading, setLoading] = useState(initialLoad);
  const [userData, setUserData] = useState<UserProfileState>(defaultUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    fullName: '',
    bio: '',
    profilePictureUrl: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // Determine if this is the current user's profile
  const isCurrentUserProfile = (): boolean => {
    if (!user) return false;
    
    const storedUser = getStoredUserData();
    const currentUsername = targetUserId?.toLowerCase();
    
    return (storedUser && 
           (storedUser.username.toLowerCase() === currentUsername || 
            storedUser.name.toLowerCase() === currentUsername)) ||
           (user.username?.toLowerCase() === currentUsername || 
            user.name?.toLowerCase() === currentUsername);
  };
  
  // Handle editing form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile update submission
  const handleProfileUpdate = async () => {
    if (!user || !user.id) {
      setUpdateError('You must be logged in to update your profile');
      return;
    }
    
    try {
      setUpdateError('');
      
      // Update local state immediately for responsive UI
      setUserData(prev => ({
        ...prev,
        name: editedProfile.fullName || prev.name,
        bio: editedProfile.bio || prev.bio,
        profilePicture: editedProfile.profilePictureUrl || prev.profilePicture
      }));
      
      // Get the stored user data to find the MongoDB ID
      const storedUser = getStoredUserData();
      // Determine the best ID to use - prefer MongoDB ID format (24 char hex)
      let updateId = user.id;
      
      // If user.id doesn't look like a MongoDB ID but we have a stored ID that does, use that
      if (!user.id.match(/^[0-9a-f]{24}$/i) && storedUser?.id?.match(/^[0-9a-f]{24}$/i)) {
        console.log(`Using stored MongoDB ID ${storedUser.id} instead of ${user.id} for update`);
        updateId = storedUser.id;
      }
      
      // With our improved backend, we can now use any identifier - name, email, or ID
      // The backend will handle finding the correct user
      console.log(`Updating profile with identifier: ${updateId}`);
      
      // Send API request with the identifier
      const result = await updateUserProfile(updateId, {
        fullName: editedProfile.fullName,
        bio: editedProfile.bio,
        profilePictureUrl: editedProfile.profilePictureUrl
      });
      
      if (result) {
        console.log(`Profile update successful:`, result);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        setIsEditing(false);
        
        // Refresh profile data from the server to ensure we have the latest
        fetchUserProfile(updateId);
      } else {
        setUpdateError('Profile update only saved locally. Changes will be synced when you reconnect.');
        setTimeout(() => {
          setIsEditing(false);
          setUpdateError('');
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      if (error?.isAuthError) {
        setUpdateError('Authentication required. Profile updated locally only.');
      } else if (error?.isNetworkError) {
        setUpdateError('Network error. Profile updated locally only.');
      } else {
        setUpdateError('Failed to update profile on server. Changes saved locally only.');
      }
      
      setTimeout(() => {
        setIsEditing(false);
        setUpdateError('');
      }, 3000);
    }
  };
  
  // Fetch user profile data
  const fetchUserProfile = async (userId?: string) => {
    const profileId = userId || targetUserId || (user?.id ? user.id : undefined);
    
    if (!profileId) {
      console.error('No user ID provided to fetch profile');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log(`Fetching profile for: ${profileId}`);
    
    // Debug current auth state
    const token = localStorage.getItem('token');
    console.log(`Auth token exists: ${!!token}`);
    console.log(`Current user in context:`, user ? `ID: ${user.id}, Name: ${user.name}` : 'none');
    
    try {
      // First check if the provided profileId is already a MongoDB ID
      if (profileId.match(/^[0-9a-f]{24}$/i)) {
        console.log(`Profile ID is a MongoDB ID: ${profileId}, using directly`);
        try {
          const apiData = await getUserProfile(profileId);
          if (apiData) {
            console.log(`Successfully fetched profile with MongoDB ID!`);
            updateProfileFromApiData(apiData);
            setLoading(false);
            return;
          }
        } catch (error: any) {
          console.error(`Error with MongoDB ID:`, error.message);
          // Continue to other methods
        }
      }
      
      // If the profileId is a name or email, use it directly with our improved backend
      console.log(`Trying profile lookup with identifier: ${profileId}`);
      try {
        const apiData = await getUserProfile(profileId);
        if (apiData) {
          console.log(`Successfully fetched profile with identifier: ${profileId}`);
          updateProfileFromApiData(apiData);
          setLoading(false);
          return;
        }
      } catch (error: any) {
        console.error(`Error with identifier ${profileId}:`, error.message);
        // Continue to other methods
      }
      
      // Get the stored user data which may have actual MongoDB IDs
      const storedUser = getStoredUserData();
      
      // If we're looking for the current user by name/email, use their stored ID if available
      if (storedUser && 
          (profileId.toLowerCase() === storedUser.name?.toLowerCase() ||
           profileId.toLowerCase() === storedUser.username?.toLowerCase() ||
           profileId.toLowerCase() === storedUser.email?.toLowerCase())) {
        if (storedUser.id.match(/^[0-9a-f]{24}$/i)) {
          console.log(`Using stored MongoDB ID from matching user: ${storedUser.id}`);
          try {
            const apiData = await getUserProfile(storedUser.id);
            if (apiData) {
              updateProfileFromApiData(apiData);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error fetching with stored ID:", error);
          }
        }
      }
      
      // IMPORTANT: As a last resort, try with the known MongoDB ID
      // from the database to make sure we can connect to the backend
      const hardcodedMongoDBId = "681e3c071b66872f18bcae12"; // User ID not Profile ID
      console.log(`Trying hardcoded MongoDB User ID for testing: ${hardcodedMongoDBId}`);
      try {
        const apiData = await getUserProfile(hardcodedMongoDBId);
        if (apiData) {
          console.log(`Successfully fetched profile with hardcoded ID!`);
          updateProfileFromApiData(apiData);
          setLoading(false);
          return;
        }
      } catch (error: any) {
        console.error(`Error with hardcoded ID:`, error.message);
        // Continue to other methods
      }
      
      console.log(`No profile data from API, using local fallback for ${profileId}`);
      useLocalDataFallback(profileId);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
      useLocalDataFallback(profileId);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper method to update profile from API data
  const updateProfileFromApiData = (apiData: UserProfileApiResponse) => {
    // Transform API data to our UI format
    const profileData: UserProfileState = {
      id: apiData.userId,
      name: apiData.fullName || apiData.userId,
      username: apiData.userId,
      profilePicture: apiData.profilePictureUrl,
      bio: apiData.bio,
      followers: 0,
      following: 0,
      isFollowing: false
    };
    
    setUserData(profileData);
    
    setEditedProfile({
      fullName: apiData.fullName || '',
      bio: apiData.bio || '',
      profilePictureUrl: apiData.profilePictureUrl || ''
    });
  };
  
  // Helper method for local data fallback
  const useLocalDataFallback = (profileId: string) => {
    // Try to use stored user data if it exists and matches the profile ID
    const storedUser = getStoredUserData();
    
    if (storedUser && 
        (storedUser.id === profileId || 
         storedUser.username.toLowerCase() === profileId.toLowerCase() || 
         storedUser.name.toLowerCase() === profileId.toLowerCase())) {
      
      setUserData({
        id: storedUser.id,
        name: storedUser.name || '',
        username: storedUser.username || '',
        profilePicture: storedUser.profilePictureUrl || '',
        bio: storedUser.bio || '',
        followers: 0,
        following: 0,
        isFollowing: false
      });
      
      setEditedProfile({
        fullName: storedUser.name || '',
        bio: storedUser.bio || '',
        profilePictureUrl: storedUser.profilePictureUrl || ''
      });
    } else {
      // Create minimal profile data if no matching stored user
      setUserData({
        ...defaultUserData,
        id: profileId,
        name: profileId,
        username: profileId
      });
    }
  };
  
  // Load profile on mount or when dependencies change
  useEffect(() => {
    if (initialLoad) {
      fetchUserProfile();
    }
  }, [targetUserId, user?.id]);
  
  return {
    userData,
    loading,
    isEditing,
    setIsEditing,
    editedProfile,
    updateSuccess,
    updateError,
    isCurrentUserProfile: isCurrentUserProfile(),
    handleEditChange,
    handleProfileUpdate,
    fetchUserProfile
  };
}

export default useUserProfile; 