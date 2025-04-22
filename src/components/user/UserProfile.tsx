import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Settings, Users, BookOpen, Activity, Clock, Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import SkillPostCard, { Post } from '../posts/SkillPostCard';
import LearningPlanCard, { LearningPlan } from '../learning/LearningPlanCard';
import ProgressUpdateCard, { ProgressUpdate } from '../progress/ProgressUpdateCard';

type UserProfileData = {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: number;
  following: number;
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
  };
  isFollowing: boolean;
};

type UserProfileProps = {
  userProfile: UserProfileData;
  posts: Post[];
  plans: LearningPlan[];
  progressUpdates: ProgressUpdate[];
};

const UserProfile = ({ userProfile, posts, plans, progressUpdates }: UserProfileProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'plans' | 'progress' | 'stats'>('posts');
  const [isFollowing, setIsFollowing] = useState(userProfile.isFollowing);
  const [followersCount, setFollowersCount] = useState(userProfile.followers);
  
  const isCurrentUser = user?.id === userProfile.id;
  
  const handleFollow = () => {
    if (isFollowing) {
      setFollowersCount(prev => prev - 1);
    } else {
      setFollowersCount(prev => prev + 1);
    }
    setIsFollowing(!isFollowing);
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
            {isCurrentUser ? (
              <div className="flex space-x-3">
                <button className="px-4 py-2 rounded-full border border-gray-300 dark:border-slate-600 text-sm font-medium flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
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
            
            {/* Stats */}
            <div className="flex flex-wrap items-center space-x-6 mt-4">
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{followersCount}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> followers</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{userProfile.following}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> following</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{userProfile.stats.totalPosts}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> posts</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'posts'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Skill Posts
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'plans'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Learning Plans
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'progress'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'stats'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Stats
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
                <p className="text-gray-500 dark:text-gray-400">No skill posts yet</p>
                {isCurrentUser && (
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              posts.map(post => <SkillPostCard key={post.id} post={post} />)
            )}
          </div>
        )}
        
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {plans.length === 0 ? (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
                <p className="text-gray-500 dark:text-gray-400">No learning plans yet</p>
                {isCurrentUser && (
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                    Create Your First Plan
                  </button>
                )}
              </div>
            ) : (
              plans.map(plan => <LearningPlanCard key={plan.id} plan={plan} />)
            )}
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {progressUpdates.length === 0 ? (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
                <p className="text-gray-500 dark:text-gray-400">No progress updates yet</p>
                {isCurrentUser && (
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                    Share Your Progress
                  </button>
                )}
              </div>
            ) : (
              progressUpdates.map(update => <ProgressUpdateCard key={update.id} update={update} />)
            )}
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
            <h3 className="text-lg font-semibold mb-4">Activity & Stats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-medium">Content</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Posts</span>
                    <span className="font-bold">{userProfile.stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Plans</span>
                    <span className="font-bold">{plans.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Progress Updates</span>
                    <span className="font-bold">{progressUpdates.length}</span>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h4 className="font-medium">Engagement</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Likes</span>
                    <span className="font-bold">{userProfile.stats.totalLikes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Comments</span>
                    <span className="font-bold">{userProfile.stats.totalComments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Avg Likes/Post</span>
                    <span className="font-bold">
                      {userProfile.stats.totalPosts > 0 
                        ? Math.round(userProfile.stats.totalLikes / userProfile.stats.totalPosts) 
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-medium">Activity</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Last Post</span>
                    <span className="font-bold">2 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Joined</span>
                    <span className="font-bold">March 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Weekly Activity</span>
                    <span className="font-bold">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;