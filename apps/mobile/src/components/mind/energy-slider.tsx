// apps/mobile/src/components/mind/energy-slider.tsx
import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Slider from '@react-native-community/slider'

const LEVELS = [
  { label: 'Low',    emoji: '🪫', range: [0,  33]  },
  { label: 'Medium', emoji: '🔋', range: [34, 66]  },
  { label: 'Full',   emoji: '⚡', range: [67, 100] },
]

function pctToEnergyValue(pct: number): number {
  if (pct <= 33) return 1
  if (pct <= 66) return 3
  return 5
}

function activeLevel(pct: number): number {
  if (pct <= 33) return 0
  if (pct <= 66) return 1
  return 2
}

type Props = {
  value:    number | null   // energy DB value (1|3|5 or null)
  onChange: (energy: number) => void
  accent:   string
  accentSoft: string
  t2:       string
  t3:       string
  card:     string
}

export function EnergySlider({ value, onChange, accent, accentSoft, t2, t3, card }: Props) {
  // Derive initial pct from stored value
  const initPct = value === null ? 50 : value <= 1 ? 16 : value <= 3 ? 50 : 84
  const [pct, setPct] = useState(initPct)

  function handleChange(v: number) {
    const rounded = Math.round(v)
    setPct(rounded)
    onChange(pctToEnergyValue(rounded))
  }

  const active = activeLevel(pct)

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: t2 }]}>Energy level</Text>

      {/* Battery icons */}
      <View style={styles.icons}>
        {LEVELS.map((lv, i) => (
          <View
            key={lv.label}
            style={[
              styles.iconWrap,
              active === i && { backgroundColor: accentSoft, borderColor: accent },
            ]}
          >
            <Text style={styles.iconEmoji}>{lv.emoji}</Text>
            <Text style={[styles.iconLabel, { color: active === i ? accent : t3 }]}>
              {lv.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Slider */}
      <View style={[styles.sliderWrap, { backgroundColor: card }]}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={pct}
          onValueChange={handleChange}
          minimumTrackTintColor={accent}
          maximumTrackTintColor={`${t3}88`}
          thumbTintColor={accent}
        />
        <Text style={[styles.pct, { color: accent }]}>Energy: {pct}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { gap: 12 },
  label:      { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  icons:      { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  iconWrap: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent',
  },
  iconEmoji:  { fontSize: 24 },
  iconLabel:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sliderWrap: { borderRadius: 12, paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4 },
  slider:     { width: '100%', height: 40 },
  pct:        { textAlign: 'center', fontSize: 13, fontWeight: '800', marginBottom: 4 },
})
