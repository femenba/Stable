// apps/mobile/src/components/mind/mood-tag-picker.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export const MOOD_TAGS = [
  'focused', 'calm', 'anxious', 'overwhelmed',
  'sad', 'irritable', 'motivated', 'tired',
] as const

export type MoodTag = typeof MOOD_TAGS[number]

type Props = {
  selected:  MoodTag[]
  onChange:  (tags: MoodTag[]) => void
  t2:        string
  t3:        string
  accent:    string
  accentSoft: string
  cardBorder: string
}

export function MoodTagPicker({ selected, onChange, t2, t3, accent, accentSoft, cardBorder }: Props) {
  function toggle(tag: MoodTag) {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag]
    )
  }

  return (
    <View>
      <Text style={[styles.label, { color: t2 }]}>How you feel</Text>
      <View style={styles.wrap}>
        {MOOD_TAGS.map((tag) => {
          const active = selected.includes(tag)
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => toggle(tag)}
              style={[
                styles.chip,
                {
                  borderColor:     active ? accent : cardBorder,
                  backgroundColor: active ? accentSoft : 'transparent',
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? accent : t3 }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label:    { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  wrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
})
