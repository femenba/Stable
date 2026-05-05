# stable. Expo Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native iOS + Android Expo app with 4 tabs (Today, Tasks, Focus, Reminders), Clerk auth, tRPC API, iOS Live Activity lock-screen timer, and local push notification reminders.

**Architecture:** Expo Router (file-based navigation) lives at `apps/mobile/` in the existing pnpm monorepo. Auth uses `@clerk/clerk-expo` (same Clerk project as the web app — same users, same JWT format). The tRPC client points at the existing Vercel API; `AppRouter` type is imported from `apps/api/src/router.ts` (type-only, no runtime dependency). Live Activity on iOS uses `@lodev09/react-native-live-activities`; Android uses a sticky `expo-notifications` foreground notification.

**Tech Stack:** Expo SDK 52, Expo Router 4, React Native 0.76, TypeScript, `@clerk/clerk-expo` ^2, `@trpc/client` ^11, `@tanstack/react-query` ^5, `expo-notifications` ~0.29, `@lodev09/react-native-live-activities` ^1, `expo-linear-gradient` ~14, `react-native-safe-area-context` 4.12, `react-native-screens` ~4.1, `expo-secure-store` ~14

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| CREATE | `apps/mobile/package.json` | Package manifest + deps |
| CREATE | `apps/mobile/app.json` | Expo config (bundleId, permissions) |
| CREATE | `apps/mobile/tsconfig.json` | TypeScript config |
| CREATE | `apps/mobile/eas.json` | EAS Build profiles |
| CREATE | `apps/mobile/.env` | Public env vars |
| CREATE | `apps/mobile/app/_layout.tsx` | Root layout — ClerkProvider + tRPC + QueryClient |
| CREATE | `apps/mobile/app/(auth)/_layout.tsx` | Redirects signed-in users away from auth screens |
| CREATE | `apps/mobile/app/(auth)/sign-in.tsx` | Clerk sign-in screen |
| CREATE | `apps/mobile/app/(auth)/sign-up.tsx` | Clerk sign-up screen |
| CREATE | `apps/mobile/app/(tabs)/_layout.tsx` | Bottom tab bar (4 tabs) |
| CREATE | `apps/mobile/app/(tabs)/index.tsx` | Today screen |
| CREATE | `apps/mobile/app/(tabs)/tasks.tsx` | Tasks screen |
| CREATE | `apps/mobile/app/(tabs)/focus.tsx` | Focus screen + Live Activity |
| CREATE | `apps/mobile/app/(tabs)/reminders.tsx` | Reminders screen + push notifications |
| CREATE | `apps/mobile/src/lib/theme.ts` | Design tokens (light + dark) |
| CREATE | `apps/mobile/src/lib/use-theme.ts` | `useTheme()` hook |
| CREATE | `apps/mobile/src/lib/trpc-client.ts` | tRPC client + React Query provider |
| CREATE | `apps/mobile/src/lib/live-activity.ts` | Live Activity start/update/end (iOS-only) |
| CREATE | `apps/mobile/src/lib/notifications.ts` | Schedule / cancel local push notifications |
| CREATE | `apps/mobile/src/components/screen-header.tsx` | Gradient header shared by all tabs |
| CREATE | `apps/mobile/src/components/ai-insight.tsx` | STABLE AI card |
| CREATE | `apps/mobile/src/components/task-card.tsx` | Task card with category colour |
| CREATE | `apps/mobile/src/components/next-focus-card.tsx` | "Next Focus Session" suggestion card |

---

