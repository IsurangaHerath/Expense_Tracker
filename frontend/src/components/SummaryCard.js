import React from "react";

const SummaryCard = ({ title, value, subtitle, color }) => {
  return (
    <div
      className="summary-card"
      style={{ borderTop: `4px solid ${color || "#4F46E5"}` }}
    >
      <h4 className="card-title">{title}</h4>
      <div className="card-value">{value}</div>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SummaryCard;
