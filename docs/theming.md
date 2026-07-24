# Theme architecture

The application uses one cross-platform theme engine for React Native, React
Native Web, React Navigation, and browser CSS. A theme is data: adding a preset
does not require editing screen or component implementations.

## Runtime flow

```text
Supabase app_settings.theme
          |
          v
AsyncStorage cache --> AppThemeProvider --> semantic colors + design tokens
                                               |          |          |
                                               v          v          v
                                        React Native   Navigation   Web CSS vars
                                         components      theme
```

`AppThemeProvider` restores and validates the cached application preset and the
device's display-mode preference before application content is revealed. The
native splash screen remains visible during that first restore. Invalid cache
or display-mode values are removed and Default is used. The provider then
reconciles with Supabase and subscribes to the `app_settings` row, so an
administrator's saved change propagates to running clients without a restart.

Two settings are intentionally separate:

- **Application preset** is shared globally and stored in Supabase.
- **Display mode** is `system`, `light`, or `dark`, belongs to the current
  device, and is stored in AsyncStorage.

The resolved palette is the combination of those values. In `system` mode it
tracks the operating-system color-scheme setting automatically.

## Source map

- `constants/theme.ts` defines the strongly typed token contracts and default
  foundation.
- `constants/theme-presets.ts` is the preset registry and contains all light
  and dark palette data.
- `providers/ThemeProvider.tsx` owns initialization, mode resolution,
  React Navigation theming, web CSS variables, and the public theme API.
- `lib/theme-settings.ts` owns cache, database, and realtime synchronization.
- `components/settings/ThemeSettings.tsx` is the responsive administrator UI.
- `supabase/migrations/202607250001_create_app_settings.sql` creates the
  database row, audit trigger, public read policy, and realtime registration.
- `supabase/migrations/202607250002_harden_app_settings_api.sql` applies
  explicit API grants, restores the default row when missing, and refreshes the
  PostgREST schema cache.
- `supabase/migrations/202607250003_create_rbac.sql` creates roles,
  permissions, assignments, and the Admin-only theme write policies.

## Semantic color contract

Components consume roles, never preset color values. The contract includes:

- Foundations: `background`, `surface`, `surfaceElevated`, `surfaceMuted`,
  `foreground`, muted text, borders, input, overlay, skeleton, and shadow.
- Brand and actions: `primary`, `secondary`, `accent`, `brand`, buttons,
  links, focus ring, and contrasting foreground roles.
- Feedback: `success`, `warning`, `danger` (the error role), and `info`, each
  with an appropriate soft surface.
- Regions: independent `sidebar` and `navbar` foreground, active, muted, and
  border roles.
- Specialized roles: form-control thumb, selection, and authentication hero
  decoration/copy.

Shape, spacing, border thickness, shadow geometry, and typography families are
part of `AppThemeTokens`. Responsive metrics read the active spacing scale, so
changing it in a future preset also updates layout density.

On the web, every semantic color is emitted as a kebab-cased CSS custom
property. For example, `sidebarActiveForeground` becomes
`--color-sidebar-active-foreground`. Spacing and radius values are emitted as
`--space-*` and `--radius-*`. Native components receive the same values through
`useAppTheme()`.

## Adding a preset

1. Add an entry to `themePresets` in `constants/theme-presets.ts`.
2. Give it a stable lowercase ID, label, description, and three preview
   swatches.
3. Provide accessible light and dark palettes with `createPalette`. It derives
   common region and action roles; override any role that needs brand-specific
   treatment.
4. Reuse `defaultThemeTokens` and override only the desired spacing, radii,
   borders, shadows, or typography.
5. Run `npm run check` and `npm run build:web`, then verify both modes on native
   devices and web.

The preset automatically appears in Theme Settings because the UI renders the
registry. No component switch statement is needed.

## Database setup and authorization

Apply the included migration to the target Supabase project before enabling
administrator changes. The `theme` row is publicly readable because it contains
non-secret presentation data. Inserts and updates require a normalized Admin
assignment in `user_roles`, checked by the database
`current_user_has_role('admin')` helper.

Role state is loaded once through the authorization RPC after login. The UI
disables theme controls for non-admins, while Row Level Security rejects direct
unauthorized REST writes. Role claims are not sourced from JWT metadata. See
[the RBAC guide](rbac.md) for schema, bootstrap, and permission extension
details.

If the database is temporarily unavailable, the application keeps the last
valid cached preset and reports a typed sync status in Theme Settings. Network
failures use capped exponential backoff, retry immediately when the browser
comes online or the native app becomes active, and can be retried manually.
Missing-table and policy failures do not poll continuously because connectivity
cannot repair them. Development builds log the safe PostgREST code, schema,
table, and message; production builds do not log backend details.

Unknown preset IDs and corrupted cache values are rejected and fall back safely
to `default`. A missing database row also resolves to Default and can be created
by an administrator from Theme Settings.

### Diagnosing `PGRST205`

`PGRST205` means PostgREST cannot find `public.app_settings` in its schema
cache. It occurs before RLS is evaluated, so changing a client policy cannot
repair it. Confirm that the app targets the intended Supabase project, then
apply all migrations:

```bash
supabase db push
```

If the deployment pipeline applies SQL directly, execute the migration files in
timestamp order. The second migration sends `NOTIFY pgrst, 'reload schema'`.
After deployment, use **Retry sync** in Settings or restart the app. A healthy
anonymous request to
`/rest/v1/app_settings?select=key,value&key=eq.theme` returns the seeded theme
row; a `401`/`403` or empty result then indicates grants or RLS should be
inspected.

### Cross-platform interaction details

React Native Web deprecates `pointerEvents` as a component prop, so pass-through
layers use `style.pointerEvents`. Core `Animated` transitions use the native
driver on Android and iOS and the JavaScript driver on web, where a native
animated module does not exist. This preserves native performance without web
runtime warnings.

## Component rules

- Read colors and tokens from `useAppTheme()`.
- Select the closest semantic role; do not import a palette or use a literal
  color in a component.
- Use shared primitives (`Button`, `Input`, `Card`, `Badge`, `IconButton`,
  `SegmentedControl`, and the feedback components) before introducing a new
  presentation pattern.
- New status visuals must work in both palettes and expose accessible labels,
  states, focus treatments, and touch targets.
- Asset colors in `app.json` are build-time icon and splash configuration, not
  runtime UI colors.

## Future extensions

The persisted value is versioned JSON rather than a bare string. It can evolve
to include a tenant key, brand ID, custom token overrides, font manifests, icon
packs, or imported theme metadata. Keep the provider's output contract stable:
components should continue receiving resolved semantic tokens, regardless of
whether the source is a built-in preset, a tenant record, or a marketplace
package.

For per-tenant and per-user theming, resolve settings in this order:

```text
built-in defaults < application preset < tenant overrides < user preference
```

Validate imported overrides against the token schema, calculate contrast before
publishing, cache only the resolved public theme, and load custom font/assets
before hiding the splash screen.
