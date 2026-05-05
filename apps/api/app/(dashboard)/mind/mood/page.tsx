'use client'

import { useState } from 'react'
import { trpc } from '../../../../src/lib/trpc-client'
import Link from 'next/link'
import { ThemeToggle } from '../../../../src/components/theme-toggle'

const MOOD_EMOJIS  = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS  = ['Very low', 'Low', 'Okay', 'Good', 'Great']
const VALID_TAGS   = ['focused', 'calm', 'anxious', 'overwhelmed', 'sad', 'irritable', 'motivated', 'tired'] as const
type MoodTag = typeof VALID_TAGS[number]

function pctToEnergy(pct: number) {
  if (pct <= 33) return 1
  if (pct <= 66) return 3
  return 5
}
function energyLabel(pct: number) {
  if (pct <= 33) return '🪫 Low'
  if (pct <= 66) return '🔋 Medium'
  return '⚡ Full'
}

export default function MoodPage() {
  const today = new Date().toISOString().slice(0, 10)
  const utils  = trpc.useUtils()

  const { data: todayEntry } = trpc.moodEntries.today.useQuery({ date: today })
  const { data: history = [] } = trpc.moodEntries.history.useQuery({ limit: 7 })

  const [rating,  setRating]  = useState<number | null>(null)
  const [energy,  setEnergy]  = useState(50)
  const [tags,    setTags]    = useState<MoodTag[]>([])
  const [note,    setNote]    = useState('')
  const [logged,  setLogged]  = useState(false)

  const logMood = trpc.moodEntries.log.useMutation({
    onSuccess: () => {
      utils.moodEntries.today.invalidate()
      utils.moodEntries.history.invalidate()
      setLogged(true)
    },
  })

  function toggleTag(tag: MoodTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handleSubmit() {
    if (!rating) return
    logMood.mutate({
      rating,
      energy:  pctToEnergy(energy),
      tags:    tags.length > 0 ? tags : undefined,
      note:    note.trim() || undefined,
    })
  }

  const showForm = !logged && !todayEntry

  const checkedIn = logged || !!todayEntry
  const displayEntry = logged ? null : todayEntry

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE — hidden on md+
      ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <div className="relative overflow-hidden px-5 pt-12 pb-8" style={{ background: 'var(--stable-header)' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div className="flex items-center justify-between mb-4">
            <Link href="/mind" className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
              ‹ Mind
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="text-[26px] font-black text-white leading-tight">Mood Check-in</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.58)' }}>A small moment of self-awareness.</p>
        </div>

        <div className="px-4 py-4 space-y-4">
          <MoodFormCard
            showForm={showForm}
            checkedIn={checkedIn}
            displayEntry={displayEntry}
            rating={rating} setRating={setRating}
            energy={energy} setEnergy={setEnergy}
            tags={tags} toggleTag={toggleTag}
            note={note} setNote={setNote}
            onSubmit={handleSubmit}
            onUpdate={() => setLogged(false)}
            isPending={logMood.isPending}
          />
          <HistoryCard history={history} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP — hidden on mobile
      ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden" style={{ background: 'var(--stable-header)' }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div className="px-10 lg:px-12 pt-12 pb-10">
            <Link href="/mind" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>← Mind</Link>
            <h1 className="text-[44px] font-black text-white leading-[1.1] mt-3 mb-2">Mood Check-in</h1>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>A small moment of self-awareness goes a long way.</p>
          </div>
        </div>
        <div className="px-10 lg:px-12 pt-8 pb-12">

        <div className="grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2">
            <MoodFormCard
              showForm={showForm}
              checkedIn={checkedIn}
              displayEntry={displayEntry}
              rating={rating} setRating={setRating}
              energy={energy} setEnergy={setEnergy}
              tags={tags} toggleTag={toggleTag}
              note={note} setNote={setNote}
              onSubmit={handleSubmit}
              onUpdate={() => setLogged(false)}
              isPending={logMood.isPending}
            />
          </div>
          <div className="col-span-1">
            <HistoryCard history={history} />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

// ─── Form card ────────────────────────────────────────────────────────────────

function MoodFormCard({
  showForm, checkedIn, displayEntry,
  rating, setRating, energy, setEnergy,
  tags, toggleTag, note, setNote,
  onSubmit, onUpdate, isPending,
}: {
  showForm: boolean; checkedIn: boolean
  displayEntry: { rating: number; energy: number | null; tags: string[] } | null | undefined
  rating: number | null; setRating: (r: number) => void
  energy: number; setEnergy: (e: number) => void
  tags: MoodTag[]; toggleTag: (t: MoodTag) => void
  note: string; setNote: (n: string) => void
  onSubmit: () => void; onUpdate: () => void; isPending: boolean
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
    >
      {checkedIn && !showForm ? (
        <div className="text-center py-6 space-y-3">
          <div className="text-5xl">
            {displayEntry ? MOOD_EMOJIS[displayEntry.rating - 1] : '✓'}
          </div>
          <p className="text-lg font-bold" style={{ color: 'var(--stable-t1)' }}>
            {displayEntry ? `${MOOD_LABELS[displayEntry.rating - 1]} — checked in` : 'Mood logged!'}
          </p>
          {displayEntry?.energy && (
            <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>
              Energy: {energyLabel(displayEntry.energy <= 1 ? 16 : displayEntry.energy <= 3 ? 50 : 84)}
              {displayEntry.tags.length > 0 && <> · {displayEntry.tags.join(', ')}</>}
            </p>
          )}
          <button
            onClick={onUpdate}
            className="text-sm font-semibold px-4 py-2 rounded-xl border transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--stable-card-border)', color: 'var(--stable-t2)' }}
          >
            Update
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mood rating */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
              How are you feeling?
            </p>
            <div className="flex gap-3">
              {MOOD_EMOJIS.map((emoji, i) => {
                const val = i + 1
                const active = rating === val
                return (
                  <button
                    key={val}
                    onClick={() => setRating(val)}
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                      background:  active ? 'rgba(94,139,113,0.1)' : 'var(--stable-bg)',
                      boxShadow:   active ? '0 4px 16px rgba(94,139,113,0.15)' : 'none',
                    }}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <span className="text-[10px] font-bold" style={{ color: active ? 'var(--cat-work)' : 'var(--stable-t3)' }}>
                      {MOOD_LABELS[i]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Energy slider */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
              Energy level
            </p>
            <div className="flex gap-2 mb-3">
              {[{ e: '🪫', l: 'Low', range: [0, 33] }, { e: '🔋', l: 'Medium', range: [34, 66] }, { e: '⚡', l: 'Full', range: [67, 100] }].map(({ e, l, range }) => {
                const active = energy >= range[0] && energy <= range[1]
                return (
                  <div
                    key={l}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2"
                    style={{
                      borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                      background:  active ? 'rgba(94,139,113,0.08)' : 'transparent',
                    }}
                  >
                    <span className="text-xl">{e}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: active ? 'var(--cat-work)' : 'var(--stable-t3)' }}>{l}</span>
                  </div>
                )
              })}
            </div>
            <input
              type="range" min={0} max={100} value={energy}
              onChange={(ev) => setEnergy(Number(ev.target.value))}
              className="w-full"
              style={{ accentColor: 'var(--cat-work)' }}
            />
            <p className="text-center text-xs font-bold mt-1" style={{ color: 'var(--cat-work)' }}>
              Energy: {energy}%
            </p>
          </div>

          {/* Tags */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
              Feeling tags
            </p>
            <div className="flex flex-wrap gap-2">
              {VALID_TAGS.map((tag) => {
                const active = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full border-2 text-xs font-bold capitalize transition-all"
                    style={{
                      borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                      background:  active ? 'rgba(94,139,113,0.1)' : 'transparent',
                      color:       active ? 'var(--cat-work)' : 'var(--stable-t2)',
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
              Note (optional)
            </p>
            <textarea
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              placeholder="Anything on your mind?"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none border-2 outline-none transition-colors"
              style={{
                background:   'var(--stable-bg)',
                borderColor:  'var(--stable-card-border)',
                color:        'var(--stable-t1)',
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={!rating || isPending}
            className="w-full py-4 rounded-2xl text-white font-black text-sm transition-opacity hover:opacity-90"
            style={{
              background:  'var(--stable-cta)',
              boxShadow:   rating ? 'var(--shadow-cta)' : 'none',
              opacity:     rating ? 1 : 0.35,
            }}
          >
            {isPending ? 'Saving…' : 'Log mood ✓'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ history }: { history: { rating: number; createdAt: string; energy: number | null; tags: string[] }[] }) {
  if (history.length === 0) return null

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
        Recent entries
      </p>
      <div className="space-y-3">
        {history.slice(0, 7).map((entry) => (
          <div key={entry.createdAt} className="flex items-center gap-3">
            <span className="text-xl shrink-0">{MOOD_EMOJIS[entry.rating - 1]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--stable-t1)' }}>
                {MOOD_LABELS[entry.rating - 1]}
                {entry.energy && <span className="font-normal ml-1" style={{ color: 'var(--stable-t3)' }}>· {entry.energy <= 1 ? '🪫' : entry.energy <= 3 ? '🔋' : '⚡'}</span>}
              </p>
              {entry.tags.length > 0 && (
                <p className="text-xs truncate capitalize" style={{ color: 'var(--stable-t3)' }}>{entry.tags.join(', ')}</p>
              )}
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--stable-t3)' }}>
              {new Date(entry.createdAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
