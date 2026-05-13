import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiSearch } from 'react-icons/fi';
import { userService } from '../../services/api';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import { SkeletonCard } from '../../components/Loader/Loader';
import './Bookmarks.css';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    userService.getBookmarks()
      .then(({ data }) => setBookmarks(data.bookmarks))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveBookmark = (resourceId, data) => {
    if (!data.bookmarked) {
      setBookmarks(prev => prev.filter(b => b._id !== resourceId));
    }
  };

  const filtered = bookmarks.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bookmarks-page page-wrapper">
      <div className="container">
        <motion.div className="bookmarks-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="page-title"><FiBookmark /> Saved Resources</h1>
            <p className="page-subtitle">{bookmarks.length} resource{bookmarks.length !== 1 ? 's' : ''} bookmarked</p>
          </div>
          <div className="bookmark-search">
            <FiSearch className="bm-search-icon" />
            <input className="form-input bm-search-input" placeholder="Search bookmarks..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bookmarks-empty">
            <FiBookmark size={56} style={{ opacity: 0.15 }} />
            <h3>{search ? 'No results found' : 'No bookmarks yet'}</h3>
            <p>{search ? 'Try different search terms' : 'Start saving resources you want to read later'}</p>
            {!search && <Link to="/browse" className="btn btn-primary">Browse Resources</Link>}
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(resource => (
              <ResourceCard key={resource._id} resource={resource} onBookmark={handleRemoveBookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
