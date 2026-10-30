# Learning Notes - CRM Project

**Author**: Matthew Russell Renfer
**Started**: November 17, 2025
**Purpose**: Document patterns, concepts, and learnings throughout this project

---

## Table of Contents

### Phase 1: Foundation - Database Connection
- [Architecture Patterns](#architecture-patterns)
- [Ticket 1.2: Data Access Layer](#ticket-12-data-access-layer)
- [Ticket 1.3: Client Write Operations](#ticket-13-client-write-operations)
- [Ticket 1.4: Task CRUD - Full Implementation](#ticket-14-task-crud---full-implementation)
- [Ticket 1.5: Notes CRUD - Reinforcement](#ticket-15-notes-crud---reinforcement)
- [Ticket 1.6: Dashboard Real-Time Stats](#ticket-16-dashboard-real-time-stats)

### Phase 2: Authentication & Security
- [Ticket 2.1: Supabase Auth Setup](#ticket-21-supabase-auth-setup)
- [Ticket 2.2: Auth UI - Login Page](#ticket-22-auth-ui---login-page)
- [Ticket 2.3: Auth UI - Signup Page](#ticket-23-auth-ui---signup-page)
- [Ticket 2.4: Session Management & Context](#ticket-24-session-management--context)
- [Ticket 2.5: Protected Routes & Middleware](#-ticket-25-protected-routes--middleware)

### Phase 3: Polish & Production Readiness
- [Ticket 3.1: Form Validation Library](#-ticket-31-form-validation-library)
- [Ticket 3.7: Edit Clients, Tasks & Notes](#-ticket-37-edit-clients-tasks--notes)
- [Ticket 3.3: Toast Notifications System](#-ticket-33-toast-notifications-system)
- [Ticket 3.2: Loading States & Skeletons](#-ticket-32-loading-states--skeletons)
- [Ticket 3.4: Confirmation Dialogs](#-ticket-34-confirmation-dialogs)
- [Ticket 3.5: Error Boundaries & 404 Pages](#-ticket-35-error-boundaries--404-pages)
- [Ticket 3.6: Environment & Build Configuration](#-ticket-36-environment--build-configuration)

### Reference
- [Data Update Patterns: Refetch vs Server-Confirmed vs Optimistic](#-data-update-patterns-refetch-vs-server-confirmed-vs-optimistic) (correction to 1.3 / 1.4)
- [Editor Shortcuts & Tooling](#-editor-shortcuts--tooling-vs-code--cursor-windows)

---

## Architecture Patterns

### Overview
This project follows industry-standard architectural patterns to ensure maintainability, testability, and scalability.

---

## Ticket 1.2: Data Access Layer

**Completed**: November 17, 2025
**What We Built**: Supabase data access functions for Client CRUD operations (Read only)

### 🏗️ The Pattern: Data Access Layer (DAL)

#### Architecture Overview
```
UI Layer (React Components)
    ↓ calls
Data Access Layer (src/lib/data.ts)
    ↓ uses
Database Client (src/lib/supabase.ts)
    ↓ connects to
Database (Supabase/PostgreSQL)
```

#### Key Principles

##### 1. Separation of Concerns

```typescript
// ❌ BAD: Database logic mixed in component
function ClientsPage() {
  useEffect(() => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    setClients(data)
  }, [])
}

// ✅ GOOD: Component calls abstraction
function ClientsPage() {
  useEffect(() => {
    const data = await getClients()
    setClients(data)
  }, [])
}
```

**Why?**
- Component doesn't care HOW data is fetched
- Component only cares WHAT data it gets
- If you switch from Supabase to Firebase tomorrow, you only change `data.ts`, not every component

##### 2. Single Source of Truth

All database queries live in ONE place (`src/lib/data.ts`):
- Easy to find bugs
- Easy to add logging/monitoring
- Easy to add caching
- Easy to test

##### 3. Error Handling Pattern

```typescript
export async function getClients(): Promise<Client[]> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')

        if (error) {
            // Handle Supabase-specific errors
            throw new Error(`Failed to fetch clients: ${error.message}`)
        }

        return data || []
    } catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error:', error)
        throw error
    }
}
```

**Pattern breakdown:**
1. **Try/catch wrapper** - catches all errors
2. **Check for operation error** - Supabase returns `{ data, error }`
3. **Throw meaningful error** - don't expose raw database errors to users
4. **Log for debugging** - `console.error` helps you troubleshoot
5. **Re-throw or return** - let caller decide what to do

##### 4. Type Safety

```typescript
export async function getClients(): Promise<Client[]>
//                                  ^^^^^^^^^^^^^^^^
//                                  Guarantees what you get back
```

TypeScript ensures:
- You know what shape data will be
- Autocomplete works
- Refactoring is safe (rename a field, TS tells you everywhere to update)

---

### 🌍 Is This Universal?

#### YES - The Concept is Universal

Every mature app has this pattern, just with different names:

| Framework/Stack | Pattern Name | Same Concept? |
|----------------|--------------|---------------|
| **Next.js + Supabase** | Data Access Layer | ✅ |
| **Django** | Models/ORM | ✅ |
| **Ruby on Rails** | Active Record | ✅ |
| **Spring (Java)** | Repository Pattern | ✅ |
| **ASP.NET** | Repository + Unit of Work | ✅ |
| **Laravel (PHP)** | Eloquent Models | ✅ |
| **Express.js** | Service Layer | ✅ |

#### The Universal Philosophy:

```
Don't let your UI talk directly to your database
      ↓
Put a layer in between
      ↓
That layer handles:
  - How to fetch data
  - How to handle errors
  - How to transform data
  - How to validate
      ↓
UI just says "give me clients" and doesn't care how
```

---

### 📐 Design Patterns We're Using

#### 1. Repository Pattern (Light Version)

```typescript
// src/lib/data.ts is a "Client Repository"
export async function getClients()
export async function getClientById(id: string)
// Future:
export async function createClient(data)
export async function updateClient(id, data)
export async function deleteClient(id)
```

**What is it?**
- A collection of functions that abstract data access
- Hides implementation details
- Provides a clean API

**Real-world analogy:**
- You go to a library (repository)
- You ask the librarian for a book
- You don't go into the back room and search shelves yourself
- The librarian knows HOW to find it, you just get the book

#### 2. Single Responsibility Principle

Each function does ONE thing:

```typescript
getClients()         // Only fetches clients
getClientById()      // Only fetches ONE client
getTasksByClientId() // Only fetches tasks for a client
```

Not:
```typescript
// ❌ BAD: Does too much
getClientWithTasksAndNotes(id) // Fetches 3 things, harder to reuse
```

#### 3. Fail-Safe Defaults

```typescript
return data || []
//           ^^^ If data is null/undefined, return empty array
```

Your component won't crash if database returns nothing.

---

### 🎯 Why This Approach?

#### 1. Maintainability

Six months from now, you need to add caching:

```typescript
// ✅ Change ONE file
export async function getClients(): Promise<Client[]> {
    // Check cache first
    const cached = await cache.get('clients')
    if (cached) return cached

    // Fetch from DB
    const data = await supabase.from('clients').select('*')

    // Cache it
    await cache.set('clients', data)
    return data
}
```

All components automatically benefit. No changes needed in 10+ files.

#### 2. Testability

```typescript
// Easy to mock in tests
jest.mock('@/lib/data', () => ({
  getClients: jest.fn(() => Promise.resolve([/* mock data */]))
}))
```

#### 3. Flexibility

Want to switch databases?

```typescript
// Old: Supabase
export async function getClients() {
    const { data } = await supabase.from('clients').select('*')
    return data
}

// New: Firebase (just change this file)
export async function getClients() {
    const snapshot = await db.collection('clients').get()
    return snapshot.docs.map(doc => doc.data())
}

// UI components? No changes needed! ✅
```

#### 4. Security

```typescript
// Can add auth checks in ONE place
export async function getClients(): Promise<Client[]> {
    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Add user filter (RLS will do this later, but you could here too)
    const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id) // Only their data

    return data || []
}
```

---

### 🔍 Alternative Approaches

#### Approach 1: Direct Database Calls (What You Could Have Done)

```typescript
// In component
const { data } = await supabase.from('clients').select('*')
```

**Pros:**
- ✅ Faster to write initially
- ✅ Less code

**Cons:**
- ❌ Supabase logic spreads across 20 files
- ❌ Hard to change database later
- ❌ Hard to test
- ❌ Hard to add logging/caching
- ❌ Security checks duplicated everywhere

#### Approach 2: Full Repository Pattern (Enterprise)

```typescript
class ClientRepository {
    async findAll(): Promise<Client[]>
    async findById(id: string): Promise<Client>
    async create(data: CreateClientDTO): Promise<Client>
    async update(id: string, data: UpdateClientDTO): Promise<Client>
    async delete(id: string): Promise<void>
}
```

**Pros:**
- ✅ Very organized
- ✅ Easy to test with dependency injection

**Cons:**
- ❌ More boilerplate
- ❌ Overkill for small projects

#### Approach 3: What We Did (Sweet Spot)

```typescript
// Simple functions, clear purpose
export async function getClients()
export async function createClient(data)
```

**Pros:**
- ✅ Simple and clear
- ✅ Easy to understand
- ✅ Gets all the benefits
- ✅ Not over-engineered

**Cons:**
- ❌ Not as formal as OOP repository pattern (but do you need that?)

---

### 🎓 Learning Path Evolution

As you grow, you'll see variations:

**Week 1 (Now):**
```typescript
src/lib/data.ts  // All data functions
```

**Month 2:**
```typescript
src/lib/repositories/
  ├── clients.ts
  ├── tasks.ts
  └── notes.ts
```

**Month 6:**
```typescript
src/
  ├── repositories/    // Data access
  ├── services/        // Business logic
  └── validators/      // Data validation
```

**Year 1:**
```typescript
src/
  ├── domain/          // Business entities
  ├── infrastructure/  // Database, external APIs
  ├── application/     // Use cases
  └── presentation/    // UI components
```

---

### 💡 Key Takeaways

**The pattern we just learned is:**
1. ✅ Industry standard
2. ✅ Used by every major framework
3. ✅ The "right way" for production apps
4. ✅ Scales from small to large projects

**Core principle across ALL stacks:**
> "Put a layer between your UI and your database. Always."

---

### 📝 What We Implemented

**Files Created:**
- `src/lib/data.ts` - Data access layer with client read operations

**Functions Implemented:**
- `getClients()` - Fetch all clients from database
- `getClientById(id)` - Fetch single client by ID
- `getTasks()` - Fetch all tasks (for future use)
- `getTasksByClientId(clientId)` - Fetch tasks for a specific client
- `getNotesByClientId(clientId)` - Fetch notes for a specific client

**Files Modified:**
- `src/app/clients/page.tsx` - Updated to use `getClients()`
- `src/app/clients/[id]/page.tsx` - Updated to use `getClientById()`, `getTasksByClientId()`, `getNotesByClientId()`

**What We Learned:**
- ✅ Supabase `.select()` queries
- ✅ Filtering with `.eq()` and `.single()`
- ✅ Async/await patterns in React
- ✅ Error handling in data fetching
- ✅ Loading states in Next.js Client Components
- ✅ `Promise.all()` for parallel data fetching

---

## Ticket 1.3: Client Write Operations

**Completed**: November 17, 2025
**What We Built**: First write operations (CREATE and DELETE) for clients with user feedback

### 🎯 The Milestone

This was our **first time writing data** to the database! Until now, we only read data (Ticket 1.2). This ticket introduced:
- Creating new records
- Deleting records
- Optimistic UI updates
- User feedback with toast notifications

---

### 🆕 Pattern 1: First CREATE Operation

#### The `.insert()` Pattern

```typescript
export async function createClient(
    clientData: Partial<Client>,
): Promise<Client> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .insert(clientData)      // ← NEW! Write to database
            .select()                 // ← Return the created record
            .single()                 // ← Expect exactly one result

        if (error) throw new Error(`Failed to create client: ${error.message}`)
        return data
    } catch (error) {
        console.error('Unexpected error in createClient:', error)
        throw error
    }
}
```

**Why `.select().single()`?**
- `.insert()` alone doesn't return the created record
- `.select()` fetches the newly created record
- `.single()` ensures we get one record, not an array
- The database generates `id`, `created_at`, `updated_at` - we need those!

**Real-world usage:**
```typescript
const newClient = {
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "555-0100"
}

const created = await createClient(newClient)
console.log(created.id)          // "uuid-generated-by-db"
console.log(created.created_at)  // "2025-11-17T10:30:00Z"
```

---

### 🗑️ Pattern 2: First DELETE Operation

#### The `.delete()` Pattern

```typescript
export async function deleteClient(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('clients')
            .delete()           // ← NEW! Delete from database
            .eq('id', id)       // ← WHERE clause (which row to delete)

        if (error) throw new Error(`Failed to delete client: ${error.message}`)
    } catch (error) {
        console.error('Unexpected error in deleteClient:', error)
        throw error
    }
}
```

**Key differences from CREATE:**
- Returns `Promise<void>` (no data needed back)
- Uses `.eq('id', id)` to specify which record to delete
- No `.select()` needed (we don't care about the deleted data)

**CASCADE behavior:**
Remember from your `schema.sql`:
```sql
client_id UUID REFERENCES clients(id) ON DELETE CASCADE
```

When you delete a client, the database **automatically deletes**:
- All tasks for that client
- All notes for that client

This is handled at the database level - your code doesn't need to worry about it!

---

### 🎨 Pattern 3: First Optimistic UI Update

> ⚠️ **Correction (Oct 2026):** this is **not** an optimistic update. The code still `await`s the server before changing the screen; what this ticket actually did was remove the *refetch*. It's a **server-confirmed** (pessimistic) update. See [Data Update Patterns](#-data-update-patterns-refetch-vs-server-confirmed-vs-optimistic).

#### Before: Pessimistic Updates (Slow)

```typescript
// ❌ Old way: Wait for API, then update UI
const addClient = async () => {
    setLoading(true)
    const created = await createClient(newClient)  // Wait...
    await loadClients()                            // Refetch all clients...
    setLoading(false)                              // Finally update UI
}
// User sees: Spinner → Wait → Spinner → Data appears
```

#### After: Optimistic Updates (Fast!)

```typescript
// ✅ New way: Update UI immediately
const addClient = async () => {
    const created = await createClient(newClient)
    setClients([created, ...clients])  // ← Add to existing array immediately!
    toast.success('Client added successfully!')
}
// User sees: Click → Data appears instantly!
```

**The Pattern:**
1. Call API to create record
2. Get back the created record (with DB-generated fields)
3. Add it to the front of your state array: `[created, ...clients]`
4. UI updates instantly - no refetch needed!

**Why put new item first?**
```typescript
[created, ...clients]  // New client at top
// vs
[...clients, created]  // New client at bottom
```

We put it first because our query sorts by `created_at DESC` (newest first), so the UI matches the database order.

---

### 🔔 Pattern 4: Toast Notifications

#### Installing the Library

```bash
npm install react-hot-toast
```

#### Basic Usage

```typescript
import toast from 'react-hot-toast'

// Success message
toast.success('Client added successfully!')

// Error message
toast.error('Failed to add client. Please try again.')

// Info message
toast('Processing...')
```

#### Why Toast Over Alert?

```typescript
// ❌ Old way: Blocks the entire UI
alert('Client added!')  // User can't do anything until they click OK

// ✅ New way: Non-blocking notification
toast.success('Client added!')  // User can keep working, toast auto-dismisses
```

**Toast benefits:**
- Non-blocking (user can keep working)
- Auto-dismisses after 3-4 seconds
- Styled to match your app
- Stacks multiple messages
- Can include actions (undo, retry, etc.)

---

### 🎯 Component Integration Pattern

#### The Full Flow in `clients/page.tsx`

```typescript
const addClient = async (e: React.FormEvent) => {
    e.preventDefault()  // Don't reload page

    try {
        // 1. Create in database
        const created = await createClient(newClient)

        // 2. Update UI optimistically
        setClients([created, ...clients])

        // 3. Reset form
        setNewClient({ name: '', email: '', phone: '', company: '', status: 'active' })

        // 4. Success feedback
        toast.success('Client added successfully!')

        // 5. Hide form (optional)
        setShowForm(false)
    } catch (error) {
        console.error('Failed to add client:', error)
        toast.error('Failed to add client. Please try again.')
    }
}
```

**Why this order matters:**
1. API call first (get the generated ID and timestamps)
2. Update state with the complete record
3. Reset form so it's empty for next add
4. Show success message
5. Close form to reduce visual clutter

---

### 🔄 Delete Pattern with Confirmation

```typescript
const handleDeleteClient = async (id: string) => {
    // 1. Confirm before destructive action
    if (!confirm('Are you sure you want to delete this client?')) {
        return  // User cancelled
    }

    try {
        // 2. Delete from database
        await deleteClient(id)

        // 3. Remove from UI
        setClients(clients.filter(c => c.id !== id))

        // 4. Success feedback
        toast.success('Client deleted successfully!')
    } catch (error) {
        console.error('Failed to delete client:', error)
        toast.error('Failed to delete client. Please try again.')
    }
}
```

**Key insight:** `.filter()` creates a new array without the deleted client:
```typescript
clients.filter(c => c.id !== id)
// Keeps all clients EXCEPT the one with matching id
```

---

### 🌍 Universal Patterns

| Pattern | This Ticket | Used In |
|---------|-------------|---------|
| **INSERT returning data** | `.insert().select().single()` | Supabase, PostgreSQL, SQL Server |
| **DELETE by ID** | `.delete().eq('id', id)` | All databases |
| **Optimistic updates** | Update state before server confirms | React, Vue, Angular, Svelte |
| **Toast notifications** | Non-blocking feedback | All modern web apps |
| **Cascade deletes** | Database handles related records | All relational databases |

---

### 📝 What We Implemented

**Files Modified:**
- `src/lib/data.ts` - Added `createClient()` and `deleteClient()` functions
- `src/app/clients/page.tsx` - Hooked up forms to Supabase functions, added toast notifications

**Functions Added:**
```typescript
createClient(clientData: Partial<Client>): Promise<Client>
deleteClient(id: string): Promise<void>
```

**UI Improvements:**
- ✅ Add Client form now creates real database records
- ✅ Delete button actually deletes from database
- ✅ Toast notifications for user feedback
- ✅ Optimistic UI updates (instant feedback)
- ✅ Form resets after successful submission

---

### 🎓 What We Learned

**Supabase Operations:**
- ✅ `.insert()` - Create new records
- ✅ `.delete()` - Remove records
- ✅ `.select().single()` - Return created record with generated fields
- ✅ `.eq()` - Filter by column value (WHERE clause)

**React Patterns:**
- ✅ Optimistic UI updates with array spread
- ✅ Array filtering for removals
- ✅ Form reset after submission
- ✅ Event prevention with `e.preventDefault()`

**User Experience:**
- ✅ Toast notifications (react-hot-toast)
- ✅ Confirmation dialogs for destructive actions
- ✅ Success/error feedback

**TypeScript:**
- ✅ `Partial<Client>` for flexible client creation
- ✅ `Promise<void>` for operations that don't return data

---

### 💭 Design Decisions

#### Why `Partial<Client>` for Creation?

```typescript
// User doesn't provide these - database generates them
interface Client {
    id: string           // ← Generated by database
    name: string
    email?: string
    phone?: string
    company?: string
    status: string
    created_at: string   // ← Generated by database
    updated_at: string   // ← Generated by database
}

// So we use Partial<Client> to make all fields optional
createClient(clientData: Partial<Client>)
```

This lets users pass only the fields they have:
```typescript
createClient({ name: "Acme Corp", email: "hi@acme.com" })
// Don't need to pass id, created_at, etc.
```

#### Why Optimistic Updates?

**User perception:**
- Pessimistic: "The app is slow, I'm waiting..."
- Optimistic: "Wow, that was instant!"

The API call still happens (for persistence), but the UI doesn't wait for it. This is the standard pattern for modern web apps.

---

### 🔗 Connection to Ticket 1.4

Ticket 1.3 laid the foundation for 1.4:
- **1.3**: Simple CREATE and DELETE for clients (single table)
- **1.4**: Full CRUD for tasks (with client joins, status updates, complex UI)

The patterns learned here (optimistic updates, toast, Partial<T>) were reused and expanded in 1.4. See [Ticket 1.4](#ticket-14-task-crud---full-implementation) for deeper pattern explanations.

---

### 💡 Key Takeaways

**Core principle:**
> "Write operations follow the same error handling pattern as reads - try/catch with descriptive errors, but now we return the created/modified data for optimistic UI updates."

**The progression:**
1. **Ticket 1.2**: Read data ✅
2. **Ticket 1.3**: Write data ✅
3. **Ticket 1.4**: Complex operations (joins, updates) ✅

---

## Ticket 1.4: Task CRUD - Full Implementation

**Completed**: November 21, 2025
**What We Built**: Complete Task CRUD operations with client-side data joins and optimistic UI updates

### 🎯 The Challenge

We needed to:
1. Add CREATE, UPDATE, DELETE operations for tasks (we already had READ from 1.2)
2. Replace all mock task data with real Supabase queries
3. Display tasks with their client names (requires joining two tables)
4. Handle status updates across multiple UI locations
5. Implement proper error handling and user feedback

---

### 🧩 Pattern 1: Completing the CRUD Pattern

#### The Full CRUD Suite

```typescript
// READ operations (from Ticket 1.2)
export async function getTasks(): Promise<Task[]>
export async function getTasksByClientId(clientId: string): Promise<Task[]>

// WRITE operations (Ticket 1.4 - NEW!)
export async function createTask(clientId: string, taskData: Partial<Task>): Promise<Task>
export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task>
export async function deleteTask(id: string): Promise<void>
```

This gives us full control over the tasks table with clean, reusable functions.

---

### 🏗️ Pattern 2: The `Partial<T>` TypeScript Utility

#### What Is `Partial<T>`?

```typescript
// Without Partial - you'd need to pass ALL fields:
interface Task {
    id: string
    client_id: string
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    due_date?: string
    created_at: string
    updated_at: string
}

// ❌ BAD: Must pass everything
function updateTask(id: string, task: Task) // Too strict!

// ✅ GOOD: Only pass what you want to update
function updateTask(id: string, task: Partial<Task>) // Flexible!
```

#### How `Partial<T>` Works

`Partial<Task>` transforms the type to:

```typescript
{
    id?: string
    client_id?: string
    title?: string
    description?: string
    // ... all fields become optional
}
```

#### Real-World Usage

```typescript
// Update just the status
await updateTask('task-123', { status: 'completed' })

// Update multiple fields
await updateTask('task-123', {
    status: 'completed',
    priority: 'low'
})

// All valid! TypeScript still ensures field names and types are correct
```

**Why This Matters:**
- **Flexibility**: Don't force callers to pass fields that shouldn't change
- **Safety**: TypeScript still catches typos and type errors
- **Real-world pattern**: This is how REST APIs work (PATCH requests)

---

### 🔗 Pattern 3: Client-Side Joins (Denormalization)

#### The Problem: Foreign Keys vs Display Names

**Database structure (normalized):**
```
tasks table:
┌──────────┬───────────┬──────────────┬────────┐
│ id       │ client_id │ title        │ status │
├──────────┼───────────┼──────────────┼────────┤
│ task-1   │ client-a  │ Consultation │ pending│
│ task-2   │ client-b  │ Follow-up    │ done   │
└──────────┴───────────┴──────────────┴────────┘

clients table:
┌───────────┬────────────────┐
│ id        │ name           │
├───────────┼────────────────┤
│ client-a  │ Acme Corp      │
│ client-b  │ TechStart Inc  │
└───────────┴────────────────┘
```

**UI needs:**
```
Display: "Consultation" - Acme Corp
         ↑               ↑
      task.title     task.client.name
```

But `tasks` table only has `client_id`, not `client.name`!

#### Solution: Join in Memory

```typescript
async function loadTasks() {
    // 1. Fetch both tables
    const tasksData = await getTasks()      // Array of tasks
    const clientsData = await getClients()  // Array of clients

    // 2. Create a lookup Map for O(1) access
    const clientsMap = new Map(clientsData.map(c => [c.id, c]))
    // Map { "client-a" => {id: "client-a", name: "Acme Corp", ...}, ... }

    // 3. Join: Add client data to each task
    const tasksWithClients = tasksData.map(task => ({
        ...task,                                   // All task fields
        client: clientsMap.get(task.client_id),   // Add client object
    }))
}
```

**Result:**
```typescript
[
    {
        id: "task-1",
        client_id: "client-a",
        title: "Consultation",
        status: "pending",
        client: {                    // ← NEW! Now you can access task.client.name
            id: "client-a",
            name: "Acme Corp",
            email: "...",
        }
    },
    // ...
]
```

#### Why Use Map Instead of Array.find()?

**Performance comparison** with 100 tasks and 50 clients:

```typescript
// ❌ SLOW: Nested loops (O(n × m))
const tasksWithClients = tasksData.map(task => ({
    ...task,
    client: clientsData.find(c => c.id === task.client_id)
    //                  ↑ For EACH task, searches through ALL clients
}))
// Worst case: 100 × 50 = 5,000 comparisons

// ✅ FAST: Map lookup (O(n + m))
const clientsMap = new Map(clientsData.map(c => [c.id, c]))  // Build once: 50 ops
const tasksWithClients = tasksData.map(task => ({
    ...task,
    client: clientsMap.get(task.client_id)  // Instant lookup!
    //                 ↑ O(1) constant time
}))
// Total: 50 + 100 = 150 operations
```

**Map is 33× faster** in this example!

#### Alternative: SQL Joins (Future Optimization)

You could also join in the database:

```typescript
// Supabase can do SQL joins
const { data } = await supabase
    .from('tasks')
    .select(`
        *,
        client:clients(id, name)
    `)
```

**Pros:**
- ✅ Fewer queries (1 instead of 2)
- ✅ Less data transferred
- ✅ Database does the join (optimized)

**Cons:**
- ❌ More complex query syntax
- ❌ Harder to cache separately
- ❌ Couples your data layer to specific DB features

**For learning:** Client-side joins are perfect! Database joins are an optimization you can add later.

---

### 🎨 Pattern 4: Optimistic UI Updates

> ⚠️ **Correction (Oct 2026):** this is **not** an optimistic update. The code still `await`s the server before changing the screen; what this ticket actually did was remove the *refetch*. It's a **server-confirmed** (pessimistic) update. See [Data Update Patterns](#-data-update-patterns-refetch-vs-server-confirmed-vs-optimistic).

#### What Is Optimistic UI?

Don't wait for the server to respond before updating the UI. Assume it'll succeed!

#### Example: Adding a Task

```typescript
const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        // 1. Call API (takes 100-500ms)
        const created = await createTask(clientId, newTask)

        // 2. Immediately update UI ← Don't wait for a refetch!
        setTasks([created, ...tasks])

        // 3. Success feedback
        toast.success('Task added successfully!')
    } catch (err) {
        // 4. If it fails, handle error (rollback not shown here)
        toast.error('Failed to add task')
    }
}
```

**Why It Feels Fast:**
```
❌ Pessimistic (slow):
User clicks → Show spinner → Wait 300ms → API response → Update UI → Hide spinner
Total perceived time: 300ms

✅ Optimistic (fast):
User clicks → Update UI immediately → API call in background → Show toast
Total perceived time: 0ms (instant!)
```

#### Example: Updating Status

```typescript
const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
        // Call API
        const updated = await updateTask(taskId, { status })

        // Update the specific task in the array (immutable pattern)
        setTasks(tasks.map(task =>
            task.id === taskId ? updated : task
        ))
    } catch (err) {
        toast.error('Failed to update')
    }
}
```

**Key insight**: The `map()` creates a new array (React requires this), replacing only the updated task.

---

### 🛡️ Pattern 5: Defensive Null Checking

#### The Problem: Orphaned References

Imagine this race condition:
1. Task exists with `client_id = "client-123"`
2. Another user deletes Client 123
3. Task still references the deleted client
4. Your join returns `undefined` for that client
5. UI tries to render `task.client.name` → **CRASH!** ❌

#### The Solution: Guard Against Missing Data

```typescript
const tasksWithClients = tasksData
    .map(task => {
        const client = clientsMap.get(task.client_id)

        // Defensive check: Does this client still exist?
        if (!client) return null  // ← Mark as invalid

        return {
            ...task,
            client: { id: client.id, name: client.name },
        }
    })
    .filter((task): task is TaskWithClient => task !== null)
    //       ↑ TypeScript type guard - tells TS no more nulls after this
```

**What happens:**
- Orphaned tasks are filtered out (graceful degradation)
- UI never sees `null` clients
- No crashes!

#### The Type Guard Syntax

```typescript
.filter((task): task is TaskWithClient => task !== null)
//              ^^^^^^^^^^^^^^^^^^^^^^
//              This is a "type predicate"
```

**Without the type guard:**
```typescript
// TypeScript thinks: (TaskWithClient | null)[]
.filter(task => task !== null)
// Still thinks nulls might exist!
```

**With the type guard:**
```typescript
// TypeScript knows: TaskWithClient[]
.filter((task): task is TaskWithClient => task !== null)
// Guarantees no nulls after this point
```

Now you can safely use `task.client.name` without TypeScript complaining!

---

### 🔄 Pattern 6: Immutable State Updates

#### Why Immutability?

React uses **reference equality** to detect changes:

```typescript
// ❌ BAD: Mutating state
const updateTask = () => {
    tasks[0].status = 'completed'  // Modifies the array in place
    setTasks(tasks)                // React thinks: "Same array reference, no change!"
}
// Result: UI doesn't update! 😱

// ✅ GOOD: Creating new array
const updateTask = () => {
    setTasks(tasks.map(task =>
        task.id === id ? { ...task, status: 'completed' } : task
    ))
    // New array reference → React knows to re-render ✅
}
```

#### Common Immutable Patterns

**Adding an item:**
```typescript
setTasks([newTask, ...tasks])  // New array with new item first
```

**Removing an item:**
```typescript
setTasks(tasks.filter(t => t.id !== taskId))  // New array without the item
```

**Updating an item:**
```typescript
setTasks(tasks.map(t =>
    t.id === taskId ? { ...t, status: 'completed' } : t
))
```

#### Object Spread Order Matters

```typescript
const updated = await updateTask(taskId, { status: 'completed' })

// ❌ WRONG: Loses client data
setTasks(tasks.map(t => t.id === taskId ? updated : t))
// Problem: `updated` is a Task, but state has TaskWithClient (includes .client)

// ✅ RIGHT: Preserves client data
setTasks(tasks.map(t =>
    t.id === taskId ? { ...t, ...updated } : t
))
// Spread order: t (has client) THEN updated (overwrites task fields)
```

**Result:**
```typescript
{
    ...t,         // { id, title, status, client: {...} }
    ...updated    // { id, title, status: 'completed', updated_at }
}
// Final: { id, title, status: 'completed', updated_at, client: {...} }
```

---

### 🎭 Pattern 7: User Feedback Patterns

#### Toast Notifications vs Inline Errors

```typescript
try {
    await createTask(clientId, newTask)
    toast.success('Task added successfully!')  // ← Temporary notification
} catch (err) {
    toast.error('Failed to add task')          // ← Temporary notification
    setError('Failed to add task')             // ← Persistent error banner
}
```

**When to use what:**
- **Toast (temporary)**: Success messages, non-critical errors
- **Inline error (persistent)**: Critical errors that block the user
- **Both**: Give users options (dismiss toast, but banner stays)

#### Status Label Mapping

```typescript
const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',  // ← Human-readable
    completed: 'Completed'
}

toast.success(`Task marked as ${statusLabels[newStatus]}`)
// Shows: "Task marked as In Progress" (not "task_status_in_progress")
```

**Why?** Database values are optimized for machines. UI labels are for humans.

---

### 🌍 Universal Concepts Learned

These patterns appear in **every** modern web framework:

| Concept | This Project | React | Vue | Angular | Svelte |
|---------|--------------|-------|-----|---------|--------|
| **Partial updates** | `Partial<Task>` | Common | Common | Common | Common |
| **Immutable state** | `.map()`, `.filter()` | Required | Recommended | Recommended | Required |
| **Optimistic UI** | Update before API responds | Common | Common | Common | Common |
| **Defensive coding** | Null checks | Always | Always | Always | Always |
| **Type guards** | `task is TaskWithClient` | TypeScript | TypeScript | TypeScript | TypeScript |

---

### 📝 What We Implemented

**Files Modified:**
- `src/lib/data.ts` - Added `createTask()`, `updateTask()`, `deleteTask()`
- `src/app/clients/[id]/page.tsx` - Hooked up add task form, status updates, delete
- `src/app/tasks/page.tsx` - Replaced mock data with real Supabase queries, implemented all task operations

**Functions Added:**
```typescript
createTask(clientId, taskData)  // Create new task
updateTask(id, taskData)        // Update existing task (especially status)
deleteTask(id)                  // Delete task
```

**Key Features:**
- ✅ Client-side joins using Map for performance
- ✅ Optimistic UI updates
- ✅ Defensive null checking with type guards
- ✅ Immutable state updates
- ✅ Toast notifications for user feedback
- ✅ Status update functionality across multiple pages
- ✅ Form state management and resets

---

### 🎓 What We Learned

**Supabase Patterns:**
- ✅ `.insert().select().single()` - Create and return new record
- ✅ `.update().eq().select().single()` - Update and return modified record
- ✅ `.delete().eq()` - Delete by ID
- ✅ Partial updates (only send changed fields)

**TypeScript Patterns:**
- ✅ `Partial<T>` utility type for flexible function signatures
- ✅ Type guards (`task is TaskWithClient`)
- ✅ Union types (`Task['status']` extracts `'pending' | 'in_progress' | 'completed'`)

**React Patterns:**
- ✅ Optimistic UI updates
- ✅ Immutable state with `.map()` and `.filter()`
- ✅ Object spread for merging state
- ✅ Form resets after submission

**Performance Patterns:**
- ✅ Map for O(1) lookups vs `.find()` O(n)
- ✅ Client-side joins (2 queries) vs SQL joins (trade-offs)

**Error Handling:**
- ✅ Try-catch in data layer
- ✅ Double error handling (Supabase errors + unexpected errors)
- ✅ User-friendly error messages
- ✅ Toast notifications for feedback

**Defensive Programming:**
- ✅ Null checks for orphaned references
- ✅ Type guards for runtime safety
- ✅ Confirmation dialogs for destructive actions

---

### 💭 Design Decisions

#### Why Separate `clientId` Parameter?

```typescript
// ✅ Chosen approach
createTask(clientId: string, taskData: Partial<Task>)

// ❌ Alternative
createTask(taskData: Partial<Task>)  // client_id inside taskData
```

**Reasoning:**
- Makes the relationship explicit (tasks MUST have a client)
- Prevents bugs where you forget to set `client_id`
- Self-documenting (you know this parameter is required)

#### Why Return Updated Objects?

```typescript
// ✅ Functions return the modified data
const updated = await updateTask(id, { status: 'completed' })
return updated  // ← Return from database
```

**Reasoning:**
- Database might modify fields (like `updated_at` timestamp)
- Keeps UI in sync with database state
- Enables optimistic updates without refetching

#### Why Client-Side Joins Now, SQL Joins Later?

**Now (Phase 1):**
- Simpler to understand
- Easier to debug (see both queries)
- More flexible (can cache separately)

**Later (Phase 5):**
- Optimize with SQL joins for large datasets
- Reduce network requests
- Learn more advanced Supabase features

---

### 🔍 Potential Improvements (For Later)

1. **Rollback on error** - If optimistic update fails, revert the UI change
2. **Parallel fetching** - Use `Promise.all([getTasks(), getClients()])`
3. **SQL joins** - Let database join tables instead of client-side
4. **Server-side filtering** - Filter by status in database query, not client
5. **Custom confirmation modal** - Replace `window.confirm()` with styled modal
6. **Loading states per item** - Show spinner on individual task buttons

**But remember:** Premature optimization is the root of all evil. These work great for now!

---

### 💡 Key Takeaways

**The patterns we learned are:**
1. ✅ Universal (apply to all modern frameworks)
2. ✅ Production-ready (used by big tech companies)
3. ✅ Performant (Map lookups, optimistic UI)
4. ✅ Maintainable (separation of concerns)
5. ✅ Safe (defensive coding, type guards)

**Core principles:**
> "Update the UI optimistically, handle errors gracefully, and always keep state immutable in React."

> "Use the right data structure for the job - Map for lookups, Array for lists."

---

**Next Steps:**
- **Ticket 1.5**: Implement Notes CRUD (will be very similar!)
- **Ticket 1.6**: Dashboard real-time stats

---

## Ticket 1.5: Notes CRUD - Reinforcement

**Completed**: November 21, 2025
**What We Built**: Notes CRUD operations with simplified API design

### 🎯 The Context

This was a **reinforcement ticket** - applying the patterns mastered in Tickets 1.3 and 1.4 to a simpler domain. Notes are much simpler than tasks:
- Only one user field: `content`
- No status updates or filtering
- No separate page (only in client detail)
- Append-only pattern (no UPDATE needed)

**Time to complete**: ~1.5 hours (vs 4-5 hours for tasks) - Pattern mastery in action!

---

### 🎨 Pattern 1: Simplified API Design

#### The Design Decision

For tasks and clients, we used `Partial<T>` for flexibility:
```typescript
createTask(clientId: string, taskData: Partial<Task>)
createClient(clientData: Partial<Client>)
```

For notes, we simplified to a direct parameter:
```typescript
createNote(clientId: string, content: string)
```

#### Why This Works Better for Notes

**Comparison**:
```typescript
// Option A: Following the pattern strictly
await createNote(clientId, { content: "Meeting went well" })
//                          ↑ Unnecessary object wrapper

// Option B: Simplified (what we chose) ✅
await createNote(clientId, "Meeting went well")
//                         ↑ Direct, clear, simple
```

**Decision criteria**:
- ✅ Notes only have **one** user-provided field
- ✅ No optional fields to include/exclude
- ✅ Simpler API = easier to use
- ✅ Still type-safe (TypeScript enforces `string`)
- ✅ More ergonomic call site

**Lesson**: Patterns are guides, not laws. Adapt them to your domain!

---

### 🔧 Pattern 2: Append-Only Data Model

#### What is Append-Only?

Notes follow an **append-only** pattern - you can CREATE and DELETE, but not UPDATE:

```typescript
// ✅ Supported operations
createNote()  // Add new note
deleteNote()  // Remove note

// ❌ Not implemented (by design)
updateNote()  // Edit existing note
```

#### Why Append-Only?

**Common use cases for append-only**:
- 📝 **Notes/Comments**: Historical record, shows thought progression
- 📊 **Audit Logs**: Can't change history
- 💬 **Chat Messages**: Maintain conversation integrity
- 📈 **Time-series Data**: Events happened, can't change past

**Benefits**:
1. **Simpler UI**: No edit mode, save/cancel buttons
2. **Data integrity**: Historical record preserved
3. **Less code**: Fewer edge cases to handle
4. **Clear semantics**: "I said this, now I'm adding more context"

**If you need to fix a typo**:
- Delete the old note
- Create a new corrected note
- Or add a follow-up note with the correction

---

### 📝 What We Implemented

#### **Data Access Layer** (`src/lib/data.ts`)

**createNote()** (lines 212-233):
```typescript
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

        if (error) throw new Error(`Failed to create note: ${error.message}`);
        return data;
    } catch (error) {
        console.error('Unexpected error in createNote:', error);
        throw error;
    }
}
```

**Key features**:
- Simple parameter signature
- Returns full Note with DB-generated fields
- Same error handling pattern as all CRUD operations

**deleteNote()** (lines 235-247):
```typescript
export async function deleteNote(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete note: ${error.message}`);
    } catch (error) {
        console.error('Unexpected error in deleteNote:', error);
        throw error;
    }
}
```

**Key features**:
- Returns `void` (no data needed)
- Uses `.eq()` to filter by ID
- Consistent error handling

---

#### **Component Integration** (`src/app/clients/[id]/page.tsx`)

**addNote()** (lines 108-124):
```typescript
const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        setLoading(true)
        const created = await createNote(clientId, newNote.content)
        setNotes([created, ...notes])    // Optimistic update
        setShowNoteForm(false)            // Close form
        setNewNote({ content: '' })       // Reset form
        toast.success('Note added successfully!')
    } catch (err) {
        console.error('Error adding note:', err)
        setError('Failed to add note. Please try again.')
        toast.error('Failed to add note. Please try again.')
    } finally {
        setLoading(false)
    }
}
```

**Pattern consistency** with tasks:
1. Loading state management
2. Optimistic UI update
3. Form state management
4. User feedback with toast
5. Error handling with try/catch/finally

**handleDeleteNote()** (lines 126-142):
```typescript
const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
        setLoading(true)
        await deleteNote(noteId)
        setNotes(notes.filter(note => note.id !== noteId))
        toast.success('Note deleted successfully!')
    } catch (err) {
        console.error('Error deleting note:', err)
        setError('Failed to delete note. Please try again.')
        toast.error('Failed to delete note. Please try again.')
    } finally {
        setLoading(false)
    }
}
```

**Pattern notes**:
- Early return with confirmation
- Immutable state update with `.filter()`
- Same error handling structure

---

#### **UI Updates** (lines 503-518)

**Note display with delete button**:
```typescript
<div key={note.id} className="... flex">
    <div className="flex-1">
        <div className="... whitespace-pre-wrap">
            {note.content}
        </div>
        <div className="...">
            {new Date(note.created_at).toLocaleString()}
        </div>
    </div>
    <div className="flex items-center space-x-2">
        <button onClick={() => handleDeleteNote(note.id)}
                className="text-red-600 hover:text-red-900 ...">
            Delete
        </button>
    </div>
</div>
```

**Key UI patterns**:
1. **Flexbox layout**: Content takes full width, button stays right
2. **`whitespace-pre-wrap`**: Preserves line breaks and formatting in multi-line notes
3. **Red delete button**: Visual affordance for destructive action
4. **Hover states**: Interactive feedback

---

### 🎓 What We Learned (New Concepts)

#### **1. API Design Principles**

**When to use `Partial<T>`**:
- ✅ Multiple optional fields: `createTask(clientId, Partial<Task>)`
- ✅ Updates with unknown fields: `updateTask(id, Partial<Task>)`

**When to use direct parameters**:
- ✅ Single required field: `createNote(clientId, content)`
- ✅ Simple operations: `deleteNote(id)`

**Principle**: Match API complexity to domain complexity.

#### **2. Append-Only Pattern**

**When to use**:
- Historical records (notes, comments, logs)
- Audit trails
- Time-series data
- Conversation threads

**Benefits**:
- Simpler code (no UPDATE logic)
- Data integrity (can't change history)
- Faster implementation

**Trade-offs**:
- Can't fix typos directly
- Storage grows (no edits, only additions)

#### **3. CSS `whitespace-pre-wrap`**

```css
whitespace-pre-wrap
```

**What it does**:
- Preserves line breaks (`\n` in content)
- Preserves multiple spaces
- Still wraps text at container width

**Use cases**:
- User-generated content
- Code snippets
- Formatted text
- Poetry or addresses

**Alternatives**:
- `whitespace-pre`: Preserves everything, no wrapping (can overflow)
- `whitespace-normal`: Collapses whitespace and line breaks (default)

---

### 🌍 Universal Concepts

| Concept | This Ticket | Other Examples |
|---------|-------------|----------------|
| **Append-only data** | Notes | Git commits, blockchain, event logs |
| **Simple APIs** | `createNote(id, content)` | `console.log(message)`, `Math.max(a, b)` |
| **Text formatting** | `whitespace-pre-wrap` | `<pre>`, Markdown renderers |
| **Destructive actions** | Red delete button | Trash icons, "Delete Account" buttons |

---

### 📊 CRUD Pattern Comparison

You've now implemented CRUD **three times**. Here's how they compare:

| Feature | Clients (1.3) | Tasks (1.4) | Notes (1.5) |
|---------|---------------|-------------|-------------|
| **Complexity** | Medium | High | Low |
| **Fields** | 7 fields | 9 fields | 3 fields |
| **CREATE** | ✅ `Partial<Client>` | ✅ `Partial<Task>` | ✅ Simple `string` |
| **READ** | ✅ All + by ID | ✅ All + by client | ✅ By client only |
| **UPDATE** | ❌ Not needed yet | ✅ Status changes | ❌ Append-only |
| **DELETE** | ✅ With cascade | ✅ Standard | ✅ Standard |
| **Joins** | No | Yes (with clients) | No |
| **Filtering** | No | Yes (by status) | No |
| **Separate page** | Yes (/clients) | Yes (/tasks) | No |
| **Time to implement** | 3 hours | 4-5 hours | 1.5 hours |

**Pattern progression**:
1. **Clients**: Learn the basic pattern
2. **Tasks**: Master complex operations (joins, updates, filtering)
3. **Notes**: Apply pattern confidently and adapt (simplified API)

---

### 💭 Design Decisions

#### Why No Validation?

You might notice `addNote()` doesn't validate empty content:
```typescript
// Not implemented:
if (!newNote.content.trim()) {
    toast.error('Note content is required')
    return
}
```

**This is fine because**:
- Database has `NOT NULL` constraint on `content`
- Empty notes are caught by database error
- Error handler shows toast already
- Could add later for better UX (pre-database validation)

**Trade-off**: Faster implementation vs better UX. For learning, this is fine. In production, you'd add client-side validation.

#### Why No Edit Feature?

**Reasons to skip UPDATE**:
1. **Time**: Adds 1-2 hours (edit UI, save/cancel buttons, state management)
2. **Simplicity**: Append-only is a valid pattern
3. **Rarity**: Users rarely edit notes, often just add clarifications
4. **Workaround**: Delete + create new note works fine

**When you'd add UPDATE**:
- User research shows edit is needed
- Notes contain critical info that needs correction
- Phase 3 (Polish) has time for nice-to-have features

---

### 🎯 Key Takeaways

**Pattern Mastery**:
> "By the third implementation, you're not following instructions - you're applying principles. This is when learning becomes understanding."

You demonstrated this by:
- ✅ Choosing a simpler API design (not blindly following Partial<T>)
- ✅ Implementing in 1/3 the time of tasks
- ✅ Maintaining perfect consistency with existing patterns
- ✅ Making intentional trade-offs (no UPDATE, no validation)

**Core Principles Reinforced**:
1. **Consistency**: All CRUD operations have same structure
2. **Adaptability**: Patterns guide, domain determines details
3. **Trade-offs**: Features vs time, complexity vs benefit
4. **User experience**: Loading states, feedback, confirmations

**The CRUD Pattern** (now muscle memory):
```typescript
try {
    setLoading(true)
    const result = await dataOperation()
    updateState(result)
    provideUserFeedback()
} catch (err) {
    handleError()
} finally {
    setLoading(false)
}
```

---

### 📈 Phase 1 Progress

**Completed Tickets**:
- ✅ 1.1: Supabase Setup
- ✅ 1.2: Client Read Operations
- ✅ 1.3: Client Write Operations
- ✅ 1.4: Task Full CRUD
- ✅ 1.5: Notes CRUD ← Just completed!

**Remaining in Phase 1**:
- ⏳ 1.6: Dashboard Real-Time Stats (last ticket!)

**What's Fully Functional**:
- All client operations
- All task operations (including status updates)
- All note operations
- Client-side joins for tasks
- Optimistic UI throughout
- Toast notifications everywhere
- Proper error handling
- Loading states

**No mock data remaining!** Everything persists to Supabase. 🎉

---

### 💡 What's Next

**Ticket 1.6**: Dashboard will be different - it's **read-only** but involves:
- Aggregation queries (COUNT, SUM)
- Derived statistics
- Real-time data (no mock stats)

This will round out your data access skills with **analytics queries**.

---

## Next Steps

- **Ticket 1.6**: Dashboard real-time stats (final Phase 1 ticket!)
- Continue expanding this document as we learn new patterns

---

## Phase 2: Authentication & Security

### Ticket 2.1: Supabase Auth Setup - Core Concepts

**Completed**: November 24, 2024
**What We Built**: The foundational authentication plumbing - three Supabase clients for browser, server, and middleware contexts

---

## 🎯 The Big Picture: What We Built

**Three different Supabase clients** for three different contexts:
1. **Browser Client** (`client.ts`) - For interactive UI (login, logout, signup)
2. **Server Client** (`server.ts`) - For fetching data on the server
3. **Middleware Client** (`middleware.ts`) - For protecting routes before they load

**Why three?** Because Next.js App Router has three execution contexts with different capabilities:
- **Browser**: Can access localStorage, cookies, DOM, user events
- **Server**: Can access Node.js APIs, databases, environment variables (but not localStorage or DOM)
- **Middleware**: Runs on the Edge (limited Node.js APIs), can intercept ALL requests

Each context needs to handle cookies differently, so we configure Supabase differently for each.

---

## 🔑 Core Concept 1: JWT-Based Authentication (Not Sessions!)

### Traditional Session-Based Auth (What We Didn't Build):
```
User logs in → Server creates record in sessions table → Returns session ID cookie
Every request → Server queries sessions table → Validates session → Returns user data

Pros: Easy to understand, can revoke sessions instantly
Cons: Database query on EVERY request (slow at scale)
```

### JWT-Based Auth (What Supabase Uses):
```
User logs in → Supabase generates JWT token → Returns token in cookie
Every request → Server reads JWT → Verifies signature → User data is IN the token

Pros: No database query needed, stateless, scales infinitely
Cons: Can't revoke until expiry (mitigated by short lifespan + refresh tokens)
```

**Key Insight:** The JWT **is** the session. It's a cryptographically signed package containing:
- User ID
- Email
- Expiration timestamp (1 hour)
- Signature (proves it came from Supabase and wasn't tampered with)

### 🏢 Analogies That Helped

**The Nightclub Analogy:**
- **Traditional sessions** = You get wristband #1247 → Every time you order a drink, bartender calls bouncer to check if #1247 is valid (database lookup)
- **JWT tokens** = You get a STAMPED HAND with your name and expiration → Bartender reads your hand directly, no need to call bouncer (no database lookup!)

The stamp can't be forged (cryptographic signature), and bartenders can verify it themselves (stateless).

---

## 🍪 Core Concept 2: Why Cookies (Not localStorage)?

**The Problem to Solve:**
- Browser code needs to read/write tokens (for login/logout)
- Server code needs to read tokens (to know who's making the request)
- localStorage only works in the browser
- Server can't access localStorage

**The Solution: Cookies**

Cookies are automatically sent with EVERY request:
```
Browser → Makes request → Browser automatically includes cookies
Server → Reads cookies → Knows who you are
```

This is why `@supabase/ssr` stores JWT tokens in cookies by default.

**Analogy:** Cookies are like a key card that works at ALL three checkpoints (lobby/browser, executive office/server, security gate/middleware). localStorage is like a personal wallet that only works in the lobby.

---

## 🎫 Core Concept 3: Access Tokens vs Refresh Tokens

When you log in, you get **TWO tokens**:

### Access Token
```
Lifespan: 1 hour
Purpose: Proves who you are right now
Size: ~1-2KB (contains user info)
Sent with: Every API request
Security: Short lifespan limits damage if stolen
```

### Refresh Token
```
Lifespan: 30 days (configurable)
Purpose: Get a NEW access token when it expires
Size: Small (just a random string)
Sent with: Only token refresh requests
Security: Longer lifespan, but can only be used for one thing (getting new access tokens)
```

**The Concert Ticket Analogy:**
- **Access token** = Wristband that gets you into the venue (expires after 1 hour for security)
- **Refresh token** = Will-call ticket that lets you get a NEW wristband when yours expires (good for 30 days)

**The Flow:**
```
Login:
  → Get access_token (1h) + refresh_token (30d)
  → Both stored in cookies

Hour 1: Making requests
  → Send access_token with each request
  → Supabase validates token
  → Request succeeds

Hour 2: Access token expired
  → Supabase sees expired access_token
  → Automatically uses refresh_token to get NEW access_token
  → Updates cookies with new access_token
  → Request succeeds (you didn't even notice!)

Day 31: Refresh token expired
  → No way to get new access tokens
  → Must log in again (enter email/password)
```

**Why this complexity?** Security tradeoff:
- Short access token lifespan = Less damage if stolen (only works 1 hour)
- Long refresh token lifespan = Good UX (stay logged in for weeks)
- Refresh tokens can only do ONE thing (get new access tokens), so even if stolen, attacker can't access your data directly

---

## 🏢 Core Concept 4: The Three Clients (When to Use What)

### 1. Browser Client (`src/lib/supabase/client.ts`)

**The Office Building Analogy: Lobby Reception Desk**
```
Location: Front desk in the lobby (your browser)
Job: Handle people coming in/out (login, logout, signup)
Can do: Issue stamps, remove stamps, access guest book
Can't do: Access secure file room, read company databases
```

**When to use:**
- Component has `'use client'` directive
- Handling user interactions (button clicks, form submits)
- Calling auth methods (login, logout, signup)

**What it does:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(url, key)
  // Supabase handles EVERYTHING:
  //   - Reading cookies ✅
  //   - Writing cookies ✅
  //   - Refreshing tokens ✅
}
```

**Capabilities:**
- ✅ Read cookies (via browser Cookie API)
- ✅ Write cookies (via browser Cookie API)
- ✅ Access browser APIs (localStorage, window, etc.)
- ❌ Can't access Node.js APIs
- ❌ Can't read server-side environment variables

---

### 2. Server Client (`src/lib/supabase/server.ts`)

**The Office Building Analogy: Executive Office**
```
Location: Private office on the top floor (your server)
Job: Fetch sensitive data, make important decisions
Can do: Read secure database, access employee records, read stamps
Can't do: Issue new stamps (can't write cookies from Server Components)
```

**When to use:**
- Server Component (no `'use client'` directive)
- Server Action (functions with `'use server'`)
- API Route Handler
- Fetching data that requires authentication

**What it does:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()  // Next.js 15: now async!

  return createServerClient(url, key, {
    cookies: {
      // Teach Supabase HOW to read cookies in Node.js
      getAll() {
        return cookieStore.getAll()
      },
      // Try to write, but usually fails (Server Components can't write)
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Ignore - cookie writing happens client-side
        }
      }
    }
  })
}
```

**Capabilities:**
- ✅ Read cookies (via Next.js cookies() API)
- ⚠️ Write cookies (usually fails in Server Components)
- ✅ Access Node.js APIs
- ✅ Read server-side environment variables
- ❌ Can't access browser APIs (window, localStorage, etc.)
- ❌ Can't handle user events (onClick, onChange, etc.)

**Important:** Don't call `supabase.auth.signIn()` from server! It won't write cookies correctly. Auth actions must happen client-side.

---

### 3. Middleware Client (`src/lib/supabase/middleware.ts`)

**The Office Building Analogy: Security Gate**
```
Location: The gate BEFORE you enter the building (before page loads)
Job: Check credentials before anyone gets in
Can do: Read stamps, turn people away, re-stamp if expired, let people through
Special power: Can both READ and WRITE stamps
```

**When to use:**
- `middleware.ts` file only
- Protecting routes (redirect if not logged in)
- Refreshing expired tokens automatically
- Running logic BEFORE pages load

**The Plumbing Complexity:**

This is the most complex one because we need to "pipe" cookies from incoming request to outgoing response:

```typescript
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export function createClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      // Read cookies from incoming request
      getAll() {
        return request.cookies.getAll()
      },
      // Write cookies to outgoing response
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })

        // Recreate response to ensure cookies persist
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      }
    }
  })

  return { supabase, response }  // Return BOTH!
}
```

**Why return both?** When tokens get refreshed (access token expires), the NEW token must be written to the response object. If you return `NextResponse.next()` instead, the updated cookies get lost!

**Capabilities:**
- ✅ Read cookies (from request)
- ✅ Write cookies (to response)
- ✅ Redirect users
- ✅ Modify requests before they reach pages
- ⚠️ Limited Node.js APIs (runs on Edge runtime)
- ❌ Can't access browser APIs

**Critical Gotcha:** Must return the `response` object, not `NextResponse.next()`. If tokens were refreshed, the new tokens are stored in `response`. If you don't return it, the browser never gets the updated tokens!

---

## 🧩 Core Concept 5: Server vs Client Component Boundary

**The Error We Hit:**
```
Error: You're importing a component that needs "next/headers".
That only works in a Server Component.
```

**What Happened:**
```tsx
'use client'  // This is a Client Component
import { signIn } from '@/lib/auth'
// auth.ts imports server.ts
// server.ts uses 'next/headers' (server-only!)
// ❌ Can't bundle server code in client!
```

**The Rule:**

| Component Type | Can Import | Cannot Import |
|----------------|------------|---------------|
| Client Component (`'use client'`) | Browser-safe code, other Client Components | Server Components, `next/headers`, `next/cache` |
| Server Component (default) | Anything | Nothing (can import everything) |

**Why?** Webpack bundles Client Components to send to the browser. It can't bundle server-only APIs (they don't exist in browsers).

**Mental Model:** Client Components are like JavaScript files that get sent to the user's browser. You can only import things that work in browsers. Server Components run on your server and never get sent to the browser, so they can use anything.

---

## 🔄 Core Concept 6: How Token Refresh Works (The Magic)

**The Problem:**
Access tokens expire after 1 hour. How do you stay logged in for days/weeks?

**The Solution: Automatic Token Refresh**

```
1. You're logged in, using the app
2. Access token expires (after 1 hour)
3. You click "View Clients"
4. Supabase client checks token expiration
5. Token is expired!
6. Client automatically makes request:
   POST /auth/v1/token?grant_type=refresh_token
   Body: { refresh_token: "..." }
7. Supabase validates refresh token
8. Returns NEW access token
9. Client updates cookies with new token
10. Original request retries with new token
11. You see your clients (never knew anything happened!)
```

**Where This Happens:**
- **Browser:** `createBrowserClient()` handles it automatically
- **Middleware:** `createServerClient()` in middleware handles it (writes to response)
- **Server Components:** Usually doesn't refresh (can't write cookies reliably)

**Key Insight:** This is why we had to carefully configure cookie handling in middleware. When tokens refresh, the NEW token must make it back to the browser, or you'll appear logged out on the next request!

---

## 📊 Mental Model: The Full Auth Flow

### Initial Login
```
1. User enters email/password in login form (Client Component)
2. Component calls: createClient().auth.signInWithPassword()
3. Request sent to Supabase: POST /auth/v1/token
4. Supabase validates credentials against auth.users table
5. Supabase generates:
   - access_token (JWT, expires in 1h)
   - refresh_token (random string, expires in 30d)
6. Supabase returns both tokens
7. @supabase/ssr automatically writes to cookies:
   - sb-<project>-auth-token = access_token
   - sb-<project>-auth-token-refresh = refresh_token
8. Browser stores cookies
9. Next request automatically includes cookies
```

### Checking Auth (Server Component)
```
1. Server Component renders: await createClient()
2. Reads cookies using Next.js cookies() API
3. Finds sb-<project>-auth-token cookie
4. Calls: supabase.auth.getUser()
5. Supabase verifies JWT signature
6. Returns user object: { id, email, ... }
7. Component can now fetch user's data
```

### Route Protection (Middleware)
```
1. User navigates to /dashboard
2. Middleware runs BEFORE page loads
3. Calls: createClient(request)
4. Calls: supabase.auth.getUser()
5. If token expired:
   a. Supabase uses refresh_token to get new access_token
   b. New token written to response cookies
6. If no user:
   a. Middleware returns redirect to /login
7. If user exists:
   a. Middleware returns response (with updated cookies)
   b. Page loads
```

### Logout
```
1. User clicks logout (Client Component)
2. Component calls: createClient().auth.signOut()
3. Request sent to Supabase: POST /auth/v1/logout
4. Supabase invalidates refresh token in database
5. @supabase/ssr clears cookies
6. User redirected to login page
```

---

## ⚠️ IMPORTANT: Execution Order vs. Teaching Order

### The Confusion
When we numbered the three clients (Browser = 1, Server = 2, Middleware = 3), this was **teaching complexity order**, NOT **execution order**. This caused confusion about when each client runs.

### The ACTUAL Execution Order

**When you visit a protected page like `/dashboard`, here's what really happens:**

```
Step 1: 🚪 MIDDLEWARE (The Security Gate)
        ↓
        Runs FIRST, before anything else
        Intercepts the request at the edge
        Checks if you're logged in
        ↓
        ✅ Valid? → Allow request to continue
        ❌ Invalid? → Redirect to /login (STOPS HERE!)
        ↓
Step 2: 🏢 SERVER COMPONENT (The Executive Office)
        ↓
        Only runs if middleware allowed the request through
        Fetches your private data from database
        Renders page with your data
        Sends HTML to browser
        ↓
Step 3: 🌐 BROWSER RECEIVES PAGE
        ↓
        Page displays in user's browser
        ↓
Step 4: 👆 CLIENT COMPONENT (The Lobby)
        ↓
        Only runs when user interacts with UI
        Example: User clicks "Logout" button
        Uses Browser Client to remove auth cookies
```

### The Building Analogy - CORRECTED

**Original analogy order was wrong!** Here's the correct version:

```
🏢 Company Campus Security Flow:

1️⃣ SECURITY GATE (Middleware) - FIRST!
   📍 Location: Before you even enter the property
   🎯 Job: Check ID badge, update if expired, turn away unauthorized
   ⏰ When: EVERY time someone tries to enter
   🔒 Power: Can block entry completely

   After passing the gate, you can enter either:

2️⃣ EXECUTIVE OFFICE (Server Component)
   📍 Location: Secure area inside building
   🎯 Job: Access private files, read sensitive data
   ⏰ When: When page needs to load user's data
   🔒 Power: Can read your badge, fetch your files

3️⃣ LOBBY DESK (Client Component)
   📍 Location: Public area inside building
   🎯 Job: Interactive - get badges, check in/out
   ⏰ When: User clicks buttons, submits forms
   🔒 Power: Can issue/remove badges, interactive actions
```

### Real-World Example: Visiting `/dashboard`

```
User types: example.com/dashboard
       ↓
─────────────────────────────────────────────
🚪 MIDDLEWARE INTERCEPTS (Gate)
─────────────────────────────────────────────
const { supabase, response } = createClient(request)
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.redirect('/login')  // ❌ STOPS HERE
}

return response  // ✅ CONTINUE
       ↓
─────────────────────────────────────────────
🏢 SERVER COMPONENT RUNS (Executive Office)
─────────────────────────────────────────────
const supabase = await createServerClient()
const clients = await supabase.from('clients').select()

return <Dashboard clients={clients} />
       ↓
─────────────────────────────────────────────
🌐 BROWSER DISPLAYS PAGE
─────────────────────────────────────────────
User sees dashboard with their data
       ↓
─────────────────────────────────────────────
👆 USER CLICKS "LOGOUT" (Lobby Desk)
─────────────────────────────────────────────
const supabase = createBrowserClient()
await supabase.auth.signOut()  // Removes badges
```

### Why Middleware Comes First (And Why It's Critical)

**Without middleware:**
```
User → Page tries to load → Server Component checks auth → "Not logged in!" → Redirect
❌ Problem: Page tried to execute first, might leak data or waste resources
```

**With middleware:**
```
User → 🚪 Middleware stops them → Redirect to login
✅ Better: Request never reaches the page, completely blocked at the gate
```

**Middleware is the ONLY place that can:**
- ✅ Block requests BEFORE any page code runs
- ✅ Protect ALL routes from one file
- ✅ Refresh tokens and guarantee browser gets the update
- ✅ Run on every single request automatically

### Why We Built Them in "Reverse" Order

We built them **simple → complex** for learning:

1. **Browser Client** (simplest) - Just call `createBrowserClient()`, it handles everything!
2. **Server Client** (medium) - Need to teach Supabase how to read cookies in Node.js
3. **Middleware Client** (hardest) - Cookie piping, must return response object

**But they execute in reverse:**
1. Middleware (first to run)
2. Server Component (if middleware allows)
3. Client Component (if user interacts)

### Key Insight

> **Teaching order ≠ Execution order**
>
> We learned them simple → complex for education.
> They run in reverse for actual requests.

**The most complex client (Middleware) is the most important** - it's your app's security bouncer that runs on EVERY request before anything else can happen.

---

## 🎓 Key Takeaways

### 1. **JWTs Are Self-Contained**
Traditional sessions require database lookups. JWTs contain user info + signature. Server can verify them cryptographically without database queries.

### 2. **Cookies Bridge Client/Server**
localStorage only works in browser. Cookies work everywhere. That's why Supabase uses cookies.

### 3. **Three Contexts = Three Clients**
Browser, Server, and Middleware have different cookie APIs. We configure Supabase differently for each.

### 4. **Refresh Tokens Enable Long Sessions**
Short-lived access tokens (1h) + long-lived refresh tokens (30d) = secure + good UX.

### 5. **Middleware Response Must Be Returned**
If tokens refresh in middleware, new tokens are in the `response` object. Don't return `NextResponse.next()` or you'll lose them!

### 6. **Client Components Can't Import Server Code**
Webpack bundles Client Components for the browser. Can't include Node.js APIs.

---

## 📝 What We Implemented

**Files Created:**
- `src/lib/supabase/client.ts` - Browser client for interactive UI
- `src/lib/supabase/server.ts` - Server client for Server Components
- `src/lib/supabase/middleware.ts` - Middleware client for route protection
- `src/lib/auth.ts` - Helper functions (signUp, signIn, signOut, getSession, getUser)
- `src/app/test-auth/page.tsx` - Test page to verify auth works (can be deleted)

**What We Learned:**
- ✅ JWT-based authentication vs traditional sessions
- ✅ Why cookies are used instead of localStorage
- ✅ Access tokens vs refresh tokens
- ✅ How automatic token refresh works
- ✅ Three different Supabase clients for three contexts
- ✅ Server vs Client Component boundaries in Next.js
- ✅ The `@supabase/ssr` package and cookie management
- ✅ Next.js 15 breaking change: `cookies()` is now async

**Testing Results:**
- ✅ Sign in working with real JWT tokens
- ✅ Session retrieval working
- ✅ Sign out working
- ✅ Tokens stored in cookies (visible in DevTools)
- ✅ No console errors

---

## 🔮 What's Next

Now that we have the **auth foundation**, we can build:

- **Ticket 2.2**: Login UI (form that calls our client utilities)
- **Ticket 2.3**: Signup UI (create new users)
- **Ticket 2.4**: Auth Context (provide user to all components)
- **Ticket 2.5**: Middleware (protect all routes, use middleware client)
- **Ticket 2.6**: RLS (database-level security, add user_id columns)

Every subsequent ticket builds on this foundation. The hard conceptual work is done!

---

### Ticket 2.2: Login Page - Form Patterns & Validation

**Completed**: November 25, 2024
**What We Built**: Full-featured login page with validation, error handling, and user feedback

---

## 🎯 Core Concepts Learned

### 1. **Client Components for Forms (Required!)**

**Why forms MUST be Client Components:**
- Need `useState` for form state (controlled inputs)
- Need event handlers (`onSubmit`, `onChange`)
- Need interactivity and real-time validation
- Need to write cookies (browser client)

**Server Components can't do any of this** - they're pre-rendered static HTML.

```tsx
'use client'  // ← Required for forms!
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'  // Browser client

export default function LoginPage() {
  const [email, setEmail] = useState('')  // Track input
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const supabase = createClient()  // Uses browser client
    await supabase.auth.signInWithPassword({ email, password })
  }
}
```

---

### 2. **Controlled vs Uncontrolled Inputs**

**Uncontrolled (simple but limited):**
```tsx
<input name="email" />  // React doesn't track value
// Read on submit: formData.get('email')
```

**Pros:** Less code
**Cons:** Can't validate while typing, can't conditionally disable buttons

**Controlled (React way) - What we used:**
```tsx
const [email, setEmail] = useState('')

<input
  value={email}  // React controls the value
  onChange={(e) => setEmail(e.target.value)}  // Update state
/>
```

**Pros:** Full control, real-time validation, conditional rendering
**Cons:** More code (but worth it!)

**Key insight:** Controlled inputs give you power to build better UX.

---

### 3. **Three-Layer Validation Strategy**

**Layer 1: Client-Side (Immediate Feedback)**
```tsx
if (!email.includes('@')) {
  setError('Invalid email')
  return  // Don't call API
}
```
- Instant feedback
- Saves network requests
- Better UX

**Layer 2: Supabase Auth API (Security)**
```tsx
const { error } = await supabase.auth.signInWithPassword({ email, password })
// Server validates:
// - Does user exist?
// - Does password match?
```
- Source of truth
- Can't be bypassed by user
- Security layer

**Layer 3: Database Constraints (Safety Net)**
```sql
email TEXT NOT NULL UNIQUE  -- Database enforces
```
- Protects data integrity
- Catches bugs in application code
- Last line of defense

**All three layers work together!**

---

### 4. **Error Handling Patterns**

**Supabase Auth Returns Generic Errors (Security Feature):**
```tsx
// Wrong password OR user doesn't exist:
error.message = "Invalid login credentials"  // Same message!
```

**Why?** Prevents email enumeration attacks (attacker can't discover which emails exist).

**User-Friendly Error Translation:**
```tsx
if (authError) {
  if (authError.message.includes('Invalid login credentials')) {
    setError('Invalid email or password. Please try again.')
  } else if (authError.message.includes('Email not confirmed')) {
    setError('Please confirm your email before logging in.')
  } else {
    setError('An error occurred. Please try again.')
  }
}
```

**Pattern:** Parse API errors → Show user-friendly messages

---

### 5. **Loading States (Prevent Double-Submit)**

**The Problem:**
```
User clicks "Sign In"
  ↓ (API takes 500ms)
User clicks again (impatient)
  ↓
TWO API CALLS! 💥
```

**The Solution:**
```tsx
const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {
  setLoading(true)  // Disable form
  try {
    await supabase.auth.signInWithPassword({ email, password })
  } finally {
    setLoading(false)  // Always re-enable (even on error!)
  }
}

<button disabled={loading}>
  {loading ? 'Signing in...' : 'Sign in'}
</button>
```

**Benefits:**
- Prevents double-submit
- Visual feedback for user
- Always clears (even on error - that's what `finally` does!)

---

### 6. **Client-Side Navigation: `useRouter.push()`**

**Used in Client Components for navigation after user actions:**

```tsx
'use client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleSubmit = async (e) => {
    // ... login logic ...

    if (success) {
      router.push('/')  // Navigate without page reload
    }
  }
}
```

**Characteristics:**
- Runs in browser (client-side)
- Can be in event handlers, async functions
- Smooth transition, no page reload
- Must be in Client Component

**vs `redirect()` (Server Components):**
- `redirect()` = Server decides before page loads (HTTP redirect)
- `router.push()` = Browser navigates after page loaded (JS navigation)

**For login/signup:** Use `router.push()` because forms need Client Components.

---

### 7. **Early Returns Pattern (Critical!)**

**Always return after showing an error:**

```tsx
// ✅ CORRECT - Early return prevents execution
if (!email.includes('@')) {
  setError('Invalid email')
  return  // Stop here!
}

// ❌ WRONG - Missing return, code continues!
if (!email.includes('@')) {
  setError('Invalid email')
  // Oops! Will still call API with invalid email
}

setLoading(true)
await supabase.auth.signInWithPassword(...)
```

**Key learning:** Validation without `return` is a bug! The code will continue executing.

---

## 📝 What We Implemented

**Files Created:**
- `src/app/login/page.tsx` - Login page with validation

**Features:**
- Controlled form inputs (email, password)
- Client-side validation (format, length, empty fields)
- Supabase authentication integration
- User-friendly error messages
- Loading state with disabled inputs
- Redirect after successful login
- Already-logged-in check on page load
- Professional styling with dark mode
- Accessible form (labels, focus, ARIA)

**Success Criteria:**
- ✅ Can log in with valid credentials
- ✅ Shows errors for invalid input
- ✅ Prevents double-submission
- ✅ Redirects to home on success
- ✅ Checks if already logged in

---

### Ticket 2.3: Signup Page - Independent Implementation

**Completed**: November 25, 2024
**What We Built**: Signup page built independently using patterns from login page

---

## 🎓 Learning Through Building (Not Watching!)

**Approach:**
Instead of watching a demo, implemented signup page independently:
1. Copied login page as starting point
2. Modified for signup requirements
3. Added password confirmation field
4. Received code review feedback
5. Fixed bugs and improved code
6. Got approval for production

**This is how you actually learn** - by doing, debugging, and iterating!

---

## 🐛 Critical Bug Found & Fixed: Missing Return Statement

**The Bug:**
```tsx
if (password !== confirmPassword) {
  setError('Passwords do not match')
}  // ← Missing return!

setLoading(true)  // ← Still executes! Bug!
```

**What Happened:**
- Shows error message to user
- BUT still continues and calls Supabase API
- Wastes API call, confusing UX

**The Fix:**
```tsx
if (password !== confirmPassword) {
  setError('Passwords do not match')
  return  // ← Stop here!
}
```

**Key Learning:**
- Validation must use early returns
- Found the bug independently (critical thinking!)
- Understanding control flow is essential

**This is a common beginner bug** - now you'll never make it again!

---

## 🎯 New Patterns Added to Signup

### **Password Confirmation Validation**

**New state variable:**
```tsx
const [confirmPassword, setConfirmPassword] = useState('')
```

**New validation check:**
```tsx
if (password !== confirmPassword) {
  setError('Passwords do not match')
  return
}
```

**New input field:**
```tsx
<input
  type="password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>
```

**Pattern:** Three pieces must work together (state, validation, input).

---

### **Validation Order Matters**

**Correct order (what we did):**
```tsx
1. Check all fields filled
2. Validate email format
3. Validate password length
4. Validate passwords match  // ← Check matching BEFORE API call
5. Call API
```

**Why this order?**
- Cheapest checks first (no computation)
- More expensive checks later (regex, API)
- User gets fastest feedback
- Saves unnecessary API calls

---

### **User-Friendly Error Messages**

**For duplicate email:**
```tsx
if (authError.message.includes('Email already in use')) {
  setError('Email already in use. Please use a different email.')
}
```

**Generic fallback:**
```tsx
else {
  setError('Unable to sign up. Please try again.')
}
```

**Pattern:** Parse specific errors, provide helpful messages, have a fallback.

---

## 📊 Code Review Process Learned

**Review Feedback Categories:**

**Critical (Must Fix):**
- Missing return statement (bug!)
- Security issues
- Broken functionality

**Should Fix:**
- Incorrect documentation
- Misleading error messages
- Console.log with wrong text

**Nice to Have:**
- Better autocomplete attributes
- Password requirement hints
- Additional UX improvements

**Key insight:** Not all feedback is equal. Prioritize fixes by impact.

---

## 🎯 Reusable Form Patterns Mastered

**These patterns work for ANY form:**

1. **Controlled inputs with useState**
   ```tsx
   const [value, setValue] = useState('')
   <input value={value} onChange={(e) => setValue(e.target.value)} />
   ```

2. **Loading state management**
   ```tsx
   setLoading(true) → try/catch → finally setLoading(false)
   ```

3. **Validation with early returns**
   ```tsx
   if (invalid) { setError(); return }
   ```

4. **Error state display**
   ```tsx
   {error && <div className="error">{error}</div>}
   ```

5. **User-friendly error messages**
   ```tsx
   Parse API error → Show human-readable message
   ```

**Next time you build a form (profile, settings, etc.):** Use these exact patterns!

---

## 💡 Key Takeaways

### **What Makes Code Production-Ready:**

1. ✅ **Comprehensive validation** (all fields, all cases)
2. ✅ **Early returns** (prevent invalid execution paths)
3. ✅ **User-friendly errors** (not raw API messages)
4. ✅ **Loading states** (prevent double-submit)
5. ✅ **Accessibility** (labels, focus, semantic HTML)
6. ✅ **Error recovery** (`finally` blocks ensure cleanup)
7. ✅ **TypeScript types** (no `any` usage)

### **Development Workflow:**

1. 🔄 **Copy-paste-modify** for similar features (faster than from scratch)
2. 🧪 **Test after every change** (don't wait until the end)
3. 🐛 **Debug incrementally** (comment out, add logs)
4. 👔 **Code review catches bugs** (even ones you missed!)
5. 🔧 **Iterate based on feedback** (improve, don't defend)

### **Critical Thinking Moments:**

- 💭 Realizing the missing `return` was a bug (control flow understanding)
- 💭 Understanding why validation order matters (performance + UX)
- 💭 Seeing how patterns from login transfer to signup (abstraction)
- 💭 Recognizing the need for early returns (preventing invalid states)

---

## 🔗 How Login & Signup Connect to Ticket 2.1

**Using the Infrastructure:**

Both pages use the browser client we built in Ticket 2.1:
```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })  // Login
await supabase.auth.signUp({ email, password })              // Signup
```

**What happens automatically:**
1. API call to Supabase
2. Tokens returned
3. `@supabase/ssr` writes tokens to cookies
4. Next request includes cookies
5. Server/middleware can read them

**The payoff:** All that complex infrastructure from 2.1 is now just one line of code!

---

## 📈 Phase 2 Progress

**Completed:**
- ✅ Ticket 2.1: Auth Setup (infrastructure)
- ✅ Ticket 2.2: Login Page (built together)
- ✅ Ticket 2.3: Signup Page (built independently)
- ✅ Ticket 2.4: Session Management & Context

**Remaining:**
- 🔜 Ticket 2.5: Protected Routes & Middleware
- 🔜 Ticket 2.6: Row Level Security (RLS)

**Progress:** 67% of Phase 2 complete! 🎉

---

### Ticket 2.4: Session Management & Context

**Completed**: November 28, 2024
**What We Built**: React Context for centralized auth state management throughout the app

---

## 🎯 The Problem We Solved

**Before Context:**
- Every page manually checked auth: `const supabase = createClient(); await supabase.auth.getUser()`
- Duplicated auth logic across multiple files
- No way for components to know when auth state changed
- Login/logout required manual page refreshes to see changes

**After Context:**
- Single source of truth for auth state
- Any component can use `useAuth()` hook
- Automatic updates when auth changes (login, logout, token refresh)
- Persistent sessions across navigation and page refreshes

---

## 🏗️ What We Built

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)

**The Core Pattern:**
```tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**Key Components:**
1. **State Management**: `user`, `session`, `loading`
2. **Initial Check**: `getSession()` on mount
3. **Real-time Listener**: `onAuthStateChange()` for live updates
4. **Cleanup**: Unsubscribe on unmount
5. **Custom Hook**: `useAuth()` for consuming the context

