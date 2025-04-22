import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Edit2, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export type Comment = {
  id: string;
  postId: string;
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  pinned?: boolean;
};

type CommentSectionProps = {
  postId: string;
};

// Mock data
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    user: {
      id: '2',
      name: 'Emma Wilson',
      username: 'emmaw',
      profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    content: 'This is so helpful! I\'ve been struggling with these concepts for a while.',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    pinned: true
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    user: {
      id: '3',
      name: 'Mike Chen',
      username: 'mikechen',
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    content: 'Could you explain the second example a bit more?',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
  }
];

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  useEffect(() => {
    // Simulate API call to get comments
    setLoading(true);
    setTimeout(() => {
      setComments(mockComments.filter(c => c.postId === postId));
      setLoading(false);
    }, 500);
  }, [postId]);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    // Create new comment
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture
      },
      content: newComment,
      createdAt: new Date().toISOString()
    };
    
    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
  };
  
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };
  
  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingCommentId) return;
    
    setComments(prev => 
      prev.map(comment => 
        comment.id === editingCommentId 
          ? { ...comment, content: editContent } 
          : comment
      )
    );
    
    setEditingCommentId(null);
    setEditContent('');
  };
  
  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };
  
  const handlePinComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => ({
        ...comment,
        pinned: comment.id === commentId ? true : false
      }))
    );
  };
  
  // Sort comments: pinned first, then by date
  const sortedComments = [...comments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return (
    <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'} px-4 py-3`}>
      {/* Add comment form */}
      <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 mb-4">
        {user?.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name} 
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              {user?.name.charAt(0)}
            </span>
          </div>
        )}
        
        <input
          type="text"
          placeholder="Add a comment..."
          className={`flex-1 rounded-full py-2 px-4 ${
            theme === 'dark' 
              ? 'bg-slate-700 text-white border-slate-600' 
              : 'bg-gray-100 text-gray-900 border-gray-200'
          } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        
        <button 
          type="submit"
          disabled={!newComment.trim()}
          className={`p-2 rounded-full ${
            newComment.trim() 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          } transition`}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      
      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            sortedComments.map(comment => (
              <div 
                key={comment.id} 
                className={`relative ${
                  comment.pinned 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 pl-3' 
                    : ''
                }`}
              >
                {comment.pinned && (
                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400 text-xs font-medium mb-1">
                    <Star className="h-3 w-3" />
                    <span>Pinned comment</span>
                  </div>
                )}
                
                <div className="flex items-start space-x-2">
                  <Link to={`/profile/${comment.user.username}`}>
                    {comment.user.profilePicture ? (
                      <img 
                        src={comment.user.profilePicture} 
                        alt={comment.user.name} 
                        className="h-8 w-8 rounded-full object-cover mt-1"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                        <span className="text-indigo-600 font-medium">
                          {comment.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="flex-1">
                    <div className={`rounded-lg py-2 px-3 ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Link to={`/profile/${comment.user.username}`} className="font-medium hover:underline">
                          {comment.user.name}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            className={`w-full rounded py-2 px-3 ${
                              theme === 'dark' 
                                ? 'bg-slate-600 text-white border-slate-500' 
                                : 'bg-white text-gray-900 border-gray-300'
                            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-600"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleSaveEdit}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                          {comment.content}
                        </p>
                      )}
                    </div>
                    
                    {/* Comment actions */}
                    {user && editingCommentId !== comment.id && (
                      <div className="flex items-center space-x-3 mt-1 pl-1">
                        {/* Show edit/delete for user's own comments */}
                        {user.id === comment.user.id && (
                          <>
                            <button 
                              onClick={() => handleEditComment(comment)}
                              className="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                        
                        {/* Show pin for post owner (mock - assuming current user is post owner) */}
                        {!comment.pinned && (
                          <button 
                            onClick={() => handlePinComment(comment.id)}
                            className="text-xs text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 flex items-center space-x-1"
                          >
                            <Star className="h-3 w-3" />
                            <span>Pin</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;