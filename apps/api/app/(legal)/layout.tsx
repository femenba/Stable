import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const SAGE = '#4A7A5F'
const T1   = '#1A2B1E'
const T2   = '#5A6B5E'
const T3   = '#9EADA1'
const BDR  = 'rgba(74,122,95,0.12)'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#F7F5F1', minHeight: '100svh', fontFamily: FONT }}>
      {/* Sticky nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(247,245,241,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${BDR}`, height: 60 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: 18, color: T1, textDecoration: 'none', letterSpacing: '-0.5px' }}>
            stable.
          </Link>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: T2, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </header>

      {/* Page content */}
      <div>{children}</div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BDR}`, padding: '32px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 12, color: T3 }}>© {new Date().getFullYear()} stable. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {([['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact', '/contact']] as const).map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: T3, textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
