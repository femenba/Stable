import { NextRequest, NextResponse } from 'next/server'
import { getAuth, clerkClient } from '@clerk/nextjs/server'
import { ADMIN_EMAIL } from '@/lib/user-roles'
import { publishInstagramPost } from '@/lib/instagram'
import { generateCaption } from '@/lib/caption-generator'

export const runtime = 'nodejs'

const IG_API_BASE = 'https://graph.facebook.com/v19.0'

async function resolveEmail(userId: string, claims: Record<string, unknown>): Promise<string> {
  const fromClaims =
    (claims.email as string | undefined) ??
    (claims.emailAddress as string | undefined) ?? ''
  if (fromClaims) return fromClaims

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return (
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ?? ''
  )
}

export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth.userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const email = await resolveEmail(auth.userId, (auth.sessionClaims ?? {}) as Record<string, unknown>)
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const shouldPublish = searchParams.get('publish') === 'true'

  const accountId = process.env.META_IG_ACCOUNT_ID
  const token = process.env.META_PAGE_ACCESS_TOKEN

  const envStatus = {
    META_IG_ACCOUNT_ID: !!accountId,
    META_PAGE_ACCESS_TOKEN: !!token,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    IG_IMAGE_URLS: !!process.env.IG_IMAGE_URLS,
    CRON_SECRET: !!process.env.CRON_SECRET,
  }

  if (!accountId || !token) {
    return NextResponse.json({ envStatus, error: 'META vars not set' }, { status: 500 })
  }

  // Step 1: Verify token and account info
  const accountRes = await fetch(
    `${IG_API_BASE}/${accountId}?fields=id,name,username,followers_count,media_count&access_token=${token}`
  )
  const accountData = await accountRes.json() as Record<string, unknown>

  if (accountData.error) {
    return NextResponse.json({ envStatus, metaError: accountData.error }, { status: 400 })
  }

  // Step 2: Check publishing quota
  const quotaRes = await fetch(
    `${IG_API_BASE}/${accountId}/content_publishing_limit?fields=config,quota_usage&access_token=${token}`
  )
  const quotaData = await quotaRes.json() as {
    data?: Array<{ quota_usage: number; config: { quota_total: number } }>
  }

  const result: Record<string, unknown> = {
    envStatus,
    account: {
      id: accountData.id,
      name: accountData.name,
      username: accountData.username,
      followers: accountData.followers_count,
      totalPosts: accountData.media_count,
    },
    publishingQuota: quotaData.data?.[0] ?? null,
  }

  if (!shouldPublish) {
    result.note = 'Token verified. Add ?publish=true to send a real test post.'
    return NextResponse.json(result)
  }

  // Step 3: Full publish test — generates caption + posts to @stableadhd
  try {
    const caption = await generateCaption()
    const imageUrls = (process.env.IG_IMAGE_URLS ?? '').split(',').map(u => u.trim()).filter(Boolean)
    if (imageUrls.length === 0) {
      return NextResponse.json({ ...result, publishError: 'IG_IMAGE_URLS not set' }, { status: 500 })
    }
    const postId = await publishInstagramPost({ imageUrl: imageUrls[0], caption })
    result.publish = { ok: true, postId, captionPreview: caption.slice(0, 120) + '…' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    result.publish = { ok: false, error: message }
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result)
}
