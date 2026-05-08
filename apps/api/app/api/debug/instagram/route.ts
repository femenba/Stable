import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const IG_API_BASE = 'https://graph.facebook.com/v19.0'

export async function GET(req: NextRequest) {
  // Require the same admin debug token used by other debug routes
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (key !== process.env.DEBUG_KEY && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Pass ?key=YOUR_DEBUG_KEY' }, { status: 401 })
  }

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

  // Read-only call — just verifies the token and account are valid
  const res = await fetch(
    `${IG_API_BASE}/${accountId}?fields=id,name,username,followers_count,media_count&access_token=${token}`
  )
  const data = await res.json() as Record<string, unknown>

  if (data.error) {
    return NextResponse.json({ envStatus, metaError: data.error }, { status: 400 })
  }

  // Check publishing quota
  const quotaRes = await fetch(
    `${IG_API_BASE}/${accountId}/content_publishing_limit?fields=config,quota_usage&access_token=${token}`
  )
  const quotaData = await quotaRes.json() as { data?: Array<{ quota_usage: number; config: { quota_total: number } }> }

  return NextResponse.json({
    envStatus,
    account: {
      id: data.id,
      name: data.name,
      username: data.username,
      followers: data.followers_count,
      totalPosts: data.media_count,
    },
    publishingQuota: quotaData.data?.[0] ?? null,
  })
}