---

### 2. **Providers Wrapper** (`src/components/Providers.tsx`)

**Why We Need This:**

```tsx
'use client'

import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

**The Server/Client Boundary Problem:**
- Root `layout.tsx` is a Server Component (default)
- Context requires hooks → must be Client Component
- Can't add `'use client'` to root layout (loses Server Component benefits)
- **Solution**: Create Client Component "island" for providers

**Analogy:** Server Components are the building, Client Components are interactive kiosks inside. The Providers wrapper is the kiosk that makes auth available everywhere inside.

---

### 3. **Root Layout Integration** (`src/app/layout.tsx`)

**Wrapping the entire app:**
```tsx
import { Providers } from '@/components/Providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster />
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
```

**Why this works:**
- `Providers` is a Client Component
- Everything inside has access to auth context
- Layout stays a Server Component
- Best of both worlds!

---

### 4. **Navigation Updates** (`src/components/Navigation.tsx`)

**Using the context:**
```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
  const { user, signOut } = useAuth()

  return (
    <nav>
      {user ? (
        <div>
          <span>{user.email}</span>
          <button onClick={signOut}>Logout</button>
        </div>
      ) : (
        <div>
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
        </div>
      )}
    </nav>
  )
}
```

**Benefits:**
- No manual auth checks
- Automatically updates when user logs in/out
- Clean, declarative code

---

## 🎓 Key Concepts Learned

### 1. **React Context Pattern**

**Purpose:** Share state across component tree without prop drilling

**The Pattern:**
```
1. Create Context
2. Create Provider component (wraps children, provides value)
3. Create custom hook (useAuth) for consuming
4. Wrap app with Provider
5. Any component can use the hook
```

**Real-world analogy:** Context is like a company-wide announcement system. Instead of telling each person individually (prop drilling), you broadcast once and everyone hears it.

---

### 2. **onAuthStateChange Listener**

**What it does:**
Supabase fires events for ALL auth changes:
- `SIGNED_IN` - User just logged in
- `SIGNED_OUT` - User just logged out
- `TOKEN_REFRESHED` - Access token was auto-refreshed
- `USER_UPDATED` - User profile changed

**Why it's powerful:**
```tsx
supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session)
  setUser(session?.user ?? null)
})
```

Every component using `useAuth()` automatically re-renders when this fires!

**The Flow:**
```
User clicks "Logout"
  → signOut() called
  → Supabase clears cookies
  → onAuthStateChange fires with SIGNED_OUT
  → Context updates: user=null, session=null
  → ALL components using useAuth() re-render
  → Navigation shows "Login" link
