'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import { buttonClass, errorClass, inputClass, labelClass } from '@/lib/formStyles'
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
        <AuthLayout>
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
                </div>

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
