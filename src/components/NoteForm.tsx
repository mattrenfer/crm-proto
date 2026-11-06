'use client'

import { buttonClass, errorClass, inputClass, labelClass, secondaryButtonClass } from '@/lib/formStyles'
import { NoteFormData, noteSchema } from '@/lib/schemas'
import type { Note } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export default function NoteForm({
    note,
    onSubmit,
    onCancel,
}: {
    note: Note | null
    onSubmit: (data: NoteFormData) => Promise<void>
    onCancel: () => void
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setFocus,
    } = useForm<NoteFormData>({ resolver: zodResolver(noteSchema) })

    useEffect(() => {
        reset({ content: note?.content ?? '' })
        setFocus('content')
    }, [note, reset, setFocus])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="note-content" className={labelClass}>
                    {note ? 'Edit note' : 'Add a note'}
                </label>
                <textarea id="note-content" {...register('content')} rows={5} className={`${inputClass} py-2`} />
                {errors.content && <p className={errorClass}>{errors.content.message}</p>}
            </div>
            <div className="flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={onCancel} className={secondaryButtonClass}>
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={buttonClass}>
                    {isSubmitting ? 'Saving...' : note ? 'Save changes' : 'Add note'}
                </button>
            </div>
        </form>
    )
}