## Task 1: Scaffold apps/mobile

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/eas.json`
- Create: `apps/mobile/.env`

- [ ] **Step 1: Create `apps/mobile/package.json`**

```json
{
  "name": "@stable/mobile",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "build:preview": "eas build --profile preview",
    "build:prod": "eas build --profile production"
  },
  "dependencies": {
    "@clerk/clerk-expo": "^2.0.0",
    "@lodev09/react-native-live-activities": "^1.0.0",
    "@react-native-async-storage/async-storage": "2.1.0",
    "@stable/shared": "workspace:*",
    "@tanstack/react-query": "^5.62.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "expo": "~52.0.0",
    "expo-constants": "~17.0.0",
    "expo-linear-gradient": "~14.0.0",
    "expo-linking": "~7.0.0",
    "expo-notifications": "~0.29.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.1.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0"
  }
}
```

- [ ] **Step 2: Create `apps/mobile/app.json`**

Replace `YOUR_CLERK_PUBLISHABLE_KEY` with the same key used in `apps/api/.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`).

```json
{
  "expo": {
    "name": "stable.",
    "slug": "stable",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "stable",
    "userInterfaceStyle": "automatic",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.stable.app",
      "infoPlist": {
        "NSUserNotificationsUsageDescription": "stable. uses notifications to remind you at the time you set."
      }
    },
    "android": {
      "package": "com.stable.app",
      "adaptiveIcon": {
        "backgroundColor": "#4f3aff"
      },
      "permissions": ["RECEIVE_BOOT_COMPLETED", "SCHEDULE_EXACT_ALARM"]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4f3aff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 3: Create `apps/mobile/tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 4: Create `apps/mobile/eas.json`**

```json
{
  "cli": {
    "version": ">= 12.0.0"
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

- [ ] **Step 5: Create `apps/mobile/.env`**

```env
EXPO_PUBLIC_API_URL=https://api-sooty-two-41.vercel.app
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

Replace `pk_live_YOUR_KEY_HERE` with the value of `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from `apps/api/.env.local`.

- [ ] **Step 6: Install dependencies**

```bash
cd /Users/femenba/stable
pnpm install
```

Expected: pnpm resolves workspace deps including `@stable/shared`. No errors.

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/
git commit -m "feat: scaffold apps/mobile — Expo 52 + Expo Router"
```

---

## Task 2: Theme system

**Files:**
- Create: `apps/mobile/src/lib/theme.ts`
- Create: `apps/mobile/src/lib/use-theme.ts`

- [ ] **Step 1: Create `apps/mobile/src/lib/theme.ts`**

```ts
import type { TaskCategory } from '@stable/shared'

export const theme = {
  light: {
    bg:         '#fafafe',
    card:       '#ffffff',
    cardBorder: '#f0eeff',
    nav:        '#ffffff',
    navBorder:  '#f0eeff',
    t1:         '#111111',
    t2:         '#888888',
    t3:         '#cccccc',
    headerStart: '#4f3aff',
    headerMid:   '#7c3aed',
    headerEnd:   '#c026d3',
    ctaStart:    '#4f3aff',
    ctaEnd:      '#7c3aed',
  },
  dark: {
    bg:         '#120e24',
    card:       '#1a1535',
    cardBorder: '#2a1f60',
    nav:        '#120e24',
    navBorder:  '#1e1a38',
    t1:         '#e2d9f3',
    t2:         '#8b7ab8',
    t3:         '#3a2f5a',
    headerStart: '#1e1260',
    headerMid:   '#120e24',
    headerEnd:   '#120e24',
    ctaStart:    '#6366f1',
    ctaEnd:      '#a855f7',
  },
} as const

export type Theme = typeof theme.light

export const catColor: Record<TaskCategory, { light: string; dark: string }> = {
  work:     { light: '#4f3aff', dark: '#6366f1' },
  personal: { light: '#7c3aed', dark: '#a855f7' },
  family:   { light: '#be185d', dark: '#ec4899' },
  health:   { light: '#0891b2', dark: '#22d3ee' },
  other:    { light: '#6b7280', dark: '#9ca3af' },
}

export const catLabel: Record<TaskCategory, string> = {
  work:     'Work',
  personal: 'Personal',
  family:   'Family',
  health:   'Health',
  other:    'Other',
}
```

- [ ] **Step 2: Create `apps/mobile/src/lib/use-theme.ts`**

```ts
import { useColorScheme } from 'react-native'
import { theme, catColor, catLabel } from './theme'
import type { TaskCategory } from '@stable/shared'

export function useTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const t = isDark ? theme.dark : theme.light

  function getCatColor(category: TaskCategory): string {
    return isDark ? catColor[category].dark : catColor[category].light
  }

  return { t, isDark, getCatColor, catLabel }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/theme.ts apps/mobile/src/lib/use-theme.ts
git commit -m "feat(mobile): theme tokens and useTheme hook"
```

---

## Task 3: tRPC client

**Files:**
- Create: `apps/mobile/src/lib/trpc-client.ts`

The mobile app imports `AppRouter` as a **type-only** import from the API source. This adds no runtime dependency — TypeScript strips it at compile time.

- [ ] **Step 1: Create `apps/mobile/src/lib/trpc-client.ts`**

```ts
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '../../../api/src/router'

export const trpc = createTRPCReact<AppRouter>()

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000 },
    },
  })
}

export function makeTrpcClient(getToken: () => Promise<string | null>) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
        async headers() {
          const token = await getToken()
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      }),
    ],
  })
}
```

- [ ] **Step 2: Verify TypeScript sees the router type**

```bash
cd /Users/femenba/stable/apps/mobile
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only about missing files we haven't created yet — NOT errors about `AppRouter` being unresolvable. If you see `Cannot find module '../../../api/src/router'`, check the relative path from `src/lib/trpc-client.ts` to `apps/api/src/router.ts`. From `apps/mobile/src/lib/`, the path to `apps/api/src/router.ts` is `../../api/src/router` (note: only 2 levels up to reach `apps/`).

If path is wrong, fix to:
```ts
import type { AppRouter } from '../../api/src/router'
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/trpc-client.ts
git commit -m "feat(mobile): tRPC client with Clerk JWT injection"
```

---

## Task 4: Root layout — providers

**Files:**
- Create: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Create `apps/mobile/app/_layout.tsx`**

```tsx
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { trpc, makeQueryClient, makeTrpcClient } from '@/lib/trpc-client'

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key)
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value)
  },
}

function TrpcProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()
  const [queryClient] = useState(() => makeQueryClient())
  const [trpcClient] = useState(() =>
    makeTrpcClient(() => getToken({ template: 'default' }))
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <TrpcProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TrpcProvider>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): root layout with Clerk + tRPC providers"
```

---

## Task 5: Auth screens

**Files:**
- Create: `apps/mobile/app/(auth)/_layout.tsx`
- Create: `apps/mobile/app/(auth)/sign-in.tsx`
- Create: `apps/mobile/app/(auth)/sign-up.tsx`

- [ ] **Step 1: Create `apps/mobile/app/(auth)/_layout.tsx`**

```tsx
import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return null
  if (isSignedIn) return <Redirect href="/(tabs)/" />
  return <Stack screenOptions={{ headerShown: false }} />
}
```

- [ ] **Step 2: Create `apps/mobile/app/(auth)/sign-in.tsx`**

```tsx
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useTheme } from '@/lib/use-theme'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const { t } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSignIn() {
    if (!isLoaded) return
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)/')
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Sign in failed')
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.t1 }]}>stable.</Text>
      <Text style={[styles.subtitle, { color: t.t2 }]}>Your focus companion</Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
        placeholder="Email"
        placeholderTextColor={t.t3}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
        placeholder="Password"
        placeholderTextColor={t.t3}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4f3aff' }]}
        onPress={handleSignIn}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-up" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={[styles.linkText, { color: t.t2 }]}>
            No account? <Text style={{ color: '#4f3aff' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title:     { fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  subtitle:  { fontSize: 14, textAlign: 'center', marginBottom: 40 },
  input:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  button:    { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  link:      { marginTop: 20, alignItems: 'center' },
  linkText:  { fontSize: 14 },
  error:     { color: '#ef4444', fontSize: 13, marginBottom: 8, textAlign: 'center' },
})
```

