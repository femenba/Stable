'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'

const FONT   = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const T1     = '#1A2B1E'
const T2     = '#5A6B5E'
const SAGE   = '#4A7A5F'
const BORDER = 'rgba(74,122,95,0.12)'

export default function NavClient() {
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      background: scrolled ? 'rgba(247,245,241,0.88)' : 'transparent',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'background 0.3s ease, border-color 0.3s ease',
      fontFamily: FONT,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#top" style={{ fontWeight: 900, fontSize: 20, color: T1, textDecoration: 'none', letterSpacing: '-0.5px' }}>
          stable.
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="#features" className="hidden md:inline" style={{ color: T2, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '6px 12px' }}>Features</a>
          <a href="#pricing"  className="hidden md:inline" style={{ color: T2, fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '6px 12px' }}>Pricing</a>
          {isSignedIn ? (
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: SAGE, color: '#fff', borderRadius: 100, padding: '9px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(74,122,95,0.35)' }}>
              Go to dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/sign-in" style={{ color: T2, fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 14px' }}>Sign in</Link>
              <Link href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: SAGE, color: '#fff', borderRadius: 100, padding: '9px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(74,122,95,0.35)' }}>
                Get started <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
