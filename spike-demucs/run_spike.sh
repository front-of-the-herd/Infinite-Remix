#!/usr/bin/env bash
# =============================================================================
# SPIKE: Demucs stem separation
# Source file: _Fascinated___Company_B__retro-remix_.mp3
#
# What this proves:
#   1. Demucs installs and runs on your machine
#   2. Vocal stem is clean enough to play directly at peak phases
#   3. Total processing time is acceptable for a seed-submission UX
#   4. Output format (WAV, sample rate) is compatible with Web Audio API
#
# Run from the project root:
#   chmod +x spikes/demucs/run_spike.sh
#   ./spikes/demucs/run_spike.sh
# =============================================================================

set -euo pipefail

SEED="test/seeds/_Fascinated___Company_B__retro-remix_.mp3"
OUT="spikes/demucs/output"
RESULTS="spikes/demucs/spike_results.json"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC} $1"; }

echo ""
echo "════════════════════════════════════════════"
echo "  Demucs Stem Separation Spike"
echo "════════════════════════════════════════════"
echo ""

# --- Prerequisites check ---
info "Checking prerequisites..."

command -v python3 >/dev/null || fail "python3 not found"
command -v ffmpeg  >/dev/null || fail "ffmpeg not found"
python3 -c "import demucs" 2>/dev/null || fail "demucs not installed. Run: pip install demucs"
python3 -c "import torch"  2>/dev/null || fail "torch not installed. Run: pip install torch"
pass "All prerequisites present"

# --- Input check ---
[[ -f "$SEED" ]] || fail "Seed file not found at $SEED"
pass "Seed file found: $(du -sh "$SEED" | cut -f1)"

mkdir -p "$OUT"

# --- Step 1: Run Demucs htdemucs model (4-stem: vocals, drums, bass, other) ---
echo ""
info "Running Demucs htdemucs (4-stem)..."
info "Model: htdemucs — best quality, ~300MB download on first run"
info "This will take 1–3 minutes on CPU, 20–40s on GPU..."
echo ""

START_TIME=$(date +%s)

python3 -m demucs \
  --two-stems vocals \
  --out "$OUT" \
  --mp3 \
  --mp3-bitrate 320 \
  "$SEED"

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

pass "Demucs completed in ${ELAPSED}s"

# --- Step 2: Locate output files ---
# Demucs outputs to: $OUT/htdemucs/<filename without ext>/
TRACK_NAME=$(basename "$SEED" .mp3)
STEMS_DIR="$OUT/htdemucs/$TRACK_NAME"

[[ -d "$STEMS_DIR" ]] || fail "Expected stems dir not found at $STEMS_DIR"

VOCALS_FILE="$STEMS_DIR/vocals.mp3"
NO_VOCALS_FILE="$STEMS_DIR/no_vocals.mp3"

[[ -f "$VOCALS_FILE" ]]    || fail "vocals.mp3 not found"
[[ -f "$NO_VOCALS_FILE" ]] || fail "no_vocals.mp3 not found"
pass "Stem files found"

# --- Step 3: Convert to 48kHz WAV for Web Audio API compatibility ---
info "Converting stems to 48kHz WAV (Web Audio API target format)..."

VOCALS_WAV="$OUT/vocals_48k.wav"
INSTRUMENTAL_WAV="$OUT/instrumental_48k.wav"

ffmpeg -y -i "$VOCALS_FILE"    -ar 48000 -ac 2 "$VOCALS_WAV"       2>/dev/null
ffmpeg -y -i "$NO_VOCALS_FILE" -ar 48000 -ac 2 "$INSTRUMENTAL_WAV" 2>/dev/null

pass "WAV conversion complete"

# --- Step 4: Measure stem quality metrics ---
echo ""
info "Measuring stem quality..."

measure_vol() {
  ffmpeg -i "$1" -af volumedetect -f null - 2>&1 | grep mean_volume | awk '{print $5}'
}

measure_dur() {
  ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$1" | xargs printf "%.1f"
}

VOCALS_VOL=$(measure_vol "$VOCALS_WAV")
INSTRUMENTAL_VOL=$(measure_vol "$INSTRUMENTAL_WAV")
VOCALS_DUR=$(measure_dur "$VOCALS_WAV")
ORIGINAL_VOL=$(ffmpeg -i "$SEED" -af volumedetect -f null - 2>&1 | grep mean_volume | awk '{print $5}')

echo ""
echo "  Source:       ${ORIGINAL_VOL} dB mean"
echo "  Vocals stem:  ${VOCALS_VOL} dB mean   (${VOCALS_DUR}s)"
echo "  Instrumental: ${INSTRUMENTAL_VOL} dB mean"

# --- Step 5: Bleed test ---
# Check if vocals.mp3 has significant low-frequency content (drum/bass bleed indicator)
# A clean vocal stem should have minimal sub-100Hz energy
info "Running bleed test (low-freq energy in vocal stem)..."

