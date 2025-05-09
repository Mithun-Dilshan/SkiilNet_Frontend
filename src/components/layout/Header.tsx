import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, User, Menu, Edit, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import EditProfileForm from '../user/EditProfileForm';
import useUserProfile from '../../hooks/useUserProfile';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const {
    editedProfile,
    updateSuccess,
    updateError,
    isSubmitting,
    handleEditChange,
    handleProfileUpdate
  } = useUserProfile({ userId: user?.username, initialLoad: false });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  return (
    <header className={`sticky top-0 z-20 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-indigo-600">SkillNet</span>
        </Link>
        
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search users, skills, or plans..."
              className={`w-full py-2 pl-10 pr-4 rounded-full ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleNotifications} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && <NotificationDropdown />}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <Link to={`/profile/${user?.username}`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              {user?.profilePictureUrl ? (
                <img 
                  src={user.profilePictureUrl} 
                  alt={user.name} 
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Link>
          </div>
          
          <button 
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search..."
            className={`w-full py-2 pl-10 pr-4 rounded-full ${
              theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </form>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className={`md:hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} px-4 pb-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3 py-3">
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
              className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              title="Edit Profile"
            >
              <Edit className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-1 py-2">
            <Link to="/" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              Home
            </Link>
            <Link to={`/profile/${user?.username}`} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              Profile
            </Link>
            <Link to="/search" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              Search
            </Link>
            <Link to="/notifications" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              Notifications
            </Link>
            <Link to="/my-plans" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              My Learning Plans
            </Link>
            <button 
              onClick={logout}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-red-500"
            >
              Log Out
            </button>
          </nav>
        </div>
      )}
      
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
    </header>
  );
};

export default Header;