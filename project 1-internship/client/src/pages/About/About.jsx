import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiSearch, FiBookmark, FiStar, FiUsers, FiZap, FiBook, FiGithub } from 'react-icons/fi';
import './About.css';

const FEATURES = [
  { icon: <FiUpload size={24} />, title: 'Easy Upload', desc: 'Upload PDFs, DOCs, PPTs, images and links in seconds with our drag-and-drop interface.' },
  { icon: <FiSearch size={24} />, title: 'Smart Search', desc: 'Find exactly what you need with powerful filters by subject, semester, department and tags.' },
  { icon: <FiBookmark size={24} />, title: 'Save & Organize', desc: 'Bookmark resources for later and build your personal study library.' },
  { icon: <FiStar size={24} />, title: 'Rate & Review', desc: 'Rate resources and read peer reviews to find the most helpful materials.' },
  { icon: <FiUsers size={24} />, title: 'Community Driven', desc: 'Built by students for students. Share knowledge and grow together.' },
  { icon: <FiZap size={24} />, title: 'Lightning Fast', desc: 'Optimized for speed with lazy loading, pagination and efficient search.' },
];

const TEAM = [
  { name: 'Alex Johnson', role: 'Full Stack Developer', avatar: '👨‍💻' },
  { name: 'Sarah Chen', role: 'UI/UX Designer', avatar: '👩‍🎨' },
  { name: 'Rahul Kumar', role: 'Backend Engineer', avatar: '👨‍⚙️' },
  { name: 'Priya Sharma', role: 'Frontend Developer', avatar: '👩‍💻' },
];

const About = () => (
  <div className="about-page page-wrapper">
    {/* Hero */}
    <section className="about-hero">
      <div className="about-hero-bg" />
      <div className="container about-hero-content">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="about-badge"><FiBook size={14} /> Our Mission</div>
          <h1 className="about-title">Making Education <span className="gradient-text">Accessible to All</span></h1>
          <p className="about-subtitle">
            EduShare Hub was born from a simple belief: every student deserves access to quality study materials.
            We're building the world's largest peer-to-peer educational resource platform.
          </p>
          <div className="about-hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Join the Community</Link>
            <Link to="/browse" className="btn btn-outline btn-lg">Explore Resources</Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Stats */}
    <section className="about-stats-section">
      <div className="container">
        <div className="about-stats-grid">
          {[['12,000+', 'Study Resources'], ['8,500+', 'Students'], ['50,000+', 'Downloads'], ['150+', 'Subjects']].map(([val, label]) => (
            <motion.div key={label} className="about-stat-item" whileHover={{ y: -4 }}>
              <p className="about-stat-val gradient-text">{val}</p>
              <p className="about-stat-label">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="about-features container">
      <div className="section-header" style={{ justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
        <h2 className="section-title">Everything you need to study smarter</h2>
        <p className="section-subtitle">Packed with powerful features designed for modern students</p>
      </div>
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} className="feature-card"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Mission */}
    <section className="about-mission container">
      <div className="mission-card">
        <div className="mission-content">
          <h2 className="mission-title">Our Story</h2>
          <p className="mission-text">
            EduShare Hub started as a final year project but grew into something much bigger — a platform used by thousands of students to share and discover quality educational resources.
          </p>
          <p className="mission-text">
            We believe that knowledge shared is knowledge multiplied. When students collaborate and share their notes, presentations, and study materials, everyone benefits.
          </p>
          <p className="mission-text">
            Built with the MERN stack, EduShare Hub demonstrates production-level full-stack development with modern authentication, file management, and analytics.
          </p>
        </div>
        <div className="mission-visual">
          <div className="mission-orb" />
          <div className="mission-icon-grid">
            {['📄', '📊', '🔗', '📝', '🖼️', '📓'].map((emoji, i) => (
              <motion.div key={i} className="mission-icon-item"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}>
                {emoji}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="about-team container">
      <div className="section-header" style={{ justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
        <h2 className="section-title">Built by passionate developers</h2>
        <p className="section-subtitle">A team dedicated to making education better</p>
      </div>
      <div className="team-grid">
        {TEAM.map((member, i) => (
          <motion.div key={member.name} className="team-card"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <div className="team-avatar">{member.avatar}</div>
            <h3 className="team-name">{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <a href="#" className="team-github"><FiGithub size={16} /></a>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="about-cta container">
      <div className="about-cta-card">
        <h2 className="about-cta-title">Ready to join EduShare Hub?</h2>
        <p className="about-cta-sub">Join thousands of students sharing knowledge and accelerating their learning journey.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account →</Link>
      </div>
    </section>
  </div>
);

export default About;
