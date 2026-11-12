import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import { changePassword } from '../utils/api';
import './ChangePasswordPage.css';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmNewPasswordRef = useRef(null);

  // Clear sensitive state on unmount
  useEffect(() => {
    return () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    };
  }, []);

  // Password requirement tests for New Password
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const isPasswordCriteriaMet = hasMinLength && hasUpper && hasLower && hasNumber;

  // Validation functions
  const validateCurrentPassword = (val) => {
    if (!val) {
      return 'Current password is required';
    }
    return '';
  };

  const validateNewPassword = (val, curVal) => {
    if (!val) {
      return 'New password is required';
    }
    if (!PASSWORD_REGEX.test(val)) {
      return 'New password must be at least 8 characters and contain an uppercase letter, a lowercase letter, and a number';
    }
    if (curVal && val === curVal) {
      return 'New password cannot be the same as the current password';
    }
    return '';
  };

  const validateConfirmNewPassword = (val, newPassVal) => {
    if (!val) {
      return 'Please confirm your new password';
    }
    if (val !== newPassVal) {
      return 'New passwords do not match';
    }
    return '';
  };

  // Change Handlers
  const handleCurrentPasswordChange = (e) => {
    const val = e.target.value;
    setCurrentPassword(val);
    if (error) setError('');
    if (fieldErrors.currentPassword) {
      setFieldErrors((prev) => ({ ...prev, currentPassword: '' }));
    }
    // Recheck new password if it was flagged as same as current
    if (newPassword && fieldErrors.newPassword === 'New password cannot be the same as the current password') {
      if (val !== newPassword) {
        setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
      }
    }
  };

  const handleNewPasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    if (error) setError('');
    if (fieldErrors.newPassword) {
      setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
    }
    // Check confirmation match if confirm password has error
    if (confirmNewPassword && fieldErrors.confirmNewPassword) {
      if (val === confirmNewPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
      }
    }
  };

  const handleConfirmNewPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmNewPassword(val);
    if (error) setError('');
    if (fieldErrors.confirmNewPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
    }
  };

  // Blur Validation Handlers
  const handleCurrentPasswordBlur = (e) => {
    const val = e.target.value;
    setCurrentPassword(val);
    setFieldErrors((prev) => ({
      ...prev,
      currentPassword: validateCurrentPassword(val)
    }));
  };

  const handleNewPasswordBlur = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setFieldErrors((prev) => ({
      ...prev,
      newPassword: validateNewPassword(val, currentPassword)
    }));
  };

  const handleConfirmNewPasswordBlur = (e) => {
    const val = e.target.value;
    setConfirmNewPassword(val);
    setFieldErrors((prev) => ({
      ...prev,
      confirmNewPassword: validateConfirmNewPassword(val, newPassword)
    }));
  };

  // Form validity check
  const isFormValid =
    currentPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    confirmNewPassword.trim() !== '' &&
    isPasswordCriteriaMet &&
    newPassword !== currentPassword &&
    newPassword === confirmNewPassword &&
    !fieldErrors.currentPassword &&
    !fieldErrors.newPassword &&
    !fieldErrors.confirmNewPassword;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const curVal = currentPassword;
    const newVal = newPassword;
    const confVal = confirmNewPassword;

    const curErr = validateCurrentPassword(curVal);
    const newErr = validateNewPassword(newVal, curVal);
    const confErr = validateConfirmNewPassword(confVal, newVal);

    if (curErr || newErr || confErr) {
      setFieldErrors({
        currentPassword: curErr,
        newPassword: newErr,
        confirmNewPassword: confErr
      });
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await changePassword({
        currentPassword: curVal,
        newPassword: newVal,
        confirmPassword: confVal
      });

      if (response.data?.success || response.status === 200) {
        setSuccessMessage(response.data?.message || 'Password changed successfully!');
        // Reset password fields immediately
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setFieldErrors({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setSuccessMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      console.error('Change password error:', err);
      const status = err.response?.status;
      const errorObj = err.response?.data?.error;
      const backendMessage =
        (typeof errorObj === 'string' ? errorObj : errorObj?.message) ||
        err.response?.data?.message;

      if (!err.response) {
        setError('Cannot connect to backend server. Please verify the server is running.');
      } else if (status === 404) {
        setError('The password change endpoint (/api/v1/auth/change-password) is not yet available on the backend server. The frontend form is fully prepared.');
      } else if (status === 401 || status === 403) {
        setError(backendMessage || 'Invalid current password. Please try again.');
      } else if (errorObj?.details && Array.isArray(errorObj.details) && errorObj.details.length > 0) {
        setError(errorObj.details.join(', '));
      } else {
        setError(backendMessage || 'Failed to update password. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <Navbar
        title="Account Settings"
        subtitle="Manage your security preferences and update your password."
      />

      <div className="change-password-layout">
        <div className="change-password-card">
          <div className="card-header-section">
            <div className="icon-badge">🔒</div>
            <div>
              <h2 className="section-title">Change Password</h2>
              <p className="section-desc">
                Ensure your account is using a strong and unique password.
              </p>
            </div>
          </div>

          {error && (
            <div className="auth-banner-error" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="auth-banner-success" role="status">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <InputField
              label="Current Password"
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              onBlur={handleCurrentPasswordBlur}
              placeholder="Enter your current password"
              error={fieldErrors.currentPassword}
              required
              showToggle
              isPasswordVisible={showCurrentPassword}
              onTogglePassword={() => setShowCurrentPassword((prev) => !prev)}
              autoComplete="current-password"
              inputRef={currentPasswordRef}
            />

            <InputField
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              onBlur={handleNewPasswordBlur}
              placeholder="Enter your new password"
              error={fieldErrors.newPassword}
              required
              showToggle
              isPasswordVisible={showNewPassword}
              onTogglePassword={() => setShowNewPassword((prev) => !prev)}
              autoComplete="new-password"
              inputRef={newPasswordRef}
            />

            {/* Live Password Requirements Feedback */}
            <div className="password-requirements">
              <span className="requirements-title">New Password Requirements:</span>
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
              {currentPassword && newPassword && newPassword === currentPassword && (
                <div className="requirement-item unmet" style={{ color: '#ef4444' }}>
                  <span className="req-icon">✕</span>
                  <span>Must not match current password</span>
                </div>
              )}
            </div>

            <InputField
              label="Confirm New Password"
              type="password"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={handleConfirmNewPasswordChange}
              onBlur={handleConfirmNewPasswordBlur}
              placeholder="Confirm your new password"
              error={fieldErrors.confirmNewPassword}
              required
              showToggle
              isPasswordVisible={showConfirmNewPassword}
              onTogglePassword={() => setShowConfirmNewPassword((prev) => !prev)}
              autoComplete="new-password"
              inputRef={confirmNewPasswordRef}
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
