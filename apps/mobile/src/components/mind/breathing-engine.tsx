// apps/mobile/src/components/mind/breathing-engine.tsx
import { useState, useRef, useCallback, useEffect } from 'react'
import type { BreathingExercise } from '@/lib/breathing-exercises'

export type EngineState = {
  isRunning:   boolean
  isPaused:    boolean
  phaseIndex:  number
  phaseLabel:  string
  secondsLeft: number
  progress:    number   // 0→1 within current phase
  start:       () => void
  pause:       () => void
  resume:      () => void
  stop:        () => void
}

export function useBreathingEngine(exercise: BreathingExercise): EngineState {
  const [isRunning,  setIsRunning]  = useState(false)
  const [isPaused,   setIsPaused]   = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(exercise.phases[0].duration)

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef     = useRef({ phaseIndex: 0, secondsLeft: exercise.phases[0].duration })

  // Keep ref in sync with state for interval closure
  useEffect(() => {
    stateRef.current = { phaseIndex, secondsLeft }
  }, [phaseIndex, secondsLeft])

  // Reset when exercise changes
  useEffect(() => {
    stop()
    setPhaseIndex(0)
    setSecondsLeft(exercise.phases[0].duration)
  }, [exercise.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      const phase   = exercise.phases[stateRef.current.phaseIndex]
      const next    = prev - 1
      if (next > 0) return next
      // Move to next phase
      const nextIndex = (stateRef.current.phaseIndex + 1) % exercise.phases.length
      setPhaseIndex(nextIndex)
      return exercise.phases[nextIndex].duration
    })
  }, [exercise])

  const start = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
    setPhaseIndex(0)
    setSecondsLeft(exercise.phases[0].duration)
    intervalRef.current = setInterval(tick, 1000)
  }, [exercise, tick])

  const pause = useCallback(() => {
    setIsPaused(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
    intervalRef.current = setInterval(tick, 1000)
  }, [tick])

  const stop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhaseIndex(0)
    setSecondsLeft(exercise.phases[0].duration)
  }, [exercise])

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const phase       = exercise.phases[phaseIndex]
  const phaseLabel  = phase.label
  const progress    = 1 - (secondsLeft / phase.duration)

  return { isRunning, isPaused, phaseIndex, phaseLabel, secondsLeft, progress, start, pause, resume, stop }
}
