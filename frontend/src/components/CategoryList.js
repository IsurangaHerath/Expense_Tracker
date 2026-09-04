import { useEffect, useState } from "react";
import CategoryBadge from "./CategoryBadge";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, []);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="category-list">
      <h2>Categories</h2>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div>
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                marginBottom: "10px"
              }}
            >
              <CategoryBadge
                name={category.name}
                color={category.color}
                size="medium"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;