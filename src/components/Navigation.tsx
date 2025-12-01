'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const navItems = [
        { href: '/', label: 'Dashboard' },
        { href: '/clients', label: 'Clients' },
        { href: '/tasks', label: 'Tasks' },
    ]

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Simple CRM
                            </h1>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === item.href
                                        ? 'border-blue-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{user.email}</span>
                            <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Logout</button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Login</Link>
                            <Link href="/signup" className="text-sm text-gray-500 hover:text-gray-700">Signup</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
