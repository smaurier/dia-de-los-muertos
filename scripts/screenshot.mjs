// Screenshot du mode photo : node scripts/screenshot.mjs <photoParams> <outFile>
// ex: node scripts/screenshot.mjs "6,1.6,0,-7,1.5,0" shot.png
import { chromium } from 'playwright'

const [params, out] = process.argv.slice(2)
const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-webgl'] })
const page = await browser.newPage({ viewport: { width: 1664, height: 928 } })
await page.goto(`http://localhost:5174/?photo=${params}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(4500)
await page.screenshot({ path: out })
await browser.close()
console.log('saved', out)
