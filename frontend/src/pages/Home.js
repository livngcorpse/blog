// frontend/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import PostCard from '../components/PostCard';
import TrendingTags from '../components/TrendingTags';
import './Home.css';

const Home = ({ userData }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('latest');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postAPI.getAllPosts({ page: pageNum, limit: 10 });
      
      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      
      setHasMore(response.data.currentPage < response.data.totalPages);
      setPage(pageNum);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(postId, userData.firebaseUid);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <aside className="home-sidebar">
          <div className="sidebar-card">
            <h3>📝 Share Your Stories</h3>
            <p>Join our community of writers and readers. Share your thoughts and connect with others.</p>
          </div>

          <TrendingTags />

          {!userData && (
            <div className="sidebar-card cta-card">
              <h3>Join Us</h3>
              <p>Start writing and sharing your stories today</p>
              <Link to="/login" className="cta-button">
                Get Started
              </Link>
            </div>
          )}
        </aside>

        <main className="home-main">
          <div className="home-header">
            <h1 className="home-title">Discover Stories</h1>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'latest' ? 'active' : ''}`}
                onClick={() => setFilter('latest')}
              >
                Latest
              </button>
              <button
                className={`filter-tab ${filter === 'popular' ? 'active' : ''}`}
                onClick={() => setFilter('popular')}
              >
                Popular
              </button>
            </div>
          </div>

          {loading && page === 1 ? (
            <div className="loading-posts">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => fetchPosts(1)} className="retry-button">
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Be the first to share something!</p>
              {userData && (
                <Link to="/create-post" className="create-first-post-btn">
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    userData={userData}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-container">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="load-more-btn"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;