import axios from './axiosConfig';

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type CommentRequest = {
  userId: string;
  content: string;
};

const commentsApi = {
  createComment: async (postId: string, commentData: CommentRequest): Promise<Comment> => {
    const response = await axios.post(`/api/comments/${postId}`, commentData);
    return response.data;
  },

  getCommentsByPostId: async (postId: string): Promise<Comment[]> => {
    const response = await axios.get(`/api/comments/${postId}`);
    return response.data;
  },

  updateComment: async (commentId: string, userId: string, commentData: CommentRequest): Promise<void> => {
    await axios.put(`/api/comments/${commentId}/${userId}`, commentData);
  },

  deleteComment: async (commentId: string, userId: string): Promise<void> => {
    await axios.delete(`/api/comments/${commentId}/${userId}`);
  }
};

export default commentsApi; 