// A small, self-contained synthesized sound layer — every tone is generated
// with the Web Audio API, no audio files. Scoped to exactly the events this
// lesson pilot fires; a later, fuller sound-event system can extend this same
// module rather than replace it. No caller ever touches AudioContext directly
// — everything goes through playSound(eventName).

const STORAGE_KEY = 'devspace-sound-effects'

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled))
  } catch {
    // Best-effort persistence — a blocked localStorage write shouldn't crash Settings.
  }
}

// {freq, duration, delay, type, gain} — a short list per event plays as one
// tiny melodic gesture (a single tone for a quiet nudge, two or three for a
// milestone), rather than one flat beep for everything.
const RECIPES = {
  answer_correct: [{ freq: 880, duration: 0.09, type: 'sine', gain: 0.16 }, { freq: 1175, duration: 0.14, delay: 0.08, type: 'sine', gain: 0.14 }],
  answer_wrong: [{ freq: 220, duration: 0.16, type: 'sine', gain: 0.12 }],
  xp_gain: [{ freq: 660, duration: 0.08, type: 'triangle', gain: 0.1 }],
  coin_gain: [{ freq: 990, duration: 0.06, type: 'square', gain: 0.07 }, { freq: 1320, duration: 0.09, delay: 0.05, type: 'square', gain: 0.07 }],
  practice_complete: [{ freq: 740, duration: 0.1, type: 'sine', gain: 0.14 }, { freq: 988, duration: 0.16, delay: 0.09, type: 'sine', gain: 0.14 }],
  tile_complete: [
    { freq: 523, duration: 0.12, type: 'sine', gain: 0.16 },
    { freq: 659, duration: 0.12, delay: 0.1, type: 'sine', gain: 0.16 },
    { freq: 784, duration: 0.22, delay: 0.2, type: 'sine', gain: 0.18 },
  ],
  hint_open: [{ freq: 520, duration: 0.07, type: 'sine', gain: 0.09 }],
}

export const SOUND_EVENTS = Object.keys(RECIPES)

let sharedContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedContext) sharedContext = new AudioContextClass()
  return sharedContext
}

function playTone(context, { freq, duration, delay = 0, type = 'sine', gain = 0.15 }) {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = freq
  const startTime = context.currentTime + delay
  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.015)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.02)
}

export function playSound(eventName) {
  if (!isSoundEnabled()) return
  const recipe = RECIPES[eventName]
  if (!recipe) return
  const context = getAudioContext()
  if (!context) return
  if (context.state === 'suspended') context.resume().catch(() => {})
  try {
    recipe.forEach((tone) => playTone(context, tone))
  } catch {
    // Synthesized audio is best-effort — never let it break the lesson.
  }
}