```

---

### 3. **Loading State Pattern**

**Why it matters:**
```tsx
const [loading, setLoading] = useState(true)  // Start true!

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null)
    setLoading(false)  // Done checking
  })
}, [])
```

**Without loading state:**
```
Page loads → user = null → Shows "Login" link
100ms later → Session found → Shows "Logout" + email
Result: Flash of wrong content!
```

**With loading state:**
```
Page loads → loading = true → Show spinner
100ms later → Session found → loading = false → Show correct UI
Result: Smooth, no flash!
```

**Usage in components:**
```tsx
const { user, loading } = useAuth()

if (loading) return <Spinner />
if (user) return <Dashboard />
return <LoginPrompt />
```

---

### 4. **Subscription Cleanup**

**The memory leak problem:**
```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)

  // ❌ Without cleanup:
  // Component unmounts, but listener keeps running!
  // Navigate away and back = multiple listeners!
})
```

**The solution:**
```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)

  return () => subscription.unsubscribe()  // ✅ Cleanup!
}, [])
```

**When cleanup runs:**
- Component unmounts
- Dependencies change (empty array = never)
- Before next effect runs

**Why it matters:** Without cleanup, you get duplicate listeners, callbacks fire multiple times, performance degrades, memory leaks.

---

### 5. **Server vs Client Component Boundary**

**The Error We Would Hit Without Providers:**
```
Error: You're importing a component that needs "next/headers".
That only works in a Server Component.
```

**Why Providers wrapper works:**
```
layout.tsx (Server Component)
  ↓
