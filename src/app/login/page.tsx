'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import { buttonClass, errorClass, inputClass, labelClass } from '@/lib/formStyles'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/lib/schemas'
import { TURNSTILE_FAILED_MESSAGE, useTurnstile } from '@/lib/useTurnstile'

/**
 * Login page - allows users to sign in with email and password.
 *
 * Features:
 * - Controlled form inputs with validation
 * - Loading state during authentication
 * - Error handling with user-friendly messages
 * - Redirects to home page on success
 * - Redirects if already logged in
 */
export default function LoginPage() {
    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    // Sign-in needs a CAPTCHA token too: Supabase checks it on every password sign-in.
    // The demo button doesn't use this; its server route signs in another way.
    const turnstile = useTurnstile()

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (session) {
                // Already logged in, redirect to home
                window.location.assign('/')
            }
        }

        checkUser()

        // The demo route sends visitors back here with ?demo=unavailable if it couldn't sign in
        if (new URLSearchParams(window.location.search).get('demo') === 'unavailable') {
            setError('The demo account is unavailable right now. Please try again later.')
        }
    }, [])

    const handleSubmit = async (data: LoginFormData) => {
        setError(null)
        setLoading(true)

        try {
            const captchaToken = await turnstile.getToken()
            if (!captchaToken) return

            const supabase = createClient()
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
                options: { captchaToken },
            })

            if (authError) {
                // Handle Supabase auth errors
                if (authError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please try again.')
                } else if (authError.message.includes('Email not confirmed')) {
                    setError('Please confirm your email before logging in.')
                } else if (authError.code === 'captcha_failed') {
                    setError(TURNSTILE_FAILED_MESSAGE)
                } else {
                    setError('An error occurred during login. Please try again.')
                }
                return
            }

            // Success! Redirect to home page
            window.location.assign('/')
        } catch (err) {
            console.error('Login error:', err)
            setError('Unable to connect. Please check your internet connection.')
        } finally {
            turnstile.reset() // a token works once, so get a fresh one for the next try
            setLoading(false)
        }
    }

    return (
        <AuthLayout showDemo>
            <h1 className="font-display text-2xl">Sign in</h1>

            <form className="mt-5 flex flex-col gap-5" onSubmit={handleSubmitLogin(handleSubmit)}>
                {error && (
                    <p role="alert" className="text-danger">
                        {error}
                    </p>
                )}

                <div>
                    <label htmlFor="email" className={labelClass}>
                        Email address
                    </label>
                    <input
                        id="email"
                        {...registerLogin('email')}
                        type="email"
                        autoComplete="email"
                        autoFocus
                        disabled={loading}
                        className={inputClass}
                    />
                    {loginErrors.email && <p className={errorClass}>{loginErrors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password" className={labelClass}>
                        Password
                    </label>
                    <input
                        id="password"
                        {...registerLogin('password')}
                        type="password"
                        autoComplete="current-password"
                        disabled={loading}
                        className={inputClass}
                    />
                    {loginErrors.password && <p className={errorClass}>{loginErrors.password.message}</p>}
                    <p className="mt-2">
                        <Link href="/forgot-password" className="underline underline-offset-4 hover:text-accent">
                            Forgot your password?
                        </Link>
                    </p>
                </div>

                {/* Empty while the check runs invisibly; a challenge would appear here if one were ever needed */}
                <div ref={turnstile.ref} />
                {turnstile.failed && (
                    <p role="alert" className="text-danger">
                        {TURNSTILE_FAILED_MESSAGE} You can still try the demo.
                    </p>
                )}

                <button type="submit" disabled={loading} className={`${buttonClass} w-full`}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-5">
                New here?{' '}
                <Link href="/signup" className="font-semibold underline underline-offset-4 hover:text-accent">
                    Create an account
                </Link>
            </p>
        </AuthLayout>
    )
}
