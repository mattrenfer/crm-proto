# CRM Proto - Project Context

## Project Overview
This is a Customer Relationship Management (CRM) system built with Next.js 15, React 19, TypeScript, and Supabase. Originally scaffolded with GitHub Copilot, now being customized and made my own.

## Current Status
- **In Active Development**: Customizing and personalizing the project
- **Database**: Supabase backend with PostgreSQL
- **Frontend**: Next.js with App Router, Tailwind CSS 4
- **Type Safety**: Full TypeScript implementation

## Key Features
1. **Client Management**: Add, view, and manage client contacts
2. **Task Management**: Create and track tasks for each client
3. **Notes System**: Add notes and comments for clients
4. **Dashboard**: Overview of clients, tasks, and activities
5. **Responsive Design**: Works on desktop and mobile

## Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── clients/           # Client management pages
│   ├── tasks/             # Task management pages
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx          # Homepage/dashboard
├── components/            # Reusable components
│   └── Navigation.tsx     # Main navigation
└── lib/                   # Utility libraries
    ├── supabase.ts       # Supabase client and types
    └── mockData.ts       # Mock data for development
```

## Database Schema
Three main tables in Supabase:
- **clients**: Client contact information (name, email, phone, company, status)
- **tasks**: Tasks for clients (title, description, status, priority, due_date)
- **notes**: Notes about clients (content, timestamps)

See `supabase/migrations/` for the complete schema (`database/schema.sql` was removed in Ticket 4.2).

## Recent Work
- Added dashboard statistics (total clients, active tasks, pending tasks)
- Implemented client detail pages with tabs for info/tasks/notes
- Added ID attributes to homepage sections for better testability
- Fixed various bugs in client and task management

## Tech Stack Details
- **Framework**: Next.js 15.4.2 with App Router
- **React**: Version 19.1.0
- **TypeScript**: Version 5
- **Styling**: Tailwind CSS 4 with dark mode support
- **Database**: Supabase (PostgreSQL + Realtime)
- **Dev Server**: Turbopack enabled for fast refresh

## Development Workflow
- Run dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Dev server runs on: http://localhost:3000

## Environment Setup
Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps & Ideas
- [ ] Add user authentication with Supabase Auth
- [ ] Implement user permissions and roles
- [ ] Add email integration
- [ ] Create reports and analytics
- [ ] Add file attachments to clients/tasks
- [ ] Calendar integration for tasks
- [ ] Client communication history tracking
- [ ] Search and filtering capabilities
- [ ] Export data functionality

## Notes for Future Sessions
- This project was originally scaffolded with GitHub Copilot
- Currently being customized to make it my own
- Mock data is available in `lib/mockData.ts` for development without Supabase
- Dark mode is fully supported throughout the UI
