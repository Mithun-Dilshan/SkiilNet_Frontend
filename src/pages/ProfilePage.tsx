import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/user/UserProfile';
import { getUserProfile, updateUserProfile, UserProfileApiResponse } from '../services/api/users';
import { useAuth } from '../contexts/AuthContext';
import { getStoredUserData, saveUserData } from '../utils/userUtils';

const defaultUserData = {
  id: '',
  name: '',
  username: '',
  profilePicture: '',
  bio: '',
  followers: 0,
  following: 0,
  stats: {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0
  },
  isFollowing: false
};

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(defaultUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    fullName: '',
    bio: '',
    profilePictureUrl: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const { user } = useAuth();
  
  // Determine if this is the current user's profile
  const isCurrentUserProfile = (): boolean => {
    if (!user) return false;
    
    const storedUser = getStoredUserData();
    const currentUsername = username?.toLowerCase();
    
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
      setUpdateError('');
      
      setUserData(prev => ({
        ...prev,
        name: editedProfile.fullName || prev.name,
        bio: editedProfile.bio || prev.bio,
        profilePicture: editedProfile.profilePictureUrl || prev.profilePicture
      }));
            const result = await updateUserProfile(user.id, {
        fullName: editedProfile.fullName,
        bio: editedProfile.bio,
        profilePictureUrl: editedProfile.profilePictureUrl
      });
      
      if (result) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        
        setIsEditing(false);
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
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      
      try {
        const storedUser = getStoredUserData();
        const token = localStorage.getItem('token');
        
        let userId = '';
        let useStoredDataOnly = false;
        
        if (username) {
          if (storedUser && 
              (storedUser.username?.toLowerCase() === username.toLowerCase() || 
               storedUser.name?.toLowerCase() === username.toLowerCase())) {
            userId = storedUser.id;
            
            setUserData({
              id: storedUser.id,
              name: storedUser.name || '',
              username: storedUser.username || '',
              profilePicture: storedUser.profilePictureUrl || '',
              bio: storedUser.bio || '',
              followers: 0,
              following: 0,
              stats: {
                totalPosts: 0,
                totalLikes: 0,
                totalComments: 0
              },
              isFollowing: false
            });
            
            setEditedProfile({
              fullName: storedUser.name || '',
              bio: storedUser.bio || '',
              profilePictureUrl: storedUser.profilePictureUrl || ''
            });
          } else {
            userId = username;
            
            if (!token) {
              useStoredDataOnly = true;
              console.log('No auth token - skipping API call for other user profile');
              
              setUserData({
                ...defaultUserData,
                id: username,
                name: username,
                username: username
              });
            }
          }
        } else if (user) {
          userId = user.id;
          
          if (user.name) {
            setUserData({
              id: user.id,
              name: user.name,
              username: user.username || user.email?.split('@')[0] || '',
              profilePicture: user.profilePictureUrl || '',
              bio: user.bio || '',
              followers: 0,
              following: 0,
              stats: {
                totalPosts: 0,
                totalLikes: 0,
                totalComments: 0
              },
              isFollowing: false
            });
            
            setEditedProfile({
              fullName: user.name || '',
              bio: user.bio || '',
              profilePictureUrl: user.profilePictureUrl || ''
            });
          }
        } else if (storedUser) {
          userId = storedUser.id;
          
          setUserData({
            id: storedUser.id,
            name: storedUser.name || '',
            username: storedUser.username || '',
            profilePicture: storedUser.profilePictureUrl || '',
            bio: storedUser.bio || '',
            followers: 0,
            following: 0,
            stats: {
              totalPosts: 0,
              totalLikes: 0,
              totalComments: 0
            },
            isFollowing: false
          });
          
          setEditedProfile({
            fullName: storedUser.name || '',
            bio: storedUser.bio || '',
            profilePictureUrl: storedUser.profilePictureUrl || ''
          });
        } else {
          throw new Error('No user information available');
        }
        
        if (!token) {
          console.log('No auth token available - skipping API calls completely');
          setLoading(false);
          return;
        }
        
        if (userId && !useStoredDataOnly) {
          try {
            const apiData = await getUserProfile(userId);
            
            if (apiData) {
              const profileData = {
                id: apiData.userId,
                name: apiData.fullName || (storedUser?.name || username || ''),
                username: storedUser?.username || apiData.userId || username || '',
                profilePicture: apiData.profilePictureUrl || '',
                bio: apiData.bio || '',
                followers: 0,
                following: 0,
                stats: {
                  totalPosts: 0,
                  totalLikes: 0,
                  totalComments: 0
                },
                isFollowing: false
              };
              setUserData(profileData);
              
              setEditedProfile({
                fullName: apiData.fullName || '',
                bio: apiData.bio || '',
                profilePictureUrl: apiData.profilePictureUrl || ''
              });
            }
          } catch (apiError: any) {
            if (apiError.isAuthError) {
              console.log('Authentication required for API access - using local data only');
            } else {
              console.error('API error fetching profile:', apiError);
            }
          }
        }
      } catch (error) {
        console.error('Error in profile page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, user]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <UserProfile 
        userProfile={userData}
        posts={[]}
        plans={[]}
        progressUpdates={[]}
        isEditable={isCurrentUserProfile()}
        onEditClick={() => setIsEditing(true)}
      />
      
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            
            {updateSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                Profile updated successfully!
              </div>
            )}
            
            {updateError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {updateError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="fullName"
                value={editedProfile.fullName}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={editedProfile.bio}
                onChange={handleEditChange}
                rows={4}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
              <input
                type="text"
                name="profilePictureUrl"
                value={editedProfile.profilePictureUrl}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;