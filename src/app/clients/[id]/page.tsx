'use client'

import ClientDetailSkeleton from '@/components/ClientDetailSkeleton'
import ClientForm from '@/components/ClientForm'
import ConfirmDialog from '@/components/ConfirmDialog'
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
import { formatDate } from '@/lib/dates'
import { ClientFormData, NoteFormData, noteSchema, TaskFormData } from '@/lib/schemas'
import type { Client, Note, Task } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function ClientDetailPage() {
    const params = useParams()
    const clientId = params.id as string

    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks')
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showNoteForm, setShowNoteForm] = useState(false)
    const [showClientForm, setShowClientForm] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)
    const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const {
        register: registerNote,
        handleSubmit: handleSubmitNote,
        formState: { errors: noteErrors, isSubmitting: isSubmittingNote },
        reset: resetNoteForm,
    } = useForm<NoteFormData>({ resolver: zodResolver(noteSchema) })

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
            resetNoteForm()
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
            resetNoteForm()
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
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <div className="text-danger mb-4">{error}</div>
                    <button
                        onClick={fetchClientData}
                        className="px-4 py-2 bg-accent text-on-accent rounded-md hover:bg-ink mr-4"
                    >
                        Try Again
                    </button>
                    <Link href="/clients" className="text-accent hover:text-ink underline">
                        Return to Clients
                    </Link>
                </div>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-ink mb-4">Client not found</h2>
                    <Link href="/clients" className="text-accent hover:text-ink underline">
                        Return to Clients
                    </Link>
                </div>
            </div>
        )
    }

    const handleEditClient = () => {
        setShowClientForm(true)
    }

    const handleCloseForm = () => {
        setShowClientForm(false)
    }

    const handleSaveClient = async (data: ClientFormData) => {
        await updateClientData(client.id, data)
    }

    const handleEditTask = (task: Task) => {
        setEditingTask(task)
        setShowTaskForm(true)
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

    const handleEditNote = (note: Note) => {
        setEditingNote(note)
        setShowNoteForm(true)
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

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
            <div className="px-4 py-6 sm:px-0">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/clients" className="text-accent hover:text-ink mb-4 inline-block">
                        ← Back to Clients
                    </Link>
                    {showClientForm && (
                        <ClientForm client={client} onSubmit={handleSaveClient} onCancel={handleCloseForm} />
                    )}
                    {!showClientForm && (
                        <div className="bg-sheet shadow rounded-lg p-6">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-bold text-ink">{client.name}</h1>
                                <div>
                                    <button onClick={handleEditClient} className="text-accent hover:text-ink">
                                        Edit Client
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted">Email</p>
                                    <p className="text-ink">{client.email}</p>
                                </div>
                                {client.phone && (
                                    <div>
                                        <p className="text-sm font-medium text-muted">Phone</p>
                                        <p className="text-ink">{client.phone}</p>
                                    </div>
                                )}
                                {client.company && (
                                    <div>
                                        <p className="text-sm font-medium text-muted">Company</p>
                                        <p className="text-ink">{client.company}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted">Client Since</p>
                                    <p className="text-ink">{new Date(client.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-rule">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'tasks'
                                        ? 'border-accent text-accent '
                                        : 'border-transparent text-muted hover:text-ink hover:border-ink '
                                }`}
                            >
                                Tasks ({tasks.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'notes'
                                        ? 'border-accent text-accent '
                                        : 'border-transparent text-muted hover:text-ink hover:border-ink '
                                }`}
                            >
                                Notes ({notes.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-ink">Tasks</h2>
                            <button
                                onClick={() => setShowTaskForm(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-on-accent bg-accent hover:bg-ink"
                            >
                                Add Task
                            </button>
                        </div>

                        {/* Add Task Form */}
                        {(showTaskForm || editingTask) && (
                            <TaskForm
                                task={editingTask}
                                onSubmit={handleSaveTask}
                                onCancel={handleCloseTaskForm}
                                clients={null}
                                clientId={clientId}
                            />
                        )}

                        {/* Tasks List */}
                        {tasks.length === 0 ? (
                            <div className="text-center py-8 text-muted">No tasks found for this client.</div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="bg-sheet shadow rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-medium text-ink">{task.title}</h4>
                                                {task.description && (
                                                    <p className="mt-1 text-muted">{task.description}</p>
                                                )}
                                                <div className="mt-2 flex items-center space-x-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            task.status === 'completed'
                                                                ? 'bg-sheet text-accent'
                                                                : task.status === 'in_progress'
                                                                  ? 'bg-sheet text-ink'
                                                                  : 'bg-rule text-ink'
                                                        }`}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            task.priority === 'high'
                                                                ? 'bg-sheet text-danger'
                                                                : task.priority === 'medium'
                                                                  ? 'bg-sheet text-ink'
                                                                  : 'bg-rule text-ink'
                                                        }`}
                                                    >
                                                        {task.priority} priority
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="text-muted">
                                                            Due: {formatDate(task.due_date)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {task.status !== 'completed' && (
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, 'completed')}
                                                        className="text-accent hover:text-ink"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                                {task.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                        className="text-ink hover:text-ink"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {task.status === 'completed' && (
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, 'pending')}
                                                        className="text-muted hover:text-ink"
                                                    >
                                                        Reopen
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditTask(task)}
                                                    className="text-accent hover:text-ink"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleShowDeleteTaskModal(task.id)}
                                                    className="text-danger hover:text-ink"
                                                    disabled={deletingId === task.id}
                                                >
                                                    {deletingId === task.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-ink">Notes</h2>
                            <button
                                onClick={() => setShowNoteForm(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-on-accent bg-accent hover:bg-ink"
                            >
                                Add Note
                            </button>
                        </div>

                        {/* Add Note Form */}
                        {(showNoteForm || editingNote) && (
                            <div className="mb-6 bg-sheet shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-ink mb-4">
                                    {editingNote ? 'Edit Note' : 'Add New Note'}
                                </h3>
                                <form
                                    onSubmit={
                                        editingNote ? handleSubmitNote(updateNoteData) : handleSubmitNote(addNote)
                                    }
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-ink">Note Content *</label>
                                        <textarea
                                            {...registerNote('content')}
                                            defaultValue={editingNote?.content}
                                            rows={4}
                                            className="mt-1 block w-full border-rule rounded-md shadow-sm focus:ring-accent focus:border-accent"
                                            placeholder="Enter your note here..."
                                        />
                                        {noteErrors && noteErrors.content && (
                                            <p className="mt-1 text-sm text-danger">{noteErrors.content?.message}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            disabled={isSubmittingNote}
                                            onClick={handleCloseNoteForm}
                                            className="px-4 py-2 border border-rule rounded-md shadow-sm text-sm font-medium text-ink bg-sheet hover:bg-paper"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingNote}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-on-accent bg-accent hover:bg-ink"
                                        >
                                            {isSubmittingNote ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Notes List */}
                        {notes.length === 0 ? (
                            <div className="text-center py-8 text-muted">No notes found for this client.</div>
                        ) : (
                            <div className="space-y-4">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-sheet shadow rounded-lg p-4 flex">
                                        <div className="flex-1">
                                            <div className="text-ink whitespace-pre-wrap">{note.content}</div>
                                            <div className="mt-2 text-sm text-muted">
                                                {new Date(note.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditNote(note)}
                                                className="text-accent hover:text-ink text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                disabled={deletingId === note.id}
                                                onClick={() => handleShowDeleteNoteModal(note.id)}
                                                className="text-danger hover:text-ink text-sm"
                                            >
                                                {deletingId === note.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
