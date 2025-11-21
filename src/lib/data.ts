import { supabase } from './supabase';
import type { Client, Task, Note } from './supabase';

/**
 * Client Data Access Functions
 */

export async function getClients(): Promise<Client[]> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
            throw new Error(`Failed to fetch clients: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error in getClients:', error);
        throw error;
    }
}

export async function getClientById(id: string): Promise<Client | null> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            console.error('Error fetching client:', error);
            throw new Error(`Failed to fetch client: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Unexpected error in getClientById:', error);
        throw error;
    }
}

export async function createClient(
    clientData: Partial<Client>,
): Promise<Client> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .insert(clientData)
            .select()
            .single();

        if (error) {
            console.error('Error creating client:', error);
            throw new Error(`Failed to create client: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Unexpected error in createClient:', error);
        throw error;
    }
}

export async function deleteClient(id: string): Promise<void> {
    try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) {
            console.error('Error deleting client:', error);
            throw new Error(`Failed to delete client: ${error.message}`);
        }
    } catch (error) {
        console.error('Unexpected error in deleteClient:', error);
        throw error;
    }
}

/**
 * Task Data Access Functions (for future use)
 */

export async function getTasks(): Promise<Task[]> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw new Error(`Failed to fetch tasks: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error in getTasks:', error);
        throw error;
    }
}

export async function getTasksByClientId(clientId: string): Promise<Task[]> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks for client:', error);
            throw new Error(`Failed to fetch tasks: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error in getTasksByClientId:', error);
        throw error;
    }
}

export async function createTask(
    clientId: string,
    taskData: Partial<Task>,
): Promise<Task> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert({ client_id: clientId, ...taskData })
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            throw new Error(`Failed to create task: ${error.message}`);
        }
        return data;
    } catch (error) {
        console.error('Unexpected error in createTask:', error);
        throw error;
    }
}

export async function updateTask(
    id: string,
    taskData: Partial<Task>,
): Promise<Task> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(taskData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            throw new Error(`Failed to update task: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Unexpected error in updateTask:', error);
        throw error;
    }
}

export async function deleteTask(id: string): Promise<void> {
    try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
            console.error('Error deleting task:', error);
            throw new Error(`Failed to delete task: ${error.message}`);
        }
    } catch (error) {
        console.error('Unexpected error in deleteTask:', error);
        throw error;
    }
}

/**
 * Note Data Access Functions (for future use)
 */

export async function getNotesByClientId(clientId: string): Promise<Note[]> {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notes for client:', error);
            throw new Error(`Failed to fetch notes: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error in getNotesByClientId:', error);
        throw error;
    }
}

export async function createNote(
    clientId: string,
    content: string,
): Promise<Note> {
    try {
        const { data, error } = await supabase
            .from('notes')
            .insert({ client_id: clientId, content })
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            throw new Error(`Failed to create note: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Unexpected error in createNote:', error);
        throw error;
    }
}

export async function deleteNote(id: string): Promise<void> {
    try {
        const { error } = await supabase.from('notes').delete().eq('id', id);

        if (error) {
            console.error('Error deleting note:', error);
            throw new Error(`Failed to delete note: ${error.message}`);
        }
    } catch (error) {
        console.error('Unexpected error in deleteNote:', error);
        throw error;
    }
}
