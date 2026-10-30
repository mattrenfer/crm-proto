import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Auth helper functions for common authentication operations.
 *
 * These functions abstract away the complexity of choosing the right Supabase client.
 * They use the browser client for write operations (signup, signin, signout)
 * and the server client for read operations (getSession, getUser).
 */

/**
 * Sign up a new user with email and password.
 *
 * IMPORTANT: This must be called from a Client Component ('use client')
 * because it writes authentication cookies.
 *
 * @param email - User's email address
 * @param password - User's password (min 6 characters based on Supabase settings)
 * @returns Supabase auth response with user and session, or error
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signUp } from '@/lib/auth'
 *
 * async function handleSignup() {
 *   const { data, error } = await signUp('user@example.com', 'password123')
 *   if (error) {
 *     console.error('Signup failed:', error.message)
 *   } else {
 *     console.log('User created:', data.user)
 *   }
 * }
 * ```
 */
export async function signUp(email: string, password: string) {
    const supabase = createBrowserClient()
    return await supabase.auth.signUp({
        email,
        password,
    })
}

/**
 * Sign in an existing user with email and password.
 *
 * IMPORTANT: This must be called from a Client Component ('use client')
 * because it writes authentication cookies.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Supabase auth response with user and session, or error
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signIn } from '@/lib/auth'
 *
 * async function handleLogin() {
 *   const { data, error } = await signIn('user@example.com', 'password123')
 *   if (error) {
 *     console.error('Login failed:', error.message)
 *   } else {
 *     console.log('Logged in:', data.user)
 *   }
 * }
 * ```
 */
export async function signIn(email: string, password: string) {
    const supabase = createBrowserClient()
    return await supabase.auth.signInWithPassword({
        email,
        password,
    })
}

/**
 * Sign out the current user.
 *
 * IMPORTANT: This must be called from a Client Component ('use client')
 * because it clears authentication cookies.
 *
 * @returns Supabase auth response, or error
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signOut } from '@/lib/auth'
 *
 * async function handleLogout() {
 *   const { error } = await signOut()
 *   if (error) {
 *     console.error('Logout failed:', error.message)
 *   } else {
 *     // Redirect to login page
 *     window.location.href = '/login'
 *   }
 * }
 * ```
 */
export async function signOut() {
    const supabase = createBrowserClient()
    return await supabase.auth.signOut()
}

/**
 * Get the current session (includes access_token and refresh_token).
 *
 * This can be called from Server Components, Server Actions, or API routes.
 * It reads the session from cookies without making a network request.
 *
 * NOTE: Use getUser() instead if you want to verify the token is still valid.
 *
 * @returns Supabase session response with tokens, or null if not logged in
 *
 * @example
 * ```tsx
 * // app/dashboard/page.tsx (Server Component)
 * import { getSession } from '@/lib/auth'
 *
 * export default async function Dashboard() {
 *   const { data: { session } } = await getSession()
 *   if (!session) {
 *     redirect('/login')
 *   }
 *   return <div>Welcome back!</div>
 * }
 * ```
 */
export async function getSession() {
    const supabase = await createServerClient()
    return await supabase.auth.getSession()
}

/**
 * Get the current user by verifying the JWT token.
 *
 * This can be called from Server Components, Server Actions, or API routes.
 * It makes a network request to verify the token is still valid.
 *
 * PREFER THIS over getSession() when you need to ensure the user is authenticated,
 * because it validates the token server-side.
 *
 * @returns Supabase user response with user data, or null if not logged in/invalid token
 *
 * @example
 * ```tsx
 * // app/dashboard/page.tsx (Server Component)
 * import { getUser } from '@/lib/auth'
 *
 * export default async function Dashboard() {
 *   const { data: { user } } = await getUser()
 *   if (!user) {
 *     redirect('/login')
 *   }
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export async function getUser() {
    const supabase = await createServerClient()
    return await supabase.auth.getUser()
}
