import Link from 'next/link'
import { Check, Wind, Timer, Leaf, Brain, Waves, ArrowRight, Shield, Lock, Star } from 'lucide-react'
import NavClient    from './_home/nav'
import FAQClient    from './_home/faq'
import ScrollReveal from './_home/scroll-reveal'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      '#F7F5F1',
  bgAlt:   '#FFFFFF',
  sage:    '#4A7A5F',
  sageDk:  '#3D6B54',
  sageLt:  '#5E8B71',
  sageSft: 'rgba(74,122,95,0.08)',
  t1:      '#1A2B1E',
  t2:      '#5A6B5E',
  t3:      '#9EADA1',
  border:  'rgba(74,122,95,0.12)',
  card:    '#FFFFFF',
}
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

// ── Phone mockup ───────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div className="hidden md:block" style={{ position: 'absolute', left: -130, top: 80, background: C.card, borderRadius: 20, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: `1px solid ${C.border}`, minWidth: 140, animation: 'float 4s ease-in-out infinite' }}>
        <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Mood today</p>
        <p style={{ fontSize: 20, marginBottom: 4 }}>🙂</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Good</p>
      </div>
      <div className="hidden md:block" style={{ position: 'absolute', right: -120, top: 200, background: `linear-gradient(135deg, ${C.sage}, ${C.sageLt})`, borderRadius: 20, padding: '14px 18px', boxShadow: '0 8px 32px rgba(74,122,95,0.35)', minWidth: 130, animation: 'float 4s ease-in-out infinite 1.5s' }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Focus session</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>24:00</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Deep work</p>
      </div>
      <div className="hidden md:block" style={{ position: 'absolute', left: -100, bottom: 120, background: C.card, borderRadius: 20, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: `1px solid ${C.border}`, animation: 'float 5s ease-in-out infinite 0.5s' }}>
        <p style={{ fontSize: 10, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Tasks done</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: C.t1 }}>3 / 3 <span style={{ color: C.sage }}>✓</span></p>
      </div>
      <div style={{ width: 240, height: 490, background: '#18211C', borderRadius: 44, padding: '14px', boxShadow: '0 48px 96px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.08)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 80, height: 22, background: '#18211C', borderRadius: '0 0 16px 16px', zIndex: 10 }} />
        <div style={{ background: '#F3F6F3', borderRadius: 34, height: '100%', overflow: 'hidden', padding: '28px 14px 14px' }}>
          <p style={{ fontSize: 8, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, fontFamily: FONT }}>MONDAY, 6 JANUARY</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: C.t1, lineHeight: 1.25, marginBottom: 10, fontFamily: FONT }}>Good morning.<br /><span style={{ fontWeight: 400, fontSize: 13, color: C.t2 }}>How are you feeling?</span></p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 100, padding: '5px 10px', marginBottom: 14, fontSize: 11, color: C.t1, fontFamily: FONT }}>
            🌿 Log your mood
          </div>
          <p style={{ fontSize: 8, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7, fontFamily: FONT }}>Take a moment</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 14 }}>
            {[['#4A7A5F', '~1m', 'Breathe'], ['#5BA4C8', '5s', 'Ground'], ['#8B7EC8', '4s', 'Pause']].map(([col, sub, lbl]) => (
              <div key={lbl} style={{ background: '#fff', borderRadius: 14, padding: '7px 4px', textAlign: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${col}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                </div>
                <p style={{ fontSize: 7.5, fontWeight: 800, color: C.t1, fontFamily: FONT }}>{lbl}</p>
                <p style={{ fontSize: 6.5, color: C.t3, fontFamily: FONT }}>{sub}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 8, color: C.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: FONT }}>Today&apos;s tasks</p>
          {['Finish the report', 'Team check-in'].map((t, i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', borderRadius: 12, padding: '7px 8px', marginBottom: 5 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${i === 0 ? C.sage : 'rgba(74,122,95,0.25)'}`, background: i === 0 ? C.sage : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i === 0 && <Check size={8} color="#fff" strokeWidth={3} />}
              </div>
              <p style={{ fontSize: 9, fontWeight: 600, color: i === 0 ? C.t3 : C.t1, textDecoration: i === 0 ? 'line-through' : 'none', fontFamily: FONT }}>{t}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', gap: 4, alignItems: 'flex-end', height: 30 }}>
            {[30, 50, 40, 70, 60, 80, 55].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? C.sage : `${C.sage}30`, borderRadius: 3 }} />
            ))}
          </div>
          <p style={{ fontSize: 7, color: C.t3, textAlign: 'center', marginTop: 3, fontFamily: FONT }}>7-day mood</p>
        </div>
      </div>
    </div>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="top" style={{ background: `linear-gradient(170deg, #E8F1E9 0%, #F7F5F1 60%)`, paddingTop: 'clamp(96px,10vw,136px)', paddingBottom: 'clamp(64px,8vw,96px)', fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left" style={{ maxWidth: 560 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.sageSft, border: `1px solid ${C.border}`, borderRadius: 100, padding: '6px 14px', marginBottom: 24 }}>
              <Leaf size={12} style={{ color: C.sage }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.sage, letterSpacing: '0.04em' }}>Built for ADHD &amp; busy minds</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.08, color: C.t1, letterSpacing: '-2px', marginBottom: 20 }}>
              Find calm in<br />
              <span style={{ background: `linear-gradient(135deg, ${C.sage} 0%, ${C.sageLt} 60%, #7BA698 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                every busy day.
              </span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: C.t2, marginBottom: 36, maxWidth: 460 }}>
              stable. helps you stay focused, manage your mood, and build routines — without the overwhelm.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }} className="lg:justify-start">
              <Link href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${C.sageDk}, ${C.sageLt})`, color: '#fff', borderRadius: 100, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 24px rgba(74,122,95,0.42)' }}>
                Start free today <ArrowRight size={16} />
              </Link>
              <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.t1, borderRadius: 100, padding: '14px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.7)' }}>
                See how it works
              </a>
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: C.t3 }}>Free forever · No credit card needed</p>
            <div className="flex lg:hidden flex-wrap gap-2 mt-7 justify-center">
              {[['🎯', 'Focus timer'], ['🌿', 'Mood tracking'], ['🧘', 'Calm tools'], ['✓', 'Daily tasks']].map(([e, l]) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.75)', border: `1px solid ${C.border}`, borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: C.t1, backdropFilter: 'blur(8px)' }}>
                  {e} {l}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex" style={{ justifyContent: 'center', minWidth: 360 }}>
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Trust bar ──────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: <Lock size={14} />,   text: 'Privacy first' },
    { icon: <Shield size={14} />, text: 'Secure by design' },
    { icon: <Star size={14} />,   text: '4.9 star rating' },
    { icon: <Leaf size={14} />,   text: 'Built for ADHD minds' },
    { icon: <Check size={14} />,  text: 'Free to start' },
  ]
  return (
    <div style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 32px' }}>
        {items.map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.t2 }}>
            <span style={{ color: C.sage }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Features ───────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Timer,  color: '#4A7A5F', bg: 'rgba(74,122,95,0.08)',   label: 'Deep Focus Timer',     desc: 'Pomodoro-style sessions with calm countdowns. Stay in flow without the pressure.' },
  { icon: Leaf,   color: '#8B7EC8', bg: 'rgba(139,126,200,0.08)', label: 'Mood Check-ins',       desc: 'Track how you feel each day with a simple tap. Spot patterns and understand yourself better.' },
  { icon: Wind,   color: '#4A8FAF', bg: 'rgba(74,143,175,0.08)',  label: 'Calm Support Tools',   desc: 'Breathe, ground yourself, or ride the wave — 6 science-backed tools for hard moments.' },
  { icon: Brain,  color: '#C05570', bg: 'rgba(192,85,112,0.08)',  label: 'AI-Guided Insights',   desc: "Weekly wellbeing reports that notice what you can't. Gentle suggestions, not lectures." },
  { icon: Check,  color: '#5E8B71', bg: 'rgba(94,139,113,0.08)',  label: 'Three Daily Tasks',    desc: 'Focus on what matters most. Three tasks a day keeps the overwhelm away.' },
  { icon: Waves,  color: '#7B6DB8', bg: 'rgba(123,109,184,0.08)', label: 'Reminders & Routines', desc: "Gentle nudges — not nags. Build routines that actually stick." },
]

