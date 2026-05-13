'use client'

import { useState } from 'react'

const C = {
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

type State = 'idle' | 'submitting' | 'success' | 'error'

export default function FeedbackForm() {
  const [message,          setMessage]          = useState('')
  const [firstName,        setFirstName]        = useState('')
  const [email,            setEmail]            = useState('')
  const [consent,          setConsent]          = useState(false)
  const [state,            setState]            = useState<State>('idle')
  const [errorMsg,         setErrorMsg]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setState('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, firstName: firstName || undefined, email: email || undefined, consentToPublish: consent }),
      })
      if (!res.ok) throw new Error('Server error')
      setState('success')
    } catch {
      setState('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 24px', background: C.sageSft, borderRadius: 20, border: `1px solid ${C.border}`, fontFamily: FONT }}>
        <p style={{ fontSize: 22, marginBottom: 10 }}>🌿</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 6 }}>Thank you for sharing.</p>
        <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.6 }}>Your experience means a lot. We read every submission carefully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONT }}>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Share your experience with stable.…"
        required
        minLength={10}
        maxLength={1000}
        rows={4}
        style={{
          width: '100%', padding: '14px 16px', borderRadius: 16, border: `1px solid ${C.border}`,
          fontSize: 14, color: C.t1, background: '#FAFAF8', resize: 'vertical', fontFamily: FONT,
          lineHeight: 1.6, outline: 'none', boxSizing: 'border-box',
        }}
      />
      <div className="grid sm:grid-cols-2" style={{ gap: 12 }}>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="First name (optional)"
          maxLength={80}
          style={{ padding: '11px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, color: C.t1, background: '#FAFAF8', fontFamily: FONT, outline: 'none' }}
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email (optional)"
          style={{ padding: '11px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, color: C.t1, background: '#FAFAF8', fontFamily: FONT, outline: 'none' }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          style={{ marginTop: 3, accentColor: C.sage, flexShrink: 0 }}
        />
        <span style={{ fontSize: 13, color: C.t2, lineHeight: 1.55 }}>
          I allow stable. to share this feedback publicly (optional — no content is published without review)
        </span>
      </label>
      {errorMsg && (
        <p style={{ fontSize: 13, color: '#e05252', fontWeight: 600 }}>{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === 'submitting' || !message.trim()}
        style={{
          alignSelf: 'flex-start', padding: '11px 24px', borderRadius: 100,
          background: `linear-gradient(135deg, ${C.sageDk}, ${C.sageLt})`,
          color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          opacity: state === 'submitting' || !message.trim() ? 0.5 : 1,
          fontFamily: FONT,
        }}
      >
        {state === 'submitting' ? 'Sending…' : 'Share your experience'}
      </button>
    </form>
  )
}
