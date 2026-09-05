import "./CategoryBadge.css";

const CategoryBadge = ({ name, color, size = "medium" }) => {
    if (!name) {
        return null;
    }

    return (
        <span
            className={`category-badge ${size}`}
            style={{
                backgroundColor: color,
            }}
        >
            {name}
        </span>
    );
};

export default CategoryBadge;