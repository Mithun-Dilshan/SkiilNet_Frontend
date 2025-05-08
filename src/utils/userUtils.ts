interface StoredUserData {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
}

/**
 * Retrieves user data from localStorage
 * @returns StoredUserData | null
 */
export const getStoredUserData = (): StoredUserData | null => {
  try {
    const userData = localStorage.getItem('skillnet_user');
    if (!userData) {
      return null;
    }
    
    const parsed = JSON.parse(userData);
    
    // Ensure all expected fields are available, with reasonable defaults
    return {
      id: parsed.id || '',
      name: parsed.name || '',
      username: parsed.username || parsed.email?.split('@')?.[0] || '',
      email: parsed.email || '',
      profilePictureUrl: parsed.profilePictureUrl || '',
      bio: parsed.bio || ''
    };
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Saves user data to localStorage
 * @param userData User data to store
 */
export const saveUserData = (userData: StoredUserData): void => {
  try {
    localStorage.setItem('skillnet_user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }
};

/**
 * Merges user and profile data
 * This function combines basic user data with profile data from the backend
 */
export const mergeUserWithProfile = (
  user: { id: string; name?: string; email?: string; username?: string },
  profile: { bio?: string; profilePictureUrl?: string; fullName?: string }
): StoredUserData => {
  return {
    id: user.id,
    name: profile.fullName || user.name || '',
    username: user.username || user.email?.split('@')?.[0] || '',
    email: user.email || '',
    profilePictureUrl: profile.profilePictureUrl || '',
    bio: profile.bio || ''
  };
};

/**
 * Clears user data from localStorage
 */
export const clearUserData = (): void => {
  localStorage.removeItem('skillnet_user');
};

/**
 * Checks if user is logged in based on localStorage
 * @returns boolean
 */
export const isUserLoggedIn = (): boolean => {
  return !!localStorage.getItem('token') && !!getStoredUserData();
}; 