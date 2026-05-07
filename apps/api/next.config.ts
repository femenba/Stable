import type { NextConfig } from 'next'

const config: NextConfig = {
  // Prevent webpack from bundling these server-only packages.
  // Stripe relies on Node.js native http/https modules; bundling it breaks
  // the connection layer and produces StripeConnectionError in production.
  serverExternalPackages: ['stripe'],
}

export default config
