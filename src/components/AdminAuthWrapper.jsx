import React, { useState, useEffect } from 'react';
import { onAdminAuthStateChanged, adminLogin, adminLogout, resetAdminPassword, getSuperAdminCredentials } from '../firebase/adminAuth.js';
import logo from '../assets/logo.png';

// Advanced Admin Login Component
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    const savedRemember = localStorage.getItem('rememberAdmin') === 'true';
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime) {
      const timer = setTimeout(() => {
        setLockoutTime(null);
        setLoginAttempts(0);
        setError('');
      }, lockoutTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is locked out
    if (lockoutTime) {
      setError(`Too many failed attempts. Please wait ${lockoutTime} seconds.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminLogin(email, password);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('rememberAdmin', 'true');
      } else {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('rememberAdmin');
      }
      
      // Reset login attempts on success
      setLoginAttempts(0);
      onLogin();
    } catch (err) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Implement lockout after 3 failed attempts
      if (newAttempts >= 3) {
        setLockoutTime(60); // 60 seconds lockout
        setError('Too many failed login attempts. Account locked for 60 seconds.');
      } else {
        setError(`${err.message} (${3 - newAttempts} attempts remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    const superAdminCreds = getSuperAdminCredentials();
    setEmail(superAdminCreds.email);
    setPassword(superAdminCreds.password);
    
    // Auto-submit
    setLoading(true);
    try {
      await adminLogin(superAdminCreds.email, superAdminCreds.password);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    setError('');

    try {
      await resetAdminPassword(email);
      setResetMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="admin-login">
      {/* Animated background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="HealthEye Logo" className="logo-icon" />
              <h2>HealthEye Admin</h2>
            </div>
            <p>Secure access to your admin dashboard</p>
          </div>
          
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <div className="input-container">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@healtheye.com"
                    className={error ? 'error' : ''}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <div className="input-container password-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className={error ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
              
              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
              
              {error && (
                <div className="message error-message">
                  <span className="message-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              {resetMessage && (
                <div className="message success-message">
                  <span className="message-icon">✅</span>
                  {resetMessage}
                </div>
              )}
              
              <div className="button-group">
                <button 
                  type="submit" 
                  disabled={loading || lockoutTime} 
                  className="login-button primary"
                >
                  {loading ? (
                    <span className="loading-content">
                      <span className="spinner"></span>
                      Signing in...
                    </span>
                  ) : lockoutTime ? (
                    `Locked (${lockoutTime}s)`
                  ) : (
                    'Sign In'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="login-button secondary"
                  title="Quick login with super admin credentials"
                >
                  🚀 Quick Login
                </button>
              </div>
              
              {loginAttempts > 0 && loginAttempts < 3 && (
                <div className="security-notice">
                  <span className="security-icon">🛡️</span>
                  {3 - loginAttempts} attempts remaining before temporary lockout
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="reset-form">
              <div className="form-group">
                <label htmlFor="reset-email">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              
              {error && (
                <div className="message error-message">
                  <span className="message-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              <div className="button-group">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="login-button primary"
                >
                  {resetLoading ? (
                    <span className="loading-content">
                      <span className="spinner"></span>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="login-button secondary"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .admin-login {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #0c0e1a 0%, #1a1d35 25%, #2a1f3d 50%, #1a1d35 75%, #0c0e1a 100%);
          overflow: hidden;
          position: relative;
        }
        
        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .floating-shape {
          position: absolute;
          background: linear-gradient(45deg, rgba(0, 170, 255, 0.1), rgba(147, 51, 234, 0.1));
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }
        
        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 15%;
          animation-delay: -7s;
        }
        
        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 50%;
          animation-delay: -14s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-30px) rotate(90deg); opacity: 0.5; }
          50% { transform: translateY(-60px) rotate(180deg); opacity: 0.7; }
          75% { transform: translateY(-30px) rotate(270deg); opacity: 0.5; }
        }
        
        .login-container {
          perspective: 1000px;
          z-index: 2;
          position: relative;
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          min-width: 450px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        }
        
        .login-card:hover {
          transform: rotateX(2deg) rotateY(2deg);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .logo-icon {
          width: 60px;
          height: 60px;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(0, 170, 255, 0.5));
          animation: pulse 3s infinite;
          border-radius: 8px;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .login-header h2 {
          color: var(--primary-text);
          font-family: var(--font-primary);
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00aaff, #9333ea);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .login-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          margin: 0.5rem 0 0;
        }
        
        .login-form, .reset-form {
          animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.7rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .label-icon {
          font-size: 1rem;
        }
        
        .input-container {
          position: relative;
        }
        
        .form-group input {
          width: 100%;
          padding: 1.2rem 1rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--primary-text);
          font-family: var(--font-secondary);
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: rgba(0, 170, 255, 0.6);
          box-shadow: 
            0 0 20px rgba(0, 170, 255, 0.2),
            0 0 0 3px rgba(0, 170, 255, 0.1);
          transform: translateY(-1px);
        }
        
        .form-group input.error {
          border-color: rgba(255, 77, 77, 0.6);
          box-shadow: 0 0 20px rgba(255, 77, 77, 0.2);
        }
        
        .password-container {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.6);
          transition: color 0.3s ease;
          padding: 0.5rem;
        }
        
        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          position: relative;
        }
        
        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }
        
        .checkmark {
          width: 18px;
          height: 18px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .checkbox-container input:checked + .checkmark {
          background: linear-gradient(135deg, #00aaff, #9333ea);
          border-color: transparent;
        }
        
        .checkbox-container input:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .forgot-password-link {
          background: none;
          border: none;
          color: rgba(0, 170, 255, 0.8);
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.2rem 0;
        }
        
        .forgot-password-link:hover {
          color: #00aaff;
          text-decoration: underline;
        }
        
        .message {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: messageSlide 0.4s ease-out;
        }
        
        @keyframes messageSlide {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .error-message {
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid rgba(255, 77, 77, 0.3);
          color: #ff9999;
        }
        
        .success-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }
        
        .message-icon {
          font-size: 1.1rem;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .login-button {
          width: 100%;
          padding: 1.2rem;
          border: none;
          border-radius: 12px;
          font-family: var(--font-secondary);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .login-button.primary {
          background: linear-gradient(135deg, #00aaff, #9333ea);
          color: white;
          box-shadow: 0 10px 30px rgba(0, 170, 255, 0.3);
        }
        
        .login-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 170, 255, 0.4);
        }
        
        .login-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .login-button.secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem;
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          color: #ffd700;
          font-size: 0.85rem;
          margin-top: 1rem;
          animation: securityPulse 2s infinite;
        }
        
        @keyframes securityPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .security-icon {
          font-size: 1rem;
        }
        
        @media (max-width: 480px) {
          .login-card {
            min-width: 90vw;
            padding: 2rem 1.5rem;
          }
          
          .form-options {
            flex-direction: column;
            align-items: stretch;
          }
          
          .button-group {
            gap: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

// Admin Auth Wrapper Component
export const AdminAuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((adminUser) => {
      setUser(adminUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Checking authentication...</p>
        </div>
        
        <style jsx>{`
          .loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
            background: var(--bg-color-dark);
            color: var(--primary-text);
          }
          
          .loading-content {
            text-align: center;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--primary-glow);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Logout button */}
      <div className="admin-logout">
        <span>Welcome, {user.email}</span>
        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </div>
      
      {children}
      
      <style jsx>{`
        .admin-logout {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 1rem;
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          border-radius: 25px;
          color: var(--secondary-text);
          font-size: 0.8rem;
        }
        
        .logout-button {
          background: var(--danger-color);
          border: none;
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          color: white;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background-color 0.3s;
        }
        
        .logout-button:hover {
          background: #ff3333;
        }
      `}</style>
    </div>
  );
};

export default AdminAuthWrapper;