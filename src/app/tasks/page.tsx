'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mockData'
import { MOCK_CLIENTS } from '@/lib/mockData'
import type { Client, Task } from '@/lib/supabase'
import { getTasks, getClients, createTask, deleteTask, updateTask } from '@/lib/data'
import toast from 'react-hot-toast'


interface TaskWithClient extends Task {
    client: Pick<Client, 'id' | 'name'>
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskWithClient[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

    // Check if environment variables are set up
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(
        supabaseUrl &&
        supabaseKey &&
        !supabaseUrl.includes('your_supabase') &&
        !supabaseKey.includes('your_supabase')
    )

    useEffect(() => {
        loadTasks()
    }, [filter]) // Re-fetch when filter changes

    async function loadTasks() {
        setLoading(true)
        try {
            // Fetch all tasks from Supabase
            const tasksData = await getTasks()

            // Fetch all clients to join with tasks
            const clientsData = await getClients()

            // Create lookup map for efficient client joins
            const clientsMap = new Map(clientsData.map(c => [c.id, c]))

            // Join tasks with their client data
            const tasksWithClients = tasksData
                .map(task => {
                    const client = clientsMap.get(task.client_id)
                    if (!client) return null
                    return {
                        ...task,
                        client: { id: client.id, name: client.name },
                    }
                })
                .filter((task): task is TaskWithClient => task !== null)

            setTasks(tasksWithClients)
            setIsSupabaseConfigured(true)
        } catch (error) {
            console.error('Failed to load tasks:', error)
            toast.error('Failed to load tasks. Please try again.')
            setIsSupabaseConfigured(false)
        } finally {
            setLoading(false)
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
        try {
            const updated = await updateTask(taskId, { status: newStatus })

            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, ...updated } : task
            ))

            // Success feedback
            const statusLabels = {
                pending: 'Pending',
                in_progress: 'In Progress',
                completed: 'Completed'
            }
            toast.success(`Task marked as ${statusLabels[newStatus]}`)

        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return
        setLoading(true)
        try {
            await deleteTask(taskId)
            setTasks(tasks.filter(task => task.id !== taskId))
            toast.success('Task deleted successfully!')
        } catch (err) {
            console.error('Failed to delete task:', err)
            toast.error('Failed to delete task. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        return task.status === filter
    })

    const getStatusBadgeClass = (status: Task['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }
    }

    const getPriorityBadgeClass = (priority: Task['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="text-center">Loading tasks...</div>
            </div>
        )
    }

    const taskCounts = {
        all: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tasks
                    </h1>
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">A</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            All Tasks
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {taskCounts.all}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">P</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Pending
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {taskCounts.pending}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">I</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            In Progress
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {taskCounts.in_progress}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">C</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Completed
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {taskCounts.completed}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { key: 'all', label: 'All Tasks', count: taskCounts.all },
                                { key: 'pending', label: 'Pending', count: taskCounts.pending },
                                { key: 'in_progress', label: 'In Progress', count: taskCounts.in_progress },
                                { key: 'completed', label: 'Completed', count: taskCounts.completed },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key as typeof filter)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tasks List */}
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            {filter === 'all' ? 'No tasks found.' : `No ${filter.replace('_', ' ')} tasks found.`}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {task.title}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                                                {task.priority} priority
                                            </span>
                                        </div>

                                        {task.description && (
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                {task.description}
                                            </p>
                                        )}

                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>
                                                Client: <Link
                                                    href={`/clients/${task.client.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    {task.client.name}
                                                </Link>
                                            </span>
                                            {task.due_date && (
                                                <span>
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span>
                                                Created: {new Date(task.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        {task.status === 'pending' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm"
                                            >
                                                Start
                                            </button>
                                        )}
                                        {task.status !== 'completed' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {task.status === 'completed' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'pending')}
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                                            >
                                                Reopen
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
