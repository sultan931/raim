do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'parent_shared_events'
  ) then
    alter publication supabase_realtime add table public.parent_shared_events;
  end if;
end $$;
