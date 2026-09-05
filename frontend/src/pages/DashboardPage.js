import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../utils/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryCard from "../components/SummaryCard";
import CategoryChart from "../components/CategoryChart";
import RecentExpenses from "../components/RecentExpenses";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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

  return (
    <div className="auth-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: "24px", color: "#1e293b" }}>
              Expense Tracker Dashboard
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Welcome back! You are securely logged in.
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="logout-btn"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <div
          style={{ padding: "24px 0", textAlign: "center", color: "#64748b" }}
        >
          <div
            style={{
              display: "inline-flex",
              padding: "16px",
              borderRadius: "50%",
              backgroundColor: "#eef2ff",
              color: "#4f46e5",
              marginBottom: "16px",
            }}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            style={{ fontSize: "18px", color: "#1e293b", marginBottom: "8px" }}
          >
            Authentication Successful
          </h2>
          <p style={{ fontSize: "14px" }}>
            Protected route is active and the JWT token is attached to your
            session.
          </p>
        </div>
      </div>
    </div>
  );
}
const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [summaryRes, statsRes] = await Promise.all([
          axios.get("/api/v1/dashboard/summary", config),
          axios.get("/api/v1/dashboard/stats", config),
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

  if (loading)
    return <div className="dashboard-state">Loading dashboard...</div>;
  if (error) return <div className="dashboard-state error">{error}</div>;

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>

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
          value={`$${summary?.monthlyTotal?.toFixed(2) || "0.00"}`}
          color="#4F46E5"
        />
        <SummaryCard
          title="Last Month"
          value={`$${summary?.previousMonthTotal?.toFixed(2) || "0.00"}`}
          color="#10B981"
        />
        <SummaryCard
          title="Year to Date"
          value={`$${summary?.yearlyTotal?.toFixed(2) || "0.00"}`}
          color="#F59E0B"
        />
        <SummaryCard
          title="Total Transactions"
          value={summary?.expenseCount || 0}
          subtitle={`Avg: $${summary?.averageExpense?.toFixed(2) || "0.00"}`}
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
};

export default DashboardPage;
