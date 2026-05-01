# stable. Expo Mobile App Design Spec

## Goal

Build a native iOS + Android mobile app for stable. using Expo Router, sharing the same backend (tRPC + Supabase) and auth (Clerk) as the existing Next.js web app. The mobile app adds iOS Live Activities (lock screen focus timer) and local push notifications for reminders — features impossible in the web app.

## Scope

**In scope (Phase 1 — this spec):**
- 4-tab navigation: Today, Tasks, Focus, Reminders
- Authentication via Clerk native SDK
- tRPC API client connecting to existing Vercel backend
- iOS Live Activity + Dynamic Island for the focus timer
- Android foreground notification for the focus timer
- Local push notifications for reminders (iOS + Android)
- Light/dark theme following device system setting

**Out of scope (Phase 2 — separate spec):**
- Mind tab: Mindfulness (breathing, mood check-in, guided meditation)
- All 4 DBT modules (Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness)
- App Store / Google Play submission steps

---

## Architecture

**Framework:** Expo SDK 52, Expo Router (file-based navigation), TypeScript  
**Monorepo location:** `apps/mobile/` — added as a pnpm workspace package  
**Shared types:** `@stable/shared` (Task, TaskCategory, Reminder, FocusSession) — zero changes  
**Backend:** Existing tRPC API on Vercel — zero changes required  
**Auth:** `@clerk/clerk-expo` — same Clerk project, same users as the web app. JWT token injected as `Authorization: Bearer <token>` header on every tRPC request.  
**API client:** `@trpc/client` + `@tanstack/react-query` (same pattern as web, no server-side rendering concerns)  
**Live Activity:** `expo-live-activities` (iOS 16.2+, requires custom native module build via EAS)  
**Push notifications:** `expo-notifications` (local scheduling, no server-side push infra needed in Phase 1)

---

## Design Tokens

Same colour values as the web app, defined as a plain `theme.ts` object (no CSS variables on mobile):

```ts
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
    header:     ['#4f3aff', '#7c3aed', '#c026d3'], // gradient stops
    cta:        ['#4f3aff', '#7c3aed'],
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
    header:     ['#1e1260', '#120e24'],
    cta:        ['#6366f1', '#a855f7'],
  },
  cat: {
    work:     { light: '#4f3aff', dark: '#6366f1' },
    personal: { light: '#7c3aed', dark: '#a855f7' },
    family:   { light: '#be185d', dark: '#ec4899' },
    health:   { light: '#0891b2', dark: '#22d3ee' },
    other:    { light: '#6b7280', dark: '#9ca3af' },
  },
}
```

Theme is selected via `useColorScheme()` from React Native. No manual toggle — the device system setting controls it.

---

## File Structure

```
apps/mobile/
  app/
    _layout.tsx                  # Root: ClerkProvider + tRPC provider + theme
    (auth)/
      _layout.tsx                # Redirects signed-in users to tabs
      sign-in.tsx                # Clerk sign-in screen
      sign-up.tsx                # Clerk sign-up screen
    (tabs)/
      _layout.tsx                # Bottom tab bar (4 tabs)
      index.tsx                  # Today screen
      tasks.tsx                  # Tasks screen
      focus.tsx                  # Focus timer screen
      reminders.tsx              # Reminders screen
  src/
    components/
      task-card.tsx              # Task card with category colour border
      ai-insight.tsx             # STABLE AI static card
      next-focus-card.tsx        # "Next Focus Session" suggestion card
      screen-header.tsx          # Gradient header + page title (shared)
    lib/
      trpc-client.ts             # tRPC client pointing to Vercel API URL
      theme.ts                   # Design tokens (colours, gradients)
      use-theme.ts               # useTheme() hook wrapping useColorScheme
      notifications.ts           # Schedule / cancel local push notifications
      live-activity.ts           # Start / update / end Live Activity (iOS only)
  assets/
    icon.png
    splash.png
  app.json                       # Expo config (bundleId, permissions)
  package.json
  tsconfig.json
  eas.json                       # EAS Build config
```

---

## Screens

### Auth

Two screens under `(auth)/`. If the user is already signed in (Clerk session exists), the `(auth)/_layout.tsx` redirects immediately to `/(tabs)/`. Clerk's `<SignIn />` and `<SignUp />` components handle the full flow including email verification.

### Today (`(tabs)/index.tsx`)

Layout top to bottom:

1. **Gradient header** — `LinearGradient` with page title "Three things. That's it." and day-of-week label
2. **AI Insight card** — static STABLE AI tip (same text as web)
3. **Top 3 task cards** — from `trpc.tasks.listTopThree` — coloured left border by category, category tag, duration if set
4. **Next Focus Session card** — picks the single task with lowest priority number, earliest due date, then earliest created date among `status: pending | in_progress`. Shows task title, category tag, due date. "▶ Start Focus" button navigates to Focus tab and auto-starts a session with that task's ID pre-filled.
5. **General "Start focus session" CTA** — gradient button → Focus tab (no task pre-selected)

If no tasks exist, show an empty state card linking to Tasks tab.

### Tasks (`(tabs)/tasks.tsx`)

