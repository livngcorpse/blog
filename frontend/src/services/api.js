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
  // Get user by username (public)
  getUserByUsername: (username) => api.get(`/users/${username}`),
  
  // Get current user data (authenticated)
  getCurrentUser: (firebaseUid) => api.post('/users/current', { firebaseUid }),
  
  // Create or update user profile
  createOrUpdateUser: (userData) => api.post('/users/profile', userData),
  
  // Search users
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  
  // Get user stats
  getUserStats: (username) => api.get(`/users/${username}/stats`),
};

// Post API calls
export const postAPI = {
  // Get all posts with filters
  getAllPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/posts${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get single post by ID
  getPostById: (id) => api.get(`/posts/${id}`),
  
  // Create new post
  createPost: (postData) => api.post('/posts', postData),
  
  // Update post
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  
  // Delete post
  deletePost: (id, userId) => api.delete(`/posts/${id}`, { 
    data: { userId } 
  }),
  
  // Get posts by author
  getPostsByAuthor: (authorId) => api.get(`/posts/author/${authorId}`),
  
  // Toggle like on post
  toggleLike: (postId, userId) => api.post(`/posts/${postId}/like`, { userId }),
  
  // Get posts by tag
  getPostsByTag: (tag) => api.get(`/posts/tag/${tag}`),
  
  // Get trending tags
  getTrendingTags: () => api.get('/posts/trending-tags'),
};

// Reply API calls
export const replyAPI = {
  // Get replies for a post
  getRepliesByPost: (postId) => api.get(`/replies/post/${postId}`),
  
  // Create new reply
  createReply: (replyData) => api.post('/replies', replyData),
  
  // Update reply
  updateReply: (id, replyData) => api.put(`/replies/${id}`, replyData),
  
  // Delete reply
  deleteReply: (id, userId) => api.delete(`/replies/${id}`, { 
    data: { userId } 
  }),
  
  // Toggle like on reply
  toggleLikeReply: (replyId, userId) => api.post(`/replies/${replyId}/like`, { userId }),
};

export default api;