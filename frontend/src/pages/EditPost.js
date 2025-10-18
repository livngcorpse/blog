import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../services/api';

const EditPost = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getPostById(id);
      const post = response.data;
      
      // Check if user is authorized to edit this post
      if (!currentUser || currentUser.uid !== post.authorId) {
        setError('You are not authorized to edit this post');
        setLoading(false);
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Post not found');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.uid
      };

      await postAPI.updatePost(id, postData);
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading post...</div>;
  }

  if (error && !currentUser) {
    return (
      <div style={styles.container}>
        <div style={styles.unauthorized}>
          <h2>Authentication Required</h2>
          <p>You need to be logged in to edit posts.</p>
          <Link to="/login" style={styles.loginLink}>Login</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" style={styles.homeLink}>Go back to Home</Link>
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
        <h1>Edit Post</h1>
        
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
              disabled={saving}
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
              disabled={saving}
            />
            <small style={styles.charCount}>
              {content.length} characters
            </small>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              disabled={saving || !title.trim() || !content.trim()}
              style={{
                ...styles.submitBtn,
                opacity: (saving || !title.trim() || !content.trim()) ? 0.6 : 1
              }}
            >
              {saving ? 'Updating...' : 'Update Post'}
            </button>
            
            <Link to={`/post/${id}`} style={styles.cancelBtn}>
              Cancel
            </Link>
          </div>
        </form>

        <div style={styles.tips}>
          <h3>Editing Tips:</h3>
          <ul>
            <li>Make sure your changes improve the content</li>
            <li>Check for spelling and grammar</li>
            <li>Keep your message clear and engaging</li>
            <li>Preview before saving</li>
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
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px'
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
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  homeLink: {
    display: 'inline-block',
    color: '#007bff',
    textDecoration: 'none',
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

export default EditPost;