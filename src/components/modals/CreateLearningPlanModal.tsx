import { useState } from 'react';
import { X, BookOpen, Clock, Users, Plus, Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type CreateLearningPlanModalProps = {
  onClose: () => void;
};

// Define topic type to match the existing LearningPlan structure
type Topic = {
  id: string;
  title: string;
  completed: boolean;
};

// Define resource type to match the existing LearningPlan structure
type Resource = {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'document' | 'video';
};

const CreateLearningPlanModal = ({ onClose }: CreateLearningPlanModalProps) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<'English' | 'Maths' | 'Science'>('Maths');
  const [estimatedDays, setEstimatedDays] = useState(14);
  
  // Topics state management
  const [topics, setTopics] = useState<Topic[]>([
    { id: `topic-${Date.now()}-1`, title: '', completed: false }
  ]);
  
  // Resources state management
  const [resources, setResources] = useState<Resource[]>([
    { id: `resource-${Date.now()}-1`, title: '', url: '', type: 'link' }
  ]);
  
  const [error, setError] = useState<string | null>(null);
  
  const addTopic = () => {
    setTopics([
      ...topics, 
      { id: `topic-${Date.now()}-${topics.length + 1}`, title: '', completed: false }
    ]);
  };
  
  const updateTopic = (id: string, title: string) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, title } : topic
    ));
  };
  
  const removeTopic = (id: string) => {
    if (topics.length > 1) {
      setTopics(topics.filter(topic => topic.id !== id));
    } else {
      setError('At least one topic is required');
    }
  };
  
  const addResource = () => {
    setResources([
      ...resources, 
      { id: `resource-${Date.now()}-${resources.length + 1}`, title: '', url: '', type: 'link' }
    ]);
  };
  
  const updateResource = (id: string, field: keyof Resource, value: string) => {
    setResources(resources.map(resource => 
      resource.id === id ? { ...resource, [field]: value } : resource
    ));
  };
  
  const removeResource = (id: string) => {
    if (resources.length > 1) {
      setResources(resources.filter(resource => resource.id !== id));
    } else {
      setError('At least one resource is required');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    // Validate topics
    const invalidTopic = topics.find(topic => !topic.title.trim());
    if (invalidTopic) {
      setError('All topics must have a title');
      return;
    }
    
    // Validate resources
    const invalidResource = resources.find(resource => !resource.title.trim() || !resource.url.trim());
    if (invalidResource) {
      setError('All resources must have a title and URL');
      return;
    }
    
    try {
      // TODO: Implement learning plan creation API call
      const newLearningPlan = {
        title,
        description,
        subject,
        topics,
        resources,
        estimatedDays,
        completionPercentage: 0, // Default for new plan
        followers: 0, // Default for new plan
        createdAt: new Date().toISOString(),
        user: {
          // Current user info would come from context or store
          id: '1',
          name: 'Current User',
          username: 'currentuser'
        }
      };
      
      console.log('Creating learning plan:', newLearningPlan);
      
      onClose();
    } catch (err) {
      setError('Failed to create learning plan');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-xl my-8`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Create Learning Plan</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Details */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Plan Title</label>
              <input
                type="text"  
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="E.g., Mastering Basic Trigonometry"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="Describe what students will learn in this plan..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as typeof subject)}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-white text-gray-900 border-gray-300' 
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="English">English</option>
                  <option value="Maths">Maths</option>
                  <option value="Science">Science</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Days</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>
          </div>
          
          {/* Topics Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Topics</h3>
              <button
                type="button"
                onClick={addTopic}
                className="flex items-center text-sm text-indigo-600 dark:text-indigo-400"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Topic
              </button>
            </div>
            
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div 
                  key={topic.id}
                  className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
                  } flex items-start`}
                >
                  <div className="flex-shrink-0 mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={topic.title}
                      onChange={(e) => updateTopic(topic.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-slate-600 text-white border-slate-500'
                          : 'bg-white text-gray-900 border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Topic title"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeTopic(topic.id)}
                    className="ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Resources Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Learning Resources</h3>
              <button
                type="button"
                onClick={addResource}
                className="flex items-center text-sm text-indigo-600 dark:text-indigo-400"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Resource
              </button>
            </div>
            
            <div className="space-y-4">
              {resources.map((resource) => (
                <div 
                  key={resource.id}
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Resource Title</label>
                      <input
                        type="text"
                        value={resource.title}
                        onChange={(e) => updateResource(resource.id, 'title', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-slate-600 text-white border-slate-500'
                            : 'bg-white text-gray-900 border-gray-300'
                        } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        placeholder="E.g., Interactive Unit Circle Tool"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">Resource Type</label>
                      <select
                        value={resource.type}
                        onChange={(e) => updateResource(resource.id, 'type', e.target.value as Resource['type'])}
                        className={`w-full px-3 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-slate-600 text-white border-slate-500'
                            : 'bg-white text-gray-900 border-gray-300'
                        } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      >
                        <option value="link">Link</option>
                        <option value="document">Document</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">URL</label>
                      <input
                        type="url"
                        value={resource.url}
                        onChange={(e) => updateResource(resource.id, 'url', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-slate-600 text-white border-slate-500'
                            : 'bg-white text-gray-900 border-gray-300'
                        } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        placeholder="https://example.com/resource"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeResource(resource.id)}
                      className="ml-3 mt-5 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">
              {error}
            </p>
          )}
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Create Learning Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLearningPlanModal;