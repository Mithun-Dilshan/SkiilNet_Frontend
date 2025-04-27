// src/services/userService.ts

export type UserProfile = {
    id: string;
    userId: string;
    bio: string;
    profilePictureUrl: string;
  };
  
  export type User = {
    id: string;
    name: string;
    username: string;
    profilePicture: string;
    bio?: string;
    followers: number;
    following: number;
    stats: {
      totalPosts: number;
      totalLikes: number;
      totalComments: number;
    };
    isFollowing: boolean;
  };
  
  export type ProfileUpdateData = {
    name?: string;
    bio?: string;
    profilePicture?: File | null;
    skills?: string[];
  };
  
  const API_BASE_URL = 'http://localhost:8080/api';
  
  export const getUserProfile = async (userId: string): Promise<UserProfile> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
      
      if (!response.ok) {
        throw new Error(`Error fetching user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };
  
  export const updateUserProfile = async (userId: string, profileData: ProfileUpdateData): Promise<UserProfile> => {
    try {
      // If there's a profile picture, we need to upload it first
      let profilePictureUrl = undefined;
      
      if (profileData.profilePicture) {
        profilePictureUrl = await uploadProfilePicture(userId, profileData.profilePicture);
      }
      
      // Create the request payload with the updated fields
      const payload = {
        bio: profileData.bio,
        ...(profilePictureUrl && { profilePictureUrl })
      };
      
      // Make the PUT request to update the profile
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };
  
  // Helper function to upload profile picture
  const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Make the POST request to upload the file
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error uploading profile picture: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url; // Return the URL of the uploaded image
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  };
  
  export const getUserData = async (userId: string): Promise<User> => {
    // This is a placeholder function that would typically fetch comprehensive user data
    // In a real app, you'd have an endpoint that returns all required user data
    // For now, we'll use this to combine profile data with mock data
    
    try {
      const profileData = await getUserProfile(userId);
      
      // Here we're combining the profile data from the API with mock data
      // In a real app, you'd have an API endpoint that returns all this information
      return {
        id: userId,
        name: "User Name", // In a real app, you'd get this from the API
        username: "username", // In a real app, you'd get this from the API
        profilePicture: profileData.profilePictureUrl,
        bio: profileData.bio,
        followers: 0, // Mock data
        following: 0, // Mock data
        stats: {
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0
        },
        isFollowing: false
      };
    } catch (error) {
      console.error('Failed to fetch complete user data:', error);
      throw error;
    }
  };
  
  export const getUserIdByUsername = async (username: string): Promise<string> => {
    try {
      // In a real app, you would have an API endpoint that can look up a user ID by username
      // For now, this is a placeholder that would be replaced with an actual API call
      const response = await fetch(`${API_BASE_URL}/users/lookup?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error(`Error looking up user ID: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.userId;
    } catch (error) {
      console.error('Failed to look up user ID by username:', error);
      throw error;
    }
  };
  
  // Placeholder function to use until the lookup API is available
  export const getUserIdByUsernameTemp = (username: string): string => {
    // This is just a temporary function that returns the hardcoded ID
    // In a real app, this would be replaced by the actual API call above
    return '9396b756-d8ac-4883-9266-3a51c1054b3e';
  };