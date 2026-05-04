// apps/mobile/app/(tabs)/mind/mood.tsx
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMindPrefs } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'
import { MoodEmojiRow } from '@/components/mind/mood-emoji-row'
import { MoodTagPicker, type MoodTag } from '@/components/mind/mood-tag-picker'
import { MoodHistoryRow } from '@/components/mind/mood-history-row'
import { EnergySlider } from '@/components/mind/energy-slider'
import { trpc } from '@/lib/trpc-client'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']

export default function MoodScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { prefs } = useMindPrefs()
  const mt      = MIND_THEMES[prefs.theme]

  const [rating,  setRating]  = useState<number | null>(null)
  const [energy,  setEnergy]  = useState<number | null>(null)
  const [tags,    setTags]    = useState<MoodTag[]>([])
  const [note,    setNote]    = useState('')
  const [logged,  setLogged]  = useState(false)

  const utils            = trpc.useUtils()
  const { data: today }  = trpc.moodEntries.today.useQuery({ date: new Date().toISOString().slice(0, 10) })
  const { data: history = [] } = trpc.moodEntries.history.useQuery({ limit: 7 })
  const logMood = trpc.moodEntries.log.useMutation({
    onSuccess: () => {
      utils.moodEntries.today.invalidate()
      utils.moodEntries.history.invalidate()
      setLogged(true)
    },
  })

  function handleSubmit() {
    if (!rating) return
    logMood.mutate({ rating, energy: energy ?? undefined, tags, note: note.trim() || undefined })
  }

  const cardBorder = `${mt.t3}88`

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: mt.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: mt.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: mt.t1 }]}>Mood</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>

        {/* Check-in card */}
        <View style={[styles.card, { backgroundColor: mt.card, borderColor: cardBorder }]}>
          {logged || today ? (
            <View style={styles.alreadyChecked}>
              <Text style={styles.checkedEmoji}>
                {today ? MOOD_EMOJIS[(today.rating ?? 1) - 1] : '✓'}
              </Text>
              <Text style={[styles.checkedText, { color: mt.t1 }]}>
                {logged ? 'Mood logged!' : 'Already checked in today'}
              </Text>
              <TouchableOpacity onPress={() => setLogged(false)} style={[styles.updateBtn, { borderColor: cardBorder }]}>
                <Text style={[styles.updateBtnText, { color: mt.t2 }]}>Update</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              <MoodEmojiRow
                label="How are you feeling?"
                emojis={MOOD_EMOJIS}
                value={rating} onChange={setRating}
                t2={mt.t2} accent={mt.accent} accentSoft={mt.accentSoft}
              />
              <EnergySlider
                value={energy} onChange={setEnergy}
                accent={mt.accent} accentSoft={mt.accentSoft}
                t2={mt.t2} t3={mt.t3} card={mt.card}
              />
              <MoodTagPicker
                selected={tags} onChange={setTags}
                t2={mt.t2} t3={mt.t3} accent={mt.accent}
                accentSoft={mt.accentSoft} cardBorder={cardBorder}
              />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Anything on your mind?"
                placeholderTextColor={mt.t3}
                style={[styles.noteInput, { color: mt.t1, borderColor: cardBorder, backgroundColor: mt.bg }]}
                multiline
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!rating || logMood.isPending}
                style={[styles.logBtn, { backgroundColor: mt.accent, opacity: rating ? 1 : 0.4 }]}
              >
                <Text style={styles.logBtnText}>
                  {logMood.isPending ? 'Saving…' : 'Log mood'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <MoodHistoryRow
              entries={history}
              t1={mt.t1} t2={mt.t2} t3={mt.t3}
              card={mt.card} cardBorder={cardBorder} accent={mt.accent}
            />
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn:        { width: 70 },
  backText:       { fontSize: 16, fontWeight: '600' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  headerRight:    { width: 70 },
  body:           { padding: 16, gap: 20 },
  card:           { borderRadius: 18, borderWidth: 1.5, padding: 20 },
  alreadyChecked: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  checkedEmoji:   { fontSize: 40 },
  checkedText:    { fontSize: 16, fontWeight: '700' },
  updateBtn:      { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  updateBtnText:  { fontSize: 13, fontWeight: '600' },
  noteInput: {
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, minHeight: 60,
  },
  logBtn:         { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  logBtnText:     { color: '#fff', fontSize: 15, fontWeight: '800' },
  historySection: { gap: 8 },
})
