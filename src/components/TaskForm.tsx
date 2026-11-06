'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass, errorClass, inputClass, labelClass, secondaryButtonClass } from '@/lib/formStyles'
import { statusLabels } from '@/lib/tasks'
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
        setFocus,
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

    // Moves keyboard and screen reader users straight into the form when it opens
    useEffect(() => {
        setFocus('title')
    }, [task, setFocus])

    return (
        <div className="pt-4 border-t border-ink">
            <h2 className="font-display text-2xl mb-5">{task ? 'Edit task' : 'Add a task'}</h2>
            <form onSubmit={handleSubmitTask(onSubmit)} className="space-y-5">
                {clients && (
                    <div>
                        <label htmlFor="task-client" className={labelClass}>
                            Client *
                        </label>
                        <select id="task-client" {...registerTask('client_id')} className={inputClass}>
                            <option value="">Choose a client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {taskErrors.client_id && <p className={errorClass}>{taskErrors.client_id.message}</p>}
                    </div>
                )}
                <div>
                    <label htmlFor="task-title" className={labelClass}>
                        Title *
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        {...registerTask('title')}
                        defaultValue={task?.title}
                        className={inputClass}
                    />
                    {taskErrors.title && <p className={errorClass}>{taskErrors.title.message}</p>}
                </div>
                <div>
                    <label htmlFor="task-description" className={labelClass}>
                        Description
                    </label>
                    <textarea
                        id="task-description"
                        {...registerTask('description')}
                        defaultValue={task?.description}
                        rows={3}
                        className={`${inputClass} py-2`}
                    />
                    {taskErrors.description && <p className={errorClass}>{taskErrors.description.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label htmlFor="task-status" className={labelClass}>
                            Status
                        </label>
                        <select
                            id="task-status"
                            defaultValue={task?.status}
                            {...registerTask('status')}
                            className={inputClass}
                        >
                            <option value="pending">{statusLabels.pending}</option>
                            <option value="in_progress">{statusLabels.in_progress}</option>
                            <option value="completed">{statusLabels.completed}</option>
                        </select>
                        {taskErrors.status && <p className={errorClass}>{taskErrors.status.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="task-priority" className={labelClass}>
                            Priority
                        </label>
                        <select
                            id="task-priority"
                            defaultValue={task?.priority}
                            {...registerTask('priority')}
                            className={inputClass}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        {taskErrors.priority && <p className={errorClass}>{taskErrors.priority.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="task-due-date" className={labelClass}>
                            Due date
                        </label>
                        <input
                            id="task-due-date"
                            defaultValue={task?.due_date ?? ''}
                            type="date"
                            {...registerTask('due_date')}
                            className={inputClass}
                        />
                        {taskErrors.due_date && <p className={errorClass}>{taskErrors.due_date.message}</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        disabled={isSubmittingTask}
                        onClick={() => onCancel()}
                        className={secondaryButtonClass}
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmittingTask} className={buttonClass}>
                        {isSubmittingTask ? 'Saving...' : task ? 'Save changes' : 'Add task'}
                    </button>
                </div>
            </form>
        </div>
    )
}
