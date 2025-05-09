import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Upload, X } from 'lucide-react';

interface EditProfileFormProps {
  editedProfile: {
    fullName: string;
    bio: string;
    profilePictureUrl: string;
  };
  onCancel: () => void;
  onSave: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  updateSuccess: boolean;
  updateError: string;
  isSubmitting?: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  editedProfile,
  onCancel,
  onSave,
  onChange,
  updateSuccess,
  updateError,
  isSubmitting = false
}) => {
  const { theme } = useTheme();
  const [previewImage, setPreviewImage] = useState<string | null>(editedProfile.profilePictureUrl || null);
  const [file, setFile] = useState<File | null>(null);

  // Handle direct image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
          
          // Update the profilePictureUrl in the parent component
          const syntheticEvent = {
            target: {
              name: 'profilePictureUrl',
              value: event.target.result
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          onChange(syntheticEvent);
          setFile(selectedFile);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const clearImage = () => {
    setPreviewImage(null);
    setFile(null);
    
    // Clear the profilePictureUrl in the parent component
    const syntheticEvent = {
      target: {
        name: 'profilePictureUrl',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        
        {updateSuccess && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            Profile updated successfully!
          </div>
        )}
        
        {updateError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {updateError}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Profile Picture</label>
          
          <div className="flex items-center space-x-4 mb-2">
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Profile Preview" 
                  className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-gray-400 font-medium">No Image</span>
              </div>
            )}
            
            <div>
              <label
                htmlFor="profile-picture-upload"
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-700 transition"
              >
                <Upload size={16} className="mr-2" />
                Upload Photo
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or GIF (max 2MB)</p>
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Or enter image URL</label>
            <input
              type="text"
              name="profilePictureUrl"
              value={editedProfile.profilePictureUrl}
              onChange={(e) => {
                onChange(e);
                setPreviewImage(e.target.value);
              }}
              placeholder="https://example.com/profile.jpg"
              className={`w-full p-2 border rounded-lg ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="fullName"
            value={editedProfile.fullName}
            onChange={onChange}
            className={`w-full p-2 border rounded-lg ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={editedProfile.bio}
            onChange={onChange}
            rows={4}
            placeholder="Tell others about yourself..."
            className={`w-full p-2 border rounded-lg ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm; 