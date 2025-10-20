// frontend/src/pages/TagPosts.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import PostCard from '../components/PostCard';
import './TagPosts.css';

const TagPosts = ({ userData }) => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPostsByTag();
  }, [tag]);

  const fetchPostsByTag = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await postAPI.getPostsByTag(tag);
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(postId, userData._id);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="tag-posts-page">
      <div className="tag-posts-container">
        <div className="tag-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <div className="tag-title-section">
            <h1 className="tag-title">
              <span className="tag-icon">#</span>
              {tag}
            </h1>
            <p className="tag-subtitle">
              {loading ? 'Loading...' : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-posts">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchPostsByTag} className="retry-button">
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts-found">
            <div className="no-posts-icon">📭</div>
            <h3>No posts found with this tag</h3>
            <p>Be the first to create a post with #{tag}</p>
            {userData && (
              <Link to="/create-post" className="create-post-btn">
                Create Post
              </Link>
            )}
          </div>
        ) : (
          <div className="tag-posts-grid">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                userData={userData}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagPosts;