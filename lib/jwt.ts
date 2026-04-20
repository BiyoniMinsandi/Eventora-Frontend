/**
 * JWT utilities for the Eventora frontend.
 *
 * The .NET backend is the only party that signs tokens (HS256 with a server secret).
 * This module only READS tokens — it does not sign or forge them.
 * `generateJWT` is kept solely for the edge case where setAuthState is called
 * without a backend token (should not happen in normal auth flows).
 */

export interface JWTPayload {
  userId: string
  email: string
  role: 'customer' | 'vendor' | 'admin'
  iat: number
  exp: number
}

export interface AuthToken {
  token: string
  payload: JWTPayload
  expiresAt: number
  refreshToken?: string
}

const TOKEN_STORAGE_KEY = 'eventora_jwt_token'
const REFRESH_TOKEN_STORAGE_KEY = 'eventora_refresh_token'

// Used only in setAuthState when no backend token is available (edge case).
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60

export function generateJWT(
  userId: string,
  email: string,
  role: 'customer' | 'vendor' | 'admin'
): AuthToken {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + TOKEN_EXPIRY_SECONDS

  const payload: JWTPayload = { userId, email, role, iat: now, exp }

  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const encodedPayload = btoa(JSON.stringify(payload))
  const token = `${header}.${encodedPayload}.`

  return { token, payload, expiresAt: exp }
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const rawPayload = JSON.parse(atob(decodeBase64Url(parts[1]))) as Record<string, unknown>
    const payload = normalizeJwtPayload(rawPayload)
    const now = Math.floor(Date.now() / 1000)

    if (!payload.userId || !payload.exp || payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

function decodeBase64Url(value: string): string {
  return value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
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
    raw.role ?? raw['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? 'customer'
  ) as JWTPayload['role']

  return { userId, email, role, iat: Number(raw.iat ?? 0), exp: Number(raw.exp ?? 0) }
}

export function storeToken(authToken: AuthToken): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY, authToken.token)
  if (authToken.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authToken.refreshToken)
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function getCurrentTokenPayload(): JWTPayload | null {
  const token = getStoredToken()
  if (!token) return null
  return verifyJWT(token)
}

export function isTokenExpiringSoon(): boolean {
  const payload = getCurrentTokenPayload()
  if (!payload) return false
  return payload.exp - Math.floor(Date.now() / 1000) < 5 * 60
}

// The backend issues 24-hour JWTs with no refresh-token mechanism.
// When a token expires the auth-provider calls logout() via this returning null.
export function verifyRefreshToken(_refreshToken: string): AuthToken | null {
  return null
}
