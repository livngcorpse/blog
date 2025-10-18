import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../services/api';

const CreatePost = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to create a post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.uid
      };

      const response = await postAPI.createPost(postData);
      navigate(`/post/${response.data._id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={styles.container}>
        <div style={styles.unauthorized}>
          <h2>Authentication Required</h2>
          <p>You need to be logged in to create a post.</p>
          <Link to="/login" style={styles.loginLink}>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navigation}>
        <Link to="/" style={styles.backLink}>← Back to Home</Link>
      </div>

      <div style={styles.formContainer}>
        <h1>Create New Post</h1>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="title" style={styles.label}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Enter your post title..."
              maxLength="100"
              disabled={loading}
            />
            <small style={styles.charCount}>
              {title.length}/100 characters
            </small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="content" style={styles.label}>
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={styles.textarea}
              placeholder="Write your post content here..."
              rows="12"
              disabled={loading}
            />
            <small style={styles.charCount}>
              {content.length} characters
            </small>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              disabled={loading || !title.trim() || !content.trim()}
              style={{
                ...styles.submitBtn,
                opacity: (loading || !title.trim() || !content.trim()) ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
            
            <Link to="/" style={styles.cancelBtn}>
              Cancel
            </Link>
          </div>
        </form>

        <div style={styles.tips}>
          <h3>Writing Tips:</h3>
          <ul>
            <li>Keep your title clear and engaging</li>
            <li>Use paragraphs to break up your content</li>
            <li>Write in a conversational tone</li>
            <li>Preview your post before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 1rem'
  },
  navigation: {
    marginBottom: '2rem'
  },
  backLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  unauthorized: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  loginLink: {
    display: 'inline-block',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    marginTop: '1rem'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb'
  },
  form: {
    marginBottom: '2rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    boxSizing: 'border-box'
  },
  charCount: {
    display: 'block',
    marginTop: '0.25rem',
    color: '#666',
    fontSize: '0.875rem'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  submitBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  cancelBtn: {
    color: '#6c757d',
    textDecoration: 'none',
    padding: '0.75rem 1rem',
    border: '1px solid #6c757d',
    borderRadius: '4px'
  },
  tips: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '4px',
    marginTop: '2rem'
  }
};

export default CreatePost;