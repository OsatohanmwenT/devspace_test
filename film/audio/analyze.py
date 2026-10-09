"""Beat grid + drop detection for music, and peak times for SFX.

    python -I analyze.py tracks  wav/track-*.wav
    python -I analyze.py sfx     wav/sfx-*.wav
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import stft, butter, sosfilt


def load(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x, sr


def onset_envelope(x, sr, hop=256):
    f, t, Z = stft(x, sr, nperseg=1024, noverlap=1024 - hop)
    mag = np.log1p(100 * np.abs(Z))
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(axis=0)
    flux = flux - np.convolve(flux, np.ones(16) / 16, mode='same')
    return np.maximum(flux, 0), sr / hop


def tempo_and_phase(env, fps, lo=100, hi=150):
    ac = np.correlate(env - env.mean(), env - env.mean(), mode='full')[len(env) - 1:]
    best = None
    for bpm in np.arange(lo, hi, 0.05):
        lag = 60 / bpm * fps
        # Score the lag and its first few multiples so we lock to the beat, not a sub-division.
        score = sum(np.interp(lag * k, np.arange(len(ac)), ac) / k for k in (1, 2, 4))
        if best is None or score > best[1]:
            best = (bpm, score)
    bpm = best[0]
    period = 60 / bpm * fps
    phases = np.arange(0, period, 0.25)
    sums = [np.interp(np.arange(p, len(env), period), np.arange(len(env)), env).sum() for p in phases]
    return bpm, phases[int(np.argmax(sums))] / fps


def bass_rms(x, sr, hop):
    sos = butter(4, 150, 'low', fs=sr, output='sos')
    b = sosfilt(sos, x)
    n = len(b) // hop
    return np.sqrt((b[: n * hop].reshape(n, hop) ** 2).mean(axis=1)), sr / hop


def find_drop(x, sr, beats, bars=4):
    """Beat where low-end energy over the next `bars` bars jumps most vs the previous `bars` bars."""
    rms, fps = bass_rms(x, sr, 512)
    full = np.sqrt((x[: len(x) // 512 * 512].reshape(-1, 512) ** 2).mean(axis=1))
    span = bars * 4
    best = None
    for i in range(span, len(beats) - span):
        a = int(beats[i - span] * fps); m = int(beats[i] * fps); b = int(beats[i + span] * fps)
        before = rms[a:m].mean() + 1e-6
        after = rms[m:b].mean()
        ratio = after / before
        # Weight by loudness after, so a quiet intro going slightly less quiet doesn't win.
        score = ratio * (full[m:b].mean() / full.max())
        if best is None or score > best[1]:
            best = (i, score, ratio)
    return best


def analyse_track(path):
    x, sr = load(path)
    env, fps = onset_envelope(x, sr)
    bpm, phase = tempo_and_phase(env, fps)
    period = 60 / bpm
    beats = np.arange(phase, len(x) / sr, period)
    i, score, ratio = find_drop(x, sr, beats)
    drop = beats[i]
    # Which beat in the bar? Drops land on a downbeat; report the bar-aligned start.
    return {
        'file': path,
        'duration': round(len(x) / sr, 3),
        'bpm': round(bpm, 2),
        'first_beat': round(phase, 4),
        'beat_period': round(period, 5),
        'drop_time': round(float(drop), 4),
        'drop_beat_index': int(i),
        'bass_jump_ratio': round(float(ratio), 2),
        'usable_after_drop_s': round(len(x) / sr - drop, 2),
        'beats_first_16': [round(float(b), 3) for b in beats[:16]],
    }


def analyse_sfx(path):
    x, sr = load(path)
    a = np.abs(x)
    peak = int(np.argmax(a))
    # Attack onset: first sample above 10% of peak — that's the "hit" the eye syncs to.
    onset = int(np.argmax(a > 0.1 * a[peak]))
    return {
        'file': path,
        'duration': round(len(x) / sr, 3),
        'onset_s': round(onset / sr, 4),
        'peak_s': round(peak / sr, 4),
        'peak_dbfs': round(float(20 * np.log10(a[peak] + 1e-9)), 1),
    }


if __name__ == '__main__':
    mode, files = sys.argv[1], sys.argv[2:]
    fn = analyse_track if mode == 'tracks' else analyse_sfx
    print(json.dumps([fn(f) for f in files], indent=1))
