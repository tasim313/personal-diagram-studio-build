import 'server-only'

import { cookies } from 'next/headers'
import { adminAuth, adminApp } from './admin'
import type { SessionUser } from './types'

export type { SessionUser }

// ── Constants ────────────────────────────────────────────
const SESSION_COOKIE_NAME = 'ves_session'
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

// Helper: parse JWT payload safely
function parseJwtPayload(token: string): { sub?: string; user_id?: string; email?: string; name?: string; picture?: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

// ── Session Management ──────────────────────────────────
export async function createSession(idToken: string) {
  let sessionCookie = ''

  if (adminApp && adminAuth) {
    try {
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_EXPIRY_MS,
      })
    } catch (err) {
      console.warn('[auth] Failed to create Admin session cookie, falling back to standard session token:', err)
    }
  }

  // Fallback if Admin SDK is not configured with service account
  if (!sessionCookie) {
    const payload = parseJwtPayload(idToken)
    const uid = payload?.sub || payload?.user_id || 'anonymous'
    const email = payload?.email || ''
    const name = payload?.name || email.split('@')[0] || 'User'
    const picture = payload?.picture || ''
    const exp = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_MS / 1000

    sessionCookie = JSON.stringify({ uid, email, name, picture, exp })
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRY_MS / 1000,
  })
}

export async function verifySession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) return null

  // Try Firebase Admin first if configured
  if (adminApp && adminAuth) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
      if (decoded && decoded.uid) {
        return {
          uid: decoded.uid,
          email: decoded.email || '',
          name: decoded.name || decoded.email?.split('@')[0] || '',
          picture: decoded.picture || '',
        }
      }
    } catch {
      // Continue to check fallback format
    }
  }

  // Verify fallback format
  try {
    const parsed = JSON.parse(sessionCookie)
    if (parsed.uid && parsed.exp && parsed.exp > Math.floor(Date.now() / 1000)) {
      return {
        uid: parsed.uid,
        email: parsed.email || '',
        name: parsed.name || parsed.email?.split('@')[0] || 'User',
        picture: parsed.picture || '',
      }
    }
  } catch {
    // Not valid JSON fallback
  }

  return null
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// ── User Utilities ──────────────────────────────────────
export async function getCurrentUser(): Promise<SessionUser | null> {
  return await verifySession()
}
