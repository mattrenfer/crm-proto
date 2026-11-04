'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/lib/schemas'

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

    const handleSubmit = async (data: LoginFormData) => {
        setError(null)
        setLoading(true)

        try {
            const supabase = createClient()
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (authError) {
                // Handle Supabase auth errors
                if (authError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please try again.')
                } else if (authError.message.includes('Email not confirmed')) {
                    setError('Please confirm your email before logging in.')
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
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                        Sign in to your account
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg">
                    <form className="space-y-6" onSubmit={handleSubmitLogin(handleSubmit)}>
                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
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
                                {...registerLogin('email')}
                                type="email"
                                autoComplete="email"
                                autoFocus
                                disabled={loading}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="you@example.com"
                            />
                            {loginErrors && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {loginErrors.email?.message}
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
                                {...registerLogin('password')}
                                type="password"
                                autoComplete="current-password"
                                disabled={loading}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                            />
                            {loginErrors && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {loginErrors.password?.message}
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
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}
