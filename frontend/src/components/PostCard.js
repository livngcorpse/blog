// frontend/src/components/PostCard.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import './PostCard.css';

const PostCard = ({ post, userData, onDelete }) => {
  const [liked, setLiked] = useState(
    post.likes?.some(like => like.userId === userData?._id) || false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userData) {
      navigate('/login');
      return;
    }

    if (likeLoading) return;

    setLikeLoading(true);
    const previousLiked = liked;
    const previousCount = likesCount;

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await postAPI.toggleLike(post._id, userData.firebaseUid); // Changed from userData._id
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const isAuthor = userData && post.authorId?._id === userData._id;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <article className="post-card">
      <div className="post-card-header">
        <Link 
          to={`/profile/${post.authorId?.username}`} 
          className="post-author"
        >
          {post.authorId?.profilePhoto ? (
            <img
              src={post.authorId.profilePhoto}
              alt={post.authorId.displayName}
              className="author-avatar"
            />
          ) : (
            <div className="author-avatar-placeholder">
              {getInitials(post.authorId?.displayName)}
            </div>
          )}
          <div className="author-info">
            <span className="author-name">{post.authorId?.displayName}</span>
            <span className="author-username">@{post.authorId?.username}</span>
          </div>
        </Link>

        <div className="post-meta">
          <span className="post-date">{formatDate(post.createdAt)}</span>
          {isAuthor && (
            <div className="post-actions">
              <Link
                to={`/edit-post/${post._id}`}
                className="action-btn edit-btn"
                onClick={(e) => e.stopPropagation()}
              >
                ✏️
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(post._id);
                }}
                className="action-btn delete-btn"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      <Link to={`/post/${post._id}`} className="post-content-link">
        <h2 className="post-title">{post.title}</h2>
        <p className="post-excerpt">{post.excerpt}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Link
                key={index}
                to={`/tag/${tag}`}
                className="post-tag"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="post-tag-more">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </Link>

      <div className="post-card-footer">
        <button
          onClick={handleLike}
          className={`interaction-btn like-btn ${liked ? 'liked' : ''}`}
          disabled={likeLoading}
        >
          <span className="interaction-icon">{liked ? '❤️' : '🤍'}</span>
          <span className="interaction-count">{likesCount}</span>
        </button>

        <Link to={`/post/${post._id}`} className="interaction-btn">
          <span className="interaction-icon">💬</span>
          <span className="interaction-count">{post.repliesCount || 0}</span>
        </Link>

        <div className="interaction-btn">
          <span className="interaction-icon">👁️</span>
          <span className="interaction-count">{post.viewsCount || 0}</span>
        </div>

        <div className="interaction-btn">
          <span className="interaction-icon">⏱️</span>
          <span className="interaction-count">{post.readingTime} min</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;