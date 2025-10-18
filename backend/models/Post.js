// backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  repliesCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number,
    default: 1
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

postSchema.index({ tags: 1 });
postSchema.index({ authorId: 1 });
postSchema.index({ createdAt: -1 });

postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate reading time (average 200 words per minute)
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  // Generate excerpt
  if (!this.excerpt) {
    this.excerpt = this.content.substring(0, 250).trim() + '...';
  }
  
  next();
});

module.exports = mongoose.model('Post', postSchema);