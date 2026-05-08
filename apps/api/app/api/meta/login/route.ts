import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const APP_ID = '26547534768250822'
const REDIRECT_URI = 'https://www.stableadhd.com/api/meta/callback'
const SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
].join(',')

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const oauthUrl = new URL('https://www.facebook.com/v25.0/dialog/oauth')
  oauthUrl.searchParams.set('client_id', APP_ID)
  oauthUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  oauthUrl.searchParams.set('scope', SCOPES)
  oauthUrl.searchParams.set('response_type', 'code')

  // ?debug=true shows the URL instead of redirecting — for verification
  if (searchParams.get('debug') === 'true') {
    return NextResponse.json({
      oauthUrl: oauthUrl.toString(),
      params: {
        client_id: APP_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        response_type: 'code',
      },
    })
  }

  return NextResponse.redirect(oauthUrl.toString())
}
