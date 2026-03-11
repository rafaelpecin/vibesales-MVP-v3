-- Grant table-level permissions to Supabase roles.
-- RLS policies control row-level access, but Postgres also requires
-- role-level GRANTs before RLS even runs.

-- anon: read-only access to plans (public pricing page, unauthenticated users)
GRANT SELECT ON public.plans TO anon;

-- authenticated: full access to all app tables (RLS policies restrict rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.url_scans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_tokens TO authenticated;
GRANT SELECT ON public.plans TO authenticated;

-- service_role already has full access by default; no grants needed.
