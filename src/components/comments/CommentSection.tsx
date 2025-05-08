import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import commentsApi, { Comment } from '../../services/api/comments';

type CommentSectionProps = {
  postId: string;
  onCommentCountChange?: (count: number) => void;
};

const CommentSection = ({ postId, onCommentCountChange }: CommentSectionProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get userId from auth or localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(user?.id || storedUserId || '');
  }, [user]);
  
  const updateCommentCount = (newComments: Comment[]) => {
    setComments(newComments);
    onCommentCountChange?.(newComments.length);
  };
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await commentsApi.getCommentsByPostId(postId);
      updateCommentCount(fetchedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const commentData = {
        userId: userId,
        content: newComment.trim()
      };
      
      const createdComment = await commentsApi.createComment(postId, commentData);
      updateCommentCount([createdComment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditComment = async () => {
    if (!editContent.trim() || !editingCommentId || !userId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const commentData = {
        userId: userId,
        content: editContent.trim()
      };
      
      await commentsApi.updateComment(editingCommentId, userId, commentData);
      
      const updatedComments = comments.map(comment => 
        comment.id === editingCommentId 
          ? { ...comment, content: editContent.trim() } 
          : comment
      );
      updateCommentCount(updatedComments);
      
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!userId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await commentsApi.deleteComment(commentId, userId);
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      updateCommentCount(updatedComments);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'} px-4 py-3`}>
      {/* Comment count */}
      <div className="mb-4">
        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>
      
      {/* Add comment form */}
      {userId ? (
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              {user?.name?.[0] || userId[0] || 'U'}
            </span>
          </div>
          
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
            disabled={isSubmitting}
          />
          
          <button 
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className={`p-2 rounded-full ${
              newComment.trim() && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } transition`}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-2">
          Please <Link to="/login" className="text-indigo-600 hover:underline">log in</Link> to comment.
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
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
              <div key={comment.id} className="flex space-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {comment.userId[0]}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/profile/${comment.userId}`} 
                      className="font-medium text-gray-900 dark:text-white hover:underline"
                    >
                      User {comment.userId}
                    </Link>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`flex-1 rounded py-1 px-2 ${
                          theme === 'dark' 
                            ? 'bg-slate-700 text-white border-slate-600' 
                            : 'bg-white text-gray-900 border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        disabled={isSubmitting}
                      />
                      <button
                        onClick={handleEditComment}
                        disabled={!editContent.trim() || isSubmitting}
                        className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {comment.content}
                    </p>
                  )}
                  
                  {user && user.id === comment.userId && !editingCommentId && (
                    <div className="mt-1 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        disabled={isSubmitting}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
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