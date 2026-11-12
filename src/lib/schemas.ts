import { z } from 'zod'

export const clientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Names can be up to 100 characters'),
    email: z.string().email('Invalid email address').max(255, 'Emails can be up to 255 characters'),
    phone: z.string().max(50, 'Phone numbers can be up to 50 characters').optional(),
    company: z.string().max(255, 'Company names can be up to 255 characters').optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Titles can be up to 255 characters'),
    description: z.string().max(2000, 'Descriptions can be up to 2,000 characters').optional(),
    status: z.enum(['pending', 'in_progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.string().optional(),
})

export const taskWithClientSchema = taskSchema.extend({
    client_id: z.string().min(1, 'Choose a client'),
})

export type TaskFormData = z.infer<typeof taskSchema>

export type TaskWithClientFormData = z.infer<typeof taskWithClientSchema>

export const noteSchema = z.object({
    content: z.string().min(1, 'Note content is required').max(5000, 'Notes can be up to 5,000 characters'),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
})

export type NoteFormData = z.infer<typeof noteSchema>

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'], // Error shows on confirmPassword field
    })

export type SignupFormData = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(100, 'Names can be up to 100 characters'),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
})

export type UserFormData = z.infer<typeof userSchema>
