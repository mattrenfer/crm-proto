# Handful

**For the handful of people who count on you.** Most CRMs are a database you have to read. Handful is a front page that tells you who needs you today.

**Live:** https://handful.matthewrenfer.com (early release)

![The Handful dashboard, with a client's most urgent task as the lead story](docs/images/dashboard.png)

## Why it exists

A small business was using two CRMs to manage its clients. One was simple but lacked features. The other had everything but was hard to use. Handful aims for the space between them: low tech, intuitive, and human.

## What it does

-   **A dashboard that decides what matters.** Your most urgent task becomes the lead story, with the next few beside it.
-   **Your people.** Each client's details, with their next task beside their name.
-   **Notes and tasks together** on each client's page.
-   **Plain language.** "Still on your list" instead of "Overdue."
-   **Private by default.** Each account's data is kept separate in the database itself.
-   **Light and dark modes**, and it works on a phone.

## How it's built

| | |
|---|---|
| **App** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, with color tokens for light and dark |
| **Data and sign-in** | Supabase (Postgres and Auth) |
| **Forms** | React Hook Form and Zod |
| **Hosting** | Vercel, with Resend for email |

-   **Row Level Security** keeps each person's data private in the database, so a bug in the interface can't expose it. `supabase/tests/rls_test.sql` checks it with two users.
-   **The schema lives in migrations** in `supabase/migrations/`, and they're tried on a separate test project first.
-   **Urgency is a few small pure functions** in `src/lib/tasks.ts` and `src/lib/dates.ts`.

## How this was built

It started as a prototype scaffolded with GitHub Copilot, and it's been built since with Claude Code. Most of the code was generated from my prompts, and I integrated and tested every change. I set the product direction and the design, and I wrote parts of it myself, including a database migration and several bug fixes. `LEARNING_NOTES.md` is my running record of what I learned along the way.

## Running it locally

You'll need Node.js 20 or later, and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/mattrenfer/handful.git
cd handful
npm install
cp .env.local.example .env.local   # then add your Supabase URL and anon key
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push --linked      # builds the database from the migrations
npm run dev
```

Then open http://localhost:3000. The database workflow is in `supabase/README.md`.

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build, with type checking |
| `npm run lint` | Lint |
| `npm run typecheck` | Check types |
| `npm run format` | Format with Prettier |

## Project layout

```
src/
├── app/          # Pages: dashboard, clients, tasks, sign-in
├── components/   # Forms, navigation, layout, loading skeletons
├── contexts/     # Session state for the interface
├── lib/          # Data access, schemas, urgency and date logic
└── middleware.ts # Keeps signed-out visitors on the sign-in pages
supabase/
├── migrations/   # The database schema, in order
├── seed/         # Sample data for the demo account
└── tests/        # The two-user Row Level Security test
```

## What's next

Handful is an early release. Before a 1.0, it needs search, automated tests, reminders, account deletion, data export and a privacy policy.
