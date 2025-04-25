import { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

type EditProfileModalProps = {
  onClose: () => void;
};

const EditProfileModal = ({ onClose }: EditProfileModalProps) => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPG and PNG files are allowed');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (bio.length > 500) {
      setError('Bio must be less than 500 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the provided API endpoint to create the profile
      const userId = user?.id || '9396b756-d8ac-4883-9266-3a51c1054b3e'; // Use the user ID from context or fallback
      
      // Prepare the data for API call
      const formData = new FormData();
      formData.append('bio', bio);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      formData.append('name', name);
      if (skills.length > 0) {
        formData.append('skills', JSON.stringify(skills));
      }
      
      // Make the API call
      const response = await fetch(`http://localhost:8080/api/users/${userId}/profile`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create profile');
      }
      
      // If auth context has an updateProfile method, update the local user data too
      if (updateProfile) {
        await updateProfile({ name, bio, profilePicture, skills });
      }
      
      onClose();
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-lg rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Create Profile</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile preview" 
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 p-1 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition">
                <Upload className="h-4 w-4" />
                <input 
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className={`w-full px-3 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Your name"
            />
          </div>
          
          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Tell us about yourself"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {bio.length}/500 characters
            </p>
          </div>
          
          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {['English', 'Maths', 'Science', 'History', 'Art', 'Music', 'Programming', 'Physics', 'Chemistry'].map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    skills.includes(skill)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {skill}
                </button>
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
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;