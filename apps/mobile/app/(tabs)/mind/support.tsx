// apps/mobile/app/(tabs)/mind/support.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  Animated, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMindPrefs } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'

// ─── Shared Types ─────────────────────────────────────────────────────────────

type ThemeProps = {
  accent: string; accentSoft: string
  t1: string; t2: string; t3: string; bg: string; card: string; cardBorder: string
}

// ─── Feelings ─────────────────────────────────────────────────────────────────

type Feeling = { id: string; label: string; message: string }

const FEELINGS: Feeling[] = [
  { id: 'overwhelmed', label: 'Overwhelmed', message: "Let's slow things down together." },
  { id: 'anxious',     label: 'Anxious',     message: "You're safe. Let's bring your body back to the present." },
  { id: 'frustrated',  label: 'Frustrated',  message: "Pause before reacting. You have options." },
  { id: 'distracted',  label: 'Distracted',  message: "Let's gently bring your attention back." },
  { id: 'low',         label: 'Low energy',  message: "Small steps count. Let's make this easier." },
]

// ─── Techniques ───────────────────────────────────────────────────────────────

type Technique = { id: string; icon: string; title: string; summary: string }

const TECHNIQUES: Technique[] = [
  { id: 'breathe',   icon: '🌬️', title: 'Breathe With Me',           summary: 'Calm your body in under 2 minutes with guided box breathing.' },
  { id: 'stop',      icon: '🛑', title: 'Pause Before Reacting',      summary: 'Create a breath of space between what you feel and what you do.' },
  { id: 'grounding', icon: '🖐',  title: 'Come Back to Now',          summary: 'Ground yourself gently using your five senses.' },
  { id: 'urge',      icon: '🌊', title: 'Ride the Wave',              summary: "Urges peak and pass — you don't have to act on them." },
  { id: 'opposite',  icon: '🔄', title: 'Choose a Helpful Next Step', summary: 'Do the opposite of what the difficult emotion is pushing you toward.' },
  { id: 'wise',      icon: '🧘', title: 'Find Your Calm Self',        summary: 'Balance your emotional mind and rational mind to find clarity.' },
]

// ─── Pause constants ──────────────────────────────────────────────────────────

const PAUSE_FEELINGS = ['Angry', 'Anxious', 'Hurt', 'Overwhelmed', 'Impulsive']
const PAUSE_ACTIONS  = ['Step away', 'Wait 10 minutes', 'Write it down', 'Ask for help']

// ─── Grounding constants ──────────────────────────────────────────────────────

const SENSES = [
  { count: 5, prompt: '5 things you can see right now' },
  { count: 4, prompt: '4 things you can physically feel' },
  { count: 3, prompt: '3 things you can hear' },
  { count: 2, prompt: '2 things you can smell (or like the smell of)' },
  { count: 1, prompt: '1 thing you can taste' },
]

// ─── Opposite-action constants ────────────────────────────────────────────────

const OPPOSITE_ACTIONS: Record<string, string[]> = {
  Anger:   ['Take a walk', 'Breathe slowly', 'Write it down', 'Speak calmly later'],
  Fear:    ['Do one small thing', 'Stay with the feeling', 'Tell someone', 'Breathe'],
  Shame:   ['Speak kindly to yourself', 'Talk to someone safe', "Remember you're human", 'Do something helpful'],
  Sadness: ['Move your body gently', 'Reach out to someone', 'Do something comforting', 'Name what you\'re feeling'],
  Anxiety: ['Ground yourself (5-4-3-2-1)', 'Focus on what you can control', 'Take one small step', 'Breathe slowly'],
}
const EMOTIONS = Object.keys(OPPOSITE_ACTIONS)

const EMOTION_PUSH: Record<string, string> = {
  Anger:   'Maybe to snap, shout, or push back.',
  Fear:    'Maybe to avoid, freeze, or escape.',
  Shame:   'Maybe to hide, withdraw, or shut down.',
  Sadness: 'Maybe to isolate or stop trying.',
  Anxiety: 'Maybe to worry, overthink, or do nothing.',
}

