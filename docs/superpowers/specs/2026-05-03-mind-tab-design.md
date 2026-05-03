# Mind Tab — Breathing & Mood Implementation Spec

> **Spec 1 of 2.** Spec 2 (DBT Skills modules) follows after this ships.

## Goal

Add a **Mind tab** (5th tab) to the stable. mobile app with guided breathing exercises and a daily mood + energy check-in. Users can personalise the visual theme, layout style, and breathing animation. Mood data syncs to the backend; breathing and preferences are local-only.

## Architecture

**Framework:** Expo Router file-based navigation — new screens added under `app/(tabs)/mind/`.
**Preferences:** AsyncStorage (`stable:mind-prefs`) — theme, layout, breathing style, reminder time.
**Mood data:** Synced to Supabase via new `mood_entries` table and `moodEntries` tRPC router.
**Notifications:** Daily mood reminder via `expo-notifications` local scheduling (existing setup).
**Breathing:** Purely local — no backend, no persistence of session data.

---

## Data Model

### New table: `mood_entries`

```sql
CREATE TABLE mood_entries (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  energy     INTEGER CHECK (energy BETWEEN 1 AND 5),
  note       TEXT,
  tags       TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

One row per check-in. No edit/update — if user checks in twice in a day, both rows exist and the latest is shown in the UI.

**Tag values (fixed list):** `focused` · `calm` · `anxious` · `overwhelmed` · `sad` · `irritable` · `motivated` · `tired`

---

## Backend

### New tRPC router: `moodEntries`

Three procedures, all require authenticated user:

| Procedure | Input | Returns |
|---|---|---|
| `log` | `{ rating, energy?, note?, tags? }` | inserted entry |
| `today` | — | today's entry or `null` |
| `history` | `{ limit?: number }` (default 7) | array of entries, newest first |

`today` uses `DATE(created_at) = CURRENT_DATE` filtered by `user_id`.

`history` returns `id`, `rating`, `energy`, `tags`, `created_at` — no `note` needed in the list view.

---

## File Structure

```
apps/mobile/
  app/(tabs)/
    _layout.tsx                     # ADD: Mind tab (🧘, label "Mind")
    mind.tsx                        # Mind home screen (card hub)
    mind/
      breathe.tsx                   # Full-screen breathing session
      mood.tsx                      # Mood check-in + 7-day history
      personalise.tsx               # Theme / layout / animation pickers

  src/
    components/
      mind/
        breathing-engine.tsx        # Phase state machine — exposes { phase, progress, tick }
        breathing-circle.tsx        # Animated expanding/contracting circle
        breathing-countdown.tsx     # Simple number countdown with phase label
        breathing-arc.tsx           # Arc that fills as phase progresses
        breathing-blob.tsx          # Abstract animated blob (Lottie or Reanimated)
        mood-emoji-row.tsx          # 1–5 emoji rating row (used for both mood + energy)
        mood-tag-picker.tsx         # Multi-select chip grid
        mood-history-row.tsx        # 7-day strip of emoji dots
        mind-card.tsx               # Reusable hub card (icon, title, subtitle, chevron)

    lib/
      use-mind-prefs.ts             # AsyncStorage hook: read/write stable:mind-prefs
      breathing-exercises.ts        # Exercise definitions (phases + durations)
      mind-themes.ts                # Colour tokens for 4 Mind themes
```

---

## Preferences Schema (`stable:mind-prefs`)

```ts
type MindPrefs = {
  theme:                  'minimal' | 'night' | 'forest' | 'ocean'
  layout:                 'cards' | 'scroll' | 'tabs'
  breathStyle:            'circle' | 'countdown' | 'arc' | 'blob'
  reminderTime:           { hour: number; minute: number } | null
  reminderNotificationId: string | null
}

const DEFAULTS: MindPrefs = {
  theme:                  'minimal',
  layout:                 'cards',
  breathStyle:            'circle',
  reminderTime:           null,
  reminderNotificationId: null,
}
```

---

## Mind Themes (`mind-themes.ts`)

| Token | Minimal | Night | Forest | Ocean |
|---|---|---|---|---|
| `bg` | `#fafafe` | `#0d0d1a` | `#f0faf0` | `#f0f8ff` |
| `card` | `#ffffff` | `#1a1535` | `#ffffff` | `#ffffff` |
| `accent` | `#4f3aff` | `#6366f1` | `#16a34a` | `#0891b2` |
| `accentSoft` | `rgba(79,58,255,0.08)` | `rgba(99,102,241,0.15)` | `rgba(22,163,74,0.08)` | `rgba(8,145,178,0.08)` |
| `t1` | `#111111` | `#e2d9f3` | `#14532d` | `#0c4a6e` |
| `t2` | `#888888` | `#8b7ab8` | `#166534` | `#075985` |
| `t3` | `#cccccc` | `#3a2f5a` | `#bbf7d0` | `#bae6fd` |

---

## Breathing Exercises (`breathing-exercises.ts`)

```ts
type Phase = { label: string; duration: number }  // duration in seconds

type BreathingExercise = {
  id:     string
  name:   string
  phases: Phase[]  // cycles through phases in order, loops indefinitely
}

export const EXERCISES: BreathingExercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    phases: [
      { label: 'Inhale',    duration: 4 },
      { label: 'Hold',      duration: 4 },
      { label: 'Exhale',    duration: 4 },
      { label: 'Hold',      duration: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8',
    phases: [
      { label: 'Inhale',    duration: 4 },
      { label: 'Hold',      duration: 7 },
      { label: 'Exhale',    duration: 8 },
    ],
  },
]
```

