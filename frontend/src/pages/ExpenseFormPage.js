import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';

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

        const catRes = await fetch('/api/v1/categories');
        if (!catRes.ok) throw new Error('Failed to load categories');
        const catData = await catRes.json();
        setCategories(catData.data || catData);

        if (isEditMode) {
          const expRes = await fetch(`/api/v1/expenses/${id}`);
          if (!expRes.ok) throw new Error('Failed to fetch expense details');
          const expData = await expRes.json();
          setInitialData(expData.data || expData);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong while loading data.');
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

    const url = isEditMode ? `/api/v1/expenses/${id}` : '/api/v1/expenses';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save expense.');
      }

      navigate('/expenses');
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
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