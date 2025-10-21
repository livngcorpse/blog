// frontend/src/services/api.js - FIXED VERSION
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// User API calls
export const userAPI = {
  getUserByUsername: (username) => api.get(`/users/${username}`),
  getCurrentUser: (firebaseUid) => api.post('/users/current', { firebaseUid }),
  createOrUpdateUser: (userData) => api.post('/users/profile', userData),
  searchUsers: (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`),
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
  getPostsByTag: (tag) => api.get(`/posts/tag/${encodeURIComponent(tag)}`),
  getTrendingTags: () => api.get('/posts/trending-tags'),
};

// Reply API calls
export const replyAPI = {
  getRepliesByPost: (postId) => api.get(`/replies/post/${postId}`),
  createReply: (replyData) => api.post('/replies', replyData),
  deleteReply: (id, firebaseUid) => api.delete(`/replies/${id}`, { 
    data: { firebaseUid } 
  }),
  toggleLikeReply: (replyId, firebaseUid) => api.post(`/replies/${replyId}/like`, { firebaseUid }),
};

export default api;