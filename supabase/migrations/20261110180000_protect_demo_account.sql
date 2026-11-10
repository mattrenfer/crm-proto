-- The demo account is shared, and every visitor gets a real session. A session is enough to change
-- a password, so one visitor could lock everyone else out of the demo.
--
-- This refuses password and email changes on that account when they come through Supabase Auth
-- (the supabase_auth_admin role). Signing in doesn't touch those columns, so it still works,
-- and the owner can still make changes from the SQL editor, which runs as a different role.

create function public.protect_demo_account()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if old.email = 'demo@matthewrenfer.com'
        and current_user = 'supabase_auth_admin'
        and (
            new.encrypted_password is distinct from old.encrypted_password
            or new.email is distinct from old.email
        )
    then
        raise exception 'The demo account cannot be changed';
    end if;

    return new;
end;
$$;

create trigger protect_demo_account
    before update on auth.users
    for each row
    execute function public.protect_demo_account();
