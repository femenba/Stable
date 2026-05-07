// Export all Instagram posts as 1080x1080 PNG files
// Run: node export-posts.js
// Requires: npm install puppeteer

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'exported')
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

// ── Grid Posts (1080×1080) ──
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 })
await page.goto(`file://${join(__dirname, 'grid-posts.html')}`)
await page.waitForNetworkIdle()

// Each post element is identified by id="post-NN"
const postIds = ['01','02','03','04','05','06','07','08','09']
for (const id of postIds) {
  const el = await page.$(`#post-${id}`)
  if (!el) { console.warn(`post-${id} not found`); continue }

  // Reset transform to 1:1 for screenshot
  await page.evaluate((elId) => {
    const el = document.getElementById(`post-${elId}`)
    el.style.transform = 'scale(1)'
    // Hide grain overlay temporarily for cleaner export
    // (optional — remove these lines to keep grain)
  }, id)

  await el.screenshot({ path: join(OUT, `post-${id}.png`) })
  console.log(`✓ post-${id}.png`)

  // Restore scale for viewer
  await page.evaluate((elId) => {
    const pw = document.getElementById(`pw-${elId}`)
    if (!pw) return
    const colW = pw.offsetWidth
    const s = colW / 1080
    document.getElementById(`post-${elId}`).style.transform = `scale(${s})`
  }, id)
}

// ── Carousel Slides (1080×1080) ──
await page.goto(`file://${join(__dirname, 'carousels.html')}`)
await page.waitForNetworkIdle()

const carouselSelectors = [
  // [filename, cssSelector]
  ['c1-slide1.png', '.c1s1'], ['c1-slide2.png', '.c1s2'], ['c1-slide3.png', '.c1s3'],
  ['c1-slide4.png', '.c1s4'], ['c1-slide5.png', '.c1s5'], ['c1-slide6.png', '.c1s6'],
  ['c1-slide7.png', '.c1s7'],
  ['c2-slide1.png', '.c2s1'], ['c2-slide2.png', '.c2s2'], ['c2-slide3.png', '.c2s3'],
  ['c2-slide4.png', '.c2s4'], ['c2-slide5.png', '.c2s5'], ['c2-slide6.png', '.c2s6'],
  ['c2-slide7.png', '.c2s7'],
  ['c3-slide1.png', '.c3s1'], ['c3-slide2.png', '.c3s2'], ['c3-slide3.png', '.c3s3'],
  ['c3-slide4.png', '.c3s4'], ['c3-slide5.png', '.c3s5'], ['c3-slide6.png', '.c3s6'],
  ['c3-slide7.png', '.c3s7'],
]

for (const [filename, selector] of carouselSelectors) {
  const slides = await page.$$(selector)
  const el = slides[0]
  if (!el) { console.warn(`${selector} not found`); continue }
  await page.evaluate((sel) => {
    document.querySelectorAll(sel).forEach(el => el.style.transform = 'scale(1)')
  }, selector)
  await el.screenshot({ path: join(OUT, filename) })
  console.log(`✓ ${filename}`)
  await page.evaluate((sel) => {
    document.querySelectorAll(sel).forEach(el => el.style.transform = 'scale(.2963)')
  }, selector)
}

// ── Story & Reel Covers (1080×1920) ──
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 })
await page.goto(`file://${join(__dirname, 'story-templates.html')}`)
await page.waitForNetworkIdle()

const storySelectors = [
  ['story-01-reveal.png',     '.st1'],
  ['story-02-poll.png',       '.st2'],
  ['story-03-app.png',        '.st3'],
  ['story-04-relatable.png',  '.st4'],
  ['story-05-founder.png',    '.st5'],
  ['reel-cover-01.png',       '.rc1'],
  ['reel-cover-02.png',       '.rc2'],
  ['reel-cover-03.png',       '.rc3'],
]

for (const [filename, selector] of storySelectors) {
  const el = await page.$(selector)
  if (!el) { console.warn(`${selector} not found`); continue }
  await page.evaluate((sel) => {
    document.querySelectorAll(sel).forEach(el => el.style.transform = 'scale(1)')
  }, selector)
  await el.screenshot({ path: join(OUT, filename) })
  console.log(`✓ ${filename}`)
  await page.evaluate((sel) => {
    document.querySelectorAll(sel).forEach(el => el.style.transform = 'scale(.2037)')
  }, selector)
}

await browser.close()
console.log(`\n✅ All assets exported to: ${OUT}`)
console.log(`   ${postIds.length} feed posts`)
console.log(`   21 carousel slides`)
console.log(`   5 story templates`)
console.log(`   3 reel covers`)
