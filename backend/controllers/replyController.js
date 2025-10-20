// backend/controllers/replyController.js
const Reply = require('../models/Reply');
const Post = require('../models/Post');
const User = require('../models/User');

// Get replies for a post (with nested structure)
const getRepliesByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Get top-level replies
    const replies = await Reply.find({ postId, parentReplyId: null })
      .populate('authorId', 'username displayName profilePhoto')
      .sort({ createdAt: -1 });
    
    // Get nested replies for each top-level reply
    const repliesWithNested = await Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await Reply.find({ parentReplyId: reply._id })
          .populate('authorId', 'username displayName profilePhoto')
          .sort({ createdAt: 1 });
        
        return {
          ...reply.toObject(),
          replies: nestedReplies
        };
      })
    );
    
    res.status(200).json(repliesWithNested);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create reply
const createReply = async (req, res) => {
  try {
    const { postId, parentReplyId, content, firebaseUid } = req.body;
    
    if (!postId || !content || !firebaseUid) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const user = await User.findOne({ firebaseUid }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const newReply = new Reply({
      postId,
      parentReplyId: parentReplyId || null,
      authorId: user._id,
      content
    });
    
    await newReply.save();
    
    // Update counts
    post.repliesCount += 1;
    await post.save();
    
    if (parentReplyId) {
      await Reply.findByIdAndUpdate(parentReplyId, {
        $inc: { repliesCount: 1 }
      });
    }
    
    const populatedReply = await Reply.findById(newReply._id)
      .populate('authorId', 'username displayName profilePhoto');
    
    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Toggle like on reply
const toggleLikeReply = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const user = await User.findOne({ firebaseUid }).select('_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const reply = await Reply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    const likeIndex = reply.likes.findIndex(like => 
      like.userId.toString() === user._id.toString()
    );
    
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push({ userId: user._id });
    }
    
    reply.likesCount = reply.likes.length;
    await reply.save();
    
    res.status(200).json({ 
      liked: likeIndex === -1,
      likesCount: reply.likesCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete reply
const deleteReply = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const user = await User.findOne({ firebaseUid }).select('_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const reply = await Reply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    if (reply.authorId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Delete nested replies
    await Reply.deleteMany({ parentReplyId: reply._id });
    
    // Update counts
    const post = await Post.findById(reply.postId);
    if (post) {
      post.repliesCount = Math.max(0, post.repliesCount - 1);
      await post.save();
    }
    
    if (reply.parentReplyId) {
      await Reply.findByIdAndUpdate(reply.parentReplyId, {
        $inc: { repliesCount: -1 }
      });
    }
    
    await Reply.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRepliesByPost,
  createReply,
  toggleLikeReply,
  deleteReply
};