import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // This function runs on EVERY request

    const { supabase, response } = createClient(request)

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Signed-out pages: signed-in users get sent to the dashboard instead
    const publicRoutes = ['/login', '/signup', '/forgot-password']
    const isPublicRoute = publicRoutes.includes(pathname)

    // The reset link signs the user in before they choose a new password, so this page
    // has to work both signed out (arriving) and signed in (after the code is swapped)
    if (pathname === '/reset-password') {
        return response
    }

    // Dev routes - accessible in development but blocked in production
    const isDevRoute = pathname.startsWith('/dev')

    // Block dev routes in production
    if (isDevRoute && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Allow dev routes without auth in development
    if (isDevRoute && process.env.NODE_ENV !== 'production') {
        return response
    }

    if (!isPublicRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    } else if (isPublicRoute && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

// Why this regex?
// - Without this, middleware runs on EVERY request, including:
//   - _next/static/... (JavaScript bundles)
//   - _next/image/... (optimized images)
//   - favicon.ico
//   - Your images (.png, .jpg, etc.)
// - This would cause hundreds of auth checks per page load!
// - The matcher says: "Run on everything EXCEPT those files"
