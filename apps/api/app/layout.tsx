import './globals.css'
import Script from 'next/script'
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
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body>
          {/* Apply saved theme before first paint — eliminates flash */}
          <Script src="/theme-init.js" strategy="beforeInteractive" />
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