<Providers> (Client Component) ← Boundary!
  ↓
Everything inside can use hooks, context, browser APIs
```

**Key Rule:**
- Server Components can import Client Components ✅
- Client Components CANNOT import Server Components ❌

---

### 6. **UI Affordances: cursor-pointer**

**The Issue:**
Buttons don't show pointer cursor by default in browsers.

**Why:** Historical web standards
- `<a>` tags = navigation → pointer cursor
- `<button>` tags = actions → default cursor

**Modern practice:** Add `cursor-pointer` to all interactive elements for better UX

```tsx
<button className="... cursor-pointer">Logout</button>
```

---

## 🎨 Architecture Diagram

```
┌─────────────────────────────────────────────┐
│ layout.tsx (Server Component)               │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ <Providers> (Client Component)        │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ <AuthProvider>                  │ │ │
│  │  │                                 │ │ │
│  │  │  [user, session, loading]      │ │ │
│  │  │  [signOut function]            │ │ │
│  │  │                                 │ │ │
│  │  │  ┌───────────────────────────┐ │ │ │
│  │  │  │ <Navigation>              │ │ │ │
│  │  │  │   useAuth() ← Gets data   │ │ │ │
│  │  │  └───────────────────────────┘ │ │ │
│  │  │                                 │ │ │
│  │  │  ┌───────────────────────────┐ │ │ │
│  │  │  │ Any Page                  │ │ │ │
│  │  │  │   useAuth() ← Gets data   │ │ │ │
│  │  │  └───────────────────────────┘ │ │ │
│  │  │                                 │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔄 Execution Flow

