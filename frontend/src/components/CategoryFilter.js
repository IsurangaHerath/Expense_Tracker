import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ 
	categories = [], 
	selectedCategory = '', 
	onFilterChange }) => {
  	const handleChange = (e) => {
   	onFilterChange(e.target.value);
  };

  return (
    <div className="category-filter-container">
      <select
        value={selectedCategory}
        onChange={handleChange}
        className={`category-select ${selectedCategory ? 'active' : ''}`}
        aria-label="Filter by category"
      >

<option value="">All Categories</option>

{categories.map((category) => {
          
          const categoryName = typeof category === 'object' ? category.name : category;
          const categoryValue = typeof category === 'object' ? category.name : category;

          return (
            <option key={categoryValue} value={categoryValue}>
              {categoryName}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default CategoryFilter;
