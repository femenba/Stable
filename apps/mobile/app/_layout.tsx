import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { trpc, makeQueryClient, makeTrpcClient } from '@/lib/trpc-client'

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key)
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value)
  },
}

function TrpcProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()
  const [queryClient] = useState(() => makeQueryClient())
  const [trpcClient] = useState(() =>
    makeTrpcClient(() => getToken({ template: 'default' }))
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <TrpcProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TrpcProvider>
    </ClerkProvider>
  )
}
