// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserByUsername,
  createOrUpdateUser,
  getCurrentUser,
  searchUsers,
  getUserStats
} = require('../controllers/userController');

router.get('/search', searchUsers);
router.get('/:username', getUserByUsername);
router.get('/:username/stats', getUserStats);
router.post('/current', getCurrentUser);
router.post('/profile', createOrUpdateUser);

module.exports = router;