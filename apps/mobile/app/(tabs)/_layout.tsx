import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Text, View, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/use-theme'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  const { t } = useTheme()
  const activeColor = '#4f3aff'
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.iconEmoji}>{icon}</Text>
      {focused && <View style={[styles.dot, { backgroundColor: activeColor }]} />}
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
          borderTopColor:  t.navBorder,
          height: 72,
          paddingBottom: 12,
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
  iconWrap:  { alignItems: 'center', gap: 2, paddingTop: 8 },
  iconEmoji: { fontSize: 20 },
  dot:       { width: 4, height: 4, borderRadius: 2 },
  iconLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
})
