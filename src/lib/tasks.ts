import type { Task } from '@/lib/supabase'

const priorityRank: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 }

/**
 * Most urgent first: earliest due date, then tasks with no due date, then higher priority.
 * Completed tasks are left out. Due dates are 'YYYY-MM-DD', so they compare correctly as text.
 */
export function sortByUrgency(tasks: Task[]): Task[] {
    return tasks
        .filter((task) => task.status !== 'completed')
        .sort((a, b) => {
            if (a.due_date && b.due_date && a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1
            if (a.due_date && !b.due_date) return -1
            if (!a.due_date && b.due_date) return 1
            return priorityRank[a.priority] - priorityRank[b.priority]
        })
}

// Each client's most urgent open task, for showing what's next beside their name.
export function getNextTaskByClient(tasks: Task[]): Map<string, Task> {
    const next = new Map<string, Task>()
    for (const task of sortByUrgency(tasks)) {
        if (!next.has(task.client_id)) next.set(task.client_id, task)
    }
    return next
}
