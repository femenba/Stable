import './globals.css'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '../src/lib/providers'

export const viewport: Viewport = {
  themeColor:         '#4A7A5F',
  width:              'device-width',
  initialScale:       1,
  viewportFit:        'cover',
}

export const metadata: Metadata = {
  title:       'stable.',
  description: 'Your focus & wellbeing companion',
  manifest:    '/manifest.webmanifest',
  appleWebApp: {
    capable:           true,
    statusBarStyle:    'black-translucent',
    title:             'stable.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body>
          <Script src="/theme-init.js" strategy="beforeInteractive" />
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
