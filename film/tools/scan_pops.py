"""Scans a render for single-frame pops: a frame that differs from both
neighbours while the neighbours match each other (something appeared or
vanished for exactly one frame). Also lists the fastest-changing moments so
they can be stepped through by hand.

    python tools/scan_pops.py out/devspace-silent.mp4
"""
import subprocess
import sys

import numpy as np

path = sys.argv[1]
W, H = 320, 180
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
fps = 60
d = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))          # d[i] = |f[i+1] - f[i]|
skip = np.abs(frames[2:] - frames[:-2]).mean(axis=(1, 2))      # |f[i+2] - f[i]|

pops = []
for i in range(1, len(frames) - 1):
    a, b, s = d[i - 1], d[i], skip[i - 1]
    if a > 1.5 and b > 1.5 and s < 0.35 * min(a, b):
        pops.append((i, a, b, s))

print(f'{len(frames)} frames')
print(f'single-frame pops: {len(pops)}')
for i, a, b, s in pops:
    print(f'  frame {i} ({i / fps:.3f}s)  in {a:.2f}  out {b:.2f}  skip {s:.2f}')
print('fastest moments (mean abs diff per frame):')
for i in np.argsort(d)[::-1][:12]:
    print(f'  {i / fps:7.3f}s  diff {d[i]:.2f}')