- [ ] **Step 3: Create `apps/mobile/app/(auth)/sign-up.tsx`**

```tsx
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useTheme } from '@/lib/use-theme'

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const { t } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [error, setError] = useState('')

  async function handleSignUp() {
    if (!isLoaded) return
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Sign up failed')
    }
  }

  async function handleVerify() {
    if (!isLoaded) return
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)/')
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Verification failed')
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.t1 }]}>stable.</Text>

      {!pendingVerification ? (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
            placeholder="Email"
            placeholderTextColor={t.t3}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
            placeholder="Password"
            placeholderTextColor={t.t3}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4f3aff' }]} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.subtitle, { color: t.t2 }]}>Check your email for a verification code.</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
            placeholder="Verification code"
            placeholderTextColor={t.t3}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4f3aff' }]} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify email</Text>
          </TouchableOpacity>
        </>
      )}

      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={[styles.linkText, { color: t.t2 }]}>
            Already have an account? <Text style={{ color: '#4f3aff' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title:     { fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  subtitle:  { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  input:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  button:    { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  link:      { marginTop: 20, alignItems: 'center' },
  linkText:  { fontSize: 14 },
  error:     { color: '#ef4444', fontSize: 13, marginBottom: 8, textAlign: 'center' },
})
```

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/\(auth\)/
git commit -m "feat(mobile): auth screens (sign-in, sign-up) via Clerk"
```

---

## Task 6: Shared components

**Files:**
- Create: `apps/mobile/src/components/screen-header.tsx`
- Create: `apps/mobile/src/components/ai-insight.tsx`
- Create: `apps/mobile/src/components/task-card.tsx`
- Create: `apps/mobile/src/components/next-focus-card.tsx`

- [ ] **Step 1: Create `apps/mobile/src/components/screen-header.tsx`**

```tsx
import { LinearGradient } from 'expo-linear-gradient'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/use-theme'

interface ScreenHeaderProps {
  label: string
  title: string
  subtitle?: string
}