- Gradient header, "+ Add task" button
- Collapsible create form: title input, category picker (Work / Personal / Family / Health / Other), priority picker (High / Medium / Low)
- Task list split into pending and completed sections
- Each task rendered with `<TaskCard>` (complete + delete actions)
- `trpc.tasks.list` for the list, `trpc.tasks.create` / `complete` / `delete` for mutations

### Focus (`(tabs)/focus.tsx`)

**Active session:**
- Large mono timer showing elapsed time (calculated from `startedAt`, ticking every second)
- "End session ✓" and "Abandon" buttons
- On session start: call `live-activity.ts` to launch Live Activity (iOS) or show foreground notification (Android)
- On session end/abandon: dismiss Live Activity / notification

**No active session:**
- "00:00" placeholder timer
- "▶ Start session" gradient button → calls `trpc.focusSessions.start`, then starts Live Activity
- If navigated from the "Next Focus Session" card, the task ID is passed as a route param and pre-selected

**Session history list** — past sessions from `trpc.focusSessions.list({ limit: 10 })`, showing date, duration, completed/abandoned status

**Live Activity payload (iOS):**
```ts
{
  sessionId: string
  taskName: string        // task title, or "Focus session" if no task
  startedAt: string       // ISO timestamp
}
```
The widget displays elapsed time computed on-device from `startedAt`.

### Reminders (`(tabs)/reminders.tsx`)

- Gradient header, "+ Add reminder" button
- Create form: datetime picker, type (Once / Repeating)
- On create: call `trpc.reminders.create` then `notifications.ts` to schedule a local push notification for `remindAt`
- Reminder list from `trpc.reminders.listUpcoming`
- Each row: date/time, type, snooze count. Snooze (+30 min) updates DB via `trpc.reminders.snooze` and reschedules the notification. Dismiss calls `trpc.reminders.dismiss` and cancels the notification.
- Tapping a push notification when app is closed/backgrounded deep-links to the Reminders tab via Expo Router's notification response handler

---

## Live Activity (iOS)

`expo-live-activities` requires a separate native Swift widget extension built with EAS. The extension shows:

- Elapsed time (computed from `startedAt` in the payload, updated on-device)
- Task name (truncated to 30 chars)
- "stable." branding

The extension is bundled into the EAS build — no separate App Store submission needed. It requires iOS 16.2+ and an iPhone running any model (Dynamic Island only on iPhone 14 Pro+).

On Android there is no equivalent API. Instead, when a focus session starts, `expo-notifications` shows a sticky foreground notification: "Focus session in progress — 00:00" that updates every 5 seconds via a JS interval that calls `Notifications.setNotificationHandler`.

---

## Push Notifications

`expo-notifications` is used for **local** scheduling only — no server-side push infra needed in Phase 1.

Permissions are requested once on first launch of the Reminders tab. On iOS, this shows the system permission dialog. On Android 13+, `POST_NOTIFICATIONS` permission is requested.

Each reminder gets a notification ID stored in memory (keyed by reminderId). On snooze, the existing notification is cancelled and a new one scheduled. On dismiss, notification is cancelled.

---

## tRPC Client

```ts
// src/lib/trpc-client.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { useAuth } from '@clerk/clerk-expo'

export function createClient(getToken: () => Promise<string | null>) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: process.env.EXPO_PUBLIC_API_URL + '/api/trpc',
        async headers() {
          const token = await getToken()
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      }),
    ],
  })
}
```

`EXPO_PUBLIC_API_URL` is set to the Vercel production URL in `.env` and `eas.json`.

---

## Environment Variables

```
EXPO_PUBLIC_API_URL=https://api-sooty-two-41.vercel.app
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

Both are public (prefixed `EXPO_PUBLIC_`) — no server secrets on the mobile client.

---

## EAS Build

`eas.json` defines three profiles:

| Profile | Purpose |
|---|---|
| `development` | Local dev build with Expo Go incompatible modules (live-activities) |
| `preview` | Internal TestFlight / Android internal track distribution |
| `production` | App Store / Google Play submission |

Live Activities require `development` or `production` build — they do not work in Expo Go.

---

## Success Criteria

1. Sign in with Clerk on iOS and Android — same account as web app
2. Today tab shows top 3 tasks and Next Focus suggestion card; tapping "▶ Start Focus" navigates to Focus and starts a session
3. Tasks tab: create a task with category, see coloured card; complete and delete work
4. Focus tab: start a session → iOS lock screen shows Live Activity with running timer; end session → Live Activity dismissed
5. Reminders tab: create a reminder → local notification fires at the correct time; snooze and dismiss work
6. Light/dark theme follows device system setting with correct colours on both platforms

---

## Phase 2 Note

After the core app ships, a separate spec will cover the **Mind tab**:
- Mindfulness: breathing exercises (box breathing, 4-7-8, etc.), daily mood check-in, short guided meditation prompts
- DBT Module 1: Mindfulness skills (observe, describe, participate)
- DBT Module 2: Distress Tolerance (TIPP, STOP, ACCEPTS)
- DBT Module 3: Emotion Regulation (PLEASE, opposite action, check the facts)
- DBT Module 4: Interpersonal Effectiveness (DEAR MAN, GIVE, FAST)
- New DB tables: `mood_entries`, `dbt_practice_logs`
