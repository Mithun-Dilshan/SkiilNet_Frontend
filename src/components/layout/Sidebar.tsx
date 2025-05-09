import { NavLink } from 'react-router-dom';
import { Home, User, Search, Bell, BookOpen, LogOut, Edit } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import EditProfileForm from '../user/EditProfileForm';
import useUserProfile from '../../hooks/useUserProfile';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const {
    userData,
    editedProfile,
    updateSuccess,
    updateError,
    isSubmitting,
    handleEditChange,
    handleProfileUpdate
  } = useUserProfile({ userId: user?.username, initialLoad: false });
  
  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Profile', path: `/profile/${user?.username}`, icon: <User className="h-5 w-5" /> },
    { name: 'Search', path: '/search', icon: <Search className="h-5 w-5" /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell className="h-5 w-5" /> },
    { name: 'My Learning Plans', path: '/my-plans', icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <aside className={`w-64 h-screen sticky top-16 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm overflow-y-auto p-4`}>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
              ${isActive 
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                : 'hover:bg-gray-100 dark:hover:bg-slate-700'}
            `}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
        
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-red-500"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </nav>
      
      <div className={`mt-auto pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} mt-8`}>
        <div className="flex items-center space-x-3 px-4 py-2">
          {user?.profilePictureUrl ? (
            <img 
              src={user.profilePictureUrl} 
              alt={user.name} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{user?.name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</span>
          </div>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="ml-auto p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            title="Edit Profile"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {isEditingProfile && (
        <EditProfileForm
          editedProfile={editedProfile}
          onCancel={() => setIsEditingProfile(false)}
          onSave={() => {
            handleProfileUpdate();
            setIsEditingProfile(false);
          }}
          onChange={handleEditChange}
          updateSuccess={updateSuccess}
          updateError={updateError}
          isSubmitting={isSubmitting}
        />
      )}
    </aside>
  );
};

export default Sidebar;