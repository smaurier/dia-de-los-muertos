// Diagnostic écran noir : charge le proto, capture console + screenshots.
import { chromium } from 'playwright'

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

page.on('console', msg => console.log(`[console:${msg.type()}]`, msg.text()))
page.on('pageerror', err => console.log('[pageerror]', err.message))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(6000) // laisser charger GLB + premier rendu

await page.screenshot({ path: 'scripts/shot-1-initial.png' })

// Simuler entrée en jeu : clic (pointer lock) puis avancer + bouger souris
await page.mouse.click(640, 360)
await page.waitForTimeout(800)
await page.keyboard.down('w')
await page.waitForTimeout(1500)
await page.keyboard.up('w')
await page.mouse.move(900, 360, { steps: 10 })
await page.waitForTimeout(800)
await page.screenshot({ path: 'scripts/shot-2-apres-move.png' })

await page.mouse.move(300, 360, { steps: 10 })
await page.waitForTimeout(800)
await page.screenshot({ path: 'scripts/shot-3-apres-rotation.png' })

await browser.close()
console.log('done')
