// apps/mobile/src/components/mind/breathing-blob.tsx
import { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'

type Props = {
  phaseLabel:  string
  secondsLeft: number
  isRunning:   boolean
  phaseIndex:  number
  accent:      string
  accentSoft:  string
  t2:          string
}

export function BreathingBlob({ phaseLabel, secondsLeft, isRunning, phaseIndex, accent, accentSoft, t2 }: Props) {
  const scale      = useRef(new Animated.Value(0.7)).current
  const opacity    = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    if (!isRunning) {
      Animated.parallel([
        Animated.spring(scale,   { toValue: 0.7, useNativeDriver: false }),
        Animated.spring(opacity, { toValue: 0.6, useNativeDriver: false }),
      ]).start()
      return
    }
    const label    = phaseLabel.toLowerCase()
    const toScale  = label === 'inhale' ? 1.15 : label === 'exhale' ? 0.7 : label === 'hold' && phaseIndex === 1 ? 1.15 : 0.7
    const toOpacity = label === 'inhale' ? 0.9 : 0.5
    Animated.parallel([
      Animated.timing(scale,   { toValue: toScale,   duration: secondsLeft * 1000, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: toOpacity, duration: secondsLeft * 1000, useNativeDriver: false }),
    ]).start()
  }, [phaseIndex, isRunning])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: accent,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: t2 }]}>{isRunning ? phaseLabel : 'Ready'}</Text>
        {isRunning && <Text style={[styles.count, { color: '#fff' }]}>{secondsLeft}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blob: {
    width: 180, height: 180, borderRadius: 90,
    position: 'absolute',
  },
  textWrap: { alignItems: 'center', zIndex: 1 },
  label:    { fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  count:    { fontSize: 40, fontWeight: '900', marginTop: 4 },
})
