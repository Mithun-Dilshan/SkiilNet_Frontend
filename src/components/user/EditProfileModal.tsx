import { useState, useRef } from 'react';
import { X, Upload, Image } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../services/api/axiosConfig';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
  currentProfile: {
    id: string;
    name: string;
    username: string;
    bio?: string;
    profilePicture?: string;
  };
}

interface UploadResponse {
  url: string;
}

interface ProfileResponse {
  fullName: string;
  bio: string;
  profilePictureUrl: string;
}

const EditProfileModal = ({ isOpen, onClose, onUpdate, currentProfile }: EditProfileModalProps) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: currentProfile.name,
    bio: currentProfile.bio || '',
    profilePictureUrl: currentProfile.profilePicture || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentProfile.profilePicture || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let profilePictureUrl = formData.profilePictureUrl;

      // If a new file is selected, upload it first
      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', selectedFile);
        
        const uploadResponse = await axios.post<UploadResponse>('/api/upload/profile-picture', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        profilePictureUrl = uploadResponse.data.url;
      }

      // Update profile with the new data
      const response = await axios.put<ProfileResponse>(`/users/${currentProfile.id}/profile`, {
        ...formData,
        profilePictureUrl
      });
      
      if (response.data) {
        onUpdate({
          ...currentProfile,
          name: response.data.fullName,
          bio: response.data.bio,
          profilePicture: response.data.profilePictureUrl
        });
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={previewUrl || 'https://via.placeholder.com/150'}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-700"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the upload button to change your profile picture
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600' 
                  : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600' 
                  : 'bg-white border-gray-300'
              }`}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture URL (optional)</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={formData.profilePictureUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, profilePictureUrl: e.target.value }));
                  setPreviewUrl(e.target.value);
                }}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="https://example.com/profile-picture.jpg"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, profilePictureUrl: '' }));
                  setPreviewUrl('');
                }}
                className={`px-3 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Clear
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Or enter a URL for your profile picture
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-slate-700 hover:bg-slate-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 