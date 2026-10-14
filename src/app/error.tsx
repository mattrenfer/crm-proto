'use client'

import { useRouter } from "next/navigation"
import { useEffect, startTransition } from "react"
import Link from "next/link"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {

    useEffect(() => {
        console.error({ error })
    }, [error])
    const router = useRouter()
    const handleReset = () => {
        startTransition(() => {
            router.refresh()
            reset()
        })
    }
    return (

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Something went wrong and we couldn&apos;t load this page. Please try again.</p>
                {error.digest && (
                    <div className="text-gray-600 dark:text-gray-400 mb-4">Error code: {error.digest}</div>)}
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/clients"
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Go to Clients
                    </Link>
                </div>
            </div>
        </div>
    )
}