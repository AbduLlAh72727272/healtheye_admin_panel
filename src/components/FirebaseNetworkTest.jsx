import React, { useState, useEffect } from 'react';
import { getFirebaseStatus } from '../firebase/config.js';

const FirebaseNetworkTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase configuration...');
      
      // Test 1: Check Firebase initialization
      const firebaseStatus = getFirebaseStatus();
      console.log('Firebase Status:', firebaseStatus);
      
      setDetails(firebaseStatus);
      
      // Test 2: Try to access Firestore
      setStatus('Testing Firestore connection...');
      
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config.js');
      
      // Try to read from a collection that should exist
      const testDoc = doc(db, 'users', 'test');
      await getDoc(testDoc);
      
      setStatus('✅ Firebase connection successful!');
      setError(null);
      
    } catch (err) {
      console.error('Firebase connection test failed:', err);
      setStatus('❌ Firebase connection failed');
      setError({
        code: err.code,
        message: err.message,
        details: err.toString()
      });
      
      // Provide specific troubleshooting based on error
      if (err.code === 'auth/network-request-failed') {
        setError(prev => ({
          ...prev,
          troubleshooting: [
            'Check your internet connection',
            'Verify Firebase API key is correct',
            'Ensure Firebase project is active',
            'Check firewall/proxy settings',
            'Verify projectId matches your Firebase project'
          ]
        }));
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      margin: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3>🔧 Firebase Network Connection Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> {status}
      </div>

      {details && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Firebase Configuration:</h4>
          <ul>
            <li><strong>Project ID:</strong> {details.projectId}</li>
            <li><strong>Auth Domain:</strong> {details.authDomain}</li>
            <li><strong>Initialized:</strong> {details.isInitialized ? 'Yes' : 'No'}</li>
            <li><strong>Environment:</strong> {details.environment}</li>
          </ul>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <h4>❌ Error Details:</h4>
          <p><strong>Code:</strong> {error.code}</p>
          <p><strong>Message:</strong> {error.message}</p>
          
          {error.troubleshooting && (
            <div>
              <h5>💡 Troubleshooting Steps:</h5>
              <ol>
                {error.troubleshooting.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={testFirebaseConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Connection Again
      </button>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '5px' 
      }}>
        <h4>🛠 Quick Fixes:</h4>
        <ul>
          <li>Check your internet connection</li>
          <li>Verify the API key in firebase/config.js</li>
          <li>Ensure the project ID matches your Firebase console</li>
          <li>Check if Firebase Authentication is enabled in your project</li>
          <li>Verify your domain is authorized in Firebase console</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseNetworkTest;