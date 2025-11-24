import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components and Server Actions.
 *
 * USE THIS WHEN:
 * - Component does NOT have 'use client' (default in App Router)
 * - You're fetching data on the server (async components)
 * - You're in a Server Action (functions with 'use server')
 * - You're in an API route handler
 *
 * HOW IT WORKS:
 * - Reads auth tokens from cookies using Next.js cookies() API
 * - Can verify who's logged in on the server
 * - Can't write cookies (auth actions must happen client-side)
 * - Has access to Node.js APIs and environment
 *
 * WHY THE COMPLEXITY:
 * - Next.js 15 made cookies() async (was sync in Next.js 14)
 * - Server can't access browser APIs (localStorage, window, etc.)
 * - We need to explicitly tell Supabase how to read cookies
 *
 * EXAMPLE:
 * ```tsx
 * // app/dashboard/page.tsx (Server Component)
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function DashboardPage() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   if (!user) redirect('/login')
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export async function createClient() {
  // Next.js 15: cookies() is now async and must be awaited
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Tell Supabase how to read cookies in server context
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll can be called from Server Components, which can't write cookies
            // Ignore error - cookie writing will be handled by client-side auth
          }
        },
      },
    }
  )
}
