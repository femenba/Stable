'use client'

import type {
  CSSProperties, ReactNode,
  ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes,
} from 'react'

// ── Card ──────────────────────────────────────────────────────────────────────

type CardProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  href?: string
}

export function Card({ children, className = '', style = {}, onClick }: CardProps) {
  const base = 'rounded-[28px] transition-all'
  const interactive = onClick ? 'cursor-pointer hover:scale-[1.005] hover:shadow-xl active:scale-[0.99]' : ''
  return (
    <div
      className={`${base} ${interactive} ${className}`}
      style={{
        background: 'var(--stable-card)',
        border:     '1px solid var(--stable-card-border)',
        boxShadow:  'var(--shadow-card)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── Btn ───────────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'glass' | 'tonal'
type BtnSize    = 'xs' | 'sm' | 'md' | 'lg'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant
  size?:    BtnSize
  full?:    boolean
  icon?:    ReactNode
}

const V: Record<BtnVariant, CSSProperties> = {
  primary: { background: 'var(--stable-cta)', color: '#fff',              boxShadow: 'var(--shadow-cta)' },
  ghost:   { background: 'var(--stable-card)', color: 'var(--stable-t2)', border: '1px solid var(--stable-card-border)' },
  danger:  { background: 'rgba(217,96,122,0.1)', color: '#C0445E',        border: '1px solid rgba(217,96,122,0.18)' },
  glass:   { background: 'rgba(255,255,255,0.15)', color: '#fff',         border: '1px solid rgba(255,255,255,0.22)' },
  tonal:   { background: 'rgba(94,139,113,0.12)', color: 'var(--cat-work)' },
}

const S: Record<BtnSize, string> = {
  xs: 'text-[11px] font-semibold px-3.5 py-1.5',
  sm: 'text-xs font-bold px-4 py-2',
  md: 'text-sm font-bold px-6 py-3',
  lg: 'text-[15px] font-black px-8 py-4',
}

export function Btn({
  variant = 'primary', size = 'md', full, icon, children,
  style, className = '', disabled, ...rest
}: BtnProps) {
  return (
    <button
      className={`
        rounded-full inline-flex items-center justify-center gap-2
        transition-all hover:opacity-90 active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${S[size]} ${full ? 'w-full' : ''} ${className}
      `}
      style={{ ...V[variant], ...style }}
      disabled={disabled}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${className}`} style={{ color: 'var(--stable-t3)' }}>
      {children}
    </p>
  )
}

// ── PageHero ──────────────────────────────────────────────────────────────────

type PageHeroProps = {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  actions?: ReactNode
  chips?: ReactNode
}

export function PageHero({ eyebrow, title, subtitle, actions, chips }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden" style={{ background: 'var(--stable-header)', minHeight: 200 }}>
      <div style={{ position: 'absolute', top: -100, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: '25%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="relative px-7 md:px-10 pt-10 md:pt-12 pb-9 md:pb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {eyebrow}
            </p>
          )}
          <h1 className="text-[36px] md:text-[52px] font-black text-white leading-[1.05] mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>{subtitle}</p>
          )}
          {chips && <div className="flex gap-2 flex-wrap mt-4">{chips}</div>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

// ── Chip ─────────────────────────────────────────────────────────────────────

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
      style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      {children}
    </span>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────

type InputProps = InputHTMLAttributes<HTMLInputElement> & { full?: boolean }

export function Input({ full, style, className = '', ...rest }: InputProps) {
  return (
    <input
      className={`rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all
        focus:ring-2 focus:ring-[var(--cat-work)] focus:ring-opacity-25
        ${full ? 'w-full' : ''} ${className}`}
      style={{ background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t1)', ...style }}
      {...rest}
    />
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { full?: boolean }

export function Textarea({ full, style, className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={`rounded-2xl px-4 py-3 text-sm font-medium outline-none resize-none transition-all
        focus:ring-2 focus:ring-[var(--cat-work)] focus:ring-opacity-25
        ${full ? 'w-full' : ''} ${className}`}
      style={{ background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t1)', ...style }}
      {...rest}
    />
  )
}

// ── Empty ─────────────────────────────────────────────────────────────────────

export function Empty({ icon = '📭', message, action }: { icon?: string; message: string; action?: ReactNode }) {
  return (
    <Card className="px-8 py-14 flex flex-col items-center gap-4" style={{ textAlign: 'center' }}>
      <span className="text-4xl">{icon}</span>
      <p className="text-sm" style={{ color: 'var(--stable-t3)' }}>{message}</p>
      {action}
    </Card>
  )
}
