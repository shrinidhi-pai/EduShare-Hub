import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiFlag, FiBarChart2, FiTrash2, FiShield, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader/Loader';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import './AdminPanel.css';

// ===================== ANALYTICS =====================
const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!analytics) return null;

  const statCards = [
    { label: 'Total Users', value: analytics.totalUsers, color: 'var(--primary)', icon: <FiUsers size={22} /> },
    { label: 'Total Resources', value: analytics.totalResources, color: 'var(--secondary)', icon: <FiFileText size={22} /> },
    { label: 'Total Downloads', value: analytics.totalDownloads, color: 'var(--success)', icon: <FiBarChart2 size={22} /> },
    { label: 'Pending Reports', value: analytics.pendingReports, color: 'var(--danger)', icon: <FiFlag size={22} /> },
    { label: 'New Users (30d)', value: analytics.newUsersThisMonth, color: 'var(--accent)', icon: <FiUsers size={22} /> },
    { label: 'New Resources (30d)', value: analytics.newResourcesThisMonth, color: 'var(--primary)', icon: <FiFileText size={22} /> },
  ];

  return (
    <div>
      <h2 className="admin-section-title">📊 Platform Analytics</h2>
      <div className="admin-stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card" style={{ borderLeftColor: s.color }}>
            <div className="admin-stat-icon" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
            <div>
              <p className="admin-stat-value">{s.value?.toLocaleString()}</p>
              <p className="admin-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-card">
          <h3 className="admin-card-title">🔥 Top Subjects by Downloads</h3>
          {analytics.topSubjects?.map((s, i) => (
            <div key={s._id} className="top-subject-item">
              <span className="subject-rank">#{i + 1}</span>
              <span className="subject-name">{s._id}</span>
              <div className="subject-bar-wrap">
                <div className="subject-bar" style={{ width: `${Math.min((s.downloads / (analytics.topSubjects[0]?.downloads || 1)) * 100, 100)}%` }} />
              </div>
              <span className="subject-count">{s.downloads}</span>
            </div>
          ))}
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">📁 Resources by Type</h3>
          {analytics.resourcesByType?.map(t => (
            <div key={t._id} className="type-stat-item">
              <span className="type-stat-name">{t._id?.toUpperCase()}</span>
              <div className="type-stat-bar-wrap">
                <div className="type-stat-bar" style={{ width: `${(t.count / analytics.totalResources) * 100}%` }} />
              </div>
              <span className="type-stat-count">{t.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== USERS =====================
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getUsers({ page, search, limit: 15 });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleBan = async (id) => {
    try {
      const { data } = await adminService.banUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: data.isBanned } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to update user'); }
  };

  const handlePromote = async (id) => {
    try {
      const { data } = await adminService.promoteUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: data.role } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to promote user'); }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h2 className="admin-section-title">👥 User Management</h2>
        <div className="admin-search-wrap">
          <input className="form-input" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
          <button className="btn btn-primary btn-sm" onClick={fetchUsers}><FiRefreshCw size={14} /></button>
        </div>
      </div>
      {loading ? <Loader /> : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar">{user.name?.charAt(0)}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{user.email}</td>
                    <td><span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{user.role}</span></td>
                    <td><span className={`badge ${user.isBanned ? 'badge-danger' : 'badge-success'}`}>{user.isBanned ? 'Banned' : 'Active'}</span></td>
                    <td className="text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className={`table-btn ${user.isBanned ? 'btn-success-sm' : 'table-btn-danger'}`} onClick={() => handleBan(user._id)} title={user.isBanned ? 'Unban' : 'Ban'}>
                          {user.isBanned ? <FiCheck size={14} /> : <FiX size={14} />}
                        </button>
                        {user.role !== 'admin' && (
                          <button className="table-btn" onClick={() => handlePromote(user._id)} title="Promote to Admin">
                            <FiShield size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ===================== RESOURCES =====================
const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    setLoading(true);
    adminService.getResources({ page, limit: 15 })
      .then(({ data }) => { setResources(data.resources); setTotalPages(data.totalPages); })
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async () => {
    try {
      await adminService.deleteResource(deleteModal.id);
      setResources(prev => prev.filter(r => r._id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
      toast.success('Resource deleted by admin');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <h2 className="admin-section-title">📚 Resource Management</h2>
      {loading ? <Loader /> : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Resource</th><th>Type</th><th>Uploaded By</th><th>Downloads</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r._id}>
                    <td><span className="resource-name-cell">{r.title}</span></td>
                    <td><span className="badge badge-primary">{r.resourceType?.toUpperCase()}</span></td>
                    <td className="text-muted">{r.uploadedBy?.name}</td>
                    <td className="text-muted">{r.downloads}</td>
                    <td className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="table-btn table-btn-danger" onClick={() => setDeleteModal({ open: true, id: r._id })}>
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Delete Resource" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Are you sure you want to delete this resource? This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

// ===================== REPORTS =====================
const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminService.getReports({ page, limit: 15 })
      .then(({ data }) => { setReports(data.reports); setTotalPages(data.totalPages); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleStatus = async (id, status) => {
    try {
      await adminService.updateReport(id, { status });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success('Report status updated');
    } catch { toast.error('Failed to update report'); }
  };

  const STATUS_COLORS = { pending: 'badge-warning', reviewed: 'badge-primary', resolved: 'badge-success', dismissed: 'badge-secondary' };

  return (
    <div>
      <h2 className="admin-section-title">🚨 Report Management</h2>
      {loading ? <Loader /> : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Resource</th><th>Reported By</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id}>
                    <td className="text-primary">{r.resource?.title || 'Deleted'}</td>
                    <td className="text-muted">{r.reportedBy?.name}</td>
                    <td><span className="badge badge-danger">{r.reason}</span></td>
                    <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                    <td className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select className="form-select" style={{ padding: '6px 10px', fontSize: 12 }} value={r.status} onChange={(e) => handleStatus(r._id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ===================== MAIN ADMIN PANEL =====================
const AdminPanel = () => {
  const navItems = [
    { to: '/admin', label: 'Analytics', icon: <FiBarChart2 size={16} />, end: true },
    { to: '/admin/users', label: 'Users', icon: <FiUsers size={16} /> },
    { to: '/admin/resources', label: 'Resources', icon: <FiFileText size={16} /> },
    { to: '/admin/reports', label: 'Reports', icon: <FiFlag size={16} /> },
  ];

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div className="admin-badge"><FiShield size={20} /> Admin Panel</div>
          <h1 className="page-title">Administration Dashboard</h1>
          <p className="page-subtitle">Manage users, resources, and platform content</p>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-active' : ''}`}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </aside>
          <main className="admin-main">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Routes>
                <Route index element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="resources" element={<AdminResources />} />
                <Route path="reports" element={<AdminReports />} />
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
