import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../utils/api";
import SummaryCard from "../components/SummaryCard";
import CategoryChart from "../components/CategoryChart";
import RecentExpenses from "../components/RecentExpenses";
import "./DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [summaryRes, statsRes] = await Promise.all([
          axios.get("/api/v1/dashboard/summary", config),
          axios.get("/api/v1/dashboard/stats", config)
        ]);

        if (summaryRes.data.success) setSummary(summaryRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load dashboard data");
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
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  if (loading) return <div className="dashboard-state">Loading dashboard...</div>;
  if (error) return <div className="dashboard-state error">{error}</div>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", color: "#1e293b", margin: 0 }}>
            Expense Tracker Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: 0 }}>
            Welcome back! Here is your expense breakdown.
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

      {/* Hero Display in LKR */}
      <div className="total-hero">
        <span>Total All-Time Expenses</span>
        <h1>Rs. {summary?.totalExpenses?.toLocaleString("en-LK", { minimumFractionDigits: 2 }) || "0.00"}</h1>
      </div>

      {/* Summary Cards with LKR Currency */}
      <div className="summary-grid">
        <SummaryCard 
          title="This Month" 
          value={`Rs. ${summary?.monthlyTotal?.toLocaleString("en-LK", { minimumFractionDigits: 2 }) || "0.00"}`} 
          color="#4F46E5" 
        />
        <SummaryCard 
          title="Last Month" 
          value={`Rs. ${summary?.previousMonthTotal?.toLocaleString("en-LK", { minimumFractionDigits: 2 }) || "0.00"}`} 
          color="#10B981" 
        />
        <SummaryCard 
          title="Year to Date" 
          value={`Rs. ${summary?.yearlyTotal?.toLocaleString("en-LK", { minimumFractionDigits: 2 }) || "0.00"}`} 
          color="#F59E0B" 
        />
        <SummaryCard 
          title="Total Transactions" 
          value={summary?.expenseCount || 0} 
          subtitle={`Avg: Rs. ${summary?.averageExpense?.toLocaleString("en-LK", { minimumFractionDigits: 2 }) || "0.00"}`}
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