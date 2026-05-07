import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  // Use Stripe's fetch-based HTTP client so this works in any Next.js
  // runtime (Edge or Node.js) without relying on native http/https modules.
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
  })
  return _stripe
}

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    trialDays: 7,
    amount: 499, // £4.99 in pence
    currency: 'gbp',
  },
} as const

export type StripePlan = keyof typeof STRIPE_PLANS

export async function createCheckoutSession({
  customerId,
  customerEmail,
  priceId,
  trialDays,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId?: string
  customerEmail?: string
  priceId: string
  trialDays?: number
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  if (!priceId) throw new Error('STRIPE_PRO_MONTHLY_PRICE_ID is not set')

  const stripe = getStripe()

  // Omitting payment_method_types lets Stripe auto-enable Apple Pay, Google Pay,
  // Link, and card based on the user's browser and customer country.
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(customerId
      ? { customer: customerId }
      : customerEmail
        ? { customer_email: customerEmail }
        : {}),
    line_items: [{ price: priceId, quantity: 1 }],
    ...(trialDays
      ? {
          subscription_data: {
            trial_period_days: trialDays,
            trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
          },
          payment_method_collection: 'if_required',
        }
      : {}),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata ?? {},
    locale: 'en',
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe()
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// Verifies a Stripe customer ID is real and not deleted.
// Returns the verified customer or null if it doesn't exist.
async function verifyCustomer(
  customerId: string,
  stripe: Stripe,
): Promise<Stripe.Customer | null> {
  try {
    const c = await stripe.customers.retrieve(customerId)
    return c.deleted ? null : (c as Stripe.Customer)
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError) return null
    throw err
  }
}

// Resolves a valid Stripe customer for checkout or portal, healing stale/deleted IDs.
// Three-layer strategy:
//   1. Verify existingCustomerId if provided (fast path, one retrieve call)
//   2. Search Stripe by clerkId metadata, verify each result
//   3. Create a brand-new customer as last resort
export async function resolveStripeCustomer({
  existingCustomerId,
  clerkId,
  email,
  name,
}: {
  existingCustomerId?: string | null
  clerkId: string
  email: string
  name?: string | null
}): Promise<string> {
  const stripe = getStripe()

  // Layer 1: verify the ID we already have (most common path)
  if (existingCustomerId) {
    const verified = await verifyCustomer(existingCustomerId, stripe)
    if (verified) {
      console.log(`[stripe] Verified existing customer ${existingCustomerId}`)
      if (email && verified.email === 'unknown@stableadhd.com') {
        await stripe.customers.update(existingCustomerId, { email, name: name ?? undefined })
      }
      return existingCustomerId
    }
    console.warn(`[stripe] Customer ${existingCustomerId} is missing/deleted — searching for replacement`)
  }

  // Layer 2: search Stripe by clerkId — search index can be stale, so verify each result
  const search = await stripe.customers.search({
    query: `metadata['clerkId']:'${clerkId}'`,
    limit: 5,
  })

  for (const c of search.data) {
    const verified = await verifyCustomer(c.id, stripe)
    if (!verified) {
      console.warn(`[stripe] Search result ${c.id} is missing/deleted — skipping`)
      continue
    }
    console.log(`[stripe] Found valid customer ${c.id} via search for clerkId=${clerkId}`)
    if (email && verified.email === 'unknown@stableadhd.com') {
      await stripe.customers.update(c.id, { email, name: name ?? undefined })
    }
    return c.id
  }

  // Layer 3: create a fresh customer
  console.log(`[stripe] Creating new customer for clerkId=${clerkId}`)
  const fresh = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { clerkId },
  })
  return fresh.id
}
