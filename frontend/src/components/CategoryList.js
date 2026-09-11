import { useEffect, useState } from "react";
import CategoryExpenseCount from "./CategoryExpenseCount";
import { getExpenses, API_BASE_URL } from "../utils/api";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        // Fetch categories
        const categoryResponse = await fetch(
          `${API_BASE_URL}/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoryData = await categoryResponse.json();

        setCategories(categoryData.data?.categories || []);

        // Fetch all expenses
        const expenseResponse = await getExpenses({});

        setExpenses(
          expenseResponse.data?.data?.expenses || []
        );

      } catch (err) {
        console.error("Error loading category data:", err);
        setError("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="category-list">
      <CategoryExpenseCount
        categories={categories}
        expenses={expenses}
      />
    </div>
  );
};

export default CategoryList;