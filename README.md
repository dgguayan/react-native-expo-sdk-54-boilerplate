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
| Mobile (below 768px) | Hidden, swipe-enabled native drawer with a compact header |

Settings and logout live in the fixed drawer footer. Dashboard, Projects, Teams, and Settings use the same typed route registry, so links, active states, browser history, native back navigation, and deep links stay aligned.

## Project structure

```text
app/
  _layout.tsx                 Root providers and protected route guards
  index.tsx                   Session-aware entry redirect
  +not-found.tsx              Cross-platform unmatched route state
  (auth)/                     Public sign-in and registration stack
  (protected)/                Authenticated drawer routes
components/
  auth/                       Shared public authentication layout
  feedback/                   Loading, empty, and error states
  layout/                     Header and responsive screen container
  navigation/                 Custom drawer content
  ui/                         Reusable card, badge, progress, and control primitives
constants/
  navigation.ts               Typed application route registry
  theme.ts                    Color, spacing, radius, typography, and layout tokens
context/
  AppShellContext.tsx         Responsive breakpoint and sidebar state
hooks/                        Platform-aware hooks
lib/
  supabase.ts                 Universal Supabase client and session storage
providers/
  AuthProvider.tsx            Authentication state and actions
  ThemeProvider.tsx           System/light/dark preference and navigation theme
types/                        Shared TypeScript contracts
```

## Navigation and authentication

The root stack uses Expo Router 6 protected routes. Public auth screens are available only without a session; the drawer group is available only with a Supabase session. This keeps protection at the route owner instead of repeating redirect effects in individual screens.

Expo Router provides URL routing and deep links on all targets. `vercel.json` rewrites web requests to the static application entry so direct browser navigation such as `/projects` remains valid.

Production web exports enable Router 6 async routes, so route modules are split into on-demand chunks. Native production keeps the stable bundled route behavior documented for SDK 54.

Authentication is client-side on static web exports. Sensitive authorization must still be enforced by Supabase Row Level Security or another backend policy; a client-side route guard is a user-experience boundary, not a data-security boundary.

## Theme and UI state

The theme provider supports system, light, and dark modes. The selected mode, desktop sidebar state, and device notification preferences persist in AsyncStorage.

The design token layer intentionally uses React Native styles for dynamic colors, focus states, responsive dimensions, and cross-platform shadows. NativeWind remains configured for static utility styling when it is the clearest option.

## Environment

Create `.env.local` in the project root:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never place a Supabase service-role key or another server secret in an `EXPO_PUBLIC_` variable. Configure Supabase Auth redirect URLs for each web domain and native scheme before release.

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
- React context is used only for auth, theme, and application-shell UI state. A global store is not warranted by the current data model.
- The screen examples contain complete local interactions and representative data. Replace those module-level datasets with repository/API hooks as the backend domain is introduced; the shell and route contracts do not need to change.
- Accessibility labels, roles, selected/busy states, 44px touch targets, keyboard focus treatments, and reduced layout complexity are built into shared primitives rather than repeated per screen.
