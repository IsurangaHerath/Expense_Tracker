import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';
import api, { getExpenseById, createExpense, updateExpense } from '../utils/api';

const ExpenseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load Categories and Expense Details from api if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const catRes = await api.get('/categories');
        setCategories(catRes.data?.data?.categories || []);

        if (isEditMode) {
          const expRes = await getExpenseById(id);
          setInitialData(expRes.data?.data?.expense || null);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Something went wrong while loading data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Submit Handler
  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');

    try {
      if (isEditMode) {
        await updateExpense(id, payload);
      } else {
        await createExpense(payload);
      }

      navigate('/expenses');
    } catch (err) {
      const details = err.response?.data?.error?.details;
      setError(
        (Array.isArray(details) && details.length > 0 ? details.join(', ') : null) ||
          err.response?.data?.message ||
          'An error occurred while saving.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="expense-form-page">
      <h2>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>

      {error && (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Reuse ExpenseForm Component */}
      <ExpenseForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/expenses')}
        isSubmitting={submitting}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default ExpenseFormPage;