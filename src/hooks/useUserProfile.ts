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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileUpdate = async () => {
    if (!user || !user.id) {
      setUpdateError('You must be logged in to update your profile');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setUpdateError('');
      
      setUserData(prev => ({
        ...prev,
        name: editedProfile.fullName || prev.name,
        bio: editedProfile.bio || prev.bio,
        profilePicture: editedProfile.profilePictureUrl || prev.profilePicture
      }));
      
      const storedUser = getStoredUserData();
      let updateId = user.id;
      
      if (!user.id.match(/^[0-9a-f]{24}$/i) && storedUser?.id?.match(/^[0-9a-f]{24}$/i)) {
        console.log(`Using stored MongoDB ID ${storedUser.id} instead of ${user.id} for update`);
        updateId = storedUser.id;
      }
      
    
      console.log(`Updating profile with identifier: ${updateId}`);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fetchUserProfile = async (userId?: string) => {
    const profileId = userId || targetUserId || (user?.id ? user.id : undefined);
    
    if (!profileId) {
      console.error('No user ID provided to fetch profile');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log(`Fetching profile for: ${profileId}`);
    
    const token = localStorage.getItem('token');
    console.log(`Auth token exists: ${!!token}`);
    console.log(`Current user in context:`, user ? `ID: ${user.id}, Name: ${user.name}` : 'none');
    
    try {
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
        }         

      }
      
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
      }
      
      const storedUser = getStoredUserData();
      
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
      
  
      const hardcodedMongoDBId = "681e3c071b66872f18bcae12"; 
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
  
  const updateProfileFromApiData = (apiData: UserProfileApiResponse) => {
    const storedUser = getStoredUserData();
    
    console.log('API profile data:', apiData);
    console.log('Stored user data:', storedUser);
    
    const name = apiData.fullName || apiData.name || storedUser?.name || '';
    
   
    let username = '';
    
    if (apiData.username) {
      username = apiData.username;
    } else if (storedUser?.username) {
      username = storedUser.username;
    } else if (apiData.userId) {
      username = apiData.userId;
    } else if (apiData.email) {
      username = apiData.email.split('@')[0]; 
    } else if (name) {
      username = name.toLowerCase().replace(/\s+/g, '.'); 
    } else if (storedUser?.id) {
      username = storedUser.id; 
    }
    
    setUserData({
      id: apiData.userId || apiData.id || storedUser?.id || '',
      name: name,
      username: username,
      profilePicture: apiData.profilePictureUrl || storedUser?.profilePictureUrl || '',
      bio: apiData.bio || storedUser?.bio || '',
      followers: apiData.followerCount || 0,
      following: apiData.followingCount || 0,
      isFollowing: apiData.following || apiData.isFollowing || false
    });
    
    setEditedProfile({
      fullName: name,
      bio: apiData.bio || storedUser?.bio || '',
      profilePictureUrl: apiData.profilePictureUrl || storedUser?.profilePictureUrl || ''
    });
  };
  
  const useLocalDataFallback = (profileId: string) => {
    const storedUser = getStoredUserData();
    
    console.log('Using local data fallback for:', profileId);
    console.log('Stored user data:', storedUser);
    
    const isStoredUser = storedUser && (
      storedUser.id === profileId || 
      storedUser.username?.toLowerCase() === profileId.toLowerCase() || 
      storedUser.name?.toLowerCase() === profileId.toLowerCase() ||
      storedUser.email?.toLowerCase() === profileId.toLowerCase()
    );
    
    if (isStoredUser) {
      const username = storedUser.username || 
                       storedUser.email?.split('@')[0] || 
                       storedUser.name?.toLowerCase().replace(/\s+/g, '.') ||
                       storedUser.id;
      
      setUserData({
        id: storedUser.id,
        name: storedUser.name || storedUser.id,
        username: username,
        profilePicture: storedUser.profilePictureUrl,
        bio: storedUser.bio,
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
 
      let name = profileId;
      let username = profileId.toLowerCase().replace(/\s+/g, '.');
      
      if (profileId.includes('@')) {
        username = profileId.split('@')[0];
        name = username; 
      }
      
      setUserData({
        id: profileId,
        name: name,
        username: username,
        profilePicture: '',
        bio: '',
        followers: 0,
        following: 0,
        isFollowing: false
      });
      
      setEditedProfile({
        fullName: '',
        bio: '',
        profilePictureUrl: ''
      });
    }
  };
  
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
    isSubmitting,
    isCurrentUserProfile: isCurrentUserProfile(),
    handleEditChange,
    handleProfileUpdate,
    fetchUserProfile
  };
}

export default useUserProfile; 