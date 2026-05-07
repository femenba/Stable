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
  priceId,
  trialDays,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId?: string
  priceId: string
  trialDays?: number
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    ...(customerId ? { customer: customerId } : {}),
    line_items: [{ price: priceId, quantity: 1 }],
    ...(trialDays ? { subscription_data: { trial_period_days: trialDays } } : {}),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata ?? {},
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

export async function getOrCreateStripeCustomer({
  clerkId,
  email,
  name,
}: {
  clerkId: string
  email: string
  name?: string | null
}): Promise<string> {
  const stripe = getStripe()
  const existing = await stripe.customers.search({
    query: `metadata['clerkId']:'${clerkId}'`,
    limit: 1,
  })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { clerkId },
  })
  return customer.id
}
