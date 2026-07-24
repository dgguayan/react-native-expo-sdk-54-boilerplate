# Expo SDK 54 Workspace

A production-oriented Expo application shell for Android, iOS, and the web. The interface takes its layout cues from the Laravel 12 React starter kit while keeping native navigation, gestures, safe areas, and platform behavior intact.

## Stack

- Expo SDK 54, React 19, and React Native 0.81
- Expo Router 6 with typed file-based routes
- React Navigation Drawer 7 for one cross-platform navigation hierarchy
- NativeWind 4 and Tailwind CSS 3 configuration
- React Native Reanimated, Worklets, and Gesture Handler
- Supabase email/password authentication
- AsyncStorage for session and device preference persistence
- Strict TypeScript and Expo ESLint

## Application experience

The authenticated shell adapts at runtime without duplicating route definitions:

| Width | Navigation behavior |
| --- | --- |
| Desktop (1180px and wider) | Permanent sidebar with persisted expanded and icon-only modes |
| Tablet (768px to 1179px) | Overlay drawer opened from the header |
| Mobile (380px to 767px) | Hidden, swipe-enabled native drawer with compact page and card spacing |
| Compact phone/foldable (below 380px) | Reduced chrome, reflowing controls, and a viewport-safe drawer |

The fixed drawer footer contains one personal Account trigger instead of permanent utility links. It opens an anchored, keyboard-accessible popover on the web and a safe-area-aware bottom sheet on Android and iOS. Profile, Settings, and the separated destructive logout action share the same typed action model, while Dashboard, Projects, and Teams remain focused primary navigation.

## Project structure

```text
app/
  _layout.tsx                 Root providers and protected route guards
  index.tsx                   Session-aware entry redirect
  +not-found.tsx              Cross-platform unmatched route state
  (auth)/                     Public sign-in and registration stack
  (protected)/                Authenticated drawer routes
components/
  account/                    Avatar and adaptive account menu
  auth/                       Shared public authentication layout
  feedback/                   Loading, empty, and error states
  layout/                     Header and responsive screen container
  navigation/                 Custom drawer content
  ui/                         Reusable inline, card, badge, progress, and control primitives
constants/
  authorization.ts            Typed system-role and permission identifiers
  navigation.ts               Typed application route registry
  theme.ts                    Typed theme contracts and default design tokens
  theme-presets.ts            Data-only light/dark application preset registry
context/
  AppShellContext.tsx         Responsive breakpoint and sidebar state
hooks/                        Platform-aware color and responsive-layout hooks
lib/
  authorization.ts            Validated authorization RPC and reusable helpers
  supabase.ts                 Universal Supabase client and session storage
  theme-settings.ts           Theme cache, database, and realtime synchronization
providers/
  AuthProvider.tsx            Authentication state and profile actions
  ThemeProvider.tsx           Presets, display mode, CSS vars, and navigation theme
supabase/migrations/          Versioned settings, RBAC schema, triggers, and RLS
docs/rbac.md                  RBAC model, bootstrap, and extension guide
docs/theming.md               Theme extension and operations guide
types/                        Shared TypeScript contracts
```

## Navigation and authentication

The root stack uses Expo Router 6 protected routes. Public auth screens are available only without a session; the drawer group is available only with a Supabase session. This keeps protection at the route owner instead of repeating redirect effects in individual screens.

Expo Router provides URL routing and deep links on all targets. `vercel.json` rewrites web requests to the static application entry so direct browser navigation such as `/projects` remains valid.

Production web exports enable Router 6 async routes, so route modules are split into on-demand chunks. Native production keeps the stable bundled route behavior documented for SDK 54.

Authentication is client-side on static web exports. Sensitive authorization must still be enforced by Supabase Row Level Security or another backend policy; a client-side route guard is a user-experience boundary, not a data-security boundary.

## Theme and UI state

The application ships with Default, Modern, Corporate, and Minimal presets,
each with complete light and dark palettes. Administrators select the shared
preset in Settings; it is stored in the Supabase `app_settings` table and
propagated to active clients over Realtime. Every device independently supports
System, Light, and Dark display modes with an AsyncStorage preference.

The provider restores a validated cached preset before revealing application
content, reconciles it with the database, and supplies the same semantic tokens
to React Native components, React Navigation, and web CSS variables. Shared
responsive metrics consume the active spacing scale. See
[the theme architecture guide](docs/theming.md) for the token contract,
database policy, preset workflow, and future tenant/custom-theme path.

## Environment

Create `.env.local` in the project root:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never place a Supabase service-role key or another server secret in an `EXPO_PUBLIC_` variable. Configure Supabase Auth redirect URLs for each web domain and native scheme before release.

Apply the included Supabase migration before using administrator theme changes:

```bash
supabase db push
```

The RBAC migration seeds Admin, Manager, Staff, and User roles. Theme writes
require a normalized Admin assignment; the database RLS policy—not the client
UI—is the authorization boundary. See [the RBAC guide](docs/rbac.md), including
the deterministic current-account bootstrap behavior for existing projects.

## Commands

```bash
npm install
npm start
npm run android
npm run ios
npm run web
npm run check
npm run build:web
```

`npm run check` runs strict TypeScript and lint. `npm run build:web` creates the static web output in `dist/`.

## Deployment

The included Vercel configuration runs the Expo static export and serves `dist/`. Add both public Supabase variables to the deployment environment before building.

Native release builds should use EAS Build or local native tooling supported by Expo SDK 54. The app configuration enables the New Architecture, automatic color style, Android edge-to-edge, tablet support, and an unlocked orientation for responsive tablet layouts.

## Architectural decisions

- Expo Router remains the source of truth because it supplies nested native navigation, typed routes, browser URLs, static web output, and deep links from one filesystem hierarchy.
- React Navigation Drawer is the only added runtime dependency. SDK 54 requires it for Expo Router drawers, and it supplies native swipe gestures and state-preserving navigation.
- The Account menu uses React Native's existing Modal and Animated primitives. One shared menu owns navigation, profile data, keyboard handling, and logout state; only the web popover and native bottom-sheet presentation differ.
- Theme presets are configuration objects behind a stable semantic-token
  contract. Components never branch on a preset ID, so new presets and future
  tenant overrides do not require component rewrites.
- Responsive decisions use usable content width after reserved sidebar space and page gutters. Compact-phone density is centralized instead of repeated as one-off platform checks.
- Icon-and-label controls use one inline layout contract: non-wrapping rows, non-shrinking icon slots, shrinkable text, and single-line truncation remain consistent across native and web targets.
- Auth context hydrates one validated database authorization snapshot per login
  and exposes `hasRole`, `isAdmin`, and `can`; Supabase RLS remains authoritative.
- React context is used only for auth, authorization, theme, and application-shell UI state. A global store is not warranted by the current data model.
- The screen examples contain complete local interactions and representative data. Replace those module-level datasets with repository/API hooks as the backend domain is introduced; the shell and route contracts do not need to change.
- Accessibility labels, roles, selected/busy states, 44px touch targets, keyboard focus treatments, and reduced layout complexity are built into shared primitives rather than repeated per screen.
