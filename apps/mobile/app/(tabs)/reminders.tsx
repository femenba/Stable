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
    const snoozedAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    snooze.mutate({ id, remindAt: snoozedAt })
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
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
