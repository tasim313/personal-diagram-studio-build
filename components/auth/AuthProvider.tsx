'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SessionUser } from '@/lib/firebase/types'

const AuthContext = createContext<SessionUser | null>(null)

export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser
  children: ReactNode
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth(): SessionUser {
  const user = useContext(AuthContext)
  if (!user) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return user
}
