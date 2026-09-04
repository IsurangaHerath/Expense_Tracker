import React from 'react';
import './ExpenseCard.css';

//Dynamic category colors for indicator
const CATEGORY_COLORS ={
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Bills:'#FFE66D',
    Entertainment:'#FF9F1C',
    Shopping: '#9B5DE5',
    Health: '#00F5D4',
    Default: '#6C757D',

};

const ExpenseCard = ({expense,onEdit,onDelete})=>{
    if(!expense) return null;

    const {_id,id,title,amount,category,date}=expense;
    const expenseId = _id || id; // Use _id if available, otherwise use id

    //select category color or fallback to default
    const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;

    //format date readable string
    const fromattedDate = date ? new Date(date).toLocaleDateString() : '';

    return(
        <div className="expense-card" style={{borderLeftColor: categoryColor }}>
            <div className="expense-info">
                <div className="expense-header">
                    <h4 className="expense-title">{title}</h4>
                    <span
                    className="category-badge"
                    style={{backgroundColor: categoryColor}}>
                        {category}
                    </span>
                </div>
                <div className="expense-actions">
                    <span className="expense-amount">Rs.{Number(amount).toLocaleString('en-US',{minimumFractionDigits: 2})}</span>
                    <Span className="expense-date">{fromattedDate}</Span>
                </div>
            </div>

            <div className="expense-actions">
                <button
                className="btn-edit"
                onClick={()=>onEdit(expense)}
                aria-label="Edit expense">
                    Edit
                </button>
                <button
                className="btn-delete"
                onClick={()=>onDelete(expenseId)}
                aria-label="Delete expense">
                    Delete
                </button>
            </div>
        </div>
    );
};

export default  ExpenseCard;