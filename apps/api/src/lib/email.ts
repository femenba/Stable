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

async function isDuplicate(
  stripeEventId: string,
  emailType: string,
  db: DbClient,
): Promise<boolean> {
  try {
    const { data } = await db
      .from('email_logs')
      .select('id')
      .eq('stripe_event_id', stripeEventId)
      .eq('email_type', emailType)
      .limit(1)
    return (data?.length ?? 0) > 0
  } catch {
    return false // table may not exist yet — allow send
  }
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

  // Deduplication — skip if this Stripe event already sent this email type
  if (opts.stripeEventId && opts.db) {
    const dup = await isDuplicate(opts.stripeEventId, opts.emailType, opts.db)
    if (dup) {
      console.log(`${tag} Duplicate suppressed for event ${opts.stripeEventId}`)
      return
    }
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

  if (opts.db) {
    await logEmail({
      db:             opts.db,
      userId:         opts.userId,
      stripeEventId:  opts.stripeEventId,
      emailType:      opts.emailType,
      recipient:      to,
      subject,
      status:         sendError ? 'failed' : 'sent',
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
