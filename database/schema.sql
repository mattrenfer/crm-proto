-- Simple CRM Database Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies (these are basic policies - adjust based on your authentication needs)
-- For now, allow all operations for authenticated users

-- Clients policies
CREATE POLICY "Allow all operations for clients" ON public.clients
FOR ALL USING (true);

-- Tasks policies
CREATE POLICY "Allow all operations for tasks" ON public.tasks
FOR ALL USING (true);

-- Notes policies
CREATE POLICY "Allow all operations for notes" ON public.notes
FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON public.notes(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- Insert some sample data (optional)
INSERT INTO public.clients (name, email, phone, company) VALUES
('John Doe', 'john.doe@example.com', '+1-555-0123', 'Tech Solutions Inc.'),
('Jane Smith', 'jane.smith@example.com', '+1-555-0124', 'Marketing Pro'),
('Bob Johnson', 'bob.johnson@example.com', '+1-555-0125', 'Design Studio')
ON CONFLICT (email) DO NOTHING;

-- Get the client IDs for sample tasks (you'll need to adjust these UUIDs)
-- Insert sample tasks (uncomment and run after creating clients)
/*
INSERT INTO public.tasks (client_id, title, description, status, priority, due_date) VALUES
((SELECT id FROM public.clients WHERE email = 'john.doe@example.com'), 'Initial consultation', 'Schedule and conduct initial project consultation', 'pending', 'high', '2025-07-25'),
((SELECT id FROM public.clients WHERE email = 'jane.smith@example.com'), 'Proposal review', 'Review and finalize project proposal', 'in_progress', 'medium', '2025-07-30'),
((SELECT id FROM public.clients WHERE email = 'bob.johnson@example.com'), 'Design mockups', 'Create initial design mockups for review', 'completed', 'medium', '2025-07-20');

-- Insert sample notes
INSERT INTO public.notes (client_id, content) VALUES
((SELECT id FROM public.clients WHERE email = 'john.doe@example.com'), 'Client is interested in a full website redesign. Prefers modern, minimalist design. Budget range: $10k-15k.'),
((SELECT id FROM public.clients WHERE email = 'jane.smith@example.com'), 'Discussed marketing strategy. Client wants to focus on social media presence and SEO optimization.'),
((SELECT id FROM public.clients WHERE email = 'bob.johnson@example.com'), 'Client approved the initial design concepts. Ready to move forward with development phase.');
*/
