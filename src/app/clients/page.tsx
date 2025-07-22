'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MOCK_CLIENTS } from '@/lib/mockData'

// Mock client type and data
interface Client {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    created_at: string
    updated_at: string
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    })

    // Check if environment variables are set up
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const isSupabaseConfigured = supabaseUrl &&
        supabaseKey &&
        !supabaseUrl.includes('your_supabase') &&
        !supabaseKey.includes('your_supabase')

    useEffect(() => {
        // Simulate loading and use mock data
        setTimeout(() => {
            setClients(MOCK_CLIENTS)
            setLoading(false)
        }, 500)
    }, [])

    const addClient = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isSupabaseConfigured) {
            // Add to mock data
            const mockClient: Client = {
                id: Date.now().toString(),
                ...newClient,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            setClients([mockClient, ...clients])
            setNewClient({ name: '', email: '', phone: '', company: '' })
            setShowAddForm(false)
            return
        }

        // Here you would add the real Supabase logic when configured
        alert('Supabase integration will be added here when configured.')
    }

    const deleteClient = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return

        if (!isSupabaseConfigured) {
            // Remove from mock data
            setClients(clients.filter(client => client.id !== id))
            return
        }

        // Here you would add the real Supabase logic when configured
        alert('Supabase integration will be added here when configured.')
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">Loading clients...</div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Clients
                    </h1>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Client
                    </button>
                </div>

                {/* Configuration Status */}
                <div className={`mb-6 p-4 rounded-lg ${isSupabaseConfigured
                    ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
                    : 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                    }`}>
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${isSupabaseConfigured ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className={`font-medium ${isSupabaseConfigured
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-blue-800 dark:text-blue-200'
                            }`}>
                            {isSupabaseConfigured ? 'Database Connected' : 'Using Mock Data - Configure Supabase to persist changes'}
                        </span>
                    </div>
                </div>

                {/* Add Client Form */}
                {showAddForm && (
                    <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Add New Client
                        </h2>
                        <form onSubmit={addClient} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={newClient.company}
                                        onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Add Client
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Clients List */}
                {clients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            No clients found. Add your first client to get started!
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {clients.map((client) => (
                                <li key={client.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                        <Link href={`/clients/${client.id}`}>
                                                            {client.name}
                                                        </Link>
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {client.email}
                                                    </p>
                                                    {client.company && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {client.company}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/clients/${client.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => deleteClient(client.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {client.phone && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    📞 {client.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
