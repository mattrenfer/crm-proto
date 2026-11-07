'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import AuthLayout from '@/components/AuthLayout'
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/schemas'
import { buttonClass, errorClass, inputClass, labelClass } from '@/lib/formStyles'

/**
 * Reset password: where the emailed link lands.
 *
 * The link carries a one-time code. Swapping it for a session signs the user in,
 * and then they can set a new password. The swap only works in the browser that asked
 * for the email, because it checks a secret saved there at that time (PKCE).
 */
export default function ResetPasswordPage() {
    const [linkState, setLinkState] = useState<'checking' | 'ready' | 'invalid'>('checking')
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) })

    useEffect(() => {
        const checkLink = async () => {
            const supabase = createClient()
            const code = new URLSearchParams(window.location.search).get('code')

            if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
                if (exchangeError) {
                    console.error('Reset link error:', exchangeError)
                    setLinkState('invalid')
                    return
                }
                // Drop the used code from the address bar, so a refresh doesn't try it again
                window.history.replaceState(null, '', '/reset-password')
                setLinkState('ready')
                return
            }

            // No code: only continue if the link was already used to sign in on this page
            const {
                data: { session },
            } = await supabase.auth.getSession()
            setLinkState(session ? 'ready' : 'invalid')
        }

        checkLink()
    }, [])

    const onSubmit = async (data: ResetPasswordFormData) => {
        setError(null)
        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({ password: data.password })

        if (updateError) {
            console.error('Password update error:', updateError)
            if (updateError.code === 'same_password') {
                setError('That is your current password. Please choose a new one.')
            } else if (updateError.code === 'weak_password') {
                setError('That password is too easy to guess. Please choose a stronger one.')
            } else {
                setError('Unable to update your password. Please try again.')
            }
            return
        }

        window.location.assign('/')
    }

    return (
        <AuthLayout>
            {linkState === 'checking' && <p role="status">Checking your link...</p>}

            {linkState === 'invalid' && (
                <>
                    <h1 className="font-display text-2xl">This link didn&apos;t work</h1>
                    <p className="mt-5">
                        Reset links expire, work once, and need to be opened in the browser you asked from.
                    </p>
                    <p className="mt-5">
                        <Link
                            href="/forgot-password"
                            className="font-semibold underline underline-offset-4 hover:text-accent"
                        >
                            Send a new link
                        </Link>
                    </p>
                </>
            )}

            {linkState === 'ready' && (
                <>
                    <h1 className="font-display text-2xl">Choose a new password</h1>

                    <form className="mt-5 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <p role="alert" className="text-danger">
                                {error}
                            </p>
                        )}

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                New password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                autoFocus
                                {...register('password')}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className={labelClass}>
                                Confirm new password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                {...register('confirmPassword')}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                            {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className={`${buttonClass} w-full`}>
                            {isSubmitting ? 'Saving...' : 'Save new password'}
                        </button>
                    </form>
                </>
            )}
        </AuthLayout>
    )
}
