export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    created_at: string;
    updated_at: string;
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
}

export interface Note {
    id: string;
    client_id: string;
    content: string;
    created_at: string;
}

export const MOCK_CLIENTS: Client[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        company: 'Tech Solutions Inc.',
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-01-15T09:00:00Z',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        company: 'Marketing Pro',
        created_at: '2025-01-16T10:30:00Z',
        updated_at: '2025-01-16T10:30:00Z',
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1-555-0125',
        company: 'Design Studio',
        created_at: '2025-01-17T14:15:00Z',
        updated_at: '2025-01-17T14:15:00Z',
    },
    {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1-555-0126',
        company: 'Wilson Consulting',
        created_at: '2025-01-18T11:45:00Z',
        updated_at: '2025-01-18T11:45:00Z',
    },
    {
        id: '5',
        name: 'Mike Chen',
        email: 'mike.chen@startup.com',
        phone: '+1-555-0127',
        company: 'StartupXYZ',
        created_at: '2025-01-19T16:20:00Z',
        updated_at: '2025-01-19T16:20:00Z',
    },
];

export const MOCK_TASKS: Task[] = [
    {
        id: '1',
        client_id: '1',
        title: 'Initial consultation',
        description:
            'Schedule and conduct initial project consultation with the client',
        status: 'pending',
        priority: 'high',
        due_date: '2025-07-25',
        created_at: '2025-07-19T09:00:00Z',
        updated_at: '2025-07-19T09:00:00Z',
    },
    {
        id: '2',
        client_id: '2',
        title: 'Proposal review',
        description: 'Review and finalize project proposal with stakeholders',
        status: 'in_progress',
        priority: 'medium',
        due_date: '2025-07-30',
        created_at: '2025-07-18T14:30:00Z',
        updated_at: '2025-07-19T10:15:00Z',
    },
    {
        id: '3',
        client_id: '3',
        title: 'Design mockups',
        description: 'Create initial design mockups for review and approval',
        status: 'completed',
        priority: 'medium',
        due_date: '2025-07-20',
        created_at: '2025-07-15T11:00:00Z',
        updated_at: '2025-07-19T16:45:00Z',
    },
    {
        id: '4',
        client_id: '4',
        title: 'Contract negotiation',
        description: 'Finalize contract terms and pricing structure',
        status: 'in_progress',
        priority: 'high',
        due_date: '2025-07-22',
        created_at: '2025-07-17T13:20:00Z',
        updated_at: '2025-07-19T09:30:00Z',
    },
    {
        id: '5',
        client_id: '5',
        title: 'Technical requirements gathering',
        description:
            'Collect detailed technical requirements and specifications',
        status: 'pending',
        priority: 'medium',
        due_date: '2025-07-28',
        created_at: '2025-07-19T08:45:00Z',
        updated_at: '2025-07-19T08:45:00Z',
    },
    {
        id: '6',
        client_id: '1',
        title: 'Follow-up meeting',
        description: 'Schedule follow-up meeting to discuss project progress',
        status: 'pending',
        priority: 'low',
        created_at: '2025-07-19T15:00:00Z',
        updated_at: '2025-07-19T15:00:00Z',
    },
    {
        id: '7',
        client_id: '2',
        title: 'Budget approval',
        description: 'Get final budget approval from finance team',
        status: 'completed',
        priority: 'high',
        due_date: '2025-07-21',
        created_at: '2025-07-16T10:30:00Z',
        updated_at: '2025-07-18T14:20:00Z',
    },
];

export const MOCK_NOTES: Note[] = [
    {
        id: '1',
        client_id: '1',
        content:
            'Initial contact made. Client interested in web development project.',
        created_at: '2025-07-19T09:15:00Z',
    },
    {
        id: '2',
        client_id: '1',
        content:
            'Follow-up call scheduled for next week to discuss requirements.',
        created_at: '2025-07-19T15:30:00Z',
    },
    {
        id: '3',
        client_id: '2',
        content: 'Proposal sent. Waiting for feedback from stakeholders.',
        created_at: '2025-07-18T14:45:00Z',
    },
];

// Utility functions for dashboard metrics
export const getDashboardStats = () => {
    const totalClients = MOCK_CLIENTS.length;
    const activeTasks = MOCK_TASKS.filter(
        task => task.status === 'pending' || task.status === 'in_progress',
    ).length;
    const pendingTasks = MOCK_TASKS.filter(
        task => task.status === 'pending',
    ).length;

    return {
        totalClients,
        activeTasks,
        pendingTasks,
    };
};
