import { Resend } from 'resend'
import {
  trialStartedHtml,
  trialEndingHtml,
  paymentSucceededHtml,
  paymentFailedHtml,
  cancellationHtml,
} from '@/emails/templates'

const FROM = 'Stable <admin@stableadhd.com>'

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping: ${subject}`)
    return
  }
  if (!to || to === 'unknown@stableadhd.com') {
    console.warn(`[email] Skipping email to placeholder address: ${subject}`)
    return
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) {
    console.error(`[email] Send failed: ${subject} → ${to}`, error)
  } else {
    console.log(`[email] Sent: ${subject} → ${to}`)
  }
}

export async function sendTrialStarted(to: string, trialEndsAt: Date): Promise<void> {
  await send(to, 'Your Stable Pro trial has started', trialStartedHtml(trialEndsAt))
}

export async function sendTrialEnding(to: string, trialEndsAt: Date): Promise<void> {
  await send(to, 'Your Stable Pro trial ends soon', trialEndingHtml(trialEndsAt))
}

export async function sendPaymentSucceeded(to: string): Promise<void> {
  await send(to, "You're now on Stable Pro", paymentSucceededHtml())
}

export async function sendPaymentFailed(to: string): Promise<void> {
  await send(to, 'Action needed — your Stable Pro payment failed', paymentFailedHtml())
}

export async function sendCancellation(to: string, accessEndsAt: Date): Promise<void> {
  await send(to, 'Your Stable Pro subscription has been cancelled', cancellationHtml(accessEndsAt))
}
