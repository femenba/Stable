import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useTheme } from '@/lib/use-theme'

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const { t } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [error, setError] = useState('')

  async function handleSignUp() {
    if (!isLoaded) return
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Sign up failed')
    }
  }

  async function handleVerify() {
    if (!isLoaded) return
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)/')
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Verification failed')
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.t1 }]}>stable.</Text>

      {!pendingVerification ? (
        <>
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
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4f3aff' }]} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.subtitle, { color: t.t2 }]}>Check your email for a verification code.</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.card, borderColor: t.cardBorder, color: t.t1 }]}
            placeholder="Verification code"
            placeholderTextColor={t.t3}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4f3aff' }]} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify email</Text>
          </TouchableOpacity>
        </>
      )}

      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={[styles.linkText, { color: t.t2 }]}>
            Already have an account? <Text style={{ color: '#4f3aff' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title:     { fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  subtitle:  { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  input:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12 },
  button:    { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  link:      { marginTop: 20, alignItems: 'center' },
  linkText:  { fontSize: 14 },
  error:     { color: '#ef4444', fontSize: 13, marginBottom: 8, textAlign: 'center' },
})
