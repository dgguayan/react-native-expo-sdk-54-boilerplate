# Expo SDK 54 Production Boilerplate

A minimal, production-ready mobile and web starter built with **Expo SDK 54**, **NativeWind**, **Supabase Auth**, **Expo Router**, and **Vercel** deployment. Supports iOS, Android, and Web from a single codebase.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Step 1 — Create the Project](#step-1--create-the-project)
- [Step 2 — Install Dependencies](#step-2--install-dependencies)
- [Step 3 — Configure NativeWind](#step-3--configure-nativewind)
- [Step 4 — TypeScript & Path Aliases](#step-4--typescript--path-aliases)
- [Step 5 — Environment Variables](#step-5--environment-variables)
- [Step 6 — Supabase Setup](#step-6--supabase-setup)
- [Step 7 — Build the App](#step-7--build-the-app)
- [Step 8 — Web Deployment (Vercel)](#step-8--web-deployment-vercel)
- [Step 9 — Mobile Builds (EAS)](#step-9--mobile-builds-eas)
- [Step 10 — Supabase Auth Settings](#step-10--supabase-auth-settings)
- [Environment Variables Reference](#environment-variables-reference)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)
- [Final Checklist](#final-checklist)

---

## Overview

This boilerplate gives you a fully working, deployable app in the shortest path possible. It is intentionally minimal — no design system, no bloat, no over-engineering. You get:

- Email/password authentication with session persistence
- Protected and public route groups via Expo Router
- NativeWind (Tailwind CSS) styling that works on both native and web
- A single codebase that builds to iOS, Android, and Web
- One-command Vercel deployment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 |
| Navigation | Expo Router v3 |
| Language | TypeScript |
| Styling | NativeWind 4 (Tailwind CSS) |
| Auth & Backend | Supabase |
| Web Deployment | Vercel |
| Mobile Builds | EAS Build |

---

## Prerequisites

Before you begin, make sure you have the following installed and configured.

### Required Software

| Tool | Version | Install |
|---|---|---|
| Node.js | 18 or higher | https://nodejs.org |
| npm or yarn | Latest | Included with Node.js |
| Git | Any | https://git-scm.com |

### Required Accounts

| Service | Purpose | Link |
|---|---|---|
| Supabase | Auth + database backend | https://supabase.com |
| Vercel | Web hosting and deployment | https://vercel.com |
| Expo (EAS) | iOS and Android builds | https://expo.dev |
| Apple Developer | iOS distribution (production only) | https://developer.apple.com |
| Google Play Console | Android distribution (production only) | https://play.google.com/console |

### Required Global Tools

Install these globally before starting:

```bash
npm install -g eas-cli
npm install -g expo-cli
```

Verify installations:

```bash
node --version      # should be 18+
eas --version       # should be 7+
expo --version
```

---

## Project Structure

```
my-app/
├── app/
│   ├── _layout.tsx              # Root layout — wraps everything in AuthProvider
│   ├── index.tsx                # Entry point — redirects based on auth session
│   ├── (auth)/
│   │   ├── _layout.tsx          # Public layout (no auth required)
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Registration screen
│   └── (protected)/
│       ├── _layout.tsx          # Auth guard — redirects to login if no session
│       └── dashboard.tsx        # Example protected screen
├── components/
│   ├── Button.tsx               # Reusable button with loading state
│   ├── Container.tsx            # Screen wrapper with safe area padding
│   └── Input.tsx                # Reusable labeled text input
├── lib/
│   └── supabase.ts              # Supabase client configuration
├── providers/
│   └── AuthProvider.tsx         # Auth context + hooks
├── types/
│   └── index.ts                 # Shared TypeScript types
├── hooks/                       # Custom hooks (empty, ready to use)
├── store/                       # State management (empty, ready to use)
├── utils/                       # Helper functions (empty, ready to use)
├── assets/
│   └── images/
├── global.css                   # Tailwind entry point
├── tailwind.config.js           # NativeWind / Tailwind configuration
├── babel.config.js              # Babel with NativeWind preset
├── metro.config.js              # Metro bundler with NativeWind
├── tsconfig.json                # TypeScript with path aliases
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build profiles
├── vercel.json                  # Vercel deployment configuration
└── .env.local                   # Local environment variables (not committed)
```

---

## Quick Start

If you just want to get running fast and fill in details later:

```bash
# 1. Create project
npx create-expo-app@latest my-app --template default@sdk-54
cd my-app

# 2. Install dependencies
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
npx expo install expo-router expo-linking expo-constants expo-status-bar

# 3. Add your Supabase keys to .env.local
echo "EXPO_PUBLIC_SUPABASE_URL=your-url" >> .env.local
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local

# 4. Start development
npx expo start
```

For the full setup including all file creation, continue reading below.

---

## Step 1 — Create the Project

Run the official Expo SDK 54 starter command. This scaffolds a working Expo project with TypeScript and Expo Router already configured.

```bash
npx create-expo-app@latest my-app --template default@sdk-54
cd my-app
```

After this runs, you will have a working Expo project. You can verify it starts:

```bash
npx expo start
```

Press `w` to open in a browser, `a` for Android emulator, or `i` for iOS simulator. Once confirmed working, proceed to the next step.

---

## Step 2 — Install Dependencies

Install all required packages in one go. Using `npx expo install` (instead of plain `npm install`) ensures compatible versions are selected automatically.

```bash
# Styling
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context

# Supabase and auth storage
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

# Routing (already bundled in the template but install to ensure latest compatible version)
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

Verify your `package.json` includes all of the above before continuing.

---

## Step 3 — Configure NativeWind

NativeWind requires changes to four files. Follow each sub-step in order.

### 3a — Create Tailwind Config

Create `tailwind.config.js` in the project root:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./providers/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 3b — Create Global CSS

Create `global.css` in the project root:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3c — Update Babel Config

Replace the contents of `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### 3d — Update Metro Config

Create or replace `metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

> **Note:** After changing `babel.config.js` or `metro.config.js`, always restart the dev server with the cache cleared: `npx expo start --clear`

---

## Step 4 — TypeScript & Path Aliases

### 4a — Update tsconfig.json

Replace the contents of `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This allows you to import from the project root using `@/` instead of relative paths like `../../lib/supabase`.

---

## Step 5 — Environment Variables

Create a `.env.local` file in the project root. This file stores your secret keys and must **never** be committed to version control.

```bash
touch .env.local
```

Add the following to `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Important:** The `EXPO_PUBLIC_` prefix is required. Expo only exposes environment variables that start with this prefix to the client bundle. Variables without this prefix are not accessible in your app code.

Add `.env.local` to `.gitignore` to prevent accidental commits:

```bash
echo ".env.local" >> .gitignore
```

You will fill in the real values after completing Supabase setup in Step 6.

---

## Step 6 — Supabase Setup

### 6a — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account
2. Click **New Project**
3. Fill in your project name, database password, and region
4. Click **Create new project** and wait for it to provision (about 1–2 minutes)

### 6b — Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon in the left sidebar)
2. Click **API** under the Configuration section
3. Copy the following values:
   - **Project URL** — this is your `EXPO_PUBLIC_SUPABASE_URL`
   - **anon / public key** — this is your `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Update your `.env.local` with these values.

### 6c — Enable Email Auth

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Confirm **Email** is enabled (it is enabled by default)
3. Optionally disable **Confirm email** during development so users can log in immediately without verifying their email

### 6d — Create the Supabase Client

Create the file `lib/supabase.ts`:

```ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

The `react-native-url-polyfill/auto` import at the top is required. Supabase uses URL parsing internally and the standard `URL` API is not available in React Native without this polyfill.

---

## Step 7 — Build the App

Create each file in the order listed. All paths are relative to the project root.

### 7a — Types

Create `types/index.ts`:

```ts
import { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}
```

### 7b — Auth Provider

Create `providers/AuthProvider.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### 7c — Components

Create `components/Container.tsx`:

```tsx
import { View } from "react-native";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-8">
      {children}
    </View>
  );
}
```

Create `components/Input.tsx`:

```tsx
import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      )}
      <TextInput
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}
```

Create `components/Button.tsx`:

```tsx
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function Button({
  onPress,
  title,
  loading,
  variant = "primary",
}: ButtonProps) {
  const base = "w-full items-center rounded-lg py-3.5";
  const styles =
    variant === "primary"
      ? `${base} bg-black`
      : `${base} border border-gray-300 bg-white`;

  return (
    <TouchableOpacity className={styles} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#000"} />
      ) : (
        <Text
          className={`text-base font-semibold ${
            variant === "primary" ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

### 7d — App Layouts and Screens

Create `app/_layout.tsx` (root layout):

```tsx
import { Slot } from "expo-router";
import { AuthProvider } from "@/providers/AuthProvider";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
```

Create `app/index.tsx` (auth redirect entry):

```tsx
import { Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return session ? (
    <Redirect href="/(protected)/dashboard" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
```

Create `app/(auth)/_layout.tsx`:

```tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Create `app/(auth)/login.tsx`:

```tsx
import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { Container } from "@/components/Container";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in all fields.");
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert("Login Failed", error);
  };

  return (
    <Container>
      <View className="flex-1 justify-center">
        <Text className="mb-8 text-3xl font-bold text-gray-900">Sign In</Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        <Button title="Sign In" onPress={handleLogin} loading={loading} />
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">No account? </Text>
          <Link href="/(auth)/register">
            <Text className="font-semibold text-black">Sign Up</Text>
          </Link>
        </View>
      </View>
    </Container>
  );
}
```

Create `app/(auth)/register.tsx`:

```tsx
import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { Container } from "@/components/Container";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in all fields.");
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      Alert.alert("Sign Up Failed", error);
    } else {
      Alert.alert("Success", "Check your email to confirm your account.");
    }
  };

  return (
    <Container>
      <View className="flex-1 justify-center">
        <Text className="mb-8 text-3xl font-bold text-gray-900">
          Create Account
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Min. 6 characters"
        />
        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
        />
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="font-semibold text-black">Sign In</Text>
          </Link>
        </View>
      </View>
    </Container>
  );
}
```

Create `app/(protected)/_layout.tsx` (auth guard):

```tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { View, ActivityIndicator } from "react-native";

export default function ProtectedLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Create `app/(protected)/dashboard.tsx`:

```tsx
import { View, Text } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <Container>
      <View className="flex-1 justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="mt-2 text-gray-500">{user?.email}</Text>
        </View>
        <Button title="Sign Out" onPress={signOut} variant="secondary" />
      </View>
    </Container>
  );
}
```

### 7e — App Configuration

Replace `app.json` with the following:

```json
{
  "expo": {
    "name": "my-app",
    "slug": "my-app",
    "version": "1.0.0",
    "scheme": "myapp",
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourname.myapp"
    }
  }
}
```

> **Note:** Replace `com.yourname.myapp` with your own bundle ID / package name before running EAS builds.

---

## Step 8 — Web Deployment (Vercel)

### 8a — Create Vercel Config

Create `vercel.json` in the project root:

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

The `rewrites` rule ensures that deep links (e.g. navigating directly to `/dashboard`) are handled by the app's client-side router rather than returning a 404.

### 8b — Test the Web Build Locally

```bash
npx expo export --platform web
```

This creates a `dist/` folder. Verify the output exists before deploying.

### 8c — Deploy to Vercel

**Option A — Vercel CLI (recommended for first deploy):**

```bash
npx vercel
```

Follow the prompts. When asked about the build and output settings, Vercel will pick them up automatically from `vercel.json`.

**Option B — GitHub Integration:**

1. Push your project to a GitHub repository
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel will auto-detect `vercel.json` and configure itself

### 8d — Add Environment Variables in Vercel

After deploying, you must add your Supabase keys to Vercel so the production build can connect to your backend:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following:
   - `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
4. Set the environment scope to **Production**, **Preview**, and **Development** as needed
5. Redeploy the project for the variables to take effect

---

## Step 9 — Mobile Builds (EAS)

### 9a — Log In to Expo

```bash
eas login
```

Enter your Expo account credentials. If you don't have an account, create one at [https://expo.dev](https://expo.dev).

### 9b — Initialize EAS in Your Project

```bash
eas init
```

This links your local project to your Expo account. It creates or updates the `extra.eas.projectId` field in `app.json`.

### 9c — Create EAS Build Config

Create `eas.json` in the project root:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Profile descriptions:**

| Profile | Purpose |
|---|---|
| `development` | Installs a dev client on your device for local development |
| `preview` | Builds a distributable APK/IPA for internal testing |
| `production` | Builds a production binary for App Store / Play Store submission |

### 9d — Build Commands

```bash
# Android preview build (APK — can be installed directly on device)
eas build --platform android --profile preview

# iOS preview build (requires Apple dev account enrolled)
eas build --platform ios --profile preview

# Production build for both platforms
eas build --platform all --profile production
```

> **iOS note:** Building for iOS requires an Apple Developer account ($99/year). EAS handles provisioning profiles and signing certificates automatically.

> **Android note:** The preview profile generates an APK that can be installed directly on Android devices without going through the Play Store. Production builds generate an AAB for Play Store submission.

### 9e — Track Your Build

After running a build command, EAS prints a URL. You can monitor the build status at [https://expo.dev](https://expo.dev) under your project's **Builds** section.

---

## Step 10 — Supabase Auth Settings

After your web app is deployed, update Supabase to allow authentication from your production domain.

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set the following:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs (add all of these):**
```
myapp://
https://your-app.vercel.app
https://your-app.vercel.app/**
http://localhost:8081
exp://localhost:8081
```

> Replace `myapp` with the `scheme` value from your `app.json`, and replace `your-app.vercel.app` with your actual Vercel domain.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase public anon key |

All variables must use the `EXPO_PUBLIC_` prefix to be accessible in the app bundle. Do not use this prefix for server-side secrets that should never reach the client.

---

## Scripts Reference

Add these to your `package.json` scripts for convenience:

```json
{
  "scripts": {
    "start": "expo start",
    "start:clear": "expo start --clear",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:web": "expo export --platform web",
    "build:android:preview": "eas build --platform android --profile preview",
    "build:ios:preview": "eas build --platform ios --profile preview",
    "build:production": "eas build --platform all --profile production",
    "deploy": "vercel --prod"
  }
}
```

---

## Troubleshooting

### NativeWind classes not applying

Clear the Metro cache and restart:

```bash
npx expo start --clear
```

If classes still don't work, verify that `global.css` is imported in `app/_layout.tsx` and that `tailwind.config.js` includes the correct `content` paths.

### Supabase auth not persisting on reload

Make sure `react-native-url-polyfill/auto` is the **first** import in `lib/supabase.ts`. The polyfill must load before any Supabase code runs.

### `@/` path aliases not resolving

Confirm `tsconfig.json` has both `baseUrl: "."` and the `paths` entry for `@/*`. Restart the TypeScript server in your editor after changing this file.

### Vercel deploy returns 404 on page refresh

Confirm `vercel.json` contains the `rewrites` rule that points all routes to `/`. Without this, refreshing any non-root route returns a 404 because Vercel tries to serve it as a static file.

### EAS build fails with missing credentials

Run `eas credentials` to manage your iOS/Android signing credentials. For first-time builds, use `--profile preview` before attempting production builds.

### Environment variables undefined in production

Verify that variables are added in the Vercel dashboard under **Settings → Environment Variables**, and that the project was redeployed after adding them. Variables added after a deploy do not apply until the next deployment.

---

## Final Checklist

Work through this checklist before considering the setup complete.

### Local Development

- [ ] `npx expo start` runs without errors
- [ ] Web opens correctly in browser (`w` key)
- [ ] Login screen renders with styled inputs and button
- [ ] Register screen renders correctly
- [ ] Supabase sign-up creates a user visible in the Supabase dashboard
- [ ] Login with valid credentials navigates to Dashboard
- [ ] Dashboard displays the logged-in user's email
- [ ] Sign Out returns the user to the Login screen
- [ ] Closing and reopening the app restores the session (no re-login required)
- [ ] Navigating directly to a protected route while logged out redirects to Login
- [ ] NativeWind classes apply correctly on both web and native

### Web Deployment

- [ ] `npx expo export --platform web` completes without errors and creates `dist/`
- [ ] `npx vercel` deploys successfully
- [ ] Environment variables are added in Vercel dashboard
- [ ] Auth flow works end-to-end on the deployed URL
- [ ] Page refresh on the dashboard does not return a 404
- [ ] Supabase redirect URLs include the production domain

### Mobile Builds

- [ ] `eas build --platform android --profile preview` completes
- [ ] APK installs on an Android device
- [ ] Login, register, and sign-out work on the installed APK
- [ ] Session persists after closing and reopening the app on device
- [ ] iOS build completes (requires Apple Developer account)
- [ ] iOS IPA installs via TestFlight or direct distribution

---

## License

MIT
