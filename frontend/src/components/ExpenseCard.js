import React from 'react';
import './ExpenseCard.css';

const DEFAULT_COLOR = '#6C757D';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
    if (!expense) return null;

    const { id, amount, date, description, category_name, category_color } = expense;
    const expenseId = id;
    const category = category_name;
    const categoryColor = category_color || DEFAULT_COLOR;

    const formattedDate = date ? new Date(date).toLocaleDateString() : '';

    return (
        <div className="expense-card" style={{ borderLeftColor: categoryColor }}>
            <div className="expense-info">
                <div className="expense-header">
                    <span
                        className="category-badge"
                        style={{ backgroundColor: categoryColor }}
                    >
                        {category}
                    </span>
                    <span className="expense-amount">
                        ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="expense-title">{description || 'Expense'}</div>
                <div className="expense-date">{formattedDate}</div>
            </div>

            <div className="expense-actions">
                <button
                    className="btn-edit"
                    onClick={() => onEdit(expenseId)}
                    aria-label="Edit expense"
                >
                    Edit
                </button>
                <button
                    className="btn-delete"
                    onClick={() => onDelete(expenseId)}
                    aria-label="Delete expense"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ExpenseCard;