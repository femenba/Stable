'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '../../../../src/components/theme-toggle'

// ─── Constants ────────────────────────────────────────────────────────────────

const FEELINGS = [
  { id: 'overwhelmed', label: 'Overwhelmed', message: "Let's slow things down together." },
  { id: 'anxious',     label: 'Anxious',     message: "You're safe. Let's bring your body back to the present." },
  { id: 'frustrated',  label: 'Frustrated',  message: 'Pause before reacting. You have options.' },
  { id: 'distracted',  label: 'Distracted',  message: "Let's gently bring your attention back." },
  { id: 'low',         label: 'Low energy',  message: "Small steps count. Let's make this easier." },
]

const TOOLS = [
  { id: 'breathe',   icon: '🌬️', title: 'Breathe With Me',           summary: 'Calm your body in under 2 minutes with guided box breathing.'          },
  { id: 'stop',      icon: '🛑', title: 'Pause Before Reacting',      summary: 'Create a breath of space between what you feel and what you do.'        },
  { id: 'grounding', icon: '🖐',  title: 'Come Back to Now',          summary: 'Ground yourself gently using your five senses.'                         },
  { id: 'urge',      icon: '🌊', title: 'Ride the Wave',              summary: "Urges peak and pass — you don't have to act on them."                   },
  { id: 'opposite',  icon: '🔄', title: 'Choose a Helpful Next Step', summary: 'Do the opposite of what the difficult emotion is pushing you toward.'    },
  { id: 'wise',      icon: '🧘', title: 'Find Your Calm Self',        summary: 'Balance your emotional mind and rational mind to find clarity.'          },
]

const PAUSE_FEELINGS = ['Angry', 'Anxious', 'Hurt', 'Overwhelmed', 'Impulsive']
const PAUSE_ACTIONS  = ['Step away', 'Wait 10 minutes', 'Write it down', 'Ask for help']

const SENSES = [
  { count: 5, prompt: '5 things you can see right now' },
  { count: 4, prompt: '4 things you can physically feel' },
  { count: 3, prompt: '3 things you can hear' },
  { count: 2, prompt: '2 things you can smell (or like the smell of)' },
  { count: 1, prompt: '1 thing you can taste' },
]

