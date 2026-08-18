create type public.app_role as enum ('kid', 'parent');
create type public.parent_chat_role as enum ('parent', 'jey');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'kid',
  display_name text not null default 'Jey friend',
  created_at timestamptz not null default now()
);

create table public.parent_invites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  child_name text not null,
  accepted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days'
);

create table public.family_links (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (child_id, parent_id)
);

create table public.parent_shared_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users (id) on delete cascade,
  privacy text not null check (privacy in ('mood', 'parent')),
  mood text not null,
  summary text not null,
  child_text text,
  created_at timestamptz not null default now()
);

create table public.parent_chat_messages (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid not null references auth.users (id) on delete cascade,
  role public.parent_chat_role not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.parent_invites enable row level security;
alter table public.family_links enable row level security;
alter table public.parent_shared_events enable row level security;
alter table public.parent_chat_messages enable row level security;

create policy "profiles read self"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles update self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles insert self"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "child manages own invites"
  on public.parent_invites for all
  using (auth.uid() = child_id)
  with check (auth.uid() = child_id);

create policy "signed in parent can read active invite"
  on public.parent_invites for select
  using (auth.uid() is not null and accepted_by is null and expires_at > now());

create policy "parent can read accepted invite"
  on public.parent_invites for select
  using (auth.uid() = accepted_by);

create policy "signed in parent accepts invite"
  on public.parent_invites for update
  using (auth.uid() is not null and accepted_by is null and expires_at > now())
  with check (accepted_by = auth.uid());

create policy "family reads own links"
  on public.family_links for select
  using (auth.uid() = child_id or auth.uid() = parent_id);

create policy "parent creates accepted link"
  on public.family_links for insert
  with check (
    auth.uid() = parent_id and exists (
      select 1
      from public.parent_invites invite
      where invite.child_id = family_links.child_id
        and invite.accepted_by = auth.uid()
    )
  );

create policy "child inserts shared events"
  on public.parent_shared_events for insert
  with check (auth.uid() = child_id and privacy in ('mood', 'parent'));

create policy "family reads shared events"
  on public.parent_shared_events for select
  using (
    auth.uid() = child_id or exists (
      select 1
      from public.family_links link
      where link.child_id = parent_shared_events.child_id
        and link.parent_id = auth.uid()
    )
  );

create policy "parent reads own chat"
  on public.parent_chat_messages for select
  using (
    auth.uid() = parent_id and exists (
      select 1
      from public.family_links link
      where link.child_id = parent_chat_messages.child_id
        and link.parent_id = auth.uid()
    )
  );

create policy "parent inserts own chat"
  on public.parent_chat_messages for insert
  with check (
    auth.uid() = parent_id and exists (
      select 1
      from public.family_links link
      where link.child_id = parent_chat_messages.child_id
        and link.parent_id = auth.uid()
    )
  );

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'kid'),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'Jey friend')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();
