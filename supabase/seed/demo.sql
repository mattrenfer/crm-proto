-- ============================================================
-- Demo account sample data
-- ============================================================
-- Fills one account with realistic sample clients, tasks and notes, for screenshots and the demo.
--
-- Before running: create the user in the Supabase dashboard
-- (Authentication > Users > Add user, with "Auto Confirm User" on), and set demo_email below.
--
-- Run it in the SQL editor. It's safe to run again: it deletes that account's clients first,
-- which also deletes their tasks and notes (ON DELETE CASCADE), then adds fresh ones.
--
-- Due dates are relative to today, so "Today" and "Still on your list" always have something to show.
-- It only touches rows belonging to demo_email.

do $$
declare
    demo_email text := 'demo@matthewrenfer.com';
    demo_id uuid;
    dana uuid;
    tom uuid;
    marcus uuid;
    priya uuid;
    elena uuid;
    sam uuid;
begin
    select id into demo_id from auth.users where email = demo_email;
    if demo_id is null then
        raise exception 'No user with email %. Create it first in Authentication > Users.', demo_email;
    end if;

    delete from public.clients where user_id = demo_id;

    -- Clients
    insert into public.clients (user_id, name, email, phone, company, created_at)
    values (demo_id, 'Dana Whitfield', 'dana@example.com', '555-555-0142', 'Whitfield Studio', now() - interval '16 days')
    returning id into dana;

    insert into public.clients (user_id, name, email, phone, company, created_at)
    values (demo_id, 'Tom Okafor', 'tom@example.com', '555-555-0177', 'Okafor Landscaping', now() - interval '40 days')
    returning id into tom;

    insert into public.clients (user_id, name, email, phone, company, created_at)
    values (demo_id, 'Marcus Bell', 'marcus@example.com', '555-555-0118', 'Bell & Sons', now() - interval '90 days')
    returning id into marcus;

    insert into public.clients (user_id, name, email, phone, company, created_at)
    values (demo_id, 'Priya Nair', 'priya@example.com', '555-555-0163', 'Northside Yoga', now() - interval '9 days')
    returning id into priya;

    insert into public.clients (user_id, name, email, phone, company, created_at)
    values (demo_id, 'Elena Ruiz', 'elena@example.com', null, 'Ruiz Bakery', now() - interval '120 days')
    returning id into elena;

    insert into public.clients (user_id, name, email, phone, company, created_at)
    values (demo_id, 'Sam Lindqvist', 'sam@example.com', '555-555-0190', null, now() - interval '25 days')
    returning id into sam;

    -- Tasks: one due today, one past due, the rest spread over the next two weeks
    insert into public.tasks (user_id, client_id, title, description, status, priority, due_date) values
        (demo_id, dana, 'Send the proposal', 'Cover the spring launch too.', 'in_progress', 'high', current_date),
        (demo_id, dana, 'Book the kickoff call', null, 'pending', 'medium', current_date + 9),
        (demo_id, tom, 'Check in about the spring planting plan', null, 'pending', 'medium', current_date - 2),
        (demo_id, marcus, 'Call about the renewal', 'His contract ends in December.', 'pending', 'high', current_date + 3),
        (demo_id, priya, 'Send next steps from the kickoff', null, 'in_progress', 'low', current_date + 4),
        (demo_id, sam, 'Send the invoice', null, 'pending', 'medium', current_date + 10),
        (demo_id, sam, 'Measure the reading nook', null, 'pending', 'low', null),
        (demo_id, elena, 'Deliver the menu photos', null, 'completed', 'medium', current_date - 6);

    -- Notes
    insert into public.notes (user_id, client_id, content, created_at) values
        (demo_id, dana, 'Dana asked about starting in January. She wants the proposal to cover the spring launch too. Her team is small, so keep the timeline simple.', now() - interval '3 days'),
        (demo_id, dana, 'First call. She found us through Elena. Prefers email, and is out on Fridays.', now() - interval '16 days'),
        (demo_id, tom, 'Wants native plants along the back fence. Budget is flexible if it saves water.', now() - interval '12 days'),
        (demo_id, marcus, 'Happy with this year. Asked whether the renewal can include a second location.', now() - interval '20 days'),
        (demo_id, priya, 'Kickoff went well. She wants the class schedule online before the new year.', now() - interval '2 days'),
        (demo_id, elena, 'Loved the photos. Might want a second shoot in the spring for the patio menu.', now() - interval '5 days');
end $$;
