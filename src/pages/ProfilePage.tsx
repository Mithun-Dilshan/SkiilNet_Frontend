import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/user/UserProfile';
import SkillPostCard from '../components/posts/SkillPostCard';
import { LearningPlan } from '../components/learning/LearningPlanCard';
import { ProgressUpdate } from '../components/progress/ProgressUpdateCard';
import { getUserData } from '../services/api/userService';

// Define Post type locally
type User = {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
};

type Media = {
  id: string;
  type: 'image' | 'video';
  url: string;
};

type Like = {
  userId: string;
};

type Comment = {
  id: string;
  text: string;
  userId: string;
};

type Post = {
  id: string;
  user: User;
  content: string;
  media?: Media[];
  likes: Like[];
  comments: Comment[];
  createdAt: string;
  description: string;
  userId: string;
  date: string;
};

// Mock posts with updated structure to match SkillPostCard expectations
const mockPosts: Post[] = [
  {
    id: 'post-3',
    user: {
      id: '1',
      name: 'Alex Johnson',
      username: 'alexj',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    content: 'Just created this visualization to help my students understand the concept of fractions better. It\'s amazing how visual representations can make complex math concepts more accessible!',
    description: 'Just created this visualization to help my students understand the concept of fractions better. It\'s amazing how visual representations can make complex math concepts more accessible!',
    userId: '1',
    media: [
      {
        id: 'media-4',
        type: 'image',
        url: 'https://images.pexels.com/photos/4386421/pexels-photo-4386421.jpeg?auto=compress&cs=tinysrgb&w=1280'
      }
    ],
    likes: [
      { userId: '2' },
      { userId: '3' },
      { userId: '4' }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'post-4',
    user: {
      id: '1',
      name: 'Alex Johnson',
      username: 'alexj',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    content: 'Here\'s a mnemonic device I created for remembering the order of operations in mathematics (PEMDAS): "Please Excuse My Dear Aunt Sally" - Parentheses, Exponents, Multiplication/Division, Addition/Subtraction.',
    description: 'Here\'s a mnemonic device I created for remembering the order of operations in mathematics (PEMDAS): "Please Excuse My Dear Aunt Sally" - Parentheses, Exponents, Multiplication/Division, Addition/Subtraction.',
    userId: '1',
    media: [],
    likes: [
      { userId: '5' },
      { userId: '6' }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
  }
];

// Mock learning plans
const mockPlans: LearningPlan[] = [
  {
    id: 'plan-2',
    title: 'Mastering Basic Trigonometry',
    description: 'A step-by-step guide to understanding the fundamentals of trigonometry, from the unit circle to trig functions and identities.',
    subject: 'Maths',
    topics: [
      {
        id: 'topic-5',
        title: 'Understanding the Unit Circle',
        completed: true
      },
      {
        id: 'topic-6',
        title: 'Sine, Cosine, and Tangent',
        completed: true
      },
      {
        id: 'topic-7',
        title: 'Trigonometric Identities',
        completed: false
      },
      {
        id: 'topic-8',
        title: 'Solving Triangles',
        completed: false
      }
    ],
    resources: [
      {
        id: 'resource-3',
        title: 'Unit Circle Visualization Tool',
        url: 'https://example.com/unit-circle',
        type: 'link'
      },
      {
        id: 'resource-4',
        title: 'Trigonometry Practice Problems',
        url: 'https://example.com/trig-practice.pdf',
        type: 'document'
      }
    ],
    completionPercentage: 50,
    estimatedDays: 14,
    followers: 32,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    user: {
      id: '1',
      name: 'Alex Johnson',
      username: 'alexj',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  }
];

// Mock progress updates
const mockUpdates: ProgressUpdate[] = [
  {
    id: 'update-2',
    template: 'learned_concept',
    description: 'Just mastered the concept of linear transformations in vector spaces! The key insight was visualizing how matrices transform the basis vectors.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    subject: 'Maths',
    user: {
      id: '1',
      name: 'Alex Johnson',
      username: 'alexj',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  },
  {
    id: 'update-3',
    template: 'took_quiz',
    description: 'Scored 95% on the Advanced Grammar Quiz! Still need to work on my understanding of the subjunctive mood in English.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    subject: 'English',
    user: {
      id: '1',
      name: 'Alex Johnson',
      username: 'alexj',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  }
];

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // For now, we're using a hardcoded userId
        // In a real app, you would have a way to map from username to userId
        const userId = '9396b756-d8ac-4883-9266-3a51c1054b3e';
        
        // Fetch user data from the API
        const user = await getUserData(userId);
        
        // Set the fetched user data
        setUserData(user);
        
        // For now, use mock data for posts, plans, and updates
        // In a real app, you would fetch these from your API as well
        setPosts(mockPosts.map(post => ({
          ...post,
          user: {
            ...post.user,
            id: userId,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture
          }
        })));
        
        setPlans(mockPlans.map(plan => ({
          ...plan,
          user: {
            ...plan.user,
            id: userId,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture
          }
        })));
        
        setProgressUpdates(mockUpdates.map(update => ({
          ...update,
          user: {
            ...update.user,
            id: userId,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture
          }
        })));
        
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Handle error - maybe set some error state
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [username]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }
  
  return (
    <UserProfile 
      userProfile={userData}
      posts={posts}
      plans={plans}
      progressUpdates={progressUpdates}
    />
  );
};

export default ProfilePage;