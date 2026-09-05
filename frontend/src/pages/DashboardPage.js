import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../utils/api";
import SummaryCard from "../components/SummaryCard";
import CategoryChart from "../components/CategoryChart";
import RecentExpenses from "../components/RecentExpenses";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dashboard data (summary + stats) for the logged-in user
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const baseUrl = "/api/v1";
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [summaryRes, statsRes] = await Promise.all([
          axios.get(`${baseUrl}/dashboard/summary`, config),
          axios.get(`${baseUrl}/dashboard/stats`, config),
        ]);

        if (summaryRes.data.success) setSummary(summaryRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // 1. Remove token from localStorage
      localStorage.removeItem("token");
      // 2. Remove axios default header
      delete axios.defaults.headers.common["Authorization"];
      // 3. Redirect to /login
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="dashboard-container">
          <div className="dashboard-state">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="dashboard-container">
          <div className="dashboard-state error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Expense Tracker Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! You are securely logged in.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/expenses/new" className="header-btn">
            + Add Expense
          </Link>
          <Link to="/expenses" className="header-btn header-btn-secondary">
            View Expenses
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

      <div className="total-hero">
        <span>Total All-Time Expenses</span>
        <h1>
          $
          {summary?.totalExpenses?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }) || "0.00"}
        </h1>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="This Month"
          value={`$${Number(summary?.monthlyTotal || 0).toFixed(2)}`}
          color="#4F46E5"
        />
        <SummaryCard
          title="Last Month"
          value={`$${Number(summary?.previousMonthTotal || 0).toFixed(2)}`}
          color="#10B981"
        />
        <SummaryCard
          title="Year to Date"
          value={`$${Number(summary?.yearlyTotal || 0).toFixed(2)}`}
          color="#F59E0B"
        />
        <SummaryCard
          title="Total Transactions"
          value={summary?.expenseCount || 0}
          subtitle={`Avg: $${Number(summary?.averageExpense || 0).toFixed(2)}`}
          color="#6B7280"
        />
      </div>

      <div className="dashboard-main-grid">
        <div className="grid-card">
          <CategoryChart categories={stats?.byCategory} />
        </div>
        <div className="grid-card">
          <RecentExpenses expenses={stats?.recentExpenses} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;