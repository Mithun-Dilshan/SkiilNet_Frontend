import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MapPin, Clock, Compass } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

type PostCardProps = {
  post: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    duration: string;
    difficulty: string;
    author: {
      id: string;
      name: string;
      profilePictureUrl: string;
      username: string;
    };
    likes: number;
    comments: number;
    createdAt: string;
  };
};

const PostCard = ({ post }: PostCardProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className={`rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 ${
      theme === 'dark' ? 'bg-neutral-800' : 'bg-white'
    }`}>
      {/* Post Image */}
      <div className="relative h-64">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            theme === 'dark' ? 'bg-neutral-900/80 text-white' : 'bg-white/80 text-neutral-900'
          }`}>
            {post.difficulty}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Link to={`/profile/${post.author.username}`}>
            <img
              src={post.author.profilePictureUrl}
              alt={post.author.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-primary-500"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.author.username}`} className="font-medium hover:text-primary-500">
              {post.author.name}
            </Link>
            <p className="text-sm text-neutral-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-display font-semibold mb-2">{post.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-300 mb-4">{post.description}</p>

        {/* Adventure Details */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            <span className="text-sm">{post.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <span className="text-sm">{post.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-primary-500" />
            <span className="text-sm">{post.difficulty}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-accent-500' : 'text-neutral-500'
              } hover:text-accent-500`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            <button className="flex items-center space-x-1 text-neutral-500 hover:text-primary-500">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments}</span>
            </button>
          </div>
          <button className="text-neutral-500 hover:text-primary-500">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 