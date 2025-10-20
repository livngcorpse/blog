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

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'username displayName profilePhoto');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    post.viewsCount += 1;
    await post.save();
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const { title, content, tags, firebaseUid } = req.body;
    
    if (!title || !content || !firebaseUid) {
      return res.status(400).json({ 
        message: 'Title, content, and firebaseUid are required' 
      });
    }
    
    const user = await User.findOne({ firebaseUid }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newPost = new Post({
      title,
      content,
      tags: tags || [],
      authorId: user._id
    });
    
    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id)
      .populate('authorId', 'username displayName profilePhoto');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { title, content, tags, firebaseUid } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const user = await User.findOne({ firebaseUid }).select('_id');
    if (!user || post.authorId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this post' });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('authorId', 'username displayName profilePhoto');
    
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const user = await User.findOne({ firebaseUid }).select('_id');
    if (!user || post.authorId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }
    
    await Reply.deleteMany({ postId: req.params.id });
    await Post.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const posts = await Post.find({ authorId: user._id })
      .populate('authorId', 'username displayName profilePhoto')
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
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
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByAuthor,
  toggleLike,
  getPostsByTag,
  getTrendingTags
};