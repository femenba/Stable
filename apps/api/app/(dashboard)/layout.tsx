import { Sidebar } from '../../src/components/sidebar'
import { UserSync } from '../../src/components/user-sync'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <UserSync />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
