Tileset Experiments
===

I believe I can create "two loop" and "acyclic path" from just
local tileset rules but I would like to validate the idea
before proceeding further with other more general tilesets.

Two Loops
---

For "two loops", the idea is to create a tileset that has
tilesets for each of the two paths, call them `a` and `b`.
The tileset can have tees and crosses but to restrict
to only allow paths, the grid should be restricted to only
allow `a` and `b` tiles with exactly two entry points per tile.

To create the "two loops", another tileset is created, one
with a `c` path but that has tees and crosses where the extra
docks are the `c` path.
So, in addition to `a` paths and bends, there are now `a` paths
and bends with `c` docks to make a tee and cross.

---

Well, looks like it works.

Here is the modified tileset:

![twoloop tileset](vexed_twoloop.png)


To replicate the path functionality as described in DeBroglie, one would need to color all paths the same.
They've been colored here for clarity.

The idea is that there are three different colors (plus 'empty').
The grey and orange paths represent the two sides of the loop that you want matched up.
The pink path is the extra path information that can be used to fill in other paths.

During setup, an end tile of each of the grey and orange paths is placed at either corner and
then removed from the rest of the grid, so that only grey and orange walls that have connect
count of 2, for their respective colors, remain.
Other tiles are added to the tileset for grey and orange that connect up with the pink tiles,
but only so that the connect count of 2 is maintained.

Anyway, pretty straightfoward. I don't know how well the solver will do if depending on which type
of constraints get added.

Here's a result:


![twooloop result example](twoloop_example.png)


Acyclic Path
---

The idea here is to create a main `a` path but then add `c` "levels",
so in addition `a` path, there are `c0` docks, which then are themselves
two path docks but with a `c1` tee and cross extra dock.

The tileset doesn't blow up because only the level below it needs to dock
to the one above it but it does need to be cut off, limiting the branching
factor of the acyclic path.

---

The above is just stream of conscious, hopefully there'll be some pretty
pictures to illustrate.

I have a feeling it's going to be a nightmare to debug so I'm trying to create
a tileset that has the `a`, `b` and `c` paths clearly distinguished, which
is the purpose of this sub-directory.

References
---

* [path constraints in debroglie](https://github.com/BorisTheBrave/DeBroglie/blob/master/docs/articles/path_constraints.md)
* [constraints in debroglie](https://github.com/BorisTheBrave/DeBroglie/blob/master/docs/articles/constraints.md)
