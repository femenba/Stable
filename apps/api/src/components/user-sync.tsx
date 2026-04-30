'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { trpc } from '@/lib/trpc-client'

export function UserSync() {
  const { user, isLoaded } = useUser()
  const upsert = trpc.users.upsertMe.useMutation()

  useEffect(() => {
    if (!isLoaded || !user) return
    upsert.mutate({
      email: user.primaryEmailAddress?.emailAddress ?? '',
      name: user.fullName ?? undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id])

  return null
}
