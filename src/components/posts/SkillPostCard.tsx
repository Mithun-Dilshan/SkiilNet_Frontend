import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Share2, Trash2, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import CommentSection from '../comments/CommentSection';
import postsApi, { Post } from '../../services/api/posts';

type Media = {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
};

type Comment = {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
};

type SkillPostCardProps = {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
};

const SkillPostCard = ({ post, onPostDeleted, onPostUpdated }: SkillPostCardProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editDescription, setEditDescription] = useState(post.description);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [liked, setLiked] = useState(post.likes?.some(like => like.userId === user?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  
  useEffect(() => {
    setLiked(post.likes?.some(like => like.userId === user?.id) || false);
    setLikesCount(post.likes?.length || 0);
  }, [post, user]);
  
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await postsApi.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!editDescription.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const updatedPost = await postsApi.updatePost(post.id, {
        description: editDescription.trim(),
        file: editFile || undefined,
        userId: post.userId
      });
      onPostUpdated?.(updatedPost);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      const isVideoFile = file.type.startsWith('video/');
      const maxSize = isVideoFile ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
      
      if (file.size > maxSize) {
        setError(`File size should be less than ${isVideoFile ? '100MB' : '5MB'}`);
        return;
      }

      setEditFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };
  
  const handleLike = async () => {
    if (isLoading || !user) return;
    
    try {
      
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
      
     
      const updatedPost = liked 
        ? await postsApi.unlikePost(post.id)
        : await postsApi.likePost(post.id);
      
     
      onPostUpdated?.(updatedPost);
    } catch (error) {
      console.error('Error toggling like:', error);
      
      setLiked(liked);
      setLikesCount(liked ? likesCount : likesCount);
      setError('Failed to update like status. Please try again.');
    }
  };
  
  const handleSave = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      if (saved) {
        await postsApi.unsavePost(post.id);
      } else {
        await postsApi.savePost(post.id);
      }
      setSaved(!saved);
    } catch (error) {
      console.error('Error toggling save:', error);
      // Revert the optimistic update if the API call fails
      setSaved(saved);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % (post.media?.length || 1));
  };
  
  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + (post.media?.length || 1)) % (post.media?.length || 1));
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };
  
  return (
    <div className={`rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md transition-all duration-200 hover:shadow-lg mb-6`}>
     
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.userId}`} className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              U
            </span>
          </div>
          <div>
            <h3 className="font-medium">User {post.userId}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">@user{post.userId}</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2 relative">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
          </span>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>

        
          {showDropdown && (
            <div 
              className={`absolute right-0 top-8 w-48 rounded-md shadow-lg py-1 z-10 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-white'
              } ring-1 ring-black ring-opacity-5`}
            >
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowEditForm(true);
                  setEditDescription(post.description);
                  setEditFile(null);
                  setEditPreview(null);
                }}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'text-gray-200 hover:bg-slate-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Post
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowDeleteConfirm(true);
                }}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'text-red-400 hover:bg-slate-600' 
                    : 'text-red-600 hover:bg-gray-100'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>
      
    
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-2xl w-full mx-4 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h3 className="text-lg font-medium mb-4">Edit Post</h3>
            
            <div className="mb-4">
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Update your post..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                disabled={isLoading}
              />
            </div>

           
            {editPreview && (
              <div className="relative mb-4">
                {editFile?.type.startsWith('video/') ? (
                  <video
                    src={editPreview}
                    controls
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <img
                    src={editPreview}
                    alt="Edit preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditFile(null);
                    setEditPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <input
                  type="file"
                  id="edit-media-upload"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="edit-media-upload"
                  className={`inline-flex items-center px-3 py-2 rounded-lg cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {editFile?.type.startsWith('video/') ? (
                    <video className="h-5 w-5 mr-2" />
                  ) : (
                    <Edit2 className="h-5 w-5 mr-2" />
                  )}
                  Change Media
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowEditForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-sm w-full mx-4 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h3 className="text-lg font-medium mb-4">Delete Post?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{post.description}</p>
      </div>
      
    
      {post.media && post.media.length > 0 && (
        <div className="relative">
          <div className="aspect-[16/9] overflow-hidden">
            {post.media[currentSlide].type === 'image' ? (
              <img 
                src={post.media[currentSlide].url} 
                alt="Post media"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <video 
                src={post.media[currentSlide].url} 
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}
      
     
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            disabled={isLoading || !user}
            className={`p-2 rounded-full transition-colors duration-200 ${
              liked 
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'
            }`}
          >
            <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
            <span className="ml-1">{likesCount}</span>
          </button>
          
          <button 
            onClick={toggleComments}
            className={`p-2 rounded-full transition-colors duration-200 ${
              theme === 'dark' 
                ? 'text-gray-400 hover:bg-slate-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="ml-1">{commentCount}</span>
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center space-x-1 group"
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <Bookmark 
              className={`h-6 w-6 transition-colors ${
                saved 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-yellow-500'
              }`}
            />
          </button>
          
          <button 
            className="flex items-center space-x-1 group"
            aria-label="Share"
          >
            <Share2 className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-green-500" />
          </button>
        </div>
      </div>
      
   
      {error && (
        <div className="px-4 py-2 bg-red-100 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      
     
      {showComments && (
        <CommentSection 
          postId={post.id} 
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </div>
  );
};

export default SkillPostCard;