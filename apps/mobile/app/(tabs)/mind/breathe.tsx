// apps/mobile/app/(tabs)/mind/breathe.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useMindPrefs } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'
import { EXERCISES } from '@/lib/breathing-exercises'
import { useBreathingEngine } from '@/components/mind/breathing-engine'
import { BreathingCircle } from '@/components/mind/breathing-circle'
import { BreathingCountdown } from '@/components/mind/breathing-countdown'
import { BreathingArc } from '@/components/mind/breathing-arc'
import { BreathingBlob } from '@/components/mind/breathing-blob'

export default function BreatheScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { prefs } = useMindPrefs()
  const mt      = MIND_THEMES[prefs.theme]

  const [exerciseId, setExerciseId] = useState<string>(EXERCISES[0].id)
  const exercise = EXERCISES.find((e) => e.id === exerciseId) ?? EXERCISES[0]
  const engine   = useBreathingEngine(exercise)

  const animProps = {
    phaseLabel:  engine.phaseLabel,
    secondsLeft: engine.secondsLeft,
    progress:    engine.progress,
    isRunning:   engine.isRunning,
    phaseIndex:  engine.phaseIndex,
    accent:      mt.accent,
    accentSoft:  mt.accentSoft,
    t2:          mt.t2,
  }

  return (
    <View style={[styles.container, { backgroundColor: mt.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => { engine.stop(); router.back() }} style={styles.backBtn}>
          <Text style={[styles.backText, { color: mt.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: mt.t1 }]}>Breathe</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Exercise selector */}
      <View style={styles.selector}>
        {EXERCISES.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            onPress={() => { engine.stop(); setExerciseId(ex.id) }}
            style={[
              styles.chip,
              {
                backgroundColor: exerciseId === ex.id ? mt.accentSoft : 'transparent',
                borderColor:     exerciseId === ex.id ? mt.accent : `${mt.t3}88`,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: exerciseId === ex.id ? mt.accent : mt.t2 }]}>
              {ex.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Animation area */}
      <View style={styles.animArea}>
        {prefs.breathStyle === 'circle'    && <BreathingCircle    {...animProps} />}
        {prefs.breathStyle === 'countdown' && <BreathingCountdown {...animProps} />}
        {prefs.breathStyle === 'arc'       && <BreathingArc       {...animProps} />}
        {prefs.breathStyle === 'blob'      && <BreathingBlob      {...animProps} />}
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        {!engine.isRunning ? (
          <TouchableOpacity onPress={engine.start} style={[styles.startBtn, { backgroundColor: mt.accent }]}>
            <Text style={styles.startBtnText}>▶ Start</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.runningControls}>
            <TouchableOpacity
              onPress={engine.isPaused ? engine.resume : engine.pause}
              style={[styles.controlBtn, { borderColor: mt.accent }]}
            >
              <Text style={[styles.controlBtnText, { color: mt.accent }]}>
                {engine.isPaused ? '▶ Resume' : '⏸ Pause'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={engine.stop}
              style={[styles.controlBtn, { borderColor: `${mt.t3}88` }]}
            >
              <Text style={[styles.controlBtnText, { color: mt.t2 }]}>■ Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn:         { width: 70 },
  backText:        { fontSize: 16, fontWeight: '600' },
  headerTitle:     { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  headerRight:     { width: 70 },
  selector:        { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 8 },
  chip:            { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  chipText:        { fontSize: 13, fontWeight: '700' },
  animArea:        { flex: 1 },
  controls:        { paddingHorizontal: 20, paddingTop: 16 },
  startBtn:        { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  startBtnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  runningControls: { flexDirection: 'row', gap: 12 },
  controlBtn:      { flex: 1, borderWidth: 1.5, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  controlBtnText:  { fontSize: 15, fontWeight: '700' },
})
