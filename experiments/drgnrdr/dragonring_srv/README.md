# Dragon ride

Fly a dragon through a long, generated valley: towns, canyons, highlands,
cave runs and loop-de-loops, through a trail of hoops, for a session of 15,
30, 45 or 60 minutes (or endless).  Pedalling gives thrust; a crank sensor on
an exercise bike (MIDI) or a key / gamepad button stands in for pedal
strokes.

Serve the folder with `python3 tools/serve.py` (also bridges the MIDI sensor,
see Input devices) and open `http://localhost:8989/`.  `?seed=N` picks the
session.

## Sessions (`levelgen/stages.js`, `js/session.js`)

A session is a chain of stages (2400 long by default) generated as the dragon
approaches and dropped behind it.  The landscape is one continuous function:
the valley's centre line (gentle curves, narrowest turn radius about 900),
its floor elevation (rising and falling about ±80), and each stage type's
shape blend across the last / first 12% of neighbouring stages, so joins have
no seams.  Features stay inside each stage:

| type | landscape | flying |
|---|---|---|
| Gully town | floor 120 wide, walls 55 | low (10) through houses on a gentle slalom |
| Deep canyon | floor 70 wide, walls 95 | rock arches to fly through |
| Highlands | open hills, low walls | high (30 with large swells: climbs and dives), rock spires |
| Cave run | floor 100 wide, walls 60 | 2–3 tunnels through hills |
| Spire valley | open valley | rock spires to weave between |
| Cliff basin | floor 160 wide, walls 60 | the floor drops 45–70 at cliff edges into one or two lake basins |
| Waterfall gorge | floor 90 wide, walls 75 | climb three or four steps of 14–24 with waterfalls, then a long descent |
| Mesa climb | open, wide | flat-topped mesas 30–55 high: over the top and dive off the far side |
| Ruined colonnade | floor 120 wide | low (10) between pillar rows and under stone gateways |
| Bridge gorge | floor 76 wide, walls 100 | under (or past) stone bridges; waterfalls down the walls |
| Hoodoo field | open basin | low (12), weaving between capped rock pillars |
| River run | floor 180 wide, mostly water | very low (7) over the water, sea stacks, low bridges |
| Sunken ruins | floor 170 wide, flooded | low (8) past broken pillars, under gateways, drowned houses, stepped temples, broken bridges |
| Slot canyon | floor 34 wide, walls 110 | a narrow twisting slot with boulders wedged overhead |
| Terraced canyon | floor 100 wide, walls 90 | walls in benches of 15 |
| Overhang canyon | floor 80 wide, walls 85 | rock ledges jutting from the walls overhead |
| Cemetery | floor 140 wide | low (9) between low walls, headstones and crosses, mausoleums, dead trees |
| Dune desert | open, 260 wide | over rolling dunes (long backs, steep slip faces), stepped pyramids off to the side |
| Forest | floor 150 wide | low (9) along a corridor through dense pines and round trees |
| Floating stones | a chasm 45 deep | between boulders turning slowly in the air, and flat-topped floating islands with trees |
| Abandoned temples | floor 170 wide | past temples on stepped podiums (ring of columns, inner hall, gabled roof, some fallen in), through a columned hall over the route |
| Swamp | floor 190 wide, water with islands | very low (7) between swamp trees and dead trees, fallen logs |
| Crater field | open, 240 wide | into and out of craters with raised rims, lava or water pools in their bowls |
| Roman columns | floor 140 wide | between long colonnades of round columns with beams on top (gaps, broken shafts), under triumphal arches, past fallen drums and an aqueduct |
| Abandoned village | floor 124 wide | low (10) along streets of roofless houses with broken walls, trees growing among them |
| Old world trees | floor 190 wide | between giant trunks (80–110 tall) with arching roots and great limbs, under high crowns |

Bridges come in five
styles: slab (deck on piers, flown under or high above), stone arch (a wall
across the valley with a round arch), aqueduct (high deck on a row of piers,
flown between two), rope (a sagging plank bridge) and broken (a deck at
flying height with its middle fallen out, flown through the gap).  Bridge
gorges have six of mixed styles; canyons, waterfall gorges and the other
canyon types sometimes have one.  A few trees grow in towns, highlands,
spire valleys, basins, mesas and ruins.

