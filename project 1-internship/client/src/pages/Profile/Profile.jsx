import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCamera, FiLock, FiSave, FiEdit3 } from 'react-icons/fi';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const DEPARTMENTS = ['Computer Science','Mathematics','Physics','Chemistry','Biology','Economics','Mechanical','Electrical','Civil','Management','Other'];
const SEMESTERS = ['1','2','3','4','5','6','7','8'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '', department: user?.department || '', semester: user?.semester || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setProfileLoading(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await authService.updateProfile(fd);
      updateUser(data.user);
      toast.success('Profile updated! ✅');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPasswordLoading(true);
    try {
      await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const currentAvatar = avatarPreview || user?.avatar;

  return (
    <div className="profile-page page-wrapper">
      <div className="container">
        <div className="profile-container">
          {/* Profile Sidebar */}
          <div className="profile-sidebar">
            <motion.div className="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="avatar-section">
                <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
                  {currentAvatar ? (
                    <img src={currentAvatar} alt={user?.name} className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="avatar-overlay">
                    <FiCamera size={20} />
                    <span>Change</span>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </div>
                <h2 className="profile-name">{user?.name}</h2>
                <p className="profile-email">{user?.email}</p>
                <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                  {user?.role === 'admin' ? '⚡ Admin' : '🎓 Student'}
                </span>
              </div>

              <div className="profile-info-list">
                {user?.department && <div className="profile-info-item"><FiUser size={14} /><span>{user.department}</span></div>}
                {user?.semester && <div className="profile-info-item"><span>📅</span><span>Semester {user.semester}</span></div>}
                {user?.bio && <p className="profile-bio">{user.bio}</p>}
              </div>

              <p className="profile-joined">Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </motion.div>
          </div>

          {/* Profile Main */}
          <div className="profile-main">
            <div className="profile-tabs">
              <button className={`dash-tab ${activeTab === 'profile' ? 'dash-tab-active' : ''}`} onClick={() => setActiveTab('profile')}>
                <FiEdit3 size={15} /> Edit Profile
              </button>
              <button className={`dash-tab ${activeTab === 'password' ? 'dash-tab-active' : ''}`} onClick={() => setActiveTab('password')}>
                <FiLock size={15} /> Change Password
              </button>
            </div>

            {activeTab === 'profile' && (
              <motion.form className="profile-form-card" onSubmit={handleProfileSave} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="form-card-title">Personal Information</h3>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" size={17} />
                    <input className="form-input input-with-icon" value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" size={17} />
                    <input className="form-input input-with-icon" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <p className="field-hint">Email cannot be changed</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={profileForm.bio} rows={3}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about yourself..." maxLength={200} />
                  <p className="field-hint">{profileForm.bio.length}/200</p>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={profileForm.department}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Semester</label>
                    <select className="form-select" value={profileForm.semester}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, semester: e.target.value }))}>
                      <option value="">Select Semester</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  <FiSave size={16} /> {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.form>
            )}

            {activeTab === 'password' && (
              <motion.form className="profile-form-card" onSubmit={handlePasswordSave} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="form-card-title">Change Password</h3>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password (min 6 chars)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  <FiLock size={16} /> {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
