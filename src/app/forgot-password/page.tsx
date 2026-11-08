'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import AuthLayout from '@/components/AuthLayout'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/schemas'
import { buttonClass, errorClass, inputClass, labelClass } from '@/lib/formStyles'

/**
 * Forgot password: asks for an email and sends a reset link.
 *
 * The success message is the same whether or not an account exists for that email,
 * so this page can't be used to find out who has an account (account enumeration).
 */
export default function ForgotPasswordPage() {
    const [sentTo, setSentTo] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setError(null)
        const supabase = createClient()
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
            // Must be listed under Redirect URLs in Supabase, or the link falls back to the Site URL
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (resetError) {
            console.error('Password reset error:', resetError)
            if (resetError.code === 'over_email_send_rate_limit') {
                setError('A link was sent a moment ago. Please wait a minute before asking for another.')
            } else {
                setError('Unable to send the email. Please try again.')
            }
            return
        }

        setSentTo(data.email)
    }

    return (
        <AuthLayout>
            {sentTo ? (
                <>
                    <h1 className="font-display text-2xl">Check your email</h1>
                    <p role="status" aria-live="polite" className="mt-5">
                        If there&apos;s an account for <span className="font-semibold">{sentTo}</span>, we sent a link
                        to reset your password.
                    </p>
                    <p className="mt-3">Open it in this browser to continue.</p>
                </>
            ) : (
                <>
                    <h1 className="font-display text-2xl">Reset your password</h1>
                    <p className="mt-3">Enter your email and we&apos;ll send you a link.</p>

                    <form className="mt-5 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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
                                {...register('email')}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className={`${buttonClass} w-full`}>
                            {isSubmitting ? 'Sending...' : 'Send the link'}
                        </button>
                    </form>
                </>
            )}

            <p className="mt-5">
                <Link href="/login" className="font-semibold underline underline-offset-4 hover:text-accent">
                    Back to sign in
                </Link>
            </p>
        </AuthLayout>
    )
}
