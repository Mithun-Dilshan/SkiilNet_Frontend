import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/user/UserProfile';
import { Post } from '../components/posts/SkillPostCard';
import { LearningPlan } from '../components/learning/LearningPlanCard';
import { ProgressUpdate } from '../components/progress/ProgressUpdateCard';

// Mock profile data
const mockUserData = {
  id: '1',
  name: 'Alex Johnson',
  username: 'alexj',
  profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
  bio: 'Science enthusiast and math teacher passionate about helping others learn!',
  followers: 128,
  following: 84,
  stats: {
    totalPosts: 42,
    totalLikes: 387,
    totalComments: 62
  },
  isFollowing: false
};

// Mock posts
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
    media: [
      {
        id: 'media-4',
        type: 'image',
        url: 'https://images.pexels.com/photos/4386421/pexels-photo-4386421.jpeg?auto=compress&cs=tinysrgb&w=1280'
      }
    ],
    likes: 35,
    comments: 8,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString() // 4 days ago
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
    media: [],
    likes: 29,
    comments: 6,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString() // 8 days ago
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
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), // 12 days ago
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
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
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
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), // 6 days ago
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
  const [userData, setUserData] = useState(mockUserData);
  const [posts, setPosts] = useState<Post[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  
  useEffect(() => {
    // Simulate API call to fetch user data
    setLoading(true);
    
    // For demo purposes, we're using the same mock data regardless of username
    setTimeout(() => {
      setUserData({
        ...mockUserData,
        username: username || mockUserData.username
      });
      setPosts(mockPosts);
      setPlans(mockPlans);
      setProgressUpdates(mockUpdates);
      setLoading(false);
    }, 1000);
  }, [username]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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