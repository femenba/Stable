import { NextRequest, NextResponse } from 'next/server'
import { createDbClient } from '@stable/db'

export const runtime = 'nodejs'

// Keeps the Supabase project from auto-pausing (free tier pauses after ~7 days
// of inactivity). A scheduled Vercel cron hits this daily; the lightweight
// query counts as database activity. See vercel.json `crons`.

function log(msg: string, data?: Record<string, unknown>) {
  const suffix = data ? ` ${JSON.stringify(data)}` : ''
  console.log(`[keepalive-cron] ${msg}${suffix}`)
}

export async function GET(req: NextRequest) {
  // Vercel sends Authorization: Bearer ${CRON_SECRET} for cron routes. Enforce
  // it when the secret is configured; stay open (harmless ping) if it isn't.
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env not configured' }, { status: 500 })
  }

  const db = createDbClient(url, key)
  // Minimal read — enough to register activity and keep the project awake.
  const { error } = await db.from('subscriptions').select('id').limit(1)

  if (error) {
    console.error(`[keepalive-cron] DB ping failed: ${error.message}`)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  log('DB ping ok')
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
