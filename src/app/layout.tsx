import type { Metadata } from 'next'
import { Newsreader, Young_Serif } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'
import { Analytics } from '@vercel/analytics/next'

const newsreader = Newsreader({
    variable: '--font-newsreader',
    subsets: ['latin'],
    style: ['normal', 'italic'],
    axes: ['opsz'],
})

const youngSerif = Young_Serif({
    variable: '--font-young-serif',
    subsets: ['latin'],
    weight: '400',
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
            <body className={`${newsreader.variable} ${youngSerif.variable} antialiased`}>
                <Providers>
                    <div>
                        <Toaster
                            toastOptions={{
                                style: {
                                    background: 'var(--sheet)',
                                    color: 'var(--ink)',
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
