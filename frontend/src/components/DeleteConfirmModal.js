import React, { useState } from 'react';

const DeleteConfirmModal = ({ isOpen, expense, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !expense) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const expenseId = expense._id || expense.id;
      const response = await fetch(`/api/v1/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      onSuccess('Expense deleted successfully!', expenseId);
    } catch (err) {
      setError(err.message || 'Error deleting expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        
        <h3 className="text-lg font-bold text-gray-900">Delete Expense</h3>

        {/* Confirmation Text */}
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this expense?
        </p>

        {/* Expense Amount & Description */}
        <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1">
          <p className="text-sm font-semibold text-gray-800">
            {expense.description || 'No Description'}
          </p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-bold text-gray-900">${expense.amount}</span>
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModal;