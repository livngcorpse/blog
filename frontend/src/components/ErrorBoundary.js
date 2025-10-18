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
    // Log the error to console or error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry, but an unexpected error occurred. Please try refreshing the page.</p>
          
          <div style={styles.buttonGroup}>
            <button onClick={this.handleReload} style={styles.reloadButton}>
              Reload Page
            </button>
            <button 
              onClick={() => window.history.back()} 
              style={styles.backButton}
            >
              Go Back
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={styles.errorDetails}>
              <summary style={styles.summary}>Error Details (Development Only)</summary>
              <pre style={styles.errorText}>
                {this.state.error && this.state.error.toString()}
              </pre>
              <pre style={styles.errorText}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '2rem auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem'
  },
  reloadButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  errorDetails: {
    marginTop: '2rem',
    textAlign: 'left',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '1rem'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#dc3545',
    backgroundColor: '#f8f9fa',
    padding: '0.5rem',
    borderRadius: '4px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap'
  }
};

export default ErrorBoundary;