import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiHeart, FiBookmark, FiEdit3, FiTrash2, FiEye, FiBarChart2 } from 'react-icons/fi';
import { resourceService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import Loader from '../../components/Loader/Loader';
import './Dashboard.css';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    className="dash-stat-card"
    whileHover={{ y: -3 }}
    style={{ '--stat-color': color }}
  >
    <div className="dash-stat-icon" style={{ color, background: `${color}15` }}>{icon}</div>
    <div className="dash-stat-info">
      <p className="dash-stat-value">{value}</p>
      <p className="dash-stat-label">{label}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ totalUploads: 0, totalDownloads: 0, totalLikes: 0, bookmarkCount: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, resource: null });
  const [activeTab, setActiveTab] = useState('uploads');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uploadsRes, dashRes] = await Promise.all([
          resourceService.getMyUploads(),
          userService.getDashboard(),
        ]);
        setUploads(uploadsRes.data.resources);
        setStats(dashRes.data.stats);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    try {
      await resourceService.delete(deleteModal.resource._id);
      setUploads(prev => prev.filter(r => r._id !== deleteModal.resource._id));
      setDeleteModal({ open: false, resource: null });
      toast.success('Resource deleted');
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="dashboard-page page-wrapper">
      <div className="container">
        {/* Welcome Header */}
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="dashboard-welcome">
            <div className="welcome-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="welcome-label">Welcome back,</p>
              <h1 className="welcome-name">{user?.name} 👋</h1>
              <p className="welcome-role">{user?.role === 'admin' ? '⚡ Administrator' : '🎓 Student'}</p>
            </div>
          </div>
          <div className="dashboard-header-actions">
            <Link to="/upload" className="btn btn-primary">
              <FiUpload size={16} /> Upload Resource
            </Link>
            <Link to="/profile" className="btn btn-outline">
              <FiEdit3 size={16} /> Edit Profile
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="dashboard-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard icon={<FiUpload size={24} />} label="Total Uploads" value={stats.totalUploads} color="var(--primary)" />
          <StatCard icon={<FiDownload size={24} />} label="Total Downloads" value={stats.totalDownloads} color="var(--secondary)" />
          <StatCard icon={<FiHeart size={24} />} label="Likes Received" value={stats.totalLikes} color="var(--danger)" />
          <StatCard icon={<FiBookmark size={24} />} label="Bookmarks" value={stats.bookmarkCount} color="var(--accent)" />
        </motion.div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dash-tab ${activeTab === 'uploads' ? 'dash-tab-active' : ''}`}
            onClick={() => setActiveTab('uploads')}
          >
            <FiUpload size={16} /> My Uploads ({uploads.length})
          </button>
          <button
            className={`dash-tab ${activeTab === 'bookmarks' ? 'dash-tab-active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <FiBookmark size={16} /> Bookmarks
          </button>
          <button
            className={`dash-tab ${activeTab === 'analytics' ? 'dash-tab-active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FiBarChart2 size={16} /> Analytics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'uploads' && (
          <motion.div
            className="uploads-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {uploads.length === 0 ? (
              <div className="empty-uploads">
                <FiUpload size={48} style={{ opacity: 0.2 }} />
                <h3>No uploads yet</h3>
                <p>Share your knowledge by uploading study resources</p>
                <Link to="/upload" className="btn btn-primary">Upload Your First Resource</Link>
              </div>
            ) : (
              <div className="uploads-table-wrapper">
                <table className="uploads-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Downloads</th>
                      <th>Likes</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((resource) => (
                      <tr key={resource._id}>
                        <td>
                          <div className="table-resource-name">
                            <div className="table-thumb">
                              {resource.thumbnail ? (
                                <img src={resource.thumbnail} alt={resource.title} />
                              ) : (
                                <span>{resource.resourceType?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <p className="resource-table-title">{resource.title}</p>
                              <p className="resource-table-dept">{resource.department}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${resource.resourceType === 'pdf' ? 'danger' : 'primary'}`}>{resource.resourceType?.toUpperCase()}</span></td>
                        <td className="table-text-muted">{resource.subject}</td>
                        <td className="table-text-muted">{resource.downloads}</td>
                        <td className="table-text-muted">{resource.likes?.length || 0}</td>
                        <td className="table-text-muted">{new Date(resource.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/resources/${resource._id}`} className="table-btn" title="View">
                              <FiEye size={15} />
                            </Link>
                            <button
                              className="table-btn table-btn-danger"
                              title="Delete"
                              onClick={() => setDeleteModal({ open: true, resource })}
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'bookmarks' && (
          <motion.div className="bookmarks-redirect" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-uploads">
              <FiBookmark size={48} style={{ opacity: 0.2 }} />
              <h3>View your bookmarks</h3>
              <p>See all resources you've saved for later</p>
              <Link to="/bookmarks" className="btn btn-primary">Go to Bookmarks</Link>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div className="analytics-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3 className="analytics-card-title">📊 Performance Overview</h3>
                <div className="analytics-metric">
                  <span>Average Downloads per Upload</span>
                  <strong>{stats.totalUploads ? Math.round(stats.totalDownloads / stats.totalUploads) : 0}</strong>
                </div>
                <div className="analytics-metric">
                  <span>Average Likes per Upload</span>
                  <strong>{stats.totalUploads ? Math.round(stats.totalLikes / stats.totalUploads) : 0}</strong>
                </div>
                <div className="analytics-metric">
                  <span>Total Reach</span>
                  <strong>{stats.totalDownloads + stats.totalLikes}</strong>
                </div>
              </div>
              <div className="analytics-card">
                <h3 className="analytics-card-title">🏆 Achievement Progress</h3>
                <div className="achievement-item">
                  <span>Uploader</span>
                  <div className="achievement-bar">
                    <div className="achievement-fill" style={{ width: `${Math.min((stats.totalUploads / 10) * 100, 100)}%` }} />
                  </div>
                  <span>{stats.totalUploads}/10</span>
                </div>
                <div className="achievement-item">
                  <span>Popular Creator</span>
                  <div className="achievement-bar">
                    <div className="achievement-fill" style={{ width: `${Math.min((stats.totalDownloads / 100) * 100, 100)}%` }} />
                  </div>
                  <span>{stats.totalDownloads}/100</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, resource: null })} title="Delete Resource" size="sm">
        <div className="delete-confirm">
          <p>Are you sure you want to delete <strong>"{deleteModal.resource?.title}"</strong>? This action cannot be undone.</p>
          <div className="delete-actions">
            <button className="btn btn-ghost" onClick={() => setDeleteModal({ open: false, resource: null })}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Resource</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
