import test from 'node:test'
import assert from 'node:assert/strict'
import { articleToSpeech, articleToSpeechPersonality, flattenRichText } from './useLessonNarration.js'

// These are the pure text-building functions from useLessonNarration.js —
// the browser SpeechSynthesis playback itself isn't testable under
// `node --test` (no DOM/window), so only the logic that decides *what*
// gets spoken is covered here; the actual speaking is verified manually
// in-browser.

test('flattenRichText joins plain strings, code, and strong segments into one string', () => {
  assert.equal(flattenRichText('plain text'), 'plain text')
  assert.equal(flattenRichText([{ code: 'x = 1' }]), 'x = 1')
  assert.equal(flattenRichText([{ strong: 'important' }]), 'important')
  assert.equal(flattenRichText(['before ', { code: 'x' }, ' after']), 'before x after')
})

test('articleToSpeech reads the on-screen text verbatim', () => {
  const article = {
    title: 'Title',
    intro: 'Intro line.',
    sections: [{ title: 'Section one', body: 'Body one.' }, { title: 'Section two', body: 'Body two.' }],
  }
  const speech = articleToSpeech(article)
  assert.match(speech, /Title/)
  assert.match(speech, /Intro line\./)
  assert.match(speech, /Body one\./)
  assert.match(speech, /Body two\./)
})

test('articleToSpeechPersonality prefers spokenIntro and per-section spoken text', () => {
  const article = {
    title: 'Title',
    intro: 'Intro line.',
    spokenIntro: 'Hey, here is the fun version.',
    sections: [{ title: 'Section one', body: 'Body one.', spoken: 'The fun way to say body one.' }],
  }
  const speech = articleToSpeechPersonality(article)
  assert.match(speech, /Hey, here is the fun version\./)
  assert.match(speech, /The fun way to say body one\./)
  assert.doesNotMatch(speech, /Intro line\./)
  assert.doesNotMatch(speech, /Body one\.(?!$)/)
})

test('articleToSpeechPersonality falls back section-by-section when spoken text is missing', () => {
  const article = {
    title: 'Title',
    intro: 'Intro line.',
    // No spokenIntro — falls back to intro.
    sections: [
      { title: 'Has personality', body: 'Plain body A.', spoken: 'Fun body A.' },
      { title: 'No personality', body: 'Plain body B.' }, // falls back to body
    ],
  }
  const speech = articleToSpeechPersonality(article)
  assert.match(speech, /Intro line\./, 'missing spokenIntro should fall back to intro')
  assert.match(speech, /Fun body A\./)
  assert.match(speech, /Plain body B\./, 'missing spoken text should fall back to the section body')
})

test('articleToSpeechPersonality degrades to the plain intro/body text when no personality fields exist', () => {
  // Unlike articleToSpeech, the personality variant deliberately never reads
  // title/section-title (a reframe, not a transcript) — so it still differs
  // from verbatim mode even with no spoken fields authored, but it must
  // still produce real, non-empty text rather than throwing or going silent.
  const article = { title: 'Title', intro: 'Intro.', sections: [{ title: 'S', body: 'B.' }] }
  assert.equal(articleToSpeechPersonality(article), 'Intro. B.')
})
