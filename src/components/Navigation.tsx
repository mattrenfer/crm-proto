'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'

export default function Navigation() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()

    // Login and signup have their own big masthead, so a nav there would show the logo twice
    if (pathname === '/login' || pathname === '/signup') return null
    const navItems = [
        { href: '/', label: 'Dashboard' },
        { href: '/clients', label: 'Clients' },
        { href: '/tasks', label: 'Tasks' },
    ]

    return (
        <nav className="bg-sheet border-b border-rule">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <Logo className="text-2xl" />
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        pathname === item.href
                                            ? 'border-accent text-ink'
                                            : 'border-transparent text-muted hover:text-ink hover:border-ink  '
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="hidden sm:inline text-sm text-muted">{user.email}</span>
                            <button
                                onClick={async () => {
                                    await signOut()
                                    window.location.assign('/login')
                                }}
                                className="text-sm text-muted hover:text-ink cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-sm text-muted hover:text-ink">
                                Login
                            </Link>
                            <Link href="/signup" className="text-sm text-muted hover:text-ink">
                                Signup
                            </Link>
                        </div>
                    )}
                </div>
                {/* The desktop links above are hidden on small screens, so logged-in users get this row instead */}
                {user && (
                    <div className="flex space-x-6 pb-3 sm:hidden">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={pathname === item.href ? 'page' : undefined}
                                className={`text-sm font-medium ${
                                    pathname === item.href ? 'text-ink' : 'text-muted hover:text-ink  '
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
