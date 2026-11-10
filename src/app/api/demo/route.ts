import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/demo
 *
 * The "Look around with the demo account" button on the sign-in page posts here.
 * This runs only on the server, so the demo password never reaches the browser.
 * It signs the visitor in as the demo account, then sends them to the dashboard.
 */

export async function POST(request: NextRequest) {
    // destructure from process.env
    const { DEMO_EMAIL, DEMO_PASSWORD } = process.env

    if (!DEMO_EMAIL || !DEMO_PASSWORD) {
        return NextResponse.redirect(new URL('/login?demo=unavailable', request.url), 303)
    }

    const supabase = await createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
    })

    if (authError) {
        console.error('Error:', authError)
        return NextResponse.redirect(new URL('/login?demo=unavailable', request.url), 303)
    }

    return NextResponse.redirect(new URL('/', request.url), 303)
}
