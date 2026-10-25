import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import illustrationImg from '../assets/login-illustration.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password: password
      });

      if (response.data && response.data.token) {
        // Call login() from AuthContext to update React authentication state
        login(response.data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid response received from server.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split-card">
        {/* Top Header */}
        <div className="card-top-nav">
          <h1 className="brand-header-title">Login</h1>
        </div>

        {/* Content Grid: Form (Left) & Illustration (Right) */}
        <div className="card-content-grid">
          {/* Left Column: Form */}
          <div className="form-side">
            <h2 className="form-heading">Login to your account</h2>

            {error && (
              <div className="custom-error-banner" role="alert">
                <AlertCircle size={18} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <form className="form-elements" onSubmit={handleSubmit} noValidate>
              {/* Username / Email Input */}
              <div className="input-field-group">
                <div className="custom-input-wrapper">
                  <input
                    id="username-input"
                    type="text"
                    className="custom-input"
                    placeholder="Your Email or Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-field-group">
                <div className="custom-input-wrapper">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="custom-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.75} />
                    ) : (
                      <Eye size={18} strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Button Row */}
              <div className="form-action-row">
                <button
                  type="submit"
                  className="custom-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Illustration */}
          <div className="illustration-side">
            <img
              src={illustrationImg}
              alt="Classroom Room Booking Illustration"
              className="login-illustration-img"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
