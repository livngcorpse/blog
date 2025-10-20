// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, firebaseUser, userData }) => {
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but hasn't set up profile yet
  if (firebaseUser && !userData) {
    return <Navigate to="/edit-profile" replace />;
  }

  return children;
};

export default PrivateRoute;