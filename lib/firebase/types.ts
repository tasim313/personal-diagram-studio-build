/**
 * Shared type definitions for authentication.
 * Safe to import from both client and server components.
 */

export type SessionUser = {
  uid: string
  email: string
  name: string
  picture: string
}
