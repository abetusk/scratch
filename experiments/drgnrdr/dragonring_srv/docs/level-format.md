# Level format

A level is one JSON object.  The game reads it from the level generator
(`LevelGen.generate`) or from a file (Settings → Level → "load level JSON").
Anything that writes this format, a generator or a hand-written file, makes a
playable level.

A small hand-written level: [`example-level.json`](example-level.json).  Check
a file with

```
node levelgen/check.js my-level.json
```

which lists errors (the game refuses the level) and warnings (it loads but
probably plays badly).  The game runs the same check when loading a file.

## Contents

- [Coordinates and units](#coordinates-and-units)
- [Top level](#top-level)
- [terrain](#terrain)
- [water, ceiling](#water-ceiling)
- [streams](#streams)
- [trees](#trees)
- [logs, floaters, pools](#logs-floaters-pools)
- [buildings](#buildings)
- [rocks](#rocks)
- [start, hoops, finish](#start-hoops-finish)
- [path, meta, options](#path-meta-options)
- [Collision: the signed distance](#collision-the-signed-distance)
- [Checks](#checks)
- [Writing a level by hand](#writing-a-level-by-hand)
- [Glossary](#glossary)

## Coordinates and units

```
        +y (up)
         |
         |      +z  (the generator's gully runs this way, start -> finish)
         |     /
         |    /
         |   /
         |  /
         | /
         +----------------- +x
```

- Right-handed, **y up**.  Heights are y.  The ground plan is x (across) and
  z (along).
- Looking along +z, +x is to the **left**.
- Lengths are in plain world units.  For scale: the dragon's collision sphere
  has radius 3, its wingspan is about 9, a house is about 10 wide and 10 tall,
  and full cruising speed is 36 units per second.
- Angles are radians.
- Directions (`n`) are unit vectors `[x, y, z]`.

## Top level

| field | type | required | used by |
|---|---|---|---|
| `format` | `"dragonride-level"` | recommended (warning if missing) | checker |
| `version` | `1` | recommended (warning if missing) | checker |
| `terrain` | object | **yes** | collision, drawing |
| `water` | number | no | drawing |
| `ceiling` | number | no (default: none) | collision |
| `buildings` | array | no (default `[]`) | collision, drawing |
| `rocks` | array | no (default `[]`) | collision, drawing |
| `streams` | array | no (default `[]`) | drawing |
| `trees` | array | no (default `[]`) | collision, drawing |
| `logs` | array | no (default `[]`) | collision, drawing |
| `floaters` | array | no (default `[]`) | collision, drawing |
| `pools` | array | no (default `[]`) | drawing |
| `start` | object | **yes** | game |
| `hoops` | array | **yes** (may be empty) | game |
| `finish` | object | **yes** | game |
| `path` | array of `[x, y, z]` | no | generator checks, preview |
| `length` | number | no | preview |
| `seed` | integer | no | saved-file name |
| `options` | object | no | drawing (`wallHeight`), record of generator options |
| `meta` | object | no | record of generator checks |

Unknown fields are ignored, so tools can add their own.

## terrain

A height grid: the ground surface.  Everything below it is solid.

| field | type | meaning |
|---|---|---|
| `nx`, `nz` | integers ≥ 2 | grid points across (x) and along (z) |
| `cell` | number > 0 | spacing between grid points |
| `x0`, `z0` | numbers | position of the first grid point |
| `heights` | `nx * nz` numbers | ground height y at each point |

Point `(i, j)` (with `0 ≤ i < nx`, `0 ≤ j < nz`) sits at

```
x = x0 + i * cell
z = z0 + j * cell
y = heights[i + nx * j]
```

so `heights` lists one row of constant z after another, starting at `z0`:

```
            i = 0     1     2   ...   nx-1         (x increasing ->)
 j = 0    [  0  ,  1  ,  2  , ... , nx-1      ]     z = z0
 j = 1    [ nx  , nx+1, ...                   ]     z = z0 + cell
 ...
 j = nz-1 [ ...                  , nx*nz - 1  ]     z = z0 + (nz-1)*cell
```

- Between grid points the height is interpolated bilinearly.
- Outside the grid the edge heights continue outward, flat.  The ground is
  only drawn over the grid.
- Each grid square is drawn as two flat-shaded triangles.  Colours come from
  the triangle's slope and height:
  - grass where the slope is gentle and the height is under 8;
  - plateau grass where it is nearly flat and above 0.8 × `options.wallHeight`
    (without `options`, the highest terrain point);
  - banded rock everywhere else.

## water, ceiling

- `water`: height of a flat water surface drawn over the whole terrain grid.
  It shows wherever the ground is lower.  It is not solid: the dragon flies
  through it, and the ground under it is what stops the dragon.  Leave the
  field out for no water.
- `ceiling`: everything above this height is solid, so the dragon cannot climb
  out of the level.  Leave it out for no ceiling.

## streams

Flowing water: rivers, waterfalls, lakes.  Each stream is a ribbon laid along
a chain of points.  Streams are not solid.

| field | type | meaning |
|---|---|---|
| `pts` | two or more `[x, y, z]` | the ribbon's centre line |
| `w` | number, or one number per point | ribbon width |

- The ribbon is level across its width (perpendicular to the centre line,
  seen from above) and follows the centre line's height, so a steep piece
  is a waterfall.
- Drawing: foam stripes run downhill where the ribbon is steep; flat water
  gets a slow sheen.  Put the points a little above the ground (the
  generator uses about 1 above a river channel or a wall face).

## trees

| field | type | meaning |
|---|---|---|
| `x`, `y`, `z` | numbers | foot of the trunk (put `y` a little below the ground) |
| `h` | number > 0 | height |
| `r` | number > 0 | crown radius |
| `kind` | `"pine"`, `"round"`, `"dead"` or `"giant"` | two stacked cones, a ball, a bare trunk with branches, or a giant tree (a thick trunk under a broad crown high up) |
| `tr` | number, optional | trunk radius (default `0.35 + 0.1 r`) |

- Collision: the trunk (radius `0.35 + 0.1 r`, up to `0.9 h`) and an
  ellipsoid crown a little smaller than the drawn one (for dead trees, a
  thin one around the branches).

## logs, floaters, pools

| object | fields | meaning |
|---|---|---|
| each of `logs` | `a`, `b` `[x, y, z]`, `r`, `mat` (`"wood"` or `"stone"`) | a cylinder from `a` to `b` (fallen trunks, roots, limbs, fallen column drums); collision is the capsule |
| each of `floaters` | `c` `[x, y, z]`, `r`, `island` (bool), `axis` `[x, y, z]`, `rate`, `seed` | a floating boulder: drawn lumpy, turning `rate` radians a second about `axis` and bobbing ±0.5; collision a fixed ball of 0.92 `r`.  An island has a flat top at `c.y + r/2` and a bottom drawn out 1.6 times downward |
| each of `pools` | `x`, `y`, `z`, `r`, `lava` (bool) | a flat disc of water or glowing lava; not solid |

## buildings

Each building is a box of walls with a gable roof on top.

| field | type | meaning |
|---|---|---|
| `x`, `z` | numbers | centre of the footprint |
| `y` | number | height of the bottom of the walls; set it a little below the ground so no gap shows on a slope |
| `w` | number > 0 | width along the building's own x axis |
| `d` | number > 0 | depth along the building's own z axis |
| `h` | number > 0 | wall height |
| `roofH` | number ≥ 0 | roof height above the walls |
| `rot` | number | turn about the vertical axis, radians |
| `wall` | integer, default 0 | wall colour, index into 4 colours (wraps around) |
| `roof` | integer, default 0 | roof colour, index into 3 colours (wraps around) |
| `kind` | string, optional | `"stone"` or `"wood"`: a plain block in the stone or wood colour, no door or windows (ruins, bridges, headstones); with `roofH` > 0 it gets a gable roof of the same colour |
| `shape` | `"cyl"`, optional | a round column (diameter `w`) instead of a box, for stone blocks; collision is the cylinder |

Seen from above, with `rot = 0`:

```
          z (building's own z = world z when rot = 0)
          ^
          |   door on this side (+z face)
     +----+----+  -
     |    |    |  |
     |    +----+--|---> x
     |  ridge  |  |  d
     |  along x|  |
     +---------+  -
     |<-- w -->|
```

- The roof ridge runs along the building's x axis, over the middle of `d`.
  The roof overhangs the walls by 0.5 at the gable ends and 0.6 at the eaves.
- The door is on the +z face; windows are on the +z and −z faces.
- `rot` turns the building counter-clockwise seen from above.  The building's
  own +x points along world `(cos rot, 0, −sin rot)`, and its +z along
  `(sin rot, 0, cos rot)`.  This is the same convention as three.js
  `rotation.y`.
- Collision: one box over the footprint `w × d`, from `y` up to
  `y + h + 0.6 × roofH`.  The upper part of the roof and the overhang do not
  collide, which is deliberately forgiving.

## rocks

A rock is a lumpy ellipsoid.  It can have a tunnel cut through it.  Rocks
make arches, tunnels through hills, overhangs and boulders.

| field | type | meaning |
|---|---|---|
| `center` | `[x, y, z]` | centre of the ellipsoid |
| `radii` | three numbers > 0 | half-sizes along x, y, z |
| `bump` | number ≥ 0 | how far the lumps push the surface in or out (at most about ±`bump`/2) |
| `seed` | integer | picks the lump pattern |
| `tunnel` | object, optional | tube cut through the rock |
| `tunnel.r` | number > 0 | tube radius |
| `tunnel.pts` | two or more `[x, y, z]` | the tube's centre line, a chain of straight pieces |
| `kind` | string, optional | a label only (`"arch"`, `"tunnel"`, `"spire"`, `"cap"`, `"ledge"`, `"boulder"` from the generator) |
| `mat` | `"stone"`, optional | drawn in the stone colour instead of the rock colour |

- The tube removes everything within `tunnel.r` of the centre line, and
  only cuts this rock.  Run the centre line a little past both faces of the
  rock so the openings are clean.
- An **arch** is a thin rock (small z radius) across the gully with a short
  tunnel.  A **tunnel** is a long rock with a long tunnel, which can curve.
- Rocks are solid where they overlap the terrain, buildings or each other.
- Drawing: the rock surface is built on a grid of spacing 1.75 (surface nets,
  flat shaded).  It covers the ellipsoid's box plus `bump + 3`, but only
  down to height −4.  Rock below −4 still collides but is not drawn, so keep
  it under the ground there.

## start, hoops, finish

| object | fields |
|---|---|
| `start` | `p` position, `n` facing direction |
| each of `hoops` | `p` centre, `n` direction of travel through the hoop, `r` ring radius |
| `finish` | `p` centre, `n` direction of travel, `r` ring radius |

**Start.** The dragon is placed at `start.p`, facing the horizontal part of
`start.n` with its nose level.  It hovers there until the first pedal
stroke, which also starts the clock.

**Hoops.** A hoop is a ring of radius `r`, measured to the middle of the ring's
tube (the tube itself is 0.45 thick), facing `n`.

```
  side view                       crossing counts when the dragon's centre
                                  passes through the ring's plane
     |  <- hoop (edge-on)         - going the way n points (from the back
     |                              side to the front side), and
  ---+--->  n                     - within r + 1 of the centre p
     |
     |
```

- Any hoop can be taken, in any order, and each counts once.
- The game points to and highlights the *next* hoop: the first one not yet
  taken after the highest-numbered one taken.  So list hoops in the intended
  flying order.
- Flying through backwards (against `n`) does not count.
- "Back to last hoop" (R) puts the dragon 4 units behind the highest-numbered
  hoop taken, facing `n`, or at the start if none is taken.

**Finish.** Crossing the finish the same way ends the run, whether or not
every hoop was taken.  It is drawn as a thicker green ring with a pole and
flag on each side, standing on the ground.

## Session stages

Stages from `levelgen/stages.js` are levels with extra fields the game uses:
`stage` (number), `type` and `label`, `final`, `palette` (color500 index),
`roles` (colours by role) with `rolesPrev` / `rolesNext` and `blend` (colour
blending at the joins), and `river` (the river's x for each terrain row,
for the channel's colour).  A
stage has `start` only if it is the first, `finish` only if it is the last;
its terrain spans `z0 .. z0 + length`.  "save current stage JSON" writes one;
loaded back, it is flown alone.

## path, meta, options

None of these affect play.

- `path`: the line the level was designed around, a list of points.  The
  generator uses it to place buildings clear of the route and to place
  hoops.  The preview draws it.
- `meta`: the generator's report.
  - `pathLength`, `hoops`, `buildings`: counts and length.
  - `minClearance`, `minClearanceAt`: the closest the path comes to any
    solid, and where.
  - `warnings`: list of strings.
- `options`: the generator options the level was made with (see
  `LevelGen.DEFAULTS`).  The game reads only `options.wallHeight`, for
  terrain colours.
- `seed`, `length`: the generator's seed and gully length.

## Collision: the signed distance

All solids together define one function, `LevelGen.sdf(level)(x, y, z)`:
roughly the distance from a point to the nearest solid surface, negative
inside a solid.  The game's collision, the camera and the checker all use
it.  For each kind of solid:

- terrain: height above the ground, corrected for slope;
- ceiling: `ceiling − y`;
- buildings: distance to the collision box (see [buildings](#buildings));
- rocks: approximate ellipsoid distance plus the lumps, with each tunnel
  tube removed.

The value is the smallest of these.

The dragon collides as a sphere of radius `flight.radius` (3 by default).  A
gap narrower than 6 cannot be flown through.  A point is safe for the dragon
when the distance there is at least 3.

## Checks

`LevelGen.validate(level)` (and `node levelgen/check.js`) returns
`{ errors, warnings }`.

Errors (the level is refused):
- a required field is missing or has the wrong type;
- `heights` does not have `nx * nz` values;
- a size or radius is not positive;
- an `n` is not a unit vector (length within 0.01 of 1);
- a tunnel has fewer than two points.

Warnings (the level loads):
- `format` or `version` missing or different;
- the start is closer than 3 to a solid;
- a hoop or finish centre is inside a solid, or its ring reaches into one
  (distance from the centre to the nearest solid is less than `r`).

The checker does not check whether the route can actually be flown.  To fly
a level with the test autopilot (turn and pitch only full on or off, constant
pedalling):

```
node tools/autofly.js my-level.json
```

## Writing a level by hand

[`example-level.json`](example-level.json) is a straight valley 240 long:
- a 9 × 5 height grid (`cell` 30), with walls 40 high either side of a flat
  floor 60 wide;
- two houses and an arch with a tunnel;
- four hoops weaving left and right of the houses, through the arch, to the
  finish.

The autopilot takes all 4 hoops and finishes in about 9 seconds at full
pedalling.

Tips:
- Keep hoop centres at least `r` from any solid, and the route at least 3
  from any solid (more where it turns).
- Set each `n` along the direction of flight.  For a hoop on a curve, use the
  direction from the previous hoop to the next one, normalised.
- Run tunnel centre lines past both faces of the rock, and make
  `tunnel.r` at least about 2 more than the radius of any hoop inside it.
- Building `y` slightly below the lowest ground under the footprint hides
  gaps on slopes.

## Glossary

- **gully**: the valley the generator builds, running along +z.
- **unit vector**: a direction `[x, y, z]` of length 1.
- **signed distance**: distance to the nearest solid surface, negative
  inside a solid.
- **bilinear interpolation**: the height between four grid points, blended in
  x and then in z.
- **surface nets**: the method that turns a rock's signed distance into a
  mesh, one vertex per small grid cell the surface passes through.
- **gable roof**: a two-sided sloping roof with a ridge along the middle.
