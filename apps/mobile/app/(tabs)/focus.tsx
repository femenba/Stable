import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/use-theme'

const DURATION = 25 * 60 // 25 minutes

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(s: number) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

type Status = 'idle' | 'running' | 'paused' | 'done'

export default function FocusScreen() {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const { taskName: paramTask, startTs } = useLocalSearchParams<{ taskName?: string; startTs?: string }>()

  const [status, setStatus]       = useState<Status>('idle')
  const [secondsLeft, setSeconds] = useState(DURATION)
  const [activeTask, setActiveTask] = useState('')
  const lastStartTs = useRef('')

  // Auto-start when Today navigates here with a task + timestamp
  useEffect(() => {
    if (startTs && startTs !== lastStartTs.current) {
      lastStartTs.current = startTs
      setActiveTask(paramTask ?? '')
      setSeconds(DURATION)
      setStatus('running')
    }
  }, [startTs, paramTask])

  // Countdown tick
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id)
          setStatus('done')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [status])

  function handleStart() {
    setActiveTask('')
    setSeconds(DURATION)
    setStatus('running')
  }

  function handleReset() {
    setStatus('idle')
    setSeconds(DURATION)
    setActiveTask('')
  }

  const timerColor =
    status === 'done'    ? '#16a34a' :
    status === 'idle'    ? t.t3      :
    '#4f3aff'

  const progress = secondsLeft / DURATION // 1 → 0 as timer counts down

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

      <View style={styles.content}>
        <View style={[styles.timerCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          {/* Task name */}
          {activeTask ? (
            <Text style={[styles.taskName, { color: t.t2 }]} numberOfLines={1}>
              {activeTask}
            </Text>
          ) : null}

          {/* Timer */}
          <Text style={[styles.timer, { color: timerColor }]}>
            {formatTime(secondsLeft)}
          </Text>

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: t.cardBorder }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width:           `${progress * 100}%`,
                  backgroundColor: status === 'done' ? '#16a34a' : '#4f3aff',
                },
              ]}
            />
          </View>

          {/* Status label */}
          <Text style={[styles.timerSub, { color: t.t2 }]}>
            {status === 'idle'    ? '25-minute focus session'   :
             status === 'running' ? 'Focus session in progress' :
             status === 'paused'  ? 'Paused — take a breath'   :
             'Session complete! Great work.'}
          </Text>

          {/* Controls */}
          {status === 'idle' && (
            <TouchableOpacity onPress={handleStart} style={styles.fullWidth}>
              <LinearGradient
                colors={[t.ctaStart, t.ctaEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>▶  Start session</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {status === 'running' && (
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setStatus('paused')}
                style={[styles.secondaryBtn, { borderColor: t.cardBorder, flex: 1 }]}
              >
                <Text style={[styles.secondaryBtnText, { color: t.t1 }]}>⏸  Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReset}
                style={[styles.secondaryBtn, { borderColor: t.cardBorder }]}
              >
                <Text style={[styles.secondaryBtnText, { color: t.t3 }]}>↺  Reset</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'paused' && (
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setStatus('running')} style={styles.fullWidth}>
                <LinearGradient
                  colors={[t.ctaStart, t.ctaEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>▶  Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReset}
                style={[styles.secondaryBtn, { borderColor: t.cardBorder }]}
              >
                <Text style={[styles.secondaryBtnText, { color: t.t3 }]}>↺</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'done' && (
            <TouchableOpacity onPress={handleReset} style={styles.fullWidth}>
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>✓  Done — start another</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        {status === 'idle' && (
          <View style={[styles.tipsCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
            <Text style={[styles.tipsTitle, { color: t.t3 }]}>POMODORO METHOD</Text>
            <Text style={[styles.tipsBody, { color: t.t2 }]}>
              25 minutes of deep focus, then a 5-minute break.{'\n'}
              Put your phone down and close distracting tabs.
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { paddingHorizontal: 20, paddingBottom: 24 },
  label:          { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:          { fontSize: 26, fontWeight: '900', color: '#fff' },
  content:        { flex: 1, paddingTop: 20, paddingHorizontal: 12, gap: 12 },
  timerCard:      { borderRadius: 20, borderWidth: 1, padding: 28, alignItems: 'center', gap: 12 },
  taskName:       { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: -4 },
  timer:          { fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -2 },
  progressTrack:  { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill:   { height: 4, borderRadius: 2 },
  timerSub:       { fontSize: 13, textAlign: 'center' },
  fullWidth:      { width: '100%' },
  primaryBtn:     { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  row:            { flexDirection: 'row', gap: 10, width: '100%' },
  secondaryBtn:   { borderRadius: 14, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText:{ fontSize: 14, fontWeight: '600' },
  tipsCard:       { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  tipsTitle:      { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  tipsBody:       { fontSize: 13, lineHeight: 20 },
})
