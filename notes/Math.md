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
Choose $m$ primes such that $\sum_{i=0}^{n-1} a_i < \prox_{k=0}^{m-1} p_k$.

Construct variables $x_{i,j} \in \{ a_i \% p_j, -a_i \% p_j \}$, auxiliary "sum" variable
$s_{a,b,j,u} \in \{ (0,0), (0,1), \cdots, (0,p_j-1), (1,0), (1,1), \cdots, (1,p_j-1), \cdots (p_j-1,p_j-1) \}$
and auxiliary "sum transfer" variable $t_{j,u} \in \{ 0, 1, \cdots, p_j-1 \}$.

We can now construct at least one portion of the sum:

```
  ...

  x_{a,j} ---
             \
              ---- s_{a,b,j,u} --- t_{j,u} ---
  x_{b,j} ---/

  ...

```

 
