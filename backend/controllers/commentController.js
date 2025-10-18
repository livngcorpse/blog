const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Get all comments for a specific post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single comment by ID
const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { postId, content, authorId } = req.body;
    
    if (!postId || !content || !authorId) {
      return res.status(400).json({ 
        message: 'PostId, content, and authorId are required' 
      });
    }

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      postId,
      content,
      authorId
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { content, authorId } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author
    if (comment.authorId !== authorId) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { authorId } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author
    if (comment.authorId !== authorId) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments by author
const getCommentsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const comments = await Comment.find({ authorId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByPost,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByAuthor
};