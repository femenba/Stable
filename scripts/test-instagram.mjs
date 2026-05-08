/**
 * Manual smoke test for the Instagram cron flow.
 * Run from repo root: node --env-file=apps/api/.env.test scripts/test-instagram.mjs
 * Or:                 node --env-file=apps/api/.env.local scripts/test-instagram.mjs
 */

const IG_API_BASE = 'https://graph.facebook.com/v19.0'

// ── 1. Env check ──────────────────────────────────────────────────────────────

const required = ['META_IG_ACCOUNT_ID', 'META_PAGE_ACCESS_TOKEN', 'ANTHROPIC_API_KEY']
const missing = required.filter(k => !process.env[k])

console.log('\n=== stable. Instagram cron smoke test ===\n')
console.log('Env vars present:')
required.forEach(k => console.log(`  ${k}: ${process.env[k] ? '✓ set' : '✗ MISSING'}`))
console.log(`  IG_IMAGE_URLS: ${process.env.IG_IMAGE_URLS ? '✓ set' : '✗ not set (will skip publish)'}`)
console.log()

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`)
  console.error('Run: node --env-file=apps/api/.env.test scripts/test-instagram.mjs')
  process.exit(1)
}

const accountId = process.env.META_IG_ACCOUNT_ID
const token = process.env.META_PAGE_ACCESS_TOKEN

// ── 2. Verify Meta token & account ───────────────────────────────────────────

console.log('Step 1: Verifying Meta token and account...')
const accountRes = await fetch(
  `${IG_API_BASE}/${accountId}?fields=id,name,username,followers_count&access_token=${token}`
)
const accountData = await accountRes.json()

if (accountData.error) {
  console.error('✗ Meta API error:')
  console.error(JSON.stringify(accountData.error, null, 2))
  process.exit(1)
}
console.log(`✓ Connected to Instagram account:`)
console.log(`  ID:        ${accountData.id}`)
console.log(`  Name:      ${accountData.name}`)
console.log(`  Username:  @${accountData.username}`)
console.log(`  Followers: ${accountData.followers_count ?? 'n/a'}`)
console.log()

// ── 3. Check publishing quota ─────────────────────────────────────────────────

console.log('Step 2: Checking content publishing limit...')
const quotaRes = await fetch(
  `${IG_API_BASE}/${accountId}/content_publishing_limit?fields=config,quota_usage&access_token=${token}`
)
const quotaData = await quotaRes.json()

if (quotaData.error) {
  console.warn('⚠ Could not check quota:', quotaData.error.message)
} else {
  const usage = quotaData.data?.[0]
  console.log(`✓ Quota: ${usage?.quota_usage ?? '?'} / ${usage?.config?.quota_total ?? 50} posts used this 24h window`)
}
console.log()

// ── 4. Generate caption ───────────────────────────────────────────────────────

console.log('Step 3: Generating caption via Claude Haiku...')
const captionRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: 'Write a short Instagram caption for @stableadhd (ADHD productivity app). 2 paragraphs. Pillar: emotional validation. End with 5 hashtags. TEST POST — keep it brief.',
    }],
  }),
})

const captionData = await captionRes.json()
if (captionData.error) {
  console.error('✗ Anthropic API error:', captionData.error)
  process.exit(1)
}
const caption = captionData.content[0].text
console.log('✓ Caption generated:')
console.log('─'.repeat(50))
console.log(caption)
console.log('─'.repeat(50))
console.log()

// ── 5. Test media container (no image URL = skip publish) ─────────────────────

const imageUrl = process.env.IG_IMAGE_URLS?.split(',')[0]?.trim()

if (!imageUrl) {
  console.log('Step 4: Skipping publish test — IG_IMAGE_URLS not set in Vercel yet.')
  console.log()
  console.log('✓ All other checks passed. Once you add IG_IMAGE_URLS to Vercel env,')
  console.log('  the cron will be fully operational.')
  process.exit(0)
}

console.log(`Step 4: Creating media container with image: ${imageUrl.slice(0, 60)}...`)
const containerRes = await fetch(`${IG_API_BASE}/${accountId}/media`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
})
const containerData = await containerRes.json()

if (containerData.error) {
  console.error('✗ Media container creation failed:')
  console.error(JSON.stringify(containerData.error, null, 2))
  console.log()
  console.log('Common causes:')
  console.log('  - Image URL is not publicly accessible (must be a direct image link, no redirects)')
  console.log('  - Image URL returns non-200 status or wrong content-type')
  console.log('  - Token missing instagram_content_publish permission')
  process.exit(1)
}

console.log(`✓ Media container created: ${containerData.id}`)
console.log()

// Wait for Meta to process the image
console.log('Waiting 3s for Meta to process the image...')
await new Promise(r => setTimeout(r, 3000))

// ── 6. Publish ────────────────────────────────────────────────────────────────

console.log('Step 5: Publishing post...')
const publishRes = await fetch(`${IG_API_BASE}/${accountId}/media_publish`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ creation_id: containerData.id, access_token: token }),
})
const publishData = await publishRes.json()

if (publishData.error) {
  console.error('✗ Publish failed:')
  console.error(JSON.stringify(publishData.error, null, 2))
  process.exit(1)
}

console.log(`✓ Post published successfully!`)
console.log(`  Post ID: ${publishData.id}`)
console.log()
console.log('=== Test complete — Instagram cron is fully operational ===')
