import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Text, View, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/use-theme'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  const { t } = useTheme()
  const activeColor = '#5E8B71'
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={[styles.indicator, { backgroundColor: activeColor }]} />}
      <View style={[styles.iconPill, focused && { backgroundColor: 'rgba(94,139,113,0.1)' }]}>
        <Text style={[styles.iconEmoji, { opacity: focused ? 1 : 0.55 }]}>{icon}</Text>
      </View>
      <Text style={[styles.iconLabel, { color: focused ? activeColor : t.t3 }]}>{label}</Text>
    </View>
  )
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const { t } = useTheme()
  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.nav,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 12,
          height: 80,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Today" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✓" label="Tasks" focused={focused} /> }}
      />
      <Tabs.Screen
        name="focus"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⏱" label="Focus" focused={focused} /> }}
      />
      <Tabs.Screen
        name="reminders"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔔" label="Reminders" focused={focused} /> }}
      />
      <Tabs.Screen
        name="mind"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🧘" label="Mind" focused={focused} /> }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconWrap:  { alignItems: 'center', gap: 3, paddingTop: 6, minWidth: 56 },
  indicator: { position: 'absolute', top: -8, width: 20, height: 3, borderRadius: 1.5 },
  iconPill:  { width: 40, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 19 },
  iconLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
})
