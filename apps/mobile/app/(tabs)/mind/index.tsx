// apps/mobile/app/(tabs)/mind/index.tsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMindPrefs } from '@/lib/use-mind-prefs'
import { MIND_THEMES } from '@/lib/mind-themes'
import { MindCard } from '@/components/mind/mind-card'
import { trpc } from '@/lib/trpc-client'

const MOOD_EMOJIS = ['', '😔', '😕', '😐', '🙂', '😊']

export default function MindHome() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { prefs } = useMindPrefs()
  const mt      = MIND_THEMES[prefs.theme]

  const { data: todayMood } = trpc.moodEntries.today.useQuery({ date: new Date().toISOString().slice(0, 10) })

  const moodSubtitle = todayMood
    ? `Today: ${MOOD_EMOJIS[todayMood.rating]}`
    : 'Check in'

  const cards = (
    <>
      <MindCard
        icon="🫁" title="Breathe" subtitle={prefs.breathStyle === 'circle' ? 'Animated circle' : prefs.breathStyle}
        onPress={() => router.push('/(tabs)/mind/breathe')}
        accent={mt.accent} accentSoft={mt.accentSoft}
        t1={mt.t1} t2={mt.t2} t3={mt.t3} card={mt.card} cardBorder={`${mt.t3}88`}
      />
      <MindCard
        icon="🌡" title="Mood" subtitle={moodSubtitle}
        onPress={() => router.push('/(tabs)/mind/mood')}
        accent={mt.accent} accentSoft={mt.accentSoft}
        t1={mt.t1} t2={mt.t2} t3={mt.t3} card={mt.card} cardBorder={`${mt.t3}88`}
      />
      <MindCard
        icon="🧠" title="DBT Skills" subtitle="STOP · Grounding · Wise Mind"
        onPress={() => router.push('/(tabs)/mind/dbt')}
        accent={mt.accent} accentSoft={mt.accentSoft}
        t1={mt.t1} t2={mt.t2} t3={mt.t3} card={mt.card} cardBorder={`${mt.t3}88`}
      />
    </>
  )

  return (
    <View style={[styles.container, { backgroundColor: mt.bg }]}>
      <LinearGradient
        colors={[mt.gradientStart, mt.gradientEnd]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>MIND</Text>
            <Text style={styles.headerTitle}>Breathe. Check in.{'\n'}Be present.</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/mind/personalise')}
            style={styles.gearBtn}
          >
            <Text style={styles.gearIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {prefs.layout === 'scroll' ? (
        <ScrollView contentContainerStyle={[styles.body, { gap: 12 }]}>
          {cards}
        </ScrollView>
      ) : (
        <View style={[styles.body, { gap: 12 }]}>
          {cards}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', lineHeight: 28 },
  gearBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  gearIcon:    { fontSize: 18, color: '#fff' },
  body:        { flex: 1, padding: 16 },
})
