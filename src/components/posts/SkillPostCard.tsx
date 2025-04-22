import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import CommentSection from '../comments/CommentSection';

type Media = {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
};

export type Post = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  media: Media[];
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
  saved?: boolean;
};

type SkillPostCardProps = {
  post: Post;
};

const SkillPostCard = ({ post }: SkillPostCardProps) => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved || false);
  
  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };
  
  const handleSave = () => {
    setSaved(!saved);
  };
  
  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % post.media.length);
  };
  
  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + post.media.length) % post.media.length);
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <div className={`rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md transition-all duration-200 hover:shadow-lg mb-6`}>
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user.username}`} className="flex items-center space-x-3">
          {post.user.profilePicture ? (
            <img 
              src={post.user.profilePicture} 
              alt={post.user.name} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {post.user.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium">{post.user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{post.user.username}</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
          <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{post.content}</p>
      </div>
      
      {/* Media Content */}
      {post.media.length > 0 && (
        <div className="relative">
          <div className="aspect-[16/9] overflow-hidden">
            {post.media[currentSlide].type === 'image' ? (
              <img 
                src={post.media[currentSlide].url} 
                alt={`Media ${currentSlide + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <video 
                src={post.media[currentSlide].url} 
                poster={post.media[currentSlide].thumbnail}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Slide Navigation */}
          {post.media.length > 1 && (
            <>
              <button 
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                aria-label="Previous slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button 
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                aria-label="Next slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              
              {/* Slide Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1 group"
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart 
              className={`h-6 w-6 transition-colors ${
                liked 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-red-500'
              }`} 
            />
            <span className={`text-sm ${
              liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-red-500'
            }`}>
              {likesCount}
            </span>
          </button>
          
          <button 
            onClick={toggleComments}
            className="flex items-center space-x-1 group"
            aria-label="Comments"
          >
            <MessageCircle className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-500">
              {post.comments}
            </span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSave}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <Bookmark 
              className={`h-5 w-5 transition-colors ${
                saved 
                  ? 'text-indigo-500 fill-indigo-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} 
            />
          </button>
          
          <button 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
};

export default SkillPostCard;