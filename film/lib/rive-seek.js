// Seekable Rive playback for the film: no state machine, no rAF, no state
// between frames. Every draw builds a fresh artboard instance, sets each
// requested timeline's time directly, applies them in order (later layers
// win), and draws. So draw(t) gives the same pixels however it's reached.
//
// Needs window.rive (vendor/rive.js) loaded first.
//
//   const devy = await RiveSeek.load('assets/devy/all_devy.riv', canvas)
//   devy.draw([{ name: 'entrance_updown_pop', time: 1.2 }, { name: 'blink', time: 0.3 }])

export class RiveSeek {
  static async load(src, canvas, { artboard = null, wasm = 'vendor/rive.wasm' } = {}) {
    window.rive.RuntimeLoader.setWasmUrl(new URL(wasm, document.baseURI).href)
    const r = await window.rive.RuntimeLoader.awaitInstance()
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer())
    const file = await r.load(bytes)
    return new RiveSeek(r, file, canvas, artboard)
  }

  constructor(r, file, canvas, artboardName) {
    this.r = r
    this.file = file
    this.canvas = canvas
    this.artboardName = artboardName
    this.renderer = r.makeRenderer(canvas)
    const probe = this.#artboard()
    const b = probe.bounds
    this.bounds = { minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY }
    // Timeline metadata, in seconds.
    this.timelines = {}
    for (let i = 0; i < probe.animationCount(); i++) {
      const a = probe.animationByIndex(i)
      this.timelines[a.name] = { duration: a.duration / a.fps, fps: a.fps, loop: a.loopValue }
    }
    probe.delete()
  }

  #artboard() {
    return this.artboardName ? this.file.artboardByName(this.artboardName) : this.file.defaultArtboard()
  }

  // layers: [{ name, time, mix = 1 }]. Time is clamped to the timeline for
  // one-shots and wrapped for loops, so callers can pass raw scene time.
  draw(layers) {
    const { r, renderer, canvas } = this
    const artboard = this.#artboard()
    const instances = []
    for (const { name, time, mix = 1 } of layers) {
      const info = this.timelines[name]
      if (!info) throw new Error(`Rive timeline not found: ${name}`)
      const instance = new r.LinearAnimationInstance(artboard.animationByName(name), artboard)
      let local = Math.max(0, time)
      if (info.loop === 0) local = Math.min(local, info.duration)
      else if (info.loop === 1) local %= info.duration
      else {
        // Ping-pong.
        const span = info.duration
        const k = local % (2 * span)
        local = k <= span ? k : 2 * span - k
      }
      instance.time = local
      instance.apply(mix)
      instances.push(instance)
    }
    artboard.advance(0)

    renderer.clear()
    renderer.save()
    renderer.align(r.Fit.contain, r.Alignment.center, { minX: 0, minY: 0, maxX: canvas.width, maxY: canvas.height }, this.bounds)
    artboard.draw(renderer)
    renderer.restore()
    renderer.flush?.()
    r.resolveAnimationFrame?.()

    instances.forEach((instance) => instance.delete())
    artboard.delete()
  }
}
