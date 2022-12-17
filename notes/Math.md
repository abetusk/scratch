Math Scratch
---

[Birkoff algorithm](https://en.wikipedia.org/wiki/Birkhoff_algorithm) to find the set of
permutation matrices that a [doubly stochastic matrix](https://en.wikipedia.org/wiki/Doubly_stochastic_matrix)
can be decomposed into via the [Birkhoff-von Neumann theorem](https://en.wikipedia.org/wiki/Doubly_stochastic_matrix#Birkhoff%E2%80%93von_Neumann_theorem).

A doubly stochastic matrix can be written as a convex combination of no more than $(n-1)^2 + 1$ permutation matricies.

---


$$
T = \frac{\partial E}{\partial S} , P = \frac{\partial E}{\partial V} 
$$

[see](http://www.silcom.com/~aludwig/Physics/QM/Stat_mech_defs.htm)

---


A potential tactic for converting a number partition problem into a belief propagation problem:

Consider $n$ numbers, $a_i \in \mathbb{Z}$.
Choose $m$ primes such that ${\sum}^ {n-1}_ {i=0} a_i < {\prod}_ { k=0 }^{m-1} p_k$.

Construct variables $x_ {i,j} \in \\{ a_i \\% p_j, -a_i \\% p_j \\}$, auxiliary "sum" variable $s_ {a,b,j,u} \in \\{ (0,0), (0,1), \cdots, (0,p_j-1), (1,0), (1,1), \cdots, (1,p_j-1), \cdots (p_j-1,p_j-1) \\}$ and auxiliary "sum transfer" variable  $t_ {j,u} \in \\{ 0, 1, \cdots, p_j-1 \\}$.

We can now construct at least one portion of the sum:

```
  ...
           f_{\alpha}: D \times (D,D) \mapsto \{0,1\}
  x_{a,j} ---
             \              f_{\gamma}: (D,D) \times D \mapsto \{0,1\}
              s_{a,b,j,u} --------------- t_{j,u} ---
  x_{b,j} ---/
           f_{\beta}: D \times (D,D) \mapsto \{0,1\}
  ...

```

With $x _ {a,j}$ and $x_{b,j}$ being random variables that have the integral modular domain ( $\\{ 0,1,\cdots,p _ j-1 \\}$ ),
the $s _ {a,b,j,u}$ random variable having domain $\\{ (0,0),(0,1),(0,2),\cdots,(0,p _ j-1),(1,0),(1,1),(1,2),\cdots,(p _ j-1,p _ j-2),(p _ j-1,p _ j-1) \\}$
(at level $u$)
and the final $t _ {j,u}$ having domain $\\{ 0,1,\cdots,p _ j-1 \\}$.

The $s _ {a,b,j,u}$ variable is essentially a Cartesian product of the two inputs ( $x _ {a,j}$ , $x _ {b,j}$ ) with
$f _ {\gamma}$ and the subsequent $t _ {j,u}$ doing the actual modular sum, converting from the Cartesian
product domain back to the original modular integral domain.

By structuring it in this way, there are three functions that allow pairwise consideration and result in modular summation.

For example, here is a simple example for the prime $3$:

| $x _ {a,j}$ | $s _ {a,b,j,u}$ | $f _ {\alpha}$ |   | $x _ {b,j}$ | $s _ {a,b,j,u}$ | $f _ {\beta}$ |
|-----------|---------------|--------------|---|-----------|---------------|-------------|
| $0$       |  $(0,0)$      |   $1$        |   |   $0$     |   $(0,0)$     |  $1$        |
| $1$       |  $(0,0)$      |   $0$        |   |   $1$     |   $(0,0)$     |  $0$        |
| $2$       |  $(0,0)$      |   $0$        |   |   $2$     |   $(0,0)$     |  $0$        |
| $0$       |  $(0,1)$      |   $1$        |   |   $0$     |   $(0,1)$     |  $0$        |
| $1$       |  $(0,1)$      |   $0$        |   |   $1$     |   $(0,1)$     |  $1$        |
| $2$       |  $(0,1)$      |   $0$        |   |   $2$     |   $(0,1)$     |  $0$        |
| $0$       |  $(0,2)$      |   $1$        |   |   $0$     |   $(0,2)$     |  $0$        |
| $1$       |  $(0,2)$      |   $0$        |   |   $1$     |   $(0,2)$     |  $0$        |
| $2$       |  $(0,2)$      |   $0$        |   |   $2$     |   $(0,2)$     |  $1$        |
| $0$       |  $(1,0)$      |   $0$        |   |   $0$     |   $(1,0)$     |  $1$        |
| $1$       |  $(1,0)$      |   $1$        |   |   $1$     |   $(1,0)$     |  $0$        |
| $2$       |  $(1,0)$      |   $0$        |   |   $2$     |   $(1,0)$     |  $0$        |
| $0$       |  $(1,1)$      |   $0$        |   |   $0$     |   $(1,1)$     |  $0$        |
| $1$       |  $(1,1)$      |   $1$        |   |   $1$     |   $(1,1)$     |  $1$        |
| $2$       |  $(1,1)$      |   $0$        |   |   $2$     |   $(1,1)$     |  $0$        |
| $0$       |  $(1,2)$      |   $0$        |   |   $0$     |   $(1,2)$     |  $0$        |
| $1$       |  $(1,2)$      |   $1$        |   |   $1$     |   $(1,2)$     |  $0$        |
| $2$       |  $(1,2)$      |   $0$        |   |   $2$     |   $(1,2)$     |  $1$        |
| $0$       |  $(2,0)$      |   $0$        |   |   $0$     |   $(2,0)$     |  $1$        |
| $1$       |  $(2,0)$      |   $0$        |   |   $1$     |   $(2,0)$     |  $0$        |
| $2$       |  $(2,0)$      |   $1$        |   |   $2$     |   $(2,0)$     |  $0$        |
| $0$       |  $(2,1)$      |   $0$        |   |   $0$     |   $(2,1)$     |  $0$        |
| $1$       |  $(2,1)$      |   $0$        |   |   $1$     |   $(2,1)$     |  $1$        |
| $2$       |  $(2,1)$      |   $1$        |   |   $2$     |   $(2,1)$     |  $0$        |
| $0$       |  $(2,2)$      |   $0$        |   |   $0$     |   $(2,2)$     |  $0$        |
| $1$       |  $(2,2)$      |   $0$        |   |   $1$     |   $(2,2)$     |  $0$        |
| $2$       |  $(2,2)$      |   $1$        |   |   $2$     |   $(2,2)$     |  $1$        |

That is, the $f _ {\alpha}$ and $f _ {\beta}$ are only "true" when the inputs match the corresponding
entry in the Cartesian product domain.

Now we can map back to the original domain and do the modular summation with $f _ {\gamma}$:

| $s _ {a,b,j,u}$ | $t _ {j,u}$ | $f _ {\gamma}$ |   | $s _ {a,b,j,u}$ | $t _ {j,u}$ | $f _ {\gamma}$ |   | $s _ {a,b,j,u}$ | $t _ {j,u}$ | $f _ {\gamma}$ |
|---------------|-----------|--------------|---|---------------|-----------|--------------|---|---------------|-----------|--------------|
| $(0,0)$       |   $0$     |    $1$       |   |  $(0,0)$      | $1$       | $0$          |   |  $(0,0)$      | $2$       | $0$          |
| $(0,1)$       |   $0$     |    $0$       |   |  $(0,1)$      | $1$       | $1$          |   |  $(0,1)$      | $2$       | $0$          |
| $(0,2)$       |   $0$     |    $0$       |   |  $(0,2)$      | $1$       | $0$          |   |  $(0,2)$      | $2$       | $1$          |
| $(1,0)$       |   $0$     |    $0$       |   |  $(1,0)$      | $1$       | $1$          |   |  $(1,0)$      | $2$       | $0$          |
| $(1,1)$       |   $0$     |    $0$       |   |  $(1,1)$      | $1$       | $0$          |   |  $(1,1)$      | $2$       | $1$          |
| $(1,2)$       |   $0$     |    $1$       |   |  $(1,2)$      | $1$       | $0$          |   |  $(1,2)$      | $2$       | $0$          |
| $(2,0)$       |   $0$     |    $0$       |   |  $(2,0)$      | $1$       | $0$          |   |  $(2,0)$      | $2$       | $1$          |
| $(2,1)$       |   $0$     |    $1$       |   |  $(2,1)$      | $1$       | $0$          |   |  $(2,1)$      | $2$       | $0$          |
| $(2,2)$       |   $0$     |    $0$       |   |  $(2,2)$      | $1$       | $1$          |   |  $(2,2)$      | $2$       | $0$          |

Again, all this is a complicated way to do modular arithmetic under the language of MRF with these pairwise functions between random variables.

In other words, $f _ {\alpha}$ and $f _ {\beta}$ take the inputs and convert them to a Cartesian product, $(w,z)$ which then gets transferred to $t$ via $f _ {\gamma} = ( w + z ) \\% p$.
