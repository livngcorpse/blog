// frontend/src/components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';

const Navbar = ({ firebaseUser, userData }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔒</span>
          <span className="brand-name">AnonBlog</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search users, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          {firebaseUser && userData ? (
            <>
              <Link to="/create-post" className="nav-link">
                <span className="nav-icon">✍️</span>
                <span className="nav-text">Write</span>
              </Link>

              <div className="profile-menu" ref={dropdownRef}>
                <button
                  className="profile-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {userData.profilePhoto ? (
                    <img
                      src={userData.profilePhoto}
                      alt={userData.displayName}
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {getInitials(userData.displayName)}
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <p className="dropdown-name">{userData.displayName}</p>
                        <p className="dropdown-username">@{userData.username}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to={`/profile/${userData.username}`}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="dropdown-icon">👤</span>
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/edit-profile"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="dropdown-icon">⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <span className="dropdown-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link login-btn">
              <span className="nav-icon">🔑</span>
              <span className="nav-text">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;