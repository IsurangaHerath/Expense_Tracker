import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/api';
import { getCurrentUser, isAdmin, clearAuth } from '../utils/auth';
import './Navbar.css';

function Navbar({ title, subtitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const currentPath = location.pathname;

  return (
    <header className="dashboard-header app-navbar">
      <div className="navbar-brand-section">
        {title ? (
          <div>
            <h1 className="dashboard-title">{title}</h1>
            {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
          </div>
        ) : (
          <div>
            <h1 className="dashboard-title">Expense Tracker</h1>
            <p className="dashboard-subtitle">
              {currentUser?.email ? `Logged in as ${currentUser.email}` : 'Personal Finance Manager'}
            </p>
          </div>
        )}
      </div>

      <div className="header-actions navbar-links">
        {/* Custom action buttons (e.g., + Add Expense) passed as children */}
        {children}

        {/* Navigation Links */}
        <Link
          to="/dashboard"
          className={`header-btn ${currentPath === '/dashboard' ? 'header-btn-primary' : 'header-btn-secondary'}`}
        >
          Dashboard
        </Link>

        <Link
          to="/expenses"
          className={`header-btn ${currentPath.startsWith('/expenses') && currentPath !== '/expenses/new' ? 'header-btn-primary' : 'header-btn-secondary'}`}
        >
          Expenses
        </Link>

        <Link
          to="/change-password"
          className={`header-btn ${currentPath === '/change-password' ? 'header-btn-primary' : 'header-btn-secondary'}`}
        >
          Change Password
        </Link>

        {userIsAdmin && (
          <Link
            to="/admin/users"
            className={`header-btn admin-nav-btn ${currentPath.startsWith('/admin') ? 'header-btn-primary' : 'header-btn-secondary'}`}
          >
            🛡️ Admin Panel
          </Link>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="logout-btn"
          aria-label="Logout"
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