---

## Screens

### Mind Home (`mind.tsx`)

**Default layout: Cards**

- Gradient header (uses current Mind theme accent colours): title "Mind", subtitle "Breathe. Check in. Be present."
- Personalise button (top-right, gear icon) → navigates to `mind/personalise`
- Two `<MindCard>` components:
  - **Breathe** — icon 🫁, subtitle shows selected exercise name, chevron → `mind/breathe`
  - **Mood** — icon 🌡, subtitle shows today's rating if logged ("Today: 😊") or "Check in", chevron → `mind/mood`
  - **DBT Skills** — dashed border, icon 🧠, subtitle "Coming soon", non-tappable placeholder for Spec 2
- Layout switches to scrollable single column or horizontal tabs based on `prefs.layout`

### Breathe Screen (`mind/breathe.tsx`)

1. Exercise selector at top: two chips (Box · 4-7-8), selected chip highlighted in theme accent
2. Full-screen animation area — renders one of four components based on `prefs.breathStyle`, all receive `{ phase, progress }` from `<BreathingEngine>`
3. Phase label + countdown number centred below animation
4. **Start / Pause / Stop** controls at bottom
5. Session runs until user taps Stop — no fixed duration
6. Back button top-left always available — no confirmation

**`breathing-engine.tsx`** manages the state machine:
- States: `idle` → `inhale` → `hold_in` → `exhale` → `hold_out` → (loop)
- Exposes `{ phase, progress, isRunning, start, pause, stop }` via render props or context
- `progress` is 0→1 within the current phase (used by animation components)
- Uses `setInterval` (1 second tick) + phase duration from selected exercise

### Mood Screen (`mood.tsx`)

**Check-in section (top):**

1. **Mood row** — `<MoodEmojiRow>` with labels: 😔 😕 😐 🙂 😊 (1–5)
2. **Energy row** — `<MoodEmojiRow>` with labels: 🪫 🔋 🔋 ⚡ ⚡ (1–5), skippable
3. **Tag picker** — `<MoodTagPicker>` with the 8 fixed tags as multi-select chips, skippable
4. **Note input** — single-line text field, placeholder "Anything on your mind?", skippable
5. **Log mood** button — disabled until mood rating is selected. On tap: calls `moodEntries.log`, shows brief success state

If `today` query returns an entry, check-in section shows "Already checked in today 😊" with the logged values and an "Update" button that re-submits (creates a new row).

**First visit:** If `prefs.reminderTime` is null, show a banner: "Get a daily reminder?" with a time picker and "Set reminder" button. Dismissible.

**History section (bottom):**

- Section label "Last 7 days"
- `<MoodHistoryRow>` — a horizontal strip of 7 dots. Each dot shows the mood emoji for that day, or `–` if no entry. Tapping a dot shows a small popover with that day's full entry (rating, energy, tags, note).

### Personalise Screen (`personalise.tsx`)

Four rows, each a horizontal scroll of selectable chips:

| Row | Options |
|---|---|
| Theme | Minimal · Night · Forest · Ocean |
| Layout | Cards · Scroll · Tabs |
| Breathing style | Circle · Countdown · Arc · Blob |
| Mood reminder | Off · [time picker] |

- Changes write to `stable:mind-prefs` instantly via `use-mind-prefs`
- No save button
- Theme change re-renders the whole Mind tab immediately
- Reminder row: tapping a time opens `DateTimePicker` (time mode). On confirm: cancels any existing notification, schedules new daily repeating notification at chosen time, saves to prefs. "Off" cancels the notification.

---

## Notification

Scheduled with `expo-notifications` when user sets a reminder time:

```ts
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'stable. · Mind check-in',
    body:  'How are you feeling today?',
    data:  { screen: 'mind/mood' },
  },
  trigger: {
    type:    SchedulableTriggerInputTypes.DAILY,
    hour:    time.hour,
    minute:  time.minute,
    repeats: true,
  },
})
```

Notification ID stored in `stable:mind-prefs` as `reminderNotificationId`. Cancelled via `Notifications.cancelScheduledNotificationAsync(id)` before rescheduling or when set to "Off".

---

## Tab Bar Update

`app/(tabs)/_layout.tsx` gets a 5th `<Tabs.Screen>`:

```tsx
<Tabs.Screen
  name="mind"
  options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🧘" label="Mind" focused={focused} /> }}
/>
```

---

## Success Criteria

1. Mind tab appears as 5th tab — tapping it opens the card home
2. Breathe: start box breathing session → animated circle guides through 4-4-4-4 phases in a loop → stop ends session
3. Breathe: switch to 4-7-8 → phases update correctly (4-7-8, no hold-out)
4. Breathe: switch animation style in Personalise → breathing screen immediately uses new style
5. Mood: log a check-in with rating + energy + tags → appears in today query and history row
6. Mood: set daily reminder → notification fires at the chosen time
7. Personalise: switch theme to Forest → Mind tab turns green throughout
8. Personalise: switch layout to Scroll → Mind home becomes a single scrollable screen

---

## Out of Scope (Spec 2)

- DBT Skills modules (Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness)
- `dbt_practice_logs` DB table
- Mood analytics beyond 7-day history (trends, charts, insights)
- Custom breathing exercise creation
