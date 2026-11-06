'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Client, Task } from '@/lib/supabase'
import { getTasks, getClients, createTask, deleteTask, updateTask } from '@/lib/data'
import { describeDue } from '@/lib/dates'
import { buttonClass, inputClass, textButtonClass } from '@/lib/formStyles'
import { sortByUrgency, statusLabels } from '@/lib/tasks'
import PageHeader from '@/components/PageHeader'
import toast from 'react-hot-toast'
import TaskForm from '@/components/TaskForm'
import TaskListSkeleton from '@/components/TaskListSkeleton'
import { TaskFormData, TaskWithClientFormData } from '@/lib/schemas'
import ConfirmDialog from '@/components/ConfirmDialog'

interface TaskWithClient extends Task {
    client: Pick<Client, 'id' | 'name'>
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskWithClient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
    const [clients, setClients] = useState<Client[] | null>(null)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        setLoading(true)
        try {
            // Fetch all tasks from Supabase
            const tasksData = await getTasks()

            // Fetch all clients to join with tasks
            const clientsData = await getClients()
            setClients(clientsData)

            // Create lookup map for efficient client joins
            const clientsMap = new Map(clientsData.map((c) => [c.id, c]))

            // Join tasks with their client data
            const tasksWithClients = tasksData
                .map((task) => {
                    const client = clientsMap.get(task.client_id)
                    if (!client) return null
                    return {
                        ...task,
                        client: { id: client.id, name: client.name },
                    }
                })
                .filter((task): task is TaskWithClient => task !== null)

            setTasks(tasksWithClients)
        } catch (error) {
            console.error('Failed to load tasks:', error)
            setError('Failed to load tasks. Please try again.')
            toast.error('Failed to load tasks. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const addTask = async (data: TaskWithClientFormData) => {
        try {
            const created = await createTask(data.client_id || '', {
                client_id: data.client_id,
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                due_date: data.due_date,
            })

            const createdWithClient = clients?.find((c: Client) => {
                return c.id === data.client_id
            })

            setTasks([
                { ...created, client: { id: createdWithClient?.id || '', name: createdWithClient?.name || '' } },
                ...tasks,
            ])
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
            setTasks(tasks.map((task) => (task.id === editingTask!.id ? { ...task, ...updated } : task)))
            setShowTaskForm(false)
            setEditingTask(null)
            toast.success('Task updated successfully!')
        } catch (err) {
            console.error('Failed to update task:', err)
            toast.error('Failed to update task. Please try again.')
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
        try {
            const updated = await updateTask(taskId, { status: newStatus })

            setTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...updated } : task)))

            toast.success(`Task marked as ${statusLabels[newStatus]}`)
        } catch (error) {
            console.error('Error updating task:', error)
            toast.error('Failed to update task status. Please try again.')
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
            console.error('Failed to delete task:', err)
            toast.error('Failed to delete task. Please try again.')
        } finally {
            setPendingDeleteTaskId(null)
            setDeletingId(null)
        }
    }

    // Filtering happens here, in the browser, because every task is already loaded.
    const filteredTasks = tasks.filter((task) => filter === 'all' || task.status === filter)
    const visibleTasks = [
        ...sortByUrgency(filteredTasks),
        ...filteredTasks.filter((task) => task.status === 'completed'),
    ]
    const openCount = tasks.filter((task) => task.status !== 'completed').length
    const filters: { key: typeof filter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: statusLabels.pending },
        { key: 'in_progress', label: statusLabels.in_progress },
        { key: 'completed', label: statusLabels.completed },
    ]

    if (loading) {
        return <TaskListSkeleton />
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 text-lg text-center">
                <p className="text-danger mb-4">{error}</p>
                <button onClick={loadTasks} className={buttonClass}>
                    Try again
                </button>
            </div>
        )
    }

    const handleAddTask = () => {
        setShowTaskForm(true)
    }

    const handleSaveTask = async (data: TaskWithClientFormData) => {
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

    const handleEditTask = (task: Task) => {
        setShowTaskForm(true)
        setEditingTask(task)
    }

    const handleShowDeleteTaskModal = (id: string) => {
        setPendingDeleteTaskId(id)
    }

    const handleOnTaskConfirm = () => {
        if (pendingDeleteTaskId === null) return

        handleDeleteTask(pendingDeleteTaskId)
    }

    const handleCancelDelete = () => {
        setPendingDeleteTaskId(null)
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-lg">
            <ConfirmDialog
                open={pendingDeleteTaskId !== null}
                isDeleting={deletingId !== null}
                onConfirm={handleOnTaskConfirm}
                onCancel={handleCancelDelete}
                confirmLabel="Are you sure you want to delete this task?"
            />

            <PageHeader title="What's next" subtitle={`${openCount} open ${openCount === 1 ? 'task' : 'tasks'}`}>
                <button onClick={handleAddTask} className={buttonClass}>
                    Add a task
                </button>
            </PageHeader>

            {showTaskForm && (
                <TaskForm
                    task={editingTask}
                    clients={clients}
                    onSubmit={handleSaveTask}
                    onCancel={handleCloseTaskForm}
                />
            )}

            <div className="flex flex-wrap gap-x-6 mb-6">
                {filters.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        aria-pressed={filter === key}
                        className={`min-h-11 cursor-pointer underline-offset-4 hover:text-accent ${
                            filter === key ? 'font-semibold underline decoration-accent decoration-2' : ''
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {visibleTasks.length === 0 ? (
                <p className="py-12 text-center">
                    {filter === 'all'
                        ? 'Nothing on your list yet. Add a task to get started.'
                        : `No tasks marked ${statusLabels[filter].toLowerCase()}.`}
                </p>
            ) : (
                <ul className="border-b border-ink">
                    {visibleTasks.map((task) => {
                        const isDone = task.status === 'completed'
                        const due = describeDue(task.due_date)

                        return (
                            <li
                                key={task.id}
                                className="flex flex-wrap justify-between items-center gap-x-8 gap-y-3 py-5 border-t border-ink"
                            >
                                <div className="flex-[3_1_18rem] min-w-0">
                                    <h2 className="font-display text-3xl leading-tight break-words">{task.title}</h2>
                                    {task.description && <p className="mt-1">{task.description}</p>}
                                    <p className="mt-1">
                                        <Link
                                            href={`/clients/${task.client.id}`}
                                            className="underline underline-offset-4 hover:text-accent"
                                        >
                                            {task.client.name}
                                        </Link>
                                        , {task.priority} priority
                                    </p>
                                    <p
                                        className={
                                            !isDone && due.needsYou ? 'italic font-semibold text-accent' : 'italic'
                                        }
                                    >
                                        {isDone ? 'Done' : due.label}
                                    </p>
                                </div>

                                <div className="flex-[1_1_15rem] min-w-0 flex flex-wrap items-end gap-x-4 gap-y-2">
                                    <div>
                                        <label htmlFor={`status-${task.id}`} className="block text-base">
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
                                    </div>
                                    <button
                                        onClick={() => handleEditTask(task)}
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
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
