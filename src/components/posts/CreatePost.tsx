import React, { useState } from 'react';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import postsApi from '../../services/api/posts';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { theme } = useTheme();
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      const isVideoFile = file.type.startsWith('video/');
      const maxSize = isVideoFile ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
      
      if (file.size > maxSize) {
        setError(`File size should be less than ${isVideoFile ? '100MB' : '5MB'}`);
        return;
      }

      setSelectedFile(file);
      setIsVideo(isVideoFile);

     
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeMedia = () => {
    setSelectedFile(null);
    setMediaPreview(null);
    setIsVideo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await postsApi.createPost({
        description: description.trim(),
        file: selectedFile || undefined,
       
        userId: "temp-user-id"
      });
      
     
      setDescription('');
      setSelectedFile(null);
      setMediaPreview(null);
      setIsVideo(false);
      
      
      onPostCreated?.();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-4 mb-6`}>
      <h2 className="text-lg font-semibold mb-4">Create a Post</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            placeholder="Share your knowledge..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading}
          />
        </div>

        
        {mediaPreview && (
          <div className="relative mb-4">
            {isVideo ? (
              <video
                src={mediaPreview}
                controls
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Selected"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

       
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              type="file"
              id="media-upload"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <label
              htmlFor="media-upload"
              className={`inline-flex items-center px-3 py-2 rounded-lg cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isVideo ? (
                <Video className="h-5 w-5 mr-2" />
              ) : (
                <ImageIcon className="h-5 w-5 mr-2" />
              )}
              Add Media
            </label>
            <div className="text-sm text-gray-500">
              {!selectedFile && "(Images up to 5MB, Videos up to 100MB)"}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 