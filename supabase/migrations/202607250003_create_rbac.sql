create table public.roles (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  priority smallint not null default 0,
  is_system boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_slug_unique unique (slug),
  constraint roles_name_unique unique (name),
  constraint roles_slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

create unique index roles_single_default_idx
on public.roles ((is_default))
where is_default;

create table public.permissions (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_slug_unique unique (slug),
  constraint permissions_name_unique unique (name),
  constraint permissions_slug_format
    check (slug ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  primary key (user_id, role_id)
);

create index user_roles_role_id_idx
on public.user_roles (role_id);

create table public.role_permissions (
  role_id bigint not null references public.roles(id) on delete cascade,
  permission_id bigint not null references public.permissions(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index role_permissions_permission_id_idx
on public.role_permissions (permission_id);

comment on table public.roles is
  'Extensible application role catalog. Role behavior is data-driven through role_permissions.';
comment on table public.permissions is
  'Granular application permission catalog using stable namespaced slugs.';
comment on table public.user_roles is
  'Many-to-many assignments between Supabase Auth users and application roles.';
comment on table public.role_permissions is
  'Many-to-many grants between application roles and permissions.';

insert into public.roles (
  slug,
  name,
  description,
  priority,
  is_system,
  is_default
)
values
  ('admin', 'Admin', 'Full application administration.', 100, true, false),
  ('manager', 'Manager', 'Team and operational management.', 70, true, false),
  ('staff', 'Staff', 'Internal staff access.', 40, true, false),
  ('user', 'User', 'Standard authenticated access.', 10, true, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  priority = excluded.priority,
  is_system = true,
  is_default = excluded.is_default,
  updated_at = now();

insert into public.permissions (slug, name, description, is_system)
values
  ('users.manage', 'Manage users', 'Create, update, suspend, and organize users.', true),
  ('roles.manage', 'Manage roles', 'Create roles and manage role assignments.', true),
  ('settings.manage', 'Manage settings', 'Change application-wide settings.', true),
  ('inventory.manage', 'Manage inventory', 'Maintain inventory and stock operations.', true),
  ('sales.manage', 'Manage sales', 'Maintain sales workflows and records.', true),
  ('reports.manage', 'Manage reports', 'Create and manage operational reports.', true),
  ('products.manage', 'Manage products', 'Maintain the product catalog.', true),
  ('analytics.view', 'View analytics', 'View application analytics.', true),
  ('data.export', 'Export data', 'Export authorized application data.', true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  is_system = true,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select role_row.id, permission_row.id
from public.roles as role_row
cross join public.permissions as permission_row
where role_row.slug = 'admin'
on conflict (role_id, permission_id) do nothing;

insert into public.user_roles (user_id, role_id)
select auth_user.id, default_role.id
from auth.users as auth_user
cross join public.roles as default_role
where default_role.is_default
on conflict (user_id, role_id) do nothing;

-- A migration has no end-user JWT, so "currently authenticated" cannot be
-- resolved inside SQL. When exactly one existing Auth user is present, that
-- account is unambiguous and can be promoted safely without an ID or email.
do $$
declare
  existing_user_count bigint;
begin
  select count(*) into existing_user_count from auth.users;

  if existing_user_count = 1 then
    insert into public.user_roles (user_id, role_id)
    select auth_user.id, admin_role.id
    from auth.users as auth_user
    cross join public.roles as admin_role
    where admin_role.slug = 'admin'
    on conflict (user_id, role_id) do nothing;
  else
    raise notice
      'RBAC bootstrap did not auto-promote an account because % Auth users exist.',
      existing_user_count;
  end if;
end;
$$;

create or replace function public.assign_default_role_to_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role_id)
  select new.id, role_row.id
  from public.roles as role_row
  where role_row.is_default
  on conflict (user_id, role_id) do nothing;

  return new;
end;
$$;

revoke all on function public.assign_default_role_to_new_user() from public;

drop trigger if exists assign_default_role_after_signup on auth.users;
create trigger assign_default_role_after_signup
after insert on auth.users
for each row execute function public.assign_default_role_to_new_user();

create or replace function public.current_user_has_role(requested_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as assignment
    join public.roles as role_row on role_row.id = assignment.role_id
    where assignment.user_id = (select auth.uid())
      and role_row.slug = lower(requested_role)
  );
$$;

create or replace function public.authorize(requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as assignment
    join public.role_permissions as role_grant
      on role_grant.role_id = assignment.role_id
    join public.permissions as permission_row
      on permission_row.id = role_grant.permission_id
    where assignment.user_id = (select auth.uid())
      and permission_row.slug = lower(requested_permission)
  );
$$;

create or replace function public.get_my_authorization()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'roles',
    coalesce(
      (
        select jsonb_agg(role_list.slug order by role_list.priority desc, role_list.slug)
        from (
          select distinct role_row.slug, role_row.priority
          from public.user_roles as assignment
          join public.roles as role_row on role_row.id = assignment.role_id
          where assignment.user_id = (select auth.uid())
        ) as role_list
      ),
      '[]'::jsonb
    ),
    'permissions',
    coalesce(
      (
        select jsonb_agg(permission_list.slug order by permission_list.slug)
        from (
          select distinct permission_row.slug
          from public.user_roles as assignment
          join public.role_permissions as role_grant
            on role_grant.role_id = assignment.role_id
          join public.permissions as permission_row
            on permission_row.id = role_grant.permission_id
          where assignment.user_id = (select auth.uid())
        ) as permission_list
      ),
      '[]'::jsonb
    )
  );
$$;

create or replace function public.bootstrap_current_user_as_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  auth_user_count bigint;
begin
  if caller_id is null then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('public.rbac.bootstrap_admin', 0)
  );

  if exists (
    select 1
    from public.user_roles as assignment
    join public.roles as role_row on role_row.id = assignment.role_id
    where role_row.slug = 'admin'
  ) then
    return public.current_user_has_role('admin');
  end if;

  select count(*) into auth_user_count from auth.users;
  if auth_user_count <> 1 then
    return false;
  end if;

  if not exists (select 1 from auth.users where id = caller_id) then
    return false;
  end if;

  insert into public.user_roles (user_id, role_id, assigned_by)
  select caller_id, role_row.id, caller_id
  from public.roles as role_row
  where role_row.slug = 'admin'
  on conflict (user_id, role_id) do nothing;

  return true;
end;
$$;

create or replace function public.initialize_my_authorization()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.bootstrap_current_user_as_admin();
  return public.get_my_authorization();
end;
$$;

-- Trusted deployments can use this service-role-only function when a project
-- already contains multiple users and therefore has no unambiguous account to
-- promote automatically. The user ID is supplied at deployment time, never
-- embedded in the migration or client bundle.
create or replace function public.bootstrap_admin_by_user_id(target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'The requested Auth user does not exist.';
  end if;

  insert into public.user_roles (user_id, role_id)
  select target_user_id, role_row.id
  from public.roles as role_row
  where role_row.is_default or role_row.slug = 'admin'
  on conflict (user_id, role_id) do nothing;

  return true;
end;
$$;

revoke all on function public.current_user_has_role(text) from public;
revoke all on function public.authorize(text) from public;
revoke all on function public.get_my_authorization() from public;
revoke all on function public.bootstrap_current_user_as_admin() from public;
revoke all on function public.initialize_my_authorization() from public;
revoke all on function public.bootstrap_admin_by_user_id(uuid) from public;

grant execute on function public.current_user_has_role(text) to authenticated;
grant execute on function public.authorize(text) to authenticated;
grant execute on function public.get_my_authorization() to authenticated;
grant execute on function public.initialize_my_authorization() to authenticated;
grant execute on function public.bootstrap_admin_by_user_id(uuid) to service_role;

create or replace function public.protect_system_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and old.is_system then
    raise exception 'System roles cannot be deleted.';
  end if;

  if tg_op = 'UPDATE'
    and (
      new.is_system is distinct from old.is_system
      or new.is_default is distinct from old.is_default
      or (old.is_system and new.slug is distinct from old.slug)
    )
  then
    raise exception 'Role system/default flags and system role slugs cannot be changed.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.protect_system_permission()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and old.is_system then
    raise exception 'System permissions cannot be deleted.';
  end if;

  if tg_op = 'UPDATE'
    and (
      new.is_system is distinct from old.is_system
      or (old.is_system and new.slug is distinct from old.slug)
    )
  then
    raise exception 'Permission system flags and system permission slugs cannot be changed.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.set_user_role_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.assigned_at := now();

  if auth.uid() is not null then
    new.assigned_by := auth.uid();
  end if;

  return new;
end;
$$;

create or replace function public.set_rbac_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.prevent_invalid_user_role_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed_role_slug text;
begin
  -- Cascading deletion from auth.users must be allowed to clean up assignments.
  if not exists (select 1 from auth.users where id = old.user_id) then
    return old;
  end if;

  if not exists (
    select 1
    from public.user_roles as other_assignment
    where other_assignment.user_id = old.user_id
      and other_assignment.role_id <> old.role_id
  ) then
    raise exception 'Every authenticated user must retain at least one role.';
  end if;

  select role_row.slug
  into removed_role_slug
  from public.roles as role_row
  where role_row.id = old.role_id;

  if removed_role_slug = 'admin'
    and not exists (
      select 1
      from public.user_roles as other_assignment
      join public.roles as role_row on role_row.id = other_assignment.role_id
      where role_row.slug = 'admin'
        and other_assignment.user_id <> old.user_id
    )
  then
    raise exception 'The final Admin role assignment cannot be removed.';
  end if;

  return old;
end;
$$;

create or replace function public.protect_admin_system_permissions()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.roles as role_row
    join public.permissions as permission_row
      on permission_row.id = old.permission_id
    where role_row.id = old.role_id
      and role_row.slug = 'admin'
      and permission_row.is_system
  ) then
    raise exception 'System permissions cannot be revoked from the Admin role.';
  end if;

  return old;
end;
$$;

revoke all on function public.protect_system_role() from public;
revoke all on function public.protect_system_permission() from public;
revoke all on function public.set_user_role_audit_fields() from public;
revoke all on function public.set_rbac_updated_at() from public;
revoke all on function public.prevent_invalid_user_role_removal() from public;
revoke all on function public.protect_admin_system_permissions() from public;

drop trigger if exists protect_system_role_changes on public.roles;
create trigger protect_system_role_changes
before update or delete on public.roles
for each row execute function public.protect_system_role();

drop trigger if exists protect_system_permission_changes on public.permissions;
create trigger protect_system_permission_changes
before update or delete on public.permissions
for each row execute function public.protect_system_permission();

drop trigger if exists set_roles_updated_at on public.roles;
create trigger set_roles_updated_at
before update on public.roles
for each row execute function public.set_rbac_updated_at();

drop trigger if exists set_permissions_updated_at on public.permissions;
create trigger set_permissions_updated_at
before update on public.permissions
for each row execute function public.set_rbac_updated_at();

drop trigger if exists prevent_invalid_user_role_delete on public.user_roles;
create trigger prevent_invalid_user_role_delete
before delete on public.user_roles
for each row execute function public.prevent_invalid_user_role_removal();

drop trigger if exists set_user_role_audit_fields_before_insert on public.user_roles;
create trigger set_user_role_audit_fields_before_insert
before insert on public.user_roles
for each row execute function public.set_user_role_audit_fields();

drop trigger if exists protect_admin_system_permission_grants
on public.role_permissions;
create trigger protect_admin_system_permission_grants
before delete on public.role_permissions
for each row execute function public.protect_admin_system_permissions();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;

revoke all on table public.roles from public, anon, authenticated;
revoke all on table public.permissions from public, anon, authenticated;
revoke all on table public.user_roles from public, anon, authenticated;
revoke all on table public.role_permissions from public, anon, authenticated;
revoke all on sequence public.roles_id_seq from public, anon, authenticated;
revoke all on sequence public.permissions_id_seq from public, anon, authenticated;

grant select, insert, update, delete on public.roles to authenticated;
grant select, insert, update, delete on public.permissions to authenticated;
grant select, insert, delete on public.user_roles to authenticated;
grant select, insert, delete on public.role_permissions to authenticated;
grant usage, select on sequence public.roles_id_seq to authenticated;
grant usage, select on sequence public.permissions_id_seq to authenticated;

drop policy if exists "Authenticated users can read roles" on public.roles;
create policy "Authenticated users can read roles"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "Role managers can insert roles" on public.roles;
create policy "Role managers can insert roles"
on public.roles
for insert
to authenticated
with check (
  (select public.authorize('roles.manage'))
  and not is_system
  and not is_default
);

drop policy if exists "Role managers can update roles" on public.roles;
create policy "Role managers can update roles"
on public.roles
for update
to authenticated
using (
  (select public.authorize('roles.manage'))
  and (
    not is_system
    or (select public.current_user_has_role('admin'))
  )
)
with check (
  (select public.authorize('roles.manage'))
  and (
    not is_system
    or (select public.current_user_has_role('admin'))
  )
);

drop policy if exists "Role managers can delete roles" on public.roles;
create policy "Role managers can delete roles"
on public.roles
for delete
to authenticated
using ((select public.authorize('roles.manage')) and not is_system);

drop policy if exists "Authenticated users can read permissions" on public.permissions;
create policy "Authenticated users can read permissions"
on public.permissions
for select
to authenticated
using (true);

drop policy if exists "Role managers can insert permissions" on public.permissions;
create policy "Role managers can insert permissions"
on public.permissions
for insert
to authenticated
with check (
  (select public.authorize('roles.manage'))
  and not is_system
);

drop policy if exists "Role managers can update permissions" on public.permissions;
create policy "Role managers can update permissions"
on public.permissions
for update
to authenticated
using (
  (select public.authorize('roles.manage'))
  and (
    not is_system
    or (select public.current_user_has_role('admin'))
  )
)
with check (
  (select public.authorize('roles.manage'))
  and (
    not is_system
    or (select public.current_user_has_role('admin'))
  )
);

drop policy if exists "Role managers can delete permissions" on public.permissions;
create policy "Role managers can delete permissions"
on public.permissions
for delete
to authenticated
using ((select public.authorize('roles.manage')) and not is_system);

drop policy if exists "Users can read their role assignments" on public.user_roles;
create policy "Users can read their role assignments"
on public.user_roles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.authorize('roles.manage'))
);

drop policy if exists "Role managers can assign roles" on public.user_roles;
create policy "Role managers can assign roles"
on public.user_roles
for insert
to authenticated
with check (
  (select public.authorize('roles.manage'))
  and assigned_by = (select auth.uid())
  and (
    not exists (
      select 1
      from public.roles as role_row
      where role_row.id = role_id
        and role_row.slug = 'admin'
    )
    or (select public.current_user_has_role('admin'))
  )
);

drop policy if exists "Role managers can revoke roles" on public.user_roles;
create policy "Role managers can revoke roles"
on public.user_roles
for delete
to authenticated
using (
  (select public.authorize('roles.manage'))
  and (
    not exists (
      select 1
      from public.roles as role_row
      where role_row.id = role_id
        and role_row.slug = 'admin'
    )
    or (select public.current_user_has_role('admin'))
  )
);

drop policy if exists "Authenticated users can read role permissions" on public.role_permissions;
create policy "Authenticated users can read role permissions"
on public.role_permissions
for select
to authenticated
using (true);

drop policy if exists "Role managers can grant permissions" on public.role_permissions;
create policy "Role managers can grant permissions"
on public.role_permissions
for insert
to authenticated
with check (
  (select public.authorize('roles.manage'))
  and (
    not exists (
      select 1
      from public.roles as role_row
      where role_row.id = role_id
        and role_row.is_system
    )
    and not exists (
      select 1
      from public.permissions as permission_row
      where permission_row.id = permission_id
        and permission_row.is_system
    )
    or (select public.current_user_has_role('admin'))
  )
);

drop policy if exists "Role managers can revoke permissions" on public.role_permissions;
create policy "Role managers can revoke permissions"
on public.role_permissions
for delete
to authenticated
using (
  (select public.authorize('roles.manage'))
  and (
    not exists (
      select 1
      from public.roles as role_row
      where role_row.id = role_id
        and role_row.is_system
    )
    and not exists (
      select 1
      from public.permissions as permission_row
      where permission_row.id = permission_id
        and permission_row.is_system
    )
    or (select public.current_user_has_role('admin'))
  )
);

drop policy if exists "Administrators can insert application settings"
on public.app_settings;
drop policy if exists "Administrators can update application settings"
on public.app_settings;

revoke all on table public.app_settings from public, anon, authenticated;
grant select on table public.app_settings to anon, authenticated;
grant insert, update on table public.app_settings to authenticated;

create policy "Admins can insert application settings"
on public.app_settings
for insert
to authenticated
with check (
  key = 'theme'
  and (select public.current_user_has_role('admin'))
);

create policy "Admins can update application settings"
on public.app_settings
for update
to authenticated
using (
  key = 'theme'
  and (select public.current_user_has_role('admin'))
)
with check (
  key = 'theme'
  and (select public.current_user_has_role('admin'))
);

notify pgrst, 'reload schema';
