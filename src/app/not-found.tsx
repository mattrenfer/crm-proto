'use client'

import "./globals.css";
import Link from "next/link"

export default function NotFoundPage() {

    return (

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">The page you are looking for does not exist.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <Link
                        href="/"
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}