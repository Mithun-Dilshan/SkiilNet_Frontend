import { formatDistanceToNow } from 'date-fns';
import { Award, GraduationCap, BookOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export type ProgressTemplate = 
  | 'completed_lesson' 
  | 'learned_concept' 
  | 'took_quiz'
  | 'achievement';

export type ProgressUpdate = {
  id: string;
  template: ProgressTemplate;
  description: string;
  createdAt: string;
  subject: 'English' | 'Maths' | 'Science';
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
};

type ProgressUpdateCardProps = {
  update: ProgressUpdate;
};

const ProgressUpdateCard = ({ update }: ProgressUpdateCardProps) => {
  const { theme } = useTheme();
  
  // Get template details based on type
  const getTemplateDetails = () => {
    switch (update.template) {
      case 'completed_lesson':
        return {
          title: 'Completed Lesson',
          icon: <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />,
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-800 dark:text-green-300'
        };
      case 'learned_concept':
        return {
          title: 'Learned New Concept',
          icon: <GraduationCap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-800 dark:text-yellow-300'
        };
      case 'took_quiz':
        return {
          title: 'Took Quiz',
          icon: <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-800 dark:text-blue-300'
        };
      case 'achievement':
        return {
          title: 'Achievement Unlocked',
          icon: <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          textColor: 'text-purple-800 dark:text-purple-300'
        };
      default:
        return {
          title: 'Progress Update',
          icon: <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
          textColor: 'text-indigo-800 dark:text-indigo-300'
        };
    }
  };
  
  // Get subject badge color
  const getSubjectColor = () => {
    switch (update.subject) {
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
  
  const templateDetails = getTemplateDetails();
  
  return (
    <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md transition-all duration-200 hover:shadow-lg mb-6`}>
      {/* Card Header with Template Type */}
      <div className={`px-4 py-3 flex items-center justify-between ${templateDetails.bgColor}`}>
        <div className="flex items-center space-x-2">
          {templateDetails.icon}
          <span className={`font-medium ${templateDetails.textColor}`}>
            {templateDetails.title}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getSubjectColor()}`}>
          {update.subject}
        </span>
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-3">
          <Link to={`/profile/${update.user.username}`}>
            {update.user.profilePicture ? (
              <img 
                src={update.user.profilePicture} 
                alt={update.user.name} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                  {update.user.name.charAt(0)}
                </span>
              </div>
            )}
          </Link>
          
          <div className="flex flex-col">
            <Link to={`/profile/${update.user.username}`} className="font-medium hover:underline">
              {update.user.name}
            </Link>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <span>@{update.user.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        {/* Update Description */}
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {update.description}
        </p>
      </div>
    </div>
  );
};

export default ProgressUpdateCard;