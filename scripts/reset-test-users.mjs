/**
 * Resets test users to a clean free state so they can re-test Stripe checkout.
 *
 * Uses native fetch only — no npm packages needed.
 *
 * Usage (Node 20+):
 *   node --env-file=apps/api/.env.local scripts/reset-test-users.mjs
 *
 * Add extra emails via CLI args:
 *   node --env-file=apps/api/.env.local scripts/reset-test-users.mjs other@test.com
 */

const TARGET_EMAILS = [
  'vanessazuin@outlook.com',
  'femenba@me.com',
  ...process.argv.slice(2).filter(a => a.includes('@')),
]

const SUPABASE_URL   = process.env.SUPABASE_URL
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY
const REDIS_URL      = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN    = process.env.UPSTASH_REDIS_REST_TOKEN

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const REST  = `${SUPABASE_URL}/rest/v1`
const HEADS = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
  'Prefer':        'return=representation',
}

// ── Supabase helpers (PostgREST) ──────────────────────────────────────────────

async function sbGet(path) {
  const res = await fetch(`${REST}${path}`, { headers: HEADS })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`)
  return res.json()
}

async function sbDelete(path) {
  const res = await fetch(`${REST}${path}`, { method: 'DELETE', headers: HEADS })
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status} ${await res.text()}`)
}

// ── Redis helper (Upstash REST API) ──────────────────────────────────────────

async function redisDel(key) {
  if (!REDIS_URL || !REDIS_TOKEN) return false
  const res = await fetch(`${REDIS_URL}/del/${encodeURIComponent(key)}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  })
  return res.ok
}

// ── Main ──────────────────────────────────────────────────────────────────────

function log(email, msg) { console.log(`[${email}] ${msg}`) }

console.log(`\nResetting ${TARGET_EMAILS.length} user(s): ${TARGET_EMAILS.join(', ')}\n`)

for (const email of TARGET_EMAILS) {
  // 1. Find user by email
  let users
  try {
    users = await sbGet(`/users?email=eq.${encodeURIComponent(email)}&select=id,clerk_id,email`)
  } catch (err) {
    log(email, `ERROR querying users: ${err.message}`)
    continue
  }

  if (!users.length) {
    log(email, 'NOT FOUND in Supabase — already clean or email differs')
    continue
  }

  const user = users[0]
  log(email, `Found → id=${user.id}  clerk_id=${user.clerk_id}`)

  // 2. Check existing subscription
  let subs
  try {
    subs = await sbGet(`/subscriptions?user_id=eq.${user.id}&select=plan,status,stripe_customer_id,stripe_subscription_id`)
  } catch (err) {
    log(email, `ERROR querying subscriptions: ${err.message}`)
    continue
  }

  if (!subs.length) {
    log(email, 'No subscription row — already clean')
  } else {
    const s = subs[0]
    log(email, `Current: plan=${s.plan} status=${s.status} customer=${s.stripe_customer_id ?? 'none'}`)

    try {
      await sbDelete(`/subscriptions?user_id=eq.${user.id}`)
      log(email, 'Subscription row deleted')
    } catch (err) {
      log(email, `ERROR deleting subscription: ${err.message}`)
      continue
    }
  }

  // 3. Clear Redis caches
  if (REDIS_URL && REDIS_TOKEN) {
    const planKey   = `plan:user:${user.id}`
    const userIdKey = `user:clerk:${user.clerk_id}`
    const [p, u] = await Promise.all([redisDel(planKey), redisDel(userIdKey)])
    log(email, `Redis plan cache   cleared: ${planKey} (${p ? 'ok' : 'miss'})`)
    log(email, `Redis userId cache cleared: ${userIdKey} (${u ? 'ok' : 'miss'})`)
  } else {
    log(email, 'UPSTASH env not set — skipping Redis clear (TTL expires in ≤1 hour)')
  }

  log(email, '✓ Reset complete — free plan, no Stripe data, caches cleared\n')
}

console.log('Done.')
