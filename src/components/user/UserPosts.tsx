import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import postsApi, { Post } from '../../services/api/posts';
import SkillPostCard from '../posts/SkillPostCard';
import { getUserById } from '../../services/api/auth';

interface UserPostsProps {
  userId: string;
}

const UserPosts = ({ userId }: UserPostsProps) => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add user data cache
  const [userDataCache, setUserDataCache] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const userPosts = await postsApi.getPostsByUserId(userId);
        
        // Get user data for the posts
        const userData = await getUserById(userId);
        
        if (userData) {
          // Store user data in cache
          const cache = { 
            ...userDataCache,
            [userId]: {
              id: userData.id,
              name: userData.name || 'User ' + userId,
              username: userData.username || 'user' + userId,
              profilePicture: userData.profilePictureUrl || 'https://via.placeholder.com/100'
            }
          };
          setUserDataCache(cache);
          
          // Add user data to posts
          const postsWithUserData = userPosts.map(post => ({
            ...post,
            user: cache[userId]
          }));
          
          setPosts(postsWithUserData);
        } else {
          setPosts(userPosts);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostUpdated = async (updatedPost: Post) => {
    // Get user data for the post
    let userData = userDataCache[updatedPost.userId];
    
    if (!userData) {
      try {
        const fetchedUser = await getUserById(updatedPost.userId);
        if (fetchedUser) {
          userData = {
            id: fetchedUser.id,
            name: fetchedUser.name || 'User ' + updatedPost.userId,
            username: fetchedUser.username || 'user' + updatedPost.userId,
            profilePicture: fetchedUser.profilePictureUrl || 'https://via.placeholder.com/100'
          };
          
          // Update cache
          setUserDataCache(prev => ({
            ...prev,
            [updatedPost.userId]: userData
          }));
        }
      } catch (err) {
        console.error(`Error fetching user data for updated post:`, err);
      }
    }
    
    // Update post with user data
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id 
        ? {...updatedPost, user: userData}
        : post
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`p-6 text-center rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Posts</h2>
      <div className="space-y-4">
        {posts.map(post => (
          <SkillPostCard 
            key={post.id}
            post={post} 
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
        ))}
      </div>
    </div>
  );
};

export default UserPosts; 