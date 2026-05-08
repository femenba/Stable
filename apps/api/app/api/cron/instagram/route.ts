import { NextRequest, NextResponse } from 'next/server'
import { publishInstagramPost } from '@/lib/instagram'
import { generateCaption } from '@/lib/caption-generator'

export const runtime = 'nodejs'
export const maxDuration = 60

function pickImageUrl(): string {
  // Set IG_IMAGE_URLS in Vercel env as comma-separated public image URLs
  const urls = (process.env.IG_IMAGE_URLS ?? '')
    .split(',')
    .map(u => u.trim())
    .filter(Boolean)

  if (urls.length === 0) {
    throw new Error('IG_IMAGE_URLS env var is not set — add comma-separated public image URLs')
  }

  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  const isAfternoon = now.getUTCHours() >= 12 ? 1 : 0
  return urls[(dayOfYear * 2 + isAfternoon) % urls.length]
}

function log(msg: string, data?: Record<string, unknown>) {
  const suffix = data ? ` ${JSON.stringify(data)}` : ''
  console.log(`[instagram-cron] ${msg}${suffix}`)
}

export async function GET(req: NextRequest) {
  // Vercel automatically sends CRON_SECRET as a Bearer token for cron routes
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    log('Generating caption...')
    const caption = await generateCaption()

    const imageUrl = pickImageUrl()
    log('Publishing post', { imageUrl: imageUrl.slice(0, 60) + '...' })

    const postId = await publishInstagramPost({ imageUrl, caption })

    log('Published successfully', { postId })
    return NextResponse.json({ success: true, postId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[instagram-cron] Failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
