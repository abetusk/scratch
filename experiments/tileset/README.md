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
