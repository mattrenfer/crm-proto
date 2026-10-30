// Shared database types (the legacy non-SSR client that lived here was removed in Ticket 3.6;
// use @/lib/supabase/client or @/lib/supabase/server)
// Database types
export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Task {
    id: string;
    client_id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Note {
    id: string;
    client_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}
