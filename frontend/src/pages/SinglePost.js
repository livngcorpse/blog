// frontend/src/pages/SinglePost.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import ReplySystem from '../components/ReplySystem';
import './SinglePost.css';

const SinglePost = ({ userData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getPostById(id);
      setPost(response.data);
      setLikesCount(response.data.likesCount || 0);
      
      if (userData) {
        setLiked(response.data.likes?.some(like => like.userId === userData._id) || false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Post not found');
      setLoading(false);
    }
  };

  const handleLike = async () => {
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
      const response = await postAPI.toggleLike(post._id, userData._id);
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

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(id, userData._id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist or has been deleted.</p>
        <Link to="/" className="back-home-link">← Back to Home</Link>
      </div>
    );
  }

  const isAuthor = userData && post.authorId?._id === userData._id;

  return (
    <div className="single-post-page">
      <div className="single-post-container">
        <div className="post-navigation">
          <Link to="/" className="back-link">← Back to Posts</Link>
        </div>

        <article className="post-content-wrapper">
          <header className="post-full-header">
            <div className="post-author-section">
              <Link to={`/profile/${post.authorId?.username}`} className="author-link-large">
                {post.authorId?.profilePhoto ? (
                  <img
                    src={post.authorId.profilePhoto}
                    alt={post.authorId.displayName}
                    className="author-avatar-large"
                  />
                ) : (
                  <div className="author-avatar-large author-avatar-placeholder">
                    {getInitials(post.authorId?.displayName)}
                  </div>
                )}
                <div className="author-details">
                  <span className="author-name-large">{post.authorId?.displayName}</span>
                  <span className="author-username-large">@{post.authorId?.username}</span>
                </div>
              </Link>

              {isAuthor && (
                <div className="post-owner-actions">
                  <Link to={`/edit-post/${post._id}`} className="edit-post-btn">
                    ✏️ Edit
                  </Link>
                  <button onClick={handleDeletePost} className="delete-post-btn">
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="post-full-title">{post.title}</h1>

            <div className="post-metadata">
              <span className="post-date-full">{formatDate(post.createdAt)}</span>
              <span className="metadata-separator">·</span>
              <span className="reading-time">{post.readingTime} min read</span>
              <span className="metadata-separator">·</span>
              <span className="view-count">{post.viewsCount || 0} views</span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags-full">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/tag/${tag}`}
                    className="post-tag-full"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div className="post-content-body">
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>

          <footer className="post-footer">
            <div className="post-interactions">
              <button
                onClick={handleLike}
                className={`interaction-btn-large like-btn-large ${liked ? 'liked' : ''}`}
                disabled={likeLoading}
              >
                <span className="interaction-icon-large">{liked ? '❤️' : '🤍'}</span>
                <span className="interaction-label">
                  {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                </span>
              </button>

              <div className="interaction-btn-large">
                <span className="interaction-icon-large">💬</span>
                <span className="interaction-label">
                  {post.repliesCount || 0} {post.repliesCount === 1 ? 'Reply' : 'Replies'}
                </span>
              </div>
            </div>
          </footer>
        </article>

        {/* Reply System */}
        <ReplySystem postId={post._id} userData={userData} />
      </div>
    </div>
  );
};

export default SinglePost;