// frontend/src/pages/EditProfile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import './EditProfile.css';

const EditProfile = ({ firebaseUser, userData, setUserData }) => {
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    displayName: userData?.displayName || '',
    bio: userData?.bio || '',
    tagline: userData?.tagline || '',
    profilePhoto: userData?.profilePhoto || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    setShowPhotoWarning(true);
    handleChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username.match(/^[a-zA-Z0-9_]+$/)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        ...formData,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email
      };

      const response = await userAPI.createOrUpdateUser(updateData);
      setUserData(response.data);
      navigate(`/profile/${response.data.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <div className="edit-profile-header">
          <h1>Edit Profile</h1>
          <p className="edit-profile-subtitle">
            Keep your identity anonymous while personalizing your profile
          </p>
        </div>

        <div className="privacy-warning-box">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Privacy First</h3>
            <p>
              Your email and personal information are never displayed publicly. 
              Choose a username and display name that don't reveal your identity.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username *
                <span className="label-hint">Unique identifier, no spaces</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="anonymous_writer"
                required
                pattern="[a-zA-Z0-9_]+"
                minLength="3"
                maxLength="20"
              />
            </div>

            <div className="form-group">
              <label htmlFor="displayName" className="form-label">
                Display Name *
                <span className="label-hint">How others see you</span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="form-input"
                placeholder="Anonymous Writer"
                required
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline" className="form-label">
                Tagline
                <span className="label-hint">A brief description of yourself</span>
              </label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="form-input"
                placeholder="Sharing thoughts anonymously"
                maxLength="100"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">About You</h3>
            
            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
                <span className="label-hint">Tell your story (optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Write something about yourself..."
                rows="4"
                maxLength="500"
              />
              <div className="char-count">
                {formData.bio.length}/500
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Profile Photo</h3>
            
            {showPhotoWarning && (
              <div className="photo-warning">
                <div className="warning-icon">🔒</div>
                <div>
                  <strong>Privacy Warning:</strong> Do not use a photo that reveals your identity. 
                  Consider using an avatar, illustration, or abstract image instead.
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="profilePhoto" className="form-label">
                Profile Photo URL
                <span className="label-hint">Link to your profile picture</span>
              </label>
              <input
                type="url"
                id="profilePhoto"
                name="profilePhoto"
                value={formData.profilePhoto}
                onChange={handlePhotoChange}
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {formData.profilePhoto && (
              <div className="photo-preview">
                <p className="preview-label">Preview:</p>
                <img
                  src={formData.profilePhoto}
                  alt="Profile preview"
                  className="preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;