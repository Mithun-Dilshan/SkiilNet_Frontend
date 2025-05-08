import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  getLearningPlanById,
  updateLearningPlan,
  LearningPlan,
  Resource, 
  Topic 
} from '../services/api/learningPlans';

// Subject options
const SUBJECTS = ['Maths', 'Science', 'English', 'History', 'Technology', 'Arts', 'Other'];
const RESOURCE_TYPES = ['link', 'document', 'video'];

const EditLearningPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [originalPlan, setOriginalPlan] = useState<LearningPlan | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [estimatedDays, setEstimatedDays] = useState(7);
  const [topics, setTopics] = useState<Topic[]>([
    { id: '', title: '', completed: false }
  ]);
  const [resources, setResources] = useState<Resource[]>([
    { id: '', title: '', url: '', type: 'link' as const }
  ]);

  // Fetch the learning plan to edit
  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const planData = await getLearningPlanById(id);
        setOriginalPlan(planData);
        
        // Initialize form with existing data
        setTitle(planData.title);
        setDescription(planData.description);
        setSubject(planData.subject || SUBJECTS[0]);
        setEstimatedDays(planData.estimatedDays);
        setTopics(planData.topics || []);
        setResources(planData.resources || []);
        
        // Security check - make sure the user owns this plan
        if (user && planData.userId !== user.id) {
          setError("You don't have permission to edit this learning plan");
          navigate('/my-plans');
        }
        
      } catch (err) {
        console.error('Error fetching learning plan:', err);
        setError('Failed to load learning plan. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, user, navigate]);

  const handleAddTopic = () => {
    const newTopic = { 
      id: `topic-${Date.now()}-${topics.length}`,
      title: '', 
      completed: false 
    };
    setTopics([...topics, newTopic]);
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index].title = value;
    setTopics(newTopics);
  };

  const handleAddResource = () => {
    const newResource = { 
      id: `resource-${Date.now()}-${resources.length}`,
      title: '', 
      url: '', 
      type: 'link' as const 
    };
    setResources([...resources, newResource]);
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleResourceChange = (index: number, field: keyof Omit<Resource, 'id'>, value: string) => {
    const newResources = [...resources];
    newResources[index] = { ...newResources[index], [field]: value };
    setResources(newResources);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id || !originalPlan) {
      setError('Unable to update plan. Missing required information.');
      return;
    }

    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (topics.some(topic => !topic.title.trim())) {
      setError('All topics must have a title');
      return;
    }

    if (resources.some(resource => !resource.title.trim() || !resource.url.trim())) {
      setError('All resources must have a title and URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSubmitSuccess(false);

      // Create update object
      const updatedPlan = {
        id,
        title,
        description,
        subject,
        topics,
        resources,
        estimatedDays,
        // Preserve other fields
        userId: originalPlan.userId,
        followers: originalPlan.followers,
        following: originalPlan.following,
        createdAt: originalPlan.createdAt
      };

      console.log('Updating plan:', updatedPlan);
      const updated = await updateLearningPlan(user.id, id, updatedPlan);
      console.log('Updated plan:', updated);
      
      setSubmitSuccess(true);
      
      // Redirect to the updated plan after a short delay
      setTimeout(() => {
        navigate(`/learning-plan/${id}`);
      }, 1000);
    } catch (err: any) {
      console.error('Error updating learning plan:', err);
      setError(err?.response?.data?.message || 'Failed to update learning plan. Please try again later.');
    } finally {
      setLoading(false);
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
    <div className="max-w-3xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Edit Learning Plan</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Learning plan updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
          <h2 className="text-lg font-bold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="e.g., Mastering Basic Trigonometry"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Describe what learners will gain from this plan..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="estimatedDays" className="block text-sm font-medium mb-1">
                  Estimated Days to Complete
                </label>
                <input
                  id="estimatedDays"
                  type="number"
                  min="1"
                  max="365"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 7)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Topics</h2>
            <button
              type="button"
              onClick={handleAddTopic}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Topic
            </button>
          </div>

          <div className="space-y-3">
            {topics.map((topic, index) => (
              <div key={topic.id || index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  placeholder={`Topic ${index + 1}`}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                {topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(index)}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Resources</h2>
            <button
              type="button"
              onClick={handleAddResource}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Resource
            </button>
          </div>

          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div key={resource.id || index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resource.title}
                    onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                    placeholder="Resource Title"
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={resource.type}
                    onChange={(e) => handleResourceChange(index, 'type', e.target.value as any)}
                    className={`w-32 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {resources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(index)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={resource.url}
                  onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                  placeholder="URL (e.g., https://example.com)"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Learning Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLearningPlanPage; 