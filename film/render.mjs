// Renders a seek(t)-driven HTML page to video.
// Each output frame is SUBFRAMES screenshots spread across the frame's
// interval, averaged by ffmpeg tmix into one motion-blurred frame.
//
//   node render.mjs <page.html> <out.mp4> [--fps 60] [--sub 8] [--from 0] [--to <dur>] [--audio mix.wav]
//   node render.mjs <page.html> <out-dir> --stills 0,1.5,3   (PNG stills only)
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const [pageArg, outArg] = args
if (!pageArg || !outArg) {
  console.error('usage: node render.mjs <page.html> <out.mp4|out-dir> [options]')
  process.exit(1)
}

const FPS = Number(opt('fps', 60))
const SUB = Number(opt('sub', 8))
const stills = opt('stills', null)

// ES modules and the Lottie WASM won't load from file://, so the page's own
// folder is served over a throwaway localhost server for the render.
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.lottie': 'application/zip', '.css': 'text/css' }
const root = path.dirname(path.resolve(pageArg))
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const pageUrl = `http://127.0.0.1:${server.address().port}/${path.basename(pageArg)}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
page.on('console', (msg) => console.log(`[page] ${msg.text()}`))
page.on('pageerror', (err) => { console.error(`[page error] ${err.message}`); process.exitCode = 1 })
await page.goto(pageUrl)
await page.waitForFunction(() => typeof window.seek === 'function' && (window.ready ?? true) === true, null, { timeout: 60000 })
await page.evaluate(() => document.fonts.ready)

const seekAndShot = async (t) => {
  await page.evaluate(async (time) => { await window.seek(time) }, t)
  return page.screenshot({ type: 'png' })
}
// The first screenshot after load can land before the page has painted.
await seekAndShot(0)

if (stills) {
  fs.mkdirSync(outArg, { recursive: true })
  for (const t of stills.split(',').map(Number)) {
    const file = path.join(outArg, `still_${t.toFixed(2)}s.png`)
    fs.writeFileSync(file, await seekAndShot(t))
    console.log(`wrote ${file}`)
  }
  await browser.close()
  process.exit()
}

const duration = await page.evaluate(() => window.DURATION)
const from = Number(opt('from', 0))
const to = Number(opt('to', duration))
const frames = Math.round((to - from) * FPS)
const audio = opt('audio', null)

// Screenshots go in at FPS*SUB; tmix averages each SUB-frame window, then
// select keeps every SUB-th result so the output is FPS.
const ff = spawn('ffmpeg', [
  '-y', '-v', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
  ...(audio ? ['-ss', String(from), '-i', audio] : []),
  '-vf', `tmix=frames=${SUB}:weights=${Array(SUB).fill(1).join(' ')},select='not(mod(n+1\\,${SUB}))',setpts=N/${FPS}/TB`,
  '-r', String(FPS),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow',
  ...(audio ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  outArg,
], { stdio: ['pipe', 'inherit', 'inherit'] })

const started = Date.now()
for (let f = 0; f < frames; f++) {
  for (let s = 0; s < SUB; s++) {
    // Subframes are centred within the frame's open interval.
    const t = from + (f + (s + 0.5) / SUB - 0.5) / FPS
    const buf = await seekAndShot(Math.max(from, t))
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  }
  if (f % 30 === 0) process.stdout.write(`\rframe ${f}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)}s`)
}
ff.stdin.end()
await new Promise((r) => ff.on('close', r))
await browser.close()
server.close()
console.log(`\nwrote ${outArg}`)
