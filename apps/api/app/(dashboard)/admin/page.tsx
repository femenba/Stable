import { Users, MessageSquare, CreditCard, Settings, ArrowRight } from 'lucide-react'

const SECTIONS = [
  {
    icon:  Users,
    label: 'User Management',
    desc:  'View registered users, manage accounts, and review activity.',
    color: '#4A7A5F',
    bg:    'rgba(74,122,95,0.08)',
    items: ['0 total users', '0 active today', '0 new this week'],
  },
  {
    icon:  MessageSquare,
    label: 'Support Requests',
    desc:  'Review incoming support messages and contact form submissions.',
    color: '#4A8FAF',
    bg:    'rgba(74,143,175,0.08)',
    items: ['0 open tickets', '0 resolved', '0 awaiting reply'],
  },
  {
    icon:  CreditCard,
    label: 'Subscriptions',
    desc:  'Monitor plan usage, upgrades, and billing status.',
    color: '#8B7EC8',
    bg:    'rgba(139,126,200,0.08)',
    items: ['0 Free accounts', '0 Pro accounts', '£0 MRR'],
  },
  {
    icon:  Settings,
    label: 'Account Settings',
    desc:  'Manage your personal profile, preferences, and notification settings.',
    color: '#7A8F82',
    bg:    'rgba(122,143,130,0.08)',
    items: ['Profile information', 'Notification preferences', 'Data & privacy'],
  },
]

export default function AdminPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--stable-hero-bg)' }}
      >
        <div style={{ position: 'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,122,95,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
            ADMIN
          </p>
          <h1 className="text-[32px] md:text-[40px] font-black leading-[1.1] mb-2" style={{ color: 'var(--stable-t1)' }}>
            Account &<br />Admin Area
          </h1>
          <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>
            Manage users, subscriptions, and support from one place.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'rgba(192,85,112,0.1)', color: '#C05570', border: '1px solid rgba(192,85,112,0.15)' }}>
            Placeholder — backend not yet connected
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="px-7 md:px-10 py-8">
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl">
          {SECTIONS.map((s) => (
            <div
              key={s.label}
              className="rounded-[24px] p-6"
              style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <s.icon size={20} style={{ color: s.color }} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--stable-t1)' }}>{s.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--stable-t2)' }}>{s.desc}</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {s.items.map((item) => (
                  <div key={item} className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'var(--stable-bg)' }}>
                    <span className="text-xs" style={{ color: 'var(--stable-t2)' }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
                style={{ color: s.color }}
              >
                View details <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
