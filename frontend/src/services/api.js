// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API calls
export const userAPI = {
  getUserByUsername: (username) => api.get(`/users/${username}`),
  getCurrentUser: (firebaseUid) => api.post('/users/current', { firebaseUid }),
  createOrUpdateUser: (userData) => api.post('/users/profile', userData),
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  getUserStats: (username) => api.get(`/users/${username}/stats`),
};

// Post API calls
export const postAPI = {
  getAllPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/posts${queryString ? `?${queryString}` : ''}`);
  },
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id, firebaseUid) => api.delete(`/posts/${id}`, { 
    data: { firebaseUid } 
  }),
  getPostsByAuthor: (username) => api.get(`/posts/author/${username}`),
  toggleLike: (postId, firebaseUid) => api.post(`/posts/${postId}/like`, { firebaseUid }),
  getPostsByTag: (tag) => api.get(`/posts/tag/${tag}`),
  getTrendingTags: () => api.get('/posts/trending-tags'),
};

// Reply API calls
export const replyAPI = {
  getRepliesByPost: (postId) => api.get(`/replies/post/${postId}`),
  createReply: (replyData) => api.post('/replies', replyData),
  updateReply: (id, replyData) => api.put(`/replies/${id}`, replyData),
  deleteReply: (id, firebaseUid) => api.delete(`/replies/${id}`, { 
    data: { firebaseUid } 
  }),
  toggleLikeReply: (replyId, firebaseUid) => api.post(`/replies/${replyId}/like`, { firebaseUid }),
};

// Legacy comment API (deprecated - use replies instead)
export const commentAPI = {
  getCommentsByPost: (postId) => api.get(`/comments/post/${postId}`),
  getCommentById: (id) => api.get(`/comments/${id}`),
  createComment: (commentData) => api.post('/comments', commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}`, commentData),
  deleteComment: (id, authorId) => api.delete(`/comments/${id}`, { 
    data: { authorId } 
  }),
  getCommentsByAuthor: (authorId) => api.get(`/comments/author/${authorId}`),
};

export default api;