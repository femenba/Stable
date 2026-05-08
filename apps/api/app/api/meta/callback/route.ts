import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const APP_ID = '26547534768250822'
const REDIRECT_URI = 'https://stableadhd.com/api/meta/callback'
const GQL = 'https://graph.facebook.com/v25.0'

// From apps/api/.vercel/project.json
const VERCEL_PROJECT_ID = 'prj_QJSv4HPMUpn0lxSv4vxzpF9DwReP'
const VERCEL_TEAM_ID = 'team_U4OiQ0rku6g1zM4zicxLk54m'

type MetaError = { message: string; type?: string; code?: number }
type PageEntry = { id: string; name: string; access_token: string }

function fail(step: string, detail: MetaError | string, status = 400) {
  return NextResponse.json({ step, error: detail }, { status })
}

// ── Vercel env var upsert ────────────────────────────────────────────────────

async function upsertVercelEnv(key: string, value: string, token: string): Promise<'created' | 'updated' | 'failed'> {
  const base = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`
  const qs = `?teamId=${VERCEL_TEAM_ID}`
  const body = { key, value, type: 'encrypted', target: ['production'] }

  // Try PATCH first (update existing), then POST (create new)
  const patch = await fetch(`${base}/${key}${qs}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (patch.ok) return 'updated'

  const post = await fetch(`${base}${qs}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return post.ok ? 'created' : 'failed'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const fbError = searchParams.get('error')
  if (fbError) {
    return fail('oauth_dialog', {
      message: searchParams.get('error_description') ?? fbError,
      type: searchParams.get('error_reason') ?? fbError,
    })
  }

  const code = searchParams.get('code')
  if (!code) return fail('oauth_dialog', 'No code — visit /api/meta/login first')

  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) return fail('config', 'META_APP_SECRET not set in Vercel', 500)

  // ── 1. Exchange code for short-lived user token ──────────────────────────
  const tokenRes = await fetch(
    `${GQL}/oauth/access_token` +
    `?client_id=${APP_ID}&client_secret=${appSecret}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${code}`
  )
  const tokenData = await tokenRes.json() as { access_token?: string; error?: MetaError }
  if (!tokenData.access_token) return fail('short_lived_token', tokenData.error ?? 'No token')

  // ── 2. Extend to long-lived user token (60 days) ─────────────────────────
  const longRes = await fetch(
    `${GQL}/oauth/access_token` +
    `?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${appSecret}` +
    `&fb_exchange_token=${tokenData.access_token}`
  )
  const longData = await longRes.json() as { access_token?: string; expires_in?: number; error?: MetaError }
  if (!longData.access_token) return fail('long_lived_token', longData.error ?? 'No long-lived token')
  const userToken = longData.access_token

  // ── 3. Get Facebook Pages ────────────────────────────────────────────────
  const pagesRes = await fetch(`${GQL}/me/accounts?access_token=${userToken}`)
  const pagesData = await pagesRes.json() as { data?: PageEntry[]; error?: MetaError }
  if (!pagesData.data?.length) return fail('get_pages', pagesData.error ?? 'No pages found — ensure the Facebook Page is connected')

  // ── 4. Find Instagram Business Account for each page ────────────────────
  const pages = await Promise.all(
    pagesData.data.map(async (page) => {
      const igRes = await fetch(
        `${GQL}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )
      const igData = await igRes.json() as { instagram_business_account?: { id: string }; error?: MetaError }
      return {
        pageName: page.name,
        pageId: page.id,
        pageAccessToken: page.access_token,
        instagramAccountId: igData.instagram_business_account?.id ?? null,
      }
    })
  )

  const connected = pages.filter(p => p.instagramAccountId !== null)
  if (!connected.length) {
    return NextResponse.json({
      error: 'No Instagram Business Account found on any page',
      pages,
      hint: 'Ensure @stableadhd is connected to your Facebook Page as an Instagram Business Account in Meta Business Suite.',
    }, { status: 400 })
  }

  // Use the first page with an Instagram account (should be exactly one)
  const target = connected[0]
  const envVars = {
    META_PAGE_ACCESS_TOKEN: target.pageAccessToken,
    META_IG_ACCOUNT_ID: target.instagramAccountId!,
  }

  // ── 5. Auto-save to Vercel if VERCEL_API_TOKEN is configured ─────────────
  const vercelToken = process.env.VERCEL_API_TOKEN
  let vercelSave: Record<string, string> | null = null

  if (vercelToken) {
    const [tokenStatus, accountStatus] = await Promise.all([
      upsertVercelEnv('META_PAGE_ACCESS_TOKEN', target.pageAccessToken, vercelToken),
      upsertVercelEnv('META_IG_ACCOUNT_ID', target.instagramAccountId!, vercelToken),
    ])
    vercelSave = { META_PAGE_ACCESS_TOKEN: tokenStatus, META_IG_ACCOUNT_ID: accountStatus }
  }

  return NextResponse.json({
    ok: true,
    // ── Paste these into Vercel env vars ──────────────────────────────────
    envVars,
    vercelAutoSave: vercelSave
      ? { status: vercelSave, note: 'Saved to Vercel production env — redeploy to activate' }
      : { status: 'skipped', note: 'Add VERCEL_API_TOKEN to Vercel env to enable auto-save' },
    tokenInfo: {
      expiresInSeconds: longData.expires_in,
      expiresInDays: longData.expires_in ? Math.floor(longData.expires_in / 86400) : null,
    },
    pages,
  })
}
