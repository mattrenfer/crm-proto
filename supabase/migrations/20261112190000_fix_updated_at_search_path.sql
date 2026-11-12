-- The Security Advisor flags update_updated_at_column() for a "mutable search_path".
--
-- A function without a fixed search_path looks names up in whatever schemas the caller's session
-- lists. Someone who could create a schema or object earlier in that list could swap in their own
-- version of a name the function uses. Pinning it to '' (empty) means every name must be fully
-- qualified, so nothing can be swapped.
--
-- The body only calls now(), which lives in pg_catalog. Postgres always searches pg_catalog, even
-- with an empty search_path, so the body doesn't need to change.

alter function public.update_updated_at_column() set search_path = '';
