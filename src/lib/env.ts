import { z } from 'zod'

/**
 * Validated environment variables. Import `env` instead of reading process.env directly.
 *
 * WHY:
 * - Fails fast with a readable message when .env.local is missing or incomplete,
 *   instead of a confusing Supabase error at runtime
 * - next.config.ts imports this file, so `npm run dev` / `npm run build` (and Vercel builds)
 *   stop before anything runs with bad config
 * - Refuses a service role / secret key: it bypasses RLS, and anything in NEXT_PUBLIC_*
 *   is copied into the browser bundle where anyone can read it
 *
 * GOTCHA: Next.js only inlines NEXT_PUBLIC_* values into browser code when the full name
 * is written out (process.env.NEXT_PUBLIC_SUPABASE_URL). Passing process.env itself
 * to zod would give an empty object in the browser.
 */

const SETUP_HINT =
    'Copy .env.local.example to .env.local and fill it in from Supabase Dashboard > Project Settings > API.'

// Old-style keys are JWTs with a "role" claim; new-style secret keys start with sb_secret_
function isSecretKey(key: string) {
    if (key.startsWith('sb_secret_')) return true
    const payload = key.split('.')[1]
    if (!payload) return false
    try {
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(json).role === 'service_role'
    } catch {
        return false
    }
}

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(`NEXT_PUBLIC_SUPABASE_URL is missing or not a valid URL. ${SETUP_HINT}`),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z
        .string(`NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. ${SETUP_HINT}`)
        .min(1, `NEXT_PUBLIC_SUPABASE_ANON_KEY is empty. ${SETUP_HINT}`)
        .refine(
            (key) => !key.startsWith('your_'),
            `NEXT_PUBLIC_SUPABASE_ANON_KEY still has the template placeholder. ${SETUP_HINT}`,
        )
        .refine(
            (key) => !isSecretKey(key),
            'NEXT_PUBLIC_SUPABASE_ANON_KEY is a service role / secret key. It bypasses Row Level Security and must never be public. Use the anon (publishable) key instead.',
        ),
})

const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

if (!result.success) {
    const messages = result.error.issues.map((issue) => `  - ${issue.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${messages}`)
}

export const env = {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}
