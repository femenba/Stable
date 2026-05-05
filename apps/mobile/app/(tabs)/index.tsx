import { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, Pressable,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { useTheme } from '@/lib/use-theme'
import { useLocalTasks } from '@/lib/use-local-tasks'
import type { LocalTask } from '@/lib/use-local-tasks'
import { useAllTasks } from '@/lib/use-all-tasks'
import { Card, Btn, Label, SectionHeader } from '@/components/ui'

export default function TodayScreen() {
  const { t }    = useTheme()
  const insets   = useSafeAreaInsets()
  const router   = useRouter()
  const { signOut } = useAuth()
  const { user } = useUser()

  const { tasks, addTask, toggleTask, removeTask } = useLocalTasks()
  const { active: allActive } = useAllTasks()

  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [draftTitle,  setDraftTitle]  = useState('')
  const [showAccount, setShowAccount] = useState(false)

  const inputRef = useRef<TextInput>(null)

  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })

  const firstName   = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? ''
  const avatarLetter = (firstName[0] ?? '?').toUpperCase()
  const email        = user?.emailAddresses?.[0]?.emailAddress ?? ''

  const slots: (LocalTask | null)[] = [tasks[0] ?? null, tasks[1] ?? null, tasks[2] ?? null]
  const doneCount = tasks.filter((t) => t.done).length

  function handleSlotPress(index: number) {
    if (tasks[index]) return
    setDraftTitle('')
    setEditingSlot(index)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleConfirmAdd() {
    if (draftTitle.trim()) addTask(draftTitle)
    setEditingSlot(null)
    setDraftTitle('')
  }

  function handleStartFocus() {
    const firstActive = tasks.find((t) => !t.done) ?? allActive[0]
    router.push({
      pathname: '/(tabs)/focus',
      params:   { taskName: firstActive?.title ?? '', startTs: String(Date.now()) },
    })
  }

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>

      {/* ── HERO HEADER ─────────────────────────────── */}
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.hero, { paddingTop: insets.top + 18 }]}
      >
        {/* Decorative blur circle */}
        <View style={s.heroBlob} pointerEvents="none" />

        <View style={s.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.heroDate}>{dateLabel.toUpperCase()}</Text>
            <Text style={s.heroTitle}>Good {greeting}{firstName ? `,\n${firstName}` : '.'}</Text>
            <Text style={s.heroSub}>Three tasks. One at a time.</Text>

            {/* Progress chips */}
            {tasks.length > 0 && (
              <View style={s.chipRow}>
                <View style={s.chip}>
                  <Text style={s.chipText}>✓ {doneCount}/{tasks.length} done</Text>
                </View>
              </View>
            )}
          </View>

          {/* Avatar */}
          <TouchableOpacity onPress={() => setShowAccount(true)} style={s.avatar}>
            <Text style={s.avatarLetter}>{avatarLetter}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── SCROLL CONTENT ──────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.body, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Task slots */}
        <SectionHeader label="Today's Focus" action="View all" onAction={() => router.push('/(tabs)/tasks')} />

        {slots.map((task, i) => {
          const isEditing = editingSlot === i

          if (isEditing) {
            return (
              <View key={`edit-${i}`} style={[s.taskCard, { borderColor: '#5E8B71', borderWidth: 2, backgroundColor: t.card }]}>
                <TextInput
                  ref={inputRef}
                  style={[s.taskInput, { color: t.t1 }]}
                  placeholder={`Task ${i + 1}…`}
                  placeholderTextColor={t.t3}
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  onSubmitEditing={handleConfirmAdd}
                  returnKeyType="done"
                  autoFocus
                />
                <View style={s.editActions}>
                  <TouchableOpacity onPress={() => { setEditingSlot(null); setDraftTitle('') }}>
                    <Text style={[s.cancelText, { color: t.t3 }]}>Cancel</Text>
                  </TouchableOpacity>
                  <Btn variant="primary" size="sm" onPress={handleConfirmAdd} disabled={!draftTitle.trim()}>
                    Add
                  </Btn>
                </View>
              </View>
            )
          }

          if (task) {
            return (
              <View key={task.id} style={[s.taskCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
                {/* Left accent bar */}
                <View style={[s.taskAccent, { backgroundColor: task.done ? t.cardBorder : '#5E8B71' }]} />

                {/* Checkbox */}
                <TouchableOpacity onPress={() => toggleTask(task.id)} style={s.checkWrap}>
                  <View style={[
                    s.checkbox,
                    { borderColor: task.done ? '#5E8B71' : t.cardBorder },
                    task.done && s.checkboxDone,
                  ]}>
                    {task.done && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <Text style={[
                  s.taskTitle,
                  { color: task.done ? t.t3 : t.t1, textDecorationLine: task.done ? 'line-through' : 'none' },
                ]} numberOfLines={2}>
                  {task.title}
                </Text>

                <TouchableOpacity onPress={() => removeTask(task.id)} hitSlop={10} style={s.removeWrap}>
                  <Text style={[s.removeIcon, { color: t.t3 }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )
          }

          return (
            <TouchableOpacity
              key={`empty-${i}`}
              onPress={() => handleSlotPress(i)}
              style={[s.taskCard, s.taskEmpty, { borderColor: t.cardBorder, backgroundColor: t.card }]}
            >
              <View style={[s.addDot, { borderColor: t.cardBorder }]}>
                <Text style={{ color: t.t3, fontSize: 16, lineHeight: 20 }}>+</Text>
              </View>
              <Text style={[s.emptyLabel, { color: t.t3 }]}>Add task {i + 1}</Text>
            </TouchableOpacity>
          )
        })}

        {/* Focus CTA */}
        <View style={s.ctaWrap}>
          <Btn variant="primary" size="lg" full onPress={handleStartFocus}>
            ▶  Start Focus Session
          </Btn>
        </View>

        {/* Quick links */}
        <View style={s.quickRow}>
          <TouchableOpacity
            style={[s.quickCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}
            onPress={() => router.push('/(tabs)/mind')}
            activeOpacity={0.8}
          >
            <Text style={s.quickIcon}>🧘</Text>
            <Text style={[s.quickLabel, { color: t.t1 }]}>Mind</Text>
            <Text style={[s.quickSub, { color: t.t3 }]}>Breathe & ground</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.quickCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}
            onPress={() => router.push('/(tabs)/mind/mood')}
            activeOpacity={0.8}
          >
            <Text style={s.quickIcon}>🌟</Text>
            <Text style={[s.quickLabel, { color: t.t1 }]}>Mood</Text>
            <Text style={[s.quickSub, { color: t.t3 }]}>Log how you feel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.quickCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}
            onPress={() => router.push('/(tabs)/reminders')}
            activeOpacity={0.8}
          >
            <Text style={s.quickIcon}>🔔</Text>
            <Text style={[s.quickLabel, { color: t.t1 }]}>Remind</Text>
            <Text style={[s.quickSub, { color: t.t3 }]}>Set reminders</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── ACCOUNT MODAL ───────────────────────────── */}
      <Modal visible={showAccount} transparent animationType="fade" onRequestClose={() => setShowAccount(false)}>
        <Pressable style={s.overlay} onPress={() => setShowAccount(false)}>
          <Pressable
            style={[s.sheet, { backgroundColor: t.card, borderColor: t.cardBorder }]}
            onPress={() => {}}
          >
            <View style={[s.sheetAvatar, { backgroundColor: '#5E8B71' }]}>
              <Text style={s.sheetAvatarLetter}>{avatarLetter}</Text>
            </View>
            <Text style={[s.sheetName, { color: t.t1 }]}>{firstName || 'Account'}</Text>
            {email ? <Text style={[s.sheetEmail, { color: t.t2 }]}>{email}</Text> : null}
            <View style={[s.sheetDivider, { backgroundColor: t.cardBorder }]} />
            <TouchableOpacity onPress={async () => { setShowAccount(false); await signOut() }} style={s.sheetSignOut}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#C0445E' }}>Sign out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  )
}

const s = StyleSheet.create({
  root:        { flex: 1 },

  /* Hero */
  hero:        { paddingHorizontal: 22, paddingBottom: 28, overflow: 'hidden' },
  heroBlob:    { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ scale: 1 }] },
  heroRow:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroDate:    { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  heroTitle:   { fontSize: 30, fontWeight: '900', color: '#fff', lineHeight: 36 },
  heroSub:     { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  chipRow:     { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip:        { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  chipText:    { fontSize: 11, fontWeight: '700', color: '#fff' },
  avatar:      { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  avatarLetter:{ fontSize: 16, fontWeight: '900', color: '#fff' },

  /* Body */
  body:        { padding: 18, paddingTop: 20 },

  /* Task cards */
  taskCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 22, borderWidth: 1, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, backgroundColor: '#fff' },
  taskAccent:  { width: 4, alignSelf: 'stretch' },
  checkWrap:   { padding: 16 },
  checkbox:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxDone:{ backgroundColor: '#5E8B71', borderColor: '#5E8B71' },
  taskTitle:   { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: 18, paddingRight: 4 },
  removeWrap:  { padding: 16 },
  removeIcon:  { fontSize: 13 },

  /* Empty slot */
  taskEmpty:   { paddingVertical: 18, paddingHorizontal: 16, justifyContent: 'flex-start', gap: 12 },
  addDot:      { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
  emptyLabel:  { fontSize: 14, fontWeight: '500' },

  /* Editing slot */
  taskInput:   { flex: 1, fontSize: 15, paddingVertical: 16, paddingHorizontal: 16 },
  editActions: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingRight: 12 },
  cancelText:  { fontSize: 13, fontWeight: '600' },

  /* Focus CTA */
  ctaWrap:     { marginTop: 8, marginBottom: 24 },

  /* Quick links */
  quickRow:    { flexDirection: 'row', gap: 10 },
  quickCard:   { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  quickIcon:   { fontSize: 22, marginBottom: 2 },
  quickLabel:  { fontSize: 12, fontWeight: '700' },
  quickSub:    { fontSize: 10, fontWeight: '500', textAlign: 'center' },

  /* Account modal */
  overlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  sheet:             { width: 300, borderRadius: 28, borderWidth: 1, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 28, elevation: 12 },
  sheetAvatar:       { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetAvatarLetter: { fontSize: 28, fontWeight: '900', color: '#fff' },
  sheetName:         { fontSize: 17, fontWeight: '800', marginBottom: 3 },
  sheetEmail:        { fontSize: 13, marginBottom: 8 },
  sheetDivider:      { height: 1, width: '100%', marginVertical: 14 },
  sheetSignOut:      { paddingVertical: 8 },
})
