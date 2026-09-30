import { NextRequest, NextResponse } from 'next/server'
import { createSession, getCurrentUser } from '@/lib/firebase/auth'
import { adminAuth, adminApp } from '@/lib/firebase/admin'

// ── GET /api/auth/session ─────────────────────────────────────
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.name,
        photoURL: user.picture,
      },
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}

// ── POST /api/auth/session ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: ID token is required' },
        { status: 400 }
      )
    }

    let uid = ''
    let email = ''
    let name = ''
    let picture = ''

    // If Admin SDK credentials are provided, perform cryptographic verification
    if (adminApp && adminAuth) {
      const decoded = await adminAuth.verifyIdToken(idToken)
      if (!decoded) {
        return NextResponse.json(
          { error: 'Authentication failed: Invalid token' },
          { status: 401 }
        )
      }
      uid = decoded.uid
      email = decoded.email || ''
      name = decoded.name || ''
      picture = decoded.picture || ''
    } else {
      // Decode JWT payload for dev environments where Admin credentials are not yet set
      const parts = idToken.split('.')
      if (parts.length >= 2) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = Buffer.from(base64, 'base64').toString('utf8')
        const payload = JSON.parse(json)
        uid = payload.sub || payload.user_id || ''
        email = payload.email || ''
        name = payload.name || payload.email?.split('@')[0] || 'User'
        picture = payload.picture || ''
      }
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'Authentication failed: Could not determine user' },
        { status: 401 }
      )
    }

    // Create server-managed session cookie
    await createSession(idToken)

    return NextResponse.json({
      status: 'success',
      user: {
        uid,
        email,
        name,
        picture,
      },
    })
  } catch (error) {
    console.error('[auth/session] Session creation failed:', error)
    return NextResponse.json(
      { error: 'Something went wrong while creating the session.' },
      { status: 500 }
    )
  }
}