export function ScreenHeader({ label, title, subtitle }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()
  const { t } = useTheme()
  return (
    <LinearGradient
      colors={[t.headerStart, t.headerMid, t.headerEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header:   { paddingHorizontal: 20, paddingBottom: 24 },
  label:    { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:    { fontSize: 26, fontWeight: '900', color: '#ffffff', lineHeight: 32 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
})
```

- [ ] **Step 2: Create `apps/mobile/src/components/ai-insight.tsx`**

```tsx
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/use-theme'

export function AiInsight() {
  const { t } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⬡ STABLE AI</Text>
      </View>
      <Text style={[styles.body, { color: t.t2 }]}>
        Pick your three most important tasks and focus on{' '}
        <Text style={{ color: t.t1, fontWeight: '700' }}>one at a time</Text>.{' '}
        Your focus is sharpest{' '}
        <Text style={{ color: t.t1, fontWeight: '700' }}>before noon</Text>.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card:      { marginHorizontal: 12, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  badge:     { alignSelf: 'flex-start', backgroundColor: 'rgba(99,102,241,0.12)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#4f3aff', textTransform: 'uppercase' },
  body:      { fontSize: 13, lineHeight: 20 },
})
```

- [ ] **Step 3: Create `apps/mobile/src/components/task-card.tsx`**

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Task } from '@stable/shared'
import { useTheme } from '@/lib/use-theme'
import { trpc } from '@/lib/trpc-client'

interface TaskCardProps {
  task: Task
  onUpdate: () => void
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const { t, getCatColor, catLabel } = useTheme()
  const complete = trpc.tasks.complete.useMutation({ onSuccess: onUpdate })
  const del      = trpc.tasks.delete.useMutation({ onSuccess: onUpdate })
  const color    = getCatColor(task.category)
  const isDone   = task.status === 'completed'

  return (
    <View style={[styles.card, {
      backgroundColor: t.card,
      borderColor:     t.cardBorder,
      borderLeftColor: color,
    }]}>
      <View style={styles.body}>
        <Text style={[styles.title, {
          color:             isDone ? t.t3 : t.t1,
          textDecorationLine: isDone ? 'line-through' : 'none',
        }]}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.tag, { backgroundColor: `${color}22` }]}>
            <Text style={[styles.tagText, { color }]}>{catLabel[task.category]}</Text>
          </View>
          {task.estimatedMinutes != null && (
            <Text style={[styles.metaText, { color: t.t3 }]}>{task.estimatedMinutes} min</Text>
          )}
          {!!task.dueAt && (
            <Text style={[styles.metaText, { color: t.t3 }]}>
              {new Date(task.dueAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => complete.mutate({ id: task.id })}
          disabled={isDone || complete.isPending}
          style={[styles.actionBtn, { borderColor: t.cardBorder, opacity: isDone || complete.isPending ? 0.4 : 1 }]}
        >
          <Text style={[styles.actionText, { color: t.t2 }]}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => del.mutate({ id: task.id })}
          disabled={del.isPending}
          style={[styles.actionBtn, { borderColor: t.cardBorder, opacity: del.isPending ? 0.4 : 1 }]}
        >
          <Text style={[styles.actionText, { color: t.t3 }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card:       { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderLeftWidth: 3, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  body:       { flex: 1, minWidth: 0 },
  title:      { fontSize: 14, fontWeight: '600' },
  meta:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag:        { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:    { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText:   { fontSize: 10 },
  actions:    { flexDirection: 'row', gap: 6, marginTop: 2 },
  actionBtn:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  actionText: { fontSize: 12, fontWeight: '600' },
})
```

- [ ] **Step 4: Create `apps/mobile/src/components/next-focus-card.tsx`**

The card picks `data[0]` from the existing `listTopThree` query result — no new API endpoint needed.

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import type { Task } from '@stable/shared'
import { useTheme } from '@/lib/use-theme'

interface NextFocusCardProps {
  task: Task | undefined
}

export function NextFocusCard({ task }: NextFocusCardProps) {
  const { t, getCatColor, catLabel } = useTheme()
  const router = useRouter()

  if (!task) return null

  const color = getCatColor(task.category)

  function handleStart() {
    router.push({ pathname: '/(tabs)/focus', params: { taskId: task!.id, taskName: task!.title } })
  }

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
      <Text style={[styles.label, { color: t.t3 }]}>NEXT UP</Text>
      <View style={styles.row}>
        <View style={[styles.accent, { backgroundColor: color }]} />
        <View style={styles.info}>
          <Text style={[styles.title, { color: t.t1 }]} numberOfLines={1}>{task.title}</Text>
          <View style={styles.meta}>
            <View style={[styles.tag, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.tagText, { color }]}>{catLabel[task.category]}</Text>
            </View>
            {!!task.dueAt && (
              <Text style={[styles.metaText, { color: t.t3 }]}>
                {new Date(task.dueAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: color }]}
          onPress={handleStart}
        >
          <Text style={styles.ctaText}>▶ Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card:     { marginHorizontal: 12, marginTop: 8, borderRadius: 16, borderWidth: 1, padding: 14 },
  label:    { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accent:   { width: 3, height: 40, borderRadius: 2 },
  info:     { flex: 1, minWidth: 0 },
  title:    { fontSize: 14, fontWeight: '700' },
  meta:     { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag:      { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:  { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText: { fontSize: 10 },
  cta:      { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  ctaText:  { color: '#fff', fontSize: 12, fontWeight: '800' },
})
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/components/
git commit -m "feat(mobile): shared components — ScreenHeader, AiInsight, TaskCard, NextFocusCard"
```

---

## Task 7: Tab layout

**Files:**
- Create: `apps/mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Check signed-in guard is needed**

The tab layout also needs a redirect for unauthenticated users. Expo Router re-renders layouts on auth state change, so we add the guard here too.

- [ ] **Step 2: Create `apps/mobile/app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { Text, View, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/use-theme'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  const { t } = useTheme()
  const activeColor = '#4f3aff'
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.iconEmoji}>{icon}</Text>
      {focused && <View style={[styles.dot, { backgroundColor: activeColor }]} />}
      <Text style={[styles.iconLabel, { color: focused ? activeColor : t.t3 }]}>{label}</Text>
    </View>
  )
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const { t } = useTheme()
  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.nav,
          borderTopColor:  t.navBorder,
          height: 72,
          paddingBottom: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Today" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✓" label="Tasks" focused={focused} /> }}
      />
      <Tabs.Screen
        name="focus"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⏱" label="Focus" focused={focused} /> }}
      />
      <Tabs.Screen
        name="reminders"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔔" label="Reminders" focused={focused} /> }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconWrap:  { alignItems: 'center', gap: 2, paddingTop: 8 },
  iconEmoji: { fontSize: 20 },
  dot:       { width: 4, height: 4, borderRadius: 2 },
  iconLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
})
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/_layout.tsx
git commit -m "feat(mobile): tab bar layout with auth guard"
```

---

## Task 8: Today screen

**Files:**
- Create: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Create `apps/mobile/app/(tabs)/index.tsx`**

```tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { trpc } from '@/lib/trpc-client'
import { useTheme } from '@/lib/use-theme'
import { AiInsight } from '@/components/ai-insight'
import { TaskCard } from '@/components/task-card'
import { NextFocusCard } from '@/components/next-focus-card'

export default function TodayScreen() {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const utils = trpc.useUtils()
  const { data: topTasks, isLoading } = trpc.tasks.listTopThree.useQuery()

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()

  function handleUpdate() {
    utils.tasks.listTopThree.invalidate()
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.label}>{today} · TODAY'S FOCUS</Text>
        <Text style={styles.title}>Three things.{'\n'}That's it.</Text>
        <Text style={styles.subtitle}>One at a time.</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AiInsight />

        {/* Next Focus Card */}
        <NextFocusCard task={topTasks?.[0]} />

        {/* Top 3 tasks */}
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.card }]} />
          ))
        ) : topTasks?.length ? (
          topTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
          ))
        ) : (
          <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.emptyText, { color: t.t3 }]}>No active tasks — add one in Tasks.</Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/focus')} style={styles.ctaWrap}>
          <LinearGradient
            colors={[t.ctaStart, t.ctaEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <View>
              <Text style={styles.ctaTitle}>Start focus session</Text>
              <Text style={styles.ctaSub}>Ready when you are</Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { paddingHorizontal: 20, paddingBottom: 24 },
  label:     { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:     { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 32 },
  subtitle:  { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  scroll:    { flex: 1 },
  content:   { paddingBottom: 24 },
  skeleton:  { marginHorizontal: 12, marginBottom: 8, height: 64, borderRadius: 16 },
  empty:     { marginHorizontal: 12, marginTop: 8, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  ctaWrap:   { marginHorizontal: 12, marginTop: 8 },
  cta:       { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaTitle:  { fontSize: 14, fontWeight: '700', color: '#fff' },
  ctaSub:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  ctaArrow:  { fontSize: 18, color: '#fff', fontWeight: '600' },
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat(mobile): Today screen with top tasks and Next Focus card"
```

---

## Task 9: Tasks screen

**Files:**
- Create: `apps/mobile/app/(tabs)/tasks.tsx`

- [ ] **Step 1: Create `apps/mobile/app/(tabs)/tasks.tsx`**

```tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { trpc } from '@/lib/trpc-client'
import { useTheme } from '@/lib/use-theme'
import { TaskCard } from '@/components/task-card'
import type { TaskCategory } from '@stable/shared'

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'work',     label: 'Work'     },
  { value: 'personal', label: 'Personal' },
  { value: 'family',   label: 'Family'   },
  { value: 'health',   label: 'Health'   },
  { value: 'other',    label: 'Other'    },
]

const PRIORITIES: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'High'   },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low'    },
]

export default function TasksScreen() {
  const { t, getCatColor } = useTheme()
  const insets = useSafeAreaInsets()
  const utils = trpc.useUtils()
  const [showForm, setShowForm]   = useState(false)
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState<TaskCategory>('work')
  const [priority, setPriority]   = useState<1 | 2 | 3>(2)

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({})
  const create = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate()
      utils.tasks.listTopThree.invalidate()
      setTitle('')
      setShowForm(false)
    },
  })

  const pending   = tasks?.filter((t) => t.status !== 'completed') ?? []
  const completed = tasks?.filter((t) => t.status === 'completed') ?? []

  function handleUpdate() {
    utils.tasks.list.invalidate()
    utils.tasks.listTopThree.invalidate()
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.label}>YOUR TASKS</Text>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          onPress={() => setShowForm((v) => !v)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Add task</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Create form */}
        {showForm && (
          <View style={[styles.form, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <TextInput
              style={[styles.input, { backgroundColor: t.bg, borderColor: t.cardBorder, color: t.t1 }]}
              placeholder="Task title..."
              placeholderTextColor={t.t3}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            {/* Category picker */}
            <View style={styles.pills}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  style={[styles.pill, {
                    backgroundColor: category === c.value ? `${getCatColor(c.value)}22` : t.bg,
                    borderColor:     category === c.value ? getCatColor(c.value) : t.cardBorder,
                  }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: category === c.value ? getCatColor(c.value) : t.t2 }}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Priority picker */}
            <View style={styles.pills}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  style={[styles.pill, {
                    backgroundColor: priority === p.value ? 'rgba(99,102,241,0.12)' : t.bg,
                    borderColor:     priority === p.value ? '#4f3aff' : t.cardBorder,
                  }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: priority === p.value ? '#4f3aff' : t.t2 }}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={[styles.cancelText, { color: t.t2 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { if (title.trim()) create.mutate({ title: title.trim(), category, priority }) }}
                disabled={create.isPending || !title.trim()}
                style={[styles.createBtn, { backgroundColor: '#4f3aff', opacity: create.isPending || !title.trim() ? 0.5 : 1 }]}
              >
                <Text style={styles.createBtnText}>{create.isPending ? '...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Task list */}
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.card }]} />
          ))
        ) : (
          <>
            {pending.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
            ))}
            {!pending.length && !showForm && (
              <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
                <Text style={[styles.emptyText, { color: t.t3 }]}>No active tasks. Tap "+ Add task" above.</Text>
              </View>
            )}
            {completed.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: t.t3 }]}>COMPLETED</Text>
                {completed.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: 20, paddingBottom: 24 },
  label:       { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:       { fontSize: 26, fontWeight: '900', color: '#fff' },
  addBtn:      { alignSelf: 'flex-start', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll:      { flex: 1 },
  content:     { paddingTop: 8, paddingBottom: 24 },
  form:        { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  input:       { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  pills:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill:        { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 4 },
  cancelText:  { fontSize: 13 },
  createBtn:   { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  createBtnText:{ color: '#fff', fontSize: 13, fontWeight: '700' },
  skeleton:    { marginHorizontal: 12, marginBottom: 8, height: 64, borderRadius: 16 },
  empty:       { marginHorizontal: 12, marginTop: 4, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyText:   { fontSize: 14, textAlign: 'center' },
  sectionLabel:{ marginHorizontal: 12, marginTop: 12, marginBottom: 4, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/tasks.tsx
git commit -m "feat(mobile): Tasks screen with category picker"
```

---

## Task 10: Live Activity helper + Focus screen

**Files:**
- Create: `apps/mobile/src/lib/live-activity.ts`
- Create: `apps/mobile/app/(tabs)/focus.tsx`

The Live Activity uses `@lodev09/react-native-live-activities`. This package requires EAS Build (it uses native code — Expo Go will not work for this feature). The package auto-detects iOS and exports a no-op on Android.

Before running the build, install the package:
```bash
cd /Users/femenba/stable/apps/mobile
npx expo install @lodev09/react-native-live-activities
```

- [ ] **Step 1: Create `apps/mobile/src/lib/live-activity.ts`**

```ts
import { Platform } from 'react-native'

interface LiveActivityPayload {
  sessionId: string
  taskName: string
  startedAt: string   // ISO timestamp
}

let ActivityModule: any = null

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ActivityModule = require('@lodev09/react-native-live-activities').LiveActivities
  } catch (_) {
    // package not installed yet — no-op
  }
}

export async function startLiveActivity(payload: LiveActivityPayload): Promise<string | null> {
  if (!ActivityModule) return null
  try {
    const id = await ActivityModule.startActivity('FocusTimerActivity', {
      sessionId:   payload.sessionId,
      taskName:    payload.taskName,
      startedAt:   payload.startedAt,
    })
    return id as string
  } catch {
    return null
  }
}

export async function endLiveActivity(activityId: string): Promise<void> {
  if (!ActivityModule || !activityId) return
  try {
    await ActivityModule.endActivity(activityId)
  } catch (_) {}
}
```

- [ ] **Step 2: Create `apps/mobile/app/(tabs)/focus.tsx`**

```tsx
import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, AppState, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import { trpc } from '@/lib/trpc-client'
import { useTheme } from '@/lib/use-theme'
import { startLiveActivity, endLiveActivity } from '@/lib/live-activity'

function formatDuration(startedAt: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <>{formatDuration(startedAt)}</>
}

// Android foreground notification for active session
async function showAndroidTimerNotification(taskName: string) {
  if (Platform.OS !== 'android') return
  await Notifications.scheduleNotificationAsync({
    identifier: 'focus-session',
    content: {
      title: 'Focus session in progress',
      body:  taskName,
      sticky: true,
      autoDismiss: false,
    },
    trigger: null,
  })
}

async function dismissAndroidTimerNotification() {
  if (Platform.OS !== 'android') return
  await Notifications.dismissNotificationAsync('focus-session')
}

export default function FocusScreen() {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const utils  = trpc.useUtils()
  const params = useLocalSearchParams<{ taskId?: string; taskName?: string }>()
  const liveActivityId = useRef<string | null>(null)

  const { data: sessions, isLoading } = trpc.focusSessions.list.useQuery({ limit: 10 })

  const start = trpc.focusSessions.start.useMutation({
    onSuccess: async (session) => {
      utils.focusSessions.list.invalidate()
      const name = params.taskName ?? 'Focus session'
      // iOS: Live Activity
      liveActivityId.current = await startLiveActivity({
        sessionId: session.id,
        taskName:  name,
        startedAt: session.startedAt,
      })
      // Android: foreground notification
      await showAndroidTimerNotification(name)
    },
  })

  const end = trpc.focusSessions.end.useMutation({
    onSuccess: async () => {
      utils.focusSessions.list.invalidate()
      if (liveActivityId.current) {
        await endLiveActivity(liveActivityId.current)
        liveActivityId.current = null
      }
      await dismissAndroidTimerNotification()
    },
  })

  const activeSession = sessions?.find((s) => s.endedAt === null) ?? null
  const pastSessions  = sessions?.filter((s) => s.endedAt !== null) ?? []

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.label}>FOCUS MODE</Text>
        <Text style={styles.title}>Focus</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Timer card */}
        <View style={[styles.timerCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          {activeSession ? (
            <>
              <Text style={[styles.timer, { color: '#4f3aff' }]}>
                <ElapsedTimer startedAt={activeSession.startedAt} />
              </Text>
              <Text style={[styles.timerSub, { color: t.t2 }]}>Focus session in progress</Text>
              <View style={styles.timerActions}>
                <TouchableOpacity
                  onPress={() => end.mutate({ id: activeSession.id, completed: true })}
                  disabled={end.isPending}
                  style={{ opacity: end.isPending ? 0.5 : 1 }}
                >
                  <LinearGradient
                    colors={[t.ctaStart, t.ctaEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.endBtn}
                  >
                    <Text style={styles.endBtnText}>End session ✓</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => end.mutate({ id: activeSession.id, completed: false })}
                  disabled={end.isPending}
                  style={[styles.abandonBtn, { borderColor: t.cardBorder, opacity: end.isPending ? 0.5 : 1 }]}
                >
                  <Text style={[styles.abandonBtnText, { color: t.t2 }]}>Abandon</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.timer, { color: t.t3 }]}>00:00</Text>
              <Text style={[styles.timerSub, { color: t.t2 }]}>Ready to focus</Text>
              <TouchableOpacity
                onPress={() => start.mutate({ taskId: params.taskId ?? undefined })}
                disabled={start.isPending}
                style={{ opacity: start.isPending ? 0.5 : 1, marginTop: 24 }}
              >
                <LinearGradient
                  colors={[t.ctaStart, t.ctaEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startBtn}
                >
                  <Text style={styles.startBtnText}>▶ Start session</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Session history */}
        <Text style={[styles.historyLabel, { color: t.t3 }]}>RECENT SESSIONS</Text>
        {isLoading ? (
          [0, 1].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.card }]} />
          ))
        ) : !pastSessions.length ? (
          <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.emptyText, { color: t.t3 }]}>No completed sessions yet.</Text>
          </View>
        ) : (
          pastSessions.map((s) => (
            <View key={s.id} style={[styles.sessionRow, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <View>
                <Text style={[styles.sessionDate, { color: t.t1 }]}>
                  {new Date(s.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </Text>
                <Text style={[styles.sessionTime, { color: t.t2 }]}>
                  {new Date(s.startedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                  {s.endedAt ? ` → ${new Date(s.endedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}` : ''}
                </Text>
              </View>
              <View style={styles.sessionRight}>
                <Text style={[styles.sessionDuration, { color: t.t1 }]}>
                  {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                </Text>
                <Text style={[styles.sessionStatus, { color: s.completed ? '#0891b2' : t.t3 }]}>
                  {s.completed ? 'Completed' : 'Abandoned'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { paddingHorizontal: 20, paddingBottom: 24 },
  label:          { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:          { fontSize: 26, fontWeight: '900', color: '#fff' },
  scroll:         { flex: 1 },
  content:        { paddingTop: 12, paddingBottom: 24 },
  timerCard:      { marginHorizontal: 12, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  timer:          { fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerSub:       { fontSize: 13, marginTop: 6 },
  timerActions:   { flexDirection: 'row', gap: 12, marginTop: 24 },
  endBtn:         { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  endBtnText:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  abandonBtn:     { borderRadius: 14, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 14 },
  abandonBtnText: { fontSize: 14, fontWeight: '600' },
  startBtn:       { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  startBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  historyLabel:   { marginHorizontal: 12, marginTop: 20, marginBottom: 6, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  skeleton:       { marginHorizontal: 12, marginBottom: 8, height: 56, borderRadius: 16 },
  empty:          { marginHorizontal: 12, borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyText:      { fontSize: 14 },
  sessionRow:     { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionDate:    { fontSize: 14, fontWeight: '600' },
  sessionTime:    { fontSize: 11, marginTop: 2 },
  sessionRight:   { alignItems: 'flex-end' },
  sessionDuration:{ fontSize: 14, fontWeight: '700' },
  sessionStatus:  { fontSize: 11, marginTop: 2 },
})
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/live-activity.ts apps/mobile/app/\(tabs\)/focus.tsx
git commit -m "feat(mobile): Focus screen with timer, Live Activity (iOS), Android notification"
```

---

## Task 11: Notifications helper + Reminders screen

**Files:**
- Create: `apps/mobile/src/lib/notifications.ts`
- Create: `apps/mobile/app/(tabs)/reminders.tsx`

- [ ] **Step 1: Create `apps/mobile/src/lib/notifications.ts`**

```ts
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
})

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleReminderNotification(
  reminderId: string,
  remindAt: string,  // ISO timestamp
  type: string,
): Promise<string | null> {
  const date = new Date(remindAt)
  if (date <= new Date()) return null   // already past
  const granted = await requestNotificationPermissions()
  if (!granted) return null
  const notifId = await Notifications.scheduleNotificationAsync({
    identifier: `reminder-${reminderId}`,
    content: {
      title: 'stable. Reminder',
      body:  `Time for your ${type} reminder`,
      data:  { reminderId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  })
  return notifId
}

export async function cancelReminderNotification(reminderId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`reminder-${reminderId}`)
}
```

- [ ] **Step 2: Create `apps/mobile/app/(tabs)/reminders.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { trpc } from '@/lib/trpc-client'
import { useTheme } from '@/lib/use-theme'
import { scheduleReminderNotification, cancelReminderNotification, requestNotificationPermissions } from '@/lib/notifications'

export default function RemindersScreen() {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const utils  = trpc.useUtils()
  const [showForm, setShowForm] = useState(false)
  const [remindAt, setRemindAt] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [type, setType] = useState<'once' | 'repeating'>('once')

  useEffect(() => { requestNotificationPermissions() }, [])

  const { data: reminders, isLoading } = trpc.reminders.listUpcoming.useQuery()
  const create = trpc.reminders.create.useMutation({
    onSuccess: async (reminder) => {
      utils.reminders.listUpcoming.invalidate()
      await scheduleReminderNotification(reminder.id, reminder.remindAt, reminder.type)
      setShowForm(false)
      setRemindAt(new Date())
    },
  })
  const dismiss = trpc.reminders.dismiss.useMutation({
    onSuccess: async (_, vars) => {
      utils.reminders.listUpcoming.invalidate()
      await cancelReminderNotification(vars.id)
    },
  })
  const snooze = trpc.reminders.snooze.useMutation({
    onSuccess: async (reminder) => {
      utils.reminders.listUpcoming.invalidate()
      await cancelReminderNotification(reminder.id)
      await scheduleReminderNotification(reminder.id, reminder.remindAt, reminder.type)
    },
  })

  function handleSnooze30(id: string) {
    const t = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    snooze.mutate({ id, remindAt: t })
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.label}>YOUR REMINDERS</Text>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity onPress={() => setShowForm((v) => !v)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add reminder</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Create form */}
        {showForm && (
          <View style={[styles.form, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.formLabel, { color: t.t2 }]}>Remind at</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={[styles.dateBtn, { backgroundColor: t.bg, borderColor: t.cardBorder }]}
            >
              <Text style={[styles.dateBtnText, { color: t.t1 }]}>
                {remindAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={remindAt}
                mode="datetime"
                minimumDate={new Date()}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_, date) => {
                  setShowPicker(Platform.OS === 'ios')
                  if (date) setRemindAt(date)
                }}
              />
            )}
            {/* Type picker */}
            <View style={styles.pills}>
              {(['once', 'repeating'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setType(opt)}
                  style={[styles.pill, {
                    backgroundColor: type === opt ? 'rgba(99,102,241,0.12)' : t.bg,
                    borderColor:     type === opt ? '#4f3aff' : t.cardBorder,
                  }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: type === opt ? '#4f3aff' : t.t2, textTransform: 'capitalize' }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={[styles.cancelText, { color: t.t2 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => create.mutate({ remindAt: remindAt.toISOString(), type })}
                disabled={create.isPending}
                style={[styles.createBtn, { backgroundColor: '#4f3aff', opacity: create.isPending ? 0.5 : 1 }]}
              >
                <Text style={styles.createBtnText}>{create.isPending ? '...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reminder list */}
        {isLoading ? (
          [0, 1].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.card }]} />
          ))
        ) : !reminders?.length ? (
          <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.emptyText, { color: t.t3 }]}>No upcoming reminders.</Text>
          </View>
        ) : (
          reminders.map((r) => (
            <View key={r.id} style={[styles.reminderRow, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <View style={[styles.accent, { backgroundColor: '#be185d' }]} />
              <View style={styles.reminderInfo}>
                <Text style={[styles.reminderTime, { color: t.t1 }]}>
                  {new Date(r.remindAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
                <Text style={[styles.reminderMeta, { color: t.t2 }]}>
                  {r.type}{r.snoozeCount > 0 ? ` · snoozed ${r.snoozeCount}×` : ''}
                </Text>
              </View>
              <View style={styles.reminderActions}>
                <TouchableOpacity
                  onPress={() => handleSnooze30(r.id)}
                  disabled={snooze.isPending}
                  style={[styles.actionBtn, { borderColor: t.cardBorder, opacity: snooze.isPending ? 0.4 : 1 }]}
                >
                  <Text style={[styles.actionText, { color: t.t2 }]}>+30m</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dismiss.mutate({ id: r.id })}
                  disabled={dismiss.isPending}
                  style={[styles.actionBtn, { borderColor: t.cardBorder, opacity: dismiss.isPending ? 0.4 : 1 }]}
                >
                  <Text style={[styles.actionText, { color: t.t3 }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { paddingHorizontal: 20, paddingBottom: 24 },
  label:          { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:          { fontSize: 26, fontWeight: '900', color: '#fff' },
  addBtn:         { alignSelf: 'flex-start', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll:         { flex: 1 },
  content:        { paddingTop: 8, paddingBottom: 24 },
  form:           { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  formLabel:      { fontSize: 12, fontWeight: '600' },
  dateBtn:        { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  dateBtnText:    { fontSize: 14 },
  pills:          { flexDirection: 'row', gap: 8 },
  pill:           { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  formActions:    { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  cancelText:     { fontSize: 13 },
  createBtn:      { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  createBtnText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  skeleton:       { marginHorizontal: 12, marginBottom: 8, height: 56, borderRadius: 16 },
  empty:          { marginHorizontal: 12, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyText:      { fontSize: 14 },
  reminderRow:    { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#be185d', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  accent:         { width: 3, height: 36, borderRadius: 2 },
  reminderInfo:   { flex: 1 },
  reminderTime:   { fontSize: 14, fontWeight: '600' },
  reminderMeta:   { fontSize: 11, marginTop: 2 },
  reminderActions:{ flexDirection: 'row', gap: 6 },
  actionBtn:      { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  actionText:     { fontSize: 11, fontWeight: '600' },
})
```

Note: `@react-native-community/datetimepicker` is included with Expo SDK 52 as `@react-native-community/datetimepicker`. Install it with:
```bash
npx expo install @react-native-community/datetimepicker
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/notifications.ts apps/mobile/app/\(tabs\)/reminders.tsx
git commit -m "feat(mobile): Reminders screen with local push notification scheduling"
```

---

## Task 12: Dev build smoke test

**Files:** None — verification only.

This task requires an EAS development build because `@lodev09/react-native-live-activities` uses native code not available in Expo Go. For basic UI testing (auth, tasks, reminders) Expo Go works fine. For Live Activity testing, a dev build on a physical iPhone is required.

- [ ] **Step 1: Install EAS CLI and log in**

```bash
npm install -g eas-cli
eas login
```

Expected: Prompts for Expo account credentials. Log in with your Expo account.

- [ ] **Step 2: Start Expo Go for basic testing (auth + all 4 screens)**

```bash
cd /Users/femenba/stable/apps/mobile
pnpm dev
```

Scan the QR code with the Expo Go app on your iPhone or Android.

Verify:
1. App opens to sign-in screen
2. Sign in with your existing stable. account
3. Today tab — AI Insight card + Next Focus suggestion + Top 3 tasks load
4. Tasks tab — create a task with Work category → indigo left border ✓
5. Focus tab — timer shows 00:00, Start session works, timer counts up
6. Reminders tab — create a reminder → appears in list
7. Dark/light mode: change device system setting → app colours update immediately

- [ ] **Step 3: Build development client for Live Activity testing (iOS physical device)**

```bash
cd /Users/femenba/stable/apps/mobile
eas build --profile development --platform ios
```

Expected: EAS Build queues the build. Takes ~10 minutes. A `.ipa` file is generated and can be installed on a registered device.

- [ ] **Step 4: Test Live Activity on physical iPhone (iOS 16.2+)**

Install the dev build via EAS on your iPhone. Open the app, go to Focus tab, tap "▶ Start session".

Verify:
- Lock the phone — lock screen shows a stable. Live Activity with the running timer
- Dynamic Island (iPhone 14 Pro+) shows compact timer view
- Tap "End session ✓" → Live Activity dismisses from lock screen

- [ ] **Step 5: Final commit**

```bash
cd /Users/femenba/stable
git add -A
git commit -m "feat: stable. Expo mobile app — Today, Tasks, Focus (Live Activity), Reminders"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 4-tab navigation: Expo Router tabs in Task 7
- ✅ Authentication via Clerk: Tasks 4 + 5
- ✅ tRPC API client: Task 3
- ✅ iOS Live Activity: Task 10 (`live-activity.ts` + Focus screen)
- ✅ Android foreground notification (focus timer): Task 10 (`showAndroidTimerNotification`)
- ✅ Local push notifications for reminders: Task 11 (`notifications.ts`)
- ✅ Light/dark theme via `useColorScheme()`: Task 2
- ✅ Today: AI Insight, Top 3, Next Focus card, CTA: Tasks 6 + 8
- ✅ Tasks: full list, category picker, complete/delete: Tasks 6 + 9
- ✅ Focus: timer, session history, Live Activity: Task 10
- ✅ Reminders: list, create, snooze, dismiss, push scheduling: Task 11
- ✅ Next Focus card picks task from `listTopThree[0]` and navigates to Focus with taskId param: Tasks 6 + 8
- ✅ EAS Build config: Tasks 1 + 12
- ✅ Monorepo scaffold: Task 1

**Placeholder scan:** No TBDs. All steps include complete code.

**Type consistency:**
- `trpc.focusSessions.start.useMutation` — `start` procedure in the router accepts `{ taskId?: string }` — check: the existing `focusSessions` router `start` procedure must accept an optional `taskId`. If it doesn't, add it: `.input(z.object({ taskId: z.string().uuid().optional() }))` in `apps/api/src/routers/focusSessions.ts` before running the mobile app.
- `trpc.reminders.snooze` mutation returns a `Reminder` object — the `snooze` procedure must return the updated reminder (not just `{ success: true }`). Verify in `apps/api/src/routers/reminders.ts` that it returns the updated row.
