import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Heart, MessageCircle, User, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Filter notifications
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);
  
  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);
  
  // Get notification icon and text based on type
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Unread
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-full text-sm font-medium bg-transparent text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition flex items-center space-x-1"
          >
            <Check className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>
      
      {/* Notifications List */}
      {Object.keys(groupedNotifications).length === 0 ? (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md p-8 text-center`}>
          <div className="flex justify-center mb-4">
            <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No notifications to show</p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            {filter === 'unread' ? 'You have read all your notifications' : 'You have no notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {date === new Date().toDateString() 
                  ? 'Today' 
                  : date === new Date(Date.now() - 86400000).toDateString()
                    ? 'Yesterday'
                    : date}
              </h2>
              
              <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
                {dateNotifications.map((notification, index) => {
                  const { icon, message } = getNotificationDetails(notification);
                  
                  return (
                    <div 
                      key={notification.id}
                      className={`relative p-4 ${
                        index !== dateNotifications.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''
                      } ${
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
                        
                        {/* Notification Content */}
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
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {message} 
                                {notification.content && (
                                  <span className="font-medium">{`: "${notification.content}"`}</span>
                                )}
                              </p>
                              
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            
                            {/* Mark as read button (only for unread) */}
                            {!notification.read && (
                              <button 
                                onClick={() => markAsRead(notification.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                                aria-label="Mark as read"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;