import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Book, Clock, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LearningPlan, getUserLearningPlans } from '../services/api/learningPlans';

const MyLearningPlansPage = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) {
        setError('You must be logged in to view your learning plans');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userPlans = await getUserLearningPlans(user.id);
        setPlans(userPlans);
      } catch (err) {
        console.error('Error fetching learning plans:', err);
        setError('Failed to load learning plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user]);

  const handleCreatePlan = () => {
    navigate('/create-learning-plan');
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
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
        {!isAuthenticated && (
          <Link 
            to="/login" 
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
          >
            Login to Continue
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Learning Plans</h1>
        <button
          onClick={handleCreatePlan}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any learning plans yet.</p>
          <button
            onClick={handleCreatePlan}
            className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/learning-plan/${plan.id}`}
              className={`block rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md transition hover:shadow-lg`}
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  plan.subject === 'Maths'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : plan.subject === 'English'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {plan.subject}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{plan.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {plan.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Book className="h-4 w-4 mr-1" />
                      <span className="text-xs">{plan.topics.length}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-xs">{plan.estimatedDays} days</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-xs">{plan.followers}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          plan.completionPercentage < 33 ? 'bg-red-400' : 
                          plan.completionPercentage < 67 ? 'bg-yellow-400' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${plan.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">
                      {plan.completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearningPlansPage; 