export function AiInsight() {
  return (
    <div
      className="mx-3 mt-3 rounded-xl px-4 py-3"
      style={{
        background: 'var(--stable-card)',
        border:     '1px solid var(--stable-card-border)',
      }}
    >
      <div
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-2 text-[9px] font-bold uppercase tracking-wide"
        style={{
          background: 'rgba(99,102,241,0.12)',
          border:     '1px solid rgba(99,102,241,0.3)',
          color:      'var(--cat-work)',
        }}
      >
        ⬡ STABLE AI
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
        Pick your three most important tasks and focus on{' '}
        <strong style={{ color: 'var(--stable-t1)' }}>one at a time</strong>.{' '}
        Your focus is sharpest{' '}
        <strong style={{ color: 'var(--stable-t1)' }}>before noon</strong>.
      </p>
    </div>
  )
}
