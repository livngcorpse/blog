const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByAuthor
} = require('../controllers/commentController');

// GET /api/comments/post/:postId - Get all comments for a post
router.get('/post/:postId', getCommentsByPost);

// GET /api/comments/:id - Get a specific comment
router.get('/:id', getCommentById);

// POST /api/comments - Create a new comment
router.post('/', createComment);

// PUT /api/comments/:id - Update a comment
router.put('/:id', updateComment);

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', deleteComment);

// GET /api/comments/author/:authorId - Get comments by author
router.get('/author/:authorId', getCommentsByAuthor);

module.exports = router;