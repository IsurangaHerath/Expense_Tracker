import React, { useState, useEffect } from 'react';

const getTodayString = () => new Date().toISOString().split('T')[0];

const ExpenseForm = ({ initialData, categories, onSubmit, onCancel, isSubmitting, isEditMode }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: getTodayString(),
    category_id: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const maxDate = getTodayString();

  // Edit Mode : Populate form with initial data if available
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount || '',
        date: initialData.date ? initialData.date.split('T')[0] : getTodayString(),
        category_id: initialData.category_id || initialData.categoryId || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0.';
    } else {
      const decimalRegex = /^\d+(\.\d{1,2})?$/;
      if (!decimalRegex.test(formData.amount)) {
        newErrors.amount = 'Amount can have up to 2 decimal places only.';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required.';
    } else if (formData.date > maxDate) {
      newErrors.date = 'Future dates are not allowed.';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category.';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      category_id: parseInt(formData.category_id, 10),
      description: formData.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      {/* Amount Field */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="amount" style={{ display: 'block', fontWeight: 'bold' }}>Amount *</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ padding: '8px 12px', background: '#eee', border: '1px solid #ccc', borderRight: 'none' }}>$</span>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {errors.amount && <span style={{ color: 'red', fontSize: '13px' }}>{errors.amount}</span>}
      </div>

      {/* Date Field */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="date" style={{ display: 'block', fontWeight: 'bold' }}>Date *</label>
        <input
          type="date"
          id="date"
          name="date"
          max={maxDate}
          value={formData.date}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
        />
        {errors.date && <span style={{ color: 'red', fontSize: '13px' }}>{errors.date}</span>}
      </div>

      {/* Category Dropdown (API Data) */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="category_id" style={{ display: 'block', fontWeight: 'bold' }}>Category *</label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && <span style={{ color: 'red', fontSize: '13px' }}>{errors.category_id}</span>}
      </div>

      {/* Description Field */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="description" style={{ display: 'block', fontWeight: 'bold' }}>Description (optional)</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter description (optional)"
          maxLength={500}
          rows={4}
          value={formData.description}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
          {formData.description.length} / 500 characters
        </div>
        {errors.description && <span style={{ color: 'red', fontSize: '13px' }}>{errors.description}</span>}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: '10px 20px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '10px 20px', background: '#ccc', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;