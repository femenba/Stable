// apps/mobile/src/components/mind/breathing-circle.tsx
import { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'

type Props = {
  phaseLabel:  string
  secondsLeft: number
  isRunning:   boolean
  phaseIndex:  number
  accent:      string
  accentSoft:  string
}

export function BreathingCircle({ phaseLabel, secondsLeft, isRunning, phaseIndex, accent, accentSoft }: Props) {
  const scale = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    if (!isRunning) {
      Animated.spring(scale, { toValue: 0.4, useNativeDriver: true }).start()
      return
    }
    // Inhale phases expand, exhale/hold-out phases contract, hold-in stays large
    const label = phaseLabel.toLowerCase()
    const target = label === 'inhale' ? 1.0
                 : label === 'exhale' ? 0.4
                 : label === 'hold' && phaseIndex === 1 ? 1.0  // hold after inhale = stay large
                 : 0.4  // hold after exhale = stay small
    Animated.timing(scale, {
      toValue:         target,
      duration:        secondsLeft * 1000,
      useNativeDriver: true,
    }).start()
  }, [phaseIndex, isRunning])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            borderColor:     accent,
            backgroundColor: accentSoft,
            transform:       [{ scale }],
          },
        ]}
      >
        <Text style={[styles.label, { color: accent }]}>{isRunning ? phaseLabel : 'Ready'}</Text>
        {isRunning && (
          <Text style={[styles.count, { color: accent }]}>{secondsLeft}</Text>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 18, fontWeight: '700' },
  count: { fontSize: 36, fontWeight: '900', marginTop: 4 },
})
