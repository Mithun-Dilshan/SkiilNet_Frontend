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
    const response = await axios.post(`/comments/${postId}`, commentData);
    return response.data as Comment;
  },

  getCommentsByPostId: async (postId: string): Promise<Comment[]> => {
    const response = await axios.get(`/comments/${postId}`);
    return response.data as Comment[];
  },

  updateComment: async (commentId: string, userId: string, commentData: CommentRequest): Promise<void> => {
    await axios.put(`/comments/${commentId}/${userId}`, commentData);
  },

  deleteComment: async (commentId: string, userId: string): Promise<void> => {
    await axios.delete(`/comments/${commentId}/${userId}`);
  }
};

export default commentsApi; 