### App Initialization
```
1. App loads → AuthProvider mounts
2. State: user=null, session=null, loading=true
3. useEffect runs
4. getSession() checks cookies for existing session
5. If found: Update state with user/session
6. If not: State stays null
7. loading set to false
8. onAuthStateChange listener starts
9. All components render with current state
```

### User Logs In
```
1. User submits login form
2. supabase.auth.signInWithPassword() called
3. Supabase validates, returns tokens
4. Tokens written to cookies
5. onAuthStateChange fires (event="SIGNED_IN")
6. Context updates: session & user populated
7. ALL components using useAuth() re-render
8. Navigation shows email + logout button
9. No manual refresh needed!
```

### User Logs Out
```
1. User clicks logout button
2. signOut() function called from context
3. supabase.auth.signOut() clears cookies
4. onAuthStateChange fires (event="SIGNED_OUT")
5. Context updates: session=null, user=null
6. ALL components using useAuth() re-render
7. Navigation shows login/signup links
8. App updates instantly
```

### Token Refresh (Automatic)
```
1. Access token expires after 1 hour
2. User continues using app
3. Supabase detects expired token
4. Uses refresh token to get new access token
5. Updates cookies with new token
6. onAuthStateChange fires (event="TOKEN_REFRESHED")
7. Context updates with new session
8. App continues working seamlessly
9. User never notices!
```

