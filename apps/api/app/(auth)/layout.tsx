import Script from 'next/script'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="/theme-init.js" strategy="beforeInteractive" />
      <div
        className="min-h-svh relative overflow-hidden flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #E2EDE4 0%, #EDF4EE 45%, #E8F1E9 100%)' }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -120, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'rgba(74,122,95,0.10)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,126,200,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '35%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(74,143,175,0.06)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        {/* Content — min-w-0 prevents Clerk from blowing out the container */}
        <div
          className="relative w-full min-w-0 overflow-x-hidden"
          style={{ maxWidth: 400, padding: '40px 16px' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
