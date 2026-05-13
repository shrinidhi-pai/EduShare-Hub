import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUpload, FiSearch, FiUsers, FiDownload, FiStar, FiArrowRight,
  FiBook, FiFileText, FiLink, FiImage, FiTrendingUp, FiAward
} from 'react-icons/fi';
import { resourceService, userService } from '../../services/api';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { SkeletonCard } from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const CATEGORIES = [
  { icon: '📐', label: 'Mathematics', color: '#4F46E5', count: '2.4k' },
  { icon: '⚗️', label: 'Chemistry', color: '#06B6D4', count: '1.8k' },
  { icon: '💻', label: 'Computer Science', color: '#10B981', count: '3.1k' },
  { icon: '⚡', label: 'Physics', color: '#F59E0B', count: '1.5k' },
  { icon: '🧬', label: 'Biology', color: '#EF4444', count: '1.2k' },
  { icon: '📊', label: 'Economics', color: '#8B5CF6', count: '980' },
  { icon: '📚', label: 'Literature', color: '#EC4899', count: '760' },
  { icon: '🏛️', label: 'History', color: '#F97316', count: '640' },
];

const STATS = [
  { icon: <FiFileText size={28} />, value: '12,000+', label: 'Study Resources', color: 'var(--primary)' },
  { icon: <FiUsers size={28} />, value: '8,500+', label: 'Students', color: 'var(--secondary)' },
  { icon: <FiDownload size={28} />, value: '50,000+', label: 'Downloads', color: 'var(--success)' },
  { icon: <FiStar size={28} />, value: '4.9/5', label: 'Average Rating', color: 'var(--accent)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [latestResources, setLatestResources] = useState([]);
  const [trendingResources, setTrendingResources] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, trendingRes, contribRes] = await Promise.all([
          resourceService.getAll({ limit: 6, sort: 'newest' }),
          resourceService.getAll({ limit: 6, sort: 'downloads' }),
          userService.getTopContributors(),
        ]);
        setLatestResources(latestRes.data.resources);
        setTrendingResources(trendingRes.data.resources);
        setContributors(contribRes.data.contributors);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLike = useCallback((id, data) => {
    setLatestResources(prev =>
      prev.map(r => r._id === id ? { ...r, likes: data.liked ? [...(r.likes || []), 'me'] : (r.likes || []).slice(0, -1) } : r)
    );
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content container">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiTrendingUp size={14} />
              <span>🚀 Trusted by 8,500+ students worldwide</span>
            </motion.div>

            <h1 className="hero-title">
              Share Knowledge,
              <br />
              <span className="gradient-text">Elevate Learning</span>
            </h1>

            <p className="hero-subtitle">
              The ultimate study resource hub — upload, discover, and download
              high-quality notes, PDFs, presentations and more. Join the learning revolution.
            </p>

            <div className="hero-search">
              <SearchBar
                large
                placeholder="Search resources, subjects, topics..."
              />
            </div>

            <div className="hero-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <FiUpload size={18} /> Start Sharing Free
                  </Link>
                  <Link to="/browse" className="btn btn-outline btn-lg">
                    <FiSearch size={18} /> Browse Resources
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/upload" className="btn btn-primary btn-lg">
                    <FiUpload size={18} /> Upload Resource
                  </Link>
                  <Link to="/browse" className="btn btn-outline btn-lg">
                    <FiSearch size={18} /> Browse Resources
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              {STATS.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <span className="hero-stat-value" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="hero-cards-stack">
              <motion.div
                className="floating-card card-1"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="fcard-icon pdf">📄</div>
                <div className="fcard-info">
                  <p className="fcard-title">Data Structures Notes</p>
                  <p className="fcard-meta">1.2k downloads • ⭐ 4.9</p>
                </div>
              </motion.div>
              <motion.div
                className="floating-card card-2"
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="fcard-icon ppt">📊</div>
                <div className="fcard-info">
                  <p className="fcard-title">Machine Learning Slides</p>
                  <p className="fcard-meta">890 downloads • ⭐ 4.8</p>
                </div>
              </motion.div>
              <motion.div
                className="floating-card card-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="fcard-icon link">🔗</div>
                <div className="fcard-info">
                  <p className="fcard-title">Web Dev Resources</p>
                  <p className="fcard-meta">2.1k downloads • ⭐ 5.0</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="stats-section">
        <div className="container">
          <motion.div
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} className="stat-card" variants={itemVariants}>
                <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}15` }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="section-title">📚 Popular Categories</h2>
            <p className="section-subtitle">Explore resources across all academic disciplines</p>
          </div>
          <Link to="/browse" className="btn btn-outline btn-sm">
            View All <FiArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          className="categories-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.label} variants={itemVariants}>
              <Link
                to={`/browse?subject=${cat.label}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-icon">{cat.icon}</span>
                <p className="category-name">{cat.label}</p>
                <p className="category-count">{cat.count} resources</p>
                <div className="category-glow" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Latest Resources */}
      <section className="resources-section container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="section-title">🆕 Latest Resources</h2>
            <p className="section-subtitle">Freshly uploaded study materials from our community</p>
          </div>
          <Link to="/browse" className="btn btn-outline btn-sm">
            View All <FiArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : latestResources.length > 0 ? (
          <div className="grid-3">
            {latestResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} onLike={handleLike} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No resources uploaded yet. Be the first!</p>
            <Link to="/upload" className="btn btn-primary">Upload Now</Link>
          </div>
        )}
      </section>

      {/* Trending Resources */}
      {trendingResources.length > 0 && (
        <section className="resources-section container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="section-title">🔥 Trending Resources</h2>
              <p className="section-subtitle">Most downloaded resources this week</p>
            </div>
            <Link to="/browse?sort=downloads" className="btn btn-outline btn-sm">
              View All <FiArrowRight size={14} />
            </Link>
          </motion.div>
          <div className="grid-3">
            {trendingResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      {/* Top Contributors */}
      {contributors.length > 0 && (
        <section className="contributors-section container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="section-title">🏆 Top Contributors</h2>
              <p className="section-subtitle">Students making education accessible for all</p>
            </div>
          </motion.div>

          <motion.div
            className="contributors-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contributors.map((contributor, index) => (
              <motion.div key={contributor._id} className="contributor-card" variants={itemVariants}>
                <div className="contributor-rank">#{index + 1}</div>
                <div className="contributor-avatar">
                  {contributor.avatar ? (
                    <img src={contributor.avatar} alt={contributor.name} />
                  ) : (
                    <span>{contributor.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="contributor-info">
                  <p className="contributor-name">{contributor.name}</p>
                  <p className="contributor-dept">{contributor.department || 'Student'}</p>
                </div>
                <div className="contributor-stats">
                  <span>{contributor.totalUploads} uploads</span>
                  <span>{contributor.totalDownloads} downloads</span>
                </div>
                {index < 3 && (
                  <div className="contributor-badge">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section container">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="cta-bg" />
          <div className="cta-content">
            <h2 className="cta-title">Ready to share your knowledge?</h2>
            <p className="cta-subtitle">
              Join thousands of students sharing study materials and making education accessible to everyone.
            </p>
            <div className="cta-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <FiUpload size={18} /> Start for Free
                  </Link>
                  <Link to="/browse" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
                    Explore Resources
                  </Link>
                </>
              ) : (
                <Link to="/upload" className="btn btn-primary btn-lg">
                  <FiUpload size={18} /> Upload a Resource
                </Link>
              )}
            </div>
          </div>
          <FiAward className="cta-decoration" size={120} />
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
