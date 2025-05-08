import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Plus, Edit, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getAllLearningPlans, getUserLearningPlans, LearningPlan } from '../services/api/learningPlans';

const LearningPlanListPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'my'>('all');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        let data: LearningPlan[];

        if (filter === 'my' && user) {
          data = await getUserLearningPlans(user.id);
        } else {
          data = await getAllLearningPlans();
        }

        console.log('Fetched learning plans:', data);
        setPlans(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching learning plans:', err);
        setError('Failed to load learning plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [filter, user]);

  const getSubjectClass = (subject: string | null | undefined) => {
    if (!subject) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
    
    switch (subject.toLowerCase()) {
      case 'maths':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'english':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'science':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Learning Plans</h1>
        <div className="flex space-x-4">
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              All Plans
            </button>
            {user && (
              <button
                onClick={() => setFilter('my')}
                className={`px-4 py-2 ${
                  filter === 'my'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                My Plans
              </button>
            )}
          </div>
          <Link
            to="/create-learning-plan"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className={`col-span-full rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'my' ? 'You haven\'t created any learning plans yet.' : 'No learning plans found.'}
            </p>
            <Link
              to="/create-learning-plan"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
            >
              Create Your First Plan
            </Link>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md hover:shadow-lg transition`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getSubjectClass(plan.subject)}`}>
                    {plan.subject || 'Uncategorized'}
                  </span>
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">{plan.followers}</span>
                  </div>
                </div>

                <Link to={`/learning-plan/${plan.id}`} className="block">
                  <h2 className="text-xl font-bold mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    {plan.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {plan.description}
                  </p>
                </Link>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs">{plan.topics.length}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">{plan.estimatedDays} days</span>
                    </div>
                    {user && plan.userId === user.id && (
                      <Link to={`/edit-learning-plan/${plan.id}`} className="flex items-center space-x-1 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300">
                        <Edit className="h-4 w-4" />
                        <span className="text-xs">Edit</span>
                      </Link>
                    )}
                  </div>

                  <Link
                    to={`/profile/${plan.user?.username || 'unknown'}`}
                    className="flex items-center space-x-2 hover:underline"
                  >
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
                    <span className="text-xs text-gray-600 dark:text-gray-300">{plan.user?.name || 'Unknown User'}</span>
                  </Link>
                </div>

                {/* Follow button for plans that aren't the user's */}
                {user && plan.userId !== user.id && (
                  <div className="mb-3">
                    <button
                      className={`w-full flex justify-center items-center space-x-1 text-xs py-1 px-2 rounded ${
                        plan.following
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
                      }`}
                    >
                      <Star className={`h-3 w-3 ${plan.following ? 'fill-indigo-500' : ''}`} />
                      <span>{plan.following ? 'Following' : 'Follow Plan'}</span>
                    </button>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${plan.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Progress
                    </span>
                    <span className="text-xs font-medium">
                      {plan.completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearningPlanListPage; 