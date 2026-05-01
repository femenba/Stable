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
          color:              isDone ? t.t3 : t.t1,
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