function Features() {
  return (
    <section id="features" style={{ background: C.bg, padding: 'clamp(64px,8vw,96px) 24px', fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div data-mkt-animate style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>EVERYTHING YOU NEED</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.t1, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>
            Built for minds that move fast.
          </h2>
          <p style={{ fontSize: 17, color: C.t2, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            Tools designed for how ADHD brains actually work — not how productivity apps think they should.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
          {FEATURES.map(({ icon: Icon, color, bg, label, desc }, i) => (
            <div
              key={label}
              data-mkt-animate
              className={i < 3 ? '' : `mkt-d${i - 2}`}
              style={{ background: C.card, borderRadius: 24, padding: 28, border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={22} style={{ color }} strokeWidth={1.7} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.t1, marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Benefits ───────────────────────────────────────────────────────────────
const BENEFITS = [
  { emoji: '🧘', title: 'Calmer mind',      desc: 'Start each day with intention. End it knowing you did enough.' },
  { emoji: '🎯', title: 'Razor-sharp focus', desc: 'Block out distractions and work in focused bursts that actually feel good.' },
  { emoji: '📉', title: 'Less overwhelm',   desc: 'Three tasks a day. One focus session at a time. Progress without the spiral.' },
  { emoji: '🌱', title: 'Habits that stick', desc: 'Gentle reminders and routines that work with your brain, not against it.' },
]

function Benefits() {
  return (
    <section style={{ background: C.bgAlt, padding: 'clamp(64px,8vw,96px) 24px', fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div data-mkt-animate style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>WHY STABLE.</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.t1, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 }}>
              Less noise.<br />More of what matters.
            </h2>
            <p style={{ fontSize: 17, color: C.t2, lineHeight: 1.65, marginBottom: 36, maxWidth: 420 }}>
              stable. strips away everything a distracted mind doesn&apos;t need — and keeps only the tools that genuinely help.
            </p>
            <Link href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.sage, color: '#fff', borderRadius: 100, padding: '13px 26px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(74,122,95,0.38)' }}>
              Try it free <ArrowRight size={15} />
            </Link>
          </div>
          <div data-mkt-animate className="mkt-d1" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BENEFITS.map(({ emoji, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: C.bg, borderRadius: 20, padding: '20px 22px', border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.t1, marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── How it works ───────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', title: 'Set your day',        desc: "Choose up to three tasks. Pick how long you want to focus. You're ready." },
  { num: '02', title: 'Focus & check in',    desc: 'Run focus sessions. Log your mood. Use a support tool when you need it.' },
  { num: '03', title: 'Feel the difference', desc: 'See your mood trends. Celebrate your streaks. Build the life you want.' },
]

function HowItWorks() {
  return (
    <section style={{ background: `linear-gradient(160deg, #E8F1E9 0%, #F7F5F1 100%)`, padding: 'clamp(64px,8vw,96px) 24px', fontFamily: FONT }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div data-mkt-animate style={{ marginBottom: 60 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.t1, letterSpacing: '-1px', lineHeight: 1.1 }}>Simple by design.</h2>
        </div>
        <div className="grid md:grid-cols-3" style={{ gap: 20 }}>
          {STEPS.map(({ num, title, desc }, i) => (
            <div
              key={num}
              data-mkt-animate
              className={`mkt-d${i + 1}`}
              style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: '32px 28px', border: `1px solid ${C.border}`, textAlign: 'left' }}
            >
              <p style={{ fontSize: 36, fontWeight: 900, color: C.sage, opacity: 0.35, lineHeight: 1, marginBottom: 16, letterSpacing: '-1px' }}>{num}</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.t1, marginBottom: 10 }}>{title}</p>
              <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ────────────────────────────────────────────────────────────────
const FREE_FEATURES = ['Three daily focus tasks', 'Unlimited focus sessions', 'Daily mood check-ins', 'Core support tools', '7-day mood history', 'Basic AI insights']
const PRO_FEATURES  = ['Everything in Free', 'Advanced AI suggestions', 'Full support tool library', 'Unlimited mood history', 'Weekly wellbeing reports', 'Guided support sessions', 'Priority new features', 'Early access programme']

function Pricing() {
  return (
    <section id="pricing" style={{ background: C.bg, padding: 'clamp(64px,8vw,96px) 24px', fontFamily: FONT }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div data-mkt-animate style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>PRICING</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.t1, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 12 }}>
            Simple, honest pricing.
          </h2>
          <p style={{ fontSize: 16, color: C.t2 }}>Start free. Upgrade when you&apos;re ready for more.</p>
        </div>
        <div className="grid md:grid-cols-2" style={{ gap: 24 }}>
          <div data-mkt-animate style={{ background: C.card, borderRadius: 28, padding: 36, border: `1px solid ${C.border}`, boxShadow: '0 2px 24px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Free</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: C.t1, letterSpacing: '-2px' }}>£0</span>
              <span style={{ fontSize: 14, color: C.t3 }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: C.t3, marginBottom: 28 }}>Always free, no card needed.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: C.sageSft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} style={{ color: C.sage }} strokeWidth={2.5} />
                  </span>
                  <span style={{ fontSize: 14, color: C.t2 }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', background: 'transparent', border: `1.5px solid ${C.border}`, color: C.t1, borderRadius: 100, padding: '13px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Get started free
            </Link>
          </div>
          <div data-mkt-animate className="mkt-d1" style={{ background: `linear-gradient(145deg, ${C.sageDk} 0%, ${C.sage} 50%, ${C.sageLt} 100%)`, borderRadius: 28, padding: 36, boxShadow: '0 20px 56px rgba(74,122,95,0.40)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(40px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pro</p>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '4px 10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Coming soon</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>£4.99</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>Full access, cancel anytime.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color="white" strokeWidth={2.5} />
                  </span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <button disabled style={{ display: 'block', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.90)', color: C.sageDk, borderRadius: 100, padding: '13px', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'not-allowed', opacity: 0.75 }}>
              Coming soon
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: C.t3, marginTop: 20 }}>
          No credit card required for Free plan · Cancel Pro anytime · Prices in GBP
        </p>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Freelance designer',  text: "I've tried every productivity app. stable. is the first one that doesn't make me feel more overwhelmed than before I opened it.", rating: 5 },
  { name: 'James T.', role: 'Software developer',  text: 'The mood check-ins genuinely changed how I understand my own patterns. Three weeks in and I actually look forward to opening it.', rating: 5 },
  { name: 'Priya K.', role: 'University student',  text: 'Finally something built for how my brain actually works. The breathing tool alone is worth it for exam season.', rating: 5 },
]

function Testimonials() {
  return (
    <section style={{ background: C.bgAlt, padding: 'clamp(64px,8vw,96px) 24px', fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div data-mkt-animate style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>WHAT PEOPLE SAY</p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: C.t1, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Real people. Real calm.
          </h2>
        </div>
        <div className="grid md:grid-cols-3" style={{ gap: 20 }}>
          {TESTIMONIALS.map(({ name, role, text, rating }, i) => (
            <div key={name} data-mkt-animate className={`mkt-d${i + 1}`} style={{ background: C.bg, borderRadius: 24, padding: '28px 26px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} size={14} style={{ color: '#F4A535', fill: '#F4A535' }} />
                ))}
              </div>
              <p style={{ fontSize: 15, color: C.t1, lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic' }}>&ldquo;{text}&rdquo;</p>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: C.t1 }}>{name}</p>
                <p style={{ fontSize: 12, color: C.t3 }}>{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ──────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ background: `linear-gradient(145deg, ${C.sageDk} 0%, ${C.sage} 50%, ${C.sageLt} 100%)`, padding: '96px 24px', fontFamily: FONT, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(50px)' }} />
      <div data-mkt-animate style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>
          Ready to feel more stable?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 36 }}>
          Join thousands of people building calmer, more focused lives with stable.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.sageDk, borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 800, textDecoration: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }}>
            Start free today <ArrowRight size={16} />
          </Link>
        </div>
        <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Free forever · No credit card · 2 minutes to get started</p>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#12201A', padding: '48px 24px 36px', fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
          <div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>stable.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 240, lineHeight: 1.6 }}>Focus, mood, and calm — in one private space.</p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {[
              { heading: 'Product', links: [['Features', '#features'], ['Pricing', '#pricing'], ['Sign in', '/sign-in'], ['Get started', '/sign-up']] },
              { heading: 'Company', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact', '/contact']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>{heading}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(([label, href]) => (
                    <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} stable. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Made with care · stableadhd.com</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page (server component) ────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ fontFamily: FONT, overflowX: 'hidden' }}>
      <ScrollReveal />
      <NavClient />
      <Hero />
      <TrustBar />
      <Features />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQClient />
      <FinalCTA />
      <Footer />
    </div>
  )
}
