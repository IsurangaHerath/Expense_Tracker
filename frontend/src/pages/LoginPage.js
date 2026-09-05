import React, { useState, useRef, useEffect } from 'react';
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

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Sync state with the live DOM values.
  // Browser autofill/password managers often fill inputs without firing
  // React's synthetic events, so we attach native listeners to catch them.
  useEffect(() => {
    const syncEmail = () => {
      const el = emailRef.current;
      if (!el) return;
      setEmail(el.value);
      setFieldErrors((prev) => (prev.email ? { ...prev, email: '' } : prev));
    };
    const syncPassword = () => {
      const el = passwordRef.current;
      if (!el) return;
      setPassword(el.value);
      setFieldErrors((prev) => (prev.password ? { ...prev, password: '' } : prev));
    };

    const emailEl = emailRef.current;
    const passwordEl = passwordRef.current;

    emailEl?.addEventListener('input', syncEmail);
    emailEl?.addEventListener('change', syncEmail);
    passwordEl?.addEventListener('input', syncPassword);
    passwordEl?.addEventListener('change', syncPassword);

    return () => {
      emailEl?.removeEventListener('input', syncEmail);
      emailEl?.removeEventListener('change', syncEmail);
      passwordEl?.removeEventListener('input', syncPassword);
      passwordEl?.removeEventListener('change', syncPassword);
    };
  }, []);

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

  // Blur validation - read the live DOM value so browser autofill is respected.
  // Only flag *format* problems on blur; "required" is only reported on submit,
  // which avoids a false "Email is required" for a field the browser just filled.
  const handleEmailBlur = (e) => {
    const val = e.target.value;
    setEmail(val);

    let err = '';
    if (val) {
      err = validateEmail(val);
      if (err === 'Email is required') err = '';
    }
    setFieldErrors((prev) => ({ ...prev, email: err }));
  };

  const handlePasswordBlur = (e) => {
    const val = e.target.value;
    setPassword(val);
    setFieldErrors((prev) => ({ ...prev, password: '' }));
  };

  // Form validity check for disabling submit button.
  // Reads from the refs so autofilled values are always taken into account.
  const isFormValid = (() => {
    const emailVal = (emailRef.current?.value || email).trim();
    const passwordVal = passwordRef.current?.value ?? password;
    return (
      emailVal !== '' &&
      EMAIL_REGEX.test(emailVal) &&
      passwordVal !== ''
    );
  })();

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const emailVal = (form.email?.value || '').trim();
    const passVal = form.password?.value || '';

    // Sync state with the actual field values (handles browser autofill)
    setEmail(emailVal);
    setPassword(passVal);

    const emailErr = validateEmail(emailVal);
    const passErr = validatePassword(passVal);

    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginUser(emailVal, passVal);
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
        inputRef={emailRef}
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
        inputRef={passwordRef}
      />
    </AuthForm>
  );
}

export default LoginPage;