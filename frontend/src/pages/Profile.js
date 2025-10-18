// frontend/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../services/api';
import PostCard from '../components/PostCard';
import './Profile.css';

const Profile = ({ userData }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const [userResponse, postsResponse, statsResponse] = await Promise.all([
        userAPI.getUserByUsername(username),
        postAPI.getPostsByAuthor(username),
        userAPI.getUserStats(username)
      ]);
      
      setProfileUser(userResponse.data);
      setUserPosts(postsResponse.data);
      setUserStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(postId, userData._id);
      setUserPosts(userPosts.filter(post => post._id !== postId));
      setUserStats(prev => ({ ...prev, postsCount: prev.postsCount - 1 }));
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>User Not Found</h2>
        <p>The user profile you're looking for doesn't exist.</p>
        <Link to="/" className="back-home-btn">← Back to Home</Link>
      </div>
    );
  }

  const isOwnProfile = userData && userData.username === profileUser.username;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              {profileUser.profilePhoto ? (
                <img
                  src={profileUser.profilePhoto}
                  alt={profileUser.displayName}
                  className="profile-avatar-large"
                />
              ) : (
                <div className="profile-avatar-large profile-avatar-placeholder">
                  {getInitials(profileUser.displayName)}
                </div>
              )}
            </div>

            <div className="profile-info-section">
              <div className="profile-title-row">
                <h1 className="profile-display-name">{profileUser.displayName}</h1>
                {isOwnProfile && (
                  <Link to="/edit-profile" className="edit-profile-btn">
                    Edit Profile
                  </Link>
                )}
              </div>

              <p className="profile-username">@{profileUser.username}</p>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{userStats.postsCount || 0}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.likesReceived || 0}</span>
                  <span className="stat-label">Likes</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">{userStats.repliesCount || 0}</span>
                  <span className="stat-label">Replies</span>
                </div>
              </div>

              {profileUser.tagline && (
                <p className="profile-tagline">✨ {profileUser.tagline}</p>
              )}

              {profileUser.bio && (
                <p className="profile-bio">{profileUser.bio}</p>
              )}

              <div className="profile-metadata">
                <span className="profile-joined">
                  🗓️ Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-text">Posts</span>
            <span className="tab-count">{userStats.postsCount || 0}</span>
          </button>
          <button
            className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="tab-icon">ℹ️</span>
            <span className="tab-text">About</span>
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'posts' && (
            <div className="profile-posts">
              {userPosts.length === 0 ? (
                <div className="no-posts-message">
                  <div className="no-posts-icon">📭</div>
                  <h3>No posts yet</h3>
                  <p>
                    {isOwnProfile 
                      ? "You haven't shared anything yet. Start writing!" 
                      : `${profileUser.displayName} hasn't posted anything yet.`}
                  </p>
                  {isOwnProfile && (
                    <Link to="/create-post" className="create-post-btn">
                      Create Your First Post
                    </Link>
                  )}
                </div>
              ) : (
                <div className="posts-grid">
                  {userPosts.map(post => (
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

          {activeTab === 'about' && (
            <div className="profile-about">
              <div className="about-section">
                <h3 className="about-title">About</h3>
                <p className="about-bio">
                  {profileUser.bio || 'No bio available.'}
                </p>
              </div>

              {profileUser.tagline && (
                <div className="about-section">
                  <h3 className="about-title">Tagline</h3>
                  <p className="about-content">✨ {profileUser.tagline}</p>
                </div>
              )}

              <div className="about-section">
                <h3 className="about-title">Member Info</h3>
                <div className="member-info">
                  <div className="info-item">
                    <span className="info-icon">🗓️</span>
                    <span className="info-text">
                      Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📊</span>
                    <span className="info-text">
                      {userStats.postsCount || 0} posts, {userStats.repliesCount || 0} replies
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">❤️</span>
                    <span className="info-text">
                      {userStats.likesReceived || 0} likes received
                    </span>
                  </div>
                </div>
              </div>

              <div className="privacy-notice">
                <div className="privacy-icon">🔒</div>
                <h4>Privacy Protected</h4>
                <p>All user identities are kept anonymous. Email addresses and personal information are never disclosed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;