// Writes the film's DiceBear avatars through the app's own resolver
// (src/lib/avatarStyles.js), so each face is exactly what the leaderboard
// renders for that rival id: seed = rival id, style derived from the seed.
import fs from 'node:fs'
import { resolveAvatar } from '../../src/lib/avatarStyles.js'
import { rivals } from '../../src/data/rivals.js'

const PEOPLE = new Set(['adventurer', 'avataaars', 'notionists', 'micah', 'personas', 'openPeeps'])
const out = new URL('../assets/avatars/', import.meta.url)
fs.mkdirSync(out, { recursive: true })

const write = (file, uri) => {
  const svg = uri.startsWith('data:image/svg+xml;base64,')
    ? Buffer.from(uri.split(',')[1], 'base64').toString('utf8')
    : decodeURIComponent(uri.split(',').slice(1).join(','))
  fs.writeFileSync(new URL(file, out), svg)
}

const manifest = []
// The demo learner picked Adventurer, the Bronze default.
const you = resolveAvatar('adventurer', 'you', 'you')
write('you.svg', you.uri)
manifest.push({ id: 'you', name: 'You', style: you.styleId })

for (const rival of rivals) {
  const a = resolveAvatar(undefined, rival.id, rival.id)
  manifest.push({ id: rival.id, name: rival.name, role: rival.role, style: a.styleId, people: PEOPLE.has(a.styleId) })
  write(`${rival.id}.svg`, a.uri)
}
fs.writeFileSync(new URL('manifest.json', out), JSON.stringify(manifest, null, 1))
for (const m of manifest) console.log(m.people === false ? '  ' : '* ', m.id.padEnd(12), m.style.padEnd(11), m.name, m.role ?? '')
