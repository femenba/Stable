// apps/mobile/src/components/mind/mood-emoji-row.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type Props = {
  label:    string
  emojis:   string[]   // 5 items, index 0 = rating 1
  value:    number | null
  onChange: (rating: number) => void
  t2:       string
  accent:   string
  accentSoft: string
}

export function MoodEmojiRow({ label, emojis, value, onChange, t2, accent, accentSoft }: Props) {
  return (
    <View>
      <Text style={[styles.label, { color: t2 }]}>{label}</Text>
      <View style={styles.row}>
        {emojis.map((emoji, i) => {
          const rating  = i + 1
          const selected = value === rating
          return (
            <TouchableOpacity
              key={rating}
              onPress={() => onChange(rating)}
              style={[
                styles.btn,
                selected && { backgroundColor: accentSoft, borderColor: accent },
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  row:    { flexDirection: 'row', gap: 8 },
  btn: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  emoji: { fontSize: 26 },
})
