import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Settings, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import postsApi, { Post } from '../../services/api/posts';
import { LearningPlan } from '../learning/LearningPlanCard';
import { ProgressUpdate } from '../progress/ProgressUpdateCard';
import UserList from './UserList';
import { getUserProfileWithStatus } from '../../services/api/users';
import axios from '../../services/api/axiosConfig';

type UserProfileData = {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing: boolean;
  followerCount?: number;
  followingCount?: number;
};

type UserProfileProps = {
  userProfile: UserProfileData;
  posts: Post[];
  plans: LearningPlan[];
  progressUpdates: ProgressUpdate[];
  isEditable?: boolean;
  onEditClick?: () => void;
};

const UserProfile = ({ userProfile, posts, plans, progressUpdates, isEditable, onEditClick }: UserProfileProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(userProfile.isFollowing);
  const [followerCount, setFollowerCount] = useState(userProfile.followerCount || userProfile.followers || 0);
  const [followingCount, setFollowingCount] = useState(userProfile.followingCount || userProfile.following || 0);
  
  // Determine if this is the current user's profile
  const isCurrentUser = user && (
    user.id === userProfile.id || 
    user.username === userProfile.username || 
    user.email === userProfile.username
  );

  // Fetch updated profile data including correct follower/following counts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        // Use the userId from the profile and the current user's ID to get follow status
        const profileData = await getUserProfileWithStatus(userProfile.id, user.id);
        
        if (profileData) {
          // Update follower and following counts with data from backend
          setFollowerCount(profileData.followerCount || 0);
          setFollowingCount(profileData.followingCount || 0);
          
          // Also update follow status if available
          if (typeof profileData.following === 'boolean' || typeof profileData.isFollowing === 'boolean') {
            setIsFollowing(profileData.following || profileData.isFollowing || false);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    
    fetchProfileData();
  }, [userProfile.id, user]);
  
  const handleFollow = async () => {
    if (!user) {
      // Handle unauthenticated user
      console.log('Please log in to follow users');
      return;
    }
    
    try {
      // Optimistic UI update
      if (isFollowing) {
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        setFollowerCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
      
      // Call API to update follow status - use proper error handling
      // Note: The backend doesn't have follow/unfollow endpoints yet
      // This is just a placeholder for when those endpoints are added
      try {
        // Replace with actual API call when the backend supports it
        // const endpoint = isFollowing ? 'unfollow' : 'follow';
        // await axios.post(`/api/users/${endpoint}/${userProfile.id}`);
        console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} user: ${userProfile.username}`);
      } catch (error) {
        console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      // Revert on error
      console.error('Failed to update follow status:', error);
      if (isFollowing) {
        setFollowerCount(prev => prev + 1);
      } else {
        setFollowerCount(prev => Math.max(0, prev - 1));
      }
      setIsFollowing(isFollowing); // Revert back
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md overflow-hidden`}>
        {/* Cover Photo */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="p-6 relative">
          {/* Profile Picture */}
          <div className="absolute -top-12 left-6">
            {userProfile.profilePicture ? (
              <img 
                src={userProfile.profilePicture} 
                alt={userProfile.name}
                className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-300 text-2xl font-bold">
                  {userProfile.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end mb-10 md:mb-0">
            {isEditable ? (
              <div className="flex space-x-3">
                <button 
                  onClick={onEditClick}
                  className="px-4 py-2 rounded-full border border-gray-300 dark:border-slate-600 text-sm font-medium flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                <button className="p-2 rounded-full border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          
          {/* User Info */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold">{userProfile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">@{userProfile.username}</p>
            
            {userProfile.bio && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">{userProfile.bio}</p>
            )}
            
            {/* Followers/Following */}
            <div className="flex flex-wrap items-center space-x-6 mt-4">
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{followerCount}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> followers</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{followingCount}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> following</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User List Section */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
        <UserList className="mt-4" />
      </div>
    </div>
  );
};

export default UserProfile;