// ─── Shared: Completion Screen ────────────────────────────────────────────────

function CompletionScreen({
  emoji, title, message, onRepeat, onBack, th,
  repeatLabel = 'Go again', backLabel = 'Back to Support',
}: {
  emoji: string; title: string; message: string
  onRepeat: () => void; onBack: () => void; th: ThemeProps
  repeatLabel?: string; backLabel?: string
}) {
  return (
    <View style={cmpStyles.wrap}>
      <Text style={cmpStyles.emoji}>{emoji}</Text>
      <Text style={[cmpStyles.title, { color: th.t1 }]}>{title}</Text>
      <Text style={[cmpStyles.sub, { color: th.t2 }]}>{message}</Text>
      <View style={cmpStyles.btns}>
        <TouchableOpacity onPress={onRepeat} style={[cmpStyles.btn, { backgroundColor: th.accent }]}>
          <Text style={cmpStyles.btnText}>{repeatLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          style={[cmpStyles.btn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: th.cardBorder }]}
        >
          <Text style={[cmpStyles.btnText, { color: th.t2 }]}>{backLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Shared: Session Shell ────────────────────────────────────────────────────

function SessionShell({
  title, stepLabel, onBack, th, insetTop, children,
}: {
  title: string; stepLabel?: string; onBack: () => void
  th: ThemeProps; insetTop: number; children: React.ReactNode
}) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: th.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[shlStyles.header, { paddingTop: insetTop + 12 }]}>
        <TouchableOpacity onPress={onBack} style={{ width: 70 }}>
          <Text style={[shlStyles.backText, { color: th.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[shlStyles.title, { color: th.t1 }]}>{title}</Text>
          {stepLabel ? <Text style={[shlStyles.step, { color: th.t3 }]}>{stepLabel}</Text> : null}
        </View>
        <View style={{ width: 70 }} />
      </View>
      <ScrollView
        contentContainerStyle={shlStyles.body}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Shared: Chip Row ─────────────────────────────────────────────────────────

function ChipRow({
  options, selected, onSelect, th,
}: {
  options: string[]; selected: string | null; onSelect: (v: string) => void; th: ThemeProps
}) {
  return (
    <View style={chipStyles.row}>
      {options.map((opt) => {
        const active = selected === opt
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              chipStyles.chip,
              { backgroundColor: active ? th.accentSoft : 'transparent', borderColor: active ? th.accent : th.cardBorder },
            ]}
          >
            <Text style={[chipStyles.text, { color: active ? th.accent : th.t2 }]}>{opt}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ─── Box Breathing Session (unchanged) ───────────────────────────────────────

const BOX_PHASES = [
  { label: 'Inhale', duration: 4, targetScale: 1.0  },
  { label: 'Hold',   duration: 4, targetScale: 1.0  },
  { label: 'Exhale', duration: 4, targetScale: 0.45 },
  { label: 'Hold',   duration: 4, targetScale: 0.45 },
]
const TOTAL_CYCLES = 4

type BState = 'idle' | 'running' | 'done'

function BreathingSession({ th, onBack }: { th: ThemeProps; onBack: () => void }) {
  const [bState,      setBState]      = useState<BState>('idle')
  const [phaseIdx,    setPhaseIdx]    = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(BOX_PHASES[0].duration)
  const [cycles,      setCycles]      = useState(0)

  const scale       = useRef(new Animated.Value(0.45)).current
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef    = useRef(0)
  const secsRef     = useRef(BOX_PHASES[0].duration)

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
    setBState('running')
    animateToScale(BOX_PHASES[0].targetScale, BOX_PHASES[0].duration)

    intervalRef.current = setInterval(() => {
      secsRef.current -= 1
      setSecondsLeft(secsRef.current)
      if (secsRef.current <= 0) {
        const nextIdx       = (phaseRef.current + 1) % BOX_PHASES.length
        const completedCycle = nextIdx === 0
        if (completedCycle) {
          setCycles((prev) => {
            const n = prev + 1
            if (n >= TOTAL_CYCLES) { clearTick(); setBState('done') }
            return n
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

  useEffect(() => () => clearTick(), [clearTick])

  const phase = BOX_PHASES[phaseIdx]

  return (
    <View style={bStyles.container}>
      {bState === 'done' && (
        <CompletionScreen
          emoji="✨" title="Nice." message="You gave yourself a moment."
          onRepeat={startSession} onBack={onBack} th={th} repeatLabel="Do another round"
        />
      )}
      {bState === 'idle' && (
        <View style={bStyles.centreWrap}>
          <Animated.View style={[bStyles.circle, { borderColor: th.accent, backgroundColor: th.accentSoft, transform: [{ scale }] }]} />
          <Text style={[bStyles.idleTitle, { color: th.t1 }]}>Box Breathing</Text>
          <Text style={[bStyles.idleSub, { color: th.t2 }]}>4 cycles · ~1 minute</Text>
          <TouchableOpacity onPress={startSession} style={[bStyles.startBtn, { backgroundColor: th.accent }]}>
            <Text style={bStyles.startBtnText}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} style={bStyles.cancelLink}>
            <Text style={[bStyles.cancelText, { color: th.t3 }]}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
      {bState === 'running' && (
        <View style={bStyles.centreWrap}>
          <Text style={[bStyles.cycleCount, { color: th.t3 }]}>
            Cycle {Math.min(cycles + 1, TOTAL_CYCLES)} of {TOTAL_CYCLES}
          </Text>
          <Animated.View style={[bStyles.circle, { borderColor: th.accent, backgroundColor: th.accentSoft, transform: [{ scale }] }]}>
            <Text style={[bStyles.phaseLabel, { color: th.accent }]}>{phase.label}</Text>
            <Text style={[bStyles.countdown, { color: th.accent }]}>{secondsLeft}</Text>
          </Animated.View>
          <TouchableOpacity
            onPress={() => { clearTick(); setBState('idle') }}
            style={[bStyles.stopBtn, { borderColor: th.cardBorder }]}
          >
            <Text style={[bStyles.stopBtnText, { color: th.t2 }]}>■ Stop</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ─── 1. Pause Before Reacting ─────────────────────────────────────────────────

function PauseSession({ th, onBack, insetTop }: { th: ThemeProps; onBack: () => void; insetTop: number }) {
  const [step,    setStep]    = useState(0)
  const [feeling, setFeeling] = useState<string | null>(null)
  const [action,  setAction]  = useState<string | null>(null)

  function reset() { setStep(0); setFeeling(null); setAction(null) }

  if (step === 4) {
    return (
      <View style={[sessStyles.fullCentre, { backgroundColor: th.bg }]}>
        <CompletionScreen
          emoji="🌿" title="Well done." message="You created space before reacting."
          onRepeat={reset} onBack={onBack} th={th} repeatLabel="Go again"
        />
      </View>
    )
  }

  return (
    <SessionShell title="Pause Before Reacting" stepLabel={`Step ${step + 1} of 4`} onBack={onBack} th={th} insetTop={insetTop}>
      {step === 0 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>Stop.</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Don't act yet. Freeze right where you are.</Text>
        <TouchableOpacity onPress={() => setStep(1)} style={[sessStyles.nextBtn, { backgroundColor: th.accent }]}>
          <Text style={sessStyles.nextBtnText}>I've stopped →</Text>
        </TouchableOpacity>
      </>}
      {step === 1 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>Take one slow breath.</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>In through your nose, out through your mouth. Take your time.</Text>
        <TouchableOpacity onPress={() => setStep(2)} style={[sessStyles.nextBtn, { backgroundColor: th.accent }]}>
          <Text style={sessStyles.nextBtnText}>Done →</Text>
        </TouchableOpacity>
      </>}
      {step === 2 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What are you feeling?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Just notice. No judgement.</Text>
        <ChipRow options={PAUSE_FEELINGS} selected={feeling} onSelect={setFeeling} th={th} />
        <TouchableOpacity
          onPress={() => feeling && setStep(3)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: feeling ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </>}
      {step === 3 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What would help right now?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Choose one thing you can do.</Text>
        <ChipRow options={PAUSE_ACTIONS} selected={action} onSelect={setAction} th={th} />
        <TouchableOpacity
          onPress={() => action && setStep(4)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: action ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>I'll do this →</Text>
        </TouchableOpacity>
      </>}
    </SessionShell>
  )
}

// ─── 2. Come Back to Now ──────────────────────────────────────────────────────

function GroundingSession({ th, onBack, insetTop }: { th: ThemeProps; onBack: () => void; insetTop: number }) {
  const [senseIdx, setSenseIdx] = useState(0)
  const [checked,  setChecked]  = useState(() => Array(5).fill(false) as boolean[])
  const [done,     setDone]     = useState(false)

  const sense     = SENSES[senseIdx]
  const items     = Array.from({ length: sense.count }, (_, i) => i)
  const allChecked = checked.slice(0, sense.count).every(Boolean)

  function toggle(i: number) {
    setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n })
  }

  function handleNext() {
    if (senseIdx < SENSES.length - 1) {
      setSenseIdx((p) => p + 1)
      setChecked(Array(5).fill(false))
    } else {
      setDone(true)
    }
  }

  function reset() { setSenseIdx(0); setChecked(Array(5).fill(false)); setDone(false) }

  if (done) {
    return (
      <View style={[sessStyles.fullCentre, { backgroundColor: th.bg }]}>
        <CompletionScreen
          emoji="🌱" title="You're here." message="You are here, right now."
          onRepeat={reset} onBack={onBack} th={th} repeatLabel="Go again"
        />
      </View>
    )
  }

  return (
    <SessionShell title="Come Back to Now" stepLabel={`Sense ${senseIdx + 1} of 5`} onBack={onBack} th={th} insetTop={insetTop}>
      <Text style={[sessStyles.q, { color: th.t1 }]}>{sense.prompt}</Text>
      <Text style={[sessStyles.qSub, { color: th.t2 }]}>Tap each one as you notice it.</Text>
      <View style={{ gap: 10 }}>
        {items.map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => toggle(i)}
            style={[
              grndStyles.row,
              { backgroundColor: checked[i] ? th.accentSoft : th.card, borderColor: checked[i] ? th.accent : th.cardBorder },
            ]}
          >
            <View style={[grndStyles.dot, { borderColor: th.accent, backgroundColor: checked[i] ? th.accent : 'transparent' }]}>
              {checked[i] && <Text style={grndStyles.tick}>✓</Text>}
            </View>
            <Text style={[grndStyles.rowText, { color: checked[i] ? th.accent : th.t1 }]}>
              {checked[i] ? 'Noticed' : `${i + 1}.`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={allChecked ? handleNext : undefined}
        style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: allChecked ? 1 : 0.35 }]}
      >
        <Text style={sessStyles.nextBtnText}>
          {senseIdx < SENSES.length - 1 ? 'Next sense →' : 'Finish →'}
        </Text>
      </TouchableOpacity>
    </SessionShell>
  )
}

// ─── 3. Ride the Wave ─────────────────────────────────────────────────────────

function WaveSession({ th, onBack, insetTop }: { th: ThemeProps; onBack: () => void; insetTop: number }) {
  const [step,      setStep]      = useState(0)
  const [urge,      setUrge]      = useState('')
  const [body,      setBody]      = useState('')
  const [intensity, setIntensity] = useState<number | null>(null)
  const [secsLeft,  setSecsLeft]  = useState(60)
  const [timerDone, setTimerDone] = useState(false)

  const progress    = useRef(new Animated.Value(0)).current
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secsRef     = useRef(60)

  const startTimer = useCallback(() => {
    secsRef.current = 60
    setSecsLeft(60)
    setTimerDone(false)
    progress.setValue(0)
    Animated.timing(progress, { toValue: 1, duration: 60000, useNativeDriver: false }).start()
    intervalRef.current = setInterval(() => {
      secsRef.current -= 1
      setSecsLeft(secsRef.current)
      if (secsRef.current <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimerDone(true)
      }
    }, 1000)
  }, [progress])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function reset() {
    setStep(0); setUrge(''); setBody(''); setIntensity(null)
    setTimerDone(false); secsRef.current = 60; setSecsLeft(60)
    progress.setValue(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  if (step === 4) {
    return (
      <View style={[sessStyles.fullCentre, { backgroundColor: th.bg }]}>
        <CompletionScreen
          emoji="🌊" title="You rode the wave." message="You rode the wave without acting on it."
          onRepeat={reset} onBack={onBack} th={th} repeatLabel="Go again"
        />
      </View>
    )
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  return (
    <SessionShell title="Ride the Wave" stepLabel={`Step ${step + 1} of 4`} onBack={onBack} th={th} insetTop={insetTop}>
      {step === 0 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>Name the urge.</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>"I have an urge to…" — say it without judging it.</Text>
        <TextInput
          value={urge} onChangeText={setUrge}
          placeholder="e.g. check my phone, eat, leave…"
          placeholderTextColor={th.t3}
          style={[sessStyles.input, { color: th.t1, borderColor: th.cardBorder, backgroundColor: th.card }]}
          multiline
        />
        <TouchableOpacity
          onPress={() => urge.trim() && setStep(1)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: urge.trim() ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </>}
      {step === 1 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>Where do you feel it in your body?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Chest, stomach, throat, shoulders — just notice.</Text>
        <TextInput
          value={body} onChangeText={setBody}
          placeholder="e.g. tightness in my chest…"
          placeholderTextColor={th.t3}
          style={[sessStyles.input, { color: th.t1, borderColor: th.cardBorder, backgroundColor: th.card }]}
          multiline
        />
        <TouchableOpacity
          onPress={() => { if (body.trim()) { setStep(2); startTimer() } }}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: body.trim() ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Start the timer →</Text>
        </TouchableOpacity>
      </>}
      {step === 2 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>Ride it out.</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Don't fight it. Don't give in. Just watch it like a wave rising.</Text>
        <View style={[waveStyles.track, { backgroundColor: `${th.accent}22` }]}>
          <Animated.View style={[waveStyles.fill, { width: barWidth, backgroundColor: th.accent }]} />
        </View>
        <Text style={[waveStyles.timer, { color: th.accent }]}>{secsLeft}s</Text>
        {timerDone && (
          <TouchableOpacity onPress={() => setStep(3)} style={[sessStyles.nextBtn, { backgroundColor: th.accent }]}>
            <Text style={sessStyles.nextBtnText}>The wave is passing →</Text>
          </TouchableOpacity>
        )}
      </>}
      {step === 3 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>How strong is the urge now?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>1 = barely there · 5 = still strong</Text>
        <View style={chipStyles.row}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = intensity === n
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setIntensity(n)}
                style={[chipStyles.chip, { backgroundColor: active ? th.accentSoft : 'transparent', borderColor: active ? th.accent : th.cardBorder }]}
              >
                <Text style={[chipStyles.text, { color: active ? th.accent : th.t2 }]}>{n}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity
          onPress={() => intensity && setStep(4)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: intensity ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Done →</Text>
        </TouchableOpacity>
      </>}
    </SessionShell>
  )
}

// ─── 4. Choose a Helpful Next Step ────────────────────────────────────────────

function NextStepSession({ th, onBack, insetTop }: { th: ThemeProps; onBack: () => void; insetTop: number }) {
  const [step,    setStep]    = useState(0)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [action,  setAction]  = useState<string | null>(null)

  function reset() { setStep(0); setEmotion(null); setAction(null) }

  if (step === 3) {
    return (
      <View style={[sessStyles.fullCentre, { backgroundColor: th.bg }]}>
        <CompletionScreen
          emoji="🔄" title="Intention set." message="You chose a next step with intention."
          onRepeat={reset} onBack={onBack} th={th} repeatLabel="Go again"
        />
      </View>
    )
  }

  return (
    <SessionShell title="Choose a Helpful Next Step" stepLabel={`Step ${step + 1} of 3`} onBack={onBack} th={th} insetTop={insetTop}>
      {step === 0 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What emotion is strongest right now?</Text>
        <ChipRow options={EMOTIONS} selected={emotion} onSelect={setEmotion} th={th} />
        <TouchableOpacity
          onPress={() => emotion && setStep(1)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: emotion ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </>}
      {step === 1 && emotion && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What is it pushing you to do?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>{EMOTION_PUSH[emotion]}</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>You don't have to act on that impulse.</Text>
        <TouchableOpacity onPress={() => setStep(2)} style={[sessStyles.nextBtn, { backgroundColor: th.accent }]}>
          <Text style={sessStyles.nextBtnText}>I see it →</Text>
        </TouchableOpacity>
      </>}
      {step === 2 && emotion && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>Choose one helpful next step.</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>The opposite of what {emotion.toLowerCase()} wants you to do.</Text>
        <ChipRow options={OPPOSITE_ACTIONS[emotion]} selected={action} onSelect={setAction} th={th} />
        <TouchableOpacity
          onPress={() => action && setStep(3)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: action ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>I'll do this →</Text>
        </TouchableOpacity>
      </>}
    </SessionShell>
  )
}

// ─── 5. Find Your Calm Self ───────────────────────────────────────────────────

function CalmSelfSession({ th, onBack, insetTop }: { th: ThemeProps; onBack: () => void; insetTop: number }) {
  const [step,      setStep]      = useState(0)
  const [emotional, setEmotional] = useState('')
  const [rational,  setRational]  = useState('')
  const [calm,      setCalm]      = useState('')

  function reset() { setStep(0); setEmotional(''); setRational(''); setCalm('') }

  if (step === 3) {
    return (
      <View style={[sessStyles.fullCentre, { backgroundColor: th.bg }]}>
        <CompletionScreen
          emoji="🧘" title="There it is." message="You found a balanced next step."
          onRepeat={reset} onBack={onBack} th={th} repeatLabel="Go again"
        />
      </View>
    )
  }

  return (
    <SessionShell title="Find Your Calm Self" stepLabel={`Step ${step + 1} of 3`} onBack={onBack} th={th} insetTop={insetTop}>
      {step === 0 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What is your emotional mind saying?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>What are your feelings telling you to do? Write it out honestly.</Text>
        <TextInput
          value={emotional} onChangeText={setEmotional}
          placeholder="e.g. I want to give up, I feel like no one cares…"
          placeholderTextColor={th.t3}
          style={[sessStyles.input, { color: th.t1, borderColor: th.cardBorder, backgroundColor: th.card }]}
          multiline
        />
        <TouchableOpacity
          onPress={() => emotional.trim() && setStep(1)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: emotional.trim() ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </>}
      {step === 1 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What does your rational mind know?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Set feelings aside for a moment. What are the facts?</Text>
        <TextInput
          value={rational} onChangeText={setRational}
          placeholder="e.g. I've handled this before. This will pass…"
          placeholderTextColor={th.t3}
          style={[sessStyles.input, { color: th.t1, borderColor: th.cardBorder, backgroundColor: th.card }]}
          multiline
        />
        <TouchableOpacity
          onPress={() => rational.trim() && setStep(2)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: rational.trim() ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </>}
      {step === 2 && <>
        <Text style={[sessStyles.q, { color: th.t1 }]}>What would your calm self choose?</Text>
        <Text style={[sessStyles.qSub, { color: th.t2 }]}>Somewhere between the emotion and the logic, there's your wise answer.</Text>
        <TextInput
          value={calm} onChangeText={setCalm}
          placeholder="e.g. Talk to them calmly tomorrow…"
          placeholderTextColor={th.t3}
          style={[sessStyles.input, { color: th.t1, borderColor: th.cardBorder, backgroundColor: th.card }]}
          multiline
        />
        <TouchableOpacity
          onPress={() => calm.trim() && setStep(3)}
          style={[sessStyles.nextBtn, { backgroundColor: th.accent, opacity: calm.trim() ? 1 : 0.4 }]}
        >
          <Text style={sessStyles.nextBtnText}>That's my next step →</Text>
        </TouchableOpacity>
      </>}
    </SessionShell>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SupportScreen() {
  const router   = useRouter()
  const insets   = useSafeAreaInsets()
  const { prefs } = useMindPrefs()
  const mt       = MIND_THEMES[prefs.theme]
  const th: ThemeProps = {
    accent: mt.accent, accentSoft: mt.accentSoft,
    t1: mt.t1, t2: mt.t2, t3: mt.t3, bg: mt.bg, card: mt.card,
    cardBorder: `${mt.t3}88`,
  }

  const [feeling,       setFeeling]       = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<string | null>(null)

  const endSession = () => setActiveSession(null)

  if (activeSession === 'breathe') {
    return (
      <View style={{ flex: 1, backgroundColor: th.bg }}>
        <View style={[scrnStyles.header, { paddingTop: insets.top + 12 }]}>
          <View style={{ width: 70 }} />
          <Text style={[scrnStyles.headerTitle, { color: th.t1 }]}>Breathe With Me</Text>
          <View style={{ width: 70 }} />
        </View>
        <BreathingSession th={th} onBack={endSession} />
      </View>
    )
  }
  if (activeSession === 'stop')      return <PauseSession      th={th} onBack={endSession} insetTop={insets.top} />
  if (activeSession === 'grounding') return <GroundingSession  th={th} onBack={endSession} insetTop={insets.top} />
  if (activeSession === 'urge')      return <WaveSession       th={th} onBack={endSession} insetTop={insets.top} />
  if (activeSession === 'opposite')  return <NextStepSession   th={th} onBack={endSession} insetTop={insets.top} />
  if (activeSession === 'wise')      return <CalmSelfSession   th={th} onBack={endSession} insetTop={insets.top} />

  const selectedFeeling = FEELINGS.find((f) => f.id === feeling)

  return (
    <View style={[scrnStyles.container, { backgroundColor: th.bg }]}>
      <View style={[scrnStyles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 70 }}>
          <Text style={[scrnStyles.backText, { color: th.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[scrnStyles.headerTitle, { color: th.t1 }]}>Take a moment</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={[scrnStyles.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={[scrnStyles.heroSub, { color: th.t2 }]}>
          You don't have to figure this out alone.
        </Text>

        {/* Feeling chips */}
        <View style={[scrnStyles.section, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <Text style={[scrnStyles.sectionLabel, { color: th.t1 }]}>How are you feeling right now?</Text>
          <View style={chipStyles.row}>
            {FEELINGS.map((f) => {
              const active = feeling === f.id
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFeeling((prev) => prev === f.id ? null : f.id)}
                  style={[chipStyles.chip, { backgroundColor: active ? th.accentSoft : 'transparent', borderColor: active ? th.accent : th.cardBorder }]}
                >
                  <Text style={[chipStyles.text, { color: active ? th.accent : th.t2 }]}>{f.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {selectedFeeling && (
            <View style={[scrnStyles.feelingMsg, { backgroundColor: th.accentSoft, borderColor: th.accent }]}>
              <Text style={[scrnStyles.feelingMsgText, { color: th.accent }]}>{selectedFeeling.message}</Text>
            </View>
          )}
        </View>

        {/* Support tool cards */}
        <Text style={[scrnStyles.toolsLabel, { color: th.t3 }]}>Support tools</Text>

        {TECHNIQUES.map((tech) => (
          <View key={tech.id} style={[scrnStyles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <View style={scrnStyles.cardRow}>
              <View style={[scrnStyles.iconWrap, { backgroundColor: `${th.t3}22` }]}>
                <Text style={scrnStyles.icon}>{tech.icon}</Text>
              </View>
              <View style={scrnStyles.cardBody}>
                <Text style={[scrnStyles.cardTitle, { color: th.t1 }]}>{tech.title}</Text>
                <Text style={[scrnStyles.cardSummary, { color: th.t2 }]}>{tech.summary}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setActiveSession(tech.id)}
              style={[scrnStyles.startBtn, { borderTopColor: th.cardBorder }]}
            >
              <Text style={[scrnStyles.startBtnText, { color: th.accent }]}>Start →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

// ─── StyleSheets ──────────────────────────────────────────────────────────────

const cmpStyles = StyleSheet.create({
  wrap:    { alignItems: 'center', gap: 14, padding: 24 },
  emoji:   { fontSize: 56 },
  title:   { fontSize: 28, fontWeight: '900' },
  sub:     { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  btns:    { gap: 12, width: '100%', marginTop: 12 },
  btn:     { borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
})

const shlStyles = StyleSheet.create({
  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backText: { fontSize: 16, fontWeight: '600' },
  title:    { fontSize: 17, fontWeight: '800' },
  step:     { fontSize: 11, fontWeight: '600', marginTop: 2 },
  body:     { padding: 20, gap: 20, paddingBottom: 60 },
})

const chipStyles = StyleSheet.create({
  row:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  text: { fontSize: 14, fontWeight: '700' },
})

const sessStyles = StyleSheet.create({
  fullCentre: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  q:          { fontSize: 24, fontWeight: '900', lineHeight: 32 },
  qSub:       { fontSize: 15, lineHeight: 22 },
  nextBtn:    { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  nextBtnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, minHeight: 80, textAlignVertical: 'top',
  },
})

const grndStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1.5 },
  dot:     { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tick:    { color: '#fff', fontSize: 12, fontWeight: '800' },
  rowText: { fontSize: 15, fontWeight: '600' },
})

const waveStyles = StyleSheet.create({
  track: { borderRadius: 8, height: 14, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 8 },
  timer: { textAlign: 'center', fontSize: 40, fontWeight: '900' },
})

const bStyles = StyleSheet.create({
  container:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centreWrap:  { alignItems: 'center', gap: 20 },
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
})

const scrnStyles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backText:     { fontSize: 16, fontWeight: '600' },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  body:         { padding: 16, gap: 14 },
  heroSub:      { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  section:      { borderRadius: 18, borderWidth: 1.5, padding: 18, gap: 14 },
  sectionLabel: { fontSize: 15, fontWeight: '800' },
  feelingMsg:   { borderWidth: 1.5, borderRadius: 12, padding: 12 },
  feelingMsgText:{ fontSize: 14, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  toolsLabel:   { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  card:         { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  cardRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon:         { fontSize: 22 },
  cardBody:     { flex: 1, minWidth: 0 },
  cardTitle:    { fontSize: 15, fontWeight: '800' },
  cardSummary:  { fontSize: 12, marginTop: 2, lineHeight: 16 },
  startBtn:     { borderTopWidth: 1, paddingVertical: 14, alignItems: 'center' },
  startBtnText: { fontSize: 14, fontWeight: '800' },
})
