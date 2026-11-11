#!/bin/sh
# Render the sky preview with each sky slider at its low and high end
# (everything else at defaults, clouds frozen), then report how much of
# the sky changes: mean absolute difference (0..255) and the share of
# pixels that change by more than 12.
#
#   sh tools/sky-sliders.sh [outdir] [preset]
#
out=${1:-shots/sliders}
preset=${2:-overcast}
mkdir -p "$out"
steps=""
for kv in coverage:0.5:0.95 billow:0:1 variety:0:1 curl:0:1 cirrus:0:1 glow:0:1.2 scale:0.6:2 relief:0.3:2; do
  k=${kv%%:*}; r=${kv#*:}; lo=${r%%:*}; hi=${r#*:}
  for v in $lo $hi; do
    s="document.querySelector('.lil-gui').style.display='none';Object.assign(SKYP.S,DR.SKY_DEFAULTS,{speed:0,preset:'$preset'});SKYP.S.$k=$v;SKYP.set();SKYP.look.yaw=Math.PI;SKYP.look.pitch=0.45;'$k=$v'"
    steps="$steps${steps:+|||}$s"
  done
done
node tools/ffshot.mjs "file://$PWD/tools/sky-preview.html" "$out/s.png" 2000 900 500 "$steps" >/dev/null 2>&1
python3 -I - "$out" <<'PY'
import sys, numpy as np
from PIL import Image
d = sys.argv[1]
names = ["coverage", "billow", "variety", "curl", "cirrus", "glow", "scale", "relief"]
for i, n in enumerate(names):
    a = np.asarray(Image.open(f"{d}/s_{2*i}.png").convert("RGB"), dtype=float)
    b = np.asarray(Image.open(f"{d}/s_{2*i+1}.png").convert("RGB"), dtype=float)
    sky = slice(0, int(a.shape[0] * 0.75))
    diff = np.abs(a[sky] - b[sky]).mean(axis=2)
    print(f"{n:9s} mean diff {diff.mean():6.1f}   pixels changed {100 * (diff > 12).mean():5.1f}%")
PY
