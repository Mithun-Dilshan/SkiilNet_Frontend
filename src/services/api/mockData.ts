import { LearningPlan, LearningPlanUser, Resource, Topic } from './learningPlans';

// Current logged in user ID should match the one used in AuthContext
const CURRENT_USER_ID = '1';

// Create some sample user data
const mockUsers: LearningPlanUser[] = [
  {
    id: CURRENT_USER_ID, // This will be the current user
    name: 'Alex Johnson',
    username: 'alexj',
    profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    id: '2',
    name: 'Sarah Miller',
    username: 'sarahm',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
  }
];

// Create sample resources
const mathResources: Resource[] = [
  {
    id: 'resource-1',
    title: 'Interactive Unit Circle Tool',
    url: 'https://www.mathsisfun.com/algebra/unit-circle.html',
    type: 'link'
  },
  {
    id: 'resource-2',
    title: 'Trigonometry Cheat Sheet',
    url: 'https://www.mathsisfun.com/algebra/trigonometry-cheat-sheet.html',
    type: 'document'
  },
  {
    id: 'resource-3',
    title: 'Khan Academy: Trigonometry',
    url: 'https://www.khanacademy.org/math/trigonometry',
    type: 'video'
  }
];

const programmingResources: Resource[] = [
  {
    id: 'resource-4',
    title: 'JavaScript Basics',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    type: 'link'
  },
  {
    id: 'resource-5',
    title: 'React Documentation',
    url: 'https://reactjs.org/docs/getting-started.html',
    type: 'document'
  },
  {
    id: 'resource-6',
    title: 'Full Stack Web Development',
    url: 'https://www.freecodecamp.org/',
    type: 'video'
  }
];

// Create sample topics
const mathTopics: Topic[] = [
  {
    id: 'topic-1',
    title: 'Understanding the Unit Circle',
    completed: true
  },
  {
    id: 'topic-2',
    title: 'Sine, Cosine, and Tangent Functions',
    completed: true
  },
  {
    id: 'topic-3',
    title: 'Trigonometric Identities',
    completed: false
  },
  {
    id: 'topic-4',
    title: 'Solving Right Triangles',
    completed: false
  }
];

const programmingTopics: Topic[] = [
  {
    id: 'topic-5',
    title: 'JavaScript Fundamentals',
    completed: true
  },
  {
    id: 'topic-6',
    title: 'React Components and Props',
    completed: true
  },
  {
    id: 'topic-7',
    title: 'State Management with Hooks',
    completed: false
  },
  {
    id: 'topic-8',
    title: 'API Integration',
    completed: false
  }
];

// Create sample learning plans
export const mockLearningPlans: LearningPlan[] = [
  {
    id: 'plan-1',
    title: 'Mastering Basic Trigonometry',
    description: 'A step-by-step guide to understanding the fundamentals of trigonometry, from the unit circle to trig functions and identities. This plan is designed for high school students or anyone looking to strengthen their math foundations.',
    subject: 'Maths',
    topics: mathTopics,
    resources: mathResources,
    completionPercentage: 50,
    estimatedDays: 14,
    followers: 87,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
    userId: CURRENT_USER_ID, // Created by current user
    following: false,
    user: mockUsers[0]
  },
  {
    id: 'plan-2',
    title: 'Web Development with React',
    description: 'Learn modern web development using React. This comprehensive plan covers everything from JavaScript basics to building complex applications with React hooks and state management.',
    subject: 'Technology',
    topics: programmingTopics,
    resources: programmingResources,
    completionPercentage: 33,
    estimatedDays: 21,
    followers: 42,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
    userId: '2',
    following: true,
    user: mockUsers[1]
  }
];

// Helper functions to work with mock data
export const getByUserId = (userId: string): LearningPlan[] => {
  return mockLearningPlans.filter(plan => plan.userId === userId);
};

export const getById = (planId: string): LearningPlan | undefined => {
  return mockLearningPlans.find(plan => plan.id === planId);
};

export const toggleFollow = (planId: string, following: boolean): LearningPlan | undefined => {
  const plan = mockLearningPlans.find(plan => plan.id === planId);
  if (plan) {
    plan.following = following;
    plan.followers = following ? plan.followers + 1 : Math.max(0, plan.followers - 1);
  }
  return plan;
};

export const updateTopic = (planId: string, topicId: string, completed: boolean): LearningPlan | undefined => {
  const plan = mockLearningPlans.find(plan => plan.id === planId);
  if (plan) {
    plan.topics = plan.topics.map(topic => 
      topic.id === topicId ? { ...topic, completed } : topic
    );
    
    // Update completion percentage
    const completedTopics = plan.topics.filter(topic => topic.completed).length;
    plan.completionPercentage = Math.round((completedTopics / plan.topics.length) * 100);
  }
  return plan;
}; 