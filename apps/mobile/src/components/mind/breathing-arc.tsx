// apps/mobile/src/components/mind/breathing-arc.tsx
import { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'

type Props = {
  phaseLabel:  string
  secondsLeft: number
  progress:    number
  isRunning:   boolean
  accent:      string
  t2:          string
}

export function BreathingArc({ phaseLabel, secondsLeft, progress, isRunning, accent, t2 }: Props) {
  const rotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isRunning) {
      rotation.setValue(0)
      return
    }
    Animated.timing(rotation, {
      toValue:         1,
      duration:        secondsLeft * 1000,
      useNativeDriver: true,
    }).start()
  }, [isRunning, phaseLabel])  // eslint-disable-line react-hooks/exhaustive-deps

  const spin = rotation.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.container}>
      {/* Background ring */}
      <View style={[styles.ring, { borderColor: `${accent}22` }]} />
      {/* Animated arc overlay */}
      <Animated.View
        style={[
          styles.arcOverlay,
          { borderTopColor: accent, borderRightColor: accent, transform: [{ rotate: spin }] },
        ]}
      />
      <View style={styles.center}>
        <Text style={[styles.label, { color: t2 }]}>{isRunning ? phaseLabel : 'Ready'}</Text>
        {isRunning && <Text style={[styles.count, { color: accent }]}>{secondsLeft}</Text>}
      </View>
    </View>
  )
}

const SIZE = 200

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    borderWidth: 6, position: 'absolute',
  },
  arcOverlay: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    position: 'absolute',
  },
  center:  { alignItems: 'center' },
  label:   { fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  count:   { fontSize: 40, fontWeight: '900', marginTop: 4 },
})
