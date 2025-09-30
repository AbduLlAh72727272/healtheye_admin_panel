// Simple anonymous authentication for testing with better error handling
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config.js';

let isAuthenticating = false;
let isAuthenticated = false;

export const ensureAuthentication = async () => {
  if (isAuthenticated) {
    return true;
  }
  
  if (isAuthenticating) {
    // Wait for current authentication to complete
    return new Promise((resolve) => {
      const checkAuth = setInterval(() => {
        if (!isAuthenticating) {
          clearInterval(checkAuth);
          resolve(isAuthenticated);
        }
      }, 100);
    });
  }

  try {
    isAuthenticating = true;
    console.log('🔐 Attempting Firebase authentication...');
    
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Anonymous authentication successful:', userCredential.user.uid);
    isAuthenticated = true;
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    
    // Handle specific network errors
    if (error.code === 'auth/network-request-failed') {
      console.error('🌐 Network error: Please check your internet connection and Firebase configuration');
      console.error('💡 Possible solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify Firebase project configuration');
      console.error('   3. Check if Firebase APIs are enabled');
      console.error('   4. Verify API key permissions');
    }
    
    isAuthenticated = false;
    return false;
  } finally {
    isAuthenticating = false;
  }
};

// Check if user is already authenticated with better error handling
onAuthStateChanged(auth, (user) => {
  if (user) {
    isAuthenticated = true;
    console.log('✅ User is authenticated:', user.uid);
  } else {
    isAuthenticated = false;
    console.log('⚠️ User is not authenticated');
  }
}, (error) => {
  console.error('❌ Auth state change error:', error);
  isAuthenticated = false;
});