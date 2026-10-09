"""Builds the film's soundtrack from the cue sheet the page exports.

    node tools/page-eval.mjs devspace.html > audio/cues.json
    python tools/mix.py audio/cues.json out/mix.wav

Music: Cat Walk (Mixkit #371), trimmed so its drop (88.604 s) lands on film
beat 32. Each SFX is placed so its measured onset (or peak, for swells) hits
the cue time. The mix is loudness-normalised to -14 LUFS.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'

TRACK = AUDIO / 'tracks' / '371.mp3'
TRACK_START = 73.835   # track time at film t=0 (track beat 159)
MUSIC_GAIN = 0.85

cues = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
out = Path(sys.argv[2])
duration = cues['duration']
measured = {Path(m['file']).stem.removeprefix('sfx-'): m for m in json.loads((AUDIO / 'sfx.json').read_text())}

# The page reports how much intro precedes the original film start.
TRACK_START -= cues.get('musicOffset', 0)
inputs = ['-ss', f'{TRACK_START}', '-t', f'{duration + 0.5}', '-i', str(TRACK)]
filters = [f'[0:a]aresample=48000,volume={MUSIC_GAIN}[m]']
labels = ['[m]']
for i, c in enumerate(cues['sfx'], start=1):
    m = measured[c['name']]
    offset = m['peak_s'] if c['align'] == 'peak' else m['onset_s']
    start = c['t'] - offset
    trim_in = 0.0
    if start < 0:          # can't start before the film: trim the head instead
        trim_in, start = -start, 0.0
    inputs += ['-i', str(AUDIO / 'sfx' / f"{c['name']}.mp3")]
    chain = f'[{i}:a]aresample=48000'
    if trim_in or c.get('dur'):
        end = f":end={trim_in + c['dur']}" if c.get('dur') else ''
        chain += f',atrim=start={trim_in}{end},asetpts=PTS-STARTPTS'
    if c.get('dur'):
        chain += f",afade=t=out:st={max(0, c['dur'] - 0.12)}:d=0.12"
    delay = int(round(start * 1000))
    chain += f",volume={c['gain']},adelay={delay}|{delay}[s{i}]"
    filters.append(chain)
    labels.append(f'[s{i}]')

filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:dropout_transition=0,atrim=end={duration}[out]")
raw = out.with_name(out.stem + '.raw.wav')
cmd = ['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters), '-map', '[out]', '-ac', '2', '-c:a', 'pcm_f32le', str(raw)]
subprocess.run(cmd, check=True)

# Two-pass loudnorm: measure, then apply linearly so the mix lands on -14 LUFS exactly.
TARGET = 'I=-14:TP=-1:LRA=11'
probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(raw), '-af', f'loudnorm={TARGET}:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
stats = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
second = (f"loudnorm={TARGET}:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}"
          f":measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-af', second, '-c:a', 'pcm_s16le', str(out)], check=True)
raw.unlink()
print(f'wrote {out} (pre-norm {stats["input_i"]} LUFS)')
