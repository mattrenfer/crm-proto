import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.string().optional(),
});

export const taskWithClientSchema = taskSchema.extend({
    client_id: z.string().min(1, 'Choose a client'),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export type TaskWithClientFormData = z.infer<typeof taskWithClientSchema>;

export const noteSchema = z.object({
    content: z.string().min(1, 'Note content is required'),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
});

export type NoteFormData = z.infer<typeof noteSchema>;

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'], // Error shows on confirmPassword field
    });

export type SignupFormData = z.infer<typeof signupSchema>;

export const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(100),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
