import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Login ID or Password');
        } else {
          throw new Error('Failed to connect to the server');
        }
      }

      const data = await response.json();
      
      login(data.token, {
        loginId: data.loginId,
        role: data.role,
        firstLogin: data.firstLogin
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT COLUMN: BRANDING */}
      <div className="login-branding">
        <div className="branding-background">
          <div className="abstract-shape shape-1"></div>
          <div className="abstract-shape shape-2"></div>
        </div>
        
        <div className="branding-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1>Dayflow HRMS</h1>
          </div>
          
          <div className="tagline-section">
            <h2>Simplifying workforce management.</h2>
            <p>Dayflow provides a unified platform to seamlessly manage your employees, attendance, leave, and core HR operations.</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Employee Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Attendance Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Leave Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="login-form-wrapper">
        <div className="login-form-container">
          <div className="mobile-logo">
            <div className="logo-icon-small">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span>Dayflow HRMS</span>
          </div>
          
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message" role="alert">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="loginId">Login ID</label>
              <div className="input-wrapper">
                <input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter your Login ID"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="security-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure, encrypted connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
