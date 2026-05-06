'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
const T1   = '#1A2B1E'
const T2   = '#5A6B5E'
const SAGE = '#4A7A5F'
const BDR  = 'rgba(74,122,95,0.12)'
const BG   = '#F7F5F1'
const CARD = '#FFFFFF'

const FAQS = [
  { q: 'Is stable. really free?',
    a: 'Yes. The Free plan is free forever. No credit card needed, no hidden fees. We believe everyone deserves access to basic wellbeing tools.' },
  { q: 'Is stable. designed for people with ADHD?',
    a: 'Yes. stable. was designed with ADHD in mind — short focus sessions, gentle reminders, mood tracking, and support tools that work with how ADHD brains actually function.' },
  { q: 'What are the support tools?',
    a: 'stable. includes six evidence-based tools: Breathe With Me, Come Back to Now (grounding), Pause Before Reacting, Ride the Wave (urge surfing), Choose a Helpful Next Step, and Find Your Calm Self.' },
  { q: 'Is my data private?',
    a: "Absolutely. Your data is yours. We don't sell or share your personal information. All mood and task data is stored securely and never used for advertising." },
  { q: 'When is Pro launching?',
    a: "Pro is coming soon. Sign up for free now and you'll be notified when Pro launches. Early users will get a special introductory rate." },
  { q: 'Does stable. work on iPhone and Android?',
    a: 'stable. works as a Progressive Web App (PWA) — save it to your home screen on any device. Native iOS and Android apps are on the roadmap.' },
]

export default function FAQClient() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ background: BG, padding: 'clamp(64px,8vw,96px) 24px', fontFamily: FONT }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div data-mkt-animate style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: T1, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Questions answered.
          </h2>
        </div>
        <div data-mkt-animate className="mkt-d1" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={q} style={{ background: CARD, borderRadius: 18, border: `1px solid ${BDR}`, overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{q}</span>
                <span style={{ flexShrink: 0, color: SAGE }}>
                  {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '0 22px 18px' }}>
                  <p style={{ fontSize: 14, color: T2, lineHeight: 1.7, margin: 0 }}>{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
