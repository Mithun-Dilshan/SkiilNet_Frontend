import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
        
        {/* Search Bar - Hide on smaller screens */}
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
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {/* Notifications */}
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
            
            {/* Notification Dropdown */}
            {showNotifications && <NotificationDropdown />}
          </div>
          
          {/* User Menu */}
          <Link to={`/profile/${user?.username}`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
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
    </header>
  );
};

export default Header;