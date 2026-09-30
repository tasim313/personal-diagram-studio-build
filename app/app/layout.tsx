import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/firebase/auth'
import { AuthProvider } from '@/components/auth/AuthProvider'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  return <AuthProvider user={user}>{children}</AuthProvider>
}
