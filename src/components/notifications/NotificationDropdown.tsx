import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

const NotificationDropdown = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const { theme } = useTheme();
  
  const getNotificationDetails = (notification: typeof notifications[0]) => {
    switch (notification.type) {
      case 'like':
        return {
          icon: <Heart className="h-5 w-5 text-red-500" />,
          message: `liked your ${notification.contentType}`
        };
      case 'comment':
        return {
          icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
          message: `commented on your ${notification.contentType}`
        };
      case 'follow':
        return {
          icon: <User className="h-5 w-5 text-indigo-500" />,
          message: 'started following you'
        };
      default:
        return {
          icon: <Bell className="h-5 w-5 text-gray-500" />,
          message: 'sent you a notification'
        };
    }
  };
  
  return (
    <div 
      className={`absolute right-0 top-12 w-80 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      } shadow-lg rounded-lg overflow-hidden z-30`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-medium">Notifications</h3>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={markAllAsRead}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Mark all as read
          </button>
          <Link 
            to="/notifications"
            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
          >
            See all
          </Link>
        </div>
      </div>
      
      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-gray-500 dark:text-gray-400">
            No notifications yet
          </div>
        ) : (
          <ul>
            {notifications.map(notification => {
              const { icon, message } = getNotificationDetails(notification);
              
              return (
                <li 
                  key={notification.id}
                  className={`relative p-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <Link to={`/profile/${notification.fromUser.username}`}>
                      {notification.fromUser.profilePicture ? (
                        <img 
                          src={notification.fromUser.profilePicture} 
                          alt={notification.fromUser.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                            {notification.fromUser.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-1">
                            <Link 
                              to={`/profile/${notification.fromUser.username}`} 
                              className="font-medium hover:underline"
                            >
                              {notification.fromUser.name}
                            </Link>
                            <div className="flex-shrink-0">
                              {icon}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {message} 
                            {notification.content && (
                              <span className="font-medium">{`: "${notification.content}"`}</span>
                            )}
                          </p>
                          
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Mark as read"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;