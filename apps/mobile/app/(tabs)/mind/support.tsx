// apps/mobile/app/(tabs)/mind/support.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMindPrefs } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'

// ─── Feelings ────────────────────────────────────────────────────────────────

type Feeling = { id: string; label: string; message: string }

const FEELINGS: Feeling[] = [
  { id: 'overwhelmed', label: 'Overwhelmed',  message: "Let's slow things down together." },
  { id: 'anxious',     label: 'Anxious',       message: "You're safe. Let's bring your body back to the present." },
  { id: 'frustrated',  label: 'Frustrated',    message: "Pause before reacting. You have options." },
  { id: 'distracted',  label: 'Distracted',    message: "Let's gently bring your attention back." },
  { id: 'low',         label: 'Low energy',    message: "Small steps count. Let's make this easier." },
]

// ─── Techniques ──────────────────────────────────────────────────────────────

type Technique = {
  id:      string
  icon:    string
  title:   string
  summary: string
  steps:   string[]
  hasSession?: boolean
}

const TECHNIQUES: Technique[] = [
  {
    id:         'breathe',
    icon:       '🌬️',
    title:      'Breathe With Me',
    summary:    'Calm your body in under 2 minutes with guided box breathing.',
    hasSession: true,
    steps: [
      'Press Start to begin a guided 4-cycle session.',
      'Breathe in slowly as the circle expands — 4 seconds.',
      'Hold gently at the top — 4 seconds.',
      'Let the breath go as the circle shrinks — 4 seconds.',
      'Hold softly at the bottom — 4 seconds.',
      'Repeat 4 times. You\'ll feel the difference.',
    ],
  },
  {
    id:      'stop',
    icon:    '🛑',
    title:   'Pause Before Reacting',
    summary: 'Create a breath of space between what you feel and what you do.',
    steps: [
      'Stop. Freeze right where you are. Don\'t act yet.',
      'Take a step back. Breathe slowly. Move away if you need to.',
      'Observe what\'s happening — in your body, thoughts, and around you.',
      'Proceed with intention. Ask yourself: what would actually help right now?',
    ],
  },
  {
    id:      'grounding',
    icon:    '🖐',
    title:   'Come Back to Now',
    summary: 'Ground yourself gently using your five senses.',
    steps: [
      'Notice 5 things you can see around you right now.',
      'Notice 4 things you can physically feel — floor, fabric, air on skin.',
      'Notice 3 things you can hear.',
      'Notice 2 things you can smell, or like the smell of.',
      'Notice 1 thing you can taste.',
      'Take a slow breath. You\'re here. You\'re okay.',
    ],
  },
  {
    id:      'urge',
    icon:    '🌊',
    title:   'Ride the Wave',
    summary: 'Urges peak and pass — you don\'t have to act on them.',
    steps: [
      'Name the urge without judgement: "I have an urge to..."',
      'Don\'t fight it, don\'t give in. Just watch it.',
      'Breathe slowly and notice where you feel it in your body.',
      'Urges rise like waves — they peak in minutes, then fade.',
      'When it passes, notice: you got through it without acting.',
    ],
  },
  {
    id:      'opposite',
    icon:    '🔄',
    title:   'Choose a Helpful Next Step',
    summary: 'Do the opposite of what the difficult emotion is pushing you toward.',
    steps: [
      'Name the emotion honestly (anger, shame, fear, sadness).',
      'Notice the urge it creates — to hide, snap, avoid, or shut down.',
      'Ask: will acting on this urge make things better or worse?',
      'Choose the opposite behaviour and commit to it fully.',
      'Repeat until the emotional intensity starts to ease.',
    ],
  },
  {
    id:      'wise',
    icon:    '🧘',
    title:   'Find Your Calm Self',
    summary: 'Balance your emotional mind and rational mind to find clarity.',
    steps: [
      'Emotional mind: what is it saying you should do right now?',
      'Rational mind: what does logic and the facts say?',
      'Your calm self lives in the middle of both.',
      'Ask quietly: "What would my calm, wise self do here?"',
      'Sit with the answer for a moment. Trust it.',
    ],
  },
]

// ─── Box Breathing Session ────────────────────────────────────────────────────

const BOX_PHASES = [
  { label: 'Inhale', duration: 4, targetScale: 1.0 },
  { label: 'Hold',   duration: 4, targetScale: 1.0 },
  { label: 'Exhale', duration: 4, targetScale: 0.45 },
  { label: 'Hold',   duration: 4, targetScale: 0.45 },
]
const TOTAL_CYCLES = 4

type SessionState = 'idle' | 'running' | 'done'

