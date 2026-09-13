import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'

// react-bits.dev's "Lightning" background, ported as-is: a fullscreen WebGL
// triangle running a fractal-noise fragment shader shaped into a vertical
// bolt. No React state drives the animation — iTime just keeps climbing via
// requestAnimationFrame, so props only take effect on remount (this file is
// meant to be mounted for the life of one celebration screen, not tuned live).
const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uHue;
uniform float uXOffset;
uniform float uSpeed;
uniform float uIntensity;
uniform float uSize;

#define OCTAVE_COUNT 10

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

mat2 rotate2d(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float a = hash12(ip);
    float b = hash12(ip + vec2(1.0, 0.0));
    float c = hash12(ip + vec2(0.0, 1.0));
    float d = hash12(ip + vec2(1.0, 1.0));

    vec2 t = smoothstep(0.0, 1.0, fp);
    return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVE_COUNT; i++) {
        value += amplitude * noise(p);
        p *= rotate2d(0.45);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = 2.0 * uv - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    uv.x += uXOffset;

    uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

    float dist = abs(uv.x);
    vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
    vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / max(dist, 0.0001), 1.0) * uIntensity;
    gl_FragColor = vec4(col, 1.0);
}
`

export function Lightning({ hue = 230, xOffset = 0, speed = 1, intensity = 1, size = 1, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 2) })
    const gl = renderer.gl
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    container.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uHue: { value: hue },
        uXOffset: { value: xOffset },
        uSpeed: { value: speed },
        uIntensity: { value: intensity },
        uSize: { value: size },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const { clientWidth, clientHeight } = container
      renderer.setSize(clientWidth, clientHeight)
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height]
    }
    window.addEventListener('resize', resize)
    resize()

    const startTime = performance.now()
    let frameId
    const update = (t) => {
      frameId = requestAnimationFrame(update)
      program.uniforms.iTime.value = (t - startTime) / 1000
      renderer.render({ scene: mesh })
    }
    frameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [hue, xOffset, speed, intensity, size])

  return <div ref={containerRef} className={`h-full w-full ${className}`} aria-hidden="true" />
}
