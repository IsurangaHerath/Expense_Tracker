import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthForm from '../components/AuthForm';
import InputField from '../components/InputField';
import { loginUser } from '../utils/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  // Validation functions
  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(val.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required';
    }
    return '';
  };

  // Change handlers - clear errors when user types
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (error) setError('');
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (error) setError('');
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  // Blur validation
  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setFieldErrors((prev) => ({ ...prev, email: err }));
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setFieldErrors((prev) => ({ ...prev, password: err }));
  };

  // Form validity check for disabling submit button
  const isFormValid =
    email.trim() !== '' &&
    EMAIL_REGEX.test(email.trim()) &&
    password.trim() !== '' &&
    !fieldErrors.email &&
    !fieldErrors.password;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginUser(email.trim(), password);
      const data = response.data;

      if (data && data.token) {
        // Save token to localStorage
        localStorage.setItem('token', data.token);

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError('Login failed: Token not received');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorObj = err.response?.data?.error;
      const backendMessage =
        (typeof errorObj === 'string' ? errorObj : errorObj?.message) ||
        err.response?.data?.message;

      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure the backend is running at http://localhost:3000');
      } else {
        setError(backendMessage || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Login to Expense Tracker"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitText="Login"
      isSubmitDisabled={!isFormValid}
      footer={
        <span>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </span>
      }
    >
      <InputField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="Enter your email"
        error={fieldErrors.email}
        required
        autoComplete="email"
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordBlur}
        placeholder="Enter your password"
        error={fieldErrors.password}
        required
        showToggle
        isPasswordVisible={showPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        autoComplete="current-password"
      />
    </AuthForm>
  );
}

export default LoginPage;
