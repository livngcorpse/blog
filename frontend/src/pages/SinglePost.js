import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import CommentBox from '../components/CommentBox';

const SinglePost = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getPostById(id);
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Post not found');
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(id, currentUser.uid);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div style={styles.error}>
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist or has been deleted.</p>
        <Link to="/" style={styles.homeLink}>← Back to Home</Link>
      </div>
    );
  }

  const isAuthor = currentUser && currentUser.uid === post.authorId;

  return (
    <div style={styles.container}>
      <div style={styles.navigation}>
        <Link to="/" style={styles.backLink}>← Back to Posts</Link>
      </div>

      <article style={styles.post}>
        <div style={styles.postHeader}>
          <h1 style={styles.title}>{post.title}</h1>
          {isAuthor && (
            <div style={styles.actions}>
              <Link to={`/edit-post/${post._id}`} style={styles.editBtn}>
                Edit Post
              </Link>
              <button onClick={handleDeletePost} style={styles.deleteBtn}>
                Delete Post
              </button>
            </div>
          )}
        </div>

        <div style={styles.postMeta}>
          <small style={styles.date}>
            Created: {formatDate(post.createdAt)}
          </small>
          {post.updatedAt !== post.createdAt && (
            <small style={styles.date}>
              Last updated: {formatDate(post.updatedAt)}
            </small>
          )}
        </div>

        <div style={styles.content}>
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} style={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* Comments Section */}
      <CommentBox postId={post._id} currentUser={currentUser} />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 1rem'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    marginTop: '2rem'
  },
  error: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  homeLink: {
    color: '#007bff',
    textDecoration: 'none'
  },
  navigation: {
    marginBottom: '2rem'
  },
  backLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  post: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  title: {
    margin: '0',
    color: '#333',
    lineHeight: '1.3'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0,
    marginLeft: '1rem'
  },
  editBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem'
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  postMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  date: {
    color: '#666',
    fontSize: '0.9rem'
  },
  content: {
    lineHeight: '1.8',
    fontSize: '1.1rem'
  },
  paragraph: {
    marginBottom: '1rem'
  }
};

export default SinglePost;