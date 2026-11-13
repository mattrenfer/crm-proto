import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

/**
 * POST /api/demo
 *
 * The "Try the demo" starburst posts here.
 * This runs only on the server, so the demo password never reaches the browser.
 * It signs the visitor in as the demo account, then sends them to the dashboard.
 *
 * WHY THE SERVICE ROLE KEY:
 * Supabase requires a CAPTCHA token on every password sign-in. The demo has to work for
 * everyone, including visitors Cloudflare is unsure about, so it skips CAPTCHA the one way
 * Supabase allows: a request made with the service role key. That key is read here, in a
 * server route, and nowhere else. It's used for this one sign-in, to an account we own,
 * with nothing from the visitor in the request. The session it returns is an ordinary
 * signed-in session, limited by RLS like any other.
 */

export async function POST(request: NextRequest) {
    // No NEXT_PUBLIC_ prefix on any of these, so they never reach the browser
    const { DEMO_EMAIL, DEMO_PASSWORD, SUPABASE_SERVICE_ROLE_KEY } = process.env

    if (!DEMO_EMAIL || !DEMO_PASSWORD || !SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.redirect(new URL('/login?demo=unavailable', request.url), 303)
    }

    // A one-off client: it keeps nothing between requests and never refreshes on its own
    const admin = createSupabaseClient(env.supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error: authError } = await admin.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
    })

    if (authError || !data.session) {
        console.error('Demo sign-in error:', authError)
        return NextResponse.redirect(new URL('/login?demo=unavailable', request.url), 303)
    }

    // Hand the session to the normal cookie-based client, which saves it in the visitor's cookies
    const supabase = await createClient()
    const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
    })

    if (sessionError) {
        console.error('Demo session error:', sessionError)
        return NextResponse.redirect(new URL('/login?demo=unavailable', request.url), 303)
    }

    return NextResponse.redirect(new URL('/', request.url), 303)
}
