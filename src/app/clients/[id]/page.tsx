'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MOCK_CLIENTS, MOCK_TASKS, MOCK_NOTES } from '@/lib/mockData'

// Mock types and data
interface Client {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    created_at: string
    updated_at: string
}

interface Task {
    id: string
    client_id: string
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    due_date?: string
    created_at: string
    updated_at: string
}

interface Note {
    id: string
    client_id: string
    content: string
    created_at: string
    updated_at: string
}

export default function ClientDetailPage() {
    const params = useParams()
    const clientId = params.id as string

    const [client, setClient] = useState<Client | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks')
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showNoteForm, setShowNoteForm] = useState(false)
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'pending' as Task['status'],
        priority: 'medium' as Task['priority'],
        due_date: ''
    })
    const [newNote, setNewNote] = useState({ content: '' })

    useEffect(() => {
        if (clientId) {
            fetchClientData()
        }
    }, [clientId])

    const fetchClientData = async () => {
        try {
            // Simulate loading and use mock data
            setTimeout(() => {
                const mockClient = MOCK_CLIENTS.find(c => c.id === clientId)
                setClient(mockClient || null)

                const clientTasks = MOCK_TASKS.filter(t => t.client_id === clientId)
                setTasks(clientTasks)

                const clientNotes = MOCK_NOTES.filter(n => n.client_id === clientId)
                setNotes(clientNotes)

                setLoading(false)
            }, 300)
        } catch (error) {
            console.error('Error fetching client data:', error)
            setLoading(false)
        }
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const mockTask: Task = {
                id: Date.now().toString(),
                client_id: clientId,
                ...newTask,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            setTasks([mockTask, ...tasks])
            setNewTask({
                title: '',
                description: '',
                status: 'pending',
                priority: 'medium',
                due_date: ''
            })
            setShowTaskForm(false)
        } catch (error) {
            console.error('Error adding task:', error)
        }
    }

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const mockNote: Note = {
                id: Date.now().toString(),
                client_id: clientId,
                content: newNote.content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            setNotes([mockNote, ...notes])
            setNewNote({ content: '' })
            setShowNoteForm(false)
        } catch (error) {
            console.error('Error adding note:', error)
        }
    }

    const updateTaskStatus = async (taskId: string, status: Task['status']) => {
        try {
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, status, updated_at: new Date().toISOString() } : task
            ))
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">Loading client details...</div>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Client not found</h2>
                    <Link
                        href="/clients"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                    >
                        Return to Clients
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/clients"
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block"
                    >
                        ← Back to Clients
                    </Link>
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {client.name}
                        </h1>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-gray-900 dark:text-white">{client.email}</p>
                            </div>
                            {client.phone && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                                    <p className="text-gray-900 dark:text-white">{client.phone}</p>
                                </div>
                            )}
                            {client.company && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
                                    <p className="text-gray-900 dark:text-white">{client.company}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Since</p>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(client.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mock Data Notice */}
                <div className="mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                            Using Mock Data - Configure Supabase to persist changes
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                                    }`}
                            >
                                Tasks ({tasks.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'notes'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
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
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
                            <button
                                onClick={() => setShowTaskForm(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                                Add Task
                            </button>
                        </div>

                        {/* Add Task Form */}
                        {showTaskForm && (
                            <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Add New Task
                                </h3>
                                <form onSubmit={addTask} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Status
                                            </label>
                                            <select
                                                value={newTask.status}
                                                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Priority
                                            </label>
                                            <select
                                                value={newTask.priority}
                                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newTask.due_date}
                                                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowTaskForm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                        >
                                            Add Task
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tasks List */}
                        {tasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No tasks found for this client.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center space-x-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                        }`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                        }`}>
                                                        {task.priority} priority
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            Due: {new Date(task.due_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {task.status !== 'completed' && (
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, 'completed')}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                                {task.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                                                    >
                                                        Start
                                                    </button>
                                                )}
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
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notes</h2>
                            <button
                                onClick={() => setShowNoteForm(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Add Note
                            </button>
                        </div>

                        {/* Add Note Form */}
                        {showNoteForm && (
                            <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Add New Note
                                </h3>
                                <form onSubmit={addNote} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Note Content *
                                        </label>
                                        <textarea
                                            required
                                            value={newNote.content}
                                            onChange={(e) => setNewNote({ content: e.target.value })}
                                            rows={4}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Enter your note here..."
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowNoteForm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Notes List */}
                        {notes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No notes found for this client.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                                        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                            {note.content}
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(note.created_at).toLocaleString()}
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
