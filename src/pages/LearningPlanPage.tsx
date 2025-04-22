import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Users, Clock, Check, ArrowLeft, Star, Share2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { LearningPlan } from '../components/learning/LearningPlanCard';

// Mock plan data
const mockPlan: LearningPlan = {
  id: 'plan-1',
  title: 'Mastering Basic Trigonometry',
  description: 'A step-by-step guide to understanding the fundamentals of trigonometry, from the unit circle to trig functions and identities. This plan is designed for high school students or anyone looking to strengthen their math foundations.',
  subject: 'Maths',
  topics: [
    {
      id: 'topic-1',
      title: 'Understanding the Unit Circle',
      completed: true
    },
    {
      id: 'topic-2',
      title: 'Sine, Cosine, and Tangent Functions',
      completed: true
    },
    {
      id: 'topic-3',
      title: 'Trigonometric Identities',
      completed: false
    },
    {
      id: 'topic-4',
      title: 'Solving Right Triangles',
      completed: false
    },
    {
      id: 'topic-5',
      title: 'Law of Sines and Cosines',
      completed: false
    },
    {
      id: 'topic-6',
      title: 'Real-world Applications',
      completed: false
    }
  ],
  resources: [
    {
      id: 'resource-1',
      title: 'Interactive Unit Circle Tool',
      url: 'https://example.com/unit-circle',
      type: 'link'
    },
    {
      id: 'resource-2',
      title: 'Trigonometry Cheat Sheet',
      url: 'https://example.com/trig-cheatsheet.pdf',
      type: 'document'
    },
    {
      id: 'resource-3',
      title: 'Video: Trigonometric Functions Explained',
      url: 'https://example.com/trig-video',
      type: 'video'
    },
    {
      id: 'resource-4',
      title: 'Practice Problems Set',
      url: 'https://example.com/practice.pdf',
      type: 'document'
    }
  ],
  completionPercentage: 33,
  estimatedDays: 14,
  followers: 87,
  createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
  user: {
    id: '1',
    name: 'Alex Johnson',
    username: 'alexj',
    profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  following: false
};

const LearningPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'progress'>('overview');
  
  useEffect(() => {
    // Simulate API call to fetch plan
    setLoading(true);
    
    setTimeout(() => {
      setPlan(mockPlan);
      setFollowing(mockPlan.following || false);
      setFollowers(mockPlan.followers);
      setLoading(false);
    }, 800);
  }, [id]);
  
  const handleFollow = () => {
    if (following) {
      setFollowers(prev => prev - 1);
    } else {
      setFollowers(prev => prev + 1);
    }
    setFollowing(!following);
  };
  
  // Get progress color based on completion percentage
  const getProgressColor = () => {
    if (!plan) return 'bg-gray-200';
    if (plan.completionPercentage < 33) return 'bg-red-400';
    if (plan.completionPercentage < 67) return 'bg-yellow-400';
    return 'bg-green-500';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
        <p className="text-gray-500 dark:text-gray-400">Learning plan not found</p>
        <Link 
          to="/search" 
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
        >
          Browse Plans
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Learning Plan</h1>
      </div>
      
      {/* Plan Header Card */}
      <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md mb-6`}>
        {/* Subject Badge & Creator Info */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              plan.subject === 'Maths'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : plan.subject === 'English'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {plan.subject}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Created {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <Link to={`/profile/${plan.user.username}`} className="flex items-center space-x-2 hover:underline">
            {plan.user.profilePicture ? (
              <img 
                src={plan.user.profilePicture} 
                alt={plan.user.name} 
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                  {plan.user.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm">{plan.user.name}</span>
          </Link>
        </div>
        
        {/* Title and Description */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-3">{plan.title}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{plan.description}</p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{plan.topics.length}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> topics</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{plan.estimatedDays}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> days</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm">
                  <span className="font-bold">{followers}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> following</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition text-gray-500 dark:text-gray-400" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition text-gray-500 dark:text-gray-400" aria-label="Download">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition text-yellow-500" aria-label="Save">
                <Star className="h-5 w-5" />
              </button>
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  following
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {following ? 'Following' : 'Follow Plan'}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{plan.completionPercentage}% Complete</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getProgressColor()}`}
                style={{ width: `${plan.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'overview'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'resources'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 text-center font-medium text-sm transition ${
              activeTab === 'progress'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            My Progress
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6 mb-8`}>
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Topics</h3>
            <div className="space-y-3">
              {plan.topics.map((topic, index) => (
                <div 
                  key={topic.id}
                  className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
                  } flex items-start space-x-3`}
                >
                  <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                    topic.completed 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {topic.completed 
                      ? <Check className="h-4 w-4" />
                      : <span className="text-xs font-medium">{index + 1}</span>
                    }
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        topic.completed ? 'text-gray-500 dark:text-gray-400' : ''
                      }`}>
                        {topic.title}
                      </h4>
                      
                      {topic.completed ? (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      ) : (
                        <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition">
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Learning Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.resources.map(resource => (
                <a 
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} flex items-start space-x-3 hover:shadow-md transition`}
                >
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                    resource.type === 'video'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : resource.type === 'document'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    {resource.type === 'video' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    )}
                    {resource.type === 'document' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    )}
                    {resource.type === 'link' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                      {resource.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {resource.type}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">My Learning Journey</h3>
            
            {/* Progress Summary */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} mb-6`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {plan.completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {plan.topics.filter(t => t.completed).length}/{plan.topics.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Topics Done</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.max(0, plan.estimatedDays - Math.floor(plan.completionPercentage * plan.estimatedDays / 100))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Days Left</div>
                </div>
              </div>
            </div>
            
            {/* Learning Log */}
            <h4 className="font-medium mb-4">Learning Log</h4>
            
            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-6">
              {plan.topics.filter(t => t.completed).map((topic, index) => (
                <div key={topic.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-9 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{topic.title}</h5>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {index === 0 ? '2 days ago' : '5 days ago'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Completed this topic and understood all key concepts.
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Upcoming topics */}
              {plan.topics.filter(t => !t.completed).slice(0, 1).map(topic => (
                <div key={topic.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-9 h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} shadow-sm border-2 border-dashed border-yellow-300 dark:border-yellow-700`}>
                    <h5 className="font-medium">Up Next: {topic.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Ready to start this topic?
                    </p>
                    <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                      Begin Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Similar Plans */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4">Related Learning Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div 
              key={i}
              className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} hover:shadow-md transition`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Maths
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  14 days
                </span>
              </div>
              
              <h4 className="font-medium text-indigo-600 dark:text-indigo-400">
                {i === 1 ? 'Advanced Trigonometry' : 'Calculus Foundations'}
              </h4>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 mb-3">
                {i === 1
                  ? 'Take your trigonometry skills to the next level with advanced concepts and applications.'
                  : 'Build a strong foundation in calculus starting with limits, derivatives, and integrals.'
                }
              </p>
              
              <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition">
                View Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPlanPage;