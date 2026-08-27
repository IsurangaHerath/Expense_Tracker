import React from 'react';

/**
 * Reusable AuthForm Component
 * 
 * Props:
 * - title (string): Form title
 * - children (ReactNode): Form inputs and content
 * - onSubmit (function): Form submission handler
 * - error (string): Top-level API or validation error
 * - successMessage (string): Success notification message
 * - loading (boolean): Loading state for spinner and disabling submit
 * - submitText (string): Text for submit button
 * - isSubmitDisabled (boolean): Additional disable condition (e.g. form invalid)
 * - footer (ReactNode): Optional link or text beneath the form (e.g., login/register toggle)
 */
function AuthForm({
  title,
  children,
  onSubmit,
  error,
  successMessage,
  loading = false,
  submitText = 'Submit',
  isSubmitDisabled = false,
  footer
}) {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {title && <h1 className="auth-title">{title}</h1>}

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

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          {children}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitDisabled || loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Processing...</span>
              </>
            ) : (
              submitText
            )}
          </button>
        </form>

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthForm;
