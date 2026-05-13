import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFound.css';

const NotFound = () => (
  <div className="notfound-page">
    <motion.div className="notfound-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="notfound-code">404</div>
      <div className="notfound-orb" />
      <h1 className="notfound-title">Page Not Found</h1>
      <p className="notfound-subtitle">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="notfound-actions">
        <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
        <Link to="/browse" className="btn btn-outline btn-lg">Browse Resources</Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;
