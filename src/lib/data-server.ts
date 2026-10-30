import { createClient } from '@/lib/supabase/server'
import type { Client, Task, Note } from './supabase'

// This data layer is for SERVER COMPONENTS ONLY
// For Client Components, use data.ts instead

/**
 * Dashboard Data Access Functions
 */

export async function getDashboardStats() {
    try {
        const [clients, tasks] = await Promise.all([getClients(), getTasks()])
        const totalClients = clients.length
        const activeTasks = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress').length
        const pendingTasks = tasks.filter((task) => task.status === 'pending').length
        return { totalClients, activeTasks, pendingTasks }
    } catch (error) {
        console.error('Unexpected error in getDashboardStats:', error)
        throw error
    }
}

/**
 * Client Data Access Functions
 */

export async function getClients(): Promise<Client[]> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching clients:', error)
            throw new Error(`Failed to fetch clients: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Unexpected error in getClients:', error)
        throw error
    }
}

export async function getClientById(id: string): Promise<Client | null> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null
            }
            console.error('Error fetching client:', error)
            throw new Error(`Failed to fetch client: ${error.message}`)
        }

        return data
    } catch (error) {
        console.error('Unexpected error in getClientById:', error)
        throw error
    }
}

/**
 * Task Data Access Functions
 */

export async function getTasks(): Promise<Task[]> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks:', error)
            throw new Error(`Failed to fetch tasks: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Unexpected error in getTasks:', error)
        throw error
    }
}

export async function getTasksByClientId(clientId: string): Promise<Task[]> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks for client:', error)
            throw new Error(`Failed to fetch tasks: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Unexpected error in getTasksByClientId:', error)
        throw error
    }
}

/**
 * Note Data Access Functions
 */

export async function getNotesByClientId(clientId: string): Promise<Note[]> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching notes for client:', error)
            throw new Error(`Failed to fetch notes: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Unexpected error in getNotesByClientId:', error)
        throw error
    }
}
