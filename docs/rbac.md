# Role-based access control

The application uses normalized database roles instead of trusting editable
client metadata or duplicating role rules in screens.

## Data model

```text
auth.users
    |
    +---< user_roles >--- roles
                              |
                              +---< role_permissions >--- permissions
```

- `roles` contains stable role slugs. The migration seeds `admin`, `manager`,
  `staff`, and the default `user` role.
- `user_roles` supports multiple roles per Auth user. Its composite primary key
  prevents duplicates; foreign keys prevent orphaned assignments.
- `permissions` contains namespaced capabilities such as `settings.manage`.
- `role_permissions` makes permission grants data-driven. Admin receives every
  seeded permission, while the other initial roles intentionally start with no
  elevated grants.

System role and permission identities are protected by triggers. The default
role cannot be changed through the client API, the last role cannot be removed
from a user, and the final Admin assignment cannot be revoked. New Auth users
receive `user` from an `auth.users` trigger in the same transaction.

## Runtime authorization

After Supabase restores or creates a session, `AuthProvider` calls
`initialize_my_authorization()` once and validates the returned role and
permission arrays. Authenticated routes remain on the loading boundary until
that request completes. Token-refresh events reuse the loaded snapshot instead
of querying again.

Consumers use:

```tsx
const {
  authorization,
  authorizationError,
  can,
  hasRole,
  isAdmin,
  primaryRole,
  refreshAuthorization,
} = useAuth();
```

For presentation boundaries, use `RequireRole` or `RequirePermission`. These
components improve navigation and screen UX; they are not the security
boundary. RLS and database functions remain authoritative for every write.

The database exposes:

- `current_user_has_role(role_slug)` for role-based RLS.
- `authorize(permission_slug)` for future permission-based RLS.
- `get_my_authorization()` for refreshes.
- `initialize_my_authorization()` for the first request after login.

All helpers are `SECURITY DEFINER` functions with an empty `search_path` and
explicit execute grants. Clients cannot choose a user ID when checking access.

## Admin bootstrap

A migration cannot identify a browser or native app's "currently authenticated
user" because migrations execute without an end-user JWT. The bootstrap is
therefore deterministic and contains no hardcoded ID or email:

1. If exactly one Auth user exists when the migration runs, that user receives
   Admin automatically.
2. If the database has no users yet, the first and only user is promoted by
   `initialize_my_authorization()` on their first authenticated app load.
3. If multiple users already exist and no Admin exists, the migration refuses
   to guess. Supply the intended current account's UUID from trusted deployment
   configuration to the service-role-only
   `bootstrap_admin_by_user_id(target_user_id)` function.

For case 3, invoke the function from a trusted backend or one-off deployment
job using a server-only `SUPABASE_SERVICE_ROLE_KEY` and a
`BOOTSTRAP_ADMIN_USER_ID` secret. Never put either value in an
`EXPO_PUBLIC_*` variable or the client bundle. The UUID is configuration at
deployment time, not embedded in source or migration history.

Example server-side call:

```ts
await serviceRoleSupabase.rpc("bootstrap_admin_by_user_id", {
  target_user_id: process.env.BOOTSTRAP_ADMIN_USER_ID,
});
```

Remove the bootstrap secret after the assignment. The function is not
executable by `anon` or `authenticated`.

## Theme security

The `app_settings.theme` row remains readable by everyone so the theme can load
before authentication. Inserts and updates require
`current_user_has_role('admin')` in RLS. Theme Settings also disables controls
for non-admin users, but a handcrafted REST request still fails at the
database policy.

The frontend does not read roles from `user_metadata`, `app_metadata`, or local
storage. Display labels, `isAdmin`, and theme management all use the validated
database snapshot.

## Adding roles and permissions

Create custom roles and grants as data; no component rewrite is needed. Use
lowercase role slugs (`finance_manager`) and namespaced permission slugs
(`billing.refund`). Add constants to `constants/authorization.ts` only when
application code needs a strongly typed reference.

Database policies should call `authorize('domain.action')`. Grant
`roles.manage` sparingly: it permits managing custom role data. Only Admin may
assign the Admin role or change system role/permission grants, preventing a
delegated role manager from escalating privileges.

After an administrator changes a signed-in user's assignments, call
`refreshAuthorization()` or refresh that user's session-level application
state. A future role-management screen can invoke this automatically.

## Deployment

Apply migrations in timestamp order:

```bash
supabase db push
```

The RBAC migration seeds the role and permission catalogs idempotently, backfills
existing users with the default User role, installs triggers and indexes, and
replaces the legacy theme write policies. It also asks PostgREST to reload its
schema cache.

Validate with one Admin and one non-admin account:

- both can read `app_settings.theme`;
- Admin can update the theme;
- non-admin update/upsert receives an RLS authorization error;
- new users receive `user`;
- duplicate role assignments fail on the composite key;
- removal of a user's final role and the final Admin assignment fails.
