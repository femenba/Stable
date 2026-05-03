// apps/mobile/src/components/mind/mood-history-row.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native'

const MOOD_EMOJIS = ['', '😔', '😕', '😐', '🙂', '😊']
const ENERGY_EMOJIS = ['', '🪫', '🔋', '🔋', '⚡', '⚡']

type Entry = {
  id:        string
  rating:    number
  energy:    number | null
  tags:      string[]
  createdAt: string
}

type Props = {
  entries:   Entry[]   // last 7, newest first
  t1:        string
  t2:        string
  t3:        string
  card:      string
  cardBorder: string
  accent:    string
}

export function MoodHistoryRow({ entries, t1, t2, t3, card, cardBorder, accent }: Props) {
  const [selected, setSelected] = useState<Entry | null>(null)

  // Build 7-day array: today is index 0
  const days: (Entry | null)[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    return entries.find((e) => e.createdAt.slice(0, 10) === dateStr) ?? null
  })

  return (
    <View>
      <Text style={[styles.label, { color: t3 }]}>Last 7 days</Text>
      <View style={styles.row}>
        {days.map((entry, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => entry && setSelected(entry)}
            style={[styles.dot, { borderColor: entry ? accent : cardBorder }]}
            disabled={!entry}
          >
            <Text style={styles.dotEmoji}>
              {entry ? MOOD_EMOJIS[entry.rating] : '–'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable
            style={[styles.popover, { backgroundColor: card, borderColor: cardBorder }]}
            onPress={() => {}}
          >
            {selected && (
              <>
                <Text style={[styles.popDate, { color: t3 }]}>
                  {new Date(selected.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </Text>
                <Text style={[styles.popMood, { color: t1 }]}>
                  {MOOD_EMOJIS[selected.rating]} Mood {selected.rating}/5
                </Text>
                {selected.energy && (
                  <Text style={[styles.popLine, { color: t2 }]}>
                    {ENERGY_EMOJIS[selected.energy]} Energy {selected.energy}/5
                  </Text>
                )}
                {selected.tags.length > 0 && (
                  <Text style={[styles.popLine, { color: t2 }]}>
                    {selected.tags.join(' · ')}
                  </Text>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  label:     { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  row:       { flexDirection: 'row', gap: 6 },
  dot: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  dotEmoji:  { fontSize: 18 },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  popover: {
    width: 240, borderRadius: 16, borderWidth: 1,
    padding: 20, gap: 6,
  },
  popDate:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  popMood:   { fontSize: 18, fontWeight: '800' },
  popLine:   { fontSize: 13 },
})
