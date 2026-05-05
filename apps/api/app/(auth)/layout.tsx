import Script from 'next/script'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Apply saved theme before first paint */}
      <Script src="/theme-init.js" strategy="beforeInteractive" />
      <div
        className="min-h-svh flex items-center justify-center"
        style={{ background: 'var(--stable-bg)' }}
      >
        <div className="w-full max-w-md px-4 py-12">{children}</div>
      </div>
    </>
  )
}
