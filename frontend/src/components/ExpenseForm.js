import React, { useState } from 'react';

import CategoryDropdown from "./CategoryDropdown";

const ExpenseForm = ({ onAddExpense }) => {
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        category: '',
        description: '',
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
        if (onAddExpense) {
            onAddExpense({
                ...formData,
                amount: parseFloat(formData.amount),
            });
        }

        // Reset form after successful submit
        setFormData({
            amount: '',
            date: '',
            category: '',
            description: '',
        });

        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="expense-form">

            <div>
                <label htmlFor="amount">Amount</label>

                <input
                    type="number"
                    id="amount"
                    name="amount"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                />

                {errors.amount && (
                    <span style={{ color: 'red' }}>
                        {errors.amount}
                    </span>
                )}
            </div>

            <div>
                <label htmlFor="date">Date</label>

                <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                />

                {errors.date && (
                    <span style={{ color: 'red' }}>
                        {errors.date}
                    </span>
                )}
            </div>

            <div>
                <CategoryDropdown
                    selectedCategoryId={formData.category}
                    onCategoryChange={(categoryId) => {
                        setFormData((prev) => ({
                            ...prev,
                            category: categoryId
                        }));

                        if (errors.category) {
                            setErrors((prev) => ({
                                ...prev,
                                category: ''
                            }));
                        }
                    }}
                />

                {errors.category && (
                    <span style={{ color: 'red' }}>
                        {errors.category}
                    </span>
                )}
            </div>

            <div>
                <label htmlFor="description">
                    Description
                </label>

                <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="What was this expense for?"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <button type="submit">
                Add Expense
            </button>

        </form>
    );
};

export default ExpenseForm;