import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
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

  const pending   = tasks?.filter((task) => task.status !== 'completed') ?? []
  const completed = tasks?.filter((task) => task.status === 'completed') ?? []

  function handleUpdate() {
    utils.tasks.list.invalidate()
    utils.tasks.listTopThree.invalidate()
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
        <TouchableOpacity
          onPress={() => setShowForm((v) => !v)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Add task</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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
  container:    { flex: 1 },
  header:       { paddingHorizontal: 20, paddingBottom: 24 },
  label:        { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:        { fontSize: 26, fontWeight: '900', color: '#fff' },
  addBtn:       { alignSelf: 'flex-start', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll:       { flex: 1 },
  content:      { paddingTop: 8, paddingBottom: 24 },
  form:         { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  input:        { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  pills:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill:         { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  formActions:  { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 4 },
  cancelText:   { fontSize: 13 },
  createBtn:    { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  createBtnText:{ color: '#fff', fontSize: 13, fontWeight: '700' },
  skeleton:     { marginHorizontal: 12, marginBottom: 8, height: 64, borderRadius: 16 },
  empty:        { marginHorizontal: 12, marginTop: 4, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyText:    { fontSize: 14, textAlign: 'center' },
  sectionLabel: { marginHorizontal: 12, marginTop: 12, marginBottom: 4, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
})
