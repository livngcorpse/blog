// backend/controllers/postController.js
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const User = require('../models/User');

// Get all posts with author info
const getAllPosts = async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const posts = await Post.find(query)
      .populate('authorId', 'username displayName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Post.countDocuments(query);
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle like on post
const toggleLike = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const user = await User.findOne({ firebaseUid }).select('_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likeIndex = post.likes.findIndex(like => 
      like.userId.toString() === user._id.toString()
    );
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ userId: user._id });
    }
    
    post.likesCount = post.likes.length;
    await post.save();
    
    res.status(200).json({ 
      liked: likeIndex === -1,
      likesCount: post.likesCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by tags
const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const posts = await Post.find({ tags: tag })
      .populate('authorId', 'username displayName profilePhoto')
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trending tags
const getTrendingTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPosts,
  toggleLike,
  getPostsByTag,
  getTrendingTags,
  // ... other existing methods
};