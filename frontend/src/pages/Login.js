import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.navigation}>
        <Link to="/" style={styles.backLink}>← Back to Home</Link>
      </div>

      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <p style={styles.subtitle}>
            {isLogin 
              ? 'Welcome back! Please sign in to your account.' 
              : 'Create a new account to get started.'
            }
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={styles.switchMode}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
              }}
              style={styles.switchBtn}
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div style={styles.features}>
          <h3>Why join our blog platform?</h3>
          <ul style={styles.featureList}>
            <li>Share your thoughts and stories</li>
            <li>Connect with other writers</li>
            <li>Engage through comments</li>
            <li>Build your online presence</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
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
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '0.95rem',
    margin: '0.5rem 0 0 0'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb',
    fontSize: '0.9rem'
  },
  form: {
    marginBottom: '1.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s'
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold'
  },
  switchMode: {
    textAlign: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit'
  },
  features: {
    marginTop: '2rem',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '4px'
  },
  featureList: {
    marginLeft: '1rem',
    color: '#666'
  }
};

export default Login;