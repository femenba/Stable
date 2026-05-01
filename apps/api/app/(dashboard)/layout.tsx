import { Suspense } from 'react'
import { Shell } from '../../src/components/shell'
import { UserSync } from '../../src/components/user-sync'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Shell>
      <Suspense fallback={null}>
        <UserSync />
      </Suspense>
      {children}
    </Shell>
  )
}
