// frontend/src/pages/Search.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postAPI, userAPI } from '../services/api';
import PostCard from '../components/PostCard';
import './Search.css';

const Search = ({ userData }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const [postsResponse, usersResponse] = await Promise.all([
        postAPI.getAllPosts({ search: query }),
        userAPI.searchUsers(query)
      ]);

      setPosts(postsResponse.data.posts || []);
      setUsers(usersResponse.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!query) {
    return (
      <div className="search-page">
        <div className="search-container">
          <div className="empty-search">
            <div className="search-icon-large">🔍</div>
            <h2>Search for Posts and Users</h2>
            <p>Use the search bar above to find posts, users, and tags</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>Search Results for "{query}"</h1>
          <div className="results-summary">
            {posts.length} posts · {users.length} users
          </div>
        </div>

        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="tab-icon">📝</span>
            <span>Posts ({posts.length})</span>
          </button>
          <button
            className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👥</span>
            <span>Users ({users.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-results">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="search-results">
            {activeTab === 'posts' && (
              <div className="posts-results">
                {posts.length === 0 ? (
                  <div className="no-results">
                    <div className="no-results-icon">📭</div>
                    <h3>No posts found</h3>
                    <p>Try different keywords or search terms</p>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-results">
                {users.length === 0 ? (
                  <div className="no-results">
                    <div className="no-results-icon">👤</div>
                    <h3>No users found</h3>
                    <p>Try different search terms</p>
                  </div>
                ) : (
                  <div className="users-grid">
                    {users.map(user => (
                      <Link
                        key={user._id}
                        to={`/profile/${user.username}`}
                        className="user-card"
                      >
                        <div className="user-avatar-section">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={user.displayName}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar user-avatar-placeholder">
                              {getInitials(user.displayName)}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <h3 className="user-display-name">{user.displayName}</h3>
                          <p className="user-username">@{user.username}</p>
                          {user.tagline && (
                            <p className="user-tagline">{user.tagline}</p>
                          )}
                          {user.stats && (
                            <div className="user-stats-mini">
                              <span>{user.stats.postsCount} posts</span>
                              <span>·</span>
                              <span>{user.stats.likesReceived} likes</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;