import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/use-theme'

export function AiInsight() {
  const { t } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⬡ STABLE AI</Text>
      </View>
      <Text style={[styles.body, { color: t.t2 }]}>
        Pick your three most important tasks and focus on{' '}
        <Text style={{ color: t.t1, fontWeight: '700' }}>one at a time</Text>.{' '}
        Your focus is sharpest{' '}
        <Text style={{ color: t.t1, fontWeight: '700' }}>before noon</Text>.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card:      { marginHorizontal: 12, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  badge:     { alignSelf: 'flex-start', backgroundColor: 'rgba(99,102,241,0.12)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#4f3aff', textTransform: 'uppercase' },
  body:      { fontSize: 13, lineHeight: 20 },
})
