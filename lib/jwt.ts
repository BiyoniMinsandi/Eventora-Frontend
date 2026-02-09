/**
 * JWT Authentication Service
 * Handles token generation, validation, and expiration
 * Implements secure token-based authentication for the Eventora platform
 */

/**
 * JWT token payload structure
 */
export interface JWTPayload {
  userId: string
  email: string
  role: 'customer' | 'vendor' | 'admin'
  iat: number // Issued at timestamp
  exp: number // Expiration timestamp
}

/**
 * JWT token structure with token string and metadata
 */
export interface AuthToken {
  token: string
  payload: JWTPayload
  expiresAt: number
  refreshToken?: string
}

const JWT_SECRET = 'eventora_secure_secret_2024' // In production: use environment variable
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const TOKEN_STORAGE_KEY = 'eventora_jwt_token'
const REFRESH_TOKEN_STORAGE_KEY = 'eventora_refresh_token'

/**
 * Generate JWT token for user
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns Generated JWT token with payload
 */
export function generateJWT(
  userId: string,
  email: string,
  role: 'customer' | 'vendor' | 'admin'
): AuthToken {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + TOKEN_EXPIRY_MS / 1000

  const payload: JWTPayload = {
    userId,
    email,
    role,
    iat: now,
    exp: expiresAt,
  }

  // Simple base64 encoding (for production, use proper JWT library)
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedPayload = btoa(JSON.stringify(payload))
  const encodedHeader = btoa(JSON.stringify(header))
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)
  const token = `${encodedHeader}.${encodedPayload}.${signature}`

  return {
    token,
    payload,
    expiresAt: now + TOKEN_EXPIRY_MS / 1000,
    refreshToken: generateRefreshToken(userId),
  }
}

/**
 * Generate refresh token for user
 * @param userId - User ID
 * @returns Refresh token string
 */
export function generateRefreshToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + REFRESH_TOKEN_EXPIRY_MS / 1000
  const data = JSON.stringify({ userId, exp, type: 'refresh' })
  return btoa(data)
}

/**
 * Verify JWT token validity
 * @param token - JWT token to verify
 * @returns Decoded payload if valid, null if invalid or expired
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const rawPayload = JSON.parse(atob(decodeBase64Url(parts[1]))) as Record<string, unknown>
    const payload = normalizeJwtPayload(rawPayload)
    const now = Math.floor(Date.now() / 1000)

    if (!payload.userId || !payload.exp) {
      return null
    }

    // Check if token is expired
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function decodeBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return padded
}

function normalizeJwtPayload(raw: Record<string, unknown>): JWTPayload {
  const userId = String(
    raw.userId ??
      raw.nameid ??
      raw.sub ??
      raw['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
      ''
  )

  const email = String(
    raw.email ??
      raw.unique_name ??
      raw['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
      ''
  )

  const role = String(
    raw.role ??
      raw['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      'customer'
  ) as JWTPayload['role']

  return {
    userId,
    email,
    role,
    iat: Number(raw.iat ?? 0),
    exp: Number(raw.exp ?? 0),
  }
}

/**
 * Verify refresh token and return new JWT
 * @param refreshToken - Refresh token to verify
 * @returns New JWT token if valid, null if invalid
 */
export function verifyRefreshToken(refreshToken: string): AuthToken | null {
  try {
    const data = JSON.parse(atob(refreshToken)) as {
      userId: string
      exp: number
      type: string
    }
    const now = Math.floor(Date.now() / 1000)

    if (data.type !== 'refresh' || data.exp < now) {
      return null
    }

    // In real implementation, fetch user details from database
    // For now, return with placeholder values
    return generateJWT(data.userId, 'user@example.com', 'customer')
  } catch {
    return null
  }
}

/**
 * Store JWT token in localStorage
 * @param authToken - Auth token to store
 */
export function storeToken(authToken: AuthToken): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY, authToken.token)
  if (authToken.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authToken.refreshToken)
  }
}

/**
 * Retrieve stored JWT token
 * @returns Stored token or null if not found
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Retrieve refresh token
 * @returns Stored refresh token or null if not found
 */
export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Clear all authentication tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Get current valid JWT payload
 * @returns JWT payload if token is valid, null otherwise
 */
export function getCurrentTokenPayload(): JWTPayload | null {
  const token = getStoredToken()
  if (!token) return null

  const payload = verifyJWT(token)
  if (!payload) {
    // Try to refresh token
    const refreshToken = getStoredRefreshToken()
    if (refreshToken) {
      const newToken = verifyRefreshToken(refreshToken)
      if (newToken) {
        storeToken(newToken)
        return newToken.payload
      }
    }
    clearTokens()
    return null
  }

  return payload
}

/**
 * Check if token is about to expire (within 5 minutes)
 * @returns True if token expiration is within 5 minutes
 */
export function isTokenExpiringSoon(): boolean {
  const payload = getCurrentTokenPayload()
  if (!payload) return false

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = payload.exp - now
  return expiresIn < 5 * 60 // 5 minutes
}
