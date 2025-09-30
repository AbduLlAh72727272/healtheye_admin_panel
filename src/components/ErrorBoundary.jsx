import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen-content" style={{ padding: '2rem' }}>
          <div style={{ 
            background: 'rgba(255, 77, 77, 0.1)', 
            border: '1px solid #ff4d4d', 
            borderRadius: '10px', 
            padding: '2rem',
            color: 'var(--primary-text)'
          }}>
            <h2 style={{ color: '#ff4d4d', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ marginBottom: '1rem' }}>
              There was an error loading this section. This might be due to:
            </p>
            <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li>Firebase authentication issues</li>
              <li>Network connectivity problems</li>
              <li>Database permissions</li>
            </ul>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: 'var(--primary-glow)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
                <summary>Error Details (Development Only)</summary>
                <pre style={{ 
                  background: 'rgba(0,0,0,0.5)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  overflow: 'auto',
                  marginTop: '0.5rem'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;