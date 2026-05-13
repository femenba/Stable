import { NextRequest, NextResponse } from 'next/server'
import { createDbClient } from '@stable/db'
import { z } from 'zod'

const schema = z.object({
  message:          z.string().min(10).max(1000),
  firstName:        z.string().max(80).optional(),
  email:            z.string().email().optional().or(z.literal('')),
  consentToPublish: z.boolean(),
})

function getDb() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createDbClient(url, key)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { message, firstName, email, consentToPublish } = parsed.data

  const db = getDb()
  const { error } = await db.from('feedback_submissions').insert({
    message,
    first_name:         firstName || null,
    email:              email || null,
    consent_to_publish: consentToPublish,
    status:             'pending',
  })

  if (error) {
    console.error('[feedback] DB insert failed', error)
    return NextResponse.json({ error: 'Could not save feedback' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
