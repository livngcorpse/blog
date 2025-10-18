// backend/controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Reply = require('../models/Reply');

// Get user profile by username (public safe data only)
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.toSafeObject());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update user (server-side only)
const createOrUpdateUser = async (req, res) => {
  try {
    const { firebaseUid, email, username, displayName, bio, tagline, profilePhoto } = req.body;
    
    if (!firebaseUid || !email || !username || !displayName) {
      return res.status(400).json({ 
        message: 'Firebase UID, email, username, and display name are required' 
      });
    }
    
    // Check username availability
    const existingUser = await User.findOne({ 
      username, 
      firebaseUid: { $ne: firebaseUid } 
    }).select('+firebaseUid');
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    
    const userData = {
      firebaseUid,
      email,
      username: username.toLowerCase(),
      displayName,
      bio: bio || '',
      tagline: tagline || '',
      profilePhoto: profilePhoto || ''
    };
    
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      userData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json(user.toSafeObject());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get current user data (authenticated)
const getCurrentUser = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    
    if (!firebaseUid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUid }).select('+firebaseUid +email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return full data for authenticated user
    res.status(200).json({
      ...user.toSafeObject(),
      email: user.email,
      firebaseUid: user.firebaseUid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
        { tagline: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);
    
    res.status(200).json(users.map(u => u.toSafeObject()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const [postsCount, repliesCount, userPosts] = await Promise.all([
      Post.countDocuments({ authorId: user._id }),
      Reply.countDocuments({ authorId: user._id }),
      Post.find({ authorId: user._id }).select('likesCount')
    ]);
    
    const likesReceived = userPosts.reduce((total, post) => total + post.likesCount, 0);
    
    // Update user stats
    user.stats = { postsCount, repliesCount, likesReceived };
    await user.save();
    
    res.status(200).json({ postsCount, repliesCount, likesReceived });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserByUsername,
  createOrUpdateUser,
  getCurrentUser,
  searchUsers,
  getUserStats
};