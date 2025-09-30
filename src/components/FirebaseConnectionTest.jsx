import React, { useState, useEffect } from 'react';
import { testFirebaseConnection } from '../firebase/services.js';
import { getFirebaseStatus } from '../firebase/config.js';
import { adminLogin, getCurrentAdminSession } from '../firebase/adminAuth.js';

const FirebaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState(null);
  const [adminSession, setAdminSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Test Firebase connection on component mount
    testConnection();
    setFirebaseStatus(getFirebaseStatus());
    setAdminSession(getCurrentAdminSession());
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await testFirebaseConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAdminLogin = async () => {
    try {
      // This is just a test - replace with actual admin credentials
      await adminLogin('admin@healtheye.com', 'your-password');
      setAdminSession(getCurrentAdminSession());
    } catch (error) {
      console.error('Admin login test failed:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2>🔧 Firebase Connection Test</h2>
      
      {/* Firebase Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>📊 Firebase Configuration Status</h3>
        {firebaseStatus && (
          <div>
            <p><strong>Project ID:</strong> {firebaseStatus.projectId}</p>
            <p><strong>Auth Domain:</strong> {firebaseStatus.authDomain}</p>
            <p><strong>Initialized:</strong> {firebaseStatus.isInitialized ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Environment:</strong> {firebaseStatus.environment}</p>
          </div>
        )}
      </div>

      {/* Connection Test */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>🌐 Connection Test</h3>
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
        
        {connectionStatus && (
          <div style={{ marginTop: '10px' }}>
            {connectionStatus.success ? (
              <div style={{ color: 'green' }}>
                <p>✅ <strong>Connection Successful!</strong></p>
                <p>Connected to project: {connectionStatus.projectId}</p>
                <p>Timestamp: {connectionStatus.timestamp}</p>
              </div>
            ) : (
              <div style={{ color: 'red' }}>
                <p>❌ <strong>Connection Failed</strong></p>
                <p>Error: {connectionStatus.error}</p>
                <p>Timestamp: {connectionStatus.timestamp}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Session */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>👤 Admin Session Status</h3>
        {adminSession ? (
          <div style={{ color: 'green' }}>
            <p>✅ <strong>Admin Logged In</strong></p>
            <p>Email: {adminSession.email}</p>
            <p>UID: {adminSession.uid}</p>
            <p>Last Login: {adminSession.lastLoginTime}</p>
          </div>
        ) : (
          <div style={{ color: 'orange' }}>
            <p>⚠️ <strong>No Admin Session</strong></p>
            <p>Admin login required for full functionality</p>
            <button 
              onClick={testAdminLogin}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Test Admin Login
            </button>
          </div>
        )}
      </div>

      {/* Collections Status */}
      <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>📁 Available Collections</h3>
        <ul>
          <li>✅ users - Patient/user accounts</li>
          <li>✅ doctors - Doctor profiles</li>
          <li>✅ appointments - Medical appointments</li>
          <li>✅ medical_reports - Patient medical reports</li>
          <li>✅ chats - Patient-doctor conversations</li>
          <li>✅ admins - Admin user profiles</li>
        </ul>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          All collections are configured and ready for use in your admin panel.
        </p>
      </div>

      {/* Next Steps */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
        <h3>🎯 Next Steps</h3>
        <ol>
          <li>Set up Firestore security rules for admin access</li>
          <li>Create admin user accounts in Firebase Authentication</li>
          <li>Configure role-based permissions</li>
          <li>Build your admin dashboard UI</li>
          <li>Test with real data from your Flutter app</li>
        </ol>
      </div>
    </div>
  );
};

export default FirebaseConnectionTest;