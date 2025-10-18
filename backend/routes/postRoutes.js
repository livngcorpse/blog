const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByAuthor
} = require('../controllers/postController');

// GET /api/posts - Get all posts
router.get('/', getAllPosts);

// GET /api/posts/:id - Get a specific post
router.get('/:id', getPostById);

// POST /api/posts - Create a new post
router.post('/', createPost);

// PUT /api/posts/:id - Update a post
router.put('/:id', updatePost);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', deletePost);

// GET /api/posts/author/:authorId - Get posts by author
router.get('/author/:authorId', getPostsByAuthor);

module.exports = router;