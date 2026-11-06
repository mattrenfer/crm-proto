import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'
import { Analytics } from '@vercel/analytics/next'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Simple CRM',
    description: 'Keep your clients, tasks and notes in one place.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <div>
                        <Toaster
                            toastOptions={{
                                style: {
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    border: '1px solid rgb(128 128 128 / 0.3)',
                                },
                            }}
                        />
                    </div>
                    <Navigation />
                    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</main>
                </Providers>
                <Analytics />
            </body>
        </html>
    )
}
