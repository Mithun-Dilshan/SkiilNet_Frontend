import { useState, useEffect } from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SkillPostCard, { Post } from '../components/posts/SkillPostCard';
import LearningPlanCard, { LearningPlan } from '../components/learning/LearningPlanCard';
import ProgressUpdateCard, { ProgressUpdate } from '../components/progress/ProgressUpdateCard';

// Mock data
const mockPosts: Post[] = [
  {
    id: 'post-1',
    user: {
      id: '2',
      name: 'Emma Wilson',
      username: 'emmaw',
      profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    content: 'Just finished creating a set of Algebra shortcuts that helped my students improve their test scores by 15%! Here are some examples:',
    media: [
      {
        id: 'media-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=1280'
      },
      {
        id: 'media-2',
        type: 'image',
        url: 'https://images.pexels.com/photos/5905700/pexels-photo-5905700.jpeg?auto=compress&cs=tinysrgb&w=1280'
      }
    ],
    likes: 24,
    comments: 5,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
  },
  {
    id: 'post-2',
    user: {
      id: '3',
      name: 'Mike Chen',
      username: 'mikechen',
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    content: 'Here\'s a quick way to remember the process of photosynthesis for my biology students. I created this visual guide:',
    media: [
      {
        id: 'media-3',
        type: 'image',
        url: 'https://images.pexels.com/photos/3735204/pexels-photo-3735204.jpeg?auto=compress&cs=tinysrgb&w=1280'
      }
    ],
    likes: 18,
    comments: 3,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString() // 1 day ago
  }
];

const mockPlans: LearningPlan[] = [
  {
    id: 'plan-1',
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
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
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
    template: 'completed_lesson',
    description: 'Just completed the "Quadratic Equations" module with a score of 92%! Really proud of understanding the different methods to solve them.',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
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
  const [feed, setFeed] = useState<(Post | LearningPlan | ProgressUpdate)[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState<'all' | 'posts' | 'plans' | 'progress'>('all');
  
  useEffect(() => {
    // Simulate API call to get feed
    setLoading(true);
    setTimeout(() => {
      // Combine all content types and sort by date
      const allContent = [
        ...mockPosts.map(post => ({ ...post, type: 'post' as const })),
        ...mockPlans.map(plan => ({ ...plan, type: 'plan' as const })),
        ...mockUpdates.map(update => ({ ...update, type: 'update' as const }))
      ].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setFeed(allContent);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter feed based on selected filter
  const filteredFeed = feed.filter(item => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'posts' && 'content' in item) return true;
    if (feedFilter === 'plans' && 'topics' in item) return true;
    if (feedFilter === 'progress' && 'template' in item) return true;
    return false;
  });
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      
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
      
      {/* Recommendations Section */}
      <div className={`mb-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold">Recommended for You</h2>
          </div>
          <button className="flex items-center space-x-1 text-sm text-indigo-600 dark:text-indigo-400">
            <Filter className="h-4 w-4" />
            <span>Customize</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} hover:shadow-md transition`}>
            <h3 className="font-medium text-sm mb-1">Science - Periodic Table</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Based on your interest in Chemistry
            </p>
            <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition">
              View Plan
            </button>
          </div>
          
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} hover:shadow-md transition`}>
            <h3 className="font-medium text-sm mb-1">Math - Calculus Fundamentals</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Suggested for your learning goals
            </p>
            <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition">
              View Plan
            </button>
          </div>
        </div>
      </div>
      
      {/* Feed Content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredFeed.length === 0 ? (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
          <p className="text-gray-500 dark:text-gray-400">No content found for the selected filter</p>
          <button 
            onClick={() => setFeedFilter('all')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
          >
            Show All Content
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFeed.map(item => {
            if ('content' in item) {
              return <SkillPostCard key={item.id} post={item} />;
            } else if ('topics' in item) {
              return <LearningPlanCard key={item.id} plan={item} />;
            } else if ('template' in item) {
              return <ProgressUpdateCard key={item.id} update={item} />;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;