/**
 * Authentication and User Role Utilities
 */

/**
 * Decode JWT token payload (without external libraries)
 * @param {string} token 
 * @returns {object|null}
 */
export function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT token:', e);
    return null;
  }
}

/**
 * Get current authenticated token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Check if the current user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  // Check JWT expiration if available
  const payload = decodeJwt(token);
  if (payload && payload.exp) {
    const isExpired = Date.now() >= payload.exp * 1000;
    if (isExpired) {
      clearAuth();
      return false;
    }
  }

  return true;
}

/**
 * Get stored user information
 * Merges localStorage user object with JWT token payload
 * @returns {object|null}
 */
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  let storedUser = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing stored user:', e);
  }

  const jwtPayload = decodeJwt(token);

  // Return merged user info
  return {
    id: storedUser?.id || jwtPayload?.id || null,
    email: storedUser?.email || jwtPayload?.email || '',
    role: storedUser?.role || jwtPayload?.role || 'user',
    ...storedUser
  };
}

/**
 * Check if the logged-in user has Admin privileges
 * @returns {boolean}
 */
export function isAdmin() {
  if (!isAuthenticated()) return false;
  const user = getCurrentUser();
  if (!user) return false;
  
  // Check user role (case-insensitive)
  const role = String(user.role || '').toLowerCase();
  return role === 'admin';
}

/**
 * Set user information in localStorage
 * @param {object} user 
 */
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

/**
 * Clear all authentication and user state from localStorage
 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
