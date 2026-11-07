'use client'

import ClientDetailSkeleton from '@/components/ClientDetailSkeleton'
import ClientForm from '@/components/ClientForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import NoteForm from '@/components/NoteForm'
import TaskForm from '@/components/TaskForm'
import {
    createNote,
    createTask,
    deleteNote,
    deleteTask,
    getClientById,
    getNotesByClientId,
    getTasksByClientId,
    updateClient,
    updateNote,
    updateTask,
} from '@/lib/data'
import { describeDue } from '@/lib/dates'
import { buttonClass, inputClass, textButtonClass } from '@/lib/formStyles'
import { ClientFormData, NoteFormData, TaskFormData } from '@/lib/schemas'
import type { Client, Note, Task } from '@/lib/supabase'
import { sortByUrgency, statusLabels } from '@/lib/tasks'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ClientDetailPage() {
    const params = useParams()
    const clientId = params.id as string

    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showNoteForm, setShowNoteForm] = useState(false)
    const [showClientForm, setShowClientForm] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)
    const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchClientData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const [clientData, tasksData, notesData] = await Promise.all([
                getClientById(clientId),
                getTasksByClientId(clientId),
                getNotesByClientId(clientId),
            ])

            setClient(clientData)
            setTasks(tasksData)
            setNotes(notesData)
        } catch (err) {
            console.error('Error fetching client data:', err)
            setError('Failed to load client data. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [clientId])

    useEffect(() => {
        if (clientId) {
            fetchClientData()
        }
    }, [clientId, fetchClientData])

    const updateClientData = async (id: string, data: ClientFormData) => {
        try {
            const updated = await updateClient(id, {
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                company: data.company || null,
            })
            setClient(updated)
            setShowClientForm(false)
            toast.success('Client updated successfully!')
        } catch (err) {
            console.error('Failed to update client:', err)
            toast.error('Failed to update client. Please try again.')
        }
    }

    const addTask = async (data: TaskFormData) => {
        try {
            const created = await createTask(clientId, {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                due_date: data.due_date,
            })
            setTasks([created, ...tasks])
            setShowTaskForm(false)
            toast.success('Task added successfully!')
        } catch (err) {
            console.error('Error adding task:', err)
            toast.error('Failed to add task. Please try again.')
        }
    }

    const updateTaskData = async (data: TaskFormData) => {
        try {
            const updated = await updateTask(editingTask!.id, data)
            setTasks(tasks.map((task) => (task.id === editingTask!.id ? updated : task)))
            setShowTaskForm(false)
            setEditingTask(null)
            toast.success('Task updated successfully!')
        } catch (err) {
            console.error('Failed to update task:', err)
            toast.error('Failed to update task. Please try again.')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        setPendingDeleteTaskId(taskId)
        setDeletingId(taskId)
        try {
            await deleteTask(taskId)
            setTasks(tasks.filter((task) => task.id !== taskId))
            toast.success('Task deleted successfully!')
        } catch (err) {
            console.error('Error deleting task:', err)
            toast.error('Failed to delete task. Please try again.')
        } finally {
            setPendingDeleteTaskId(null)
            setDeletingId(null)
        }
    }

    const updateTaskStatus = async (taskId: string, status: Task['status']) => {
        try {
            const updated = await updateTask(taskId, { status: status })
            setTasks(tasks.map((task) => (task.id === taskId ? updated : task)))
            toast.success('Task status updated successfully!')
        } catch (err) {
            console.error('Error updating task status:', err)
            toast.error('Failed to update task status. Please try again.')
        }
    }

    const addNote = async (data: NoteFormData) => {
        try {
            const created = await createNote(clientId, data.content)
            setNotes([created, ...notes])
            setShowNoteForm(false)
            toast.success('Note added successfully!')
        } catch (err) {
            console.error('Error adding note:', err)
            toast.error('Failed to add note. Please try again.')
        }
    }

    const updateNoteData = async (data: NoteFormData) => {
        try {
            const updated = await updateNote(editingNote!.id, data.content)
            setNotes(notes.map((note) => (note.id === editingNote!.id ? updated : note)))
            setShowNoteForm(false)
            setEditingNote(null)
            toast.success('Note updated successfully!')
        } catch (err) {
            console.error('Failed to update note:', err)
            toast.error('Failed to update note. Please try again.')
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        setPendingDeleteNoteId(noteId)
        setDeletingId(noteId)
        try {
            await deleteNote(noteId)
            setNotes(notes.filter((note) => note.id !== noteId))
            toast.success('Note deleted successfully!')
        } catch (err) {
            console.error('Error deleting note:', err)
            toast.error('Failed to delete note. Please try again.')
        } finally {
            setPendingDeleteNoteId(null)
            setDeletingId(null)
        }
    }

    if (loading) {
        return <ClientDetailSkeleton />
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 text-lg text-center">
                <p className="text-danger mb-4">{error}</p>
                <div className="flex flex-wrap justify-center items-center gap-4">
                    <button onClick={fetchClientData} className={buttonClass}>
                        Try again
                    </button>
                    <Link href="/clients" className="underline underline-offset-4 hover:text-accent">
                        Back to your people
                    </Link>
                </div>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 text-lg text-center">
                <h1 className="font-display text-3xl mb-4">Client not found</h1>
                <Link href="/clients" className="underline underline-offset-4 hover:text-accent">
                    Back to your people
                </Link>
            </div>
        )
    }

    const handleCloseForm = () => {
        setShowClientForm(false)
    }

    const handleSaveClient = async (data: ClientFormData) => {
        await updateClientData(client.id, data)
    }

    const handleAddTask = () => {
        setEditingTask(null)
        setShowTaskForm(true)
    }

    // Clicking Edit on the row that's already open closes it
    const handleEditTask = (task: Task) => {
        setShowTaskForm(false)
        setEditingTask(editingTask?.id === task.id ? null : task)
    }

    const handleSaveTask = async (data: TaskFormData) => {
        if (editingTask) {
            return updateTaskData(data)
        } else {
            return addTask(data)
        }
    }

    const handleCloseTaskForm = () => {
        setShowTaskForm(false)
        setEditingTask(null)
    }

    const handleAddNote = () => {
        setEditingNote(null)
        setShowNoteForm(true)
    }

    const handleEditNote = (note: Note) => {
        setShowNoteForm(false)
        setEditingNote(editingNote?.id === note.id ? null : note)
    }

    const handleOnTaskConfirm = () => {
        if (pendingDeleteTaskId === null) return

        handleDeleteTask(pendingDeleteTaskId)
    }

    const handleOnNoteConfirm = () => {
        if (pendingDeleteNoteId === null) return

        handleDeleteNote(pendingDeleteNoteId)
    }

    const handleCloseNoteForm = () => {
        setEditingNote(null)
        setShowNoteForm(false)
    }

    const handleShowDeleteTaskModal = (id: string) => {
        setPendingDeleteTaskId(id)
    }

    const handleShowDeleteNoteModal = (id: string) => {
        setPendingDeleteNoteId(id)
    }

    const handleCancelDelete = () => {
        setPendingDeleteTaskId(null)
        setPendingDeleteNoteId(null)
    }

    const visibleTasks = [...sortByUrgency(tasks), ...tasks.filter((task) => task.status === 'completed')]
    const clientSince = new Date(client.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-lg">
            <ConfirmDialog
                open={pendingDeleteTaskId !== null}
                isDeleting={deletingId !== null}
                onConfirm={handleOnTaskConfirm}
                onCancel={handleCancelDelete}
                confirmLabel="Are you sure you want to delete this task?"
            />
            <ConfirmDialog
                open={pendingDeleteNoteId !== null}
                isDeleting={deletingId !== null}
                onConfirm={handleOnNoteConfirm}
                onCancel={handleCancelDelete}
                confirmLabel="Are you sure you want to delete this note?"
            />

            <header className="mb-10">
                <Link href="/clients" className="underline underline-offset-4 hover:text-accent">
                    Back to your people
                </Link>
                <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7rem)] leading-none tracking-tight break-words">
                    {client.name}
                </h1>
                <div className="mt-4 flex flex-wrap justify-between items-center gap-x-8 gap-y-2">
                    <p className="min-w-0 break-words">
                        {client.company && <>{client.company}, </>}
                        <a href={`mailto:${client.email}`} className="underline underline-offset-4">
                            {client.email}
                        </a>
                        {client.phone && (
                            <>
                                ,{' '}
                                <a href={`tel:${client.phone}`} className="underline underline-offset-4">
                                    {client.phone}
                                </a>
                            </>
                        )}
                        . <span className="italic">Client since {clientSince}.</span>
                    </p>
                    <button
                        onClick={() => setShowClientForm(!showClientForm)}
                        aria-expanded={showClientForm}
                        aria-label={`Edit ${client.name}`}
                        className={textButtonClass}
                    >
                        Edit
                    </button>
                </div>
                {showClientForm && (
                    <div className="mt-6">
                        <ClientForm client={client} onSubmit={handleSaveClient} onCancel={handleCloseForm} />
                    </div>
                )}
            </header>

            <div className="flex flex-wrap items-start gap-x-16 gap-y-12">
                {/* Notes get the most room, because they're the human part of the record */}
                <section aria-labelledby="notes-heading" className="flex-[3_1_26rem] min-w-0">
                    <div className="flex flex-wrap justify-between items-center gap-x-8 gap-y-3 mb-5">
                        <h2 id="notes-heading" className="font-display text-3xl">
                            Your notes
                        </h2>
                        <button onClick={handleAddNote} className={buttonClass}>
                            Add a note
                        </button>
                    </div>

                    {showNoteForm && !editingNote && (
                        <div className="mb-6">
                            <NoteForm note={null} onSubmit={addNote} onCancel={handleCloseNoteForm} />
                        </div>
                    )}

                    {notes.length === 0 ? (
                        <p className="py-6 border-t border-ink">
                            No notes yet. Write down what you want to remember about {client.name}.
                        </p>
                    ) : (
                        <div className="border-b border-ink">
                            {notes.map((note) => (
                                <article key={note.id} className="py-5 border-t border-ink">
                                    <p className="italic">
                                        {new Date(note.created_at).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <p className="mt-2 text-2xl leading-snug whitespace-pre-wrap break-words">
                                        {note.content}
                                    </p>
                                    <div className="mt-2 flex gap-3">
                                        <button
                                            onClick={() => handleEditNote(note)}
                                            aria-expanded={editingNote?.id === note.id}
                                            aria-label="Edit this note"
                                            className={textButtonClass}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            disabled={deletingId === note.id}
                                            onClick={() => handleShowDeleteNoteModal(note.id)}
                                            aria-label="Delete this note"
                                            className={textButtonClass}
                                        >
                                            {deletingId === note.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                    {editingNote?.id === note.id && (
                                        <div className="mt-4">
                                            <NoteForm
                                                note={editingNote}
                                                onSubmit={updateNoteData}
                                                onCancel={handleCloseNoteForm}
                                            />
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section aria-labelledby="tasks-heading" className="flex-[2_1_18rem] min-w-0">
                    <div className="flex flex-wrap justify-between items-center gap-x-8 gap-y-3 mb-5">
                        <h2 id="tasks-heading" className="font-display text-3xl">
                            What&apos;s next
                        </h2>
                        <button onClick={handleAddTask} className={textButtonClass}>
                            Add a task
                        </button>
                    </div>

                    {showTaskForm && !editingTask && (
                        <div className="mb-6">
                            <TaskForm
                                task={null}
                                onSubmit={handleSaveTask}
                                onCancel={handleCloseTaskForm}
                                clients={null}
                                clientId={clientId}
                            />
                        </div>
                    )}

                    {visibleTasks.length === 0 ? (
                        <p className="py-6 border-t border-ink">Nothing planned yet.</p>
                    ) : (
                        <ul className="border-b border-ink">
                            {visibleTasks.map((task) => {
                                const isDone = task.status === 'completed'
                                const due = describeDue(task.due_date)

                                return (
                                    <li key={task.id} className="py-4 border-t border-ink">
                                        <h3 className="font-display text-xl leading-snug break-words">{task.title}</h3>
                                        {task.description && <p className="mt-1">{task.description}</p>}
                                        <p
                                            className={
                                                !isDone && due.needsYou ? 'italic font-semibold text-accent' : 'italic'
                                            }
                                        >
                                            {isDone ? 'Done' : due.label}
                                        </p>
                                        <p>{task.priority} priority</p>
                                        <label htmlFor={`status-${task.id}`} className="mt-2 block text-base">
                                            Status
                                        </label>
                                        <select
                                            id={`status-${task.id}`}
                                            value={task.status}
                                            onChange={(e) =>
                                                updateTaskStatus(task.id, e.target.value as Task['status'])
                                            }
                                            className={inputClass}
                                        >
                                            <option value="pending">{statusLabels.pending}</option>
                                            <option value="in_progress">{statusLabels.in_progress}</option>
                                            <option value="completed">{statusLabels.completed}</option>
                                        </select>
                                        <div className="mt-2 flex gap-3">
                                            <button
                                                onClick={() => handleEditTask(task)}
                                                aria-expanded={editingTask?.id === task.id}
                                                aria-label={`Edit ${task.title}`}
                                                className={textButtonClass}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleShowDeleteTaskModal(task.id)}
                                                aria-label={`Delete ${task.title}`}
                                                className={textButtonClass}
                                                disabled={deletingId === task.id}
                                            >
                                                {deletingId === task.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                        {editingTask?.id === task.id && (
                                            <div className="mt-4">
                                                <TaskForm
                                                    task={editingTask}
                                                    onSubmit={handleSaveTask}
                                                    onCancel={handleCloseTaskForm}
                                                    clients={null}
                                                    clientId={clientId}
                                                />
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}
