'use client'

import { Suspense, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Diamond, ArrowLeft, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function EmailAuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (mode === 'signUp') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    try {
      setLoading(true)
      const { auth } = getFirebaseAuth()
      if (!auth) {
        throw new Error('Firebase Auth is not initialized. Check client configuration.')
      }

      let userCredential

      if (mode === 'signIn') {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      }

      const idToken = await userCredential.user.getIdToken()

      // Create secure server session
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Session creation failed (HTTP ${res.status})`)
      }

      setSuccessMessage(mode === 'signIn' ? 'Signed in successfully! Redirecting...' : 'Account created! Redirecting...')

      // Navigate to protected destination
      const redirect = searchParams.get('redirect') || '/app/dashboard'
      router.push(redirect)
      router.refresh()
    } catch (err: unknown) {
      console.error('[email-auth] Error:', err)
      const firebaseCode = (err as { code?: string })?.code || ''
      const rawMessage = err instanceof Error ? err.message : String(err)

      if (
        firebaseCode === 'auth/invalid-credential' ||
        firebaseCode === 'auth/wrong-password' ||
        firebaseCode === 'auth/user-not-found'
      ) {
        setError('Incorrect email or password. Please verify and try again.')
      } else if (firebaseCode === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please switch to Sign In.')
      } else if (firebaseCode === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.')
      } else if (firebaseCode === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (firebaseCode === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in is not enabled in Firebase Console. Go to Firebase Console → Authentication → Sign-in method → enable "Email/Password".'
        )
      } else if (firebaseCode === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to multiple failed attempts. Please try again later.')
      } else {
        setError(rawMessage || 'Authentication failed. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-700 transition"
        >
          <ArrowLeft className="size-3.5" />
          Back to Home
        </Link>

        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-600 shadow-sm shadow-red-600/20">
            <Diamond className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Visual Engineering Studio
            </p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
              Enterprise
            </span>
          </div>
        </div>

        {/* Header */}
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
          {mode === 'signIn' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          {mode === 'signIn'
            ? 'Sign in with your email and password'
            : 'Enter your details below to get started'}
        </p>

        {/* Mode Switcher Tabs */}
        <div className="mt-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => {
              setMode('signIn')
              setError(null)
            }}
            className={`rounded-md py-2 transition ${
              mode === 'signIn'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signUp')
              setError(null)
            }}
            className={`rounded-md py-2 transition ${
              mode === 'signUp'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {mode === 'signUp' && (
              <p className="mt-1 text-[11px] text-gray-400">At least 6 characters</p>
            )}
          </div>

          {mode === 'signUp' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{mode === 'signIn' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{mode === 'signIn' ? 'Sign In with Email' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
          Protected by enterprise security.
          <br />
          HttpOnly cookies · End-to-end encryption.
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <EmailAuthForm />
    </Suspense>
  )
}
