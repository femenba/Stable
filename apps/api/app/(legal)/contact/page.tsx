import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageSquare, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title:       'Contact Support · stable.',
  description: 'Get in touch with the stable. team. We\'re here to help.',
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const T1   = '#1A2B1E'
const T2   = '#5A6B5E'
const T3   = '#9EADA1'
const SAGE = '#4A7A5F'
const BDR  = 'rgba(74,122,95,0.12)'

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(56px,8vw,96px) 24px 0', fontFamily: FONT }}>

      {/* Header */}
      <header style={{ marginBottom: 52 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Support</p>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: T1, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 14 }}>
          How can we<br />help?
        </h1>
        <p style={{ fontSize: 17, color: T2, lineHeight: 1.65, maxWidth: 420 }}>
          We&apos;re a small team that genuinely cares. Reach out and we&apos;ll get back to you as soon as we can.
        </p>
      </header>

      {/* Email card — hero CTA */}
      <a
        href="mailto:support@stableadhd.com"
        style={{ display: 'block', textDecoration: 'none', background: `linear-gradient(135deg, #3D6B54, #4A7A5F 50%, #5E8B71)`, borderRadius: 28, padding: '32px 32px', marginBottom: 20, boxShadow: '0 12px 40px rgba(74,122,95,0.35)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="white" strokeWidth={1.7} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email us</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 4 }}>
              support@stableadhd.com
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Tap to open your mail app</p>
          </div>
          <ArrowRight size={20} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0 }} />
        </div>
      </a>

      {/* Info cards */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 48 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '22px 24px', border: `1px solid ${BDR}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(74,122,95,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={18} style={{ color: SAGE }} strokeWidth={1.7} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>Response times</p>
            <p style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>We aim to respond to all support emails within 1–2 business days. For urgent issues, please include &ldquo;Urgent&rdquo; in your subject line.</p>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '22px 24px', border: `1px solid ${BDR}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(74,122,95,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={18} style={{ color: SAGE }} strokeWidth={1.7} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>What to include</p>
            <p style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>To help us resolve your issue faster, please include a brief description of the problem, your device and browser, and the email address associated with your stable. account.</p>
          </div>
        </div>
      </div>

      {/* Common topics */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Common topics</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Account or login issues',
            'Data deletion or export request',
            'Billing or subscription question',
            'Feature request or feedback',
            'Bug report',
          ].map((topic) => (
            <a
              key={topic}
              href={`mailto:support@stableadhd.com?subject=${encodeURIComponent(topic)}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderRadius: 16, padding: '14px 18px', border: `1px solid ${BDR}`, textDecoration: 'none', color: T1, fontSize: 14, fontWeight: 600 }}
            >
              {topic}
              <ArrowRight size={14} style={{ color: T3, flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>

      {/* Legal quick links */}
      <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 28, marginBottom: 40, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Link href="/privacy" style={{ fontSize: 13, color: T3, textDecoration: 'none' }}>Privacy Policy</Link>
        <Link href="/terms"   style={{ fontSize: 13, color: T3, textDecoration: 'none' }}>Terms of Service</Link>
        <Link href="/pricing" style={{ fontSize: 13, color: T3, textDecoration: 'none' }}>Pricing</Link>
      </div>

    </div>
  )
}
