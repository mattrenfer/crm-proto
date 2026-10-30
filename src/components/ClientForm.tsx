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
        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {client ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmitClient(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                        <input
                            type="text"
                            {...registerClient('name')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {clientErrors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{clientErrors.name?.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                        <input
                            type="email"
                            {...registerClient('email')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {clientErrors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{clientErrors.email?.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <input
                            type="tel"
                            {...registerClient('phone')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {clientErrors.phone && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{clientErrors.phone?.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                        <input
                            type="text"
                            {...registerClient('company')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {clientErrors.company && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {clientErrors.company?.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        disabled={isSubmittingClient}
                        onClick={() => onCancel()}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmittingClient}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {isSubmittingClient ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
                    </button>
                </div>
            </form>
        </div>
    )
}
