import { useState, useEffect } from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SkillPostCard from '../components/posts/SkillPostCard';
import CreatePost from '../components/posts/CreatePost';
import LearningPlanCard from '../components/learning/LearningPlanCard';
import ProgressUpdateCard from '../components/progress/ProgressUpdateCard';
import postsApi, { Post } from '../services/api/posts';

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

// Mock data for learning plans and progress updates (we'll implement these later)
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
  const [feed, setFeed] = useState<(FeedPost | LearningPlan | ProgressUpdate)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'all' | 'posts' | 'plans' | 'progress'>('all');
  
  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real posts from the API
      const posts = await postsApi.getAllPosts();
      
      // Transform posts to include user info (TODO: Replace with real user data)
      const transformedPosts: FeedPost[] = posts.map(post => ({
        ...post,
        type: 'post',
        user: {
          id: post.userId,
          name: 'User ' + post.userId,
          username: 'user' + post.userId,
          profilePicture: 'https://via.placeholder.com/100'
        }
      }));
      
      // Combine with mock data for now
      const allContent = [
        ...transformedPosts,
        ...mockPlans,
        ...mockUpdates
      ].sort((a, b) => {
        // Get the date from either the date field (posts) or createdAt field (other content)
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
    // Remove the deleted post from the feed
    setFeed(prevFeed => prevFeed.filter(item => 
      item.type !== 'post' || item.id !== postId
    ));
  };

  const handlePostUpdated = (updatedPost: Post) => {
    // Update the post in the feed
    setFeed(prevFeed => prevFeed.map(item => {
      if (item.type === 'post' && item.id === updatedPost.id) {
        return {
          ...updatedPost,
          type: 'post',
          user: {
            id: updatedPost.userId,
            name: 'User ' + updatedPost.userId,
            username: 'user' + updatedPost.userId,
            profilePicture: 'https://via.placeholder.com/100'
          }
        } as FeedPost;
      }
      return item;
    }));
  };

  useEffect(() => {
    fetchFeed();
  }, []);
  
  // Filter feed based on selected filter
  const filteredFeed = feed.filter(item => {
    if (feedFilter === 'all') return true;
    return item.type === feedFilter.slice(0, -1) as 'post' | 'plan' | 'update';
  });
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      
      {/* Create Post Form */}
      <CreatePost onPostCreated={fetchFeed} />
      
      {/* Feed Filters */}
      <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFeedFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            feedFilter === 'all'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          All Content
        </button>
        <button
          onClick={() => setFeedFilter('posts')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            feedFilter === 'posts'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          Skill Posts
        </button>
        <button
          onClick={() => setFeedFilter('plans')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            feedFilter === 'plans'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          Learning Plans
        </button>
        <button
          onClick={() => setFeedFilter('progress')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            feedFilter === 'progress'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          Progress Updates
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Feed Content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchFeed}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredFeed.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No content to display
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFeed.map(item => {
            switch (item.type) {
              case 'post':
                return (
                  <SkillPostCard 
                    key={item.id} 
                    post={item} 
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                  />
                );
              case 'plan':
                return <LearningPlanCard key={item.id} plan={item} />;
              case 'update':
                return <ProgressUpdateCard key={item.id} update={item} />;
              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;