/**
 * Role-Based Access Control (RBAC) Service
 * Manages permissions and access control for different user roles
 * Ensures secure authorization throughout the application
 */

export type UserRole = 'customer' | 'vendor' | 'admin'
export type ResourceAction = 'create' | 'read' | 'update' | 'delete'

/**
 * Permission matrix defining what each role can do
 */
const RBAC_MATRIX: Record<UserRole, Record<string, ResourceAction[]>> = {
  customer: {
    bookings: ['create', 'read', 'update'],
    reviews: ['create', 'read', 'update', 'delete'],
    disputes: ['create', 'read', 'update'],
    messages: ['create', 'read'],
    profile: ['read', 'update'],
    notifications: ['read'],
  },
  vendor: {
    bookings: ['read', 'update'],
    services: ['create', 'read', 'update', 'delete'],
    availability: ['create', 'read', 'update', 'delete'],
    messages: ['create', 'read'],
    profile: ['read', 'update'],
    notifications: ['read'],
    analytics: ['read'],
  },
  admin: {
    users: ['read', 'update', 'delete'],
    vendors: ['read', 'update', 'delete'],
    bookings: ['read', 'update'],
    disputes: ['read', 'update', 'delete'],
    reviews: ['read', 'delete'],
    messages: ['read'],
    notifications: ['read'],
    analytics: ['read'],
    settings: ['read', 'update'],
  },
}

/**
 * Check if a role has permission to perform an action on a resource
 * @param role - User role
 * @param resource - Resource name
 * @param action - Action to perform
 * @returns True if permission is granted
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: ResourceAction
): boolean {
  const rolePermissions = RBAC_MATRIX[role]
  if (!rolePermissions) return false

  const resourceActions = rolePermissions[resource]
  return Array.isArray(resourceActions) && resourceActions.includes(action)
}

/**
 * Check if user has any of the specified roles
 * @param userRole - User's current role
 * @param allowedRoles - Array of roles that are allowed
 * @returns True if user role is in allowed roles
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns Object containing all permissions for the role
 */
export function getRolePermissions(role: UserRole): Record<string, ResourceAction[]> {
  return RBAC_MATRIX[role] || {}
}

/**
 * Check if user can access a specific page
 * @param role - User role
 * @param page - Page path
 * @returns True if user can access the page
 */
export function canAccessPage(role: UserRole, page: string): boolean {
  const pageRoleMap: Record<string, UserRole[]> = {
    '/customer/dashboard': ['customer'],
    '/customer/bookings': ['customer'],
    '/customer/messages': ['customer'],
    '/customer/disputes': ['customer'],
    '/customer/profile': ['customer'],
    '/customer/settings': ['customer'],
    '/customer/notifications': ['customer'],
    '/vendor/dashboard': ['vendor'],
    '/vendor/requests': ['vendor'],
    '/vendor/bookings': ['vendor'],
    '/vendor/availability': ['vendor'],
    '/vendor/portfolio': ['vendor'],
    '/vendor/analytics': ['vendor'],
    '/vendor/messages': ['vendor'],
    '/vendor/settings': ['vendor'],
    '/vendor/notifications': ['vendor'],
    '/vendor/profile': ['vendor'],
    '/admin/dashboard': ['admin'],
    '/admin/users': ['admin'],
    '/admin/approvals': ['admin'],
    '/admin/disputes': ['admin'],
    '/admin/reviews': ['admin'],
    '/admin/analytics': ['admin'],
    '/admin/content': ['admin'],
    '/admin/settings': ['admin'],
  }

  const allowedRoles = pageRoleMap[page]
  return allowedRoles ? hasRole(role, allowedRoles) : false
}

/**
 * Get user's dashboard based on role
 * @param role - User role
 * @returns Dashboard path
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'customer':
      return '/customer/dashboard'
    case 'vendor':
      return '/vendor/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/'
  }
}

/**
 * Resource-specific access check
 * Validates ownership and action permissions
 */
export interface AccessCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Check if user can access a specific booking
 * @param userRole - User's role
 * @param userId - User ID
 * @param bookingOwnerId - Owner of the booking
 * @param bookingVendorId - Vendor of the booking
 * @returns Access check result
 */
export function canAccessBooking(
  userRole: UserRole,
  userId: string,
  bookingOwnerId: string,
  bookingVendorId: string
): AccessCheckResult {
  if (!hasPermission(userRole, 'bookings', 'read')) {
    return { allowed: false, reason: 'You do not have permission to view bookings' }
  }

  if (userRole === 'admin') {
    return { allowed: true }
  }

  if (userRole === 'customer' && userId === bookingOwnerId) {
    return { allowed: true }
  }

  if (userRole === 'vendor' && userId === bookingVendorId) {
    return { allowed: true }
  }

  return { allowed: false, reason: 'You do not have access to this booking' }
}

/**
 * Check if user can modify a dispute
 * @param userRole - User's role
 * @param userId - User ID
 * @param disputeCreatorId - Creator of the dispute
 * @returns Access check result
 */
export function canModifyDispute(
  userRole: UserRole,
  userId: string,
  disputeCreatorId: string
): AccessCheckResult {
  if (userRole === 'admin') {
    return { allowed: true }
  }

  if (userRole === 'customer' && userId === disputeCreatorId) {
    return { allowed: true, reason: 'You can only modify disputes you created' }
  }

  return { allowed: false, reason: 'You do not have permission to modify this dispute' }
}
