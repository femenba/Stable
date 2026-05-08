import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const APP_ID = '26547534768250822'
const REDIRECT_URI = 'https://stableadhd.com/api/meta/callback'
const SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
].join(',')

export async function GET() {
  const url = new URL('https://www.facebook.com/v25.0/dialog/oauth')
  url.searchParams.set('client_id', APP_ID)
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set('scope', SCOPES)
  url.searchParams.set('response_type', 'code')

  return NextResponse.redirect(url.toString())
}
