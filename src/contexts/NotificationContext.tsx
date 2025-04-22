import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  read: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  contentId?: string;
  contentType?: 'post' | 'comment' | 'plan';
  content?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook for using notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    fromUser: {
      id: '2',
      name: 'Emma Wilson',
      username: 'emmaw',
      profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    contentId: 'post-1',
    contentType: 'post',
    content: 'Your Algebra Shortcuts post'
  },
  {
    id: '2',
    type: 'comment',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    fromUser: {
      id: '3',
      name: 'Mike Chen',
      username: 'mikechen',
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    contentId: 'post-2',
    contentType: 'post',
    content: 'Great explanation of photosynthesis!'
  },
  {
    id: '3',
    type: 'follow',
    read: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
    fromUser: {
      id: '4',
      name: 'Sara Lopez',
      username: 'saral',
      profilePicture: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  }
];

// Provider component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // Only load notifications if user is logged in
    if (user) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};