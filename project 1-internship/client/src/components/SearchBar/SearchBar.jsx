import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ placeholder = 'Search resources...', large = false, className = '' }) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form className={`search-bar ${large ? 'search-bar-large' : ''} ${className}`} onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" size={large ? 20 : 18} />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" className="search-clear" onClick={handleClear}>
            <FiX size={16} />
          </button>
        )}
        <button type="submit" className="search-submit btn btn-primary">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
