import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><FiBook size={18} /></div>
              <span>Edu<span className="logo-accent">Share</span> Hub</span>
            </Link>
            <p className="footer-tagline">
              The ultimate platform for students to share, discover, and learn from quality study resources.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-btn" aria-label="GitHub"><FiGithub size={18} /></a>
              <a href="#" className="social-btn" aria-label="Twitter"><FiTwitter size={18} /></a>
              <a href="#" className="social-btn" aria-label="LinkedIn"><FiLinkedin size={18} /></a>
              <a href="#" className="social-btn" aria-label="Email"><FiMail size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse Resources</Link></li>
              <li><Link to="/upload">Upload Resource</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/browse?type=pdf">PDF Notes</Link></li>
              <li><Link to="/browse?type=ppt">Presentations</Link></li>
              <li><Link to="/browse?type=doc">Documents</Link></li>
              <li><Link to="/browse?type=link">Useful Links</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h4 className="footer-col-title">Account</h4>
            <ul className="footer-links">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/bookmarks">Bookmarks</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} EduShare Hub. Built with ❤️ for students.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
