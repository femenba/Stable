import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '../src/lib/providers'

export const metadata = {
  title: 'stable.',
  description: 'Your focus companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
