import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components (browser context).
 *
 * USE THIS WHEN:
 * - Component has 'use client' directive
 * - You need interactivity (onClick, onChange, etc.)
 * - You're calling auth methods from user actions (login, signup, logout)
 *
 * HOW IT WORKS:
 * - Stores auth tokens in cookies (accessible by both client and server)
 * - Automatically refreshes tokens when they expire
 * - Can access browser APIs (localStorage, window, etc.)
 *
 * EXAMPLE:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * function LoginButton() {
 *   const supabase = createClient()
 *   const handleLogin = async () => {
 *     await supabase.auth.signInWithPassword({ email, password })
 *   }
 *   return <button onClick={handleLogin}>Login</button>
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
