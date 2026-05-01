import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import { trpc } from '@/lib/trpc-client'
import { useTheme } from '@/lib/use-theme'
import { startLiveActivity, endLiveActivity } from '@/lib/live-activity'

function formatDuration(startedAt: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <>{formatDuration(startedAt)}</>
}

async function showAndroidTimerNotification(taskName: string) {
  if (Platform.OS !== 'android') return
  await Notifications.scheduleNotificationAsync({
    identifier: 'focus-session',
    content: {
      title: 'Focus session in progress',
      body:  taskName,
      sticky: true,
      autoDismiss: false,
    },
    trigger: null,
  })
}

async function dismissAndroidTimerNotification() {
  if (Platform.OS !== 'android') return
  await Notifications.dismissNotificationAsync('focus-session')
}

export default function FocusScreen() {
  const { t } = useTheme()
  const insets  = useSafeAreaInsets()
  const utils   = trpc.useUtils()
  const params  = useLocalSearchParams<{ taskId?: string; taskName?: string }>()
  const liveActivityId = useRef<string | null>(null)

  const { data: sessions, isLoading } = trpc.focusSessions.list.useQuery({ limit: 10 })

  const start = trpc.focusSessions.start.useMutation({
    onSuccess: async (session) => {
      utils.focusSessions.list.invalidate()
      const name = params.taskName ?? 'Focus session'
      liveActivityId.current = await startLiveActivity({
        sessionId: session.id,
        taskName:  name,
        startedAt: session.startedAt,
      })
      await showAndroidTimerNotification(name)
    },
  })

  const end = trpc.focusSessions.end.useMutation({
    onSuccess: async () => {
      utils.focusSessions.list.invalidate()
      if (liveActivityId.current) {
        await endLiveActivity(liveActivityId.current)
        liveActivityId.current = null
      }
      await dismissAndroidTimerNotification()
    },
  })

  const activeSession = sessions?.find((s) => s.endedAt === null) ?? null
  const pastSessions  = sessions?.filter((s) => s.endedAt !== null) ?? []

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <LinearGradient
        colors={[t.headerStart, t.headerMid, t.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.label}>FOCUS MODE</Text>
        <Text style={styles.title}>Focus</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.timerCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          {activeSession ? (
            <>
              <Text style={[styles.timer, { color: '#4f3aff' }]}>
                <ElapsedTimer startedAt={activeSession.startedAt} />
              </Text>
              <Text style={[styles.timerSub, { color: t.t2 }]}>Focus session in progress</Text>
              <View style={styles.timerActions}>
                <TouchableOpacity
                  onPress={() => end.mutate({ id: activeSession.id, completed: true })}
                  disabled={end.isPending}
                  style={{ opacity: end.isPending ? 0.5 : 1 }}
                >
                  <LinearGradient
                    colors={[t.ctaStart, t.ctaEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.endBtn}
                  >
                    <Text style={styles.endBtnText}>End session ✓</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => end.mutate({ id: activeSession.id, completed: false })}
                  disabled={end.isPending}
                  style={[styles.abandonBtn, { borderColor: t.cardBorder, opacity: end.isPending ? 0.5 : 1 }]}
                >
                  <Text style={[styles.abandonBtnText, { color: t.t2 }]}>Abandon</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.timer, { color: t.t3 }]}>00:00</Text>
              <Text style={[styles.timerSub, { color: t.t2 }]}>Ready to focus</Text>
              <TouchableOpacity
                onPress={() => start.mutate({ taskId: params.taskId ?? undefined })}
                disabled={start.isPending}
                style={{ opacity: start.isPending ? 0.5 : 1, marginTop: 24 }}
              >
                <LinearGradient
                  colors={[t.ctaStart, t.ctaEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startBtn}
                >
                  <Text style={styles.startBtnText}>▶ Start session</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={[styles.historyLabel, { color: t.t3 }]}>RECENT SESSIONS</Text>
        {isLoading ? (
          [0, 1].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.card }]} />
          ))
        ) : !pastSessions.length ? (
          <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.emptyText, { color: t.t3 }]}>No completed sessions yet.</Text>
          </View>
        ) : (
          pastSessions.map((s) => (
            <View key={s.id} style={[styles.sessionRow, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
              <View>
                <Text style={[styles.sessionDate, { color: t.t1 }]}>
                  {new Date(s.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </Text>
                <Text style={[styles.sessionTime, { color: t.t2 }]}>
                  {new Date(s.startedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                  {s.endedAt ? ` → ${new Date(s.endedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}` : ''}
                </Text>
              </View>
              <View style={styles.sessionRight}>
                <Text style={[styles.sessionDuration, { color: t.t1 }]}>
                  {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                </Text>
                <Text style={[styles.sessionStatus, { color: s.completed ? '#0891b2' : t.t3 }]}>
                  {s.completed ? 'Completed' : 'Abandoned'}
                </Text>
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
  scroll:         { flex: 1 },
  content:        { paddingTop: 12, paddingBottom: 24 },
  timerCard:      { marginHorizontal: 12, borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center' },
  timer:          { fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerSub:       { fontSize: 13, marginTop: 6 },
  timerActions:   { flexDirection: 'row', gap: 12, marginTop: 24 },
  endBtn:         { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  endBtnText:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  abandonBtn:     { borderRadius: 14, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 14 },
  abandonBtnText: { fontSize: 14, fontWeight: '600' },
  startBtn:       { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  startBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  historyLabel:   { marginHorizontal: 12, marginTop: 20, marginBottom: 6, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  skeleton:       { marginHorizontal: 12, marginBottom: 8, height: 56, borderRadius: 16 },
  empty:          { marginHorizontal: 12, borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyText:      { fontSize: 14 },
  sessionRow:     { marginHorizontal: 12, marginBottom: 8, borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionDate:    { fontSize: 14, fontWeight: '600' },
  sessionTime:    { fontSize: 11, marginTop: 2 },
  sessionRight:   { alignItems: 'flex-end' },
  sessionDuration:{ fontSize: 14, fontWeight: '700' },
  sessionStatus:  { fontSize: 11, marginTop: 2 },
})
