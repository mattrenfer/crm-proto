-- Two-user RLS test.
--
-- RUN ONLY AGAINST THE TEST PROJECT (crm-proto-test), never live:
--   npx supabase link --project-ref <test project ref>
--   npx supabase db query --linked -f supabase/tests/rls_test.sql
--
-- Acts as two users by setting the same login claims a real browser request would
-- (request.jwt.claims + the "authenticated" role), so it exercises the real RLS policies.
-- "Blocked" only counts an RLS rejection (insufficient_privilege), so a typo in the test
-- can't pass by accident. Every case should print PASS. The test users are deleted at the end.

create temp table results (n int, test text, outcome text);
grant insert on results to authenticated, anon;

do $$
declare
    user_a uuid := gen_random_uuid();
    user_b uuid := gen_random_uuid();
    client_a uuid;
    client_b uuid;
    task_b uuid;
    seen int;
    changed int;

    -- helper state
    blocked boolean;
begin
    insert into auth.users (id, email, aud, role) values
        (user_a, 'rls-test-a@example.com', 'authenticated', 'authenticated'),
        (user_b, 'rls-test-b@example.com', 'authenticated', 'authenticated');

    -- ---- act as user A ----
    perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);

    insert into public.clients (name, email, user_id) values ('A Client', 'same@example.com', user_a) returning id into client_a;
    insert into results values (1, 'A can add their own client', 'PASS');

    insert into public.tasks (client_id, title, user_id) values (client_a, 'A task', user_a);
    insert into results values (2, 'A can add a task to their own client', 'PASS');

    -- ---- act as user B ----
    perform set_config('role', 'postgres', true);
    perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);

    select count(*) into seen from public.clients where id = client_a;
    insert into results values (3, 'B cannot see A''s client', case when seen = 0 then 'PASS' else 'FAIL' end);

    update public.clients set name = 'hacked' where id = client_a;
    get diagnostics changed = row_count;
    insert into results values (4, 'B cannot edit A''s client', case when changed = 0 then 'PASS' else 'FAIL' end);

    blocked := false;
    begin
        insert into public.tasks (client_id, title, user_id) values (client_a, 'sneaky task', user_b);
    exception when insufficient_privilege then blocked := true;
    end;
    insert into results values (5, 'B cannot add a task to A''s client (new check)', case when blocked then 'PASS' else 'FAIL' end);

    blocked := false;
    begin
        insert into public.notes (client_id, content, user_id) values (client_a, 'sneaky note', user_b);
    exception when insufficient_privilege then blocked := true;
    end;
    insert into results values (6, 'B cannot add a note to A''s client (new check)', case when blocked then 'PASS' else 'FAIL' end);

    blocked := false;
    begin
        insert into public.clients (name, email, user_id) values ('Fake', 'x@example.com', user_a);
    exception when insufficient_privilege then blocked := true;
    end;
    insert into results values (7, 'B cannot create a client owned by A', case when blocked then 'PASS' else 'FAIL' end);

    insert into public.clients (name, email, user_id) values ('B Client', 'same@example.com', user_b) returning id into client_b;
    insert into results values (8, 'B can use the same client email as A', 'PASS');

    insert into public.tasks (client_id, title, user_id) values (client_b, 'B task', user_b) returning id into task_b;
    blocked := false;
    begin
        update public.tasks set client_id = client_a where id = task_b;
    exception when insufficient_privilege then blocked := true;
    end;
    insert into results values (9, 'B cannot move their task onto A''s client (new check)', case when blocked then 'PASS' else 'FAIL' end);

    -- ---- logged-out visitor ----
    perform set_config('role', 'postgres', true);
    perform set_config('request.jwt.claims', '', true);
    perform set_config('role', 'anon', true);
    select count(*) into seen from public.clients;
    insert into results values (10, 'Logged-out visitor sees no clients', case when seen = 0 then 'PASS' else 'FAIL' end);

    -- ---- back to admin: NOT NULL + cleanup ----
    perform set_config('role', 'postgres', true);
    blocked := false;
    begin
        insert into public.clients (name, email) values ('No owner', 'none@example.com');
    exception when not_null_violation then blocked := true;
    end;
    insert into results values (11, 'A client without user_id is rejected', case when blocked then 'PASS' else 'FAIL' end);

    delete from auth.users where id in (user_a, user_b);
    select count(*) into seen from public.clients where user_id in (user_a, user_b);
    insert into results values (12, 'Cleanup: test users and their data removed', case when seen = 0 then 'PASS' else 'FAIL' end);
end $$;

select n, outcome, test from results order by n;
