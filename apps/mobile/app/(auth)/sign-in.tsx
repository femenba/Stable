import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useTheme } from '@/lib/use-theme'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const { t } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSignIn() {
    if (!isLoaded) return
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)/')
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Sign in failed')
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.t1 }]}>stable.</Text>
      <Text style={[styles.subtitle, { color: t.t2 }]}>Your focus companion</Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
        placeholder="Email"
        placeholderTextColor={t.t3}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
        placeholder="Password"
        placeholderTextColor={t.t3}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4f3aff' }]}
        onPress={handleSignIn}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-up" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={[styles.linkText, { color: t.t2 }]}>
            No account? <Text style={{ color: '#4f3aff' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title:     { fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  subtitle:  { fontSize: 14, textAlign: 'center', marginBottom: 40 },
  input:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  button:    { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  link:      { marginTop: 20, alignItems: 'center' },
  linkText:  { fontSize: 14 },
  error:     { color: '#ef4444', fontSize: 13, marginBottom: 8, textAlign: 'center' },
})
