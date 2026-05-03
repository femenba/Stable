// apps/mobile/src/components/mind/breathing-countdown.tsx
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  phaseLabel:  string
  secondsLeft: number
  isRunning:   boolean
  accent:      string
  t2:          string
}

export function BreathingCountdown({ phaseLabel, secondsLeft, isRunning, accent, t2 }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.phase, { color: t2 }]}>
        {isRunning ? phaseLabel.toUpperCase() : 'READY'}
      </Text>
      <Text style={[styles.number, { color: accent }]}>
        {isRunning ? secondsLeft : '—'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  phase:     { fontSize: 13, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  number:    { fontSize: 96, fontWeight: '900', lineHeight: 108 },
})
