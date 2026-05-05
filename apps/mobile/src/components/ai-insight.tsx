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
  card:      { marginHorizontal: 16, marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 16, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  badge:     { alignSelf: 'flex-start', backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#6366F1', textTransform: 'uppercase' },
  body:      { fontSize: 14, lineHeight: 21 },
})
