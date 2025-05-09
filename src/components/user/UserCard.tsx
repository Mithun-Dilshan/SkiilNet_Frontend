import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserProfileApiResponse, followUser, unfollowUser, getUserProfileWithStatus } from '../../services/api/users';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../services/api/axiosConfig';

// Extend the UserProfileApiResponse with isFollowing property
interface UserWithFollowStatus extends UserProfileApiResponse {
  isFollowing?: boolean;
}

interface UserCardProps {
  user: UserWithFollowStatus;
  onFollowStatusChange?: (userId: string, isFollowing: boolean) => void;
}

const UserCard = ({ user, onFollowStatusChange }: UserCardProps) => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  // Initialize with either isFollowing OR following from the API
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || user.following || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine if this is the current user's card
  const isCurrentUser = currentUser && currentUser.id === user.userId;
  
  // Update follow status from props when it changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || user.following || false);
  }, [user.isFollowing, user.following]);
  
  // Fetch the current follow status when component mounts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || isCurrentUser) return;
      
      try {
        // Use the dedicated function from the API service instead of direct axios call
        const profileData = await getUserProfileWithStatus(user.userId, currentUser.id);
        
        if (profileData && typeof profileData.following === 'boolean') {
          // Update the local state with the correct field from API
          setIsFollowing(profileData.following);
          
          // Also update the parent component if needed
          if ((profileData.following !== user.following || 
               profileData.following !== user.isFollowing) && 
              onFollowStatusChange) {
            onFollowStatusChange(user.userId, profileData.following);
          }
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    
    checkFollowStatus();
  }, [currentUser, user.userId, isCurrentUser, user.following, user.isFollowing]);
  
  // Function to refresh the follow status from the backend
  const refreshFollowStatus = async () => {
    if (!currentUser || isCurrentUser) return;
    
    try {
      const profileData = await getUserProfileWithStatus(user.userId, currentUser.id);
      
      if (profileData && typeof profileData.following === 'boolean') {
        setIsFollowing(profileData.following);
        
        if (onFollowStatusChange) {
          onFollowStatusChange(user.userId, profileData.following);
        }
      }
    } catch (error) {
      console.error('Error refreshing follow status:', error);
    }
  };
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
      console.log('Please log in to follow users');
      return;
    }
    
    if (isCurrentUser) {
      console.log('Cannot follow yourself');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (isFollowing) {
        result = await unfollowUser(user.userId);
      } else {
        result = await followUser(user.userId);
      }
      
      if (result.success) {
        const newFollowState = !isFollowing;
        setIsFollowing(newFollowState);
        if (onFollowStatusChange) {
          onFollowStatusChange(user.userId, newFollowState);
        }
        
        // After a short delay, refresh the status from the backend to ensure accuracy
        setTimeout(() => {
          refreshFollowStatus();
        }, 500);
      } else {
        console.error('Error toggling follow status:', result.message);
        // If there was an error, refresh to get the correct state
        refreshFollowStatus();
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // If there was an error, refresh to get the correct state
      refreshFollowStatus();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-4 flex flex-col items-center`}>
      {/* Profile Picture */}
      <div className="mb-3">
        {user.profilePictureUrl ? (
          <img 
            src={user.profilePictureUrl} 
            alt={user.fullName || user.userId}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-300 text-xl font-bold">
              {(user.fullName || user.userId).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {/* User Info */}
      <h3 className="text-lg font-semibold mb-1 text-center">
        {user.fullName || user.userId}
      </h3>
      
      {user.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3 line-clamp-2">
          {user.bio}
        </p>
      )}
      
      {/* Action Buttons */}
      <div className="mt-2 flex space-x-2">
        <Link 
          to={`/profile/${user.userId}`}
          className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
        >
          View Profile
        </Link>
        
        {!isCurrentUser && (
          <button
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`px-3 py-1 text-sm rounded-full transition ${
              isLoading 
                ? 'opacity-70 cursor-not-allowed bg-gray-300 dark:bg-slate-600'
                : isFollowing
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Updating...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard; 