import { useParams } from 'react-router-dom';
import UserProfile from '../components/user/UserProfile';
import UserPosts from '../components/user/UserPosts';
import EditProfileForm from '../components/user/EditProfileForm';
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
    isSubmitting,
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
    <div className="space-y-6">
      <UserProfile 
        userProfile={userData}
        posts={[]}
        plans={[]}
        progressUpdates={[]}
        isEditable={isCurrentUserProfile}
        onEditClick={() => setIsEditing(true)}
      />
      
      <UserPosts userId={userData.id} />
      
      {isEditing && (
        <EditProfileForm
          editedProfile={editedProfile}
          onCancel={() => setIsEditing(false)}
          onSave={handleProfileUpdate}
          onChange={handleEditChange}
          updateSuccess={updateSuccess}
          updateError={updateError}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ProfilePage;