import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Creates a Supabase client for use in Next.js Middleware.
 *
 * USE THIS WHEN:
 * - You're in middleware.ts
 * - You need to check auth BEFORE page renders
 * - You need to redirect unauthenticated users
 * - You need to refresh expired tokens
 *
 * HOW IT WORKS:
 * - Runs on Vercel Edge (faster, but limited Node.js APIs)
 * - Can both READ and WRITE cookies
 * - Intercepts every request before it reaches your pages
 * - Can modify the response (redirect, set headers, etc.)
 *
 * WHY IT'S DIFFERENT:
 * - Must manually pass cookies from request to response
 * - Returns BOTH the Supabase client AND the response object
 * - Response object contains any cookie updates (token refresh)
 * - MUST return the response from middleware or cookie updates are lost
 *
 * WHEN TOKENS GET REFRESHED:
 * - access_token expires after 1 hour
 * - When you call supabase.auth.getUser(), it checks if expired
 * - If expired, uses refresh_token to get a new access_token
 * - New token gets written to cookies via the response object
 *
 * EXAMPLE:
 * ```typescript
 * // middleware.ts
 * import { createClient } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   const { supabase, response } = createClient(request)
 *
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 *   if (!user && request.nextUrl.pathname !== '/login') {
 *     return NextResponse.redirect(new URL('/login', request.url))
 *   }
 *
 *   return response // IMPORTANT: Return this response, not NextResponse.next()
 * }
 * ```
 */
export function createClient(request: NextRequest) {
  // Create a response object to pass through
  // This will collect any cookie changes (like token refresh)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the incoming request
        getAll() {
          return request.cookies.getAll()
        },
        // Write cookies to the outgoing response
        setAll(cookiesToSet) {
          // Update the response object with new cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })

          // ALSO create a new response to return
          // This ensures the cookies are properly set
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  return { supabase, response }
}
