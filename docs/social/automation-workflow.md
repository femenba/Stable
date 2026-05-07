# @stableadhd — Social Media Automation Architecture

## Overview

Safe, professional automation using only official Meta tools and APIs.
No third-party bots. No scraping. No unofficial automation.

---

## Tier 1 — Manual (Now, Week 1–4)

Use **Meta Business Suite** exclusively for the first month.

### Setup Steps
1. Create a Meta Business account at business.facebook.com
2. Connect your Instagram account (@stableadhd)
3. Use **Creator Studio** or **Meta Business Suite** to:
   - Schedule feed posts up to 75 days in advance
   - Schedule Reels
   - Schedule Stories (limited — some must be posted natively)
   - View unified inbox (DMs + comments)
   - Pull analytics (reach, saves, profile visits, link clicks)

### Canva → Meta Pipeline (manual but fast)
1. Design in Canva (use your brand kit — save colors, fonts once)
2. Export as PNG (feed) or MP4 (reels)
3. Upload to Meta Business Suite
4. Write caption from template bank
5. Select hashtag set from saved bank
6. Schedule at optimal time

**Time cost:** ~45 minutes per week for 7 posts + stories if templates are ready.

---

## Tier 2 — Semi-Automated (Month 2+)

### Option A: Buffer or Later (Instagram-approved schedulers)

Both are official **Instagram API partners** — safe and compliant.

**Buffer:**
- Schedule feed posts, Reels, Stories
- First comment auto-posting (great for hashtags)
- Analytics dashboard
- Cost: ~£15/month for Essentials

**Later:**
- Visual grid planner (drag-and-drop preview)
- Best time to post suggestions
- Linkin.bio page (replaces one link)
- Cost: ~£16/month for Starter

**Recommended:** Later for the visual grid planner — critical for maintaining grid aesthetic.

### Setup for Either Tool
1. Sign up and connect Instagram Business account
2. Connect Facebook Page (required for Instagram API access)
3. Upload content library (images, videos)
4. Set up auto-hashtag first comment (Later supports this natively)
5. Schedule 2 weeks ahead every Sunday

---

## Tier 3 — API Automation (Month 3+, When Volume Demands It)

### Instagram Graph API — What It Can Do (Officially)

| Capability | Supported |
|------------|-----------|
| Post single images | ✅ |
| Post carousels | ✅ |
| Post Reels | ✅ |
| Post Stories | ✅ (Business accounts) |
| Schedule posts | ✅ (via publishing API) |
| Read comments | ✅ |
| Reply to comments | ✅ |
| Read DMs | ✅ (via Messaging API) |
| Send DMs | ✅ (within 24h window or with templates) |
| Read analytics | ✅ (Insights API) |

### Authentication Setup

```bash
# 1. Create a Meta App at developers.facebook.com
# App type: Business

# 2. Add Instagram Graph API product

# 3. Required permissions:
# - instagram_basic
# - instagram_content_publish
# - instagram_manage_comments
# - instagram_manage_insights
# - pages_read_engagement

# 4. Get a long-lived Page Access Token (valid 60 days, renewable)
# Store in environment variable — NEVER in code

# 5. Get your Instagram Business Account ID
curl "https://graph.facebook.com/v19.0/me/accounts?access_token=YOUR_TOKEN"
```

### Environment Variables (add to stable. API .env)
```bash
META_PAGE_ACCESS_TOKEN=your_long_lived_token_here
META_IG_ACCOUNT_ID=your_ig_business_account_id
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
```

### Publishing a Feed Post via API

