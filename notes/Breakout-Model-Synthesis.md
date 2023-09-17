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

Definition
---

We concern ourselves with finding realizations a three dimensional array grid, with each grid site consisting
of labels constrained to a discrete domain and rules for pairing neighboring labels.

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

Where ${\bf V}$ is the set of variables, ${\bf D}$ is the domain of each variable and $f_{i,j}(\cdot,\cdot)$ is the
constraint function.

From a given grid size, $n$, a domain of admissible tile values, $D$ and the constraint function, $f_{i,j}(\cdot,\cdot)$,
we want to find a valid realization.
That is, find ${\bf V_s}$:

$$
\begin{array}{ll}
{\bf V_s }  = & ( v_0 = d_{v_0}, v_1 = d_{v_1}, \cdots, v_{n-1} = d_{v_{n-1}} ) \\
s.t. & \prod_{i,j} f_{i,j}( v_i, v_j ) > 0
\end{array}
$$

It will be convenient for us to define a translation between the linear dimension, $n$, to three dimensional grid positions by
defining a grid wise dependent conversion function, $\text{pos}(i) = (i_x, i_y, i_z)$.
When clear, it will be implied that $(i_x, i_y, i_z) = \text{pos}(i)$.
Since we are restricting ourselves to a three dimensional grid, the constraint function $f_{i,j}(\cdot, \cdot)$
is only defined for neighboring grid lattice points ($(\text{pos}(i) - \text{pos}(j)) \in \{ (\pm 1, 0, 0), (0, \pm 1, 0), (0, 0, \pm 1) \}$).

An additional local potential function $g_i(\cdot)$ can be used to weight domain values at different locations.

-- boundary conditions discussion

Max Gumin's Wave Function Collapse (WFC) has been used to solve problems in this domain.
Briefly, WFC works by repeatedly choosing a variable position with minimum entropy, assigning it a value and propagating constraints.
The process is repeated until all variables are fixed or until a contradiction is encountered.


We present a WFC algorithm with an additional feature that it be confined to a block, which will be justified later in the paper:

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




```
/* BREAKOUT-MODEL-SYNTHESIS algorithm */

Create an initial prefatory arc consistent model $M = M_0$ (if no such model exists, fail)

Repeat $T_{mix}$ times {

  /* BLOCK-POSITION phase */
  Choose a block of size $w$, at base position $p$, $B_w(p)$, of cells to modify

  /* BLOCK-REALIZE phase */
  Repeat until a valid configuration is found or a maximum $T_B$ tries has been made {

    Find a realization of tiles in cells contained in $B_w$, propagating constraints to the cells outside of $B_w$ and store in M'
    If M' is arc consistent, M = M' and break

  }

  If no valid realization of block $B_w$ could be found from the previous step {
    /* SOFTEN phase */
    Restore block $B_w$ to its prefatory state and restore all block neighbors, $B_{nei}$, to their prefatory state
		Restore the grid into its previous state
		Restore all cells within the soften window $B_s$ to its prefatory state, using $B_w$ as its center
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
