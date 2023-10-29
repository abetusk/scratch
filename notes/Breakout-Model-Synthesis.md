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

Repeat $T_{max}$ times {

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

#### WIP

Abstract
---

Tile based algorithms are a method for procedural content generation, often using
exemplar scenes to infer placement constraints for novel output generation.
Wave Function Collapse (WFC) and Modify in Place Model Synthesis (MMS) are both recent tools used for procedural
generation, creating novel output with minimal instruction, but have limitations involving size and initial problem setup.

In this paper we present a new algorithm called "breakout model synthesis" (BMS) used to create 2D and 3D designs from small example model inputs.
Breakout model synthesis combines ideas from the WFC and MMS algorithms to overcome the limitations of each.
Our solution allows for large instance sizes to be realized with minimal assumption about the initial state.

BMS starts from an initial indeterminate state and progressively fixes sub-blocks until a configuration is realized,
reverting the block and surrounding neighbors to an initial state if no solution can be found.
The concept of an arc consistent influence radius is introduced with a consideration on its impact on problem difficulty and block sizing choice.

We present results of large scale runs of BMS, compare them to the challenges that MMS and WFC encounter
and focus on certain constrained models that highlight the drawbacks of MMS and WFC with a discussion of how
BMS can overcome them..

      
 1. starting sentence on who/what area would use it. why.     
 2. abstract: refer to idea sources by name... "ideas from Wave Function Collapse (Gumin) and from modify-in-place Model Synthesis (Merrell)..." - consider not having Gumin, Merrell at all.     
 3. "overcome the limiations of each. Our solution allows for large instances to be realized with minimal assumption.."     
 4. one sentence on radius. "We introduce the concept of 'influence radius' and demonstrate how it is used to solve large instances."     
 5. remove "finally", and make results more prominent in abstract. "We present results of large scale runs of BMS compared to MMS and WFC, and examples of challenging tilesets that we can solve."     
      


Definition
---

We concern ourselves with finding realizations of three dimensional array grids, with grid site
values chosen from a discrete domain and a constraint function indicating which value pairs are admissible.
 
A simplified Constraint Satisfaction Problem (CSP)
can be used for our purposes by defining
a triple $<{\bf V}, {\bf D}, f>$, where:

$$
\begin{array}{ll}
{\bf V} = & (v_0, v_1, \cdots, v_{n-1}) \\
{\bf D} = & (d_0, d_1, \cdots, d_{m-1}) \\
f_{i,j} ( d_a, d_b ) = & \begin{cases} 
  1 & \text{if } v_i = d_a, v_j = d_b \text{ is an admissible pairing } \\
  0 &\text{otherwise}
\end{cases}
\end{array}
$$

Where ${\bf V}$ is the set of variables, ${\bf D}$ is the domain of
allowable values each variable can take and $f_{i,j}(\cdot,\cdot)$ is the constraint function.
During the coarse of the algorithms presented in this paper, the variable domains can be restricted,
removing entries when they would lead to a contradictory state.
To represent the currently admissible domain values for variable $v_i$, $D_i$ will be used.

We will also use the notation $v_i[k]$ to deonte the domain value referenced by the index position
$k$ of remaining domain values for variable $v_i$.
For example, if $v_3 = (d_0, d_3, d_7, d_15)$, then $v_3[2]$ would  hold the value $d_7$.


From a given grid size, $n$, a domain of admissible tile values, $D$, and the constraint function, $f_{i,j}(\cdot,\cdot)$,
we want to find a valid realization.
That is, find ${\bf V_s}$:

$$
\begin{array}{ll}
{\bf V_s }  = & ( v_0 = (d_{v_0}), v_1 = (d_{v_1}), \cdots, v_{n-1} = (d_{v_{n-1}) } ) \\
s.t. & \prod_{i,j} f_{i,j}( v_i[0], v_j[0] ) > 0
\end{array}
$$

It will be convenient for us to define a translation between the linear dimension,
$n$, to three dimensional grid positions by
defining a grid wise dependent conversion function, $\text{pos}(i) = (i_x, i_y, i_z)$.
When clear, it will be implied that $(i_x, i_y, i_z) = \text{pos}(i)$.
Since we are restricting ourselves to a three dimensional grid, the constraint function $f_{i,j}(\cdot, \cdot)$
is only defined for neighboring grid lattice points ($(\text{pos}(i) - \text{pos}(j)) \in \{ (\pm 1, 0, 0), (0, \pm 1, 0), (0, 0, \pm 1) \}$).

An additional local potential function $g_i(\cdot)$ can be used to weight domain values at different locations.
It is assumed that $g_i(\cdot)$ will get renormalized as the variable $v_i$ has its domain values restricted.

The concept of arc consistency is used for constraint propagation
to help guide search for solutions.

---

A variable $v_i$ is said to be arc consisent ($AC(\cdot,\cdot)$) with respect to $v_j$ if for every remaining value
that $v_i$ can hold, there exists a value in $v_j$:

$$
\begin{array}{ll}
\text{AC}(v_i, v_j) \to & \forall d \in D_i, \exists d' \in D_j  \\
s.t. & f_{i,j}(d,d') = 1
\end{array}
$$

--OR--

A variable $v_i$ is said to be arc consisent ($AC(\cdot)$) if, for every neighbor of $v_i$,
there exists an admissible value that can be paired with it:

$$
\begin{array}{ll}
\text{AC}(v_i) \to \\
\forall d \in D_i, & \forall v_j \in \text{Nei}(v_i) \\
\exists d' \in D_j  & s.t. \ \ f_{i,j}(d,d') = 1
\end{array}
$$


---

We call a model arc consistent if every neighboring cell is arc consistent:

$$
\text{AC}(M) \iff \text{AC}(v_i,v_j), \forall i, j \in \text{Nei}(i) \\
$$

Note that a model in an arc consistent state need not have a realizable solution.
Arc consistency only provides a guarantee that there is no realizable configuration
if arc consistency if violated.

The general process of constraint propagation is used to remove impossible values to limit
search space.
There is a balance between work done to make progress towards a solution and doing
brute search.
Arc consistency, in particular the AC3 algorithm,
which will be discussed later,
provide a good balance between computation cost and reducing the search space.

Previous Algorithms
---

The AC-3 algorithm can be stated as:

```
S = ( v_{i_0} )
While |S| > 0:
  v_i \in S
  S = S / v_i
  \forall v_j \in Nei(v_i):
    remove d \in D_i if no support is found in D_j
    if D_i changed, S = S \cup v_i
```

-- boundary conditions discussion

Paul Merrell's work on Model Synthesis, and since popularized by Max Gumin's Wave Function Collapse (WFC),
has been used to solve problems in this domain.
Briefly, WFC works by repeatedly choosing a variable position with minimum entropy, assigning it a value and propagating constraints.
The process is repeated until all variables are fixed or until a contradiction is encountered.


We present a WFC algorithm with an additional feature that it be confined to a block, which will be discussed later:

```
/* GUMIN-BLOCK-WAVE-FUNCTION-COLLAPSE */
Input:
  block window $B_w(p) = \{ v_j | p_x \le j_x < (p_x + w), p_y \le j_y < (p_y + w), p_z \le j_z < (p_z + w) \}$

While there's a viable cell to be chosen in $B_w(p)$:

	Choose a cell $i$ restricted to a block window $B_w(p)$ with minimum entropy:
		$i = \text{argmin}_{q \in B_w(p) } \left( - \sum_{d \in D_q } g_q(d) \right)$
		$d = \text{argmax}_{c \in D_i } g_i(c)$
		$v_i = (d)$
    $U = U \cup { \text{Nei}(i) }$

	Propagate constraints:
    For $u \in U$:
      remove any tiles in $v_u$ that don't have at least one $f_{u,u'}(d_u, d_{u'}) = 1$
      remove any tiles in $v_{u'}$ that don't have at least one $f_{u',u}(d_{u'},d_u) = 1$
			if $u$ or $u'$ had any tiles removed, add them to $U$
    if any variable has an empty support ($|v_k| = 0$), return False

return True
```

WFC is limited in its ability to process large models because of its "one-shot" nature, resulting in a failure on encountering
any contradiction.
Various methods have been proposed to overcome this limitation, including restart and retry, stitching and backtracking.
Each of these methods has limitations, with a failure to find realizations for large models and tile sets.

The Modify in Place Model Synthesis algorithm, which we will refer to as MMS for the remainder of
the paper,
can be used to realize large models by breaking portions of the model into smaller blocks and running WFC on overlapping
and new portions.
MMS considers a block chosen from a block schedule, originally proposed to sequentially walk through the map at a stride
that allows for block overlap to stitch blocks together.
If the block region considered can't find a realization up to a retry limit, restore the map to its previous known good
state and move on to the next block.

---XXX
MMS's choice of blocks overcomes the limitation of site specific Monte Carlo Markov Chain methods.
Often constraints have a radius of influence and only altering a single site can run into the potential
of getting trapped in a local minima without 
---XXX

A drawback of MMS is that it needs the model to be in a fully realized state for MMS to begin processing.
This has a few implications:

* A fully realized initial state must be made which might be non-obvious or labor intensive to create
* If the block size is too small, MMS might get trapped in a solution basin, unable to sample from the
  space of viable solutions because of its inability to breakout from the local minima it's trapped in
* The initial state might bias the solution or cause mixing times to become long


To overcome these limitations, we propose a new algorithm called Breakout Model Synthesis (BMS).

Breakout Algorithm
---

BMS starts by creating a prefatory state by saving the model configuration after boundary conditions
and user specified constraints have been propagated.
BMS then attempts to realize a block, accepting the block if its a valid realization.
If BMS's attempt at finding a block can't be done within it's block retry limit, it goes into a SOFTEN
stage, returning a soften block window size back to its prefatory state.
BMS keeps trying blocks and softening until it reaches a global iteration limit or until it finds a realization,
whichever comes first.

After a cell has been altered to restrict its domain, constraint propagation is run on the cell
and its neighbors to put it into an arc consistent state.
Many grid configurations and tile sets exhibit a finite arc consistent influence radius, with
the constraint propagation limited to a certain spatial extent after alteration.
Though arc consistency doesn't imply a realizable configuration, arc inconsistency
implies a non-realizable configuration.

By choosing the soften window to encompasses an arc consistent influence radius,
there is the potential to relax an over constrained section by resetting it to its prefatory state.
The soften step allows BMS to potentially recover from getting trapped into a cycle of processing
a single block until the iteration limit has been exceeded.

There is a balance between retry limit, block window size and soften window size.
If the retry limit is too small or block size is too large, block WFC might have trouble
finding a block level realization.
If the soften size is too large or retry limit too small, BMS might not make enough
progress to overcome the damage done by the SOFTEN stage.


```
/* BREAKOUT-MODEL-SYNTHESIS algorithm */

Create an initial prefatory arc consistent model $M = M_0$ (if no such model exists, fail)

Repeat $T_{max}$ times {

  /* BLOCK-POSITION phase */
  Choose a block of size $w$, at base position $p$, $B_w(p)$, of cells to modify

  /* BLOCK-REALIZE phase */
  Repeat until a valid configuration is found or a maximum $T_B$ tries has been made {

    Find a realization of tiles in cells contained in $B_w$, propagating constraints to the cells outside of $B_w$ and store in M'
    If M' is arc consistent, M = M' and break

  }

  If no valid realization of block $B_w$ could be found from the previous step {
    /* SOFTEN phase */
		Restore the grid into its previous state
		Restore all cells within the soften window $B_s$ to its prefatory state
    propagate constraints throughout the grid as necessary
  }

}
```

Some notes:

* Block size and soften size need not be the same
* Block size can be chosen smaller than the soften size but if the soften size is chosen smaller than
  the influence radius, the algorithm can get trapped in a local minima
* To avoid the possibility of getting trapped in a local minima, randomness can be added to the block schedule
  choice to minimize the chance of repeatedly choosing the same block
* The grid can have hysteresis, remembering tiles that were impossible with a previous configuration that are
  potentially now possible with a newer configuration

From experimentation, choosing a block schedule of maximum block entropy has worked well, focusing on regions
that have a wholly unrealized part or portions of the grid that are undetermined.
To further guard against cycles of choosing the same block in a constrained system, noise can be added to help randomize
block choice.

Arc Consistent Influence Radius
---

* For oloz
* For pm
* For stair
* For end tiles
* For mu forest
* for train?

Results
---

* oloz comparison (MMS/BMS)
* mu forest comparison (MMS/BMS)

Comparison
---

| Algorithm | Small Map (Constrained Tile Set) | Large Map (Constrained Tile Set) | Required Ground State | Basin Trap | Can Fail |
|-----------|----------------------------------|----------------------------------|-----------------------|------------|----------|
| WFC       | yes                              | no                               | no                    | no         | yes      |
| MMS       | yes                              | yes                              | yes                   | yes        | no       |
| BMS       | yes                              | yes                              | no                    | no         | yes      |

#### WIP

CRUFT
---

It will be convenient for us to define a translation between the linear dimension, $n$, to 3D grid positions by
defining a grid wise dependent conversion function, $\text{pos}(i) = (i_x, i_y, i_z)$.


Here we describe the problem using a Markov Random Field represented by an undirected graph $G = ({ \bf V}, { \bf E})$.
Nodes ${ \bf V } = (V_0, V_1, \cdots, V_{n-1})$
are discrete random variable, each of which has discrete domain $D = (d_0, d_1, \cdots, d_{m-1})$ with ${ \bf E }$ the set of edges.
The joint wise potential is given by a function $f_{i,j}( x_i, x_j ) \in \mathbb{R}$ and a local potential $g_i (x_i) \in \mathbb{R}$.

One formulation allows us to concern ourselves with the probability:

$$
P( {\bf V} = {\bf v}) = \frac{1}{Z} \left( \prod_{ (i,j) \in {\bf E} } f_{i,j} (v_i, v_j) \right) \left( \prod_{ i =0}^{n-1} g_i(v_i) \right)
$$

$Z$ is a renormalization constant which may be difficult to calculate directly.

In particular, we are concerned with configurations such that:

$$
P( {\bf v} ) > 0
$$

A more general approach could talk about edges allowing arbitrary connections but this paper will solely focus
on edges in a 3D grid configuration, with 2D configurations taken as a special case.

A block will be a subset of vertices, $B \subset V$ that,
for our purposes, will be chosen to be axis
aligned and defined by a window size $w$:

$$
B_w(x,y,z) = \{ X_i | (v_x,v_y,v_z) = \text{pos}(i), x \le v_x < (x+w), y \le v_y < (y+w), z \le v_z < (z+w) \}
$$

$$
B_s( { \bf v_0 }) = \{ X_i | { \bf v }_i = \text{pos}(i), {\bf 0 } \le {\bf v}_i < {\bf v}_0 + {\bf w} \}
$$

For a given pair of neighboring 



A point wise evidence for node 



A realization of the grid is an assignment of each of the nodes ${ \bf x } = (x_0, x_1, \cdots, x_{n-1})$ 
For a realization 


nodes and a Markov Random Field that
 of $n$ discrete random variables, ${ \bf X } = (X_0, X_1, \cdots, X_{n-1}),
gives a pairwise potential function.
T
We define a probability function using
For convenience, we define a probability function in terms of
a list of vertices, $V, |V| = n$, each of which we assign a random variable ${ \bf X } = (X_0, X_1, \cdots, X_{n-1})$, each of which can assume a value from
a given domain, $D = (d_0, d_1, \cdots, d_{m-1})$:

$$
P( v_0, v_1, \cdots, v_{n-1} ) = \frac{1}{Z} \prod_{i,j} f_{i,j} (v_i, v_j) 
$$

we d
Here we define the problem in terms of a graphical model using a Markov Random Field (MRF).

Given a set of $n$ vertices, $V$, with an associated random variable, $v \in V,  X_v$,
and edges connection the vertices, $E$, we define a graph, $G(V,E)$.
For each $X_v$, there is a domain, $D_v = (d_0, d_1, \cdots, d_{m_v-1}$ with a function $g_v(\cdot) \in \mathbb{R}$.
For each edge, $(u,v) \in E$, there is an associated function $f_{u,v}(\cdot,\cdot) \in \mathbb{R}$.

$$ G(V,E), \ \ \  |V| = n, \ \ \ x_i \in D = \{ d_0, d_1, \cdots, d_{m-1} \}  $$

$$
i \in V \to g_i(\cdot) \in \mathbb{R}
$$

$$
(i,j) \in E \to f_{i,j}( \cdot, \cdot ) \in \mathbb{R}
$$

* $x_i$ represents the value of vertex $i$.
* $g_i(x_i)$ is the mapping of vertex $i$ with value $x_i$
* $f_{i,j}(x_i,x_j)$ is the mapping of the connected vertex $i$ and $j$
  with values $x_i$ and $x_j$, respectively

For our purposes, the graph is a 2D or 3D grid, with the domain, $D$, $g(\cdot)$ and $f_{u,v}(\cdot,\cdot)$ being
independent of position.

We further constrain:

$$
\sum_{d \in D} g(d) = 1 \\
$$

We can define a probability distribution function over the construction via:

$$
p(X) = \frac{1}{Z} \prod_{c \in \text{clique}(G)} \phi_c(x_c)
$$

For 3D grids, this amounts to:

$$
p(X) = \prod_{u \in V} \prod_{v \in N(u)} f_{u,v} (X_u, X_v)
$$

Where $N(u)$ is the set of neighbors of vertex $u$.
In our case:

$$
\begin{array}{ll}
N(u) = \{ & (u_x + 1, u_y, u_z), (u_x - 1, u_y, u_z ) \\
 & (u_x , u_y + 1, u_z), (u_x , u_y -1 , u_z ) \\
 & (u_x , u_y , u_z + 1), (u_x , u_y , u_z - 1) \}
\end{array}
$$

With the understanding that vertices past the boundary are treated with a fixed value or are removed appropriately.

We are concerned with finding a value of $X = (X_0, X_1, \cdots, X_{|V|-1})$ such that:

$$
p(X) > 0
$$

Such a realization is called admissible.



---

All content, unless specifically stated otherwise, is licensed under CC0 license.

LICENSE: CC0




References
---

* [arc consistency](https://www.sciencedirect.com/topics/computer-science/arc-consistency#:~:text=Definition%2013.2,variable%20pairs%20are%20arc%20consistent.)
* [AC-3 on Wikipedia](https://en.wikipedia.org/wiki/AC-3_algorithm)
* [Example-Based Model Synthesis by Paul Merrell](https://paulmerrell.org/wp-content/uploads/2022/03/model_synthesis.pdf) ([model synthesis](https://paulmerrell.org/model-synthesis/))
* [infinite wfc](https://marian42.de/article/infinite-wfc/)