```typescript
// apps/api/src/lib/instagram.ts

const IG_API_BASE = 'https://graph.facebook.com/v19.0'

export async function publishInstagramPost({
  imageUrl,   // must be a publicly accessible URL
  caption,
}: {
  imageUrl: string
  caption: string
}) {
  const accountId = process.env.META_IG_ACCOUNT_ID
  const token = process.env.META_PAGE_ACCESS_TOKEN

  // Step 1: Create media container
  const containerRes = await fetch(
    `${IG_API_BASE}/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    }
  )
  const { id: containerId } = await containerRes.json()

  // Step 2: Publish the container
  const publishRes = await fetch(
    `${IG_API_BASE}/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: token,
      }),
    }
  )

  return publishRes.json()
}
```

### Scheduling Posts (via n8n or cron)

**Option A: n8n (self-hosted, recommended)**
- Visual workflow builder
- Trigger: Schedule node (cron)
- Action: HTTP Request node → Instagram Graph API
- Store content queue in a Google Sheet or Notion DB
- n8n reads the queue, publishes at scheduled time
- Free self-hosted tier available

**Option B: Simple cron job in stable. API**
```typescript
// apps/api/src/lib/scheduler.ts
// Run via Vercel Cron or a simple Node cron job

import cron from 'node-cron'
import { publishInstagramPost } from './instagram'
import { getScheduledPosts } from './contentQueue'

// Runs every day at 7:25am — publishes any post scheduled for 7:30am
cron.schedule('25 7 * * *', async () => {
  const posts = await getScheduledPosts({ scheduledFor: '07:30' })
  for (const post of posts) {
    await publishInstagramPost(post)
  }
})
```

### Content Queue Schema (add to Drizzle/DB schema)
```typescript
// packages/db/src/schema/socialPosts.ts
export const socialPosts = pgTable('social_posts', {
  id: serial('id').primaryKey(),
  platform: text('platform').default('instagram'),
  imageUrl: text('image_url').notNull(),
  caption: text('caption').notNull(),
  pillar: text('pillar'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  publishedAt: timestamp('published_at'),
  status: text('status').default('scheduled'), // scheduled | published | failed
  igPostId: text('ig_post_id'),
  createdAt: timestamp('created_at').defaultNow(),
})
```

---

## Comment Management (Semi-Automated)

### Auto-reply to first comment (engagement signal boost)
Within 30 minutes of posting, leave a comment asking a follow-up question.
This manually boosts the comment thread and signals engagement to the algorithm.

### Comment monitoring via API
```typescript
// Poll for new comments every 15 minutes
async function getRecentComments(mediaId: string) {
  const res = await fetch(
    `${IG_API_BASE}/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${token}`
  )
  return res.json()
}
```

Use this to:
- Surface comments that need a reply
- Tag comments by sentiment (positive / question / negative)
- Feed into a simple inbox UI in the stable. admin panel

---

## Analytics Pipeline

### Pull Insights Weekly (automate via cron)

```typescript
async function getPostInsights(mediaId: string) {
  const metrics = [
    'impressions', 'reach', 'saved',
    'likes', 'comments', 'shares', 'profile_visits'
  ].join(',')

  const res = await fetch(
    `${IG_API_BASE}/${mediaId}/insights?metric=${metrics}&access_token=${token}`
  )
  return res.json()
}
```

Store weekly in your DB. Track:
- Best-performing pillar (by saves)
- Best posting time (by reach)
- Content type that drives most profile visits
- Hashtag performance (which sets drive discovery reach)

Use this data to refine the Month 2 content calendar.

---

## Token Renewal (Important)

Long-lived tokens expire after **60 days**. Set a reminder or automate renewal:

```typescript
// Refresh 5 days before expiry
async function refreshPageToken(shortLivedToken: string) {
  const res = await fetch(
    `${IG_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`
  )
  const { access_token } = await res.json()
  // Store new token securely — update env or secrets manager
  return access_token
}
```

Use a secrets manager (Vercel env vars, Doppler, or AWS Secrets Manager) — never store tokens in code or git.

---

## Full Recommended Stack

| Layer | Tool | Cost |
|-------|------|------|
| Design | Canva Pro | £13/mo |
| Scheduling (now) | Meta Business Suite | Free |
| Scheduling (month 2) | Later | £16/mo |
| API automation (month 3) | Instagram Graph API | Free (within limits) |
| Workflow orchestration | n8n (self-hosted) | Free |
| Analytics | Native Meta Insights + custom DB | Free |
| Token management | Vercel env vars | Free |
| Content queue | Notion or Google Sheets → DB | Free |

**Total cost to run professionally: £29/month until API automation replaces scheduling tools.**

---

## What We Can Build Inside stable. (Future)

A lightweight internal social media dashboard at `/admin/social`:
- View scheduled post queue
- See live analytics pulled from Meta Insights API
- Draft captions with AI assistance (Claude API)
- One-click publish to Instagram via Graph API
- Comment inbox with reply interface

This means the stable. admin panel becomes the social media management hub — no third-party tool required.