const OPPOSITE_ACTIONS: Record<string, string[]> = {
  Anger:   ['Take a walk', 'Breathe slowly', 'Write it down', 'Speak calmly later'],
  Fear:    ['Do one small thing', 'Stay with the feeling', 'Tell someone', 'Breathe'],
  Shame:   ['Speak kindly to yourself', 'Talk to someone safe', "Remember you're human", 'Do something helpful'],
  Sadness: ['Move your body gently', 'Reach out to someone', 'Do something comforting', "Name what you're feeling"],
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

const BOX_PHASES = [
  { label: 'Inhale', duration: 4, scale: 1.0  },
  { label: 'Hold',   duration: 4, scale: 1.0  },
  { label: 'Exhale', duration: 4, scale: 0.45 },
  { label: 'Hold',   duration: 4, scale: 0.45 },
]
const TOTAL_CYCLES = 4

// ─── Shared sub-components ────────────────────────────────────────────────────

function CompletionScreen({ emoji, title, message, onRepeat, onBack, repeatLabel = 'Go again' }: {
  emoji: string; title: string; message: string
  onRepeat: () => void; onBack: () => void; repeatLabel?: string
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 px-4 text-center max-w-sm mx-auto">
      <span className="text-6xl">{emoji}</span>
      <div>
        <p className="text-2xl font-extrabold" style={{ color: 'var(--stable-t1)' }}>{title}</p>
        <p className="text-base mt-2 leading-relaxed" style={{ color: 'var(--stable-t2)' }}>{message}</p>
      </div>
      <div className="w-full space-y-3 mt-2">
        <button onClick={onRepeat} className="w-full py-3.5 rounded-xl text-white font-bold" style={{ background: 'var(--stable-cta)' }}>
          {repeatLabel}
        </button>
        <button
          onClick={onBack}
          className="w-full py-3.5 rounded-xl font-bold border-2 text-sm"
          style={{ borderColor: 'var(--stable-card-border)', color: 'var(--stable-t2)' }}
        >
          Back to Support
        </button>
      </div>
    </div>
  )
}

function Chips({ options, selected, onSelect }: { options: string[]; selected: string | null; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected === opt
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="px-4 py-2 rounded-full border-2 text-sm font-bold transition-all"
            style={{
              borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
              background:  active ? 'rgba(79,58,255,0.1)' : 'transparent',
              color:       active ? 'var(--cat-work)' : 'var(--stable-t2)',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function NextBtn({ onClick, disabled, label = 'Next →' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-opacity"
      style={{ background: 'var(--stable-cta)', opacity: disabled ? 0.35 : 1 }}
    >
      {label}
    </button>
  )
}

function Q({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xl font-extrabold leading-snug" style={{ color: 'var(--stable-t1)' }}>{text}</p>
      {sub && <p className="text-sm leading-relaxed" style={{ color: 'var(--stable-t2)' }}>{sub}</p>}
    </div>
  )
}

function StepBadge({ current, total }: { current: number; total: number }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
      Step {current} of {total}
    </p>
  )
}

// ─── Breathe With Me ──────────────────────────────────────────────────────────

function BreatheFlow({ onBack }: { onBack: () => void }) {
  type BS = 'idle' | 'running' | 'done'
  const [bState,      setBState]      = useState<BS>('idle')
  const [phaseIdx,    setPhaseIdx]    = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(BOX_PHASES[0].duration)
  const [cycles,      setCycles]      = useState(0)
  const [circleScale, setCircleScale] = useState(0.45)
  const [phaseDur,    setPhaseDur]    = useState(4)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef    = useRef(0)
  const secsRef     = useRef(BOX_PHASES[0].duration)
  const cyclesRef   = useRef(0)

  const clearTick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const startSession = useCallback(() => {
    phaseRef.current  = 0
    secsRef.current   = BOX_PHASES[0].duration
    cyclesRef.current = 0
    setPhaseIdx(0)
    setSecondsLeft(BOX_PHASES[0].duration)
    setCycles(0)
    setBState('running')
    setCircleScale(BOX_PHASES[0].scale)
    setPhaseDur(BOX_PHASES[0].duration)

    intervalRef.current = setInterval(() => {
      secsRef.current -= 1
      setSecondsLeft(secsRef.current)
      if (secsRef.current <= 0) {
        const nextIdx        = (phaseRef.current + 1) % BOX_PHASES.length
        const completedCycle = nextIdx === 0
        if (completedCycle) {
          cyclesRef.current += 1
          setCycles(cyclesRef.current)
          if (cyclesRef.current >= TOTAL_CYCLES) {
            clearTick()
            setBState('done')
            return
          }
        }
        phaseRef.current = nextIdx
        secsRef.current  = BOX_PHASES[nextIdx].duration
        setPhaseIdx(nextIdx)
        setSecondsLeft(secsRef.current)
        setCircleScale(BOX_PHASES[nextIdx].scale)
        setPhaseDur(BOX_PHASES[nextIdx].duration)
      }
    }, 1000)
  }, [clearTick])

  useEffect(() => () => clearTick(), [clearTick])

  const phase = BOX_PHASES[phaseIdx]

  if (bState === 'done') {
    return <CompletionScreen emoji="✨" title="Nice." message="You gave yourself a moment." onRepeat={startSession} onBack={onBack} repeatLabel="Do another round" />
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {bState === 'running' && (
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
          Cycle {Math.min(cycles + 1, TOTAL_CYCLES)} of {TOTAL_CYCLES}
        </p>
      )}

      <div
        className="flex flex-col items-center justify-center rounded-full border-4"
        style={{
          width: 200, height: 200,
          borderColor:  'var(--cat-work)',
          background:   'rgba(79,58,255,0.1)',
          transform:    `scale(${circleScale})`,
          transition:   `transform ${phaseDur}s ease-in-out`,
        }}
      >
        {bState === 'running' && (
          <>
            <p className="font-bold text-sm" style={{ color: 'var(--cat-work)' }}>{phase.label}</p>
            <p className="text-5xl font-black mt-1" style={{ color: 'var(--cat-work)' }}>{secondsLeft}</p>
          </>
        )}
      </div>

      {bState === 'idle' && (
        <>
          <div className="text-center">
            <p className="text-xl font-extrabold" style={{ color: 'var(--stable-t1)' }}>Box Breathing</p>
            <p className="text-sm mt-1" style={{ color: 'var(--stable-t2)' }}>4 cycles · ~1 minute</p>
          </div>
          <button onClick={startSession} className="px-10 py-3.5 rounded-xl text-white font-bold" style={{ background: 'var(--stable-cta)' }}>
            Start Session
          </button>
          <button onClick={onBack} className="text-sm" style={{ color: 'var(--stable-t3)' }}>Back</button>
        </>
      )}

      {bState === 'running' && (
        <button
          onClick={() => { clearTick(); setBState('idle') }}
          className="px-6 py-2.5 rounded-xl border-2 text-sm font-bold"
          style={{ borderColor: 'var(--stable-card-border)', color: 'var(--stable-t2)' }}
        >
          ■ Stop
        </button>
      )}
    </div>
  )
}

// ─── Pause Before Reacting ────────────────────────────────────────────────────

function PauseFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [feeling, setFeeling] = useState<string | null>(null)
  const [action,  setAction]  = useState<string | null>(null)
  const reset = () => { setStep(0); setFeeling(null); setAction(null) }

  if (step === 4) return <CompletionScreen emoji="🌿" title="Well done." message="You created space before reacting." onRepeat={reset} onBack={onBack} repeatLabel="Go again" />

  return (
    <div className="space-y-6 max-w-sm mx-auto py-4">
      <StepBadge current={step + 1} total={4} />
      {step === 0 && <>
        <Q text="Stop." sub="Don't act yet. Freeze right where you are." />
        <NextBtn onClick={() => setStep(1)} label="I've stopped →" />
      </>}
      {step === 1 && <>
        <Q text="Take one slow breath." sub="In through your nose, out through your mouth. Take your time." />
        <NextBtn onClick={() => setStep(2)} label="Done →" />
      </>}
      {step === 2 && <>
        <Q text="What are you feeling?" sub="Just notice. No judgement." />
        <Chips options={PAUSE_FEELINGS} selected={feeling} onSelect={setFeeling} />
        <NextBtn onClick={() => setStep(3)} disabled={!feeling} />
      </>}
      {step === 3 && <>
        <Q text="What would help right now?" sub="Choose one thing you can do." />
        <Chips options={PAUSE_ACTIONS} selected={action} onSelect={setAction} />
        <NextBtn onClick={() => setStep(4)} disabled={!action} label="I'll do this →" />
      </>}
    </div>
  )
}

// ─── Come Back to Now ─────────────────────────────────────────────────────────

function GroundingFlow({ onBack }: { onBack: () => void }) {
  const [senseIdx, setSenseIdx] = useState(0)
  const [checked,  setChecked]  = useState<boolean[]>(Array(5).fill(false))
  const [done,     setDone]     = useState(false)

  const sense     = SENSES[senseIdx]
  const allDone   = checked.slice(0, sense.count).every(Boolean)

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

  if (done) return <CompletionScreen emoji="🌱" title="You're here." message="You are here, right now." onRepeat={reset} onBack={onBack} repeatLabel="Go again" />

  return (
    <div className="space-y-5 max-w-sm mx-auto py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
        Sense {senseIdx + 1} of 5
      </p>
      <Q text={sense.prompt} sub="Tap each one as you notice it." />
      <div className="space-y-2">
        {Array.from({ length: sense.count }, (_, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left"
            style={{
              borderColor: checked[i] ? 'var(--cat-work)' : 'var(--stable-card-border)',
              background:  checked[i] ? 'rgba(79,58,255,0.08)' : 'var(--stable-card)',
            }}
          >
            <span
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-black"
              style={{
                borderColor:     'var(--cat-work)',
                background:      checked[i] ? 'var(--cat-work)' : 'transparent',
                color:           '#fff',
              }}
            >
              {checked[i] ? '✓' : ''}
            </span>
            <span className="font-semibold text-sm" style={{ color: checked[i] ? 'var(--cat-work)' : 'var(--stable-t1)' }}>
              {checked[i] ? 'Noticed' : `${i + 1}.`}
            </span>
          </button>
        ))}
      </div>
      <NextBtn onClick={handleNext} disabled={!allDone} label={senseIdx < SENSES.length - 1 ? 'Next sense →' : 'Finish →'} />
    </div>
  )
}

// ─── Ride the Wave ────────────────────────────────────────────────────────────

function WaveFlow({ onBack }: { onBack: () => void }) {
  const [step,      setStep]      = useState(0)
  const [urge,      setUrge]      = useState('')
  const [body,      setBody]      = useState('')
  const [intensity, setIntensity] = useState<number | null>(null)
  const [secsLeft,  setSecsLeft]  = useState(60)
  const [timerDone, setTimerDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secsRef     = useRef(60)

  function startTimer() {
    secsRef.current = 60
    setSecsLeft(60)
    setTimerDone(false)
    intervalRef.current = setInterval(() => {
      secsRef.current -= 1
      setSecsLeft(secsRef.current)
      if (secsRef.current <= 0) {
        clearInterval(intervalRef.current!)
        setTimerDone(true)
      }
    }, 1000)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function reset() {
    setStep(0); setUrge(''); setBody(''); setIntensity(null)
    setTimerDone(false); secsRef.current = 60; setSecsLeft(60)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  if (step === 4) return <CompletionScreen emoji="🌊" title="You rode the wave." message="You rode the wave without acting on it." onRepeat={reset} onBack={onBack} repeatLabel="Go again" />

  const pct = ((60 - secsLeft) / 60) * 100

  return (
    <div className="space-y-5 max-w-sm mx-auto py-4">
      <StepBadge current={step + 1} total={4} />
      {step === 0 && <>
        <Q text="Name the urge." sub='"I have an urge to…" — say it without judging it.' />
        <textarea
          value={urge} onChange={(e) => setUrge(e.target.value)}
          placeholder="e.g. check my phone, eat, leave…"
          rows={3} className="w-full rounded-xl px-4 py-3 text-sm border-2 resize-none outline-none"
          style={{ background: 'var(--stable-bg)', borderColor: 'var(--stable-card-border)', color: 'var(--stable-t1)' }}
        />
        <NextBtn onClick={() => setStep(1)} disabled={!urge.trim()} />
      </>}
      {step === 1 && <>
        <Q text="Where do you feel it in your body?" sub="Chest, stomach, throat, shoulders — just notice." />
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. tightness in my chest…"
          rows={3} className="w-full rounded-xl px-4 py-3 text-sm border-2 resize-none outline-none"
          style={{ background: 'var(--stable-bg)', borderColor: 'var(--stable-card-border)', color: 'var(--stable-t1)' }}
        />
        <NextBtn onClick={() => { if (body.trim()) { setStep(2); startTimer() } }} disabled={!body.trim()} label="Start the timer →" />
      </>}
      {step === 2 && <>
        <Q text="Ride it out." sub="Don't fight it. Don't give in. Just watch it like a wave rising." />
        <div className="space-y-2">
          <div className="rounded-full overflow-hidden h-3" style={{ background: 'rgba(79,58,255,0.15)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: 'var(--cat-work)' }} />
          </div>
          <p className="text-center text-3xl font-black" style={{ color: 'var(--cat-work)' }}>{secsLeft}s</p>
        </div>
        {timerDone && <NextBtn onClick={() => setStep(3)} label="The wave is passing →" />}
      </>}
      {step === 3 && <>
        <Q text="How strong is the urge now?" sub="1 = barely there · 5 = still strong" />
        <div className="flex gap-3">
          {[1,2,3,4,5].map((n) => {
            const active = intensity === n
            return (
              <button
                key={n}
                onClick={() => setIntensity(n)}
                className="flex-1 py-3 rounded-xl border-2 font-bold transition-all"
                style={{
                  borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                  background:  active ? 'rgba(79,58,255,0.1)' : 'transparent',
                  color:       active ? 'var(--cat-work)' : 'var(--stable-t2)',
                }}
              >
                {n}
              </button>
            )
          })}
        </div>
        <NextBtn onClick={() => setStep(4)} disabled={!intensity} label="Done →" />
      </>}
    </div>
  )
}

// ─── Choose a Helpful Next Step ───────────────────────────────────────────────

function NextStepFlow({ onBack }: { onBack: () => void }) {
  const [step,    setStep]    = useState(0)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [action,  setAction]  = useState<string | null>(null)
  const reset = () => { setStep(0); setEmotion(null); setAction(null) }

  if (step === 3) return <CompletionScreen emoji="🔄" title="Intention set." message="You chose a next step with intention." onRepeat={reset} onBack={onBack} repeatLabel="Go again" />

  return (
    <div className="space-y-5 max-w-sm mx-auto py-4">
      <StepBadge current={step + 1} total={3} />
      {step === 0 && <>
        <Q text="What emotion is strongest right now?" />
        <Chips options={EMOTIONS} selected={emotion} onSelect={setEmotion} />
        <NextBtn onClick={() => setStep(1)} disabled={!emotion} />
      </>}
      {step === 1 && emotion && <>
        <Q text="What is it pushing you to do?" sub={EMOTION_PUSH[emotion]} />
        <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>You don't have to act on that impulse.</p>
        <NextBtn onClick={() => setStep(2)} label="I see it →" />
      </>}
      {step === 2 && emotion && <>
        <Q text="Choose one helpful next step." sub={`The opposite of what ${emotion.toLowerCase()} wants you to do.`} />
        <Chips options={OPPOSITE_ACTIONS[emotion]} selected={action} onSelect={setAction} />
        <NextBtn onClick={() => setStep(3)} disabled={!action} label="I'll do this →" />
      </>}
    </div>
  )
}

// ─── Find Your Calm Self ──────────────────────────────────────────────────────

function CalmSelfFlow({ onBack }: { onBack: () => void }) {
  const [step,      setStep]      = useState(0)
  const [emotional, setEmotional] = useState('')
  const [rational,  setRational]  = useState('')
  const [calm,      setCalm]      = useState('')
  const reset = () => { setStep(0); setEmotional(''); setRational(''); setCalm('') }

  if (step === 3) return <CompletionScreen emoji="🧘" title="There it is." message="You found a balanced next step." onRepeat={reset} onBack={onBack} repeatLabel="Go again" />

  const textareaStyle = {
    background: 'var(--stable-bg)',
    borderColor: 'var(--stable-card-border)',
    color: 'var(--stable-t1)',
  }

  return (
    <div className="space-y-5 max-w-sm mx-auto py-4">
      <StepBadge current={step + 1} total={3} />
      {step === 0 && <>
        <Q text="What is your emotional mind saying?" sub="What are your feelings telling you to do? Write it out honestly." />
        <textarea value={emotional} onChange={(e) => setEmotional(e.target.value)}
          placeholder="e.g. I want to give up, I feel like no one cares…"
          rows={4} className="w-full rounded-xl px-4 py-3 text-sm border-2 resize-none outline-none" style={textareaStyle} />
        <NextBtn onClick={() => setStep(1)} disabled={!emotional.trim()} />
      </>}
      {step === 1 && <>
        <Q text="What does your rational mind know?" sub="Set feelings aside for a moment. What are the facts?" />
        <textarea value={rational} onChange={(e) => setRational(e.target.value)}
          placeholder="e.g. I've handled this before. This will pass…"
          rows={4} className="w-full rounded-xl px-4 py-3 text-sm border-2 resize-none outline-none" style={textareaStyle} />
        <NextBtn onClick={() => setStep(2)} disabled={!rational.trim()} />
      </>}
      {step === 2 && <>
        <Q text="What would your calm self choose?" sub="Somewhere between the emotion and the logic, there's your wise answer." />
        <textarea value={calm} onChange={(e) => setCalm(e.target.value)}
          placeholder="e.g. Talk to them calmly tomorrow…"
          rows={4} className="w-full rounded-xl px-4 py-3 text-sm border-2 resize-none outline-none" style={textareaStyle} />
        <NextBtn onClick={() => setStep(3)} disabled={!calm.trim()} label="That's my next step →" />
      </>}
    </div>
  )
}

// ─── Session renderer ─────────────────────────────────────────────────────────

function renderSession(id: string | null, onBack: () => void) {
  switch (id) {
    case 'breathe':   return <BreatheFlow   onBack={onBack} />
    case 'stop':      return <PauseFlow     onBack={onBack} />
    case 'grounding': return <GroundingFlow onBack={onBack} />
    case 'urge':      return <WaveFlow      onBack={onBack} />
    case 'opposite':  return <NextStepFlow  onBack={onBack} />
    case 'wise':      return <CalmSelfFlow  onBack={onBack} />
    default:          return null
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const searchParams   = useSearchParams()
  const initialTool    = searchParams.get('tool')

  const [feeling,     setFeeling]     = useState<string | null>(null)
  const [activeTool,  setActiveTool]  = useState<string | null>(initialTool)
  const [mobileView,  setMobileView]  = useState<'list' | 'session'>(initialTool ? 'session' : 'list')

  const selectedFeeling = FEELINGS.find((f) => f.id === feeling)
  const activeMeta      = TOOLS.find((t) => t.id === activeTool)

  function startMobile(id: string) { setActiveTool(id); setMobileView('session') }
  function backMobile()            { setMobileView('list') }
  function backDesktop()           { setActiveTool(null) }

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE — hidden md+
      ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden min-h-svh" style={{ background: 'var(--stable-bg)' }}>
        {mobileView === 'list' ? (
          <>
            {/* Header */}
            <div className="px-4 pt-12 pb-5" style={{ background: 'var(--stable-header)' }}>
              <div className="flex items-center justify-between mb-3">
                <Link href="/mind" className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>‹ Mind</Link>
                <ThemeToggle />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Take a moment</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>You don't have to figure this out alone.</p>
            </div>

            <div className="px-4 py-4 space-y-4 pb-24">
              {/* Feeling chips */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>How are you feeling right now?</p>
                <div className="flex flex-wrap gap-2">
                  {FEELINGS.map((f) => {
                    const active = feeling === f.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFeeling((p) => p === f.id ? null : f.id)}
                        className="px-4 py-2 rounded-full border-2 text-sm font-bold transition-all"
                        style={{
                          borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                          background:  active ? 'rgba(79,58,255,0.1)' : 'transparent',
                          color:       active ? 'var(--cat-work)' : 'var(--stable-t2)',
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
                {selectedFeeling && (
                  <div className="rounded-xl px-4 py-3 text-sm font-semibold text-center" style={{ background: 'rgba(79,58,255,0.1)', color: 'var(--cat-work)', border: '1px solid rgba(79,58,255,0.3)' }}>
                    {selectedFeeling.message}
                  </div>
                )}
              </div>

              {/* Tools */}
              <p className="text-[10px] font-bold uppercase tracking-widest pt-2" style={{ color: 'var(--stable-t3)' }}>Support tools</p>
              {TOOLS.map((tool) => (
                <div key={tool.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <span className="text-2xl w-10 text-center shrink-0">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--stable-t1)' }}>{tool.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--stable-t2)' }}>{tool.summary}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => startMobile(tool.id)}
                    className="w-full py-3 text-sm font-bold border-t transition-opacity hover:opacity-70"
                    style={{ borderColor: 'var(--stable-card-border)', color: 'var(--cat-work)' }}
                  >
                    Start →
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Mobile session view */}
            <div className="px-4 pt-12 pb-4" style={{ background: 'var(--stable-header)' }}>
              <button onClick={backMobile} className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>‹ Back</button>
              <h1 className="text-xl font-extrabold text-white mt-2">{activeMeta?.title}</h1>
            </div>
            <div className="px-4 py-6 pb-24">
              {renderSession(activeTool, backMobile)}
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP — hidden mobile
      ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex" style={{ minHeight: 'calc(100svh - 0px)' }}>

        {/* Left panel: tool list (fixed width, scrollable) */}
        <div
          className="w-80 shrink-0 border-r overflow-y-auto"
          style={{ background: 'var(--stable-nav)', borderColor: 'var(--stable-nav-border)' }}
        >
          {/* Panel header */}
          <div className="px-6 pt-8 pb-4" style={{ borderBottom: '1px solid var(--stable-nav-border)' }}>
            <Link href="/mind" className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--cat-work)' }}>
              ← Mind
            </Link>
            <h2 className="text-lg font-extrabold mt-2" style={{ color: 'var(--stable-t1)' }}>Take a moment</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
              You don't have to figure this out alone.
            </p>
          </div>

          {/* Feeling chips */}
          <div className="px-4 py-4 space-y-3" style={{ borderBottom: '1px solid var(--stable-nav-border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>How are you feeling?</p>
            <div className="flex flex-wrap gap-1.5">
              {FEELINGS.map((f) => {
                const active = feeling === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setFeeling((p) => p === f.id ? null : f.id)}
                    className="px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                    style={{
                      borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                      background:  active ? 'rgba(79,58,255,0.1)' : 'transparent',
                      color:       active ? 'var(--cat-work)' : 'var(--stable-t2)',
                    }}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
            {selectedFeeling && (
              <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--cat-work)' }}>
                {selectedFeeling.message}
              </p>
            )}
          </div>

          {/* Tool list */}
          <div className="py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest px-4 pb-2" style={{ color: 'var(--stable-t3)' }}>Support tools</p>
            {TOOLS.map((tool) => {
              const isActive = activeTool === tool.id
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(isActive ? null : tool.id)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(79,58,255,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--cat-work)' : '3px solid transparent',
                  }}
                >
                  <span className="text-xl shrink-0 mt-0.5">{tool.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold" style={{ color: isActive ? 'var(--cat-work)' : 'var(--stable-t1)' }}>
                      {tool.title}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--stable-t2)' }}>{tool.summary}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel: active session */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto p-8">
          {activeTool ? (
            <div className="w-full max-w-md">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl">{activeMeta?.icon}</span>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--stable-t1)' }}>{activeMeta?.title}</p>
                  <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>{activeMeta?.summary}</p>
                </div>
              </div>
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
              >
                {renderSession(activeTool, backDesktop)}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-4xl">🧘</p>
              <p className="text-lg font-bold" style={{ color: 'var(--stable-t1)' }}>Choose a support tool</p>
              <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>Select one from the list to begin a guided session.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
