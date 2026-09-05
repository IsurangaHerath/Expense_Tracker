import React from "react";

const RecentExpenses = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return <div className="no-data">No recent expenses found</div>;
  }

  return (
    <div className="recent-wrapper">
      <h3>Recent Expenses</h3>
      <ul className="recent-list">
        {expenses.map((item) => (
          <li key={item.id} className="recent-item">
            <div className="item-info">
              <span className="item-title">
                {item.title || item.description || "Expense"}
              </span>
              <span className="item-date">{item.date}</span>
            </div>
            <div className="item-right">
              <span
                className="category-pill"
                style={{ backgroundColor: item.category_color || "#E5E7EB" }}
              >
                {item.category_name}
              </span>
              <span className="item-amount">
                -${Number(item.amount).toFixed(2)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentExpenses;
