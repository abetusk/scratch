Breakout Model Synthesis
===

These are rough notes for a nascent idea of an extension to Merrell's Model Synthesis (MMS) algorithm
for more general classes of models, including some that might be constrained in particular ways.
The following discussion is still rough, untested and unimplemented, but are provided here for future
reference.

---

---

A modification to Merrell's Model Synthesis (MMS) algorithm, called Breakout Model Synthesis (BMS).

Some terms:

* A "tolerated" state is one in which the model is arc consistent.

* A "wildcard" grid is a model which has a full tile choice for every cell.

* A "prefatory" state is one in which boundary and any other initial constraints have been propagated on a wildcard grid.

* A "realization" of a set of cells, in a block, say, is one in which every cell in question has exactly one tile
  and is arc consistent both within the block and within the model the block potential resides in.

* A "cell" is a position in the grid, potentially having many tiles.


A rough overview of the algorithm is provided:

```
/* BREAKOUT-MODEL-SYNTHESIS algorithm */
Create an initial prefatory arc consistent model $M = M_0$ (if no such model exists, fail)

Repeat $T_{mix}$ times {

  /* BLOCK-POSITION phase */
  Choose a block, $B$, of cells to modify

  /* BLOCK-REALIZE phase */
  Repeat until a valid configuration is found or a maximum $T_B$ tries has been made {

    Find a realization of tiles in cells contained in $B$, propagating constraints to the cells outside of $B$ and store in M'
    If M' is arc consistent (aka valid), M = M' and break

  }

  If no valid realization of block $B$ could be found from the previous step {
    /* SOFTEN phase */
    Restore block $B$ to its prefatory state and restore all block neighbors, $B_{nei}$, to their prefatory state
    propagate constraints into and out of the prefatory state
  }

}

If $M$ is
```

Note that for simplicity, block $B$ is assumed to have the same span in each dimension and
$B_{nei}$ is also assumed to have the same span in each dimension, though the size of $B$ and $B_{nei}$ need
not be the same.
That is, $B$ is assumed to be a cube (square) as is $B_{nei}$ assumed to be a cube (square), though the
size of the cube (square) for $B$ and $B_{nei}$ need not be the same.

The above algorithm is only a slight modification from MMS but differs in a key factor that
allows the initial state of the grid to not be in a fully realized state.
Relaxing the initial configuration of the grid allows for potentially complex initial conditions
and inference on models that might have rules where an initial realization might be non trivial
or tedious to discover.

The `SOFTEN` phase potentially allows BMS to recover from a contradictory state.

One assumption is that there is a fundamental "realization size", $S_V$, for any given tile set where, given a grid or block within
a larger grid, the chance of finding a valid realization is almost surely impossible for a block or grid larger than $S_V$.
Another assumption is that there is a fundamental "constraint propagation radius", $R_C$, at play, where any given cell
with a realized tile will not have a significant effect beyond $R_C$ cells (potentially measured in Manhattan distance).
In the `SOFTEN` phase, the 
neighbor block dimensions, $\max(\dim(B_{nei}))$, should be chosen such that $\max(\dim(B_{nei})) > 2 \cdot R_C$ to allow
the neighboring blocks to take on values unaffected by potentially poisonous choices from the block, $B$, in question.
The block size, $\max(\dim(B))$,  should be chosen so that $\max(\dim(B)) < S_V$ so that there is a non negligible chance
of being able to find a valid block realization in the `BLOCK-REALIZE` phase.

Note that $S_V$ and $R_C$ might have different values depending on boundary conditions, such as the choosing blocks near
the edge of the grid, or boundary conditions from a partial realization of the grid.
$S_V$ and $R_C$ might not even exist depending on the tile set or grid configuration.
Practically, $S_V$ will also be dependent on the algorithm to resolve the $B$ block.
For simplicity, $S_V$ and $R_C$ are assumed to exist and be fixed, even though this is almost surely not true in the general
case.


This independence assumption is perhaps true for many typical tile sets and configurations but can easily be violated for
intentional choices of tile sets or special configurations.
NP-Completeness should be considered the norm in this domain so the best one should hope for is solutions to typical
cases, both in choice of tile sets and configurations.

Block position choice (in the `BLOCK-POSITION` phase) can be chosen to fit the domain in question but perhaps some reasonable
choices are:

* Pick the block with the lowest entropy as measured by the tile choice and probabilities
* Pick a random block
* Pick blocks from a fixed set, say with overlapping regions as in MMSs original algorithm

Taking lowest entropy with a random power law factor to add noise might work well in practice.

By allowing indeterminate state in the initial grid, this potentially allows BMS to find realizations from
tile sets that have longer reaching or global constraints that MMS would not be able to realize.

---

All content, unless specifically stated otherwise, is licensed under CC0 license.

LICENSE: CC0




References
---

* [arc consistency](https://www.sciencedirect.com/topics/computer-science/arc-consistency#:~:text=Definition%2013.2,variable%20pairs%20are%20arc%20consistent.)
* [AC-3 on Wikipedia](https://en.wikipedia.org/wiki/AC-3_algorithm)
* [Example-Based Model Synthesis by Paul Merrell](https://paulmerrell.org/wp-content/uploads/2022/03/model_synthesis.pdf) ([model synthesis](https://paulmerrell.org/model-synthesis/))
