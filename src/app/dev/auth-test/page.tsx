'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

/**
 * DEV-ONLY Test Page for Auth
 *
 * Navigate to /dev/auth-test to use this page.
 *
 * PURPOSE:
 * - Quick testing of auth functions during development
 * - Debugging auth issues without navigating through the app
 * - Creating test users quickly
 * - Verifying session state
 *
 * ⚠️ IMPORTANT: Add production protection in middleware.ts before deploying!
 */
export default function DevAuthTestPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [result, setResult] = useState<Record<string, unknown> | null>(null)
    const [session, setSession] = useState<Session | null>(null)

    const handleSignUp = async () => {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signUp({ email, password })
        setResult({ action: 'Sign Up', data, error })
        await handleGetSession()
    }

    const handleSignIn = async () => {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        setResult({ action: 'Sign In', data, error })
        await handleGetSession()
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        setResult({ action: 'Sign Out', error })
        setSession(null)
    }

    const handleGetSession = async () => {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setResult({ action: 'Get Session', session: data.session })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6">
                    <p className="text-yellow-800 dark:text-yellow-300 font-semibold">
                        🚧 DEV ONLY - This page should be protected in production
                    </p>
                </div>

                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">🧪 Auth Test Page</h1>

                {/* Input Form */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="test@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Test Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleSignUp}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={handleSignIn}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Sign Out
                        </button>
                        <button
                            onClick={handleGetSession}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Get Session
                        </button>
                    </div>
                </div>

                {/* Session Status */}
                {session && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold mb-2 text-green-900 dark:text-green-300">✅ Logged In</h2>
                        <p className="text-green-800 dark:text-green-400">User: {session.user?.email || 'No email'}</p>
                        <p className="text-green-800 dark:text-green-400 font-mono text-sm mt-2">
                            User ID: {session.user?.id} &nbsp;&nbsp;
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(session.user?.id || '')
                                    toast.success('User ID copied to clipboard!')
                                }}
                                className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                                📋 Copy User ID
                            </button>
                        </p>

                        <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                            Access Token: {session.access_token.substring(0, 20)}...
                        </p>
                    </div>
                )}

                {/* Results Display */}
                {result && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Last Result: {String(result.action)}
                        </h2>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm text-gray-800 dark:text-gray-200">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">📋 Test Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-400">
                        <li>Click &quot;Sign In&quot; to log in with your test user</li>
                        <li>Click &quot;Get Session&quot; to verify you&apos;re logged in</li>
                        <li>Check the green box appears showing your email</li>
                        <li>Click &quot;Sign Out&quot; to test logout</li>
                        <li>Click &quot;Get Session&quot; again - should show null</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
