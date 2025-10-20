// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    select: false // Never include in queries by default
  },
  email: {
    type: String,
    required: true,
    unique: true,
    select: false // Never expose email
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    maxlength: 100,
    default: ''
  },
  stats: {
    postsCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 }
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

// Middleware to ensure sensitive data is never exposed
userSchema.post('init', function(doc) {
  if (doc.firebaseUid) delete doc.firebaseUid;
  if (doc.email) delete doc.email;
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get safe user data
userSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    profilePhoto: this.profilePhoto,
    tagline: this.tagline,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

// CRITICAL: Export the model
module.exports = mongoose.model('User', userSchema);