import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if Supabase is properly configured
export const isSupabaseConfigured =
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('your_supabase') &&
    !supabaseAnonKey.includes('your_supabase');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
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
