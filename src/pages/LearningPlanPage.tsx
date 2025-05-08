import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Check, 
  ArrowLeft, 
  Star, 
  Edit, 
  Trash 
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LearningPlan, 
  getLearningPlanById,
  followLearningPlan,
  unfollowLearningPlan,
  markTopicAsCompleted,
  deleteLearningPlan
} from '../services/api/learningPlans';
import { useAuth } from '../contexts/AuthContext';

const LearningPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'progress'>('overview');

  useEffect(() => {
    if (!id) return;

    const fetchPlan = async () => {
      try {
        setLoading(true);
        const data = await getLearningPlanById(id);
        setPlan(data);
        setFollowing(data.following);
        setError(null);
      } catch (err) {
        console.error('Error fetching learning plan:', err);
        setError('Failed to load learning plan. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!plan || !id) return;
    
    try {
      const userId = user?.id || '1'; 
      
      let updatedPlan;
      if (following) {
        updatedPlan = await unfollowLearningPlan(id, userId);
      } else {
        updatedPlan = await followLearningPlan(id, userId);
      }
      
      setPlan(updatedPlan);
      setFollowing(updatedPlan.following);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  const handleMarkCompleted = async (topicId: string, completed: boolean) => {
    if (!plan || !id) return;
    
    try {
      const userId = user?.id || '1'; 
      const updatedPlan = await markTopicAsCompleted(userId, id, topicId, completed);
      setPlan(updatedPlan);
    } catch (err) {
      console.error('Error updating topic completion:', err);
    }
  };
  
  const handleDeletePlan = async () => {
    if (!plan || !id || !window.confirm('Are you sure you want to delete this learning plan?')) return;
    
    try {
      const userId = user?.id || '1'; 
      await deleteLearningPlan(userId, id);
      navigate('/my-plans');
    } catch (err) {
      console.error('Error deleting learning plan:', err);
    }
  };
  
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
  
  if (error) {
    return (
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <Link 
          to="/search" 
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
        >
          Browse Plans
        </Link>
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
  
  const isOwner = user && user.id === plan.userId;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/my-plans" className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Learning Plan</h1>
        
        {isOwner && (
          <div className="ml-auto flex space-x-2">
            <Link to={`/edit-learning-plan/${plan.id}`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition text-gray-600 dark:text-gray-300">
              <Edit className="h-5 w-5" />
            </Link>
            <button onClick={handleDeletePlan} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition text-red-500">
              <Trash className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md mb-6`}>
        <div className="p-6 pb-0">
          <div className="flex justify-between">
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
            
            <Link to={`/profile/${plan.user?.username || 'unknown'}`} className="flex items-center space-x-2 hover:underline">
              {plan.user?.profilePicture ? (
                <img 
                  src={plan.user.profilePicture} 
                  alt={plan.user?.name || 'Unknown User'} 
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                    {(plan.user?.name || 'U').charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm">{plan.user?.name || 'Unknown User'}</span>
            </Link>
          </div>
        </div>
        
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
                  <span className="font-bold">{plan.followers}</span> 
                  <span className="text-gray-500 dark:text-gray-400"> followers</span>
                </span>
              </div>
            </div>
            
            {!isOwner && (
              <button
                onClick={handleToggleFollow}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                  following
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Star className={`mr-1.5 h-4 w-4 ${following ? 'fill-current' : ''}`} />
                {following ? 'Following' : 'Follow Plan'}
              </button>
            )}
          </div>
          
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
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
              activeTab === 'overview' 
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
              activeTab === 'resources' 
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Resources ({plan.resources.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
              activeTab === 'progress' 
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Progress
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Topics</h3>
            <div className="space-y-3">
              {plan.topics.map((topic, index) => (
                <div 
                  key={topic.id} 
                  className={`flex items-start p-3 rounded-lg ${
                    topic.completed 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="mr-3">
                    <div className={`flex h-6 w-6 rounded-full items-center justify-center ${
                      topic.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {topic.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`font-medium ${topic.completed ? 'line-through opacity-70' : ''}`}>
                        {topic.title}
                      </h4>
                      <button
                        onClick={() => handleMarkCompleted(topic.id, !topic.completed)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          topic.completed
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                        }`}
                      >
                        {topic.completed ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Learning Resources</h3>
            {plan.resources.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">No resources available for this learning plan.</p>
            ) : (
              <div className="space-y-4">
                {plan.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-4 rounded-lg border ${
                      theme === 'dark' ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'
                    } transition`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${
                        resource.type === 'video' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                          : resource.type === 'document'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      }`}>
                        {resource.type === 'video' ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : resource.type === 'document' ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">{resource.url}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Your Progress</h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm font-bold">
                  {plan.topics.filter(t => t.completed).length} / {plan.topics.length}
                </span>
              </div>
              
              <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${plan.completionPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
              
              {plan.topics.filter(t => t.completed).map((topic, index) => (
                <div key={topic.id} className="relative mb-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-5 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} shadow-sm`}>
                    <div className="flex justify-between mb-1">
                      <h5 className="font-medium">{topic.title}</h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Completed
                    </p>
                    <button 
                      onClick={() => handleMarkCompleted(topic.id, false)}
                      className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Mark as Incomplete
                    </button>
                  </div>
                </div>
              ))}
              
              {plan.topics.filter(t => !t.completed).map((topic, index) => (
                <div key={topic.id} className="relative mb-6">
                  <div className="absolute -left-5 h-6 w-6 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} shadow-sm ${
                    index === 0 ? 'border-2 border-dashed border-yellow-300 dark:border-yellow-700' : ''
                  }`}>
                    <h5 className="font-medium">{topic.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {index === 0 ? "Up next to complete" : "To be completed"}
                    </p>
                    <button 
                      onClick={() => handleMarkCompleted(topic.id, true)}
                      className="mt-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition"
                    >
                      Mark as Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlanPage;