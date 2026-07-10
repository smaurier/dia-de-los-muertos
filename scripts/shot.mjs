// Screenshot + console errors — outil de vérif visuelle (mode photo)
// Usage: node .shots/shot.mjs "photo=x,y,z,tx,ty,tz" out.png
import { chromium } from 'playwright'

const [params, out] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', err => errors.push(String(err)))
await page.goto(`http://localhost:5173/?${params}`)
await page.waitForTimeout(7000)
await page.screenshot({ path: out })
if (errors.length) {
  console.log('CONSOLE ERRORS:')
  for (const e of errors.slice(0, 10)) console.log('  ' + e.slice(0, 300))
} else {
  console.log('no console errors')
}
await browser.close()
