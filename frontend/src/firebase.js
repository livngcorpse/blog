// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDDRv2nr_ZMgKEe2gj959Ad63X6hXtoovQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blog-platform-42749.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blog-platform-42749",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blog-platform-42749.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "377172609842",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:377172609842:web:90b12979c36de0821fe52b",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-09NS82TJL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;