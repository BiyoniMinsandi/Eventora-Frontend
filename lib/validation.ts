/**
 * Data Validation Service
 * Provides validation functions for all data types in the application
 * Ensures data integrity and prevents invalid operations
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  if (!email) {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with strength assessment
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate user registration data
 * @param data - User registration data
 * @returns Validation result
 */
export function validateUserRegistration(data: {
  email: string
  password: string
  fullName: string
  role: string
}): ValidationResult {
  const errors: string[] = []

  const emailValidation = validateEmail(data.email)
  if (!emailValidation.valid) {
    errors.push(...emailValidation.errors)
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors)
  }

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters')
  }

  if (!['customer', 'vendor', 'admin'].includes(data.role)) {
    errors.push('Invalid role')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate booking data
 * @param data - Booking data
 * @returns Validation result
 */
export function validateBookingData(data: {
  eventDate: string
  guestCount?: number
  specialRequests?: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.eventDate) {
    errors.push('Event date is required')
  } else {
    const eventDate = new Date(data.eventDate)
    if (eventDate < new Date()) {
      errors.push('Event date cannot be in the past')
    }
  }

  if (data.guestCount !== undefined && data.guestCount < 1) {
    errors.push('Guest count must be at least 1')
  }

  if (data.specialRequests && data.specialRequests.length > 1000) {
    errors.push('Special requests cannot exceed 1000 characters')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate review data
 * @param data - Review data
 * @returns Validation result
 */
export function validateReviewData(data: {
  rating: number
  comment: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5')
  }

  if (!data.comment || data.comment.trim().length < 10) {
    errors.push('Review comment must be at least 10 characters')
  }

  if (data.comment.length > 500) {
    errors.push('Review comment cannot exceed 500 characters')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate dispute data
 * @param data - Dispute data
 * @returns Validation result
 */
export function validateDisputeData(data: {
  title: string
  description: string
  category: string
  priority: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Dispute title must be at least 5 characters')
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Dispute description must be at least 10 characters')
  }

  const validCategories = ['quality', 'behavior', 'payment', 'schedule', 'damage', 'other']
  if (!validCategories.includes(data.category)) {
    errors.push('Invalid dispute category')
  }

  const validPriorities = ['low', 'medium', 'high']
  if (!validPriorities.includes(data.priority)) {
    errors.push('Invalid priority level')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Sanitize user input to prevent XSS
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Validation result
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = []

  try {
    new URL(url)
  } catch {
    errors.push('Invalid URL format')
  }

  return { valid: errors.length === 0, errors }
}
