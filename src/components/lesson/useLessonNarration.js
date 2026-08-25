import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const RATE_KEY = 'devspace-narration-rate'
const VOICE_KEY = 'devspace-narration-voice'
const AUTO_PLAY_KEY = 'devspace-narration-autoplay'

export const NARRATION_RATES = [0.75, 1, 1.25, 1.5, 2]

const readBoolean = (key, fallback) => {
  const stored = localStorage.getItem(key)
  return stored === null ? fallback : stored === 'true'
}

// Segments can carry inline code/emphasis (see RichText) — narration only
// needs the words, so code and strong segments just contribute their text.
export function flattenRichText(content) {
  const segments = Array.isArray(content) ? content : [content]
  return segments.map((segment) => (typeof segment === 'string' ? segment : (segment.code ?? segment.strong ?? ''))).join('')
}

// Diagrams, examples, and the video card are visual by design — narration
// covers the prose (title, intro, section bodies) a learner would otherwise read.
export function articleToSpeech(article) {
  const parts = [article.title, article.intro]
  for (const section of article.sections ?? []) {
    parts.push(section.title, flattenRichText(section.body))
  }
  return parts.filter(Boolean).join('. ')
}

// Wraps window.speechSynthesis: play/pause/stop, a persisted rate and voice,
// an "Audio" mode that auto-narrates each new article as it loads, and an
// "Auto-continue" mode that advances to the next step once narration ends —
// together these make a hands-free listening mode, not just a manual play button.
export function useLessonNarration(article, { onNarrationStart, onNarrationEnd } = {}) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const [rate, setRate] = useState(() => Number(localStorage.getItem(RATE_KEY)) || 1)
  const [voiceName, setVoiceName] = useState(() => localStorage.getItem(VOICE_KEY) || '')
  const [autoPlay, setAutoPlay] = useState(() => readBoolean(AUTO_PLAY_KEY, false))

  useEffect(() => {
    if (!supported) return undefined
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en')))
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [supported])

  const activeVoice = voices.find((voice) => voice.name === voiceName) ?? voices.find((voice) => voice.default) ?? voices[0]

  const speakWith = useCallback((nextRate, nextVoice) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    onNarrationStart?.()
    const utterance = new SpeechSynthesisUtterance(articleToSpeech(article))
    utterance.rate = nextRate
    if (nextVoice) utterance.voice = nextVoice
    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      onNarrationEnd?.()
    }
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false) }
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setIsPaused(false)
  }, [article, supported, onNarrationStart, onNarrationEnd])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [supported])

  // Moving to a new step stops narration for the step being left, rather than
  // reading its stale text over the newly visible one — then, if Audio is on,
  // starts reading the new step automatically.
  useEffect(() => {
    if (!supported) return undefined
    window.speechSynthesis.cancel()
    if (autoPlay) speakWith(rate, activeVoice)
    return () => window.speechSynthesis.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the article identity should retrigger auto-play
  }, [article, supported])

  const toggle = useCallback(() => {
    if (isSpeaking) stop()
    else speakWith(rate, activeVoice)
  }, [isSpeaking, stop, speakWith, rate, activeVoice])

  const togglePause = useCallback(() => {
    if (!supported || !isSpeaking) return
    if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false) }
    else { window.speechSynthesis.pause(); setIsPaused(true) }
  }, [supported, isSpeaking, isPaused])

  const changeRate = useCallback((nextRate) => {
    setRate(nextRate)
    localStorage.setItem(RATE_KEY, String(nextRate))
    if (isSpeaking) speakWith(nextRate, activeVoice)
  }, [isSpeaking, speakWith, activeVoice])

  const changeVoice = useCallback((nextVoiceName) => {
    setVoiceName(nextVoiceName)
    localStorage.setItem(VOICE_KEY, nextVoiceName)
    if (isSpeaking) speakWith(rate, voices.find((voice) => voice.name === nextVoiceName))
  }, [isSpeaking, speakWith, rate, voices])

  const changeAutoPlay = useCallback((next) => {
    setAutoPlay(next)
    localStorage.setItem(AUTO_PLAY_KEY, String(next))
    if (next && !isSpeaking) speakWith(rate, activeVoice)
    if (!next && isSpeaking) stop()
  }, [isSpeaking, speakWith, stop, rate, activeVoice])

  return {
    supported, isSpeaking, isPaused, voices, rate, activeVoice, autoPlay,
    toggle, togglePause, changeRate, changeVoice, changeAutoPlay,
  }
}

