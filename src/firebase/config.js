// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration for HealthEye project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBYt5qvGIgY0-HmKKyZYLsC-9B4N1hvchY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "healtheye-95247.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "healtheye-95247",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "healtheye-95247.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "665299717479",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:665299717479:web:a23c7fe893e00f64e1b5b9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KPFP1S0E3R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage (for file uploads like medical reports)
export const storage = getStorage(app);

// Firebase connection status
export const getFirebaseStatus = () => {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    isInitialized: !!app,
    environment: import.meta.env.MODE || 'production'
  };
};

// Test Firebase connection
export const testConnection = async () => {
  try {
    // Test Firestore connection
    const { doc, getDoc } = await import('firebase/firestore');
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('✅ Firebase connection successful');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);
    
    return {
      success: true,
      projectId: firebaseConfig.projectId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default app;