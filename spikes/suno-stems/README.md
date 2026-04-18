# Spike: Suno API Stem Separation

**Goal:** Prove the full upload→extend→separate flow works on an external MP3,
and compare the resulting vocal stem quality against Demucs.

**Cost:** ~$0.22 (10cr file upload/extend + 10cr `separate_vocal`)
**API provider:** sunoapi.org

---

## Setup

```bash
# No npm install needed — uses Node.js built-ins + native fetch (Node 18+)
node --version  # must be 18+
```

## Run

```bash
SUNO_API_KEY=your_key node spikes/suno-stems/run_spike.js
```

Expected runtime: 2–5 minutes (upload + two async API jobs)

---

## What the script does

1. Checks your credit balance (needs ≥ 20 credits)
2. Uploads the MP3 to Suno's file service (base64)
3. Calls `upload-extend` to register the file with Suno → gets `taskId`
4. Polls `record-info` until `audioId` is available
5. Calls `vocal-removal/generate` with `separate_vocal` type → gets stem `taskId`
6. Polls until vocal + instrumental URLs are ready
7. Downloads both stems to `spikes/suno-stems/output/`
8. Writes `spike_results.json`

**Output:**
```
spikes/suno-stems/output/
  suno_vocals.mp3         ← vocal stem from Suno
  suno_instrumental.mp3   ← instrumental stem from Suno
  spike_results.json
```

---

## Pass/fail criteria

- [ ] API key accepted (no 401)
- [ ] Credits sufficient (no 429)
- [ ] File uploads successfully
- [ ] `upload-extend` returns a `taskId`
- [ ] `audioId` available after polling
- [ ] Stem separation completes
- [ ] Both MP3s downloaded and non-zero size

---

## The real test: quality comparison

Once it runs, listen to both on the same section of Fascinated:

| File | Source |
|------|--------|
| `spikes/suno-stems/output/suno_vocals.mp3` | Suno API stems |
| `spikes/demucs/output/slices/vocals_chorus_0.wav` | Demucs htdemucs |

**Questions:**
- Which has less drum/bass bleed?
- Which sounds more natural at full volume?
- Is the difference worth $0.22/seed?

---

## If the script errors

**401 Unauthorized** — API key is wrong or not set correctly
**429 Insufficient credits** — top up at sunoapi.org/billing
**No audioId after polling** — upload-extend may have failed; check `record-info` response in output
**451 Download failed** — Suno couldn't fetch the uploaded file URL; try re-running

---

## Architecture decision pending this spike

| | Demucs | Suno stems |
|---|---|---|
| Cost per seed | $0 | ~$0.22 |
| Quality (bleed) | 14.8dB ACCEPTABLE | TBD |
| Runs on | Your server | Suno's cloud |
| Latency | ~275s CPU | ~2–5 min |

If Suno quality is significantly better → use Suno stems, absorb the $0.22/seed cost.
If quality is similar → stick with Demucs ($0, already proven).
