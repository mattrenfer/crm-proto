'use client'

import './globals.css'
import Link from 'next/link'

export default function NotFoundPage() {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-ink mb-4">Not Found</h2>
                <p className="text-muted mb-4">The page you are looking for does not exist.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <Link href="/" className="px-4 py-2 bg-muted text-on-accent rounded-md hover:bg-ink">
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