LF_VOL=$(ffmpeg -i "$VOCALS_WAV" -af "highpass=f=80,lowpass=f=200,volumedetect" -f null - 2>&1 | grep mean_volume | awk '{print $5}')
HF_VOL=$(ffmpeg -i "$VOCALS_WAV" -af "highpass=f=1000,volumedetect" -f null - 2>&1 | grep mean_volume | awk '{print $5}')

echo ""
echo "  Vocal stem low-freq (80-200Hz):  ${LF_VOL} dB  ← bass/drum bleed range"
echo "  Vocal stem high-freq (>1kHz):    ${HF_VOL} dB  ← actual vocal range"

# Calculate bleed ratio
BLEED_DELTA=$(python3 -c "
lf = float('${LF_VOL}') if '${LF_VOL}' else -60
hf = float('${HF_VOL}') if '${HF_VOL}' else -60
delta = hf - lf
if delta > 15:
    verdict = 'CLEAN — minimal bleed'
elif delta > 8:
    verdict = 'ACCEPTABLE — some bleed'
else:
    verdict = 'BLEED DETECTED — stems may sound muddy'
print(f'{delta:.1f}dB delta → {verdict}')
")
echo "  Bleed verdict: $BLEED_DELTA"

# --- Step 6: Slice vocal stem at Song DNA timestamps ---
info "Slicing vocal stem at Song DNA section timestamps..."
mkdir -p "$OUT/slices"

declare -A SLICES=(
  ["intro_0"]="0 16"
  ["verse_0"]="16 48"
  ["chorus_0"]="48 80"
  ["verse_1"]="80 112"
  ["chorus_1"]="112 144"
  ["bridge_0"]="144 176"
  ["chorus_2"]="176 240"
  ["outro_0"]="240 316.8"
)

for name in intro_0 verse_0 chorus_0 verse_1 chorus_1 bridge_0 chorus_2 outro_0; do
  read start end <<< "${SLICES[$name]}"
  duration=$(python3 -c "print($end - $start)")
  ffmpeg -y -ss $start -t $duration \
    -i "$VOCALS_WAV" \
    -af "afade=t=in:st=0:d=0.2,afade=t=out:st=$(python3 -c "print($duration-0.2)"):d=0.2" \
    "$OUT/slices/vocals_${name}.wav" 2>/dev/null
  size=$(du -sh "$OUT/slices/vocals_${name}.wav" | cut -f1)
  echo "  ✓ vocals_${name}.wav  (${start}s–${end}s)  ${size}"
done

# --- Step 7: Summary ---
echo ""
echo "════════════════════════════════════════════"
echo "  SPIKE RESULTS"
echo "════════════════════════════════════════════"
echo ""

TOTAL_SIZE=$(du -sh "$OUT" | cut -f1)
SLICES_COUNT=$(ls "$OUT/slices/" | wc -l | tr -d ' ')

pass "Demucs ran successfully"
pass "$SLICES_COUNT vocal slices created with 200ms fade in/out"
pass "All stems at 48kHz stereo — Web Audio API compatible"
echo ""
echo "  Processing time:  ${ELAPSED}s"
echo "  Output size:      $TOTAL_SIZE"
echo "  Stems dir:        $STEMS_DIR"
echo "  WAV stems:        $OUT/"
echo "  Slices:           $OUT/slices/"
echo ""

# --- Step 8: Write JSON results for CLAUDE.md ---
cat > "$RESULTS" << JSONEOF
{
  "spike": "demucs-stem-separation",
  "model": "htdemucs",
  "mode": "--two-stems vocals",
  "source_file": "$SEED",
  "processing_time_s": $ELAPSED,
  "status": "PENDING_MANUAL_REVIEW",
  "stems": {
    "vocals":       { "file": "$VOCALS_WAV",       "mean_vol_db": $VOCALS_VOL },
    "instrumental": { "file": "$INSTRUMENTAL_WAV",  "mean_vol_db": $INSTRUMENTAL_VOL }
  },
  "bleed_test": {
    "low_freq_80_200hz_db": "$LF_VOL",
    "high_freq_1khz_plus_db": "$HF_VOL",
    "verdict": "$BLEED_DELTA"
  },
  "slices_created": $SLICES_COUNT,
  "slice_dir": "$OUT/slices/",
  "manual_checks": [
    "Listen to vocals_chorus_0.wav — does the vocal sound isolated and clean?",
    "Listen to vocals_verse_0.wav — is it natural enough to play at a Peak phase?",
    "Listen to instrumental_48k.wav — does it sound full without the vocal?",
    "Compare Demucs vocals vs Suno stem separation (next spike) on same file"
  ]
}
JSONEOF

pass "Results written to $RESULTS"
echo ""
echo "  Next: open $OUT/slices/vocals_chorus_0.wav and listen."
echo "        That's the file that will play at Peak phase."
echo ""
