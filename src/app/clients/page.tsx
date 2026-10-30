'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getClients, createClient, updateClient, deleteClient } from '@/lib/data'
import type { Client } from '@/lib/supabase'
import toast from 'react-hot-toast'
import ClientForm from '@/components/ClientForm'
import { ClientFormData } from '@/lib/schemas'
import ClientListSkeleton from '@/components/ClientListSkeleton'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showClientForm, setShowClientForm] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        loadClients()
    }, [])

    async function loadClients() {
        try {
            setLoading(true)
            setError(null)
            const data = await getClients()
            setClients(data)
        } catch (err) {
            console.error('Failed to load clients:', err)
            setError('Failed to load clients. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const addClient = async (data: ClientFormData) => {
        try {
            const created = await createClient({
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                company: data.company || null,
            })
            setClients([created, ...clients])
            setShowClientForm(false)
            toast.success('Client added successfully!')
        } catch (err) {
            console.error('Failed to add client:', err)
            toast.error('Failed to add client. Please try again.')
        }
    }

    const updateClientData = async (id: string, data: ClientFormData) => {
        try {
            const updated = await updateClient(id, {
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                company: data.company || null,
            })
            setClients(clients.map((client) => (client.id === id ? updated : client)))
            setEditingClient(null)
            setShowClientForm(false)
            toast.success('Client updated successfully!')
        } catch (err) {
            console.error('Failed to update client:', err)
            toast.error('Failed to update client. Please try again.')
        }
    }

    const handleAddClient = () => {
        setShowClientForm(true)
        setEditingClient(null)
    }

    const handleEditClient = (client: Client) => {
        setShowClientForm(true)
        setEditingClient(client)
    }

    const handleCloseForm = () => {
        setShowClientForm(false)
        setEditingClient(null)
    }

    const handleSaveClient = (data: ClientFormData) => {
        if (editingClient) {
            return updateClientData(editingClient.id, data)
        } else {
            return addClient(data)
        }
    }

    const handleOnConfirm = () => {
        if (pendingDeleteId === null) return
        handleDeleteClient(pendingDeleteId)
    }

    const handleShowDeleteModal = (id: string) => {
        setPendingDeleteId(id)
    }

    const handleDeleteClient = async (id: string) => {
        setDeletingId(id)
        try {
            await deleteClient(id)
            setClients(clients.filter((client) => client.id !== id))
            toast.success('Client deleted successfully!')
        } catch (err) {
            console.error('Failed to delete client:', err)
            toast.error('Failed to delete client. Please try again.')
        } finally {
            setPendingDeleteId(null)
            setDeletingId(null)
        }
    }

    const handleCancelDelete = () => {
        setPendingDeleteId(null)
    }

    if (loading) {
        return <ClientListSkeleton />
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <button
                        onClick={loadClients}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <ConfirmDialog
                open={pendingDeleteId !== null}
                isDeleting={deletingId !== null}
                onConfirm={handleOnConfirm}
                onCancel={handleCancelDelete}
                confirmLabel="Are you sure you want to delete?"
                confirmDescription="This action cannot be undone. This will delete the client and all associated data."
            />
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
                    <button
                        onClick={handleAddClient}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Client
                    </button>
                </div>

                {/* Client Form */}
                {showClientForm && (
                    <ClientForm client={editingClient} onSubmit={handleSaveClient} onCancel={handleCloseForm} />
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
                                                        <Link href={`/clients/${client.id}`}>{client.name}</Link>
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
                                                    onClick={() => handleEditClient(client)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleShowDeleteModal(client.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    disabled={deletingId === client.id}
                                                >
                                                    {deletingId === client.id ? 'Deleting...' : 'Delete'}
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
