'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, ClientFormData } from '@/lib/schemas'
import { Client } from '@/lib/supabase'
import { useEffect } from 'react'

export default function ClientForm({
    client,
    onSubmit,
    onCancel,
}: {
    client: Client | null
    onSubmit: (data: ClientFormData) => Promise<void>
    onCancel: () => void
}) {
    const {
        register: registerClient,
        handleSubmit: handleSubmitClient,
        formState: { errors: clientErrors, isSubmitting: isSubmittingClient },
        reset: resetClientForm,
    } = useForm<ClientFormData>({ resolver: zodResolver(clientSchema) })
    useEffect(() => {
        if (client) {
            resetClientForm({
                name: client.name,
                email: client.email,
                phone: client.phone ?? '',
                company: client.company ?? '',
            })
        } else {
            resetClientForm({ name: '', email: '', phone: '', company: '' })
        }
    }, [client, resetClientForm])
    return (
        <div className="mb-6 bg-sheet shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-ink mb-4">{client ? 'Edit Client' : 'Add New Client'}</h2>
            <form onSubmit={handleSubmitClient(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-ink">Name *</label>
                        <input
                            type="text"
                            {...registerClient('name')}
                            className="mt-1 block w-full border-rule rounded-md shadow-sm focus:ring-accent focus:border-accent"
                        />
                        {clientErrors.name && <p className="mt-1 text-sm text-danger">{clientErrors.name?.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink">Email *</label>
                        <input
                            type="email"
                            {...registerClient('email')}
                            className="mt-1 block w-full border-rule rounded-md shadow-sm focus:ring-accent focus:border-accent"
                        />
                        {clientErrors.email && (
                            <p className="mt-1 text-sm text-danger">{clientErrors.email?.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink">Phone</label>
                        <input
                            type="tel"
                            {...registerClient('phone')}
                            className="mt-1 block w-full border-rule rounded-md shadow-sm focus:ring-accent focus:border-accent"
                        />
                        {clientErrors.phone && (
                            <p className="mt-1 text-sm text-danger">{clientErrors.phone?.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink">Company</label>
                        <input
                            type="text"
                            {...registerClient('company')}
                            className="mt-1 block w-full border-rule rounded-md shadow-sm focus:ring-accent focus:border-accent"
                        />
                        {clientErrors.company && (
                            <p className="mt-1 text-sm text-danger">{clientErrors.company?.message}</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        disabled={isSubmittingClient}
                        onClick={() => onCancel()}
                        className="px-4 py-2 border border-rule rounded-md shadow-sm text-sm font-medium text-ink bg-sheet hover:bg-paper focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmittingClient}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-on-accent bg-accent hover:bg-ink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                        {isSubmittingClient ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
                    </button>
                </div>
            </form>
        </div>
    )
}
