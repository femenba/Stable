import { LinearGradient } from 'expo-linear-gradient'
import { Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/use-theme'

interface ScreenHeaderProps {
  label: string
  title: string
  subtitle?: string
}

export function ScreenHeader({ label, title, subtitle }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()
  const { t } = useTheme()
  return (
    <LinearGradient
      colors={[t.headerStart, t.headerMid, t.headerEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header:   { paddingHorizontal: 20, paddingBottom: 24 },
  label:    { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  title:    { fontSize: 26, fontWeight: '900', color: '#ffffff', lineHeight: 32 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
})
