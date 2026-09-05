import { useEffect, useState } from "react";

const CategoryDropdown = ({
  categories: providedCategories,
  selectedCategoryId,
  onCategoryChange
}) => {
  const [categories, setCategories] = useState(providedCategories || []);
  const [loading, setLoading] = useState(!providedCategories);
  const [error, setError] = useState("");

  useEffect(() => {
    if (providedCategories) {
      setCategories(providedCategories);
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:3000/api/v1/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        setCategories(data.data?.categories || []);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [providedCategories]);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="category-dropdown">
      <label htmlFor="category-select" className="form-label">
        Category
      </label>

      <select
        id="category-select"
        className="form-input"
        value={selectedCategoryId || ""}
        onChange={(e) => {
          const value = e.target.value;

          onCategoryChange(
            value ? Number(value) : null
          );
        }}
      >
        <option value="">
          Select a category
        </option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryDropdown;