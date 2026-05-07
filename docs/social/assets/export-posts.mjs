// Export all Instagram assets as PNG files
// Usage: node export-posts.mjs
// Requires: npm install puppeteer (or: pnpm add -D puppeteer from repo root)

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DIRS = {
  feed:      join(__dirname, 'exported/feed'),
  c01:       join(__dirname, 'exported/carousels/c01'),
  c02:       join(__dirname, 'exported/carousels/c02'),
  c03:       join(__dirname, 'exported/carousels/c03'),
  stories:   join(__dirname, 'exported/stories'),
  reels:     join(__dirname, 'exported/reels'),
  highlights:join(__dirname, 'exported/highlights'),
}

for (const dir of Object.values(DIRS)) {
  mkdirSync(dir, { recursive: true })
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

function log(file) {
  process.stdout.write(`  ✓ ${file}\n`)
}

// ─── Helper: screenshot an element at its native 1080px size ───────────────
async function screenshotPost(page, selector, outPath, nth = 0) {
  // Scale element up to 1:1 (from its viewer-scaled state)
  await page.evaluate((sel, n) => {
    const els = document.querySelectorAll(sel)
    const el = els[n]
    if (!el) return
    el.style.transform = 'scale(1)'
    el.style.position  = 'relative'
  }, selector, nth)

  await new Promise(r => setTimeout(r, 100)) // brief settle

  const els = await page.$$(selector)
  if (!els[nth]) { process.stdout.write(`  ⚠ Not found: ${selector}[${nth}]\n`); return }
  await els[nth].screenshot({ path: outPath, omitBackground: false })

  // Restore scale
  await page.evaluate((sel, n) => {
    const el = document.querySelectorAll(sel)[n]
    if (el) el.style.transform = ''
  }, selector, nth)
}

// ─── FEED POSTS (1080 × 1080) ─────────────────────────────────────────────
console.log('\n📸 Feed posts (1080×1080)')
await (async () => {
  const page = await browser.newPage()
  await page.setViewport({ width: 2000, height: 2000, deviceScaleFactor: 1 })
  await page.goto(`file://${join(__dirname, 'feed-posts/grid-posts.html')}`, { waitUntil: 'networkidle0' })

  const postMeta = [
    { id: 'p01', file: '01-brand-reveal.png' },
    { id: 'p02', file: '02-validation-quote.png' },
    { id: 'p03', file: '03-tasks-feature.png' },
    { id: 'p04', file: '04-task-paralysis-cover.png' },
    { id: 'p05', file: '05-overwhelm-loop.png' },
    { id: 'p06', file: '06-self-compassion.png' },
    { id: 'p07', file: '07-focus-protocol-cover.png' },
    { id: 'p08', file: '08-morning-routine-cover.png' },
    { id: 'p09', file: '09-app-cta.png' },
  ]

  // Resize all posts to 1:1 for export
  await page.evaluate(() => {
    document.querySelectorAll('.post').forEach(el => {
      el.style.transform = 'scale(1)'
      el.style.position  = 'relative'
    })
    document.querySelectorAll('.pw').forEach(el => {
      el.style.width  = '1080px'
      el.style.height = '1080px'
    })
  })

  for (const { id, file } of postMeta) {
    const el = await page.$(`#post-${id.replace('p', '')}`)
    if (!el) { process.stdout.write(`  ⚠ ${id} not found\n`); continue }
    await el.screenshot({ path: join(DIRS.feed, file) })
    log(file)
  }

  await page.close()
})()

// ─── CAROUSELS (1080 × 1080 per slide) ───────────────────────────────────
console.log('\n📋 Carousel slides (1080×1080)')
await (async () => {
  const page = await browser.newPage()
  await page.setViewport({ width: 4000, height: 2000, deviceScaleFactor: 1 })
  await page.goto(`file://${join(__dirname, 'carousels/carousels.html')}`, { waitUntil: 'networkidle0' })

  // Scale all slides to 1:1
  await page.evaluate(() => {
    document.querySelectorAll('.slide').forEach(el => {
      el.style.transform = 'scale(1)'
      el.style.position  = 'relative'
    })
    document.querySelectorAll('.pw').forEach(el => {
      el.style.width  = '1080px'
      el.style.height = '1080px'
    })
  })

  const sets = [
    { prefix: 'c1s', dir: DIRS.c01, name: 'c01' },
    { prefix: 'c2s', dir: DIRS.c02, name: 'c02' },
    { prefix: 'c3s', dir: DIRS.c03, name: 'c03' },
  ]

  for (const { prefix, dir, name } of sets) {
    const slides = await page.$$(`.${prefix.slice(0,-1)}-wrap .slide, .slide.${prefix}1, [class*="${prefix}"]`)

    // Use CSS class selectors per slide
    for (let i = 1; i <= 7; i++) {
      const cls = `.${prefix}${i}`
      const el = await page.$(cls)
      if (!el) continue
      const file = `slide-0${i}.png`
      await el.screenshot({ path: join(dir, file) })
      log(`${name}/${file}`)
    }
  }

  await page.close()
})()

// ─── STORIES & REELS (1080 × 1920) ──────────────────────────────────────
console.log('\n📱 Stories & Reels (1080×1920)')
await (async () => {
  const page = await browser.newPage()
  await page.setViewport({ width: 2000, height: 4000, deviceScaleFactor: 1 })
  await page.goto(`file://${join(__dirname, 'stories/story-templates.html')}`, { waitUntil: 'networkidle0' })

  await page.evaluate(() => {
    document.querySelectorAll('.story').forEach(el => {
      el.style.transform = 'scale(1)'
      el.style.position  = 'relative'
    })
    document.querySelectorAll('.pw-story').forEach(el => {
      el.style.width  = '1080px'
      el.style.height = '1920px'
    })
  })

  const stories = [
    { cls: '.st1', file: 'story-01-brand-reveal.png',   dir: DIRS.stories },
    { cls: '.st2', file: 'story-02-this-or-that.png',   dir: DIRS.stories },
    { cls: '.st3', file: 'story-03-app-demo.png',        dir: DIRS.stories },
    { cls: '.st4', file: 'story-04-relatable.png',       dir: DIRS.stories },
    { cls: '.st5', file: 'story-05-founder.png',         dir: DIRS.stories },
    { cls: '.rc1', file: 'reel-cover-01-task-paralysis.png', dir: DIRS.reels },
    { cls: '.rc2', file: 'reel-cover-02-calm-productivity.png', dir: DIRS.reels },
    { cls: '.rc3', file: 'reel-cover-03-adhd-tax.png',   dir: DIRS.reels },
  ]

  for (const { cls, file, dir } of stories) {
    const el = await page.$(cls)
    if (!el) { process.stdout.write(`  ⚠ ${cls} not found\n`); continue }
    await el.screenshot({ path: join(dir, file) })
    log(file)
  }

  await page.close()
})()

await browser.close()

console.log('\n✅ Export complete')
console.log(`   → ${Object.values(DIRS).map(d => d.replace(__dirname + '/', '')).join(', ')}`)
console.log(`\n📁 All files: ${join(__dirname, 'exported')}\n`)
