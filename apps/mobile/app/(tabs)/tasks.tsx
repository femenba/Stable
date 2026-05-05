import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Pressable, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/use-theme'
import { useAllTasks } from '@/lib/use-all-tasks'
import type { TaskCategory, TaskPriority, AllTask } from '@/lib/use-all-tasks'

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'work',     label: 'Work'     },
  { value: 'personal', label: 'Personal' },
  { value: 'family',   label: 'Family'   },
  { value: 'health',   label: 'Health'   },
  { value: 'other',    label: 'Other'    },
]

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: 'High'   },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low'    },
]

function TaskRow({ task, onToggle, onDelete, getCatColor }: {
  task:        AllTask
  onToggle:    () => void
  onDelete:    () => void
  getCatColor: (c: TaskCategory) => string
}) {
  const { t } = useTheme()
  const color = getCatColor(task.category)
  return (
    <View style={[row.card, { backgroundColor: t.card, borderColor: t.cardBorder, borderLeftColor: color }]}>
      <TouchableOpacity onPress={onToggle} style={row.check} hitSlop={8}>
        <View style={[row.checkbox, { borderColor: '#6366F1' }, task.done && { backgroundColor: '#6366F1', borderColor: '#6366F1' }]} />
      </TouchableOpacity>
      <View style={row.body}>
        <Text
          style={[row.title, { color: t.t1 }, task.done && { color: t.t3, textDecorationLine: 'line-through' }]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={row.meta}>
          <View style={[row.tag, { backgroundColor: `${color}18` }]}>
            <Text style={[row.tagText, { color }]}>{task.category}</Text>
          </View>
          <Text style={[row.dot, { color: t.t3 }]}>·</Text>
          <Text style={[row.priority, { color: t.t2 }]}>
            {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={row.del}>
        <Text style={[row.delText, { color: t.t3 }]}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

const row = StyleSheet.create({
  card:     { marginHorizontal: 16, marginBottom: 10, borderRadius: 18, borderWidth: 1, borderLeftWidth: 4, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  check:    { paddingTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  body:     { flex: 1, minWidth: 0 },
  title:    { fontSize: 15, fontWeight: '600' },
  meta:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  tag:      { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:  { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  dot:      { fontSize: 10 },
  priority: { fontSize: 11, fontWeight: '500' },
  del:      { paddingLeft: 4, paddingTop: 2 },
  delText:  { fontSize: 14 },
})

export default function TasksScreen() {
  const { t, getCatColor } = useTheme()
  const insets = useSafeAreaInsets()
  const { active, completed, addTask, toggleTask, removeTask } = useAllTasks()

  const [showModal, setShowModal]   = useState(false)
  const [title, setTitle]           = useState('')
  const [category, setCategory]     = useState<TaskCategory>('work')
  const [priority, setPriority]     = useState<TaskPriority>(2)
  const inputRef = useRef<TextInput>(null)

  function handleOpen() {
    setTitle('')
    setCategory('work')
    setPriority(2)
    setShowModal(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleCreate() {
    if (!title.trim()) return
    addTask(title, category, priority)
    setShowModal(false)
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.label}>YOUR TASKS</Text>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity onPress={handleOpen} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add task</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {active.length === 0 && completed.length === 0 && (
          <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.emptyText, { color: t.t3 }]}>
              No tasks yet — tap "+ Add task" to get started.
            </Text>
          </View>
        )}

        {active.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => toggleTask(task.id)}
            onDelete={() => removeTask(task.id)}
            getCatColor={getCatColor}
          />
        ))}

        {completed.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: t.t3 }]}>COMPLETED</Text>
            {completed.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => removeTask(task.id)}
                getCatColor={getCatColor}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Add task modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.kavWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); setShowModal(false) }}>
            <Pressable
              style={[styles.sheet, { backgroundColor: t.card, paddingBottom: insets.bottom + 16 }]}
              onPress={() => {}}
            >
            <View style={[styles.handle, { backgroundColor: t.cardBorder }]} />

            <Text style={[styles.sheetTitle, { color: t.t1 }]}>New task</Text>

            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: t.bg, borderColor: t.cardBorder, color: t.t1 }]}
              placeholder="What needs to get done?"
              placeholderTextColor={t.t3}
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <Text style={[styles.fieldLabel, { color: t.t3 }]}>CATEGORY</Text>
            <View style={styles.pills}>
              {CATEGORIES.map((c) => {
                const active = category === c.value
                const color  = getCatColor(c.value)
                return (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => setCategory(c.value)}
                    style={[styles.pill, {
                      backgroundColor: active ? `${color}22` : t.bg,
                      borderColor:     active ? color : t.cardBorder,
                    }]}
                  >
                    <Text style={[styles.pillText, { color: active ? color : t.t2 }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: t.t3 }]}>PRIORITY</Text>
            <View style={styles.pills}>
              {PRIORITIES.map((p) => {
                const active = priority === p.value
                return (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setPriority(p.value)}
                    style={[styles.pill, {
                      backgroundColor: active ? 'rgba(99,102,241,0.1)' : t.bg,
                      borderColor:     active ? '#6366F1' : t.cardBorder,
                    }]}
                  >
                    <Text style={[styles.pillText, { color: active ? '#6366F1' : t.t2 }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={!title.trim()}
              style={[styles.createBtn, { opacity: title.trim() ? 1 : 0.4 }]}
            >
              <LinearGradient
                colors={[t.ctaStart, t.ctaEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createGradient}
              >
                <Text style={styles.createBtnText}>Create task</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingHorizontal: 22, paddingBottom: 28 },
  label:        { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginBottom: 10 },
  title:        { fontSize: 28, fontWeight: '900', color: '#fff' },
  addBtn:       { alignSelf: 'flex-start', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  addBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll:       { flex: 1 },
  content:      { paddingTop: 14, paddingBottom: 36 },
  sectionLabel: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  empty:        { marginHorizontal: 16, marginTop: 12, borderRadius: 20, borderWidth: 1, padding: 40, alignItems: 'center' },
  emptyText:    { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  kavWrapper:   { flex: 1 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:        { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14 },
  handle:       { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 6 },
  sheetTitle:   { fontSize: 19, fontWeight: '800' },
  input:        { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  fieldLabel:   { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 6 },
  pills:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:         { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  pillText:     { fontSize: 12, fontWeight: '700' },
  createBtn:    { marginTop: 6 },
  createGradient:{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