// Podcast mode narrates every article in a lesson back-to-back, unlike
// useLessonNarration above which is scoped to whichever single article is
// currently on screen inside LessonView. Shares the same rate/voice
// localStorage keys so the preference carries over between the two.
export function useLessonPodcast(lesson) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const chapters = useMemo(() => {
    const list = []
    for (const concept of lesson?.concepts ?? []) {
      for (const activity of concept.activities ?? []) {
        if (activity.type === 'article') list.push({ id: activity.id, conceptTitle: concept.title, article: activity.content })
      }
    }
    return list
  }, [lesson])

  const [chapterIndex, setChapterIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const [rate, setRate] = useState(() => Number(localStorage.getItem(RATE_KEY)) || 1)
  const [voiceName, setVoiceName] = useState(() => localStorage.getItem(VOICE_KEY) || '')
  // Mirrors chapterIndex so the onend handler below (a closure captured at
  // speak time) can tell a stale utterance from the current one — a jumpTo
  // during playback cancels speech, but the cancelled utterance's onend can
  // still fire in some browsers, and it must not double-advance the chapter.
  const chapterIndexRef = useRef(0)
  useEffect(() => { chapterIndexRef.current = chapterIndex }, [chapterIndex])

  useEffect(() => {
    if (!supported) return undefined
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en')))
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [supported])

  const activeVoice = voices.find((voice) => voice.name === voiceName) ?? voices.find((voice) => voice.default) ?? voices[0]

  const speakChapterAt = useCallback((index, nextRate, nextVoice) => {
    if (!supported) return
    const chapter = chapters[index]
    if (!chapter) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(articleToSpeech(chapter.article))
    utterance.rate = nextRate
    if (nextVoice) utterance.voice = nextVoice
    utterance.onend = () => {
      if (chapterIndexRef.current !== index) return
      const next = index + 1
      if (next < chapters.length) {
        chapterIndexRef.current = next
        setChapterIndex(next)
        speakChapterAt(next, nextRate, nextVoice)
      } else {
        setIsSpeaking(false)
        setIsPaused(false)
      }
    }
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false) }
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setIsPaused(false)
  }, [chapters, supported])

  const play = useCallback(() => {
    speakChapterAt(chapterIndex, rate, activeVoice)
  }, [speakChapterAt, chapterIndex, rate, activeVoice])

  const pause = useCallback(() => {
    if (!supported || !isSpeaking) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [supported, isSpeaking])

  const resume = useCallback(() => {
    if (!supported || !isSpeaking) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [supported, isSpeaking])

  const toggle = useCallback(() => {
    if (!isSpeaking) play()
    else if (isPaused) resume()
    else pause()
  }, [isSpeaking, isPaused, play, resume, pause])

  const jumpTo = useCallback((index) => {
    if (index < 0 || index >= chapters.length) return
    chapterIndexRef.current = index
    setChapterIndex(index)
    speakChapterAt(index, rate, activeVoice)
  }, [chapters, rate, activeVoice, speakChapterAt])

  const skipNext = useCallback(() => jumpTo(chapterIndex + 1), [jumpTo, chapterIndex])
  const skipPrevious = useCallback(() => jumpTo(chapterIndex - 1), [jumpTo, chapterIndex])

  const changeRate = useCallback((nextRate) => {
    setRate(nextRate)
    localStorage.setItem(RATE_KEY, String(nextRate))
    if (isSpeaking) speakChapterAt(chapterIndex, nextRate, activeVoice)
  }, [isSpeaking, chapterIndex, activeVoice, speakChapterAt])

  // Kept for parity with useLessonNarration even though v1's modal has no
  // voice picker UI — narration still needs voiceName to resolve activeVoice.
  const changeVoice = useCallback((nextVoiceName) => {
    setVoiceName(nextVoiceName)
    localStorage.setItem(VOICE_KEY, nextVoiceName)
    if (isSpeaking) speakChapterAt(chapterIndex, rate, voices.find((voice) => voice.name === nextVoiceName))
  }, [isSpeaking, chapterIndex, rate, voices, speakChapterAt])

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [supported])

  return {
    supported, chapters, chapterIndex, isSpeaking, isPaused, rate, activeVoice,
    toggle, jumpTo, skipNext, skipPrevious, changeRate, changeVoice,
  }
}
