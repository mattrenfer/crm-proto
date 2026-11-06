'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, ClientFormData } from '@/lib/schemas'
import { Client } from '@/lib/supabase'
import { useEffect } from 'react'
import { buttonClass, errorClass, inputClass, labelClass, secondaryButtonClass } from '@/lib/formStyles'

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
        <div className="mb-10 pt-4 border-t border-ink">
            <h2 className="font-display text-2xl mb-5">{client ? 'Edit client' : 'Add a client'}</h2>
            <form onSubmit={handleSubmitClient(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="client-name" className={labelClass}>
                            Name *
                        </label>
                        <input id="client-name" type="text" {...registerClient('name')} className={inputClass} />
                        {clientErrors.name && <p className={errorClass}>{clientErrors.name?.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="client-email" className={labelClass}>
                            Email *
                        </label>
                        <input id="client-email" type="email" {...registerClient('email')} className={inputClass} />
                        {clientErrors.email && <p className={errorClass}>{clientErrors.email?.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="client-phone" className={labelClass}>
                            Phone
                        </label>
                        <input id="client-phone" type="tel" {...registerClient('phone')} className={inputClass} />
                        {clientErrors.phone && <p className={errorClass}>{clientErrors.phone?.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="client-company" className={labelClass}>
                            Company
                        </label>
                        <input id="client-company" type="text" {...registerClient('company')} className={inputClass} />
                        {clientErrors.company && <p className={errorClass}>{clientErrors.company?.message}</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        disabled={isSubmittingClient}
                        onClick={() => onCancel()}
                        className={secondaryButtonClass}
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmittingClient} className={buttonClass}>
                        {isSubmittingClient ? 'Saving...' : client ? 'Save changes' : 'Add client'}
                    </button>
                </div>
            </form>
        </div>
    )
}
