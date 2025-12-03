import React, { useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { generateAndStoreKeyPair } from '../utils/crypto';
=======
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { generateAndStoreKeyPair } from '../utils/crypto';
import './Auth.css';
>>>>>>> 44486ae (Full Deployment)

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
=======
  const [passwordStrength, setPasswordStrength] = useState(0);
>>>>>>> 44486ae (Full Deployment)
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
<<<<<<< HEAD
=======
    
    // Calculate password strength
    if (e.target.name === 'password') {
      const password = e.target.value;
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/(?=.*[a-z])/.test(password)) strength++;
      if (/(?=.*[A-Z])/.test(password)) strength++;
      if (/(?=.*\d)/.test(password)) strength++;
      if (/(?=.*[@$!%*?&])/.test(password)) strength++;
      setPasswordStrength(strength);
    }
>>>>>>> 44486ae (Full Deployment)
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  };

<<<<<<< HEAD
=======
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#ef4444';
    if (passwordStrength <= 3) return '#f59e0b';
    if (passwordStrength <= 4) return '#3b82f6';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

>>>>>>> 44486ae (Full Deployment)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      // Step 1: Register user
      const registerResponse = await authAPI.register(
        formData.username,
        formData.password
      );

      console.log('✅ User registered:', registerResponse);

      // Step 2: Generate key pair (RSA-2048)
      console.log('🔑 Generating key pair...');
      // Use RSA-2048 RSASSA signing key as long-term identity key
      const { publicKeySPKI, algorithm } = await generateAndStoreKeyPair(
        formData.username,
        'RSASSA-PKCS1-v1_5'
      );

      console.log('✅ Key pair generated and stored locally');

      // Step 3: Send public key to server
      await authAPI.updatePublicKey(
        formData.username,
        publicKeySPKI,
        algorithm
      );

      console.log('✅ Public key sent to server');

      // Step 4: Auto-login after registration
      const loginResponse = await authAPI.login(
        formData.username,
        formData.password
      );

      // Store token
      localStorage.setItem('authToken', loginResponse.token);
      localStorage.setItem('username', loginResponse.username);
      localStorage.setItem('userId', loginResponse.userId);

      // Navigate to dashboard/home
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.error || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        
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
              minLength={3}
              maxLength={30}
              style={styles.input}
              placeholder="Enter username (3-30 characters)"
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
              minLength={8}
              style={styles.input}
              placeholder="At least 8 characters"
            />
            <small style={styles.helpText}>
              Must contain uppercase, lowercase, and number
            </small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Re-enter password"
            />
=======
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🚀</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our secure messaging platform</p>
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
                minLength={3}
                maxLength={30}
                className="form-input"
                placeholder="Choose a username (3-30 characters)"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="form-input"
                placeholder="Create a strong password"
                disabled={loading}
              />
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span 
                  className="password-strength-text"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
            <small className="form-help">
              Must contain uppercase, lowercase, and number (min. 8 characters)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Re-enter your password"
                disabled={loading}
              />
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small className="form-error-text">Passwords do not match</small>
            )}
>>>>>>> 44486ae (Full Deployment)
          </div>

          <button
            type="submit"
            disabled={loading}
<<<<<<< HEAD
            style={styles.button}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>
            Login
          </a>
        </p>
=======
            className="auth-button auth-button-primary"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">🔐</span>
            <span className="feature-text">RSA-2048 Key Generation</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <span className="feature-text">Secure Key Storage</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span className="feature-text">End-to-End Encryption</span>
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
  helpText: {
    display: 'block',
    marginTop: '4px',
    color: '#888',
    fontSize: '12px'
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

export default Register;

=======
export default Register;
>>>>>>> 44486ae (Full Deployment)
