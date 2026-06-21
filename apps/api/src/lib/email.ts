import { Resend } from 'resend'
import type { DbClient } from '@stable/db'
import {
  welcomeTrialHtml,
  welcomeProHtml,
  trialEndingHtml,
  paymentSucceededHtml,
  paymentFailedHtml,
  cancellationHtml,
} from '@/emails/templates'

const FROM        = 'Stable <hello@stableadhd.com>'
const PLACEHOLDER = 'unknown@stableadhd.com'

let _resend: Resend | null = null

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('[email] RESEND_API_KEY is not set — all emails will be skipped')
    return null
  }
  if (!_resend) {
    console.log(`[email] Initialising Resend client (key prefix: ${key.slice(0, 8)}…)`)
    _resend = new Resend(key)
  }
  return _resend
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendOpts {
  db?: DbClient
  userId?: string | null
  /** Stripe event ID — used for idempotency; prevents duplicate sends on webhook retries. */
  stripeEventId?: string
  /** Logical email type key stored in email_logs (e.g. 'welcome_trial'). */
  emailType: string
}

// ── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Atomically claim the (stripeEventId, emailType) slot BEFORE sending.
 *
 * The unique index `email_logs_stripe_dedup_idx` makes the insert the single
 * source of truth: the first delivery wins the row, any concurrent/duplicate
 * delivery (Stripe retries or multiple webhook endpoints) gets a unique
 * violation and is skipped. This is what the old read-then-send check could not
 * guarantee — it left a window where every overlapping delivery saw "not a
 * duplicate" and all sent.
 *
 * Returns the claimed row id on success, 'duplicate' if already claimed, or
 * null on an unexpected DB error (in which case we fail open and send anyway so
 * a transient DB issue never silently drops a lifecycle email).
 */
async function claimSend(
  db: DbClient,
  opts: { userId?: string | null; stripeEventId: string; emailType: string },
  recipient: string,
  subject: string,
): Promise<string | 'duplicate' | null> {
  const { data, error } = await db
    .from('email_logs')
    .insert({
      user_id:         opts.userId ?? null,
      stripe_event_id: opts.stripeEventId,
      email_type:      opts.emailType,
      recipient,
      subject,
      status:          'pending',
    })
    .select('id')
    .single()

  if (error) {
    // 23505 = unique_violation → another delivery already claimed this slot.
    if (error.code === '23505') return 'duplicate'
    // Anything else (table/column/constraint mismatch, e.g. migration not yet
    // applied): log and fall through to an un-deduped send rather than lose it.
    console.error(`[email] Claim insert failed (${error.code ?? '?'}) — sending without dedup: ${error.message}`)
    return null
  }
  return (data?.id as string) ?? null
}

// ── Logging ───────────────────────────────────────────────────────────────────

async function logEmail(opts: {
  db: DbClient
  userId?: string | null
  stripeEventId?: string
  emailType: string
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'skipped'
  error?: string
  resendId?: string
}): Promise<void> {
  try {
    await opts.db.from('email_logs').insert({
      user_id:        opts.userId  ?? null,
      stripe_event_id: opts.stripeEventId ?? null,
      email_type:     opts.emailType,
      recipient:      opts.recipient,
      subject:        opts.subject,
      status:         opts.status,
      error:          opts.error   ?? null,
      resend_id:      opts.resendId ?? null,
    })
  } catch (err) {
    // Logging must never break delivery
    console.error('[email] Failed to write to email_logs:', err)
  }
}

// ── Core send ─────────────────────────────────────────────────────────────────

async function send(
  to: string,
  subject: string,
  html: string,
  opts: SendOpts,
): Promise<void> {
  const tag = `[email][${opts.emailType}]`
  console.log(`${tag} Attempting send → ${to} | subject: "${subject}"`)

  const resend = getResend()

  if (!resend) {
    console.error(`${tag} Aborting — RESEND_API_KEY not set`)
    return
  }
  if (!to || to === PLACEHOLDER) {
    console.warn(`${tag} Aborting — placeholder or empty recipient`)
    return
  }

  // Atomic dedup — claim the slot BEFORE sending so duplicate/concurrent Stripe
  // deliveries of the same event can never each send an email.
  let claimedRowId: string | null = null
  if (opts.stripeEventId && opts.db) {
    const claim = await claimSend(
      opts.db,
      { userId: opts.userId, stripeEventId: opts.stripeEventId, emailType: opts.emailType },
      to,
      subject,
    )
    if (claim === 'duplicate') {
      console.log(`${tag} Duplicate suppressed for event ${opts.stripeEventId}`)
      return
    }
    claimedRowId = claim // row id, or null if claim errored (fail-open path)
  }

  // Send with one retry on transient failure
  let resendId:   string | undefined
  let sendError:  string | undefined

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
      if (error) {
        sendError = error.message
        if (attempt === 0) await new Promise(r => setTimeout(r, 600))
      } else {
        resendId  = data?.id
        sendError = undefined
        break
      }
    } catch (err) {
      sendError = err instanceof Error ? err.message : String(err)
      if (attempt === 0) await new Promise(r => setTimeout(r, 600))
    }
  }

  if (sendError) {
    console.error(`${tag} Failed → ${to}: ${sendError}`)
  } else {
    console.log(`${tag} Sent → ${to} [id=${resendId}]`)
  }

  const finalStatus = sendError ? 'failed' : 'sent'

  if (claimedRowId) {
    // Finalize the row we already claimed for dedup.
    try {
      await opts.db!.from('email_logs')
        .update({ status: finalStatus, error: sendError ?? null, resend_id: resendId ?? null })
        .eq('id', claimedRowId)
    } catch (err) {
      console.error('[email] Failed to finalize email_logs row:', err)
    }
  } else if (opts.db) {
    // No claim (non-Stripe email, or claim errored and we failed open) — log fresh.
    await logEmail({
      db:             opts.db,
      userId:         opts.userId,
      stripeEventId:  opts.stripeEventId,
      emailType:      opts.emailType,
      recipient:      to,
      subject,
      status:         finalStatus,
      error:          sendError,
      resendId,
    })
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendWelcomeTrial(
  to: string,
  trialEndsAt: Date,
  opts: SendOpts,
): Promise<void> {
  await send(to, 'Welcome to Stable Pro — your free trial has started', welcomeTrialHtml(trialEndsAt), opts)
}

export async function sendWelcomePro(to: string, opts: SendOpts): Promise<void> {
  await send(to, 'Welcome to Stable Pro', welcomeProHtml(), opts)
}

export async function sendTrialEnding(
  to: string,
  trialEndsAt: Date,
  opts: SendOpts,
): Promise<void> {
  await send(to, 'Your Stable Pro trial ends tomorrow', trialEndingHtml(trialEndsAt), opts)
}

export async function sendPaymentSucceeded(to: string, opts: SendOpts): Promise<void> {
  await send(to, "Payment confirmed — you're on Stable Pro", paymentSucceededHtml(), opts)
}

export async function sendPaymentFailed(to: string, opts: SendOpts): Promise<void> {
  await send(to, 'Action needed — your Stable Pro payment failed', paymentFailedHtml(), opts)
}

export async function sendCancellation(
  to: string,
  accessEndsAt: Date,
  opts: SendOpts,
): Promise<void> {
  await send(to, 'Your Stable Pro subscription has been cancelled', cancellationHtml(accessEndsAt), opts)
}
