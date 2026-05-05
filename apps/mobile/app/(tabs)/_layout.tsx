import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/use-theme'

const SAGE = '#5E8B71'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  const { t } = useTheme()
  return (
    <View style={tab.wrap}>
      {focused && <View style={tab.topBar} />}
      <View style={[tab.pill, focused && { backgroundColor: 'rgba(94,139,113,0.12)' }]}>
        <Text style={[tab.emoji, { opacity: focused ? 1 : 0.5 }]}>{icon}</Text>
      </View>
      <Text style={[tab.label, { color: focused ? SAGE : t.t3 }]}>{label}</Text>
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
        headerShown:    false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: t.nav,
          borderTopWidth:  0,
          shadowColor:     '#000',
          shadowOffset:    { width: 0, height: -4 },
          shadowOpacity:   0.06,
          shadowRadius:    20,
          elevation:       14,
          height:          72,
          paddingBottom:   0,
        },
      }}
    >
      <Tabs.Screen name="index"     options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⊞" label="Today"     focused={focused} /> }} />
      <Tabs.Screen name="tasks"     options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✓"  label="Tasks"     focused={focused} /> }} />
      <Tabs.Screen name="focus"     options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⏱" label="Focus"     focused={focused} /> }} />
      <Tabs.Screen name="reminders" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔔" label="Remind"    focused={focused} /> }} />
      <Tabs.Screen name="mind"      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🧘" label="Mind"      focused={focused} /> }} />
    </Tabs>
  )
}

const tab = StyleSheet.create({
  wrap:   { alignItems: 'center', gap: 2, paddingTop: 2, minWidth: 52 },
  topBar: { position: 'absolute', top: -8, width: 24, height: 3, borderRadius: 2, backgroundColor: SAGE },
  pill:   { width: 44, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emoji:  { fontSize: 18 },
  label:  { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
})
