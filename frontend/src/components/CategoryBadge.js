const CategoryBadge = ({ name, color, size = "medium" }) => {
  if (!name) {
    return null;
  }

  const sizeStyles = {
    small: {
      padding: "2px 8px",
      fontSize: "11px",
    },
    medium: {
      padding: "4px 12px",
      fontSize: "12px",
    },
    large: {
      padding: "6px 16px",
      fontSize: "14px",
    },
  };

  return (
    <span
      className="category-badge"
      style={{
        backgroundColor: color,
        color: "white",
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "16px",
        fontWeight: "500",
        ...sizeStyles[size],
      }}
    >
      {name}
    </span>
  );
};

export default CategoryBadge;