// Charge le jeu, capture les erreurs console + screenshot du player.
import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--use-gl=angle'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on('console', msg => {
  if (['error', 'warning'].includes(msg.type())) console.log(`[${msg.type()}]`, msg.text().slice(0, 300))
})
page.on('pageerror', err => console.log('[pageerror]', String(err).slice(0, 300)))
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' })
await page.waitForTimeout(6000)
const resp = await page.evaluate(() => fetch('/models/characters/heros-blink.png').then(r => r.status))
console.log('[check] heros-blink.png status:', resp)
// Pointer lock + recul : voir le garçon de face
await page.click('canvas')
await page.waitForTimeout(800)
await page.keyboard.down('s')
await page.waitForTimeout(1200)
await page.keyboard.up('s')
await page.waitForTimeout(600)
await page.screenshot({ path: 'shot-player-check.png' })
await page.waitForTimeout(2800)
await page.screenshot({ path: 'shot-player-check2.png' })
await browser.close()
console.log('done')
