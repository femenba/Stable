// apps/mobile/src/components/mind/mind-card.tsx
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'

type Props = {
  icon:       string
  title:      string
  subtitle:   string
  onPress?:   () => void
  disabled?:  boolean
  dashed?:    boolean
  accent:     string
  accentSoft: string
  t1:         string
  t2:         string
  t3:         string
  card:       string
  cardBorder: string
}

export function MindCard({
  icon, title, subtitle, onPress, disabled, dashed,
  accent, accentSoft, t1, t2, t3, card, cardBorder,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.card,
        {
          backgroundColor: card,
          borderColor:     disabled ? t3 : cardBorder,
          borderStyle:     dashed ? 'dashed' : 'solid',
          opacity:         disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: t1 }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: t2 }]} numberOfLines={1}>{subtitle}</Text>
      </View>
      {!disabled && <Text style={[styles.chevron, { color: t3 }]}>›</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 16, padding: 14,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  icon:     { fontSize: 22 },
  body:     { flex: 1, minWidth: 0 },
  title:    { fontSize: 15, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  chevron:  { fontSize: 22, fontWeight: '300' },
})