---

## 💡 Key Takeaways

### **Pattern Universality**
This React Context pattern is used in EVERY modern React app:
- Auth state (what we built)
- Theme state (dark mode)
- i18n state (language selection)
- Cart state (e-commerce)
- Notification state

**Once you understand Context, you understand a fundamental React pattern.**

---

### **The "Reactive" Mental Model**

**Old way (manual):**
```tsx
// Every component manages its own auth state
const [user, setUser] = useState(null)

useEffect(() => {
  const supabase = createClient()
  supabase.auth.getUser().then(({ data }) => setUser(data.user))
}, [])

// Problem: Other components don't know when auth changes!
```

**New way (reactive):**
```tsx
// One central listener updates ALL components
const { user } = useAuth()

// Component automatically re-renders when user changes
// No manual state management needed!
```

**Key insight:** Reactive programming means "data flows, components react." You don't update components, you update data, and components respond automatically.

---

### **Why This Architecture Matters**

Before Context:
- 10 components each checking auth = 10 API calls
- User logs out in one tab, other tabs don't know
- Have to manually refresh to see auth changes

After Context:
- 1 API call on mount, shared by all
- State updates propagate instantly
- Real-time reactive to auth changes

**This is how production apps are built.**

---

## 🌍 Universal Patterns Learned

| Concept | Our Implementation | Used In |
|---------|-------------------|---------|
| **Context Pattern** | AuthContext | Redux, MobX, Zustand, Vue Provide/Inject, Angular Services |
| **Event Listeners** | onAuthStateChange | WebSockets, SSE, Firebase Realtime, Pusher |
| **Cleanup Functions** | subscription.unsubscribe() | All event listeners, timers, subscriptions |
| **Loading States** | loading boolean | Every async operation ever |
| **Custom Hooks** | useAuth() | All React apps (useTheme, useCart, etc.) |

---

## 📝 Files Modified

**Created:**
- `src/contexts/AuthContext.tsx` - Auth context and provider
- `src/components/Providers.tsx` - Client Component wrapper

**Modified:**
- `src/app/layout.tsx` - Wrapped app with Providers
- `src/components/Navigation.tsx` - Uses useAuth() hook, shows user email, logout button

**Total Lines:** ~120 lines of code for complete auth state management!

---

## ✅ Success Criteria Met

- ✅ Auth state available throughout entire app via useAuth()
- ✅ Login updates navigation automatically (no refresh)
- ✅ Logout updates navigation automatically (no refresh)
- ✅ User email displayed when logged in
- ✅ Loading state prevents flash of wrong content
- ✅ Session persists across page navigation
- ✅ Session persists across page refreshes
- ✅ Automatic token refresh handled transparently
- ✅ No memory leaks (subscription cleanup working)
- ✅ Type-safe with TypeScript

---

## 🔮 What's Next: Ticket 2.5

With centralized auth state complete, next we'll add:
- **Middleware** to protect routes at the edge
- Redirect unauthenticated users to login
- Refresh tokens automatically in middleware
- Protect dashboard, clients, tasks pages

The middleware will use the context to make routing decisions!

---

**Notes Section** (Add your own observations here):


---
---

# 🔐 Ticket 2.5: Protected Routes & Middleware

**Date Completed:** December 1, 2024
**Status:** ✅ Complete
**GitHub Issue:** #12
**Difficulty:** ⭐⭐⭐ (3/5)

## What We Built

Created Next.js middleware to protect all routes with authentication, redirect unauthenticated users to login, and enhanced dev tools for RLS testing.

**Files Created:**
- src/middleware.ts - Route protection
- src/app/dev/auth-test/ - Dev-only auth testing tool

**Files Modified:**
- src/components/Navigation.tsx - Added logout redirect

**Files Deleted:**
- src/app/test-auth/ - Moved to dev route


---
---

# 📋 Ticket 3.1: Form Validation Library

**Date Completed:** December 9, 2025
**Status:** ✅ Complete
**GitHub Issue:** #14
**Difficulty:** ⭐⭐⭐ (3/5)

## What We Built

Implemented comprehensive form validation across all application forms using Zod for schema validation and React Hook Form for form state management.

**Files Created:**
- `src/lib/schemas.ts` - Centralized Zod validation schemas for all forms

**Files Modified:**
- `src/app/clients/page.tsx` - Added validation to client form
- `src/app/clients/[id]/page.tsx` - Added validation to task and note forms
- `src/app/login/page.tsx` - Added validation to login form
- `src/app/signup/page.tsx` - Added validation to signup form with password confirmation
- `package.json` - Added zod, react-hook-form, and @hookform/resolvers

**Dependencies Added:**
- `zod`: ^4.1.13 - Schema declaration and validation library
- `react-hook-form`: ^7.68.0 - Performant form library
- `@hookform/resolvers`: ^5.2.2 - Resolver for Zod integration

## 🎯 The Complete Pattern

### 1. Schema Definition (schemas.ts)
```tsx
import { z } from 'zod'

// Define validation schema
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
})

// Infer TypeScript type from schema
export type ClientFormData = z.infer<typeof clientSchema>
```

### 2. Form Setup with useForm Hook
```tsx
const {
  register: registerClient,
  handleSubmit: handleSubmitClient,
  formState: { errors: clientErrors },
  reset: resetClientForm
} = useForm<ClientFormData>({ 
  resolver: zodResolver(clientSchema) 
})
```

### 3. Form Submission
```tsx
<form onSubmit={handleSubmitClient(addClient)}>
```

### 4. Input Registration
```tsx
<input type="email" {...registerClient('email')} />
```

### 5. Error Display
```tsx
{clientErrors.email && (
  <p className="mt-1 text-sm text-red-600">
    {clientErrors.email.message}
  </p>
)}
```

### 6. Clean Handler
```tsx
const addClient = async (data: ClientFormData) => {
  await createClient(data)
  resetClientForm()
  toast.success('Client added\!')
}
```

## 💡 Key Learnings

### Schema-First Design
Define your data contract first (the schema), then derive everything else:
```
Schema → TypeScript Types → Form Validation → API Contract
```

### Password Confirmation Pattern
Used `.refine()` for cross-field validation:
```tsx
export const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
```

### Email Validation: Manual vs Zod

**Manual (❌ Too simplistic):**
```tsx
if (\!email.includes('@')) {
  setError('Invalid email')
}
```
Accepts: `test@`, `@example.com`, `test@com` (all invalid\!)

**Zod (✅ RFC 5322 compliant):**
```tsx
z.string().email('Invalid email address')
```
Properly validates email format with local part, domain, and TLD.

### Error Message Positioning
**Best Practice:** Place error messages inside the field div, right after the input:
```tsx
<div>
  <label>Email *</label>
  <input {...register('email')} />
  {errors.email && <p>{errors.email.message}</p>}
</div>
```

## 🐛 Common Pitfalls Avoided

1. **Name Collisions**: Renamed destructured values when multiple forms on same page
2. **Error Positioning**: Placed errors next to their fields, not at form bottom
3. **Duplicate Validation**: Removed manual validation - trust the schema\!
4. **Form Reset**: Added `reset()` calls after successful submission
5. **Type Safety**: Used `z.infer<>` to derive TypeScript types from schemas

## 📊 Forms Updated

1. **Client Form** - name, email, phone, company validation
2. **Task Form** - title, description, status, priority, due_date validation
3. **Note Form** - content validation
4. **Login Form** - email, password validation
5. **Signup Form** - email, password, confirmPassword with matching validation

## ✅ Success Criteria Met

- ✅ All forms use schema-based validation
- ✅ Email validation is RFC 5322 compliant
- ✅ Password validation enforces minimum 8 characters
- ✅ Signup validates password confirmation
- ✅ Field-level error messages displayed inline
- ✅ TypeScript types inferred from schemas
- ✅ No duplicate validation logic
- ✅ Forms reset after successful submission
- ✅ Consistent error handling across all forms

## 🔮 What's Next

With form validation complete (Phase 3, Ticket 3.1), next up:
- Ticket 3.2: Loading states & skeletons
- Ticket 3.3: Toast notifications system (already using react-hot-toast)
- Ticket 3.4: Confirmation dialogs for destructive actions

---

---
---

# 📝 Ticket 3.7: Edit Clients, Tasks & Notes

