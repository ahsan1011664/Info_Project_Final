import React, { useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getPrivateKey } from '../utils/indexedDB';
import { generateAndStoreKeyPair } from '../utils/crypto';
=======
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getPrivateKey } from '../utils/indexedDB';
import { generateAndStoreKeyPair } from '../utils/crypto';
import './Auth.css';
>>>>>>> 44486ae (Full Deployment)

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Login
      const response = await authAPI.login(
        formData.username,
        formData.password
      );

      // Store token and user info
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('username', response.username);
      localStorage.setItem('userId', response.userId);

      // Verify private key exists locally; if missing (e.g., first login from new browser), generate it
      try {
        await getPrivateKey(response.username);
        console.log('✅ Private key found in IndexedDB');
      } catch (keyError) {
        console.warn('⚠️ Private key not found in IndexedDB. Generating a new signing key pair for this browser.');
        try {
          const { publicKeySPKI, algorithm } = await generateAndStoreKeyPair(
            response.username,
            'RSASSA-PKCS1-v1_5'
          );
          await authAPI.updatePublicKey(response.username, publicKeySPKI, algorithm);
          console.log('✅ New public key sent to server for this device/browser');
        } catch (genErr) {
          console.error('❌ Error generating/storing new key pair after login:', genErr);
        }
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your username"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
=======
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔒</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your secure messaging account</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
>>>>>>> 44486ae (Full Deployment)
          </div>

          <button
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <a href="/register" style={styles.link}>
            Register
          </a>
        </p>
=======
            className="auth-button auth-button-primary"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one now
            </Link>
          </p>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <span className="feature-text">End-to-End Encrypted</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔐</span>
            <span className="feature-text">Secure Key Storage</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span className="feature-text">Private Keys Never Leave Device</span>
          </div>
        </div>
>>>>>>> 44486ae (Full Deployment)
      </div>
    </div>
  );
};

<<<<<<< HEAD
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontSize: '28px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none'
  }
};

export default Login;

=======
export default Login;
>>>>>>> 44486ae (Full Deployment)
