# @stableadhd — Meta Business Suite Workflow

## Overview

Safe, professional automation using only official Meta tools and APIs.
No third-party bots. No scraping. No unofficial automation.

---

## Tier 1 — Manual (Now, Weeks 1–4)

Use **Meta Business Suite** exclusively for the first month.

### Daily Workflow

1. Open business.facebook.com → Meta Business Suite
2. Go to **Planner** → **Create Post**
3. Select **@stableadhd** Instagram account
4. Upload asset (exported PNG or MP4 from Canva)
5. Paste caption from `captions-bank.md`
6. Add hashtags from `hashtag-bank.md` (after blank line break)
7. Set schedule from `posting-calendar.md`
8. Click **Schedule**

### Weekly Workflow (every Sunday — 45 minutes)

1. Design 6 feed posts for the week in Canva
2. Export all as PNG
3. Open Meta Business Suite → schedule all 6 in Planner
4. Write captions from templates — vary, don't copy identically
5. Select hashtag set matching each post's pillar
6. Review grid layout in Instagram Preview (available in Creator Studio)
7. Prepare 3 story sets (one per day Tue/Thu/Sat minimum)

### Analytics (every Monday — 10 minutes)

Meta Business Suite → Insights:
- Check reach and impressions for previous week's posts
- Note which post had the most saves (carousel priority metric)
- Note which story had the most poll responses
- Adjust next week's pillar mix based on data

---

## Tier 2 — Semi-Automated (Month 2+)

### Recommended: Later (Instagram-approved scheduler)

**Why Later:**
- Visual grid planner — drag and drop to preview the grid before posting
- Best time to post suggestions based on your audience
- Linkin.bio page (replaces one link limitation)
- Auto-publish to Instagram (no manual push needed)
- Cost: ~£16/month

**Setup:**
1. Sign up at later.com
2. Connect Instagram Business account (@stableadhd)
3. Connect linked Facebook Page (required for Instagram API access)
4. Upload weekly content library on Sundays
5. Schedule 2 weeks ahead using calendar view
6. Use Linkin.bio to link to stableadhd.com + specific app store pages

**Alternative: Buffer (~£15/month)**
- First comment auto-posting (good for hashtag placement strategy)
- Analytics dashboard with CSV export

---

## Tier 3 — API Automation (Month 3+)

### What the Instagram Graph API Supports

| Capability | Supported |
|------------|-----------|
| Post single images | ✅ |
| Post carousels | ✅ |
| Post Reels | ✅ |
| Post Stories | ✅ (Business accounts) |
| Schedule posts | ✅ |
| Read comments | ✅ |
| Reply to comments | ✅ |
| Read DMs | ✅ |
| Send DMs | ✅ (within 24h window) |
| Read analytics | ✅ (Insights API) |

### Setup

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

### Publish a Feed Post via API

```typescript
// apps/api/src/lib/instagram.ts

const IG_API_BASE = 'https://graph.facebook.com/v19.0'

export async function publishInstagramPost({
  imageUrl,
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
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
    }
  )
  const { id: containerId } = await containerRes.json()

  // Step 2: Publish the container
  const publishRes = await fetch(
    `${IG_API_BASE}/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerId, access_token: token }),
    }
  )

  return publishRes.json()
}
```

### Scheduling (Vercel Cron)

```typescript
// apps/api/src/lib/scheduler.ts
import cron from 'node-cron'
import { publishInstagramPost } from './instagram'
import { getScheduledPosts } from './contentQueue'

// Runs every day at 7:25am — publishes posts scheduled for 7:30am
cron.schedule('25 7 * * *', async () => {
  const posts = await getScheduledPosts({ scheduledFor: '07:30' })
  for (const post of posts) {
    await publishInstagramPost(post)
  }
})
```

### Token Renewal (every 60 days)

```typescript
async function refreshPageToken(shortLivedToken: string) {
  const res = await fetch(
    `${IG_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`
  )
  const { access_token } = await res.json()
  // Store new token in Vercel env vars or secrets manager
  return access_token
}
```

Set a calendar reminder 5 days before expiry. Tokens expire after **60 days**.

---

## Analytics Pipeline

### Weekly Metrics to Track

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

Store weekly in DB. Track:
- Best-performing pillar (by saves)
- Best posting time (by reach)
- Content type that drives most profile visits
- Hashtag sets that drive discovery reach

---

## Recommended Stack

| Layer | Tool | Cost |
|-------|------|------|
| Design | Canva Pro | £13/mo |
| Scheduling (now) | Meta Business Suite | Free |
| Scheduling (month 2) | Later | £16/mo |
| API automation (month 3) | Instagram Graph API | Free (within limits) |
| Workflow orchestration | n8n (self-hosted) | Free |
| Analytics | Native Meta Insights + DB | Free |
| Token management | Vercel env vars | Free |

**Total monthly cost to run professionally: £29/month until API automation replaces scheduling tools.**

---

## Comment Management

### Manual protocol (first 90 days)
- Reply to every comment within 2 hours of posting
- Within 30 minutes of posting, leave a follow-up question as the first comment — this boosts the thread and signals engagement to the algorithm
- DM every new follower who responds to a story poll

### Via API (month 3+)
```typescript
async function getRecentComments(mediaId: string) {
  const res = await fetch(
    `${IG_API_BASE}/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${token}`
  )
  return res.json()
}
```

Use to surface comments needing replies and feed a simple admin inbox.
