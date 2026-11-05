'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, SignupFormData } from '@/lib/schemas'

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
            const supabase = createClient()
            const { data: signUpData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            })

            if (authError) {
                console.error('Sign up error:', authError)
                if (authError.code === 'user_already_exists') {
                    setError('Email already in use. Please use a different email.')
                } else if (authError.code === 'over_email_send_rate_limit') {
                    setError('Too many sign-up attempts right now. Please try again in a little while.')
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
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8">
                {checkEmail ? (
                    <>
                        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                            Check your email!
                        </h1>
                        <p
                            role="status"
                            aria-live="polite"
                            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            We sent a confirmation email to{' '}
                            <span className="font-medium text-blue-600 dark:text-blue-400">{checkEmail}</span>.
                        </p>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Please click the link in the email to confirm your account.
                        </p>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            <Link
                                href="/login"
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Sign in to your account
                            </Link>
                        </p>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Sign Up</h1>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                Or{' '}
                                <Link
                                    href="/login"
                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    sign in to your account
                                </Link>
                            </p>
                        </div>

                        {/* Form Card */}

                        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg">
                            <form className="space-y-6" onSubmit={handleSubmitSignup(handleSubmit)}>
                                {/* Error Display */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                                    >
                                        {error}
                                    </div>
                                )}

                                {/* Email Input */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        autoFocus
                                        {...registerSignup('email')}
                                        disabled={loading}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="you@example.com"
                                    />
                                    {signupErrors && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {signupErrors.email?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        {...registerSignup('password')}
                                        type="password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••"
                                    />
                                    {signupErrors && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {signupErrors.password?.message}
                                        </p>
                                    )}
                                </div>

                                {/* ConfirmPassword Input */}
                                <div>
                                    <label
                                        htmlFor="confirm-password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirm-password"
                                        {...registerSignup('confirmPassword')}
                                        type="password"
                                        autoComplete="confirm-password"
                                        required
                                        disabled={loading}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••"
                                    />
                                    {signupErrors && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {signupErrors.confirmPassword?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        {loading ? 'Signing up...' : 'Sign Up'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
