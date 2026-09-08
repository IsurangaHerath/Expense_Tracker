import React, { useState } from 'react';
import './DateRangeFilter.css';

const DateRangeFilter = ({ startDate = '', endDate = '', onDateChange }) => {
  const [error, setError] = useState('');

  const handleStartChange = (e) => {
    const newStart = e.target.value;
    validateAndSubmit(newStart, endDate);
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    validateAndSubmit(startDate, newEnd);
  };

  const validateAndSubmit = (start, end) => {
    
    if (start && end && new Date(start) > new Date(end)) {
      setError('End date must be after start date');
      return;
    }
    setError('');
    onDateChange({ start, end });
  };

  const handleClear = () => {
    setError('');
    onDateChange({ start: '', end: '' });
  };

  return (
    <div className="date-range-container">
      <div className="date-inputs-wrapper">
        <div className="date-input-group">
          <label className="date-label">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartChange}
            className={`date-input ${startDate ? 'active' : ''}`}
          />
        </div>

        <div className="date-input-group">
          <label className="date-label">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndChange}
            className={`date-input ${endDate ? 'active' : ''}`}
          />
        </div>

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-dates-button"
            aria-label="Clear dates"
          >
            Clear Dates
          </button>
        )}
      </div>

      {error && <span className="date-error-message">{error}</span>}
    </div>
  );
};

export default DateRangeFilter;