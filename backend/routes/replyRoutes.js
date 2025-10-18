// backend/routes/replyRoutes.js
const express = require('express');
const router = express.Router();
const {
  getRepliesByPost,
  createReply,
  toggleLikeReply,
  deleteReply
} = require('../controllers/replyController');

router.get('/post/:postId', getRepliesByPost);
router.post('/', createReply);
router.post('/:id/like', toggleLikeReply);
router.delete('/:id', deleteReply);

module.exports = router;