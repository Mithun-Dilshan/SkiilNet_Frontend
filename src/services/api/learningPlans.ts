import axios from './axios';
import * as mockData from './mockData';

const USE_MOCK_DATA_ON_ERROR = true;



export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'document' | 'video';
}

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
}

export interface LearningPlanUser {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

export interface LearningPlan {
  id: string;
  title: string;
  description: string;
  subject: string;
  topics: Topic[];
  resources: Resource[];
  completionPercentage: number;
  estimatedDays: number;
  followers: number;
  createdAt: string;
  userId: string;
  following: boolean;
  user: LearningPlanUser;
}

export interface CreateLearningPlanRequest {
  title: string;
  description: string;
  subject: string;
  topics: Topic[];
  resources: Resource[];
  estimatedDays: number;
}

const getCurrentUserId = (): string => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.id;
    }
  } catch (error) {
    console.error('Error parsing user from localStorage', error);
  }
  return '1'; 
};

export const getAllLearningPlans = async (): Promise<LearningPlan[]> => {
  try {
    console.log('Fetching all learning plans');
    const response = await axios.get('/learning-plans');
    console.log('Successfully fetched all learning plans');
    return response.data as LearningPlan[];
  } catch (error) {
    console.error('Error fetching all learning plans:', error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log('Using mock data for getAllLearningPlans');
      return mockData.mockLearningPlans;
    }
    throw error;
  }
};


export const getLearningPlanById = async (planId: string): Promise<LearningPlan> => {
  try {
    console.log(`Fetching learning plan with ID ${planId}`);
    const response = await axios.get(`/learning-plans/${planId}`);
    console.log(`Successfully fetched learning plan with ID ${planId}`);
    return response.data as LearningPlan;
  } catch (error) {
    console.error(`Error fetching learning plan with ID ${planId}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for getLearningPlanById with ID ${planId}`);
      const plan = mockData.getById(planId);
      if (!plan) throw new Error(`Learning plan with ID ${planId} not found`);
      return plan;
    }
    throw error;
  }
};

export const getUserLearningPlans = async (userId: string = getCurrentUserId()): Promise<LearningPlan[]> => {
  try {
    console.log(`Fetching learning plans for user ${userId}`);
    const response = await axios.get(`/learning-plans`, { params: { userId } });
    console.log(`Successfully fetched learning plans for user ${userId}`);
    return response.data as LearningPlan[];
  } catch (error) {
    console.error(`Error fetching learning plans for user ${userId}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for getUserLearningPlans with user ID ${userId}`);
      return mockData.getByUserId(userId);
    }
    throw error;
  }
};


export const createLearningPlan = async (userId: string = getCurrentUserId(), plan: CreateLearningPlanRequest): Promise<LearningPlan> => {
  try {
    console.log(`Creating learning plan for user ${userId}`);
    const response = await axios.post(`/learning-plans`, plan, { params: { userId } });
    console.log(`Successfully created learning plan for user ${userId}`);
    return response.data as LearningPlan;
  } catch (error) {
    console.error('Error creating learning plan:', error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log('Using mock data for createLearningPlan');
      const newPlan: LearningPlan = {
        id: `plan-${Date.now()}`,
        title: plan.title,
        description: plan.description,
        subject: plan.subject,
        topics: plan.topics,
        resources: plan.resources,
        completionPercentage: 0,
        estimatedDays: plan.estimatedDays,
        followers: 0,
        createdAt: new Date().toISOString(),
        userId: userId,
        following: false,
        user: mockData.mockLearningPlans[0].user 
      };
      
      mockData.mockLearningPlans.push(newPlan);
      return newPlan;
    }
    throw error;
  }
};


export const updateLearningPlan = async (userId: string = getCurrentUserId(), planId: string, plan: Partial<LearningPlan>): Promise<LearningPlan> => {
  try {
    console.log(`Updating learning plan with ID ${planId}`);
    const response = await axios.put(`/learning-plans/${planId}`, plan);
    console.log(`Successfully updated learning plan with ID ${planId}`);
    return response.data as LearningPlan;
  } catch (error) {
    console.error(`Error updating learning plan with ID ${planId}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for updateLearningPlan with ID ${planId}`);
      const existingPlan = mockData.getById(planId);
      if (!existingPlan) throw new Error(`Learning plan with ID ${planId} not found`);
      
      const updatedPlan = { ...existingPlan, ...plan };
      
      const index = mockData.mockLearningPlans.findIndex(p => p.id === planId);
      if (index !== -1) {
        mockData.mockLearningPlans[index] = updatedPlan;
      }
      
      return updatedPlan;
    }
    throw error;
  }
};


