import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/searchBar';
import {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
} from '../utils/api';
import './AdminUsersPage.css';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmActionData, setConfirmActionData] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    id: null,
    email: '',
    role: 'user',
    status: 'active'
  });
  const [editFormError, setEditFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== 'ALL') params.role = roleFilter.toLowerCase();
      if (statusFilter !== 'ALL') params.status = statusFilter.toLowerCase();

      const response = await getUsers(params);
      
      // Handle standard response formats: { success: true, data: { users: [...] } } or { users: [...] } or direct array
      const fetchedUsers =
        response.data?.data?.users ||
        response.data?.users ||
        (Array.isArray(response.data?.data) ? response.data.data : null) ||
        (Array.isArray(response.data) ? response.data : []);

      // Normalize user objects to ensure standard fields are present
      const normalizedUsers = fetchedUsers.map((u) => ({
        id: u.id,
        email: u.email || '',
        name: u.name || u.email?.split('@')[0] || `User #${u.id}`,
        role: (u.role || 'user').toLowerCase(),
        status: (u.status || 'active').toLowerCase(),
        created_at: u.created_at || u.createdAt || null,
        updated_at: u.updated_at || u.updatedAt || null
      }));

      setUsers(normalizedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      const status = err.response?.status;
      const backendMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message;

      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure the backend is running at http://localhost:3000');
      } else if (status === 404) {
        setError('The Admin Users API endpoint (/api/v1/admin/users) is not yet implemented on the backend. The frontend is fully integrated and ready.');
      } else if (status === 403) {
        setError('Access denied: You do not have permission to view administrative resources.');
      } else {
        setError(backendMessage || 'Failed to load users from the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered users for client-side matching if backend returns all users
  const filteredUsers = users.filter((user) => {
    // Search query filter (matches email, name, or id)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchName = (user.name || '').toLowerCase().includes(q);
      const matchId = String(user.id).includes(q);
      if (!matchEmail && !matchName && !matchId) return false;
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      if (user.role !== roleFilter.toLowerCase()) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (user.status !== statusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const disabledUsersCount = users.filter((u) => u.status === 'disabled' || u.status === 'inactive').length;

  // View User Details
  const handleOpenViewModal = async (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);

    // Optionally fetch full fresh details
    try {
      const res = await getUserById(user.id);
      const fullData = res.data?.data?.user || res.data?.user || res.data;
      if (fullData && typeof fullData === 'object') {
        setSelectedUser((prev) => ({ ...prev, ...fullData }));
      }
    } catch {
      // Keep existing data if detail endpoint is not present
    }
  };

  // Open Edit User Modal
  const handleOpenEditModal = (user) => {
    setEditForm({
      id: user.id,
      email: user.email || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editForm.email.trim()) {
      setEditFormError('Email cannot be empty.');
      return;
    }

    setIsSaving(true);
    setEditFormError('');

    try {
      await updateUser(editForm.id, {
        email: editForm.email.trim(),
        role: editForm.role,
        status: editForm.status
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editForm.id
            ? { ...u, email: editForm.email.trim(), role: editForm.role, status: editForm.status, updated_at: new Date().toISOString() }
            : u
        )
      );

      setSuccessMessage(`User #${editForm.id} updated successfully.`);
      setIsEditModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Update user error:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update user details. Please check the inputs and try again.';
      setEditFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Request Toggle Status (with confirmation modal)
  const handleRequestToggleStatus = (user) => {
    const isCurrentlyActive = user.status === 'active';
    const nextStatus = isCurrentlyActive ? 'disabled' : 'active';
    const actionLabel = isCurrentlyActive ? 'Disable' : 'Enable';

    setConfirmActionData({
      type: 'TOGGLE_STATUS',
      userId: user.id,
      userEmail: user.email,
      nextStatus,
      title: `${actionLabel} User Account`,
      message: `Are you sure you want to ${actionLabel.toLowerCase()} the account for ${user.email}? ${
        isCurrentlyActive
          ? 'The user will be prevented from logging in until re-enabled.'
          : 'The user will regain access to their account.'
      }`,
      confirmButtonText: actionLabel,
      isDestructive: isCurrentlyActive
    });
    setIsConfirmModalOpen(true);
  };

  // Request Delete User (with confirmation modal)
  const handleRequestDelete = (user) => {
    setConfirmActionData({
      type: 'DELETE',
      userId: user.id,
      userEmail: user.email,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user ${user.email} (ID: #${user.id})? This action cannot be undone and will remove all associated user records.`,
      confirmButtonText: 'Delete User',
      isDestructive: true
    });
    setIsConfirmModalOpen(true);
  };

  // Execute Confirmed Action
  const handleExecuteConfirmedAction = async () => {
    if (!confirmActionData) return;
    setIsDeleting(true);
    setError('');

    const { type, userId, nextStatus, userEmail } = confirmActionData;

    try {
      if (type === 'DELETE') {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setSuccessMessage(`User ${userEmail} (#${userId}) has been deleted.`);
      } else if (type === 'TOGGLE_STATUS') {
        try {
          await toggleUserStatus(userId, nextStatus);
        } catch {
          // Fallback to updateUser if PATCH /status is not configured
          await updateUser(userId, { status: nextStatus });
        }

        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
        setSuccessMessage(`User account status updated to ${nextStatus}.`);
      }

      setIsConfirmModalOpen(false);
      setConfirmActionData(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Action failed:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'The operation could not be completed.';
      setError(msg);
      setIsConfirmModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="admin-page">
      <Navbar
        title="Admin User Management"
        subtitle="View, search, filter, edit roles, and manage user accounts."
      />

      {/* Summary Stat Cards */}
      <div className="admin-summary-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Total Users</span>
          <div className="stat-value-group">
            <span className="stat-value">{totalUsersCount}</span>
            <span className="stat-icon">👥</span>
          </div>
        </div>
        <div className="admin-stat-card active-stat">
          <span className="stat-label">Active Users</span>
          <div className="stat-value-group">
            <span className="stat-value text-success">{activeUsersCount}</span>
            <span className="stat-icon">✅</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat">
          <span className="stat-label">Administrators</span>
          <div className="stat-value-group">
            <span className="stat-value text-amber">{adminUsersCount}</span>
            <span className="stat-icon">🛡️</span>
          </div>
        </div>
        <div className="admin-stat-card disabled-stat">
          <span className="stat-label">Disabled / Inactive</span>
          <div className="stat-value-group">
            <span className="stat-value text-muted">{disabledUsersCount}</span>
            <span className="stat-icon">⚠️</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="auth-banner-error admin-banner" role="alert">
          <span>{error}</span>
          <button className="banner-dismiss-btn" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {successMessage && (
        <div className="auth-banner-success admin-banner" role="status">
          <span>{successMessage}</span>
          <button className="banner-dismiss-btn" onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="toolbar-search">
          <SearchBar
            onSearch={(query) => setSearchQuery(query)}
            placeholder="Search by email, name, or User ID..."
          />
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <label htmlFor="role-filter">Role:</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <button
            onClick={fetchUsers}
            className="refresh-btn"
            title="Refresh Users List"
            aria-label="Refresh Users List"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="table-container">
        {loading ? (
          <div className="admin-state">
            <span className="spinner admin-spinner" />
            <p>Loading users from server...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👥</div>
            <h3>No Users Found</h3>
            <p>
              {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No users match your search and filter criteria.'
                : 'No registered user accounts found in the database.'}
            </p>
            {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User / Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isUserActive = user.status === 'active';
                  const isUserAdmin = user.role === 'admin';

                  return (
                    <tr key={user.id}>
                      <td className="user-id-cell">#{user.id}</td>
                      <td className="user-info-cell">
                        <span className="user-email-text">{user.email}</span>
                      </td>
                      <td>
                        <span className={`role-badge ${isUserAdmin ? 'role-admin' : 'role-user'}`}>
                          {isUserAdmin ? '🛡️ Admin' : '👤 User'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${isUserActive ? 'status-active' : 'status-disabled'}`}>
                          <span className="status-dot" />
                          {isUserActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(user.created_at)}</td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="btn-action btn-view"
                            onClick={() => handleOpenViewModal(user)}
                            title="View User Details"
                          >
                            Details
                          </button>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User Info"
                          >
                            Edit
                          </button>
                          <button
                            className={`btn-action ${isUserActive ? 'btn-disable' : 'btn-enable'}`}
                            onClick={() => handleRequestToggleStatus(user)}
                            title={isUserActive ? 'Disable Account' : 'Enable Account'}
                          >
                            {isUserActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleRequestDelete(user)}
                            title="Delete User"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. View User Details Modal */}
      {/* ======================================================== */}
      {isViewModalOpen && selectedUser && (
        <div className="modal-backdrop" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Account Details</h3>
              <button className="modal-close-btn" onClick={() => setIsViewModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body user-details-body">
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">#{selectedUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value font-mono">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Role:</span>
                <span className="detail-value">
                  <span className={`role-badge ${selectedUser.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                    {selectedUser.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Status:</span>
                <span className="detail-value">
                  <span className={`status-badge ${selectedUser.status === 'active' ? 'status-active' : 'status-disabled'}`}>
                    <span className="status-dot" />
                    {selectedUser.status === 'active' ? 'Active' : 'Disabled'}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">{formatDate(selectedUser.created_at)}</span>
              </div>
              {selectedUser.updated_at && (
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{formatDate(selectedUser.updated_at)}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="header-btn header-btn-secondary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
              <button
                className="header-btn header-btn-primary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(selectedUser);
                }}
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. Edit User Modal */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User #{editForm.id}</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditUser}>
              <div className="modal-body">
                {editFormError && (
                  <div className="auth-banner-error" style={{ marginBottom: '16px' }} role="alert">
                    {editFormError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="edit-email" className="form-label">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="edit-role" className="form-label">
                    Account Role
                  </label>
                  <select
                    id="edit-role"
                    className="admin-select full-width"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="edit-status" className="form-label">
                    Account Status
                  </label>
                  <select
                    id="edit-status"
                    className="admin-select full-width"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="header-btn header-btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="header-btn header-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. Confirmation Dialog Modal (Delete / Disable) */}
      {/* ======================================================== */}
      {isConfirmModalOpen && confirmActionData && (
        <div className="modal-backdrop" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="modal-box confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{confirmActionData.title}</h3>
              <button className="modal-close-btn" onClick={() => setIsConfirmModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-message">{confirmActionData.message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="header-btn header-btn-secondary"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`header-btn ${confirmActionData.isDestructive ? 'logout-btn' : 'header-btn-primary'}`}
                onClick={handleExecuteConfirmedAction}
                disabled={isDeleting}
              >
                {isDeleting ? 'Processing...' : confirmActionData.confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
