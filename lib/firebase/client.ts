import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

// Only initialize if we have a real API key
let auth = null as ReturnType<typeof getAuth> | null
let googleProvider = null as GoogleAuthProvider | null

if (firebaseConfig.apiKey && typeof window !== 'undefined') {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
}

export function getFirebaseAuth() {
  if (!auth || !googleProvider) {
    // Lazy init for client-side when module was loaded at build time
    if (firebaseConfig.apiKey && typeof window !== 'undefined') {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
      auth = getAuth(app)
      googleProvider = new GoogleAuthProvider()
    } else {
      throw new Error('Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.')
    }
  }
  return { auth, googleProvider }
}
