/**
 * Error Handling Service
 * Centralized error management and logging for the application
 * Provides consistent error handling and user feedback
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

/**
 * Application error types
 */
export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    public severity: ErrorSeverity,
    public userMessage: string,
    public devMessage?: string
  ) {
    super(userMessage)
    this.name = 'ApplicationError'
  }
}

/**
 * Validation error
 */
export class ValidationError extends ApplicationError {
  constructor(public errors: string[]) {
    super(400, 'warning', 'Validation failed', errors.join(', '))
    this.name = 'ValidationError'
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'warning', message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(403, 'warning', message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Not found error
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super(404, 'warning', `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

/**
 * Conflict error (resource already exists)
 */
export class ConflictError extends ApplicationError {
  constructor(message: string = 'Resource already exists') {
    super(409, 'warning', message)
    this.name = 'ConflictError'
  }
}

/**
 * Server error
 */
export class ServerError extends ApplicationError {
  constructor(message: string = 'An unexpected error occurred') {
    super(500, 'critical', message)
    this.name = 'ServerError'
  }
}

/**
 * Error logger for development and debugging
 */
export class ErrorLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log error to console and external service
   * @param error - Error to log
   * @param context - Additional context information
   */
  static log(error: Error, context?: Record<string, any>): void {
    const errorData = {
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    }

    // Log to console in development
    if (this.isDevelopment) {
      console.error('Error logged:', errorData)
    }

    // In production, send to error tracking service (e.g., Sentry)
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, { extra: context })
    // }

    // Store in localStorage for debugging
    this.storeErrorLog(errorData)
  }

  /**
   * Store error log in localStorage
   * @param errorData - Error data to store
   */
  private static storeErrorLog(errorData: any): void {
    if (typeof window === 'undefined') return

    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]')
      logs.push(errorData)
      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.shift()
      }
      localStorage.setItem('error_logs', JSON.stringify(logs))
    } catch {
      // Silently fail if storage is full
    }
  }

  /**
   * Get stored error logs
   * @returns Array of error logs
   */
  static getLogs(): any[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]')
    } catch {
      return []
    }
  }

  /**
   * Clear error logs
   */
  static clearLogs(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('error_logs')
  }
}

/**
 * Safe error handler wrapper for async operations
 * @param fn - Async function to wrap
 * @param onError - Error callback
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  onError?: (error: Error) => void
) {
  return async (...args: Args): Promise<T | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      ErrorLogger.log(err, { args })
      onError?.(err)
      return null
    }
  }
}

/**
 * Get user-friendly error message
 * @param error - Error to get message from
 * @returns User-friendly message
 */
export function getUserErrorMessage(error: Error): string {
  if (error instanceof ApplicationError) {
    return error.userMessage
  }

  if (error instanceof ValidationError) {
    return 'Please check your input and try again'
  }

  if (error instanceof AuthenticationError) {
    return 'Please log in again'
  }

  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action'
  }

  return 'An unexpected error occurred. Please try again later.'
}
