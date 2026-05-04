// apps/mobile/app/(tabs)/mind/personalise.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import { useMindPrefs, type MindThemeKey, type MindLayoutKey, type BreathStyleKey } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'
import { requestNotificationPermissions } from '@/lib/notifications'

type Row<T extends string> = { label: string; value: T; emoji: string }

const THEME_OPTIONS: Row<MindThemeKey>[] = [
  { label: 'Minimal', value: 'minimal', emoji: '🤍' },
  { label: 'Night',   value: 'night',   emoji: '🌙' },
  { label: 'Forest',  value: 'forest',  emoji: '🌿' },
  { label: 'Ocean',   value: 'ocean',   emoji: '🌊' },
]

const LAYOUT_OPTIONS: Row<MindLayoutKey>[] = [
  { label: 'Cards',  value: 'cards',  emoji: '🃏' },
  { label: 'Scroll', value: 'scroll', emoji: '📜' },
  { label: 'Tabs',   value: 'tabs',   emoji: '📑' },
]

const BREATH_OPTIONS: Row<BreathStyleKey>[] = [
  { label: 'Circle',    value: 'circle',    emoji: '⭕' },
  { label: 'Countdown', value: 'countdown', emoji: '🔢' },
  { label: 'Arc',       value: 'arc',       emoji: '🌀' },
  { label: 'Blob',      value: 'blob',      emoji: '💜' },
]

export default function PersonaliseScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { prefs, updatePrefs } = useMindPrefs()
  const mt      = MIND_THEMES[prefs.theme]

  const [showPicker, setShowPicker] = useState(false)
  const reminderDate = prefs.reminderTime
    ? new Date(new Date().setHours(prefs.reminderTime.hour, prefs.reminderTime.minute, 0, 0))
    : new Date()

  async function handleSetReminder(date: Date) {
    setShowPicker(false)
    const granted = await requestNotificationPermissions()
    if (!granted) return

    if (prefs.reminderNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(prefs.reminderNotificationId)
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'stable. · Mind check-in',
        body:  'How are you feeling today?',
        data:  { screen: 'mind/mood' },
      },
      trigger: {
        type:    Notifications.SchedulableTriggerInputTypes.DAILY,
        hour:    date.getHours(),
        minute:  date.getMinutes(),
        repeats: true,
      },
    })

    updatePrefs({
      reminderTime:           { hour: date.getHours(), minute: date.getMinutes() },
      reminderNotificationId: id,
    })
  }

  async function handleClearReminder() {
    if (prefs.reminderNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(prefs.reminderNotificationId)
    }
    updatePrefs({ reminderTime: null, reminderNotificationId: null })
  }

  const cardBorder = `${mt.t3}88`

  function renderRow<T extends string>(
    label: string,
    options: Row<T>[],
    current: T,
    onSelect: (v: T) => void,
  ) {
    return (
      <View style={styles.rowSection}>
        <Text style={[styles.rowLabel, { color: mt.t3 }]}>{label}</Text>
        <View style={styles.chips}>
          {options.map((opt) => {
            const active = current === opt.value
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? mt.accentSoft : 'transparent',
                    borderColor:     active ? mt.accent : cardBorder,
                  },
                ]}
              >
                <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.chipLabel, { color: active ? mt.accent : mt.t2 }]}>{opt.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: mt.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: mt.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: mt.t1 }]}>Personalise</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        {renderRow('Theme', THEME_OPTIONS, prefs.theme, (v) => updatePrefs({ theme: v }))}
        {renderRow('Layout', LAYOUT_OPTIONS, prefs.layout, (v) => updatePrefs({ layout: v }))}
        {renderRow('Breathing style', BREATH_OPTIONS, prefs.breathStyle, (v) => updatePrefs({ breathStyle: v }))}

        {/* Reminder row */}
        <View style={styles.rowSection}>
          <Text style={[styles.rowLabel, { color: mt.t3 }]}>Mood reminder</Text>
          <View style={styles.chips}>
            <TouchableOpacity
              onPress={handleClearReminder}
              style={[
                styles.chip,
                {
                  backgroundColor: !prefs.reminderTime ? mt.accentSoft : 'transparent',
                  borderColor:     !prefs.reminderTime ? mt.accent : cardBorder,
                },
              ]}
            >
              <Text style={[styles.chipLabel, { color: !prefs.reminderTime ? mt.accent : mt.t2 }]}>Off</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={[
                styles.chip,
                {
                  backgroundColor: prefs.reminderTime ? mt.accentSoft : 'transparent',
                  borderColor:     prefs.reminderTime ? mt.accent : cardBorder,
                },
              ]}
            >
              <Text style={[styles.chipLabel, { color: prefs.reminderTime ? mt.accent : mt.t2 }]}>
                {prefs.reminderTime
                  ? `${String(prefs.reminderTime.hour).padStart(2, '0')}:${String(prefs.reminderTime.minute).padStart(2, '0')}`
                  : 'Set time'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => { if (date) handleSetReminder(date) }}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn:     { width: 70 },
  backText:    { fontSize: 16, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  headerRight: { width: 70 },
  body:        { padding: 16, gap: 24 },
  rowSection:  { gap: 10 },
  rowLabel:    { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipEmoji:   { fontSize: 14 },
  chipLabel:   { fontSize: 13, fontWeight: '700' },
})
