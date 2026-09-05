import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/searchBar";
import CategoryFilter from "../components/CategoryFilter";
import CategoryList from "../components/CategoryList";
import ExpenseCard from "../components/ExpenseCard";
import { getExpenses, deleteExpense, logoutUser } from "../utils/api";
import "./ExpensesPage.css";

function ExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch categories for the filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        setCategories(data.data?.categories || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch expenses (respects search + category filter)
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.q = search;
      if (selectedCategory) {
        const matched = categories.find(
          (c) => c.name === selectedCategory
        );
        if (matched) params.categoryId = matched.id;
      }

      const res = await getExpenses(params);
      setExpenses(res.data?.data?.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, categories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="expenses-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Expenses</h1>
          <p className="dashboard-subtitle">
            Search, filter, and manage your recorded expenses.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/dashboard" className="header-btn header-btn-secondary">
            Dashboard
          </Link>
          <Link to="/expenses/new" className="header-btn">
            + Add Expense
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="logout-btn"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <div className="expenses-toolbar">
        <SearchBar onSearch={(q) => setSearch(q)} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onFilterChange={setSelectedCategory}
        />
      </div>

      {error && <div className="expenses-error">{error}</div>}

      <div className="expenses-layout">
        <div className="expenses-list">
          {loading ? (
            <div className="expenses-empty">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="expenses-empty">
              {search || selectedCategory
                ? "No expenses match your filters."
                : "No expenses yet. Add your first expense!"}
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={(id) => navigate(`/expenses/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <aside className="expenses-sidebar">
          <CategoryList />
        </aside>
      </div>
    </div>
  );
}

export default ExpensesPage;