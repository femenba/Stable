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
  const color = getCatColor(task.category)
  return (
    <View style={[row.card, { borderLeftColor: color }]}>
      <TouchableOpacity onPress={onToggle} style={row.check} hitSlop={8}>
        <View style={[row.checkbox, task.done && { backgroundColor: '#4f3aff', borderColor: '#4f3aff' }]} />
      </TouchableOpacity>
      <View style={row.body}>
        <Text
          style={[row.title, task.done && { color: '#aaa', textDecorationLine: 'line-through' }]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={row.meta}>
          <View style={[row.tag, { backgroundColor: `${color}22` }]}>
            <Text style={[row.tagText, { color }]}>{task.category}</Text>
          </View>
          <Text style={row.dot}>·</Text>
          <Text style={row.priority}>
            {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={row.del}>
        <Text style={row.delText}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

const row = StyleSheet.create({
  card:     { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: '#f0eeff', borderLeftWidth: 3, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fff' },
  check:    { paddingTop: 2 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#4f3aff' },
  body:     { flex: 1, minWidth: 0 },
  title:    { fontSize: 14, fontWeight: '600', color: '#111' },
  meta:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag:      { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:  { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dot:      { fontSize: 10, color: '#ccc' },
  priority: { fontSize: 11, color: '#888' },
  del:      { paddingLeft: 4 },
  delText:  { fontSize: 13, color: '#ccc' },
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
                      backgroundColor: active ? 'rgba(79,58,255,0.12)' : t.bg,
                      borderColor:     active ? '#4f3aff' : t.cardBorder,
                    }]}
                  >
                    <Text style={[styles.pillText, { color: active ? '#4f3aff' : t.t2 }]}>
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
  header:       { paddingHorizontal: 20, paddingBottom: 24 },
  label:        { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:        { fontSize: 26, fontWeight: '900', color: '#fff' },
  addBtn:       { alignSelf: 'flex-start', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll:       { flex: 1 },
  content:      { paddingTop: 12, paddingBottom: 32 },
  sectionLabel: { marginHorizontal: 12, marginTop: 12, marginBottom: 6, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: '#ccc' },
  empty:        { marginHorizontal: 12, marginTop: 8, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyText:    { fontSize: 14, textAlign: 'center' },
  kavWrapper:   { flex: 1 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  sheetTitle:   { fontSize: 18, fontWeight: '800' },
  input:        { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  fieldLabel:   { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  pills:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:         { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillText:     { fontSize: 12, fontWeight: '700' },
  createBtn:    { marginTop: 4 },
  createGradient:{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
