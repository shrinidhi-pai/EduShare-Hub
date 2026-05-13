import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDownload, FiHeart, FiBookmark, FiStar, FiShare2, FiFlag,
  FiMessageSquare, FiSend, FiTrash2, FiFileText, FiLink, FiArrowLeft, FiExternalLink
} from 'react-icons/fi';
import { resourceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import Modal from '../../components/Modal/Modal';
import Loader from '../../components/Loader/Loader';
import './ResourceDetails.css';

const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          className={`star-btn ${(hovered || value) >= star ? 'star-filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}>★</button>
      ))}
    </div>
  );
};

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [resource, setResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const { data } = await resourceService.getById(id);
        setResource(data.resource);
        setComments(data.comments);
        setRelated(data.related);
        setLiked(data.resource.likes?.includes(user?._id));
        setBookmarked(user?.bookmarks?.includes(id));
        const existingRating = data.resource.ratings?.find(r => r.user === user?._id);
        if (existingRating) setUserRating(existingRating.value);
      } catch {
        toast.error('Resource not found');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, user]);

  const handleDownload = async () => {
    if (!resource.fileUrl && !resource.externalLink) { toast.error('No file available'); return; }
    try {
      await resourceService.download(id);
      const url = resource.fileUrl || resource.externalLink;
      if (resource.resourceType === 'link') {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url; a.download = resource.originalFileName || resource.title; a.click();
      }
      toast.success('Download started! 📥');
      setResource(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch { toast.error('Download failed'); }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { toast.info('Please login to like'); return; }
    try {
      const { data } = await resourceService.like(id);
      setLiked(data.liked);
      setResource(prev => ({ ...prev, likes: Array.from({ length: data.likesCount }) }));
      toast.success(data.liked ? 'Liked! ❤️' : 'Unliked');
    } catch { toast.error('Failed'); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.info('Please login to bookmark'); return; }
    try {
      const { data } = await resourceService.bookmark(id);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'Bookmarked! 🔖' : 'Removed from bookmarks');
    } catch { toast.error('Failed'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: resource.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    setCommentLoading(true);
    try {
      const { data } = await resourceService.comment(id, { text: commentText });
      setComments(prev => [data.comment, ...prev]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
    finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await resourceService.deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed'); }
  };

  const handleRate = async (value) => {
    if (!isAuthenticated) { toast.info('Please login to rate'); return; }
    try {
      const { data } = await resourceService.rate(id, { value });
      setUserRating(value);
      setResource(prev => ({ ...prev, averageRating: data.averageRating }));
      toast.success(`Rated ${value} stars! ⭐`);
    } catch { toast.error('Failed to rate'); }
  };

  const handleReport = async () => {
    if (!isAuthenticated) { toast.info('Please login to report'); return; }
    try {
      await resourceService.report(id, { reason: reportReason });
      setReportModal(false);
      toast.success('Resource reported. We will review it shortly.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to report'); }
  };

  if (loading) return <div className="page-wrapper"><Loader fullPage /></div>;
  if (!resource) return null;

  return (
    <div className="resource-details-page page-wrapper">
      <div className="container">
        <Link to="/browse" className="back-btn"><FiArrowLeft size={16} /> Back to Browse</Link>

        <div className="resource-details-layout">
          <main className="resource-main">
            <motion.div className="resource-hero-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="resource-hero-thumb">
                {resource.thumbnail ? (
                  <img src={resource.thumbnail} alt={resource.title} />
                ) : (
                  <div className="thumb-placeholder">
                    {resource.resourceType === 'link' ? <FiLink size={40} /> : <FiFileText size={40} />}
                    <span>{resource.resourceType?.toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="resource-hero-info">
                <div className="resource-badges">
                  <span className={`badge badge-${resource.resourceType === 'pdf' ? 'danger' : resource.resourceType === 'ppt' ? 'warning' : 'primary'}`}>
                    {resource.resourceType?.toUpperCase()}
                  </span>
                  <span className="badge badge-secondary">📚 {resource.subject}</span>
                  <span className="badge badge-success">Semester {resource.semester}</span>
                </div>

                <h1 className="resource-detail-title">{resource.title}</h1>
                <p className="resource-detail-description">{resource.description}</p>

                <div className="resource-detail-meta">
                  <div className="meta-group"><span className="meta-key">Department:</span><span className="meta-val">{resource.department}</span></div>
                  {resource.fileSize && <div className="meta-group"><span className="meta-key">File Size:</span><span className="meta-val">{resource.fileSize}</span></div>}
                  <div className="meta-group"><span className="meta-key">Uploaded:</span><span className="meta-val">{new Date(resource.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span></div>
                </div>

                {resource.tags?.length > 0 && (
                  <div className="resource-detail-tags">
                    {resource.tags.map(tag => (
                      <Link key={tag} to={`/browse?search=${tag}`} className="detail-tag">#{tag}</Link>
                    ))}
                  </div>
                )}

                <div className="resource-rating-section">
                  <div className="rating-display">
                    <StarRating value={Math.round(resource.averageRating)} readonly />
                    <span className="rating-score">{resource.averageRating || 0}</span>
                    <span className="rating-count">({resource.ratings?.length || 0} ratings)</span>
                  </div>
                  {isAuthenticated && (
                    <div className="rate-this"><span>Your rating:</span><StarRating value={userRating} onChange={handleRate} /></div>
                  )}
                </div>

                <div className="resource-detail-actions">
                  <button className="btn btn-primary btn-lg" onClick={handleDownload}>
                    {resource.resourceType === 'link' ? <FiExternalLink size={18} /> : <FiDownload size={18} />}
                    {resource.resourceType === 'link' ? 'Open Link' : 'Download'}
                    <span className="action-count">{resource.downloads}</span>
                  </button>
                  <button className={`btn btn-outline ${liked ? 'btn-liked' : ''}`} onClick={handleLike}>
                    <FiHeart size={17} /> {liked ? 'Liked' : 'Like'}
                    <span className="action-count">{resource.likes?.length || 0}</span>
                  </button>
                  <button className={`btn btn-outline ${bookmarked ? 'btn-bookmarked' : ''}`} onClick={handleBookmark}>
                    <FiBookmark size={17} /> {bookmarked ? 'Saved' : 'Save'}
                  </button>
                  <button className="btn btn-ghost" onClick={handleShare}><FiShare2 size={17} /> Share</button>
                  <button className="btn btn-ghost report-btn" onClick={() => setReportModal(true)}><FiFlag size={15} /></button>
                </div>
              </div>
            </motion.div>

            <motion.div className="comments-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="section-title" style={{ marginBottom: 24 }}>
                <FiMessageSquare /> Comments ({comments.length})
              </h2>
              {isAuthenticated ? (
                <form onSubmit={handleComment} className="comment-form">
                  <div className="comment-input-wrapper">
                    <div className="comment-avatar">
                      {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.charAt(0)}</span>}
                    </div>
                    <textarea className="form-textarea comment-textarea" placeholder="Add a comment..."
                      value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3} />
                  </div>
                  <div className="comment-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading || !commentText.trim()}>
                      <FiSend size={14} /> {commentLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="login-to-comment">
                  <Link to="/login" className="btn btn-primary btn-sm">Login to comment</Link>
                </div>
              )}
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments"><FiMessageSquare size={32} style={{ opacity: 0.3 }} /><p>Be the first to comment!</p></div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-avatar">
                        {comment.user?.avatar ? <img src={comment.user.avatar} alt={comment.user.name} /> : <span>{comment.user?.name?.charAt(0)}</span>}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user?.name}</span>
                          <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                      {(user?._id === comment.user?._id || user?.role === 'admin') && (
                        <button className="comment-delete" onClick={() => handleDeleteComment(comment._id)}><FiTrash2 size={14} /></button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </main>

          <aside className="resource-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Uploaded by</h3>
              <div className="uploader-info">
                <div className="uploader-avatar">
                  {resource.uploadedBy?.avatar ? <img src={resource.uploadedBy.avatar} alt={resource.uploadedBy.name} /> : <span>{resource.uploadedBy?.name?.charAt(0)}</span>}
                </div>
                <div>
                  <p className="uploader-name">{resource.uploadedBy?.name}</p>
                  <p className="uploader-dept">{resource.uploadedBy?.department || 'Student'}</p>
                </div>
              </div>
              {resource.uploadedBy?.bio && <p className="uploader-bio">{resource.uploadedBy.bio}</p>}
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">Stats</h3>
              <div className="resource-stats-grid">
                <div className="resource-stat-item"><span className="stat-num">{resource.downloads}</span><span className="stat-name">Downloads</span></div>
                <div className="resource-stat-item"><span className="stat-num">{resource.likes?.length || 0}</span><span className="stat-name">Likes</span></div>
                <div className="resource-stat-item"><span className="stat-num">{resource.averageRating || 0}</span><span className="stat-name">Rating</span></div>
                <div className="resource-stat-item"><span className="stat-num">{comments.length}</span><span className="stat-name">Comments</span></div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Related Resources</h3>
                <div className="related-list">
                  {related.map(r => (
                    <Link key={r._id} to={`/resources/${r._id}`} className="related-item">
                      <div className="related-thumb">
                        {r.thumbnail ? <img src={r.thumbnail} alt={r.title} /> : <span>{r.resourceType?.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div className="related-info">
                        <p className="related-title">{r.title}</p>
                        <p className="related-meta">{r.downloads} downloads</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title="Report Resource" size="sm">
        <div className="report-form">
          <p className="report-desc">Why are you reporting this resource?</p>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <select className="form-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="copyright">Copyright Violation</option>
              <option value="misleading">Misleading Information</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="report-actions">
            <button className="btn btn-ghost" onClick={() => setReportModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleReport}>Submit Report</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResourceDetails;
