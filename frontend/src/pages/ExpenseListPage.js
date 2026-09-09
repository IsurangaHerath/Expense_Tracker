import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Member 5 ගේ Components (File paths ඔබේ project එකට අනුව තහවුරු කරගන්න)
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

// Helper: LKR Currency Formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount || 0);
};

// Category Color Indicators
const CATEGORY_COLORS = {
  Bills: 'bg-amber-100 text-amber-800 border-amber-200',
  Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
  Food: 'bg-red-100 text-red-800 border-red-200',
  Health: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
  Transport: 'bg-blue-100 text-blue-800 border-blue-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Category List for Dropdown
const CATEGORIES = [
  'Bills',
  'Entertainment',
  'Food',
  'Health',
  'Shopping',
  'Transport',
];

const ExpenseListPage = () => {
  const navigate = useNavigate();

  // Task Requirements අනුව State Variables
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 50 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Expenses Function (Relative Path - Proxy හරහා සම්බන්ධ වේ)
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
      });

      if (search.trim()) params.append('search', search.trim());
      if (categoryFilter) params.append('category', categoryFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/expenses?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();

      setExpenses(data.data || data.expenses || data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Error fetching expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter, dateRange]);

  // Data Loading Triggers
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handlers
  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategoryFilter(selectedCategory);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const hasActiveFilters = Boolean(search || categoryFilter || dateRange.start || dateRange.end);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage, filter, and track all your recorded expenses.
          </p>
        </div>
        <button
          onClick={() => navigate('/expenses/new')}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          + Add Expense
        </button>
      </div>

      {/* Filter Controls & Member 5 Components */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 my-6 space-y-4">
        
        {/* Member 5's SearchBar */}
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search expenses..."
        />

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          
          {/* Member 5's CategoryFilter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={categoryFilter}
              onFilterChange={handleCategoryChange}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange({ ...dateRange, start: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange({ ...dateRange, end: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium border transition ${
                hasActiveFilters
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg my-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading View */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-500 text-sm">Loading expenses...</span>
        </div>
      ) : expenses.length === 0 ? (
        
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg font-medium">
            {hasActiveFilters ? 'No expenses found' : 'No expenses recorded yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveFilters
              ? 'Try adjusting your search query or filters.'
              : 'Get started by clicking "+ Add Expense" above.'}
          </p>
        </div>
      ) : (
        
        /* Expense Table */
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {expenses.map((expense) => {
                  const badgeStyle = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS['Other'];
                  const expenseId = expense._id || expense.id;

                  return (
                    <tr
                      key={expenseId}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => navigate(`/expenses/${expenseId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-900 font-medium">
                        {expense.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/expenses/edit/${expenseId}`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expenseId)}
                          className="text-red-600 hover:text-red-900 font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(pagination.total > 50 || pagination.totalPages > 1) && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-800">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-800">{pagination.totalPages}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseListPage;