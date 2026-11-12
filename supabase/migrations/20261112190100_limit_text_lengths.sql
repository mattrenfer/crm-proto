-- Length limits on the two free-text columns that had none, so one account can't fill the database.
--
-- The other text columns are already varchar(n), which has a built-in limit:
-- clients.name/email/company 255, clients.phone 50, tasks.title 255.
--
-- char_length counts characters, not bytes, so accented letters and emoji count as one each.
-- The forms check the same limits first (src/lib/schemas.ts), so people see a friendly message
-- and these constraints are the backstop for anything that skips the form.

alter table public.notes
    add constraint notes_content_length check (char_length(content) <= 5000);

alter table public.tasks
    add constraint tasks_description_length check (char_length(description) <= 2000);