function BreathingSession({
  accent, accentSoft, t1, t2, t3, bg,
  onBack,
}: {
  accent: string; accentSoft: string; t1: string; t2: string; t3: string; bg: string
  onBack: () => void
}) {
  const [state,       setState]       = useState<SessionState>('idle')
  const [phaseIdx,    setPhaseIdx]    = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(BOX_PHASES[0].duration)
  const [cycles,      setCycles]      = useState(0)

  const scale     = useRef(new Animated.Value(0.45)).current
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef  = useRef(0)
  const secsRef   = useRef(BOX_PHASES[0].duration)

  const clearTick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const animateToScale = useCallback((target: number, duration: number) => {
    Animated.timing(scale, {
      toValue: target, duration: duration * 1000, useNativeDriver: true,
    }).start()
  }, [scale])

  const startSession = useCallback(() => {
    phaseRef.current = 0
    secsRef.current  = BOX_PHASES[0].duration
    setPhaseIdx(0)
    setSecondsLeft(BOX_PHASES[0].duration)
    setCycles(0)
    setState('running')
    animateToScale(BOX_PHASES[0].targetScale, BOX_PHASES[0].duration)

    intervalRef.current = setInterval(() => {
      secsRef.current -= 1
      setSecondsLeft(secsRef.current)

      if (secsRef.current <= 0) {
        const nextIdx = (phaseRef.current + 1) % BOX_PHASES.length
        const completedCycle = nextIdx === 0

        if (completedCycle) {
          setCycles((prev) => {
            const newCount = prev + 1
            if (newCount >= TOTAL_CYCLES) {
              clearTick()
              setState('done')
              return newCount
            }
            return newCount
          })
        }

        phaseRef.current = nextIdx
        secsRef.current  = BOX_PHASES[nextIdx].duration
        setPhaseIdx(nextIdx)
        setSecondsLeft(secsRef.current)
        animateToScale(BOX_PHASES[nextIdx].targetScale, BOX_PHASES[nextIdx].duration)
      }
    }, 1000)
  }, [animateToScale, clearTick])

  // Cleanup on unmount
  useEffect(() => () => clearTick(), [clearTick])

  const phase = BOX_PHASES[phaseIdx]

  if (state === 'done') {
    return (
      <View style={[bStyles.container, { backgroundColor: bg }]}>
        <View style={bStyles.doneWrap}>
          <Text style={bStyles.doneEmoji}>✨</Text>
          <Text style={[bStyles.doneTitle, { color: t1 }]}>Nice.</Text>
          <Text style={[bStyles.doneSub, { color: t2 }]}>You gave yourself a moment.</Text>
        </View>
        <View style={bStyles.doneBtns}>
          <TouchableOpacity
            onPress={startSession}
            style={[bStyles.btn, { backgroundColor: accent }]}
          >
            <Text style={bStyles.btnText}>Do another round</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onBack}
            style={[bStyles.btn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: `${t3}88` }]}
          >
            <Text style={[bStyles.btnText, { color: t2 }]}>Back to Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (state === 'idle') {
    return (
      <View style={[bStyles.container, { backgroundColor: bg }]}>
        <View style={bStyles.idleWrap}>
          <Animated.View style={[bStyles.circle, { borderColor: accent, backgroundColor: accentSoft, transform: [{ scale }] }]} />
          <Text style={[bStyles.idleTitle, { color: t1 }]}>Box Breathing</Text>
          <Text style={[bStyles.idleSub, { color: t2 }]}>4 cycles · ~1 minute</Text>
          <TouchableOpacity onPress={startSession} style={[bStyles.startBtn, { backgroundColor: accent }]}>
            <Text style={bStyles.startBtnText}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} style={bStyles.cancelLink}>
            <Text style={[bStyles.cancelText, { color: t3 }]}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[bStyles.container, { backgroundColor: bg }]}>
      <View style={bStyles.runningWrap}>
        <Text style={[bStyles.cycleCount, { color: t3 }]}>
          Cycle {Math.min(cycles + 1, TOTAL_CYCLES)} of {TOTAL_CYCLES}
        </Text>
        <Animated.View style={[bStyles.circle, { borderColor: accent, backgroundColor: accentSoft, transform: [{ scale }] }]}>
          <Text style={[bStyles.phaseLabel, { color: accent }]}>{phase.label}</Text>
          <Text style={[bStyles.countdown, { color: accent }]}>{secondsLeft}</Text>
        </Animated.View>
        <TouchableOpacity onPress={() => { clearTick(); setState('idle') }} style={[bStyles.stopBtn, { borderColor: `${t3}88` }]}>
          <Text style={[bStyles.stopBtnText, { color: t2 }]}>■ Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const bStyles = StyleSheet.create({
  container:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  idleWrap:    { alignItems: 'center', gap: 20 },
  runningWrap: { alignItems: 'center', gap: 24 },
  doneWrap:    { alignItems: 'center', gap: 12, marginBottom: 40 },
  circle: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  idleTitle:   { fontSize: 22, fontWeight: '900' },
  idleSub:     { fontSize: 14 },
  startBtn:    { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 },
  startBtnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelLink:  { paddingVertical: 8 },
  cancelText:  { fontSize: 14 },
  cycleCount:  { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  phaseLabel:  { fontSize: 16, fontWeight: '700' },
  countdown:   { fontSize: 40, fontWeight: '900', marginTop: 4 },
  stopBtn:     { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  stopBtnText: { fontSize: 15, fontWeight: '700' },
  doneEmoji:   { fontSize: 48 },
  doneTitle:   { fontSize: 28, fontWeight: '900' },
  doneSub:     { fontSize: 16, textAlign: 'center' },
  doneBtns:    { gap: 12, width: '80%' },
  btn:         { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '800' },
})

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SupportScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { prefs } = useMindPrefs()
  const mt      = MIND_THEMES[prefs.theme]

  const [feeling,   setFeeling]   = useState<string | null>(null)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [breathing, setBreathing] = useState(false)

  const cardBorder = `${mt.t3}88`

  function toggleFeeling(id: string) {
    setFeeling((prev) => (prev === id ? null : id))
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  const selectedFeeling = FEELINGS.find((f) => f.id === feeling)

  if (breathing) {
    return (
      <View style={{ flex: 1, backgroundColor: mt.bg }}>
        <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8 }, styles.header]}>
          <View style={{ width: 70 }} />
          <Text style={[styles.headerTitle, { color: mt.t1 }]}>Breathe With Me</Text>
          <View style={{ width: 70 }} />
        </View>
        <BreathingSession
          accent={mt.accent} accentSoft={mt.accentSoft}
          t1={mt.t1} t2={mt.t2} t3={mt.t3} bg={mt.bg}
          onBack={() => setBreathing(false)}
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: mt.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: mt.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: mt.t1 }]}>Take a moment</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroSub, { color: mt.t2 }]}>
            You don't have to figure this out alone.
          </Text>
        </View>

        {/* Feeling chips */}
        <View style={[styles.section, { backgroundColor: mt.card, borderColor: cardBorder }]}>
          <Text style={[styles.sectionLabel, { color: mt.t1 }]}>How are you feeling right now?</Text>
          <View style={styles.chips}>
            {FEELINGS.map((f) => {
              const active = feeling === f.id
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => toggleFeeling(f.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? mt.accentSoft : 'transparent',
                      borderColor:     active ? mt.accent     : cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? mt.accent : mt.t2 }]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {selectedFeeling && (
            <View style={[styles.feelingMsg, { backgroundColor: mt.accentSoft, borderColor: mt.accent }]}>
              <Text style={[styles.feelingMsgText, { color: mt.accent }]}>
                {selectedFeeling.message}
              </Text>
            </View>
          )}
        </View>

        {/* Techniques */}
        <Text style={[styles.techniquesLabel, { color: mt.t3 }]}>Support tools</Text>

        {TECHNIQUES.map((tech) => {
          const open = expanded === tech.id
          return (
            <TouchableOpacity
              key={tech.id}
              onPress={() => toggleExpand(tech.id)}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: mt.card, borderColor: open ? mt.accent : cardBorder }]}
            >
              {/* Card row */}
              <View style={styles.cardRow}>
                <View style={[styles.iconWrap, { backgroundColor: open ? mt.accentSoft : `${mt.t3}22` }]}>
                  <Text style={styles.icon}>{tech.icon}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: mt.t1 }]}>{tech.title}</Text>
                  <Text style={[styles.cardSummary, { color: mt.t2 }]}>{tech.summary}</Text>
                </View>
                <Text style={[styles.chevron, { color: open ? mt.accent : mt.t3 }]}>
                  {open ? '▾' : '›'}
                </Text>
              </View>

              {/* Expanded */}
              {open && (
                <View style={[styles.steps, { borderTopColor: cardBorder }]}>
                  {tech.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View style={[styles.stepDot, { backgroundColor: mt.accent }]} />
                      <Text style={[styles.stepText, { color: mt.t1 }]}>{step}</Text>
                    </View>
                  ))}

                  {tech.hasSession && (
                    <TouchableOpacity
                      onPress={() => setBreathing(true)}
                      style={[styles.sessionBtn, { backgroundColor: mt.accent }]}
                    >
                      <Text style={styles.sessionBtnText}>🌬️  Start Session</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn:        { width: 70 },
  backText:       { fontSize: 16, fontWeight: '600' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  body:           { padding: 16, gap: 14 },
  hero:           { alignItems: 'center', paddingVertical: 4 },
  heroSub:        { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  section:        { borderRadius: 18, borderWidth: 1.5, padding: 18, gap: 14 },
  sectionLabel:   { fontSize: 15, fontWeight: '800' },
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText:       { fontSize: 13, fontWeight: '700' },
  feelingMsg:     { borderWidth: 1.5, borderRadius: 12, padding: 12 },
  feelingMsgText: { fontSize: 14, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  techniquesLabel:{ fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  card:           { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  cardRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap:       { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon:           { fontSize: 22 },
  cardBody:       { flex: 1, minWidth: 0 },
  cardTitle:      { fontSize: 15, fontWeight: '800' },
  cardSummary:    { fontSize: 12, marginTop: 2, lineHeight: 16 },
  chevron:        { fontSize: 18, fontWeight: '600', flexShrink: 0 },
  steps:          { borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 10 },
  stepRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepDot:        { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  stepText:       { flex: 1, fontSize: 13, lineHeight: 20 },
  sessionBtn:     { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  sessionBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
})
