# Spike: Suno V5 Drift Vocal Generation

**Goal:** Prove Suno V5 can generate a convincing drift vocal segment in the style
of Fascinated — with custom Claude-written lyrics — that would work after the
original chorus in the Section Conductor's drift phase.

**Cost:** ~10 credits (one generate call)
**No file upload needed** — pure text-to-music generation.

---

## Run

```bash
SUNO_API_KEY=your_key node spikes/suno-vocal/run_spike.js
```

Expected runtime: 2–3 minutes.

---

## What it generates

A ~30s vocal track with:
- **Style:** hi-nrg, freestyle, 80s dance, female soprano, heavy reverb/delay
- **Lyrics:** Claude-written verse + chorus on Fascinated themes (desire, longing,
  dance floor chemistry) — AABB rhyme scheme, medium-high syllable density
- **Model:** V5, `vocalGender: f`, `weirdnessConstraint: 0.3` (cycle 1 — stays
  close to seed)

This is exactly what would play during the **Drift phase** of the Section Conductor,
after the original Fascinated chorus vocal at the Peak phase.

---

## Pass/fail criteria

### Must pass
- [ ] Generation completes without error
- [ ] `drift_vocal_cycle1.mp3` downloaded and non-zero size
- [ ] Generation time logged in `spike_results.json`

### Quality check (listen manually)
- [ ] Voice is female soprano — matches Fascinated timbre
- [ ] Custom lyrics are actually sung (not Suno's auto-generated ones)
- [ ] Style feels hi-nrg / 80s freestyle
- [ ] Would work after hearing the original Fascinated chorus
- [ ] Quality good enough to mix with Lyria instrumental bed

### Timing check
- [ ] Generation time < 16s → fits inside breakdown phase window (ideal)
- [ ] Generation time 16–60s → needs earlier pre-generation trigger (acceptable)
- [ ] Generation time > 60s → need to pre-generate 2 phases ahead (still workable)

---

## Output

```
spikes/suno-vocal/output/
  drift_vocal_cycle1.mp3   ← the drift segment to listen to
  spike_results.json        ← timing, audioId, all metadata
```

---

## Why this spike matters

This is the actual critical path for Phase 3. The stem separation saga was a
detour — we already have Demucs for that. What we needed to prove is that Suno
can:

1. Accept custom lyrics from Claude
2. Generate vocals in the right style from a text prompt
3. Do it fast enough to fit the Section Conductor's breakdown window
4. Sound good enough that the listener wants to keep listening

If all four are true, Phase 3 Suno integration is straightforward.
