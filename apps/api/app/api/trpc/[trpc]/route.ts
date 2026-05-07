import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/router'
import { createContext } from '@/context'
import type { NextRequest } from 'next/server'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }) => createContext({ req: req as NextRequest }),
  })

export { handler as GET, handler as POST }
