import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CategoryChart = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return <div className="no-data">No category data available</div>;
  }

  return (
    <div className="chart-wrapper">
      <h3>Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={categories}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Bar dataKey="total">
            {categories.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#4F46E5"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="category-list">
        {categories.map((cat, idx) => (
          <div key={idx} className="category-item">
            <span
              className="dot"
              style={{ backgroundColor: cat.color || "#4F46E5" }}
            ></span>
            <span>
              {cat.category}: <strong>${cat.total.toFixed(2)}</strong> (
              {cat.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
