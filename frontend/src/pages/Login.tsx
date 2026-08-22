import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Hexagon, User, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
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
    <div className="login-page-wrapper">
      <div className="login-card">
        
        <div className="login-brand-header">
          <Hexagon className="login-logo-icon" />
          <h1 className="login-brand-title">Dayflow HRMS</h1>
          <p className="login-brand-subtitle">Human Resource Management</p>
        </div>

        <h2 className="login-form-title">Welcome back</h2>
        <p className="login-form-desc">Sign in to access your workspace.</p>

        <form onSubmit={handleLogin} noValidate>
          {error && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-form-group">
            <label htmlFor="loginId">Login ID</label>
            <div className="login-input-wrapper">
              <User className="login-input-icon" />
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

          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" />
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
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? (
              <Loader2 size={20} className="login-spinner" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="login-secure-footer">
          <ShieldCheck size={16} />
          <span>Secure connection</span>
        </div>
      </div>
      
      <div className="login-copyright">
        © 2026 Dayflow HRMS. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
