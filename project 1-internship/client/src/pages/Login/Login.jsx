import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(formData);
    if (result.success) {
      toast.success(result.message || 'Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <motion.div
          className="auth-panel auth-panel-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-brand">
            <Link to="/" className="auth-logo">
              <div className="auth-logo-icon"><FiBook size={22} /></div>
              <span>Edu<span>Share</span> Hub</span>
            </Link>
          </div>
          <div className="auth-panel-content">
            <h2 className="auth-panel-title">Your study hub awaits</h2>
            <p className="auth-panel-subtitle">
              Access thousands of curated study resources, connect with learners, and accelerate your education journey.
            </p>
            <div className="auth-features">
              {['10,000+ Study Resources', 'Share & Download PDFs', 'Bookmark & Organize', 'Connect with Learners'].map((f) => (
                <div key={f} className="auth-feature">
                  <div className="feature-check">✓</div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-panel-quote">
            <p>"The beautiful thing about learning is that nobody can take it away from you."</p>
            <span>— B.B. King</span>
          </div>
        </motion.div>

        {/* Right Panel - Form */}
        <motion.div
          className="auth-panel auth-panel-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h1 className="auth-form-title">Welcome back</h1>
              <p className="auth-form-subtitle">Sign in to continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" size={17} />
                  <input
                    type="email"
                    name="email"
                    className={`form-input input-with-icon ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input input-with-icon input-with-action ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="loading-dot" />
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <FiArrowRight size={17} /></>
                )}
              </button>

              {/* Demo Credentials */}
              <div className="demo-credentials">
                <p className="demo-title">🔑 Demo Credentials</p>
                <div className="demo-grid">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => setFormData({ email: 'student@demo.com', password: 'demo123' })}
                  >
                    👨‍🎓 Student Login
                  </button>
                  <button
                    type="button"
                    className="demo-btn demo-admin"
                    onClick={() => setFormData({ email: 'admin@edushare.com', password: 'admin123' })}
                  >
                    ⚡ Admin Login
                  </button>
                </div>
              </div>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one free →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
