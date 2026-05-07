import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/router'
import { createContext } from '@/context'
import type { NextRequest } from 'next/server'

// Stripe uses Node.js native http/https — must run in Node.js, not Edge.
export const runtime = 'nodejs'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }) => createContext({ req: req as NextRequest }),
  })

export { handler as GET, handler as POST }
