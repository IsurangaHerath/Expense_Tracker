import React, { useState } from 'react';

import CategoryDropdown from "./CategoryDropdown";
import './ExpenseForm.css';

const ExpenseForm = ({ initialData, categories, onSubmit, onCancel, isSubmitting, isEditMode }) => {
    const [formData, setFormData] = useState({
        amount: initialData?.amount ?? '',
        date: initialData?.date ?? '',
        category: initialData?.category_id ?? '',
        description: initialData?.description ?? '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clear error message when user starts typing again
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCategoryChange = (categoryId) => {
        setFormData((prev) => ({
            ...prev,
            category: categoryId ?? ''
        }));

        if (errors.category) {
            setErrors((prev) => ({
                ...prev,
                category: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.amount || Number(formData.amount) <= 0) {
            newErrors.amount =
                'Please enter a valid amount greater than 0.';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required.';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category.';
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

        // Pass structured data up to parent component
        if (onSubmit) {
            onSubmit({
                amount: parseFloat(formData.amount),
                date: formData.date,
                category_id: Number(formData.category),
                description: formData.description.trim(),
            });
        }
    };

    const errorStyle = { color: 'red', fontSize: '13px', display: 'block', marginTop: '4px' };

    return (
        <form onSubmit={handleSubmit} className="expense-form">

            <div className="form-group">
                <label htmlFor="amount" className="form-label">Amount</label>

                <input
                    type="number"
                    id="amount"
                    name="amount"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`form-input ${errors.amount ? 'input-error' : ''}`}
                />

                {errors.amount && (
                    <span style={errorStyle}>
                        {errors.amount}
                    </span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="date" className="form-label">Date</label>

                <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`form-input ${errors.date ? 'input-error' : ''}`}
                />

                {errors.date && (
                    <span style={errorStyle}>
                        {errors.date}
                    </span>
                )}
            </div>

            <div className="form-group">
                {categories && categories.length > 0 ? (
                    <CategoryDropdown
                        key={initialData?.category_id || 'new'}
                        categories={categories}
                        selectedCategoryId={formData.category}
                        onCategoryChange={handleCategoryChange}
                    />
                ) : (
                    <>
                        <label htmlFor="category" className="form-label">Category</label>
                        <CategoryDropdown
                            selectedCategoryId={formData.category}
                            onCategoryChange={handleCategoryChange}
                        />
                    </>
                )}

                {errors.category && (
                    <span style={errorStyle}>
                        {errors.category}
                    </span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="description" className="form-label">
                    Description
                </label>

                <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="What was this expense for?"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting
                        ? (isEditMode ? 'Saving...' : 'Adding...')
                        : (isEditMode ? 'Save Changes' : 'Add Expense')}
                </button>

                {onCancel && (
                    <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </button>
                )}
            </div>

        </form>
    );
};

export default ExpenseForm;