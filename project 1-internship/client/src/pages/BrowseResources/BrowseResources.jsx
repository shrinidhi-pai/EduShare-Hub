import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiX, FiRefreshCw } from 'react-icons/fi';
import { resourceService } from '../../services/api';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';
import { SkeletonCard } from '../../components/Loader/Loader';
import './BrowseResources.css';

const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Mechanical', 'Electrical', 'Civil', 'Management'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const TYPES = ['pdf', 'doc', 'ppt', 'image', 'notes', 'link'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'oldest', label: 'Oldest First' },
];

const BrowseResources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState([]);

  const filters = {
    search: searchParams.get('search') || '',
    subject: searchParams.get('subject') || '',
    semester: searchParams.get('semester') || '',
    department: searchParams.get('department') || '',
    resourceType: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.subject) params.subject = filters.subject;
      if (filters.semester) params.semester = filters.semester;
      if (filters.department) params.department = filters.department;
      if (filters.resourceType) params.resourceType = filters.resourceType;
      params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 12;

      const { data } = await resourceService.getAll(params);
      setResources(data.resources);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  useEffect(() => {
    resourceService.getTags().then(({ data }) => setTags(data.tags || [])).catch(() => {});
  }, []);

  const hasActiveFilters = filters.subject || filters.semester || filters.department || filters.resourceType;

  return (
    <div className="browse-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="browse-header">
          <div>
            <h1 className="page-title">Browse Resources</h1>
            <p className="page-subtitle">
              Discover {total.toLocaleString()} study materials shared by the community
            </p>
          </div>
          <div className="browse-controls">
            <button
              className={`view-toggle ${viewMode === 'grid' ? 'view-active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid size={18} />
            </button>
            <button
              className={`view-toggle ${viewMode === 'list' ? 'view-active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList size={18} />
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={15} /> {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="browse-search">
          <SearchBar placeholder="Search by title, subject, tags..." />
        </div>

        <div className="browse-layout">
          {/* Sidebar Filters */}
          {showFilters && (
            <motion.aside
              className="filters-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filters-header">
                <h3 className="filters-title">
                  <FiFilter size={16} /> Filters
                </h3>
                {hasActiveFilters && (
                  <button className="clear-filters" onClick={clearFilters}>
                    <FiX size={14} /> Clear All
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  className="form-select"
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* File Type */}
              <div className="filter-group">
                <label className="filter-label">File Type</label>
                <div className="filter-chips">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      className={`filter-chip ${filters.resourceType === type ? 'filter-chip-active' : ''}`}
                      onClick={() => updateFilter('type', filters.resourceType === type ? '' : type)}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester */}
              <div className="filter-group">
                <label className="filter-label">Semester</label>
                <div className="filter-chips">
                  {SEMESTERS.map((sem) => (
                    <button
                      key={sem}
                      className={`filter-chip ${filters.semester === sem ? 'filter-chip-active' : ''}`}
                      onClick={() => updateFilter('semester', filters.semester === sem ? '' : sem)}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div className="filter-group">
                <label className="filter-label">Department</label>
                <select
                  className="form-select"
                  value={filters.department}
                  onChange={(e) => updateFilter('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Trending Tags */}
              {tags.length > 0 && (
                <div className="filter-group">
                  <label className="filter-label">Trending Tags</label>
                  <div className="trending-tags">
                    {tags.slice(0, 12).map(({ tag, count }) => (
                      <button
                        key={tag}
                        className="trending-tag"
                        onClick={() => updateFilter('search', tag)}
                      >
                        #{tag} <span>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          )}

          {/* Resources Grid */}
          <main className="resources-main">
            {/* Active filter indicators */}
            {hasActiveFilters && (
              <div className="active-filters">
                {filters.subject && (
                  <span className="active-filter">
                    Subject: {filters.subject}
                    <button onClick={() => updateFilter('subject', '')}><FiX size={12} /></button>
                  </span>
                )}
                {filters.semester && (
                  <span className="active-filter">
                    Semester: {filters.semester}
                    <button onClick={() => updateFilter('semester', '')}><FiX size={12} /></button>
                  </span>
                )}
                {filters.department && (
                  <span className="active-filter">
                    {filters.department}
                    <button onClick={() => updateFilter('department', '')}><FiX size={12} /></button>
                  </span>
                )}
                {filters.resourceType && (
                  <span className="active-filter">
                    {filters.resourceType.toUpperCase()}
                    <button onClick={() => updateFilter('type', '')}><FiX size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="results-info">
              {!loading && (
                <p>{total} resource{total !== 1 ? 's' : ''} found
                  {filters.search ? ` for "${filters.search}"` : ''}
                </p>
              )}
              <button className="refresh-btn" onClick={fetchResources} title="Refresh">
                <FiRefreshCw size={15} />
              </button>
            </div>

            {loading ? (
              <div className={viewMode === 'grid' ? 'grid-3' : 'list-view'}>
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : resources.length === 0 ? (
              <div className="no-results">
                <span className="no-results-icon">🔍</span>
                <h3>No resources found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-outline" onClick={clearFilters}>
                  <FiRefreshCw size={15} /> Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid-3' : 'list-view'}>
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    resource={resource}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => updateFilter('page', page.toString())}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrowseResources;
