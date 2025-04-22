import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Check, Clock, Users, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

type Resource = {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'document' | 'link';
};

type Topic = {
  id: string;
  title: string;
  completed: boolean;
};

export type LearningPlan = {
  id: string;
  title: string;
  description: string;
  subject: 'English' | 'Maths' | 'Science';
  topics: Topic[];
  resources: Resource[];
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
};

type LearningPlanCardProps = {
  plan: LearningPlan;
};

const LearningPlanCard = ({ plan }: LearningPlanCardProps) => {
  const { theme } = useTheme();
  const [following, setFollowing] = useState(plan.following || false);
  const [followersCount, setFollowersCount] = useState(plan.followers);
  const [expanded, setExpanded] = useState(false);
  
  // Get progress color based on completion percentage
  const getProgressColor = () => {
    if (plan.completionPercentage < 33) return 'bg-red-400';
    if (plan.completionPercentage < 67) return 'bg-yellow-400';
    return 'bg-green-500';
  };
  
  const handleFollow = () => {
    if (following) {
      setFollowersCount(prev => prev - 1);
    } else {
      setFollowersCount(prev => prev + 1);
    }
    setFollowing(!following);
  };
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Get subject badge color
  const getSubjectColor = () => {
    switch (plan.subject) {
      case 'English':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Maths':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Science':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md transition-all duration-200 hover:shadow-lg mb-6`}>
      {/* Plan Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <Link to={`/profile/${plan.user.username}`} className="flex items-center space-x-3">
            {plan.user.profilePicture ? (
              <img 
                src={plan.user.profilePicture} 
                alt={plan.user.name} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                  {plan.user.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium">{plan.user.name}</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSubjectColor()}`}>
              {plan.subject}
            </span>
          </div>
        </div>
        
        <Link to={`/learning-plan/${plan.id}`} className="block">
          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            {plan.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            {plan.description}
          </p>
        </Link>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{plan.topics.length} topics</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{plan.estimatedDays} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{followersCount} followers</span>
            </div>
          </div>
          
          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${
              following
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700">
        <div 
          className={`h-full rounded-r-full ${getProgressColor()}`}
          style={{ width: `${plan.completionPercentage}%` }}
        />
      </div>
      
      {/* Expandable Content */}
      <div className="p-4">
        <button
          onClick={toggleExpand}
          className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1 mb-3"
        >
          <span>{expanded ? 'Hide details' : 'Show details'}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {expanded && (
          <div className="space-y-4">
            {/* Topics List */}
            {plan.topics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Topics</h4>
                <ul className="pl-4 list-disc space-y-1">
                  {plan.topics.map(topic => (
                    <li key={topic.id} className="text-sm">
                      <div className="flex items-center space-x-2">
                        {topic.completed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={topic.completed ? 'line-through text-gray-400' : ''}>
                          {topic.title}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Resources */}
            {plan.resources.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Resources</h4>
                <ul className="space-y-2">
                  {plan.resources.map(resource => (
                    <li key={resource.id}>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {resource.type === 'video' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        )}
                        {resource.type === 'document' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        )}
                        {resource.type === 'link' && <ExternalLink className="h-4 w-4" />}
                        <span>{resource.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlanCard;