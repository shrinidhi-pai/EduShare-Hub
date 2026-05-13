import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDownload, FiHeart, FiBookmark, FiStar, FiEye,
  FiFileText, FiImage, FiLink, FiFile, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { resourceService } from '../../services/api';
import { toast } from 'react-toastify';
import './ResourceCard.css';

const typeIcons = {
  pdf: <FiFileText size={16} />,
  doc: <FiFileText size={16} />,
  ppt: <FiFile size={16} />,
  image: <FiImage size={16} />,
  notes: <FiFileText size={16} />,
  link: <FiLink size={16} />,
};

const typeColors = {
  pdf: 'badge-danger',
  doc: 'badge-primary',
  ppt: 'badge-warning',
  image: 'badge-secondary',
  notes: 'badge-success',
  link: 'badge-secondary',
};

const ResourceCard = ({ resource, onLike, onBookmark, compact = false }) => {
  const { isAuthenticated, user } = useAuth();
  const isLiked = resource.likes?.includes(user?._id);
  const isBookmarked = user?.bookmarks?.includes(resource._id);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please login to like resources');
      return;
    }
    try {
      const { data } = await resourceService.like(resource._id);
      if (onLike) onLike(resource._id, data);
    } catch {
      toast.error('Failed to like resource');
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please login to bookmark resources');
      return;
    }
    try {
      const { data } = await resourceService.bookmark(resource._id);
      if (onBookmark) onBookmark(resource._id, data);
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks');
    } catch {
      toast.error('Failed to bookmark resource');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      className={`resource-card ${compact ? 'resource-card-compact' : ''}`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/resources/${resource._id}`} className="resource-card-link">
        {/* Thumbnail */}
        <div className="resource-thumbnail">
          {resource.thumbnail ? (
            <img src={resource.thumbnail} alt={resource.title} className="thumbnail-img" />
          ) : (
            <div className="thumbnail-placeholder">
              <span className="thumbnail-icon">{typeIcons[resource.resourceType] || <FiFileText size={32} />}</span>
              <span className="thumbnail-type">{resource.resourceType?.toUpperCase()}</span>
            </div>
          )}
          <div className="thumbnail-overlay">
            <span className="view-btn"><FiEye size={16} /> View</span>
          </div>
          <div className={`resource-type-badge badge ${typeColors[resource.resourceType] || 'badge-primary'}`}>
            {typeIcons[resource.resourceType]}
            {resource.resourceType?.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="resource-content">
          <h3 className="resource-title">{resource.title}</h3>
          <p className="resource-description">{resource.description}</p>

          <div className="resource-meta">
            <span className="meta-item">📚 {resource.subject}</span>
            <span className="meta-item">📅 Sem {resource.semester}</span>
          </div>

          {/* Tags */}
          {resource.tags?.length > 0 && (
            <div className="resource-tags">
              {resource.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="resource-tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Author & Date */}
          <div className="resource-footer">
            <div className="resource-author">
              <div className="author-avatar">
                {resource.uploadedBy?.avatar ? (
                  <img src={resource.uploadedBy.avatar} alt={resource.uploadedBy.name} />
                ) : (
                  <span>{resource.uploadedBy?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <span className="author-name">{resource.uploadedBy?.name || 'Unknown'}</span>
            </div>
            <span className="resource-date">{formatDate(resource.createdAt)}</span>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="resource-actions">
        <button
          className={`action-btn ${isLiked ? 'action-liked' : ''}`}
          onClick={handleLike}
          title="Like"
        >
          <FiHeart size={15} />
          <span>{resource.likes?.length || 0}</span>
        </button>

        <button className="action-btn" onClick={handleBookmark} title="Bookmark">
          <FiBookmark size={15} className={isBookmarked ? 'bookmarked' : ''} />
        </button>

        <div className="action-stat" title="Downloads">
          <FiDownload size={15} />
          <span>{resource.downloads || 0}</span>
        </div>

        {resource.averageRating > 0 && (
          <div className="action-stat" title="Rating">
            <FiStar size={15} className="star-icon" />
            <span>{resource.averageRating}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResourceCard;
