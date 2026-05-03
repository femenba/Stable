// apps/mobile/src/lib/breathing-exercises.ts
export type BreathPhase = {
  label:    string
  duration: number  // seconds
}

export type BreathingExercise = {
  id:     string
  name:   string
  phases: BreathPhase[]
}

export const EXERCISES: BreathingExercise[] = [
  {
    id:   'box',
    name: 'Box Breathing',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold',   duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold',   duration: 4 },
    ],
  },
  {
    id:   '478',
    name: '4-7-8',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold',   duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
  },
]

export function totalCycleDuration(exercise: BreathingExercise): number {
  return exercise.phases.reduce((sum, p) => sum + p.duration, 0)
}
