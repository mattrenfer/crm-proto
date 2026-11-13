'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { env } from '@/lib/env'

/**
 * Cloudflare Turnstile, the CAPTCHA Supabase checks on sign-up, sign-in and password reset.
 *
 * The widget is set to Invisible in Cloudflare, so people never see or click anything:
 * it checks the browser in the background and hands back a token. Supabase sends that
 * token to Cloudflare to confirm it, using the secret key saved in the Supabase dashboard.
 *
 * HOW A FORM USES IT:
 *   const turnstile = useTurnstile()
 *   <div ref={turnstile.ref} />                          // where a challenge would go, if one ever shows
 *   const token = await turnstile.getToken()            // on submit; waits if the check is still running
 *   supabase.auth.signUp({ ..., options: { captchaToken: token } })
 *   turnstile.reset()                                   // tokens work once, so get a fresh one after each try
 */

// The parts of Cloudflare's script this file uses
type TurnstileApi = {
    render: (
        container: HTMLElement,
        options: {
            sitekey: string
            callback: (token: string) => void
            'error-callback': () => void
            'expired-callback': () => void
            theme: 'auto'
            size: 'flexible'
        },
    ) => string
    reset: (widgetId: string) => void
    remove: (widgetId: string) => void
}

declare global {
    interface Window {
        turnstile?: TurnstileApi
    }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const LOAD_TIMEOUT_MS = 10_000
const TOKEN_WAIT_MS = 10_000

// Load Cloudflare's script once per page, however many forms ask for it
let scriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
    if (window.turnstile) return Promise.resolve(window.turnstile)
    if (scriptPromise) return scriptPromise

    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = SCRIPT_URL
        script.async = true
        const timer = setTimeout(() => reject(new Error('Turnstile took too long to load')), LOAD_TIMEOUT_MS)
        script.onload = () => {
            clearTimeout(timer)
            if (window.turnstile) resolve(window.turnstile)
            else reject(new Error('Turnstile loaded without its API'))
        }
        script.onerror = () => {
            clearTimeout(timer)
            reject(new Error('Turnstile failed to load'))
        }
        document.head.appendChild(script)
    }).catch((err) => {
        scriptPromise = null // let a later page try again
        throw err
    })

    return scriptPromise
}

export function useTurnstile() {
    const ref = useRef<HTMLDivElement>(null)
    const widgetId = useRef<string | null>(null)
    const token = useRef<string | null>(null)
    // Submits that arrived before the token did, waiting for it
    const waiting = useRef<((token: string | null) => void)[]>([])
    // Shown to the person, so it's state; the token isn't shown, so it stays in a ref
    const [failed, setFailed] = useState(false)

    const settle = useCallback((value: string | null) => {
        token.current = value
        waiting.current.splice(0).forEach((resolve) => resolve(value))
    }, [])

    useEffect(() => {
        let cancelled = false

        loadTurnstile()
            .then((turnstile) => {
                if (cancelled || !ref.current) return
                widgetId.current = turnstile.render(ref.current, {
                    sitekey: env.turnstileSiteKey,
                    callback: (value) => {
                        setFailed(false)
                        settle(value)
                    },
                    'error-callback': () => {
                        setFailed(true)
                        settle(null)
                    },
                    // Tokens expire after a few minutes; Turnstile fetches a new one by itself
                    'expired-callback': () => {
                        token.current = null
                    },
                    // Only matters if the widget mode is ever switched from Invisible to Managed
                    theme: 'auto',
                    size: 'flexible',
                })
            })
            .catch(() => {
                if (cancelled) return
                setFailed(true)
                settle(null)
            })

        return () => {
            cancelled = true
            if (widgetId.current) window.turnstile?.remove(widgetId.current)
            widgetId.current = null
        }
    }, [settle])

    /**
     * The current token, or waits for one. Resolves to null if the check failed or took too long,
     * and then `failed` is true, so the form shows TURNSTILE_FAILED_MESSAGE in place of a broken submit.
     */
    const getToken = useCallback((): Promise<string | null> => {
        if (token.current) return Promise.resolve(token.current)
        if (failed) return Promise.resolve(null)
        return new Promise((resolve) => {
            waiting.current.push(resolve)
            setTimeout(() => {
                if (token.current) return
                setFailed(true) // so the form shows the message
                settle(null)
            }, TOKEN_WAIT_MS)
        })
    }, [failed, settle])

    /** Throws away the used token and starts a fresh check in the background. */
    const reset = useCallback(() => {
        token.current = null
        if (widgetId.current) window.turnstile?.reset(widgetId.current)
    }, [])

    return { ref, failed, getToken, reset }
}

// One message for every form, so a failed check always reads the same way
export const TURNSTILE_FAILED_MESSAGE =
    "We couldn't check your browser just now. Please refresh the page and try again."
