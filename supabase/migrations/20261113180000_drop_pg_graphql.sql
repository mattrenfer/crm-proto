-- The Security Advisor warns that clients, notes and tasks "can be seen in the GraphQL schema",
-- by both signed-out (anon) and signed-in users.
--
-- Supabase turns on pg_graphql, a GraphQL API that sits next to the REST API, on every project.
-- Anyone with the public anon key can ask it to describe the tables: their names and columns.
-- Rows stay protected, because RLS applies to GraphQL queries the same as REST ones.
--
-- Handful never uses GraphQL. The app talks to the database only through the REST API
-- (supabase-js .from()). So the fix is to switch the unused API off: one way in, not two.
-- If GraphQL is ever needed, `create extension pg_graphql;` turns it back on.

drop extension if exists pg_graphql;
