import { useParams } from 'react-router-dom';
import UserProfile from '../components/user/UserProfile';
import useUserProfile from '../hooks/useUserProfile';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  
  const {
    userData,
    loading,
    isEditing,
    setIsEditing,
    editedProfile,
    updateSuccess,
    updateError,
    isCurrentUserProfile,
    handleEditChange,
    handleProfileUpdate
  } = useUserProfile({ userId: username });
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <UserProfile 
        userProfile={userData}
        posts={[]}
        plans={[]}
        progressUpdates={[]}
        isEditable={isCurrentUserProfile}
        onEditClick={() => setIsEditing(true)}
      />
      
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
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
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="fullName"
                value={editedProfile.fullName}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={editedProfile.bio}
                onChange={handleEditChange}
                rows={4}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
              <input
                type="text"
                name="profilePictureUrl"
                value={editedProfile.profilePictureUrl}
                onChange={handleEditChange}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;