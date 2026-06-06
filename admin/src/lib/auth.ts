/**
 * Authentication utilities for the admin dashboard
 */

export const AUTH_KEY = "isAdmin";

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

/**
 * Set authentication status
 */
export function setAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;

  if (value) {
    localStorage.setItem(AUTH_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

/**
 * Logout user
 */
export function logout(): void {
  setAuthenticated(false);
}

/**
 * Temporary local login. Replace with backend-backed admin auth before production.
 */
export function login(email: string, password: string): boolean {
  const configuredEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const configuredPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (configuredEmail && configuredPassword && email === configuredEmail && password === configuredPassword) {
    setAuthenticated(true);
    return true;
  }
  return false;
}
