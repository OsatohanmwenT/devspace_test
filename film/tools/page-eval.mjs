// Serves film/ on localhost, opens a page, waits for window.result and prints it.
// An optional second argument saves a full-page screenshot there.
//   node tools/page-eval.mjs "tools/inspect-rive.html?file=../assets/devy/all_devy.riv"
//   node tools/page-eval.mjs "tools/rive-sheet.html?n=12" out/rive-sheet.png
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.riv': 'application/octet-stream', '.lottie': 'application/zip' }
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end()
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1800, height: 900 } })
page.on('console', (m) => console.error(`[page] ${m.text()}`))
page.on('pageerror', (e) => console.error(`[page error] ${e.message}`))
await page.goto(`http://127.0.0.1:${server.address().port}/${process.argv[2]}`)
await page.waitForFunction(() => window.result !== undefined, null, { timeout: 30000 })
console.log(JSON.stringify(await page.evaluate(() => window.result), null, 1))
if (process.argv[3]) await page.screenshot({ path: process.argv[3], fullPage: true })
await browser.close()
server.close()
