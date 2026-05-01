import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { trpc } from '@/lib/trpc-client'
import { useTheme } from '@/lib/use-theme'
import { AiInsight } from '@/components/ai-insight'
import { TaskCard } from '@/components/task-card'
import { NextFocusCard } from '@/components/next-focus-card'

export default function TodayScreen() {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const utils = trpc.useUtils()
  const { data: topTasks, isLoading } = trpc.tasks.listTopThree.useQuery()

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()

  function handleUpdate() {
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
        <Text style={styles.label}>{today} · TODAY'S FOCUS</Text>
        <Text style={styles.title}>Three things.{'\n'}That's it.</Text>
        <Text style={styles.subtitle}>One at a time.</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AiInsight />

        <NextFocusCard task={topTasks?.[0]} />

        {isLoading ? (
          [0, 1, 2].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.card }]} />
          ))
        ) : topTasks?.length ? (
          topTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
          ))
        ) : (
          <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.emptyText, { color: t.t3 }]}>No active tasks — add one in Tasks.</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => router.push('/(tabs)/focus')} style={styles.ctaWrap}>
          <LinearGradient
            colors={[t.ctaStart, t.ctaEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <View>
              <Text style={styles.ctaTitle}>Start focus session</Text>
              <Text style={styles.ctaSub}>Ready when you are</Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { paddingHorizontal: 20, paddingBottom: 24 },
  label:     { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:     { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 32 },
  subtitle:  { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  scroll:    { flex: 1 },
  content:   { paddingBottom: 24 },
  skeleton:  { marginHorizontal: 12, marginBottom: 8, height: 64, borderRadius: 16 },
  empty:     { marginHorizontal: 12, marginTop: 8, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  ctaWrap:   { marginHorizontal: 12, marginTop: 8 },
  cta:       { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaTitle:  { fontSize: 14, fontWeight: '700', color: '#fff' },
  ctaSub:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  ctaArrow:  { fontSize: 18, color: '#fff', fontWeight: '600' },
})
