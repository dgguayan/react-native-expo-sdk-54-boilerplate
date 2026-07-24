grant usage on schema public to anon, authenticated;
grant select on table public.app_settings to anon, authenticated;
grant insert, update on table public.app_settings to authenticated;

revoke insert, update, delete, truncate, references, trigger
on table public.app_settings
from anon;

revoke delete, truncate, references, trigger
on table public.app_settings
from authenticated;

insert into public.app_settings (key, value)
values ('theme', '{"preset":"default","version":1}'::jsonb)
on conflict (key) do nothing;

-- Ask PostgREST to refresh immediately after the relation and grants change.
notify pgrst, 'reload schema';
