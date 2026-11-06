'use client'

import { useRouter } from 'next/navigation'
import { useEffect, startTransition } from 'react'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
                <h2 className="text-2xl font-bold text-ink mb-4">Error</h2>
                <p className="text-muted mb-4">
                    Something went wrong and we couldn&apos;t load this page. Please try again.
                </p>
                {error.digest && <div className="text-muted mb-4">Error code: {error.digest}</div>}
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-accent text-on-accent rounded-md hover:bg-ink"
                    >
                        Try Again
                    </button>
                    <Link href="/clients" className="px-4 py-2 bg-muted text-on-accent rounded-md hover:bg-ink">
                        Go to Clients
                    </Link>
                </div>
            </div>
        </div>
    )
}
