'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { taskWithClientSchema, TaskWithClientFormData } from '@/lib/schemas'
import { Task } from '@/lib/supabase'
import { useEffect } from 'react'
import { Client } from '@/lib/supabase'

export default function TaskForm({
    task,
    clients,
    onSubmit,
    onCancel,
    clientId,
}: {
    task: Task | null
    clients: Client[] | null
    onSubmit: (data: TaskWithClientFormData) => Promise<void>
    onCancel: () => void
    clientId?: string
}) {
    const {
        register: registerTask,
        handleSubmit: handleSubmitTask,
        formState: { errors: taskErrors, isSubmitting: isSubmittingTask },
        reset: resetTaskForm,
    } = useForm<TaskWithClientFormData>({ resolver: zodResolver(taskWithClientSchema) })
    useEffect(() => {
        if (task) {
            resetTaskForm({
                client_id: task.client_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                due_date: task.due_date ?? '',
            })
        } else {
            resetTaskForm({
                client_id: clientId ?? '',
                title: '',
                description: '',
                status: 'pending',
                priority: 'low',
                due_date: '',
            })
        }
    }, [task, clientId, resetTaskForm])

    return (
        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {task ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmitTask(onSubmit)} className="space-y-4">
                {clients && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client *</label>
                        <select
                            {...registerTask('client_id')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select Client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {taskErrors && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {taskErrors.client_id?.message}
                            </p>
                        )}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
                    <input
                        type="text"
                        {...registerTask('title')}
                        defaultValue={task?.title}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {taskErrors && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{taskErrors.title?.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        {...registerTask('description')}
                        defaultValue={task?.description}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {taskErrors && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{taskErrors.description?.message}</p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            defaultValue={task?.status}
                            {...registerTask('status')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        {taskErrors && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{taskErrors.status?.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                        <select
                            defaultValue={task?.priority}
                            {...registerTask('priority')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        {taskErrors && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {taskErrors.priority?.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                        <input
                            defaultValue={task?.due_date ?? ''}
                            type="date"
                            {...registerTask('due_date')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {taskErrors && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {taskErrors.due_date?.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        disabled={isSubmittingTask}
                        onClick={() => onCancel()}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmittingTask}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        {isSubmittingTask ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
                    </button>
                </div>
            </form>
        </div>
    )
}
