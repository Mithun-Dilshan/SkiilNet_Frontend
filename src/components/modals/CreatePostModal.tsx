import { useState } from 'react';
import { X, Upload, Image as ImageIcon, X as XIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type CreatePostModalProps = {
  onClose: () => void;
};

const CreatePostModal = ({ onClose }: CreatePostModalProps) => {
  const { theme } = useTheme();
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<'English' | 'Maths' | 'Science'>('English');
  const [media, setMedia] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + media.length > 3) {
      setError('Maximum 3 files allowed');
      return;
    }
    
    const invalidFile = files.find(file => 
      !['image/jpeg', 'image/png', 'video/mp4'].includes(file.type)
    );
    
    if (invalidFile) {
      setError('Only JPG, PNG images and MP4 videos are allowed');
      return;
    }
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMedia(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }
    
    try {
      // TODO: Implement post creation API call
      onClose();
    } catch (err) {
      setError('Failed to create post');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-2xl rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Create Post</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Subject Selection */}
          <div className="mb-4">
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
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Share your knowledge..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/1000 characters
            </p>
          </div>
          
          {/* Media Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Media</label>
            
            {/* Preview Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            {media.length < 3 && (
              <div className="flex items-center justify-center">
                <label className={`flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed ${
                  theme === 'dark'
                    ? 'border-slate-600 hover:border-slate-500'
                    : 'border-gray-300 hover:border-gray-400'
                } cursor-pointer transition`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload images or videos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or MP4 (max 3 files)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,video/mp4"
                    onChange={handleMediaChange}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">
              {error}
            </p>
          )}
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3">
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
              Share Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;