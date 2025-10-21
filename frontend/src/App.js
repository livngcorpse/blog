// frontend/src/App.js
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

// Protected Route Component (Fixed for v6)
const ProtectedRoute = ({ children, firebaseUser, userData }) => {
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (firebaseUser && !userData) {
    return <Navigate to="/edit-profile" replace />;
  }

  return children;
};

function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        try {
          const response = await userAPI.getCurrentUser(currentUser.uid);
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (error.response?.status === 404) {
            setUserData(null);
          }
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar firebaseUser={firebaseUser} userData={userData} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home userData={userData} />} />
            
            <Route 
              path="/login" 
              element={firebaseUser ? <Navigate to="/" replace /> : <Login />} 
            />
            
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
            
            <Route path="/post/:id" element={<SinglePost userData={userData} />} />
            
            <Route path="/profile/:username" element={<Profile userData={userData} />} />
            
            <Route 
              path="/edit-profile" 
              element={
                <ProtectedRoute firebaseUser={firebaseUser} userData={userData}>
                  <EditProfile 
                    firebaseUser={firebaseUser} 
                    userData={userData} 
                    setUserData={setUserData} 
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/search" element={<Search userData={userData} />} />
            
            <Route path="/tag/:tag" element={<TagPosts userData={userData} />} />
            
            <Route 
              path="*" 
              element={
                <div className="not-found">
                  <h1>404</h1>
                  <p>Page not found</p>
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