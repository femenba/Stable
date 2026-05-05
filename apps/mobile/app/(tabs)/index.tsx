import { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, Pressable,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { AiInsight } from '@/components/ai-insight'
import { useTheme } from '@/lib/use-theme'
import { useLocalTasks } from '@/lib/use-local-tasks'
import type { LocalTask } from '@/lib/use-local-tasks'
import { useAllTasks } from '@/lib/use-all-tasks'

export default function TodayScreen() {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { signOut } = useAuth()
  const { user } = useUser()

  const { tasks, addTask, toggleTask, removeTask, loaded } = useLocalTasks()
  const { active: allActive } = useAllTasks()

  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [showAccount, setShowAccount] = useState(false)

  const inputRef = useRef<TextInput>(null)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()

  function handleSlotPress(index: number) {
    if (tasks[index]) return // already filled
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
      params: {
        taskName: firstActive?.title ?? '',
        startTs:  String(Date.now()),
      },
    })
  }

  async function handleSignOut() {
    setShowAccount(false)
    await signOut()
  }

  const displayName =
    user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? '?'
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  const slots: (LocalTask | null)[] = [
    tasks[0] ?? null,
    tasks[1] ?? null,
    tasks[2] ?? null,
  ]

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.label}>{today} · TODAY'S FOCUS</Text>
            <Text style={styles.title}>Three things.{'\n'}That's it.</Text>
            <Text style={styles.subtitle}>One at a time.</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAccount(true)} style={styles.avatarBtn}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AiInsight />

        {/* 3 task slots */}
        {slots.map((task, i) => {
          const isEditing = editingSlot === i

          if (isEditing) {
            return (
              <View key={`slot-${i}`} style={[styles.slot, { backgroundColor: t.card, borderColor: '#6366F1' }]}>
                <TextInput
                  ref={inputRef}
                  style={[styles.slotInput, { color: t.t1 }]}
                  placeholder={`Task ${i + 1}…`}
                  placeholderTextColor={t.t3}
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  onSubmitEditing={handleConfirmAdd}
                  returnKeyType="done"
                  autoFocus
                />
                <View style={styles.slotActions}>
                  <TouchableOpacity onPress={() => { setEditingSlot(null); setDraftTitle('') }}>
                    <Text style={[styles.slotActionCancel, { color: t.t3 }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmAdd}
                    disabled={!draftTitle.trim()}
                    style={[styles.slotActionAdd, { opacity: draftTitle.trim() ? 1 : 0.4 }]}
                  >
                    <Text style={styles.slotActionAddText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }

          if (task) {
            return (
              <View key={task.id} style={[styles.slot, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
                <TouchableOpacity onPress={() => toggleTask(task.id)} style={styles.checkBtn}>
                  <View style={[styles.checkbox, task.done && styles.checkboxDone]} />
                </TouchableOpacity>
                <Text
                  style={[styles.slotTitle, {
                    color: task.done ? t.t3 : t.t1,
                    textDecorationLine: task.done ? 'line-through' : 'none',
                    flex: 1,
                  }]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <TouchableOpacity onPress={() => removeTask(task.id)} hitSlop={8}>
                  <Text style={[styles.removeBtn, { color: t.t3 }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )
          }

          return (
            <TouchableOpacity
              key={`empty-${i}`}
              onPress={() => handleSlotPress(i)}
              style={[styles.slot, styles.slotEmpty, { borderColor: t.cardBorder, borderStyle: 'dashed' }]}
            >
              <Text style={[styles.slotEmptyText, { color: t.t3 }]}>
                + Task {i + 1}
              </Text>
            </TouchableOpacity>
          )
        })}

        {/* Start focus CTA */}
        <TouchableOpacity onPress={handleStartFocus} style={styles.ctaWrap}>
          <LinearGradient
            colors={[t.ctaStart, t.ctaEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <View>
              <Text style={styles.ctaTitle}>Start focus session</Text>
              <Text style={styles.ctaSub}>
                {tasks.find((t) => !t.done)?.title
                  ? `Working on: ${tasks.find((tt) => !tt.done)!.title}`
                  : 'Ready when you are'}
              </Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Account modal */}
      <Modal
        visible={showAccount}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccount(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowAccount(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: t.card, borderColor: t.cardBorder }]}
            onPress={() => {}}
          >
            {/* Avatar */}
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarLetter}>{avatarLetter}</Text>
            </View>
            <Text style={[styles.accountName, { color: t.t1 }]}>{displayName}</Text>
            {email ? <Text style={[styles.accountEmail, { color: t.t2 }]}>{email}</Text> : null}

            <View style={[styles.divider, { backgroundColor: t.cardBorder }]} />

            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:           { flex: 1 },
  header:              { paddingHorizontal: 22, paddingBottom: 28 },
  headerRow:           { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerText:          { flex: 1 },
  label:               { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginBottom: 10 },
  title:               { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 34 },
  subtitle:            { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  avatarBtn:           { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginTop: 2 },
  avatarLetter:        { fontSize: 16, fontWeight: '800', color: '#fff' },
  scroll:              { flex: 1 },
  content:             { paddingTop: 4, paddingBottom: 36 },

  slot:                { marginHorizontal: 16, marginTop: 10, borderRadius: 18, borderWidth: 1, borderColor: '#ECEAFF', paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  slotEmpty:           { justifyContent: 'center', paddingVertical: 20, borderStyle: 'dashed' },
  slotEmptyText:       { fontSize: 14, fontWeight: '500' },
  slotInput:           { flex: 1, fontSize: 15, paddingVertical: 0 },
  slotActions:         { flexDirection: 'row', gap: 10, alignItems: 'center' },
  slotActionCancel:    { fontSize: 13 },
  slotActionAdd:       { backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  slotActionAddText:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  slotTitle:           { fontSize: 15, fontWeight: '600' },
  checkBtn:            { padding: 2 },
  checkbox:            { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#6366F1' },
  checkboxDone:        { backgroundColor: '#6366F1' },
  removeBtn:           { fontSize: 14, paddingHorizontal: 4 },

  ctaWrap:             { marginHorizontal: 16, marginTop: 20 },
  cta:                 { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaTitle:            { fontSize: 15, fontWeight: '700', color: '#fff' },
  ctaSub:              { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  ctaArrow:            { fontSize: 22, color: '#fff', fontWeight: '300' },

  overlay:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  sheet:               { width: 300, borderRadius: 24, borderWidth: 1, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10 },
  accountAvatar:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  accountAvatarLetter: { fontSize: 30, fontWeight: '900', color: '#fff' },
  accountName:         { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  accountEmail:        { fontSize: 13, marginBottom: 4 },
  divider:             { width: '100%', height: 1, marginVertical: 18 },
  signOutBtn:          { backgroundColor: 'rgba(220,38,38,0.08)', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  signOutText:         { color: '#dc2626', fontSize: 14, fontWeight: '700' },
})
