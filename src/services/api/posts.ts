import axiosInstance from './axios';

export interface PostRequest {
    userId?: string;
    description: string;
    file?: File;
}

export interface Like {
    id: string;
    postId: string;
    userId: string;
    createdAt: string;
}

export interface Post {
    id: string;
    description: string;
    url?: string;
    userId: string;
    date: string;
    comments: Array<{
        id: string;
        text: string;
        userId: string;
        createdAt: string;
    }>;
    likes: Like[];
    media?: Array<{
        id: string;
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
    }>;
}

const handleError = (error: any, customMessage: string) => {
    console.error(customMessage, error);
    if (error.response) {
      
        throw new Error(error.response.data.message || customMessage);
    } else if (error.request) {
        throw new Error('No response received from server. Please try again.');
    } else {
        throw new Error(error.message || customMessage);
    }
};

const postsApi = {
    // Get all posts
    getAllPosts: async (): Promise<Post[]> => {
        try {
            const response = await axiosInstance.get('/posts');
            const data = response.data as { posts?: Post[] };
            if (!data || !data.posts) {
                return [];
            }
            return data.posts.map((post: any) => ({
                id: post.id,
                description: post.description,
                url: post.url,
                userId: post.userId,
                date: new Date(post.date).toISOString(), 
                comments: Array.isArray(post.comments) ? post.comments : [],
                likes: Array.isArray(post.likes) ? post.likes : [],
                media: post.url ? [{
                    id: post.id,
                    type: post.url.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? 'video' : 'image',
                    url: post.url
                }] : []
            }));
        } catch (error) {
            handleError(error, 'Error fetching posts');
            return [];
        }
    },

    // Get a single post
    getPost: async (postId: string): Promise<Post> => {
        try {
            const response = await axiosInstance.get(`/posts/${postId}`);
            const data = response.data as { post: any };
            const post = data.post;
            return {
                id: post.id,
                description: post.description,
                url: post.url,
                userId: post.userId,
                date: new Date(post.date).toISOString(),
                comments: Array.isArray(post.comments) ? post.comments : [],
                likes: Array.isArray(post.likes) ? post.likes : [],
                media: post.url ? [{
                    id: post.id,
                    type: post.url.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? 'video' : 'image',
                    url: post.url
                }] : []
            };
        } catch (error) {
            handleError(error, 'Error fetching post');
            throw error;
        }
    },

    // Create a new post
    createPost: async (postData: PostRequest): Promise<Post> => {
        try {
            const formData = new FormData();
            formData.append('description', postData.description);
            if (postData.file) {
                formData.append('file', postData.file);
            }
            if (postData.userId) {
                formData.append('userId', postData.userId);
            }

            const response = await axiosInstance.post('/posts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const data = response.data as { post: any };
            const post = data.post;
            return {
                id: post.id,
                description: post.description,
                url: post.url,
                userId: post.userId,
                date: new Date(post.date).toISOString(),
                comments: [],
                likes: [],
                media: post.url ? [{
                    id: post.id,
                    type: post.url.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? 'video' : 'image',
                    url: post.url
                }] : []
            };
        } catch (error) {
            handleError(error, 'Error creating post');
            throw error;
        }
    },

    // Update a post
    updatePost: async (postId: string, postData: PostRequest): Promise<Post> => {
        try {
            const formData = new FormData();
            formData.append('description', postData.description);
            if (postData.file) {
                formData.append('file', postData.file);
            }
            if (postData.userId) {
                formData.append('userId', postData.userId);
            }

            const response = await axiosInstance.put(`/posts/${postId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data as Post;
        } catch (error) {
            handleError(error, 'Error updating post');
            throw error;
        }
    },

    // Delete a post
    deletePost: async (postId: string): Promise<void> => {
        try {
            await axiosInstance.delete(`/posts/${postId}`);
        } catch (error) {
            handleError(error, 'Error deleting post');
            throw error;
        }
    },

    // Like a post
    likePost: async (postId: string, userId: string): Promise<Post> => {
        try {
            const response = await axiosInstance.post(`/posts/${postId}/like?userId=${userId}`);
            const data = response.data as { post: Post };
            return data.post;
        } catch (error) {
            handleError(error, 'Error liking post');
            throw error;
        }
    },

    // Unlike a post
    unlikePost: async (postId: string, userId: string): Promise<Post> => {
        try {
            const response = await axiosInstance.delete(`/posts/${postId}/like?userId=${userId}`);
            const data = response.data as { post: Post };
            return data.post;
        } catch (error) {
            handleError(error, 'Error unliking post');
            throw error;
        }
    },

    // Save a post
    savePost: async (postId: string, userId: string): Promise<void> => {
        try {
            await axiosInstance.post(`/posts/${postId}/save?userId=${userId}`);
        } catch (error) {
            handleError(error, 'Error saving post');
            throw error;
        }
    },

    // Unsave a post
    unsavePost: async (postId: string, userId: string): Promise<void> => {
        try {
            await axiosInstance.delete(`/posts/${postId}/save?userId=${userId}`);
        } catch (error) {
            handleError(error, 'Error unsaving post');
            throw error;
        }
    }
};

export default postsApi; 