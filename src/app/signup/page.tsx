'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import { buttonClass, errorClass, inputClass, labelClass } from '@/lib/formStyles'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, SignupFormData } from '@/lib/schemas'
import { TURNSTILE_FAILED_MESSAGE, useTurnstile } from '@/lib/useTurnstile'

/**
 * SignUp page - allows users to sign up with email and password.
 *
 * Features:
 * - Controlled form inputs with validation
 * - Loading state during authentication
 * - Error handling with user-friendly messages
 * - Redirects home if confirmation is off; otherwise shows a check-your-email message
 */
export default function SignUpPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [checkEmail, setCheckEmail] = useState<string | null>(null)
    const turnstile = useTurnstile()

    const {
        register: registerSignup,
        handleSubmit: handleSubmitSignup,
        formState: { errors: signupErrors },
    } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

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
    }, [])

    const handleSubmit = async (data: SignupFormData) => {
        setError(null)
        setLoading(true)

        try {
            // Supabase refuses a sign-up without a CAPTCHA token. If the check failed, the form already says so.
            const captchaToken = await turnstile.getToken()
            if (!captchaToken) return

            const supabase = createClient()
            const { data: signUpData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: { captchaToken },
            })

            if (authError) {
                console.error('Sign up error:', authError)
                if (authError.code === 'user_already_exists') {
                    setError('Email already in use. Please use a different email.')
                } else if (authError.code === 'over_email_send_rate_limit') {
                    setError('Too many sign-up attempts right now. Please try again in a little while.')
                } else if (authError.code === 'captcha_failed') {
                    setError(TURNSTILE_FAILED_MESSAGE)
                } else {
                    setError('Unable to sign up. Please try again.')
                }
                return
            }

            if (signUpData.session) {
                // Success! Redirect to home page
                window.location.assign('/')
            } else {
                setCheckEmail(data.email)
            }
        } catch (err) {
            console.error('Sign up error:', err)
            setError('Unable to connect. Please check your internet connection.')
        } finally {
            turnstile.reset() // a token works once, so get a fresh one for the next try
            setLoading(false)
        }
    }

    return (
        <AuthLayout showDemo>
            {checkEmail ? (
                <>
                    <h1 className="font-display text-2xl">Check your email!</h1>
                    <p role="status" aria-live="polite" className="mt-5">
                        We sent a confirmation email to <span className="font-semibold">{checkEmail}</span>.
                    </p>
                    <p className="mt-3">Please click the link in the email to confirm your account.</p>
                    <p className="mt-5">
                        <Link href="/login" className="font-semibold underline underline-offset-4 hover:text-accent">
                            Sign in to your account
                        </Link>
                    </p>
                </>
            ) : (
                <>
                    <h1 className="font-display text-2xl">Create an account</h1>

                    <form className="mt-5 flex flex-col gap-5" onSubmit={handleSubmitSignup(handleSubmit)}>
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
                                type="email"
                                autoComplete="email"
                                autoFocus
                                {...registerSignup('email')}
                                disabled={loading}
                                className={inputClass}
                            />
                            {signupErrors.email && <p className={errorClass}>{signupErrors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Password
                            </label>
                            <input
                                id="password"
                                {...registerSignup('password')}
                                type="password"
                                autoComplete="new-password"
                                disabled={loading}
                                className={inputClass}
                            />
                            {signupErrors.password && <p className={errorClass}>{signupErrors.password.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className={labelClass}>
                                Confirm password
                            </label>
                            <input
                                id="confirm-password"
                                {...registerSignup('confirmPassword')}
                                type="password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
                                className={inputClass}
                            />
                            {signupErrors.confirmPassword && (
                                <p className={errorClass}>{signupErrors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Empty while the check runs invisibly; a challenge would appear here if one were ever needed */}
                        <div ref={turnstile.ref} />
                        {turnstile.failed && (
                            <p role="alert" className="text-danger">
                                {TURNSTILE_FAILED_MESSAGE} You can still try the demo.
                            </p>
                        )}

                        <button type="submit" disabled={loading} className={`${buttonClass} w-full`}>
                            {loading ? 'Creating your account...' : 'Create an account'}
                        </button>
                    </form>

                    <p className="mt-5">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold underline underline-offset-4 hover:text-accent">
                            Sign in
                        </Link>
                    </p>
                </>
            )}
        </AuthLayout>
    )
}
