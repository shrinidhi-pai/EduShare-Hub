import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const Loader = ({ fullPage = false, size = 'md', text = '' }) => {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <motion.div
          className="loader-logo"
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="loader-spinner-ring" />
          <span className="loader-brand">EduShare</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`loader-wrapper loader-${size}`}>
      <div className="loader-spinner" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text short" />
      <div className="skeleton-footer">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-badge" />
      </div>
    </div>
  </div>
);

export default Loader;
