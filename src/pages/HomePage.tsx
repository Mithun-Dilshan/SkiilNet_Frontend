import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SkillPostCard from '../components/posts/SkillPostCard';
import CreatePost from '../components/posts/CreatePost';
import LearningPlanCard from '../components/learning/LearningPlanCard';
import ProgressUpdateCard from '../components/progress/ProgressUpdateCard';
import postsApi, { Post } from '../services/api/posts';
import { getUserById } from '../services/api/auth';

interface ContentBase {
  id: string;
  type: 'post' | 'plan' | 'update';
}

interface FeedPost extends Post, ContentBase {
  type: 'post';
  user?: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
}

interface LearningPlan extends ContentBase {
  type: 'plan';
  title: string;
  description: string;
  subject: 'English' | 'Maths' | 'Science';
  topics: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  resources: Array<{
    id: string;
    title: string;
    url: string;
    type: 'video' | 'document';
  }>;
  completionPercentage: number;
  estimatedDays: number;
  followers: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  following?: boolean;
}

interface ProgressUpdate extends ContentBase {
  type: 'update';
  template: 'completed_lesson';
  description: string;
  createdAt: string;
  subject: 'English' | 'Maths' | 'Science';
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
}

const mockPlans: LearningPlan[] = [
  {
    id: 'plan-1',
    type: 'plan',
    title: 'Advanced English Grammar Mastery',
    description: 'A comprehensive 30-day plan to master advanced English grammar concepts including conditionals, reported speech, and complex tenses.',
    subject: 'English',
    topics: [
      {
        id: 'topic-1',
        title: 'Perfect Tenses & Their Uses',
        completed: true
      },
      {
        id: 'topic-2',
        title: 'Conditional Sentences (All Types)',
        completed: true
      },
      {
        id: 'topic-3',
        title: 'Reported Speech & Narrative Tenses',
        completed: false
      },
      {
        id: 'topic-4',
        title: 'Advanced Passive Constructions',
        completed: false
      }
    ],
    resources: [
      {
        id: 'resource-1',
        title: 'Grammar Masterclass Video',
        url: 'https://example.com/grammar-video',
        type: 'video'
      },
      {
        id: 'resource-2',
        title: 'Practice Exercises PDF',
        url: 'https://example.com/exercises.pdf',
        type: 'document'
      }
    ],
    completionPercentage: 50,
    estimatedDays: 30,
    followers: 45,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    user: {
      id: '4',
      name: 'Sara Lopez',
      username: 'saral',
      profilePicture: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  }
];

const mockUpdates: ProgressUpdate[] = [
  {
    id: 'update-1',
    type: 'update',
    template: 'completed_lesson',
    description: 'Just completed the "Quadratic Equations" module with a score of 92%! Really proud of understanding the different methods to solve them.',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    subject: 'Maths',
    user: {
      id: '5',
      name: 'David Kim',
      username: 'davidk',
      profilePicture: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  }
];

const HomePage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [feed, setFeed] = useState<(FeedPost | LearningPlan | ProgressUpdate)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'all' | 'posts' | 'plans' | 'progress'>('all');
  
  const [userCache, setUserCache] = useState<Record<string, any>>({});
  
  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const posts = await postsApi.getAllPosts();
      
      const userDataMap: Record<string, any> = {...userCache};
      
      const postUserPromises = posts.map(async (post) => {
        if (userDataMap[post.userId]) {
          return {
            ...post,
            type: 'post' as const,
            user: userDataMap[post.userId]
          } as FeedPost;
        }
        
        try {
          const userData = await getUserById(post.userId);
          
          if (userData) {
            userDataMap[post.userId] = {
              id: userData.id,
              name: userData.name || 'User ' + post.userId,
              username: userData.username || 'user' + post.userId,
              profilePicture: userData.profilePictureUrl || 'https://via.placeholder.com/100'
            };
            
            return {
              ...post,
              type: 'post' as const,
              user: userDataMap[post.userId]
            } as FeedPost;
          }
        } catch (err) {
          console.error(`Error fetching user data for post ${post.id}:`, err);
        }
        
        return {
          ...post,
          type: 'post' as const,
          user: {
            id: post.userId,
            name: 'User ' + post.userId,
            username: 'user' + post.userId,
            profilePicture: 'https://via.placeholder.com/100'
          }
        } as FeedPost;
      });
      
      const transformedPosts = await Promise.all(postUserPromises);
      
      setUserCache(userDataMap);
      
      const allContent = [
        ...transformedPosts,
        ...mockPlans,
        ...mockUpdates
      ].sort((a, b) => {
        const getDate = (item: typeof a) => {
          if ('date' in item) {
            return new Date(item.date);
          }
          return new Date(item.createdAt);
        };

        return getDate(b).getTime() - getDate(a).getTime();
      });
      
      setFeed(allContent);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError('Failed to load feed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setFeed(prevFeed => prevFeed.filter(item => 
      item.type !== 'post' || item.id !== postId
    ));
  };

  const handlePostUpdated = async (updatedPost: Post) => {
    let userData = userCache[updatedPost.userId];
    
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
          
          setUserCache(prev => ({
            ...prev,
            [updatedPost.userId]: userData
          }));
        }
      } catch (err) {
        console.error(`Error fetching user data for updated post:`, err);
        userData = {
          id: updatedPost.userId,
          name: 'User ' + updatedPost.userId,
          username: 'user' + updatedPost.userId,
          profilePicture: 'https://via.placeholder.com/100'
        };
      }
    }
    
    setFeed(prevFeed => prevFeed.map(item => {
      if (item.type === 'post' && item.id === updatedPost.id) {
        return {
          ...updatedPost,
          type: 'post',
          user: userData
        } as FeedPost;
      }
      return item;
    }));
  };

  useEffect(() => {
    fetchFeed();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Profile Quick Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Feed</h1>
          {feedFilter === 'all' && (
            <div className={`rounded-full ${theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'} flex items-center px-3 py-1`}>
              <Sparkles className="h-4 w-4 text-indigo-600 mr-1" />
              <span className="text-sm text-indigo-600">For You</span>
            </div>
          )}
        </div>
        <div>
          <select
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-slate-700 text-white border-slate-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border`}
          >
            <option value="all">All Content</option>
            <option value="posts">Posts Only</option>
            <option value="plans">Learning Plans</option>
            <option value="progress">Progress Updates</option>
          </select>
        </div>
      </div>
      
      <CreatePost onPostCreated={fetchFeed} />
      
  
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-500 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {feed.length === 0 ? (
            <div className={`p-6 text-center rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
              <p className="text-gray-500 dark:text-gray-400">No content to display. Follow more users or create your first post!</p>
            </div>
          ) : (
            feed
              .filter(item => {
                if (feedFilter === 'all') return true;
                if (feedFilter === 'posts') return item.type === 'post';
                if (feedFilter === 'plans') return item.type === 'plan';
                if (feedFilter === 'progress') return item.type === 'update';
                return true;
              })
              .map(item => {
                if (item.type === 'post') {
                  return (
                    <SkillPostCard
                      key={item.id}
                      post={item}
                      onPostDeleted={handlePostDeleted}
                      onPostUpdated={handlePostUpdated}
                    />
                  );
                }
                
                if (item.type === 'plan') {
                  return <LearningPlanCard key={item.id} plan={item} />;
                }
                
                if (item.type === 'update') {
                  return <ProgressUpdateCard key={item.id} update={item} />;
                }
                
                return null;
              })
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;