import Link from 'next/link'
import { Check, Crown, Zap } from 'lucide-react'

const FREE_FEATURES = [
  'Three daily focus tasks',
  'Unlimited focus sessions',
  'Daily mood check-ins',
  'Core support tools (Breathe, Ground, Pause)',
  '7-day mood history',
  'Basic AI insights',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Advanced AI suggestions',
  'Full support tool library',
  'Unlimited mood & focus history',
  'Weekly wellbeing insights',
  'Guided support sessions',
  'Priority new features',
  'Early access programme',
]

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--stable-hero-bg)' }}
      >
        <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(74,122,95,0.08)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div className="relative px-7 md:px-10 pt-10 pb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>PRICING</p>
          <h1 className="text-[32px] md:text-[44px] font-black leading-[1.1] mb-3" style={{ color: 'var(--stable-t1)' }}>
            Simple, honest pricing.
          </h1>
          <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>
            Start free. Upgrade when you&apos;re ready for more.
          </p>
        </div>
      </section>

      {/* Plans */}
      <div className="px-7 md:px-10 py-10">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div
            className="rounded-[28px] p-8 flex flex-col"
            style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--sage-soft)' }}>
                <Zap size={18} style={{ color: 'var(--cat-work)' }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-black text-base" style={{ color: 'var(--stable-t1)' }}>Free</p>
                <p className="text-xs" style={{ color: 'var(--stable-t3)' }}>Always free</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-[44px] font-black leading-none" style={{ color: 'var(--stable-t1)' }}>£0</span>
              <span className="text-sm font-medium ml-1" style={{ color: 'var(--stable-t3)' }}>/month</span>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--sage-soft)' }}>
                    <Check size={11} style={{ color: 'var(--cat-work)' }} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--stable-t2)' }}>{f}</span>
                </li>
              ))}
            </ul>

            <div
              className="w-full py-3.5 rounded-full text-center text-sm font-bold transition-all hover:opacity-80"
              style={{ background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t2)' }}
            >
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div
            className="rounded-[28px] p-8 flex flex-col relative overflow-hidden"
            style={{ background: 'var(--stable-cta)', boxShadow: '0 20px 60px rgba(74,122,95,0.35)' }}
          >
            {/* Blob */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Crown size={18} className="text-white" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-black text-base text-white">Pro</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Full access</p>
              </div>
              <span
                className="ml-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                Coming soon
              </span>
            </div>

            <div className="mb-8 relative">
              <span className="text-[44px] font-black leading-none text-white">£4.99</span>
              <span className="text-sm font-medium ml-1" style={{ color: 'rgba(255,255,255,0.65)' }}>/month</span>
            </div>

            <ul className="space-y-3 flex-1 mb-8 relative">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <Check size={11} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="relative w-full py-3.5 rounded-full text-sm font-black text-center transition-all"
              style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--sage-dark)', cursor: 'not-allowed', opacity: 0.7 }}
            >
              Coming soon
            </button>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--stable-t3)' }}>
          No credit card required for Free plan · Cancel Pro anytime · Prices in GBP
        </p>
      </div>
    </div>
  )
}