Other stages sometimes get a gentle dip or rise of the floor (20–40).  Rivers
follow the floor, so a cliff in the floor is a waterfall; they widen into lakes
in dips.  The path never climbs or dives steeper than 0.42 (about 23°): at a
cliff edge it dives gradually, and it starts climbing well before a rise.

Stage types follow at random (never the same twice in a row).  The session's
target time picks the last stage: once the end of the stage being built would
be reached after the target (at the recent average speed), that stage ends in
the finish ring.  Sessions end at the target or up to about one stage (1–1.5
minutes) after it.  The next stage is built once the dragon is 30% into the
current one (about 0.3–1 s, a brief hitch on slower machines).

Landscape knobs (Settings → Session → landscape, `config.json` `session`;
changes start a new session): valley `width` (x), `hoopSpacing`, `hoopR`
(hoop size), `wallHeight` (x), `flyHeight` (x), `heightVariety` (x, 0 =
every stage at its type's own height), `curve` (bendiness, x),
`townDensity`, `spires` (per highlands stage, x1.5 in spire valleys),
`stageLength`.  Hoops shrink where walls are close.

Flying height: each stage also picks a height plan by chance: low (the
type's own height, 30%), middle (14–22 higher, among roofs and tree tops,
25%), high (32–50 higher, over everything, 20%) or varying (rising and
falling by up to 25–45 over 500–900, 25%).  Plans blend across joins, scaled
by `heightVariety`.  Trees, buildings and other obstacles are kept clear of
the route in 3D, so a high route passes over a town or forest instead of
through a cleared lane; gateways, halls and arches over the route are built
only where it runs low.

Palettes: each stage takes a color500 palette (bold ones by default) and gives
its colours roles: the three calmest (slightly desaturated) for the land, the
two most saturated for roofs and hoops, the lightest washed toward white for
sky and fog.  Terrain colours, sky and fog blend across stage joins.

## Effects (`js/fx.js`, Settings → Effects, `config.json` `fx`)

Each can be switched off and has parameters.  Rain, snow and lightning change live; the
others are placed when a stage is built, so changing them starts a new
session.

| effect | what | parameters |
|---|---|---|
| bloom | glow around bright parts (in the PSX pass; full resolution with PSX off) | strength, threshold, radius (`psx.bloom*`) |
| rain | streaks around the camera, anchored to the world; small splash rings on the ground in view, out to `splashRange` ahead | chance per stage, amount, speed, length, wind, opacity, colour, splashes (rate, 0 = off), splashRange (default 220) |
| lightning | in rain: a flash every 15 s or so that flickers two or three times and lights the scene; most show a jagged bolt to the ground in the distance, the rest are in the clouds | every (seconds), bolts (share with a bolt), brightness |
| snow | flakes, swaying | chance per stage, amount, speed, size, sway, colour |
| geysers | steam jets from the valley floor, erupting every few seconds | per stage, height, period, colour |
| vents | glowing lava vents trailing dark smoke | per stage, smoke height, glow and smoke colours |
| birds | flocks circling above the valley, flapping | flocks per stage, size, colour |
| critters | small animals hopping on the valley floor | per stage, size, colour |

Each stage gets rain, snow or clear sky by chance; the amount blends across
stage joins.

## Look (`js/psx.js`)

PSX style: the scene renders at 240 lines and is shown with hard pixels;
vertices snap to a coarse screen grid (the wobble); 15-bit colour with 4 × 4
ordered dithering; distance fog.  All in Settings → PSX look and `config.json`
`psx` (`snap` needs a reload).

Fullscreen: F, the panel's "fullscreen", or the gamepad's L3 (browsers only
allow fullscreen after a key press or click).  Credits: Settings → credits.

## Controls

| key | action |
|---|---|
| Up arrow / Space | one pedal stroke (tap; holding does nothing) |
| W / S | nose up / down (panel: invert) |
| A / D, Left / Right | turn left / right |
| I / K, J / L, U / O | force move forward / back, left / right, up / down |
| Shift (hold) | force move 8× faster (`flight.forceBoost`): skim through a level |
| R | back to the last hoop taken |
| Enter | restart: a new session (new seed unless "new seed on restart" is off) |
| P / Esc | pause |
| F | fullscreen |

These are the defaults.  Settings → Keys → "remap keys" lists every action:
click a key to remove it, "+" then a key press to add one (Esc cancels).  A
key belongs to one action only; adding it elsewhere moves it, and the panel
says so.  The help line at the bottom follows the bindings.

Force move ignores walls while held; on release the dragon is eased out of
anything solid.  A hint shows after two seconds pressed against something.

## Config

`config.json` holds every parameter: `seed`, `level` (generator options, see
`LevelGen.DEFAULTS`), `flight` (see Flight), `view` (dragon `model` id, `showRider`, camera, invert pitch,
collision-sphere display), `sky` (`preset` overcast / clear / nightClear / nightOvercast / deck / puffs / dusk / mammatus, `coverage`,
`billow` (round puffs), `variety` (uneven cover), `curl` (warp), `cirrus` (high wisps),
`relief` (mammatus pouch depth), `volumeRes` (mammatus render scale),
`glow` with `sunHeight` / `sunAngle` in degrees (sky sun only), drift `speed`, cloud `scale`, `wind` direction in degrees) and `keys` (action → list of
[`KeyboardEvent.code`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code)
values, e.g. `"KeyW"`, `"ArrowUp"`, `"Space"`).  Missing entries fall back to
the built-in defaults.

Load order: built-in defaults, then `config.json`, then edits made in the
settings panel (saved in the browser).  Panel edits are dropped when
`config.json` changes, so editing the file always takes effect; Settings →
Config → "reset to config.json" drops them by hand.  "export config JSON"
downloads the current settings in the same format, to save as `config.json`.
`?seed=N` in the URL overrides the seed.

Opened as a `file://` page, Firefox reads `config.json` and model files;
Chrome-based browsers block those reads, and the game then uses the
built-in defaults and the teal dragon (Settings → Config and Settings → View
say so).  Serving the folder over HTTP (e.g. `python3 -m http.server`)
works everywhere.

## Files

| file | role |
|---|---|
| `levelgen/levelgen.js` | level generator + signed-distance function; plain script, browser or node, no three.js |
| `levelgen/check.js` | `node levelgen/check.js level.json ...` checks files against the level format |
| `levelgen/cli.js` | `node levelgen/cli.js [seed] [out.json]` writes a level (default `levels/level-<seed>.json`) |
| `levelgen/preview.html` | top-down map and height profile of a level, download as JSON |
| `config.json` | all parameters, read at load |
| `js/devices.js` | MIDI crank sensor and gamepad input |
| `js/input.js` | keyboard bindings; pedal strokes to cadence |
| `js/keymap.js` | key remapping panel |
| `levelgen/stages.js` | session stages: continuous landscape, stage types, features, palettes |
| `js/session.js` | streams stages, collision across joins, hoops across stages, finish timing |
| `js/fx.js` | effects: rain (with splashes on the ground), lightning, snow, geysers, lava vents, birds, critters |
| `js/pixelfont.js` | 5 × 7 pixel font, white with a black outline (stage names) |
| `js/psx.js` | PSX rendering: low resolution, vertex snap, dithered 15-bit colour |
| `tools/autofly-session.js` | node test: autopilot flies a whole session |
| `js/flight.js` | flight model and sphere collision (pure math, runs in node) |
| `js/course.js` | hoop / finish crossing, next hoop, respawn point (pure math) |
| `js/sky-volume.js` | mammatus sky: ray-marched cloud deck with hanging pouches, rendered at reduced resolution as the background |
| `js/sky-deck.js` | volumetric overcast sky (preset `deck`): ray-marched cloud slab from layered alligator noise, lit through from a sun above; own implementation of techniques seen in J. Liard's "Overcast Cloud" shader (no code taken; that shader is CC BY-NC-SA) |
| `js/sky-puffs.js` | volumetric 3D cumulus (preset `puffs`): shape and light depths baked on the GPU into a repeating 3D texture, finer live noise near the camera, multiple-scattering approximation, two-lobe phase, powder term (ideas from weeblabs/nightscape's README; no code taken, that repo has no licence); preset `dusk` adds two coloured lights from opposite sides, core darkening and an ACES tone curve (ideas from Shadertoy msGGRW); own implementation of techniques seen in I. Quilez's "Clouds" shader (no code taken; both references are CC BY-NC-SA, msGGRW by Shadertoy's default) |
| `js/sky.js` | sky dome shader with drifting clouds; presets also set light and fog. Night presets add stars (twinkling), a faint Milky Way and the moon (at the glow direction; `glow` adds a halo). |
| `js/world.js` | meshes: terrain, water, buildings, rocks (surface nets), hoops |
| `js/wingsync.js` | wing beat locked to pedal presses: predicted press rate, timing nudged at each press, waits at the top for a late press, glides when presses stop |
| `js/models.js` | dragon model list; unknown or failing models fall back to the teal dragon |
| `js/models-gltf.js` | dragon models from glTF files: flying clip driven by pedalling, glide pose, rider seated on the back bone |
| `js/dragon.js` | dragon and rider built in code: model `teal-dragon`, the built-in fallback: one animated body tube, bone-chain wings with membrane, hooded rider; one wing beat per two strokes |
| `tools/sky-preview.html` | the sky on its own: look around, sky sliders |
| `tools/sky-sliders.sh` | measures how much each sky slider changes the image, per preset |
| `tools/dragon-preview.html` | the dragon on its own: orbit, cadence / turn / speed sliders |
| `js/game.js` | scene, chase camera, HUD, settings panel |
| `vendor/three-addons/` | three.js r159 GLTFLoader and BufferGeometryUtils, made plain scripts |
| `vendor/models/` | model files, each with its licence; see CREDITS.md |
| `tools/wingsync-test.js` | node test: presses at steady, jittery, speeding-up and slowing-down rhythms; reports how far from the top of the beat each press lands |
| `tools/autofly.js` | node test: autopilot flies levels (seeds or JSON files) with keyboard-style input; wall-ram test |
| `docs/level-format.md` | level format |
| `tools/serve.py` | serves the game and bridges a MIDI sensor (via aseqdump) to it |
| `tools/ffshot.mjs` | headless Firefox screenshots |

## Level format

Full description: [docs/level-format.md](docs/level-format.md), with a small
hand-written example, [docs/example-level.json](docs/example-level.json).
`node levelgen/check.js level.json` checks a file against it; the game runs
the same check when loading a level file.

In short: a height grid (`terrain`), optional `water` and `ceiling`,
`buildings` (boxes with gable roofs), `rocks` (lumpy ellipsoids with optional
tunnels), and the course: `start`, `hoops` (centre, direction of travel,
radius), `finish`.  `LevelGen.sdf(level)` gives the signed distance to the
nearest solid, used by collision and by the generator's checks.

Generation (seeded): a winding gully with banded walls, a river, a few
hills; an arch near the start and a tunnel hill near the end; a town in the
middle.  The path weaves through the town below roof height and runs
through the arch and tunnel; buildings are placed only where they stay at
least `streetClear` from the path; hoops every `hoopSpacing` along the
path, shrunk where walls are close.

## Flight

Thrust = cadence / `cadFull` (capped at 1.3); cruising speed = thrust ×
`vMax`, reached with time constant `spinUp` (faster) or `coast` (slower).
Below `liftSpeed` the dragon sinks, up to `sinkMax`.  It hovers at the start
until the first stroke, which also starts the clock.

Collision: a sphere of `radius`.  On contact it is pushed out along the
surface normal, the velocity component into the surface bounces back
(`bounce`), speed drops by up to `hitSlow` for a head-on hit and less for a
graze, and scraping costs `scrape` per second.  Steering always works, so
turning away gets you off a wall.  All of these are in the panel (Flight).

`node tools/autofly.js 1 2 3` (seeds 1–5, cadence 150 and 90): the autopilot
takes every hoop and finishes; the sphere never goes inside a solid; ramming
a wall at full speed drops speed to about 3 while pushing in, and turning
away regains full speed in about 4 s.  The autopilot is not a human player;
feel needs testing by hand.

## Input devices (`js/devices.js`)

All sources feed the same controls: pedal strokes set the cadence (thrust)
and the wing beat; steering from the gamepad adds to the keys.  Settings are
in `config.json` (`midi`, `gamepad`) and Settings → Devices, which also
shows each device's status.

**MIDI crank sensor.**  The BikeMidi firmware (Arduino Leonardo / Pro Micro,
reed switch or Hall sensor on pin 7) sends note 60 on channel 1 each time
the crank magnet passes.  Each matching note-on is one pulse:

- `device` ("" any input, or an input's name), `note` (-1 any), `channel` (0 any):
  which notes count; "learn note from sensor" sets note and channel from the
  next note received, and "last message" shows every message as it arrives;
- `strokesPerPulse` (default 2): one crank turn is two pedal strokes, so
  72 rpm gives a cadence of about 144 strokes / min, near full thrust at the
  default `flight.cadFull` 150;
- each pulse is one wing beat (the beat locks to the pulse rhythm).

Two ways in (`midi.source`: `auto`, `bridge`, `webmidi`):

- **Bridge (recommended, any browser, no permission prompt):** serve the
  game with `python3 tools/serve.py` (instead of `python3 -m http.server`;
  default port 8989, `--port N`, `--midi 24:0` to pick the ALSA port,
  otherwise the first sensor-like port, found again if re-plugged).  It reads
  notes with `aseqdump` and streams them to the page at `/midi`.  With
  `auto`, the game uses the bridge whenever the page comes from serve.py.
- **Web MIDI** (the browser's own), used by `auto` when there is no bridge:

- Firefox: only on an http(s) page, not `file://` (serve the folder, e.g.
  `python3 -m http.server`, and open `http://localhost:8000/`); accept the
  prompt to install a small site-permission add-on (it appears after the
  first key press or click on the page, or "connect / rescan"; if it does not,
  look for a puzzle-piece icon in the address bar).  Plug the sensor in
  **before** starting Firefox: Firefox on Linux does not notice MIDI devices
  plugged in later, and with no devices it refuses MIDI without a prompt.  The **Snap** Firefox also needs ALSA
  access once: `sudo snap connect firefox:alsa`, then restart Firefox;
  without it Firefox sees no MIDI inputs even though `aseqdump` does.
- Chrome / Edge: also from `file://`.

Leave `device` empty (any input) unless several MIDI devices are connected;
the status line lists the input names Firefox sees.  The device can be plugged in after the page loads; "connect /
rescan" in the panel retries.  The MIDI message on the game screen can be
turned off with Settings → View → "show MIDI message" (`view.showMidiStatus`);
the Devices → MIDI panel still shows the status.  Stage names show on entering
each stage in a pixel font (white with a black outline); Settings → View →
"show stage names" (`view.showStageName`) turns them off.  To see the raw messages:
`aseqdump -p <port>` (see the firmware's `notes`).

**Gamepad** (PlayStation / Xbox controllers with the browser's standard
layout; press a button after plugging in so the browser exposes it):

| control | default |
|---|---|
| steer | left stick (right = turn right, pull back = nose up) |
| pedal (one stroke per press) | cross / A, or R2 |
| force move | right stick (forward / back, left / right), R1 up, L1 down; hold L2 for 8× faster |
| back to last hoop | triangle / Y |
| restart (new session) | options / start |
| fullscreen | L3 (press the left stick) |
| pause | share / back |

Button and axis numbers are lists in `config.json` (`gamepad.pedal`,
`gamepad.reset`, ...; standard numbering: 0 cross, 1 circle, 2 square,
3 triangle, 4 L1, 5 R1, 6 L2, 7 R2, 8 share, 9 options, 12-15 d-pad); also
`deadzone`, `invertTurn`, `invertClimb`; axes `turnAxis`, `climbAxis`,
`forceXAxis`, `forceZAxis` (-1 none).  The view's "invert pitch" applies to
the stick too.

In Settings → Devices → Gamepad every axis is a dropdown, and each action has
two button dropdowns and a "learn" button (press the controller button to
assign it).  "pressed now" lists the buttons and axes the controller is
reporting, to find the numbers for an unusual controller.

## Dragon models

Settings → View → "dragon model", or `view.model` in `config.json`:

| id | model | licence |
|---|---|---|
| `teal-dragon` | built in (`js/dragon.js`); the fallback | this project |
| `mattbas-dragon` | Simple dragon by MattBas, glTF with a flying clip | CC-BY-SA 4.0, credit shown in game; see CREDITS.md |

Adding a glTF model: put the file in `vendor/models/<name>/` with its licence
and add an entry to `FILES` in `js/models-gltf.js` (clip name, bone names for
body, back, neck, head and the two wing tips; rider scale).

## LICENSE

See individual files (for example, `matbas-dragon`) but, unless otherwise explicitely noted, all
source, assets and other artifacts of this project are CC0.


