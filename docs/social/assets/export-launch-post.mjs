// Export "ADHD isn't laziness" launch post as PNG files
// Usage: node export-launch-post.mjs
// Requires: npm install puppeteer  (or pnpm add -D puppeteer from repo root)

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OUT = {
  feed:    join(__dirname, 'exported/feed'),
  stories: join(__dirname, 'exported/stories'),
}
for (const dir of Object.values(OUT)) mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const SRC = `file://${join(__dirname, 'feed-posts/post-adhd-isnt-laziness.html')}`

// ── Feed / Facebook — 1080 × 1080 ────────────────────────────────────────────
console.log('\n📸 Feed + Facebook (1080 × 1080)')
await (async () => {
  const page = await browser.newPage()
  await page.setViewport({ width: 2400, height: 2400, deviceScaleFactor: 1 })
  await page.goto(SRC, { waitUntil: 'networkidle0' })

  // Scale the inner post to 1:1 for export
  await page.evaluate(() => {
    const el = document.getElementById('feed-export')
    if (el) {
      el.style.transform = 'scale(1)'
      el.style.position  = 'relative'
    }
    const wrap = document.getElementById('feed-wrap')
    if (wrap) {
      wrap.style.width  = '1080px'
      wrap.style.height = '1080px'
    }
  })

  const el = await page.$('#feed-export')
  if (el) {
    // Instagram feed
    await el.screenshot({ path: join(OUT.feed, 'adhd-isnt-laziness-feed.png') })
    console.log('  ✓ adhd-isnt-laziness-feed.png')
    // Facebook version — identical dimensions, separate file
    await el.screenshot({ path: join(OUT.feed, 'adhd-isnt-laziness-facebook.png') })
    console.log('  ✓ adhd-isnt-laziness-facebook.png')
  }

  await page.close()
})()

// ── Story — 1080 × 1920 ───────────────────────────────────────────────────────
console.log('\n📱 Story (1080 × 1920)')
await (async () => {
  const page = await browser.newPage()
  await page.setViewport({ width: 2400, height: 5000, deviceScaleFactor: 1 })
  await page.goto(SRC, { waitUntil: 'networkidle0' })

  await page.evaluate(() => {
    const el = document.getElementById('story-export')
    if (el) {
      el.style.transform = 'scale(1)'
      el.style.position  = 'relative'
    }
    const wrap = document.getElementById('story-wrap')
    if (wrap) {
      wrap.style.width  = '1080px'
      wrap.style.height = '1920px'
    }
  })

  const el = await page.$('#story-export')
  if (el) {
    await el.screenshot({ path: join(OUT.stories, 'adhd-isnt-laziness-story.png') })
    console.log('  ✓ adhd-isnt-laziness-story.png')
  }

  await page.close()
})()

await browser.close()

console.log('\n✅ Export complete')
console.log('   Feed:  docs/social/assets/exported/feed/')
console.log('   Story: docs/social/assets/exported/stories/\n')
