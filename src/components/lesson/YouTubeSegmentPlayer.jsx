import { useEffect, useRef, useState } from 'react'

const API_SRC = 'https://www.youtube.com/iframe_api'
let apiPromise = null

// Loads the YouTube IFrame Player API script once per page, however many
// segment players end up on screen — every caller awaits the same promise.
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = API_SRC
    script.onerror = () => reject(new Error('Failed to load the YouTube player API'))
    document.head.appendChild(script)
    window.setTimeout(() => reject(new Error('Timed out loading the YouTube player API')), 8000)
  })
  return apiPromise
}

// Plays exactly one bounded segment of a YouTube video inside the lesson's
// existing video card — cues to `startSeconds`, polls playback while
// running, and pauses itself the instant it reaches `endSeconds`. Falls back
// to a plain "open on YouTube" link if the API never loads; the article text
// around it already stands on its own without the video.
export function YouTubeSegmentPlayer({ videoId, startSeconds, endSeconds, title }) {
  const mountRef = useRef(null)
  const playerRef = useRef(null)
  const pollRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return
        playerRef.current = new YT.Player(mountRef.current, {
          videoId,
          playerVars: { start: startSeconds, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => { if (!cancelled) setStatus('ready') },
            onError: () => { if (!cancelled) setStatus('error') },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                window.clearInterval(pollRef.current)
                pollRef.current = window.setInterval(() => {
                  const current = playerRef.current?.getCurrentTime?.() ?? 0
                  if (current >= endSeconds) {
                    playerRef.current.pauseVideo()
                    window.clearInterval(pollRef.current)
                    if (!cancelled) setEnded(true)
                  }
                }, 250)
              } else {
                window.clearInterval(pollRef.current)
              }
            },
          },
        })
      })
      .catch(() => { if (!cancelled) setStatus('error') })

    return () => {
      cancelled = true
      window.clearInterval(pollRef.current)
      playerRef.current?.destroy?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-mounts fresh per videoId/segment via the `key` the caller sets
  }, [])

  const replaySegment = () => {
    setEnded(false)
    playerRef.current?.seekTo(startSeconds, true)
    playerRef.current?.playVideo()
  }

  if (status === 'error') {
    return (
      <div className="grid w-full max-w-[82ch] gap-3 rounded-[20px] bg-[#1a1a1a] px-6 py-10 text-center">
        <p className="m-0 text-[#f4f4f2] text-[15px]">Video unavailable here.</p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="justify-self-center rounded-xl border border-[#5c5c60] px-4 py-2 text-[14px] font-semibold text-[#f4f4f2] hover:border-[#6699ec]"
        >
          Open video on YouTube
        </a>
      </div>
    )
  }

  return (
    <div className="grid w-full max-w-[82ch] gap-2.5">
      <div className="relative overflow-hidden rounded-[20px] bg-black aspect-[16/9]">
        {status === 'loading' && (
          <div className="absolute inset-0 grid place-items-center text-[13px] text-[#9a9a9d]" aria-live="polite">Loading video…</div>
        )}
        <div ref={mountRef} className="h-full w-full" title={title} />
      </div>
      {ended && (
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={replaySegment} className="min-h-9 rounded-full border border-[#5c5c60] px-3.5 text-[13px] font-semibold text-[#f4f4f2] hover:border-[#6699ec]">Replay segment</button>
          <a href={`https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`} target="_blank" rel="noreferrer" className="min-h-9 inline-flex items-center rounded-full border border-[#5c5c60] px-3.5 text-[13px] font-semibold text-[#f4f4f2] hover:border-[#6699ec]">Watch full video</a>
        </div>
      )}
    </div>
  )
}
