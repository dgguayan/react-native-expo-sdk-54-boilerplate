create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

comment on table public.app_settings is
  'Public, non-secret application configuration. Row-level policies restrict writes to administrators.';

alter table public.app_settings enable row level security;

insert into public.app_settings (key, value)
values ('theme', '{"preset":"default","version":1}'::jsonb)
on conflict (key) do nothing;

drop policy if exists "Theme setting is publicly readable" on public.app_settings;
create policy "Theme setting is publicly readable"
on public.app_settings
for select
to anon, authenticated
using (key = 'theme');

-- Write policies are installed by the RBAC migration after the normalized
-- roles catalog and database authorization helpers exist. Until then, RLS
-- intentionally makes this setting read-only.

create or replace function public.set_app_setting_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists set_app_setting_audit_fields on public.app_settings;
create trigger set_app_setting_audit_fields
before insert or update on public.app_settings
for each row execute function public.set_app_setting_audit_fields();

do $$
begin
  alter publication supabase_realtime add table public.app_settings;
exception
  when duplicate_object then null;
end;
$$;
