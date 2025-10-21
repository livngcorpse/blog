// frontend/src/App.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { userAPI } from './services/api';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import SinglePost from './pages/SinglePost';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import TagPosts from './pages/TagPosts';

// Styles
import './App.css';
import './styles/animations.css';

// Protected Route Component
const ProtectedRoute = ({ children, firebaseUser, userData }) => {
  if (!firebaseUser) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (firebaseUser && !userData) {
    console.log('⚙️ User profile incomplete, redirecting to edit-profile');
    return <Navigate to="/edit-profile" replace />;
  }

  return children;
};

function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 App mounted, setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔄 Auth state changed:', currentUser ? 'User logged in' : 'User logged out');
      
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        try {
          console.log('📡 Fetching user data for:', currentUser.uid);
          const response = await userAPI.getCurrentUser(currentUser.uid);
          console.log('✅ User data fetched:', response.data);
          setUserData(response.data);
          setError(null);
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          
          if (error.response?.status === 404) {
            console.log('👤 User profile not found, needs to create one');
            setUserData(null);
          } else {
            setError('Failed to load user profile');
          }
        }
      } else {
        console.log('🚪 User logged out, clearing userData');
        setUserData(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('❌ Auth listener error:', error);
      setError('Authentication error occurred');
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('📊 App State:', {
      loading,
      firebaseUser: firebaseUser?.uid,
      userData: userData?.username,
      error
    });
  }, [loading, firebaseUser, userData, error]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Blog Platform...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-banner">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar firebaseUser={firebaseUser} userData={userData} />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home userData={userData} />} />
            <Route path="/post/:id" element={<SinglePost userData={userData} />} />
            <Route path="/profile/:username" element={<Profile userData={userData} />} />
            <Route path="/search" element={<Search userData={userData} />} />
            <Route path="/tag/:tag" element={<TagPosts userData={userData} />} />
            
            {/* Auth Route - Redirect if already logged in */}
            <Route 
              path="/login" 
              element={
                firebaseUser ? <Navigate to="/" replace /> : <Login />
              } 
            />
            
            {/* Profile Edit - Special case: needs firebaseUser but not necessarily userData */}
            <Route 
              path="/edit-profile" 
              element={
                firebaseUser ? (
                  <EditProfile 
                    firebaseUser={firebaseUser} 
                    userData={userData} 
                    setUserData={setUserData} 
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Protected Routes - Need both firebaseUser and userData */}
            <Route 
              path="/create-post" 
              element={
                <ProtectedRoute firebaseUser={firebaseUser} userData={userData}>
                  <CreatePost userData={userData} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/edit-post/:id" 
              element={
                <ProtectedRoute firebaseUser={firebaseUser} userData={userData}>
                  <EditPost userData={userData} />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="not-found">
                  <h1>404</h1>
                  <p>Page not found</p>
                  <a href="/">← Back to Home</a>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;