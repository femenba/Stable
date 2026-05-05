import { Suspense } from 'react'
import { AppShell } from '../../src/components/app-shell'
import { UserSync } from '../../src/components/user-sync'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <UserSync />
      </Suspense>
      {children}
    </AppShell>
  )
}
