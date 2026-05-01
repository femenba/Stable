import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@/lib/use-theme'
import {
  requestNotificationPermissions,
  scheduleFocusCompleteNotification,
  cancelFocusCompleteNotification,
} from '@/lib/notifications'

const PRESET_MINUTES = [5, 10, 15, 25, 45] as const
const DURATION_KEY = 'stable:focus-duration'
const DEFAULT_MINUTES = 25

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

  // Duration selection
  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_MINUTES)
  const [isCustom, setIsCustom]               = useState(false)
  const [customInput, setCustomInput]         = useState('')

  // Timer state
  const [status, setStatus]       = useState<Status>('idle')
  const [secondsLeft, setSeconds] = useState(DEFAULT_MINUTES * 60)
  const [totalSeconds, setTotal]  = useState(DEFAULT_MINUTES * 60)
  const [activeTask, setActiveTask] = useState('')
  const lastStartTs = useRef('')

  // Request notification permission on mount so the prompt appears naturally
  useEffect(() => { requestNotificationPermissions() }, [])

  // Load saved duration on mount
  useEffect(() => {
    AsyncStorage.getItem(DURATION_KEY).then((raw) => {
      if (!raw) return
      const saved = JSON.parse(raw) as { minutes: number; isCustom: boolean }
      setSelectedMinutes(saved.minutes)
      setIsCustom(saved.isCustom)
      if (saved.isCustom) setCustomInput(String(saved.minutes))
      if (status === 'idle') setSeconds(saved.minutes * 60)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function saveDuration(minutes: number, custom: boolean) {
    AsyncStorage.setItem(DURATION_KEY, JSON.stringify({ minutes, isCustom: custom }))
  }

  function selectPreset(minutes: number) {
    setSelectedMinutes(minutes)
    setIsCustom(false)
    setCustomInput('')
    setSeconds(minutes * 60)
    saveDuration(minutes, false)
  }

  function selectCustom() {
    setIsCustom(true)
    setCustomInput(String(selectedMinutes))
  }

  function applyCustomInput() {
    const parsed = parseInt(customInput, 10)
    if (!parsed || parsed < 1) return
    const clamped = Math.min(parsed, 480) // max 8 hours
    setSelectedMinutes(clamped)
    setSeconds(clamped * 60)
    saveDuration(clamped, true)
  }

  // Auto-start when Today navigates here with a task + timestamp
  useEffect(() => {
    if (startTs && startTs !== lastStartTs.current) {
      lastStartTs.current = startTs
      setActiveTask(paramTask ?? '')
      const secs = selectedMinutes * 60
      setSeconds(secs)
      setTotal(secs)
      setStatus('running')
      scheduleFocusCompleteNotification(
        selectedMinutes,
        new Date(Date.now() + secs * 1000),
      )
    }
  }, [startTs, paramTask, selectedMinutes])

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
    const secs = selectedMinutes * 60
    setActiveTask('')
    setSeconds(secs)
    setTotal(secs)
    setStatus('running')
    scheduleFocusCompleteNotification(selectedMinutes, new Date(Date.now() + secs * 1000))
  }

  function handlePause() {
    setStatus('paused')
    cancelFocusCompleteNotification()
  }

  // secondsLeft is passed in because state reads inside async closures can be stale
  function handleResume(remaining: number) {
    setStatus('running')
    scheduleFocusCompleteNotification(
      Math.ceil(remaining / 60),
      new Date(Date.now() + remaining * 1000),
    )
  }

  function confirmCancel() {
    Alert.alert(
      'End focus session?',
      'You will lose your current progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End session', style: 'destructive', onPress: handleReset },
      ],
    )
  }

  function handleReset() {
    setStatus('idle')
    setSeconds(selectedMinutes * 60)
    setActiveTask('')
    cancelFocusCompleteNotification()
  }

  const timerColor =
    status === 'done'  ? '#16a34a' :
    status === 'idle'  ? t.t3      :
    '#4f3aff'

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1

  const durationLabel =
    isCustom
      ? `${selectedMinutes} min custom`
      : `${selectedMinutes} min`

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
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
              {status === 'idle'    ? `${durationLabel} focus session`   :
               status === 'running' ? 'Focus session in progress' :
               status === 'paused'  ? 'Paused — take a breath'   :
               'Session complete! Great work.'}
            </Text>

            {/* Duration picker — visible only when idle */}
            {status === 'idle' && (
              <View style={styles.pickerSection}>
                <Text style={[styles.pickerLabel, { color: t.t3 }]}>DURATION</Text>
                <View style={styles.pills}>
                  {PRESET_MINUTES.map((m) => {
                    const active = !isCustom && selectedMinutes === m
                    return (
                      <TouchableOpacity
                        key={m}
                        onPress={() => selectPreset(m)}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: active ? 'rgba(79,58,255,0.12)' : t.bg,
                            borderColor:     active ? '#4f3aff' : t.cardBorder,
                          },
                        ]}
                      >
                        <Text style={[styles.pillText, { color: active ? '#4f3aff' : t.t2 }]}>
                          {m}m
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                  <TouchableOpacity
                    onPress={selectCustom}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isCustom ? 'rgba(79,58,255,0.12)' : t.bg,
                        borderColor:     isCustom ? '#4f3aff' : t.cardBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: isCustom ? '#4f3aff' : t.t2 }]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Custom input */}
                {isCustom && (
                  <View style={styles.customRow}>
                    <TextInput
                      style={[styles.customInput, { backgroundColor: t.bg, borderColor: '#4f3aff', color: t.t1 }]}
                      value={customInput}
                      onChangeText={setCustomInput}
                      onBlur={applyCustomInput}
                      onSubmitEditing={applyCustomInput}
                      keyboardType="number-pad"
                      placeholder="Enter minutes"
                      placeholderTextColor={t.t3}
                      maxLength={3}
                      returnKeyType="done"
                    />
                    <Text style={[styles.customUnit, { color: t.t2 }]}>min</Text>
                    <TouchableOpacity
                      onPress={applyCustomInput}
                      style={[styles.customApply, { backgroundColor: '#4f3aff', opacity: customInput ? 1 : 0.4 }]}
                      disabled={!customInput}
                    >
                      <Text style={styles.customApplyText}>Set</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Controls */}
            {status === 'idle' && (
              <TouchableOpacity onPress={handleStart} style={styles.fullWidth}>
                <LinearGradient
                  colors={[t.ctaStart, t.ctaEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>▶  Start {durationLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {status === 'running' && (
              <View style={styles.activeControls}>
                <TouchableOpacity
                  onPress={handlePause}
                  style={[styles.secondaryBtn, { borderColor: t.cardBorder, flex: 1 }]}
                >
                  <Text style={[styles.secondaryBtnText, { color: t.t1 }]}>⏸  Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmCancel}
                  style={[styles.cancelBtn]}
                >
                  <Text style={styles.cancelBtnText}>✕  Cancel session</Text>
                </TouchableOpacity>
              </View>
            )}

            {status === 'paused' && (
              <View style={styles.activeControls}>
                <TouchableOpacity onPress={() => handleResume(secondsLeft)} style={styles.fullWidth}>
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
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>✕  Cancel session</Text>
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
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { paddingHorizontal: 20, paddingBottom: 24 },
  label:            { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:            { fontSize: 26, fontWeight: '900', color: '#fff' },
  scroll:           { flex: 1 },
  content:          { paddingTop: 20, paddingHorizontal: 12, paddingBottom: 32 },
  timerCard:        { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', gap: 12 },
  taskName:         { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: -4 },
  timer:            { fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -2 },
  progressTrack:    { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: 4, borderRadius: 2 },
  timerSub:         { fontSize: 13, textAlign: 'center' },
  pickerSection:    { width: '100%', gap: 10 },
  pickerLabel:      { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  pills:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:             { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillText:         { fontSize: 13, fontWeight: '700' },
  customRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customInput:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontWeight: '700', width: 90, textAlign: 'center' },
  customUnit:       { fontSize: 14, fontWeight: '600' },
  customApply:      { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  customApplyText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  fullWidth:        { width: '100%' },
  activeControls:   { width: '100%', gap: 10 },
  cancelBtn:        { width: '100%', borderRadius: 14, borderWidth: 1, borderColor: '#dc2626', paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.06)' },
  cancelBtnText:    { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  primaryBtn:       { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  row:              { flexDirection: 'row', gap: 10, width: '100%' },
  secondaryBtn:     { borderRadius: 14, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
})
