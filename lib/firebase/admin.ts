import 'server-only'

import { initializeApp, getApps, cert, getApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function createAdminApp(): App | null {
  if (getApps().length) return getApp()

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  // Gracefully skip initialization when credentials are not configured
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '[firebase-admin] Missing credentials — admin features disabled. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local'
    )
    return null
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  })
}

const adminApp = createAdminApp()

// These will throw if adminApp is null, but auth.ts guards against that
const adminAuth = adminApp ? getAuth(adminApp) : (null as unknown as ReturnType<typeof getAuth>)
const adminDb = adminApp ? getFirestore(adminApp) : (null as unknown as ReturnType<typeof getFirestore>)

export { adminApp, adminAuth, adminDb }
