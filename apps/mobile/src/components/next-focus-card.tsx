import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import type { Task } from '@stable/shared'
import { useTheme } from '@/lib/use-theme'

interface NextFocusCardProps {
  task: Task | undefined
}

export function NextFocusCard({ task }: NextFocusCardProps) {
  const { t, getCatColor, catLabel } = useTheme()
  const router = useRouter()

  if (!task) return null

  const color = getCatColor(task.category)

  function handleStart() {
    router.push({ pathname: '/(tabs)/focus', params: { taskId: task!.id, taskName: task!.title } })
  }

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
      <Text style={[styles.label, { color: t.t3 }]}>NEXT UP</Text>
      <View style={styles.row}>
        <View style={[styles.accent, { backgroundColor: color }]} />
        <View style={styles.info}>
          <Text style={[styles.title, { color: t.t1 }]} numberOfLines={1}>{task.title}</Text>
          <View style={styles.meta}>
            <View style={[styles.tag, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.tagText, { color }]}>{catLabel[task.category]}</Text>
            </View>
            {!!task.dueAt && (
              <Text style={[styles.metaText, { color: t.t3 }]}>
                {new Date(task.dueAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: color }]}
          onPress={handleStart}
        >
          <Text style={styles.ctaText}>▶ Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card:     { marginHorizontal: 12, marginTop: 8, borderRadius: 16, borderWidth: 1, padding: 14 },
  label:    { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accent:   { width: 3, height: 40, borderRadius: 2 },
  info:     { flex: 1, minWidth: 0 },
  title:    { fontSize: 14, fontWeight: '700' },
  meta:     { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag:      { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:  { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText: { fontSize: 10 },
  cta:      { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  ctaText:  { color: '#fff', fontSize: 12, fontWeight: '800' },
})
