Auto Tile
===

Some notes on learning from examples for tile generation.
These are mostly 'stream of conscious' and shouldn't be thought
of as having any definitive conclusion or answer.

We aren't trying to solve NP complete problem nor are we trying to solve
the halting problem.
All methods here are purely ad-hoc and are, at best, trying to find a happy
medium of some intuition of heuristics with some supporting mathematics
and algorithms.

The basic premise is, given a game map (no noise, limited palette, grid aligned
tiles, etc), find some representation or analysis that we can learn the 'rules'
used to place the tiles.

We want to learn rules that give the flavor of how the tiles are placed without
being too restrictive.

A first pass is to do neighbor analysis, so catalog all tiles you see, see
which tiles they have as neighbors and then create a constraint list that
only allows tiles that appear next to each other in the exemplar map.
This is the basis of WaveFunctionCollapse (WFC) and works well in many cases.

Unfortunately, using neighbor constraints does not capture longer range correlations
or other, perhaps softer, constraints.

Consider an original legend of Zelda (oLoZ) overworld map.
The graveyard has tombstones that are in a regular grid.
One might want to capture this pattern in realizations of an overworld
map using the tileset.

As a first attempt, we might try to expand a window in a 3x3 region, around
a tombstone, say, and then use that as a kernel to see which other positions
in the original map it appears, cataloging the distances and/or considering
the individual x/y coordinates.

Some notes:

* Too restrictive of a ruleset or distribution will lead to just a reproduction
  of the original map. There needs to be some compromise or tunable parameter
  that allows for a gradation of distribution or constraints
* The fundamental operations are important. Taking translation is imposing
  a type of symmetry, as would be taking rotation, scaling, mirror symmetry,
  etc.

So one idea is to take a window and focus on a particular tile value, say,
and whenever that tile might appear in your new realization, weight/nudge the
neighboring tiles with the template overlaid on the map.

In the belief propagation (BP) context, one could imagine a grid that had longer
ranging `F` functions, imposing template probabilities at longer distances.

One could perhaps use different fundamental operations and window sizes to make
these 'template probabilities'.
For example, maybe the exact (x,y) relative position of dungeons doesn't matter
but their distance does.
Providing a template that has distance constraints (a type of rotation symmetry
I guess?) could work.

---

One more idea is to understand the difference between spatial constraints
and topological constraints.

For example say there's a map in the following:

```
*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
*  .  .  .  .  *  *  .  .  .  .  .  .  .  .  .  .  .  *  *
*  .  .  .  .  *  *  .  .  .  .  .  .  .  .  .  e1 .  *  *
*  .  .  .  .  *  *  .  .  .  .  .  .  .  .  .  .  .  *  *
*  .  .  .  .  *  *  .  .  .  .  .  .  .  .  .  .  .  *  *
*  .  e0 .  .  *  *  .  .  .  .  .  .  .  .  .  .  .  *  *
*  .  .  .  .  *  *  *  *  *  .  *  *  *  *  *  *  *  *  *
*  *  *  |  *  *  *  *  *  *  .  *  *  *  *  *  *  *  *  *
*  .  *  |  *  *  .  .  .  .  .  .  .  .  .  .  .  .  .  *
*  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  *
*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
```

Where `e0` and `e1` are dungeon entrances, `|` are stairs, `*` are rocks and `.` are
ground tiles.

"Topologically" and conceptually we might consider two main routes from `e0` to `e1`, namely:

* `e0 <-> . <-> | <-> . <-> e1`
* `e0 <-> . <-> * <-> . <-> e1`

Among many others, but those are the two most interesting in some sense.

So, to create this topological ordering, we might label regions of contiguous blocks with
labels, so that the first `.` region next to `e0` would be labelled different than the `.`
blocks next to `e1`.
This means the DFA-like diagram makes sense as the left `.` is different from the right `.`.

By finding this DFA/NFA, assuming this doesn't blow up in some sense or has useful information,
gives us a way to potentially pick out the topological constraints embedded in the map.

```

  e0 - .0 - *0 - .1 - e1
        \   /    /
         |0 -----
```

We have to be careful because there's no way to know what are 'admissible' (topological) paths
from `e0` to `e1` without some extra information and we might guess wrong, especially for more
complex maps.

These topological paths can get complex for admissible paths and can be potentially very simple
for inadmissible paths.
For example, in oLoZ, level 1 to level 6 is:

```
l1 - d2 - b0 - d1 - w0 - g3 -s2 - g2 - s1 -g1 - d0 - s0 - g0 - l6`
```

Whereas from level 5 to level 6 (essentially):

```
l6 - g0 - r0 - g5 - l5
```

With the path through the rocks short circuiting many of the complexities of an admissible path.

Even understanding that the level entrances are privileged means that we're incorporating hints.
So maybe it's reasonable to expect that some tiles are earmarked as being traversable so that
topological constraints can be figured out.

---

Anyway, it's a loosing game to make a thing that's all things to all people.

Either having hints as to what's admissible or not or just being happy with the output
and fixing it up in a post processing step might be fine.



