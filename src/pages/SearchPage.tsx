import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, User, BookOpen, Filter, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SkillPostCard, { Post } from '../components/posts/SkillPostCard';
import LearningPlanCard, { LearningPlan } from '../components/learning/LearningPlanCard';

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'Alex Johnson',
    username: 'alexj',
    profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'Science enthusiast and math teacher',
    followerCount: 128
  },
  {
    id: '2',
    name: 'Emma Wilson',
    username: 'emmaw',
    profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'English literature expert',
    followerCount: 95
  },
  {
    id: '3',
    name: 'Mike Chen',
    username: 'mikechen',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'Biology teacher and researcher',
    followerCount: 86
  }
];

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
      }
    ],
    likes: 24,
    comments: 5,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
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
      }
    ],
    resources: [
      {
        id: 'resource-1',
        title: 'Grammar Masterclass Video',
        url: 'https://example.com/grammar-video',
        type: 'video'
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

type SearchResultType = 'all' | 'users' | 'posts' | 'plans';
type SubjectFilterType = 'all' | 'English' | 'Maths' | 'Science';

const SearchPage = () => {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);
  const [resultType, setResultType] = useState<SearchResultType>('all');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilterType>('all');
  
  const [users, setUsers] = useState<typeof mockUsers>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };
  
  useEffect(() => {
    if (!query) {
      setUsers([]);
      setPosts([]);
      setPlans([]);
      return;
    }
    
    // Simulate API search call
    setLoading(true);
    
    setTimeout(() => {
      // Filter mock data based on query (case insensitive)
      const lowercaseQuery = query.toLowerCase();
      
      // Filter users
      const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(lowercaseQuery) || 
        user.username.toLowerCase().includes(lowercaseQuery) ||
        (user.bio && user.bio.toLowerCase().includes(lowercaseQuery))
      );
      
      // Filter posts
      const filteredPosts = mockPosts.filter(post => 
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.user.name.toLowerCase().includes(lowercaseQuery)
      );
      
      // Filter plans
      const filteredPlans = mockPlans.filter(plan => 
        plan.title.toLowerCase().includes(lowercaseQuery) ||
        plan.description.toLowerCase().includes(lowercaseQuery) ||
        plan.subject.toLowerCase().includes(lowercaseQuery)
      );
      
      setUsers(filteredUsers);
      setPosts(filteredPosts);
      setPlans(filteredPlans);
      setLoading(false);
    }, 700);
  }, [query]);
  
  // Further filter results based on selected types
  const filteredUsers = resultType === 'all' || resultType === 'users' ? users : [];
  const filteredPosts = resultType === 'all' || resultType === 'posts' ? posts : [];
  const filteredPlans = resultType === 'all' || resultType === 'plans' 
    ? plans.filter(plan => subjectFilter === 'all' || plan.subject === subjectFilter) 
    : [];
  
  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0 || filteredPlans.length > 0;
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users, skills, or learning plans..."
            className={`w-full py-3 pl-12 pr-12 rounded-xl ${
              theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setResultType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              resultType === 'all'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setResultType('users')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center space-x-1 ${
              resultType === 'users'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setResultType('posts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center space-x-1 ${
              resultType === 'posts'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Skill Posts</span>
          </button>
          <button
            onClick={() => setResultType('plans')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center space-x-1 ${
              resultType === 'plans'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Learning Plans</span>
          </button>
        </div>
        
        {/* Subject filters (only shown for plans or all) */}
        {(resultType === 'plans' || resultType === 'all') && (
          <div className="flex items-center border-t border-gray-200 dark:border-slate-700 pt-4">
            <span className="text-sm font-medium mr-3 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Subject:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSubjectFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  subjectFilter === 'all'
                    ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setSubjectFilter('English')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  subjectFilter === 'English'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSubjectFilter('Maths')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  subjectFilter === 'Maths'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800'
                }`}
              >
                Maths
              </button>
              <button
                onClick={() => setSubjectFilter('Science')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  subjectFilter === 'Science'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                }`}
              >
                Science
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Search Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : query && !hasResults ? (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
          <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Try using different keywords or filters
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Users Results */}
          {filteredUsers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Users
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md flex items-center space-x-3 hover:shadow-lg transition`}
                  >
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 text-xl font-bold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                    <button className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Posts Results */}
          {filteredPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Skill Posts
              </h2>
              <div className="space-y-6">
                {filteredPosts.map(post => (
                  <SkillPostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
          
          {/* Learning Plans Results */}
          {filteredPlans.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Learning Plans
              </h2>
              <div className="space-y-6">
                {filteredPlans.map(plan => (
                  <LearningPlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;