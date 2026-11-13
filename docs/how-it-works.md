# How It Works

Each flow has a short overview first, then answers to common questions. For the overall structure, see
[architecture.md](architecture.md).

## Adding a task

### The overview

Adding a task is a round trip. A form collects and validates the input. A submit handler passes it to the data layer,
which sends it to the database. The database checks it with Row Level Security and stores it. The saved row comes back
up to the submit handler, which updates the screen.

```
  Form          Screen
     ↘          ↗
    Submit handler
        ↓  ↑
      Data layer
        ↓  ↑
       Database
```

| Step | Its job |
|---|---|
| Form | Collects and validates the input |
| Submit handler (`addTask`) | Takes the form data to the data layer, then updates the screen with the result |
| Data layer | Talks to Supabase |
| Database | Checks the rules, stores the row |
| Screen | Shows the updated list and a toast |

### Common questions

**How is input validated?**
React Hook Form holds the values and Zod checks them. If validation fails, the user sees errors right away.

**Why React Hook Form instead of `useState`?**
It keeps the form uncontrolled, so there's no state per field and typing doesn't re-render the whole form.

**Why doesn't the form save the task itself?**
The form is reused, so each parent passes in its own submit handler: one for adding, one for editing, and another on the
client detail page.

**What's Supabase?**
A hosted Postgres database with auth and an API built in.

**Is Zod enough to keep the data safe?**
No. Zod is for quick feedback and can be bypassed, because anyone can call the Supabase API directly. The database
enforces the real rules: Row Level Security for who can touch a row, and constraints for what's valid.

**How does Row Level Security know who the user is?**
From the signed token. The browser can change the data it sends, but it can't fake the token.

**What does the policy check?**
That the task's `user_id` matches the token, and that its client belongs to the same user.

**How does the screen update?**
The database returns the saved row with its ID, and the submit handler adds it to the list. The returned row is used
because the list needs that ID for editing and deleting.

**What if it fails?**
The data layer throws an error, and the submit handler catches it and shows an error toast. The form stays open with the
user's input.

**Is this a typical pattern?**
Yes, it's a layered architecture. The difference is that the browser talks directly to Supabase, with no API server in
between, so the rules live in the database. Anything that needs a secret key runs on the server (for example, the demo
sign-in in `src/app/api/demo/route.ts`).
