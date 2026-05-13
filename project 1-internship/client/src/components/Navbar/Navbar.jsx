import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUpload, FiBookmark, FiUser, FiLogOut, FiSettings, FiShield, FiSun, FiMoon, FiBook } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setShowDropdown(false);
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Browse', to: '/browse' },
    { label: 'About', to: '/about' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <FiBook size={20} />
          </div>
          <span className="logo-text">
            Edu<span className="logo-accent">Share</span> Hub
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/upload" className="btn btn-primary btn-sm">
                <FiUpload size={15} />
                Upload
              </Link>

              {/* User Dropdown */}
              <div className="user-menu" onMouseLeave={() => setShowDropdown(false)}>
                <button
                  className="user-avatar-btn"
                  onMouseEnter={() => setShowDropdown(true)}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="dropdown-header">
                        <p className="dropdown-name">{user?.name}</p>
                        <p className="dropdown-email">{user?.email}</p>
                        <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-primary'}`}>
                          {isAdmin ? '⚡ Admin' : '🎓 Student'}
                        </span>
                      </div>
                      <div className="dropdown-items">
                        <Link to="/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          <FiUser size={16} /> Dashboard
                        </Link>
                        <Link to="/bookmarks" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          <FiBookmark size={16} /> Bookmarks
                        </Link>
                        <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                          <FiSettings size={16} /> Profile Settings
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setShowDropdown(false)}>
                            <FiShield size={16} /> Admin Panel
                          </Link>
                        )}
                        <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                          <FiLogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="mobile-nav-link"
                onClick={() => setIsOpen(false)}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link to="/upload" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Upload</Link>
                <Link to="/bookmarks" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Bookmarks</Link>
                {isAdmin && (
                  <Link to="/admin" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                )}
                <button className="mobile-nav-link mobile-logout" onClick={() => { handleLogout(); setIsOpen(false); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="mobile-nav-link mobile-register" onClick={() => setIsOpen(false)}>Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
