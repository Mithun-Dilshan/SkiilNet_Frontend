import { NavLink } from 'react-router-dom';
import { Home, User, Search, Bell, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

const MobileNav = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { unreadCount } = useNotification();
  
  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-6 w-6" /> },
    { name: 'Search', path: '/search', icon: <Search className="h-6 w-6" /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell className="h-6 w-6" />, badge: unreadCount },
    { name: 'Plans', path: '/my-plans', icon: <BookOpen className="h-6 w-6" /> },
    { name: 'Profile', path: `/profile/${user?.username}`, icon: <User className="h-6 w-6" /> },
  ];

  return (
    <nav className={`flex justify-around items-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-lg py-3`}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center relative
            ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
          `}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
          
          {item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;