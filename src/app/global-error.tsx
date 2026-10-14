'use client'

import { useEffect } from "react"

export default function GlobalErrorPage({ error }: { error: Error & { digest?: string } }) {

    useEffect(() => {
        console.error({ error })
    }, [error])
    return (

        <html>
            <body className="bg-gray-100 dark:bg-gray-900" id="global-error-body">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" id="global-error-container" role="alert">
                    <div className="text-center py-12" id="global-error-content">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Global Error</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">A global error occurred. Please try again later.</p>
                        {error.digest && (
                            <div className="text-gray-600 dark:text-gray-400 mb-4">Error code: {error.digest}</div>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}