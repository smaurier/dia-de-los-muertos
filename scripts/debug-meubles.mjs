// Diagnostic : caméra dans les meubles ? Colle le garçon contre table/mur/canapé puis tourne.
import { chromium } from 'playwright'

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('console', msg => { if (msg.type() === 'error' || msg.type() === 'warning') console.log(`[console:${msg.type()}]`, msg.text().slice(0, 300)) })
page.on('pageerror', err => console.log('[pageerror]', err.message))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(6000)
await page.mouse.click(960, 540)
await page.waitForTimeout(800)
await page.screenshot({ path: 'scripts/meuble-spawn.png' })

// Scénario 1 : reculer contre le mur sud (spawn z=3, mur z=5) puis tour complet
await page.keyboard.down('s')
await page.waitForTimeout(2500)
await page.keyboard.up('s')
for (let i = 0; i < 4; i++) {
  await page.mouse.move(960 + 900, 540, { steps: 20 })
  await page.screenshot({ path: `scripts/meuble-mur-${i}.png` })
}

// Scénario 2 : avancer contre la table (z vers -1.45) puis tour complet
await page.keyboard.down('w')
await page.waitForTimeout(2500)
await page.keyboard.up('w')
for (let i = 0; i < 4; i++) {
  await page.mouse.move(960 + 900, 540, { steps: 20 })
  await page.screenshot({ path: `scripts/meuble-table-${i}.png` })
}

await browser.close()
console.log('done')
