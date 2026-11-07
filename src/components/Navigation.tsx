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
        <nav className="bg-paper text-lg">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-3">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            {pathname !== '/' && (
                                <Link href="/">
                                    <Logo className="text-4xl" />
                                </Link>
                            )}
                        </div>
                        <div className={`hidden sm:flex sm:space-x-8 ${pathname === '/' ? '' : 'sm:ml-10'}`}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                                        pathname === item.href
                                            ? 'border-accent font-semibold'
                                            : 'border-transparent hover:border-ink'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="hidden md:inline text-base text-muted">{user.email}</span>
                            <button
                                onClick={async () => {
                                    await signOut()
                                    window.location.assign('/login')
                                }}
                                className="hover:text-accent cursor-pointer"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="hover:text-accent">
                                Sign in
                            </Link>
                            <Link href="/signup" className="hover:text-accent">
                                Create an account
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
                                className={
                                    pathname === item.href
                                        ? 'font-semibold underline decoration-accent decoration-2 underline-offset-4'
                                        : ''
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
                <div className={pathname === '/' ? 'border-b border-ink' : 'border-b-4 border-double border-ink'} />
            </div>
        </nav>
    )
}