export const deleteLearningPlan = async (userId: string = getCurrentUserId(), planId: string): Promise<void> => {
  try {
    console.log(`Deleting learning plan with ID ${planId}`);
    await axios.delete(`/learning-plans/${planId}`);
    console.log(`Successfully deleted learning plan with ID ${planId}`);
  } catch (error) {
    console.error(`Error deleting learning plan with ID ${planId}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for deleteLearningPlan with ID ${planId}`);
      const index = mockData.mockLearningPlans.findIndex(p => p.id === planId);
      if (index !== -1) {
        mockData.mockLearningPlans.splice(index, 1);
      }
      return;
    }
    throw error;
  }
};

export const followLearningPlan = async (planId: string, userId: string = getCurrentUserId()): Promise<LearningPlan> => {
  try {
    console.log(`Following learning plan with ID ${planId} for user ${userId}`);
    const response = await axios.post(`/learning-plans/${planId}/follow`, userId);
    console.log(`Successfully followed learning plan with ID ${planId}`);
    return response.data as LearningPlan;
  } catch (error) {
    console.error(`Error following learning plan with ID ${planId}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for followLearningPlan with ID ${planId}`);
      const updatedPlan = mockData.toggleFollow(planId, true);
      if (!updatedPlan) throw new Error(`Learning plan with ID ${planId} not found`);
      return updatedPlan;
    }
    throw error;
  }
};

export const unfollowLearningPlan = async (planId: string, userId: string = getCurrentUserId()): Promise<LearningPlan> => {
  try {
    console.log(`Unfollowing learning plan with ID ${planId} for user ${userId}`);
    const response = await axios.post(`/learning-plans/${planId}/unfollow`, userId);
    console.log(`Successfully unfollowed learning plan with ID ${planId}`);
    return response.data as LearningPlan;
  } catch (error) {
    console.error(`Error unfollowing learning plan with ID ${planId}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for unfollowLearningPlan with ID ${planId}`);
      const updatedPlan = mockData.toggleFollow(planId, false);
      if (!updatedPlan) throw new Error(`Learning plan with ID ${planId} not found`);
      return updatedPlan;
    }
    throw error;
  }
};


export const markTopicAsCompleted = async (
  userId: string = getCurrentUserId(), 
  planId: string, 
  topicId: string, 
  completed: boolean
): Promise<LearningPlan> => {
  try {
    console.log(`Marking topic ${topicId} as ${completed ? 'completed' : 'incomplete'}`);
    const currentPlan = await getLearningPlanById(planId);
    
    const updatedTopics = currentPlan.topics.map(topic => 
      topic.id === topicId ? { ...topic, completed } : topic
    );
    
    const updateRequest = {
      id: currentPlan.id,
      title: currentPlan.title,
      description: currentPlan.description,
      subject: currentPlan.subject,
      createdAt: currentPlan.createdAt,
      topics: updatedTopics,
      resources: currentPlan.resources,
      estimatedDays: currentPlan.estimatedDays,
      followers: currentPlan.followers,
      userId: currentPlan.userId,
      following: currentPlan.following
    };
    
    return updateLearningPlan(userId, planId, updateRequest);
  } catch (error) {
    console.error(`Error marking topic ${topicId} as ${completed ? 'completed' : 'incomplete'}:`, error);
    if (USE_MOCK_DATA_ON_ERROR) {
      console.log(`Using mock data for markTopicAsCompleted with topic ID ${topicId}`);
      const updatedPlan = mockData.updateTopic(planId, topicId, completed);
      if (!updatedPlan) throw new Error(`Learning plan with ID ${planId} not found`);
      return updatedPlan;
    }
    throw error;
  }
}; 