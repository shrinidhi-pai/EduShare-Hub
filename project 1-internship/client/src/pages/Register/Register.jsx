import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../Login/Login.css';
import './Register.css';

const Register = () => {
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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

    const result = await register(formData);
    if (result.success) {
      toast.success('Account created! Welcome to EduShare Hub 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'var(--danger)' };
    if (password.length < 10) return { strength: 2, label: 'Fair', color: 'var(--warning)' };
    if (password.length < 14) return { strength: 3, label: 'Good', color: 'var(--secondary)' };
    return { strength: 4, label: 'Strong', color: 'var(--success)' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-page">
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
            <h2 className="auth-panel-title">Join the Learning Community</h2>
            <p className="auth-panel-subtitle">
              Create your free account and start sharing your knowledge with thousands of students worldwide.
            </p>
            <div className="auth-features">
              {['Free forever, no credit card', 'Upload unlimited resources', 'Earn recognition badges', 'Connect with top students'].map((f) => (
                <div key={f} className="auth-feature">
                  <div className="feature-check">✓</div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-panel-quote">
            <p>"An investment in knowledge pays the best interest."</p>
            <span>— Benjamin Franklin</span>
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
              <h1 className="auth-form-title">Create Account</h1>
              <p className="auth-form-subtitle">Join thousands of students on EduShare Hub</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" size={17} />
                  <input
                    type="text"
                    name="name"
                    className={`form-input input-with-icon ${errors.name ? 'input-error' : ''}`}
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

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
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="strength-bar"
                          style={{ background: i <= passwordStrength.strength ? passwordStrength.color : 'var(--bg-tertiary)' }}
                        />
                      ))}
                    </div>
                    <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                )}
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" size={17} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input input-with-icon input-with-action ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-action" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="field-success"><FiCheckCircle size={13} /> Passwords match!</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading"><span className="loading-dot" /> Creating account...</span>
                ) : (
                  <>Create Free Account <FiArrowRight size={17} /></>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
