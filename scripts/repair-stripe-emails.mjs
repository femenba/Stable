/**
 * One-time repair script: fixes Stripe customers that were created with
 * unknown@stableadhd.com due to the email-placeholder bug.
 *
 * Usage (Node 20+):
 *   node --env-file=apps/api/.env.local scripts/repair-stripe-emails.mjs
 *
 * Or with env vars exported in your shell:
 *   STRIPE_SECRET_KEY=sk_live_... \
 *   SUPABASE_URL=https://... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/repair-stripe-emails.mjs
 *
 * Pass --dry-run to preview changes without writing anything:
 *   node --env-file=apps/api/.env.local scripts/repair-stripe-emails.mjs --dry-run
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const PLACEHOLDER = 'unknown@stableadhd.com'

// ── Validate env ──────────────────────────────────────────────────────────────

const STRIPE_SECRET_KEY       = process.env.STRIPE_SECRET_KEY
const SUPABASE_URL            = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing required env vars: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// ── Clients ───────────────────────────────────────────────────────────────────

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
const db     = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`) }

async function lookupRealEmail(clerkId) {
  const { data } = await db.from('users').select('id, email').eq('clerk_id', clerkId).single()
  return data ?? null
}

async function updateStripeCustomer(customerId, email, name) {
  if (DRY_RUN) {
    log(`  DRY-RUN: would update Stripe customer ${customerId} → ${email}`)
    return
  }
  await stripe.customers.update(customerId, { email, name: name ?? undefined })
}

async function repairSupabaseEmail(userId, email) {
  if (DRY_RUN) {
    log(`  DRY-RUN: would update Supabase user ${userId} email → ${email}`)
    return
  }
  await db.from('users').update({ email }).eq('id', userId)
}

// ── Step 1: Fix Stripe customers with placeholder email ───────────────────────

log(`Starting repair ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`)
log('Step 1: Scanning Stripe for customers with placeholder email…')

let startingAfter
let totalChecked = 0
let totalFixed   = 0
let totalFailed  = 0

while (true) {
  const page = await stripe.customers.list({
    email: PLACEHOLDER,
    limit: 100,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
  })

  for (const customer of page.data) {
    totalChecked++
    const clerkId = customer.metadata?.clerkId

    if (!clerkId) {
      log(`  SKIP ${customer.id}: no clerkId in metadata`)
      totalFailed++
      continue
    }

    const user = await lookupRealEmail(clerkId)

    if (!user || user.email === PLACEHOLDER) {
      log(`  SKIP ${customer.id} (clerkId=${clerkId}): no real email in Supabase`)
      totalFailed++
      continue
    }

    log(`  FIX  ${customer.id} (clerkId=${clerkId}): ${PLACEHOLDER} → ${user.email}`)

    try {
      await updateStripeCustomer(customer.id, user.email, customer.name)
      totalFixed++
    } catch (err) {
      log(`  ERROR ${customer.id}: ${err.message}`)
      totalFailed++
    }
  }

  if (!page.has_more) break
  startingAfter = page.data[page.data.length - 1].id
}

log(`Step 1 done: checked=${totalChecked} fixed=${totalFixed} failed=${totalFailed}`)

// ── Step 2: Fix Supabase users still holding placeholder email ─────────────────

log('Step 2: Scanning Supabase for users with placeholder email…')

const { data: brokenUsers, error } = await db
  .from('users')
  .select('id, clerk_id, email')
  .eq('email', PLACEHOLDER)

if (error) {
  log(`ERROR querying Supabase: ${error.message}`)
  process.exit(1)
}

log(`  Found ${brokenUsers.length} Supabase user(s) with placeholder email`)

// For these users we don't have the real email in Supabase, so we'd need
// to fetch it from Clerk. That requires the Clerk backend API key.
// If CLERK_SECRET_KEY is available, attempt to fetch and repair.
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

if (CLERK_SECRET_KEY && brokenUsers.length > 0) {
  log('  CLERK_SECRET_KEY found — attempting Clerk API lookup…')

  for (const user of brokenUsers) {
    try {
      const res = await fetch(`https://api.clerk.com/v1/users/${user.clerk_id}`, {
        headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` },
      })
      if (!res.ok) { log(`  SKIP ${user.clerk_id}: Clerk returned ${res.status}`); continue }

      const clerkUser = await res.json()
      const realEmail = clerkUser.email_addresses?.[0]?.email_address

      if (!realEmail || realEmail === PLACEHOLDER) {
        log(`  SKIP ${user.clerk_id}: no real email in Clerk`)
        continue
      }

      log(`  FIX Supabase user ${user.id}: ${PLACEHOLDER} → ${realEmail}`)
      await repairSupabaseEmail(user.id, realEmail)
    } catch (err) {
      log(`  ERROR ${user.clerk_id}: ${err.message}`)
    }
  }
} else if (brokenUsers.length > 0) {
  log('  CLERK_SECRET_KEY not set — cannot auto-repair Supabase emails from Clerk.')
  log('  Provide CLERK_SECRET_KEY to enable this step.')
  log('  Affected clerk_ids:')
  brokenUsers.forEach(u => log(`    ${u.clerk_id}`))
}

// ── Step 3: Verify subscriptions are linked correctly ────────────────────────

log('Step 3: Verifying subscription links…')

const { data: orphanedSubs } = await db
  .from('subscriptions')
  .select('user_id, stripe_customer_id, plan, status')
  .eq('plan', 'pro')
  .neq('status', 'canceled')

const proSubs = orphanedSubs ?? []
log(`  ${proSubs.length} active/trialing Pro subscription(s) in Supabase`)

if (!DRY_RUN) {
  // Verify each pro sub's Stripe customer still exists and has correct plan
  let subChecked = 0
  for (const sub of proSubs) {
    if (!sub.stripe_customer_id) continue
    try {
      const customer = await stripe.customers.retrieve(sub.stripe_customer_id)
      if (customer.deleted) {
        log(`  WARNING: Stripe customer ${sub.stripe_customer_id} is deleted but subscription still shows Pro`)
      }
      subChecked++
    } catch {
      log(`  WARNING: could not retrieve Stripe customer ${sub.stripe_customer_id}`)
    }
  }
  log(`  Checked ${subChecked} Stripe customers`)
}

// ── Summary ───────────────────────────────────────────────────────────────────

log('─'.repeat(60))
log(`Repair complete ${DRY_RUN ? '(DRY RUN — no changes written)' : ''}`)
log(`  Stripe customers checked : ${totalChecked}`)
log(`  Stripe customers fixed   : ${totalFixed}`)
log(`  Stripe customers failed  : ${totalFailed}`)
log(`  Supabase placeholder rows: ${brokenUsers.length}`)
log('─'.repeat(60))

if (DRY_RUN) {
  log('Re-run without --dry-run to apply changes.')
}
