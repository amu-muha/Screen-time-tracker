import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import AppUsageCard from './AppUsageCard';
import { CATEGORIES } from '../utils/formatters';
import './AppUsageGrid.css';

export default function AppUsageGrid({
  usage = [],
  activeAppName = '',
  totalActiveSeconds = 1,
  goalSeconds = 8 * 3600,
  onSelectApp
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('time-desc'); // 'time-desc' | 'time-asc' | 'name' | 'sessions'
  const [viewMode, setViewMode] = useState('all'); // 'top' | 'all'

  // Filter & Sort
  const filteredApps = useMemo(() => {
    let list = [...usage];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(a => (a.category || 'Other').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.app_name.toLowerCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'time-desc') return b.total_seconds - a.total_seconds;
      if (sortBy === 'time-asc') return a.total_seconds - b.total_seconds;
      if (sortBy === 'name') return a.app_name.localeCompare(b.app_name);
      if (sortBy === 'sessions') return (b.session_count || 1) - (a.session_count || 1);
      return 0;
    });

    if (viewMode === 'top') {
      return list.slice(0, 4);
    }

    return list;
  }, [usage, selectedCategory, search, sortBy, viewMode]);

  return (
    <div className="usage-section">
      <div className="usage-section__header">
        <div>
          <span className="usage-section__eyebrow">Application Breakdown</span>
          <h3 className="usage-section__title">Application Usage</h3>
        </div>

        {/* Controls: Search, View Mode, Sorting */}
        <div className="usage-section__controls">
          <div className="search-bar">
            <Search size={15} className="search-bar__icon" />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-bar__input"
            />
          </div>

          <div className="filter-pill-group">
            <button
              className={`filter-pill ${viewMode === 'all' ? 'filter-pill--active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              All ({usage.length})
            </button>
            <button
              className={`filter-pill ${viewMode === 'top' ? 'filter-pill--active' : ''}`}
              onClick={() => setViewMode('top')}
            >
              Top Apps
            </button>
          </div>

          <div className="sort-dropdown-wrap">
            <ArrowUpDown size={13} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="time-desc">Most Time Used</option>
              <option value="time-asc">Least Time Used</option>
              <option value="name">Application Name</option>
              <option value="sessions">Session Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filters">
        <button
          className={`cat-filter-btn ${selectedCategory === 'All' ? 'cat-filter-btn--active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-filter-btn ${selectedCategory === cat ? 'cat-filter-btn--active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Cards Grid with Semicircular Gauges */}
      {filteredApps.length === 0 ? (
        <div className="usage-section__empty">
          <p>No applications found matching your search.</p>
        </div>
      ) : (
        <div className="app-cards-grid">
          {filteredApps.map((app, index) => (
            <AppUsageCard
              key={app.app_name}
              app={app}
              totalActiveSeconds={totalActiveSeconds}
              goalSeconds={goalSeconds}
              isActive={app.app_name === activeAppName}
              rank={index + 1}
              onSelect={onSelectApp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
