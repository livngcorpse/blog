// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByAuthor,
  toggleLike,
  getPostsByTag,
  getTrendingTags
} = require('../controllers/postController');

// GET /api/posts - Get all posts (with search, filters, pagination)
router.get('/', getAllPosts);

// GET /api/posts/trending-tags - Get trending tags
router.get('/trending-tags', getTrendingTags);

// GET /api/posts/tag/:tag - Get posts by tag
router.get('/tag/:tag', getPostsByTag);

// GET /api/posts/author/:username - Get posts by author
router.get('/author/:username', getPostsByAuthor);

// GET /api/posts/:id - Get a specific post
router.get('/:id', getPostById);

// POST /api/posts - Create a new post
router.post('/', createPost);

// POST /api/posts/:id/like - Toggle like on post
router.post('/:id/like', toggleLike);

// PUT /api/posts/:id - Update a post
router.put('/:id', updatePost);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', deletePost);

module.exports = router;