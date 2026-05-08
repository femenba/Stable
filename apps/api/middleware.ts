import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/contact(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip static files and routes with their own auth (webhooks, cron, meta OAuth)
    '/((?!_next|api/webhooks|api/cron|api/meta|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api(?!/webhooks|/cron|/meta)|trpc)(.*)',
  ],
}
