# Spike: Demucs Stem Separation

**Goal:** Prove that Demucs can separate "Fascinated" into a clean vocal stem and
instrumental, at zero API cost, with output compatible with the Section Conductor.

**Cost:** $0. No API key needed.

---

## Setup (one-time)

```bash
# 1. Python 3.10+ required (3.12 is fine)
python3 --version

# 2. Install demucs — pulls in torch automatically (~2GB first install)
pip install demucs

# 3. Verify
python3 -c "import demucs; print('ok')"
```

> First run downloads the `htdemucs` model weights (~300MB). Subsequent runs use
> the cache.

---

## Run

```bash
# From project root:
./spikes/demucs/run_spike.sh
```

Expected runtime:
- CPU (M2 MacBook): ~90s
- CPU (Intel): ~3–4 min
- GPU (CUDA): ~20s

---

## What the script does

1. Runs `demucs --two-stems vocals` on the seed MP3
2. Converts both stems to 48kHz stereo WAV (Web Audio API target)
3. Measures mean volume and bleed (low-freq energy in vocal stem)
4. Slices the vocal stem at Song DNA timestamps with 200ms fade in/out
5. Writes `spike_results.json`

**Output:**
```
spikes/demucs/output/
  vocals_48k.wav           ← full vocal stem, 48kHz WAV
  instrumental_48k.wav     ← full instrumental, 48kHz WAV
  slices/
    vocals_intro_0.wav
    vocals_verse_0.wav
    vocals_chorus_0.wav    ← most important: play this at Peak phase
    vocals_verse_1.wav
    vocals_chorus_1.wav
    vocals_bridge_0.wav
    vocals_chorus_2.wav
    vocals_outro_0.wav
  htdemucs/                ← raw demucs MP3 output
```

---

## Pass/fail criteria

### Must pass
- [ ] Script completes without error
- [ ] `vocals_48k.wav` and `instrumental_48k.wav` exist
- [ ] Both files are 48000 Hz stereo (confirmed by ffprobe)
- [ ] All 8 slices created

### Quality check (listen manually)
- [ ] `vocals_chorus_0.wav` — vocal sounds isolated, no obvious drum/bass bleed
- [ ] `instrumental_48k.wav` — sounds full and musical without the vocal
- [ ] The 200ms fades prevent clicks at slice boundaries
- [ ] Vocal is natural enough that you'd want to hear it at a Peak phase

### Bleed verdict interpretation
The script prints a bleed delta (high-freq dB minus low-freq dB in the vocal stem):
- **> 15dB** — Clean. Drums and bass are well-separated.
- **8–15dB** — Acceptable. Some rumble but won't dominate.
- **< 8dB**  — Bleed detected. Worth comparing against Suno stems or trying `htdemucs_6s` model.

---

## If quality is insufficient

Try the 6-source model (slower, cleaner):
```bash
python3 -m demucs --two-stems vocals --name htdemucs_6s \
  --out spikes/demucs/output_6s \
  test/seeds/_Fascinated___Company_B__retro-remix_.mp3
```

Or test full 4-stem separation to get drums/bass/other separately:
```bash
python3 -m demucs \
  --out spikes/demucs/output_4stem \
  test/seeds/_Fascinated___Company_B__retro-remix_.mp3
# outputs: vocals.mp3, drums.mp3, bass.mp3, other.mp3
```

---

## Next spike

Once this passes: compare Demucs vocal quality vs Suno API stem separation on the
same file. Run both and listen. Whichever sounds cleaner at `vocals_chorus_0` is
the stem pipeline to use in Phase 1.

See `spikes/suno-stems/` (pending API key).

---

## Architecture decision

| | Demucs | Suno stems |
|---|---|---|
| Cost per seed | $0 | $0.22–0.54 |
| Runs on | Your server (or local) | Suno's cloud |
| Stem quality | Research-grade | Reported as "bleeding" |
| 12-stem option | Yes (`htdemucs`) | Yes (`split_stem`) |
| Needs API key | No | Yes |
| First-run latency | ~90s (model download) | ~30–60s |
| Subsequent runs | ~90s on CPU | ~30–60s |

Recommendation: use Demucs for Phase 1 development. Add Suno stems as a quality
comparison in Phase 2 once you have an API key.
