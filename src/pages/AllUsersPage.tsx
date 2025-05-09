import { useState, useEffect } from 'react';
import { getAllUsers, UserProfileApiResponse } from '../services/api/users';
import UserCard from '../components/user/UserCard';
import { useTheme } from '../contexts/ThemeContext';

// Extend API response type to include follow status
interface UserWithFollowStatus extends UserProfileApiResponse {
  isFollowing?: boolean;
}

const AllUsersPage = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        
        // The backend now provides the isFollowing status for each user
        // We just need to ensure the type is correct
        const usersWithFollowStatus = response.map(user => ({
          ...user,
          isFollowing: user.isFollowing || false
        }));
        
        setUsers(usersWithFollowStatus);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleFollowStatusChange = (userId: string, isFollowing: boolean) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.userId === userId 
          ? { ...user, isFollowing } 
          : user
      )
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map(user => (
            <UserCard 
              key={user.userId} 
              user={user} 
              onFollowStatusChange={handleFollowStatusChange}
            />
          ))}
          
          {users.length === 0 && (
            <div className={`col-span-full text-center p-8 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <p className="text-gray-600 dark:text-gray-400">No users found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllUsersPage; 