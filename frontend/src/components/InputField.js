import React from 'react';

/**
 * Reusable InputField Component
 * 
 * Props:
 * - label (string): Label text displayed above input
 * - type (string): Input type (text, email, password, etc.)
 * - name (string): Field name
 * - value (string): Field value
 * - onChange (function): Change handler
 * - onBlur (function): Blur handler for validation
 * - placeholder (string): Placeholder text
 * - error (string): Validation error message
 * - required (boolean): Whether field is required
 * - showToggle (boolean): Whether to show password visibility toggle button
 * - isPasswordVisible (boolean): Whether password is currently visible
 * - onTogglePassword (function): Callback to toggle password visibility
 * - id (string): Custom id (falls back to name)
 */
function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  showToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  autoComplete,
  ...rest
}) {
  const inputId = rest.id || `field-${name}`;
  const effectiveType = showToggle ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        <input
          id={inputId}
          type={effectiveType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`form-input ${error ? 'input-error' : ''} ${showToggle ? 'has-toggle' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {showToggle && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={onTogglePassword}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error && (
        <div id={`${inputId}-error`} className="field-error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default InputField;
