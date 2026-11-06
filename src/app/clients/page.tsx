'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getClients, getTasks, createClient, updateClient, deleteClient } from '@/lib/data'
import type { Client, Task } from '@/lib/supabase'
import { describeDue } from '@/lib/dates'
import { buttonClass, textButtonClass } from '@/lib/formStyles'
import { getNextTaskByClient } from '@/lib/tasks'
import PageHeader from '@/components/PageHeader'
import toast from 'react-hot-toast'
import ClientForm from '@/components/ClientForm'
import { ClientFormData } from '@/lib/schemas'
import ClientListSkeleton from '@/components/ClientListSkeleton'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
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
            const [clientsData, tasksData] = await Promise.all([getClients(), getTasks()])
            setClients(clientsData)
            setTasks(tasksData)
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
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 text-lg text-center">
                <p className="text-danger mb-4">{error}</p>
                <button onClick={loadClients} className={buttonClass}>
                    Try again
                </button>
            </div>
        )
    }

    const nextTasks = getNextTaskByClient(tasks)

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-lg">
            <ConfirmDialog
                open={pendingDeleteId !== null}
                isDeleting={deletingId !== null}
                onConfirm={handleOnConfirm}
                onCancel={handleCancelDelete}
                confirmLabel="Are you sure you want to delete?"
                confirmDescription="This action cannot be undone. This will delete the client and all associated data."
            />

            <PageHeader
                title="Your people"
                subtitle={`${clients.length} ${clients.length === 1 ? 'client' : 'clients'}`}
            >
                <button onClick={handleAddClient} className={buttonClass}>
                    Add a client
                </button>
            </PageHeader>

            {showClientForm && (
                <ClientForm client={editingClient} onSubmit={handleSaveClient} onCancel={handleCloseForm} />
            )}

            {clients.length === 0 ? (
                <p className="py-12 text-center">No one here yet. Add your first client to get started.</p>
            ) : (
                <ul className="border-b border-ink">
                    {clients.map((client) => {
                        const nextTask = nextTasks.get(client.id)
                        const due = nextTask && describeDue(nextTask.due_date)

                        return (
                            <li
                                key={client.id}
                                className="flex flex-wrap justify-between gap-x-8 gap-y-2 py-5 border-t border-ink"
                            >
                                <div className="flex-[2_1_16rem] min-w-0">
                                    <h2 className="font-display text-3xl leading-tight break-words">
                                        <Link href={`/clients/${client.id}`} className="hover:text-accent">
                                            {client.name}
                                        </Link>
                                    </h2>
                                    <p className="mt-1 break-words">
                                        {client.company && <>{client.company}, </>}
                                        <a href={`mailto:${client.email}`} className="underline underline-offset-4">
                                            {client.email}
                                        </a>
                                        {client.phone && <>, {client.phone}</>}
                                    </p>
                                </div>

                                <div className="flex-[1_1_13rem] min-w-0">
                                    {nextTask && due ? (
                                        <>
                                            <p>{nextTask.title}</p>
                                            <p className={due.needsYou ? 'italic font-semibold text-accent' : 'italic'}>
                                                {due.label}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="italic text-muted">Nothing planned</p>
                                    )}
                                </div>

                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleEditClient(client)}
                                        aria-label={`Edit ${client.name}`}
                                        className={textButtonClass}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleShowDeleteModal(client.id)}
                                        aria-label={`Delete ${client.name}`}
                                        className={textButtonClass}
                                        disabled={deletingId === client.id}
                                    >
                                        {deletingId === client.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
