import { NextResponse } from 'next/server'
import { destroySession, verifySession } from '@/lib/firebase/auth'
import { adminAuth, adminApp } from '@/lib/firebase/admin'

export async function POST() {
  try {
    // Revoke the session on Firebase's side if admin is configured.
    // revokeRefreshTokens invalidates the user's refresh token family, so
    // verifySessionCookie(..., true) will reject the old cookie on subsequent
    // requests. Our verifySession() already passes checkRevoked=true.
    if (adminApp && adminAuth) {
      const session = await verifySession()
      if (session) {
        await adminAuth.revokeRefreshTokens(session.uid)
      }
    }

    await destroySession()

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[auth/sign-out] Sign-out error:', error)
    // Still destroy the cookie even if token revocation fails
    try {
      await destroySession()
    } catch {
      // Best effort
    }
    return NextResponse.json({ status: 'success' })
  }
}