**Started:** September 23, 2026
**Status:** ✅ Complete (September 29, 2026; PR #32)
**GitHub Issue:** #30
**Difficulty:** ⭐⭐⭐ (3/5)

## Why This Ticket Exists

A gap in the original plan. Ticket 1.3 only covered client create/delete, and 1.4 built `updateTask()` but only exposed status changes. You couldn't fix a typo in a client's email, which blocks shipping.

**Approach:** I wrote the code myself, following patterns already in the codebase, with Claude coaching and reviewing.

## What We Built (so far)

- `updateClient()` and `updateNote()` in `src/lib/data.ts`, copying the `updateTask()` pattern
- `src/components/ClientForm.tsx`: one form for **add and edit**, used on both `/clients` and `/clients/[id]`
- `src/components/TaskForm.tsx`: one form for add/edit tasks, with an optional client picker on `/tasks`
- Edit buttons for clients, tasks and notes

## 🎯 Key Concepts

### 1. Data Down, Events Up
A reusable component gets **data** through props and reports **events** through callbacks. The parent decides what those events mean.

```tsx
<ClientForm
    client={editingClient}      // data down: null = add mode, a client = edit mode
    onSubmit={handleSaveClient} // event up: "the user submitted"
    onCancel={handleCloseForm}  // event up: "the user cancelled"
/>
```

**What I discovered:** I started passing `setShowClientForm` down so Cancel could close the form. Passing an `onCancel` handler instead meant the parent sets its own state, and the component no longer depends on any particular page's state. That's what made `ClientForm` work unchanged on the client detail page.

**Mode from props:** the component works out add vs edit from `client ? 'Edit' : 'Add'`, so there's no separate mode state that could disagree with it. On `/tasks`, passing `clients` is what turns on the client dropdown. The prop that controls the behaviour is the data the behaviour needs.

### 2. `undefined` vs `null` in Updates
> **In an update, `undefined` means "leave this alone," and `null` means "make this empty."**

**The bug:** clearing a client's phone and saving brought the old number back.

**Why:** `data.phone || undefined` → Supabase converts the object to JSON → **JSON drops `undefined` keys** → the update never mentions `phone` → Postgres leaves the column as it was.

```js
JSON.stringify({ name: 'Alice', phone: undefined })  // '{"name":"Alice"}'  (phone is gone)
JSON.stringify({ name: 'Alice', phone: null })       // '{"name":"Alice","phone":null}'
```

**Fix:** send `data.phone || null`, and correct the type to `phone: string | null`, because Postgres really does return `null`.

**Debugging habit:** DevTools → Network → click the request → **Payload** shows what was *actually* sent. That tells you whether the bug is in your code or on the server.

### 3. Two Copies of the Data
1. **The database** (Supabase): the real, permanent data
2. **React state** (`tasks`, `clients`): the browser's copy, which the page draws from

Saving takes two steps. Skip the second and the page won't update until a refresh (this happened on `/tasks`):
```tsx
const updated = await updateTask(id, data)                          // 1. update the database
setTasks(tasks.map(t => t.id === id ? { ...t, ...updated } : t))    // 2. update the screen copy
```

### 4. Where Form State Lives (and When It's Destroyed)
- **The page** holds `editingClient` (who is being edited).
- **The form component** holds the input values (inside `useForm`).
- Changing the page's state **does not** change the form's values. Only `reset()`, or throwing the component away, does.
- **Removing a component from the page destroys its state.** Closing the form clears it for free. But the page-wide `loading` flag also removes the form while saving, so **a failed save loses what the user typed** (deferred to #15).

`useForm({ defaultValues })` and `defaultValue=` on inputs are only read **when the input first appears**. Switching from editing task A to task B while the form is open kept A's values, and saving would have **overwritten B with A's contents**. Fix: `reset(values)` whenever the task changes.

**`useEffect` + `reset` vs `key`:** I used a `useEffect` that calls `reset` whenever the `client` prop changes, with an `else` branch that blanks the form for Add. The alternative is `<ClientForm key={client?.id ?? 'new'} />`, which makes React create a fresh component whenever the key changes. **Trade-off:** my version is self-contained (it doesn't rely on the parent passing a key). `key` avoids an extra render, and it won't wipe what the user typed if a fresh copy of the same client arrives (this matters once Realtime is added in 5.4).

### 5. Truthiness Gotchas
```js
Boolean(null)  // false   ← why `editingClient ? ... : ...` works
Boolean('')    // false   ← why `data.phone || null` turns '' into null
Boolean({})    // TRUE    ← an empty object is still true!
```
**The bug:** `{errors && <p>...</p>}` always rendered, because `errors` is `{}` even when there are no errors. Check the specific field instead: `{errors.name && ...}`.

### 6. Rules of Hooks
React matches hooks (`useState`, `useEffect`, `useCallback`...) **by call order**, so they must run the same number of times, in the same order, on every render. That means they can **never** come after an early `return` or inside an `if`. Plain handler functions don't have this rule, but keeping all handlers above the early returns means they stay safe if one is later turned into a hook.

---

## 😵 Pain Points: Revisit These

### `.map()`, `.find()` and spread (`...`)
These are fundamental, and `.map` especially is everywhere in React.

| | The function answers... | Returns |
|---|---|---|
| `.map(fn)` | "What should this item **become**?" | a **new array**, same length |
| `.find(fn)` | "Is this **the one**?" (true/false) | the **first matching item**, or `undefined` |
| `.filter(fn)` | "Should this item **stay**?" (true/false) | a **new array** of the items that passed |

**My mistake:** I wrote `.find()` with a function that *returned the new object*, as I would with `.map()`. `.find` needs a yes/no test (`c => c.id === id`). Building the new object is a separate step afterwards.

**Object spread:** `{ ...a, ...b }` copies `a`, then `b`. Where both have the same key, `b` wins. Keys only `a` has survive.
```ts
{ ...task, ...updated }  // database's new values + the `client` field only this page adds
```
**Array spread:** `[created, ...tasks]` is a new array with `created` followed by every existing task.

**The one-liner, written out the long way (both do the same thing):**
```ts
// setTasks(tasks.map(task => task.id === id ? { ...task, ...updated } : task))
const newTasks = []
for (const task of tasks) {
    if (task.id === id) newTasks.push({ ...task, ...updated })
    else newTasks.push(task)
}
setTasks(newTasks)
```
**Why a new array?** React decides whether to redraw by checking whether you gave it a *different* array. Changing the old array in place looks like "nothing changed."

### Why TypeScript is so precise
**Types describe what data looks like.** TypeScript checks every place where data moves between variables, functions and props, and makes sure what you pass matches what was expected.

**How to read an error:** "Type **X** is not assignable to type **Y**" means *you're giving X where Y was expected.* Either the value is wrong, or the expected type is wrong. Work out which.

**Errors TypeScript caught in this ticket (all real bugs):**
- `clientId.name`: I was storing the ID string, not the client object
- `addClient(data: Client)`: the form gives 4 fields, not a whole Client
- `'client' is missing in type 'Task'`: a new task needed its client name added before going into the list

**A bug TypeScript *couldn't* catch:** the phone-clearing bug, because the `Client` type claimed `phone?: string` when Postgres really returns `null`. **An inaccurate type is worse than a strict one.**

**Ways of switching TypeScript's checks off (each one hides a bug instead of fixing it):**

| Escape hatch | What it really says |
|---|---|
| `as SomeType` | "Stop checking. Trust me." (It doesn't convert anything.) |
| `value!` | "This is definitely not null." |
| `\|\| ''` | "If it's missing, quietly use something that isn't real." |
| `any` | "Don't check this at all." |

**Better:** narrow with an `if`. After `if (!client) throw ...`, TypeScript *knows* `client` exists, so there's no need for `?.`, `!` or `|| ''`.

**AI autocomplete (Cursor Tab) warning:** these tools are good at making errors *disappear*, often by adding `as` and `|| ''`. When a suggestion contains one of those, stop and ask *why* the error happened.

---

---
---

# 🔔 Ticket 3.3: Toast Notifications System

**Date Completed:** September 30, 2026
**Status:** ✅ Complete
**GitHub Issue:** #16 (PR #33)
**Difficulty:** ⭐⭐ (2/5)

## The Rule This Ticket Applied
> **Every action ends with exactly one message: success or error. Failing an action must never take the page away.**

## 🎯 Key Concepts

### 1. Fatal vs Recoverable Errors
| | The page couldn't load | An action failed |
|---|---|---|
| Example | Opening a client, and the fetch fails | Deleting a note, and the request fails |
| Is the page usable? | **No**, there's nothing to show | **Yes**, everything is still there |
| Right response | Full-page error + "Try Again" | A toast; the page stays as it was |

**The bug:** the client detail page used one `error` state for both. `if (error) return <ErrorScreen />` treated every error as fatal, so one failed note delete wiped the whole page. **Fix:** `setError` only in the load function; actions use `toast.error`.

### 2. Silent Failures Are the Worst Failures
A `catch` that only does `console.error` means the user **thinks it worked.** `console.error` is for the developer; users never see it.

### 3. Theming a Third-Party Component with CSS Variables
`react-hot-toast` sets inline colours, so it ignored dark mode. Pointing it at the variables in `globals.css` makes it follow the theme:
```tsx
<Toaster toastOptions={{ style: {
    background: 'var(--background)',
    color: 'var(--foreground)',
    border: '1px solid rgb(128 128 128 / 0.3)',   // so it doesn't blend into the page
} }} />
```
**How dark mode works here:** there's no toggle. `@media (prefers-color-scheme: dark)` in `globals.css` changes the variables based on the **OS setting**, and Tailwind's `dark:` classes follow the same setting. Test both modes in DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme."

**Silent CSS bugs:** `'var(--foreground'` (missing `)`) and unknown Tailwind classes produce **no error**. The browser just ignores them.

### 4. Deciding *Not* to Build Something (YAGNI)
The ticket asked for a toast wrapper component. We skipped it: each call is already one line, and styling lives in one place. A wrapper is only worth it when it removes repetition or keeps a decision in one place.

### Verification
DevTools → Network → **Offline**, then trigger actions on each page: an error toast appears and the page stays in place.

---
---

# ⏳ Ticket 3.2: Loading States & Skeletons

**Date Completed:** October 2, 2026
**Status:** ✅ Complete
**GitHub Issue:** #15
**Difficulty:** ⭐⭐⭐ (3/5)

## What We Built
- **`loading` is only for the first fetch.** Actions no longer replace the page, so there's no flash, and **a failed save keeps what the user typed.**
- **"Saving..."** on all forms via React Hook Form's `isSubmitting`
- **Per-row "Deleting..."** with the button disabled (`deletingId`)
- **Skeletons** shaped like each page, plus a **`loading.tsx`** for every route

## 🎯 Key Concepts

### 1. One Flag, Two Jobs (Again)
Same lesson as `error` in 3.3, this time with `loading`:
- **Page loading** ("no data yet"): replacing the page with a skeleton is right.
- **Saving** ("data exists, a change is being sent"): replacing the page is wrong. It **removes any open form, destroying what was typed.**

**Removing a component from the page destroys its state.** That's useful when you want a reset (a new `key`), and a bug when it happens by accident (an early return during a save).

### 2. Returning the Promise So the Caller Knows When You're Done
`handleSubmit(onSubmit)` sets `isSubmitting = true`, **awaits whatever `onSubmit` returns**, then sets it back to false. If your handler returns nothing, there's nothing to wait for.

```tsx
// ❌ calls it, discards the promise → isSubmitting flips back immediately
const save = (data) => { updateClientData(id, data) }

// ✅ A: return the promise
const save = (data) => { return updateClientData(id, data) }

// ✅ B: async + await (an async function always returns a promise that finishes when its body does)
const save = async (data) => { await updateClientData(id, data) }

// ❌ C: async with NO await. Types say Promise<void>, but it resolves immediately
const save = async (data) => { updateClientData(id, data) }
```
**Arrow function gotcha:** `(x) => x * 2` returns automatically; `(x) => { x * 2 }` returns `undefined`.

**Calling ≠ returning:** a function without `return` gives back `undefined`, whatever it called inside.

**Typing `onSubmit: (data) => Promise<void>`** made TypeScript find the same missing-`return` bug on a page I hadn't touched yet. **But types can't catch option C:** TypeScript checks the *shape* of what you return, not *when* it finishes.

### 3. Store *Which*, Not Just *Whether*
```tsx
{deletingId ? 'Deleting...' : 'Delete'}            // ❌ any non-null ID is truthy → every row
{deletingId === task.id ? 'Deleting...' : 'Delete'} // ✅ only this row
```
Always reset in `finally` (`setDeletingId(null)`), or the state gets stuck after the first delete. Name it `deletingId`, not `isDeleting`: an `is...` name suggests a boolean.

### 4. Unreachable Code
Code after a `return` in every branch never runs. Removing the dead `handleCloseTaskForm()` also exposed that it *used to* run, closing the form before the save had finished.

### 5. Server Components Can't Use Hooks
The dashboard (`src/app/page.tsx`) is an **async Server Component**. It runs once on the server and produces HTML. Hooks like `useState` only exist in Client Components (`'use client'`), where there's a "later" for state to change in.

### 6. `loading.tsx` = Next.js's Suspense Boundary
- Next shows `loading.tsx` while the page in the same folder is waiting (server data or navigation), then swaps in the real page.
- **It applies to every route *beneath* it.** A single `src/app/loading.tsx` would show the *dashboard* skeleton while navigating to `/clients`. **Fix:** one `loading.tsx` per route, each reusing that page's skeleton component.
- The client pages fetch in `useEffect`, so Suspense doesn't apply to *their* data. They keep a manual `if (loading) return <Skeleton />`. Moving to server fetching (Server Actions) would change that, but that's future work.

### 7. Good Skeletons
- **A skeleton can't depend on the data it's waiting for:** `clients.map(...)` while `clients` is `[]` renders nothing. Use `Array.from({ length: 5 }, (_, i) => ...)`.
- **Copy the page's containers and spacing,** and match block heights to the text's **line height** (`text-3xl` → 36px → `h-9`), so content fills in rather than jumping.
- Expect small shifts where the data varies (optional fields, missing descriptions).

### 8. Editor vs Project TypeScript
A red underline on `import "./globals.css"` appeared after the editor updated: its built-in TypeScript was newer and checks side-effect imports, while the project's TS 5.8 (and the build) didn't. **Fix:** "TypeScript: Select TypeScript Version" → **Use Workspace Version.** The editor and the build should always agree.

### Verification
DevTools → Network → **3G**: skeletons on first load and navigation, "Saving..."/"Deleting..." on actions, no page flash, and **Offline + a failed save keeps the typed values.**

---

---
---

# 🛑 Ticket 3.4: Confirmation Dialogs

**Started:** October 2, 2026
**Date Completed:** October 8, 2026
**Status:** ✅ Complete
**GitHub Issue:** #17
**Difficulty:** ⭐⭐⭐⭐ (4/5). The first ticket with no existing pattern to copy.

## Why Replace `confirm()`?
The browser's `confirm()` can't be styled (it ignores the design and dark mode), freezes the page, and only shows plain text. The goal: a dialog that looks like part of the app, while keeping what `confirm()` does well (keyboard support, focus, screen readers).

## 🎯 Key Concepts

### 1. The Native `<dialog>` Element
| How it's opened | Kind | Result |
|---|---|---|
| `<dialog open>` / `.show()` | non-modal | the rest of the page still works |
| **`.showModal()`** | **modal** | on top of everything, rest of the page blocked |

`showModal()` gives you for free: the **top layer** (no z-index fights), a styleable **`::backdrop`**, **the rest of the page made inert** (no clicks, Tab, or screen readers), **focus moved into the dialog** and returned afterwards, and **Esc to close**.
- Calling `showModal()` on an already-open dialog **throws**, so check `dialog.open` first.
- `.close()` closes it. The `close` event fires *however* it closed (your `close()` or the user's Esc).

### 2. `useRef` vs `useState`
> **If the screen should change when the value changes → state. If you just need to keep hold of something between renders (a DOM element, a timer ID) → ref.**

`useRef` gives you a **box**; React puts the element in **`.current`** after rendering. **Re-renders don't destroy elements**; React updates them in place. Only *unmounting* does (conditional rendering, a new `key`, an early return).

### 3. Effects Connect React State to Browser APIs You Call Directly
`<dialog>` isn't opened by a prop; you call a method on it. So the component:
- gets `open` from the parent (state lives there),
- holds the element in a **ref**,
- uses an **effect** on `[open]` to call `showModal()` / `close()` so the element matches.

```tsx
useEffect(() => {
    const modal = dialogRef.current
    if (modal === null) return                       // narrowing: handle null once
    if (open && !modal.open) modal.showModal()
    else if (!open && modal.open) modal.close()
}, [open])
```

### 4. State Has to Sync in Both Directions
- **Page → dialog:** state changes → effect → `close()`. ✅
- **Dialog → page:** the **browser** closes it on Esc. Your effect isn't involved, so the page still thinks it's open, and the dialog **never reopens.**

**Fix:** listen for the element's event: `<dialog onClose={onCancel}>`. Esc and Cancel now take the same path.
> **When the browser controls something (a `<dialog>`, `<details>`, a video), it can change state without React knowing. Listen for its events.**

### 5. Two Moments, Two States, Both IDs
| State | Moment | Used for |
|---|---|---|
| `pendingDeleteId` | "which client is the user being asked about?" | the dialog's `open` |
| `deletingId` | "which client is being deleted right now?" | the row's "Deleting..." and the dialog's busy state |

**What went wrong first:** one `deletingId` for both meant the row said "Deleting..." before confirming and got stuck after Esc. A boolean `confirmDialogOpen` *copying* the pending ID meant two states that could disagree, so the dialog didn't close after confirming.

### 6. Derived Values: Store the Minimum, Work Out the Rest
A comparison asks the state a question and returns a fresh `true`/`false` every render. The state itself stays an ID.

| Derived value | From | Question |
|---|---|---|
| `open={pendingDeleteId !== null}` | pending ID | someone waiting for confirmation? |
| `isDeleting={deletingId !== null}` | deleting ID | anything being deleted? |
| `deletingId === client.id` | deleting ID | *this* row being deleted? |
| `filteredTasks` | `tasks` + `filter` | which tasks match the tab? |

**Before adding state, ask whether you can work it out from state you already have.**

**Give a component the least it needs:** the dialog gets a boolean (`isDeleting`), not the ID. It doesn't care *which* item, so it works for clients, tasks and notes alike.

### 7. Ternaries Pick Values; `if` Does Things
`cond ? modal.showModal() : null` works, but lint flags it (`no-unused-expressions`). The `: null` was a made-up value nobody used. Use a ternary to **choose a value**, and `if / else if` to **do something**.

### 8. Tailwind + `<dialog>` Gotchas
- **Top-left instead of centred:** browsers centre a modal with `margin: auto`; Tailwind's base styles reset `* { margin: 0 }`. **Fix:** `m-auto`. (Debug with DevTools → **Computed** → `margin` to see which rule won.)
- **Use `open:flex`, not `flex`:** plain `flex` overrides the "hidden when closed" style, so the dialog would always show.
- **`backdrop:bg-black/50`** styles the dimmed page behind it.

### 9. Reading TypeScript Errors
- *"Property 'open' does not exist on type 'RefObject<...>'"* → you're calling methods on the **box**, not `.current`.
- *"Property 'onClose' does not exist on type '...Props'"* → you're passing a prop the component doesn't accept.
- *"Type 'string | null' is not assignable to type 'boolean'"* → you passed the ID where a yes/no was needed; ask it a question (`!== null`).
- **Type `.` to explore:** `dialogRef.` → `current` → `.current.` → `showModal`, `close`, `open`. Autocomplete shows you the shape of any object.

### 10. Accessible Names with ARIA
```tsx
const titleId = useId()          // unique per instance: the detail page renders TWO dialogs
<dialog aria-labelledby={titleId} aria-describedby={descriptionId}>
    <h2 id={titleId}>{confirmLabel}</h2>
    <p id={descriptionId}>{confirmDescription}</p>
```
- `aria-labelledby` points **at another element's `id`**. Both ends have to exist. Pointing at an ID no element has **fails silently** (no error, no warning).
- **Verify it:** DevTools → Elements → select the `<dialog>` → **Accessibility** tab → **Name** should read the title. That's what a screen reader announces.
- Hard-coded IDs (`id="dialog-title"`) would clash when a page renders two dialogs; `useId()` makes each one unique.
- One `h1` per page, so a dialog title is an `h2`.

## ⏱ Reflection
This ticket took much longer than its 2h estimate: it was the first one with no existing pattern, it introduced several new concepts (refs, effects connected to browser APIs, two-way sync, derived values), and the coaching was deliberately question-based. Most of the time went into **state design**, not the dialog itself.

---

---
---

# 🚨 Ticket 3.5: Error Boundaries & 404 Pages

**Started:** October 9, 2026
**Date Completed:** October 14, 2026
**Status:** ✅ Complete
**GitHub Issue:** #18
**Difficulty:** ⭐⭐⭐ (3/5)

## 🎯 Key Concepts

### 1. Three Kinds of Failure
| Kind of failure | Example | Handled by |
|---|---|---|
| **Rendering fails** | dashboard data fails on the server, or a bug while drawing a page | `error.tsx` (and `global-error.tsx` for the root layout) |
| **A client page's first load fails** | `/clients` fetch fails inside `useEffect` | the page's own `if (error)` screen |
| **An action fails** | add / edit / delete fails | a **toast**; the page stays (Ticket 3.3) |

**Why the client pages need their own screens:** error boundaries only catch errors thrown **while React is rendering.** A fetch in `useEffect` runs *after* rendering, asynchronously, so an uncaught error there is never seen by the boundary. The page would be stuck on its skeleton with no message.

*(Possible later simplification: catch in the effect, store it in state, then `if (error) throw new Error(error)` during render, so `error.tsx` handles it. Kept the page screens for now.)*

### 2. The Special Files
| File | Shows when | `'use client'`? |
|---|---|---|
| `loading.tsx` | the page is waiting (Ticket 3.2) | no |
| **`error.tsx`** | something **throws while rendering** a page beneath it | **yes**: error boundaries run in the browser, and Try Again needs `onClick` |
| **`global-error.tsx`** | the **root layout itself** fails (replaces it, so it must render its own `<html>` / `<body>`) | **yes** |
| **`not-found.tsx`** | a URL matches no route | **no**: just a message and a link, so a Server Component sends no JS |

> **Rule:** if it's an error boundary, or responds to anything in the browser (clicks, typing, state, effects), it's a Client Component.

### 3. `reset()` vs `router.refresh()`
A Server Component page loads in two steps: **(1)** the server runs it and sends a *result*; **(2)** the browser displays that result.
- **`reset()` only repeats step 2.** If the server's result *was* the error, the browser re-displays the same error, like re-reading the same letter.
- **`router.refresh()` repeats step 1:** it asks the server for a fresh result.

```tsx
const handleTryAgain = () => {
    startTransition(() => {     // apply both as one update
        router.refresh()        // fetch again on the server
        reset()                 // display the fresh result instead of the error page
    })
}
```
| Where the error happened | "Try again" needs |
|---|---|
| In the browser (Client Component) | `reset()` |
| On the server (Server Component) | `router.refresh()` + `reset()` |

**Testing lesson:** my first test was skewed. Saving the file to remove the `throw` made Next.js send fresh output, so `reset()` *seemed* to work. Simulating a temporary failure (`if (Math.random() < 0.5) throw ...`) without editing any files showed that it didn't.

### 4. Don't Show `error.message` to Users
- It can leak internals (table names, SQL errors), which is called **information disclosure**, and it's jargon the user can't act on.
- In production, Next.js already **replaces Server Component error messages** with a generic one, and adds a **`digest`**: a reference code that matches the full error in the server logs.
- **Pattern:** a friendly message you wrote + the `digest` as a small "reference" (only if it exists) + `console.error(error)` in a **`useEffect`**, so *you* still see it.
- The page-level screens are fine: their `error` is **text you set yourself** (`setError('Failed to load tasks...')`); the raw error only goes to the console.

### 5. Side Effects Go in Effects
`console.error(error)` directly in the component body runs on **every render** (twice in development). Rendering should only describe the UI; logging and error reporting (Sentry in 4.3) go in `useEffect(() => ..., [error])`, so they run once per error.

### 6. Links Go Somewhere; Buttons Do Something
`<button onClick={() => router.push('/clients')}>` works, but `<Link href="/clients">` is correct: it can be opened in a new tab, it's announced as a link, and Next.js prefetches it. "Try Again" *does something*, so it's a button.

### 7. Testing Error Pages
- **Development shows Next.js's red overlay *on top of* your error page.** Close it to see yours.
- **`global-error.tsx` mostly matters in production:** test with `npm run build` → `npm start` (stop `npm run dev` first; they share `.next`).
- **Trigger a layout error only in the browser,** or the build fails while pre-rendering pages: `if (typeof window !== 'undefined') throw new Error('global test')` inside `Navigation`.
- `global-error.tsx` replaces the layout that imports `globals.css`, so it may appear **unstyled** unless it imports the CSS itself.

## 🔐 Security: An App vs a Website
A CRM stores **other people's personal data**, behind logins, in a shared multi-user database. That's far more to protect than an informational website has.

> **Anything in the browser is public and can be changed.** Security has to be enforced on the **server and in the database**, never by trusting the frontend.

| Already handled | Why |
|---|---|
| Row Level Security (2.6) | the real protection; even direct API calls with the public key only see your own rows |
| Middleware auth (2.5) | keeps logged-out users away from pages |
| Friendly error messages (3.5) | avoids information disclosure |
| Zod validation (3.1) | **helps users, but isn't security** (runs in the browser, so it can be bypassed) |

| Before launch | Ticket |
|---|---|
| `schema.sql` lacks the RLS policies; a fresh database built from it would expose all data | #21 |
| Only the **anon** key in `NEXT_PUBLIC_*`; the **service role** key bypasses RLS and must never reach the browser | #19 |
| Turn email confirmation back **on** in Supabase Auth | #20 |

Reference: the **OWASP Top 10** (the standard list of common web app risks).

---

# 🔧 Ticket 3.6: Environment & Build Configuration

**Started:** October 29, 2026
**Date Completed:** October 30, 2026
**Status:** ✅ Complete
**GitHub Issue:** #19
**Difficulty:** ⭐⭐ (2/5)

**How this ticket was built:** this is the start of the final two-week push to ship the app as a portfolio piece. To save time, the work switched to "**Claude drafts, I review and explain it back**." The rule: nothing ships that I can't explain. The explain-back questions and my answers are below.

## 🎯 What Changed, in Plain Terms
| Group | Change | Why |
|---|---|---|
| **Config safety net** | `src/lib/env.ts` checks the Supabase settings once, at startup | Missing settings, template placeholders, or the wrong key stop the app with a message that says how to fix it |
| | The three Supabase clients read from `env` instead of `process.env.X!` | The `!` meant "trust me, it's there." Now it's checked |
| | `next.config.ts` imports `env.ts` | The check runs the moment `npm run dev` / `npm run build` starts (and on Vercel) |
| | Legacy client in `src/lib/supabase.ts` removed (types kept) | It quietly used a fake `placeholder.supabase.co` address when settings were missing: **hiding** a problem instead of reporting it |
| **Honest build output** | `export const dynamic = 'force-dynamic'` on the dashboard | See "Page config exports" below |
| **Bugs the linter found** | Signup now shows its error | It set "Email already in use" but never displayed it. Users saw nothing |
| | Effect dependency fixes (`TaskForm`, client detail) | An effect used a value without listing it, so React might not rerun it when that value changed (stale form data) |
| **Cleanup** | Deleted `mockData.ts`; uninstalled `dotenv` | Unused code is something a reviewer asks about |
| **Formatting** | Prettier + `npm run format` / `format:check` | One consistent style; see below |

## 🔑 Key Concepts

### 1. Two Kinds of Supabase Keys (the apartment building)
**My first guess was wrong:** I thought this ticket was about hiding the keys. It isn't. **The anon key is meant to be public.**
- **Anon key = the front door.** Anyone can enter the lobby. Every visitor's browser gets a copy, and that's fine.
- **RLS = the lock on each apartment.** You can only open your own (your own rows). This is the real protection.
- **Service role key = the manager's master key.** Opens every apartment and **ignores RLS.**
- **`NEXT_PUBLIC_` = "send this to every visitor's browser."** Like posting it on the front of the building.

The danger is putting the **master key where the front-door key goes.** No hacking needed: anyone can open dev tools, copy it, and read or change **everyone's** data. On the server it's safe because server code never reaches the browser; visitors only get the finished page.

`env.ts` refuses a secret key: old-style keys are JWTs (decoded with `atob`, which works in the browser, Edge middleware and Node) with `"role": "service_role"`; new-style secret keys start with `sb_secret_`.

### 2. "Three Supabase Clients" Means Three Connections, Not Three Tables
Naming collision: here **client = the connection tool** code uses to talk to Supabase, not a CRM client. There are three because code runs in three places, and each handles login cookies differently:

| File | Runs in |
|---|---|
| `supabase/client.ts` | the visitor's **browser** |
| `supabase/server.ts` | the **server** (dashboard) |
| `supabase/middleware.ts` | the **middleware** that runs before every page |

All three need the same URL and key, so all three read them from `env.ts`.

### 3. Fail Fast: Check Config at Build Time
Without the check, the build **most likely succeeds**, because missing settings only crash when a page actually talks to Supabase (when someone visits). The broken app deploys and **users find out.** With the check, the build stops, nothing broken goes live, and the error says what to fix. A common real-world case: forgetting to enter the env vars in Vercel (#20).

**Gotcha:** Next.js only copies `NEXT_PUBLIC_*` values into browser code when the full name is written out (`process.env.NEXT_PUBLIC_SUPABASE_URL`). Passing `process.env` itself to Zod gives an empty object in the browser. Verified by finding the Supabase URL inside 6 files in `.next/static`.

### 4. Page Config Exports (`export const dynamic`)
`export const dynamic = 'force-dynamic'` looks like an unused variable. **My code doesn't use it; Next.js does.** When building, Next.js opens each `page.tsx` and looks for exports with names it knows, just like it uses `export default` as the page. It must be **exported** or Next.js can't see it. (Like a label on a package: I write it, the delivery company reads it.)

It says: *"Don't make this page ahead of time; make it fresh per visitor."* The dashboard differs per logged-in user (it reads cookies), so it can't be pre-made. Next.js had been working that out by trial and error at build time, which printed a scary-looking `Unexpected error in getDashboardStats: Dynamic server usage...` log. Now it's stated up front and the log is gone.

### 5. Lint Warnings Can Be Bugs in Disguise
`'error' is assigned a value but never used` actually meant **the signup page never showed its error message.** Lesson: read each warning and ask *what does this mean for the user?*, then fix it. **Keep lint at zero** so a new warning stands out; with 20 permanent warnings, nobody notices the 21st.

### 6. `useCallback` and Declaration Order
`fetchClientData` is called by the effect **and** by the error screen's Try Again button, so it couldn't simply move inside the effect. Wrapping it in `useCallback(..., [clientId])` gives a function that only changes when `clientId` does, so it can be listed as a dependency.

**Trap caught while drafting:** a dependency array is read **during render**. If the effect sits *above* the `const fetchClientData = ...` line, rendering crashes with *"Cannot access 'fetchClientData' before initialization."* The effect had to move below the function.

### 7. Prettier Decisions
- **No semicolons, single quotes, 4 spaces:** matches most of the code I'd already written.
- **`printWidth: 120`:** measured the reformat at 80 / 100 / 120 characters: ~1,600 / ~1,300 / ~1,150 changed lines. 120 changed the least and suits long Tailwind class lists.
- **Ignored:** Markdown (hand-formatted notes) and `package.json` / `package-lock.json` (npm manages them).
- **Reformat in its own commit**, listed in **`.git-blame-ignore-revs`** so `git blame` shows who really wrote each line, not "Prettier reformat." GitHub reads the file automatically; locally: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

## 🧪 How It Was Tested
- Env check, 5 cases (`.env.local` moved aside temporarily): missing file, template placeholders, service role JWT, `sb_secret_` key → all rejected with clear messages; a normal anon-style key → accepted.
- Production server (`npm run build` + `next start`): `/login` and `/signup` 200; `/` logged out → 307 to `/login` (middleware works with the new import).
- `npm run lint` 0 warnings (was 3), `npm run typecheck` passes, `npm run format:check` passes, build clean.
- Bundle sizes: first load 100–181 kB per route, so no optimization needed.

## 🗣 How to Say It in an Interview
1. **Build-time check:** *"I validate config at build time so a missing setting fails the deploy with a clear message, instead of shipping a broken app that users discover."*
2. **Service role key:** *"The anon key is public by design, because RLS limits it to the logged-in user's own rows. The service role key bypasses RLS, so in a `NEXT_PUBLIC_` variable it's in every visitor's browser and anyone could read everyone's data. It only belongs in server-only code, and my env check refuses to start if it's in the wrong place."*
3. **Lint warnings:** *"An 'unused variable' warning turned out to mean the signup page never showed its error. I keep lint at zero warnings so a new one gets noticed."*

## 🔮 Later
- `no-floating-promises` lint rule (catches un-awaited promises) needs type-aware linting setup; skipped for the two-week push.
- Prettier format-on-save: install the Prettier VS Code extension and set it as the default formatter.
- Run `npm run format:check` and `npm run lint` in CI (with #36).

---

# 🔁 Data Update Patterns: Refetch vs Server-Confirmed vs Optimistic

**Added:** October 14, 2026 (a correction). Tickets 1.3 and 1.4 called this codebase's updates "optimistic." **They aren't.** A mock interview question caught it: *"Your code does `const created = await createClient(data); setClients([created, ...clients])`. Is this an optimistic update?"* **No.**

## The Three Patterns
**1. Refetch** (before Ticket 1.3)
```tsx
await createClient(data)
await loadClients()                     // fetch the whole list again
```
Wait for the server, then fetch everything again. Simple and always accurate, but two requests.

**2. Server-confirmed / "update from the response"** (what this app actually does)
```tsx
const created = await createClient(data)    // wait for the server...
setClients([created, ...clients])           // ...then add the row it returned
```
The screen changes **only after the server says yes**, using the saved row (with its real `id` and `created_at`). This is a **pessimistic** update. **What 1.3 actually gained: it removed the refetch, not the wait.**

**3. Optimistic**
```tsx
const temp = { ...data, id: crypto.randomUUID(), pending: true }
setClients([temp, ...clients])                                       // 1. update the screen first
try {
    const created = await createClient(data)                         // 2. then ask the server
    setClients(cs => cs.map(c => c.id === temp.id ? created : c))    // 3. swap in the real row
} catch {
    setClients(cs => cs.filter(c => c.id !== temp.id))               // 4. roll back on failure
    toast.error('Could not add client')
}
```
The screen changes **before** the server answers, assuming success; afterwards you either confirm or roll back.

## Why Server-Confirmed Is a Reasonable Choice Here
Optimistic suits actions that are **fast, almost always succeed, and are easy to undo** (likes, checkboxes, **task status changes**). It's riskier when:
- **the server creates data you need:** a new client's real `id` comes from the database, so a temporary row has a fake ID (clicking "View" on it would break);
- **undoing it would confuse people:** a deleted client reappearing along with its cascade-deleted tasks and notes.

Phase 3 made the waiting **visible** ("Saving...", "Deleting..."), which is the right companion to server-confirmed updates.

**If adding one optimistic action:** task status changes are the natural candidate, using React 19's **`useOptimistic`** hook.

## How to Say It in an Interview
> *"It's server-confirmed, not optimistic: I wait for the insert, then add the row the database returns, which avoids refetching the list. I chose that because new records get their ID from the database and deletes cascade, so a rollback would be confusing. For quick, reversible actions like toggling a task's status, I'd use an optimistic update with rollback, for example with React 19's `useOptimistic`."*

---

---
---

# 🛠 Editor Shortcuts & Tooling (VS Code / Cursor, Windows)

A reference section, not tied to one ticket. Cursor uses VS Code's keys except **Ctrl+K** (its AI shortcut), so Ctrl+K chords are left out. **Learn 2–3 at a time**; start with Ctrl+P, Ctrl+. and F12 / Alt+←.

## Code-Aware Tools (they understand TypeScript, not just text)
| Keys | What it does | Why it beats the alternative |
|---|---|---|
| **F2** | **Rename Symbol**: renames a variable everywhere it's used, across files | Find-and-replace also matches text in strings and comments. Renaming `deleting` that way turned `'Deleting...'` into `'deletingId...'` |
| **F12** / **Ctrl+click** | Go to definition | jump from `deleteClient(...)` in a page to `data.ts` |
| **Alt+←** | Go back to where you were | return after F12 |
| **Shift+F12** | Find all references | see what uses something before changing it |
| **Ctrl+.** | **Quick Fix**, especially **adding missing imports** | type `<ConfirmDialog`, press Ctrl+., pick "Add import" |
| **Shift+Alt+O** | Organize imports (sorts them, **removes unused ones**) | clears "is defined but never used" lint warnings |
| **`.` then read the list** | Autocomplete shows what an object has | how I found `dialogRef.current.showModal()` |
| **Hover** | Shows the type of anything | most confusion is assuming the wrong shape (an ID string vs a client object) |

## Getting Around
| Keys | What it does |
|---|---|
| **Ctrl+P** | Open a file by typing part of its name (`ConfDi` → `ConfirmDialog.tsx`) |
| **Ctrl+Shift+O** | Jump to a function or variable in the current file |
| **Ctrl+G** | Go to line (use the line number from `page.tsx(152,60)`) |
| **F8** | Next error or warning in the file |
| **Ctrl+Shift+M** | Problems panel: every error, clickable |
| **Ctrl+`** | Toggle the terminal |

## Editing
| Keys | What it does |
|---|---|
| **Alt+↑ / Alt+↓** | Move the line up or down |
| **Shift+Alt+↓** | Duplicate the line |
| **Ctrl+Shift+K** | Delete the line |
| **Ctrl+/** | Toggle a comment |
| **Ctrl+D** | Select the next match (repeat to add more), then edit them all at once. **Text-based**, so use F2 for renaming variables |
| **Alt+click** | Add a cursor |
| **Ctrl+Space** / **Ctrl+Shift+Space** | Show suggestions / show the parameters of the function you're calling |

## Workflow Habits
- **Continuous type checking:** run `npx tsc --noEmit --watch` in a second terminal. It re-checks the whole project on every save, including files that aren't open.
- **Editor and project TypeScript should match:** "TypeScript: Select TypeScript Version" → **Use Workspace Version** (see Ticket 3.2).
- **Format on save without shared rules creates noise in diffs.** The editor reformatted `globals.css` to its own style. Fix: a project `.prettierrc` (planned for #19), or turn off format on save until then.
- **Read the Computed tab** (DevTools → Inspect → Computed) to see *which* CSS rule won when layout looks wrong.
- **Read the Network tab's Payload** to see what was actually sent to the server.

---
