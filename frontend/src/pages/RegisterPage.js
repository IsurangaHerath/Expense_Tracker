import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import InputField from '../components/InputField';
import { registerUser } from '../utils/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password requirement tests
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber;

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
    if (!PASSWORD_REGEX.test(val)) {
      return 'Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, and a number';
    }
    return '';
  };

  const validateConfirmPassword = (val, currentPassword) => {
    if (!val) {
      return 'Please confirm your password';
    }
    if (val !== currentPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Change handlers (clear errors when user types)
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
    // If confirm password was already typed, check match
    if (confirmPassword && fieldErrors.confirmPassword) {
      if (val === confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (error) setError('');
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
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

  const handleConfirmPasswordBlur = () => {
    const err = validateConfirmPassword(confirmPassword, password);
    setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
  };

  // Form validity check for disabling submit button
  const isFormValid =
    email.trim() !== '' &&
    EMAIL_REGEX.test(email.trim()) &&
    isPasswordValid &&
    confirmPassword !== '' &&
    confirmPassword === password &&
    !fieldErrors.email &&
    !fieldErrors.password &&
    !fieldErrors.confirmPassword;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmPassErr = validateConfirmPassword(confirmPassword, password);

    if (emailErr || passErr || confirmPassErr) {
      setFieldErrors({
        email: emailErr,
        password: passErr,
        confirmPassword: confirmPassErr
      });
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await registerUser(email.trim(), password);
      if (response.data?.success || response.status === 201 || response.status === 200) {
        setSuccessMessage('Account created! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSuccessMessage('Account created! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const status = err.response?.status;
      const errorObj = err.response?.data?.error;
      const errorCode = errorObj?.code;
      const backendMessage =
        (typeof errorObj === 'string' ? errorObj : errorObj?.message) ||
        err.response?.data?.message;

      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure the backend is running at http://localhost:3000');
      } else if (status === 409 || errorCode === 'DUPLICATE_EMAIL') {
        setError('Email already exists');
      } else if (errorObj?.details && Array.isArray(errorObj.details) && errorObj.details.length > 0) {
        setError(errorObj.details.join(', '));
      } else if (backendMessage) {
        setError(backendMessage);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create Your Account"
      onSubmit={handleSubmit}
      error={error}
      successMessage={successMessage}
      loading={loading}
      submitText="Register"
      isSubmitDisabled={!isFormValid || !!successMessage}
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login
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
        placeholder="Create a password"
        error={fieldErrors.password}
        required
        showToggle
        isPasswordVisible={showPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        autoComplete="new-password"
      />

      {/* Password Requirements Display */}
      <div className="password-requirements">
        <span className="requirements-title">Password Requirements:</span>
        <div className={`requirement-item ${hasMinLength ? 'met' : 'unmet'}`}>
          <span className="req-icon">{hasMinLength ? '✓' : '○'}</span>
          <span>At least 8 characters</span>
        </div>
        <div className={`requirement-item ${hasUpper ? 'met' : 'unmet'}`}>
          <span className="req-icon">{hasUpper ? '✓' : '○'}</span>
          <span>At least 1 uppercase letter (A-Z)</span>
        </div>
        <div className={`requirement-item ${hasLower ? 'met' : 'unmet'}`}>
          <span className="req-icon">{hasLower ? '✓' : '○'}</span>
          <span>At least 1 lowercase letter (a-z)</span>
        </div>
        <div className={`requirement-item ${hasNumber ? 'met' : 'unmet'}`}>
          <span className="req-icon">{hasNumber ? '✓' : '○'}</span>
          <span>At least 1 number (0-9)</span>
        </div>
      </div>

      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        onBlur={handleConfirmPasswordBlur}
        placeholder="Confirm your password"
        error={fieldErrors.confirmPassword}
        required
        showToggle
        isPasswordVisible={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
        autoComplete="new-password"
      />
    </AuthForm>
  );
}

export default RegisterPage;
