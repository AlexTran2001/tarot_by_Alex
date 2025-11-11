/**
 * Error utility functions for consistent error handling across the application
 */

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  digest?: string;
}

/**
 * Creates a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";
}

/**
 * Determines if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      error.name === "NetworkError"
    );
  }
  return false;
}

/**
 * Determines if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("auth") ||
      error.message.includes("unauthorized") ||
      error.message.includes("permission") ||
      error.message.includes("401") ||
      error.message.includes("403")
    );
  }
  return false;
}

/**
 * Gets a user-friendly error message based on error type
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại.";
  }
  if (isAuthError(error)) {
    return "Bạn không có quyền truy cập. Vui lòng đăng nhập lại.";
  }
  return getErrorMessage(error);
}

/**
 * Logs error to console (and optionally to error tracking service in production)
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorContext = context ? `[${context}]` : "";
  
  console.error(`Error ${errorContext}:`, error);
  
  // In production, you can send errors to error tracking services like:
  // - Sentry
  // - LogRocket
  // - Bugsnag
  // Example:
  // if (process.env.NODE_ENV === "production") {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}

