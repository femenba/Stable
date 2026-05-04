// apps/mobile/app/(tabs)/mind/dbt.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMindPrefs } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'

type Skill = {
  id:          string
  icon:        string
  title:       string
  summary:     string
  steps:       string[]
}

const SKILLS: Skill[] = [
  {
    id:      'stop',
    icon:    '🛑',
    title:   'STOP Skill',
    summary: 'Pause before reacting. Creates space between feeling and action.',
    steps: [
      'S — Stop. Freeze. Don\'t act yet.',
      'T — Take a step back. Breathe slowly. Step away if needed.',
      'O — Observe. Notice what you\'re feeling, thinking, and seeing around you.',
      'P — Proceed mindfully. Ask: what will help right now? Then act.',
    ],
  },
  {
    id:      '54321',
    icon:    '🖐',
    title:   '5-4-3-2-1 Grounding',
    summary: 'Bring yourself back to the present moment using your senses.',
    steps: [
      '5 — Name 5 things you can see right now.',
      '4 — Name 4 things you can physically feel (floor, clothes, air).',
      '3 — Name 3 things you can hear.',
      '2 — Name 2 things you can smell (or like the smell of).',
      '1 — Name 1 thing you can taste.',
      'Take a slow breath. You\'re here, right now.',
    ],
  },
  {
    id:      'opposite',
    icon:    '🔄',
    title:   'Opposite Action',
    summary: 'Act opposite to what the emotion is pushing you to do.',
    steps: [
      'Identify what emotion you\'re feeling (anger, shame, fear, sadness).',
      'Notice the urge the emotion creates (hide, yell, avoid, freeze).',
      'Ask: is acting on this urge helping or hurting me?',
      'Choose the opposite behaviour and commit fully.',
      'Repeat the opposite action until the emotion intensity drops.',
    ],
  },
  {
    id:      'urge',
    icon:    '🌊',
    title:   'Urge Surfing',
    summary: 'Ride out an urge without acting on it — like surfing a wave.',
    steps: [
      'Notice the urge. Name it: "I have an urge to..."',
      'Don\'t fight it or give in. Just observe.',
      'Breathe slowly and watch the urge like a wave rising.',
      'Notice where you feel it in your body.',
      'Stay with it. Urges peak within minutes, then fade.',
      'When it passes, notice you got through it without acting.',
    ],
  },
  {
    id:      'box',
    icon:    '📦',
    title:   'Box Breathing',
    summary: 'Regulate your nervous system in under 2 minutes.',
    steps: [
      'Breathe in slowly through your nose for 4 seconds.',
      'Hold your breath for 4 seconds.',
      'Breathe out slowly through your mouth for 4 seconds.',
      'Hold for 4 seconds.',
      'Repeat 4–6 times.',
      'Tip: use the Breathe tab for a guided animation.',
    ],
  },
  {
    id:      'wise',
    icon:    '🧘',
    title:   'Wise Mind Check-in',
    summary: 'Find the balance between emotion and logic to make clearer decisions.',
    steps: [
      'Emotional mind: What is my emotion saying I should do?',
      'Rational mind: What does the logic/facts say I should do?',
      'Wise mind lives in the middle — it honours both.',
      'Ask yourself: "What would my wise, calm self do here?"',
      'Sit quietly for a moment and listen for the answer.',
      'Trust it. Wise mind is always available to you.',
    ],
  },
]

export default function DBTScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { prefs } = useMindPrefs()
  const mt      = MIND_THEMES[prefs.theme]
  const [expanded, setExpanded] = useState<string | null>(null)

  const cardBorder = `${mt.t3}88`

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <View style={[styles.container, { backgroundColor: mt.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: mt.t2 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: mt.t1 }]}>DBT Skills</Text>
        <View style={styles.headerRight} />
      </View>

      <Text style={[styles.intro, { color: mt.t2 }]}>
        Practical techniques for emotional regulation and ADHD support. Tap any skill to expand.
      </Text>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        {SKILLS.map((skill) => {
          const open = expanded === skill.id
          return (
            <TouchableOpacity
              key={skill.id}
              onPress={() => toggle(skill.id)}
              activeOpacity={0.8}
              style={[
                styles.card,
                {
                  backgroundColor: mt.card,
                  borderColor: open ? mt.accent : cardBorder,
                },
              ]}
            >
              {/* Card header row */}
              <View style={styles.cardRow}>
                <View style={[styles.iconWrap, { backgroundColor: open ? mt.accentSoft : `${mt.t3}22` }]}>
                  <Text style={styles.icon}>{skill.icon}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: mt.t1 }]}>{skill.title}</Text>
                  <Text style={[styles.cardSummary, { color: mt.t2 }]}>{skill.summary}</Text>
                </View>
                <Text style={[styles.chevron, { color: open ? mt.accent : mt.t3 }]}>
                  {open ? '▾' : '›'}
                </Text>
              </View>

              {/* Expanded steps */}
              {open && (
                <View style={[styles.steps, { borderTopColor: cardBorder }]}>
                  {skill.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View style={[styles.stepDot, { backgroundColor: mt.accent }]} />
                      <Text style={[styles.stepText, { color: mt.t1 }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 4 },
  backBtn:     { width: 70 },
  backText:    { fontSize: 16, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  headerRight: { width: 70 },
  intro:       { fontSize: 13, paddingHorizontal: 20, paddingBottom: 12, lineHeight: 18 },
  body:        { padding: 16, gap: 12 },
  card: {
    borderRadius: 16, borderWidth: 1.5,
    overflow: 'hidden',
  },
  cardRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  icon:        { fontSize: 22 },
  cardBody:    { flex: 1, minWidth: 0 },
  cardTitle:   { fontSize: 15, fontWeight: '800' },
  cardSummary: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  chevron:     { fontSize: 18, fontWeight: '600', flexShrink: 0 },
  steps: {
    borderTopWidth: 1,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14,
    gap: 10,
  },
  stepRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepDot:     { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  stepText:    { flex: 1, fontSize: 13, lineHeight: 20 },
})
