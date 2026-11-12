import React, { useState, useEffect } from 'react';
import SearchBar from './searchBar'; // Fixed case: './SearchBar'
import CategoryFilter from './CategoryFilter';
import DateRangeFilter from './DateRangeFilter';
import './SearchFilterBar.css';

const SearchFilterBar = ({
  onFilterChange,
  categories = []
}) => {
  // Manage all filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: ''
  });

  // Send updated filters to parent component
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Search handler
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm
    }));
  };

  // Category handler
  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: category
    }));
  };

  // Date handler
  const handleDateChange = ({ start, end }) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      startDate: '',
      endDate: ''
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.startDate,
    filters.endDate
  ].filter((value) => value !== '').length;

  return (
    <div className="search-filter-bar">

      {/* Search - key added so SearchBar resets internal state when clearAllFilters is called */}
      <div className="filter-section search-section">
        <SearchBar
          key={filters.search ? 'active' : 'empty'}
          onSearch={handleSearch}
          placeholder="Search expenses..."
        />
      </div>

      {/* Category */}
      <div className="filter-section">
        <CategoryFilter
          categories={categories}
          selectedCategory={filters.category}
          onFilterChange={handleCategoryChange}
        />
      </div>

      {/* Date Range */}
      <div className="filter-section date-section">
        <DateRangeFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Active filter count + Clear All */}
      <div className="filter-actions">

        {activeFilterCount > 0 && (
          <span className="active-filter-count">
            {activeFilterCount} filter
            {activeFilterCount !== 1 ? 's' : ''} active
          </span>
        )}

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="clear-all-filters-button"
          >
            Clear All Filters
          </button>
        )}

      </div>

    </div>
  );
};

export default SearchFilterBar;