# Simple CRM

A simple Customer Relationship Management (CRM) system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

-   **Client Management**: Add, view, and manage client contacts
-   **Task Management**: Create and track tasks for each client
-   **Notes**: Add notes and comments for clients
-   **Dashboard**: Overview of clients, tasks, and activities
-   **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

-   **Frontend**: Next.js 15, React 19, TypeScript
-   **Styling**: Tailwind CSS 4
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Supabase Auth (ready to implement)

## Getting Started

### Prerequisites

-   Node.js 18 or later
-   A Supabase account and project

### Installation

1. Clone the repository:

    ```bash
    git clone <your-repo-url>
    cd crm-proto
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up your Supabase project:

    - Create a new project on [Supabase](https://supabase.com)
    - Copy your project URL and anon key

4. Configure environment variables:

    - Copy `.env.local` and update with your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

5. Set up the database:

    - Go to your Supabase project dashboard
    - Navigate to the SQL Editor
    - Run the SQL commands from `database/schema.sql`

6. Start the development server:

    ```bash
    npm run dev
    ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses three main tables:

-   **clients**: Store client contact information
-   **tasks**: Track tasks and their status for each client
-   **notes**: Store notes and comments about clients

See `database/schema.sql` for the complete schema.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── clients/           # Client management pages
│   ├── tasks/             # Task management pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage/dashboard
├── components/            # Reusable components
│   └── Navigation.tsx     # Main navigation
└── lib/                   # Utility libraries
    └── supabase.ts       # Supabase client and types
```

## Usage

### Adding Clients

1. Navigate to the "Clients" page
2. Click "Add Client"
3. Fill in the client information
4. Click "Add Client" to save

### Managing Tasks

1. Go to a client's detail page
2. Click on the "Tasks" tab
3. Click "Add Task" to create a new task
4. Update task status as needed

### Adding Notes

1. Go to a client's detail page
2. Click on the "Notes" tab
3. Click "Add Note" to add a new note

## Next Steps

This is a basic CRM implementation. You can extend it by:

-   Adding user authentication
-   Implementing user permissions and roles
-   Adding email integration
-   Creating reports and analytics
-   Adding file attachments
-   Implementing calendar integration
-   Adding client communication history

## Contributing

This is a prototype project. Feel free to fork and modify according to your needs.

## License

MIT License - feel free to use this for your own projects.
