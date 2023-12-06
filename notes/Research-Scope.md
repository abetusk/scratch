Research Scope
===

###### 2023-12-01

A document to outline the expectations of hiring a research consultant for POMS.

---

Meta
---

* Any questions/comments before we start?
* Spend a few minutes on administrative items, including expectations,
  scope, etc.
* Spend a few minutes on getting some technical knowledge orientation
* Spend remaining time talking about technical aspects of research

Administrative
---

* I am primarily interested in help with algorithm design in helping overcome some hurdles
  associated with spatial tiled constraint programming problems that have weak global constraints
* Secondarily, I am interested in understanding some theoretical considerations, such as insight
  into it's relation to statistical mechanics, local entropy, SAM, etc.
* Understanding of research in the area or other mathematical concepts is desirable
  but, in many cases, not necessary, as there are many issues that are highly
  context dependent
* The expectation is that this will be an advisory role, with the main interaction
  being video chats and discussions. No coding will be required.
* Assuming I'm satisfied with the potential capability of the candidate, the scope
  of work will be discussions for 1-2 hours per week, with a range of 4-5 hours per
  month
  - expectation is that only discussions will be paid for
  - extra time (research, etc.) needs to be pre-approved
  - part of the discussion time will be expected to teach domain specific knowledge
* There is the potential for publishing papers and I'm open to co-authorship but this
  is out of scope of the work involved here and should be discussed as an independent project.
  I don't require or expect any interest in publishing but I want to announce my intentions
  should that be something that's interesting to the candidate.

> Questions/comments before moving on to technical discussion?

Technical
---

### Knowledge orientation:

* Are you familiar with basic computer science terms and algorithms:
  - "big-oh", binary search, sorting
  - dynamic programming
  - dijstra's algorithm
  - hamiltonian cycle
  - Viterbi's algorithm
  - belief propagation
* Are you familiar with entropy?
  - free entropy
  - Kullback-Leibler divergence
  - Bethe free energy
* Are you familiar with statistical mechanics?
* Are you familiar with Monte Carlo Markov Chains (MCMC)?
* Are you familiar with the Metropolis algorithm?
* Are you familiar with the concept of NP-Completeness?
* Are you familiar with phase transitions of complex systems (Ising model, Bethe lattice, Rice/Sand piles)?
* Are you familiar with phase transitions of NP-Complete problems?
* Are you familiar with Constraint Satisfaction Problems (CSP)?
* Are you familiar with the replica trick?
* Do you know what one step replica symmetry breaking (1RSB) is?

### Description of Problem

* Motivation is creating generative textures/tiled game maps/3d art models from exemplar models or simple tile rules
* 3D grid, with each grid cell location holding many potential tile vales ($N = X \cdot Y \cdot Z$, $M$ tile values)
  - `tilemap` is the configuration
  - `tileset` is the set of tiles allowed at each cell
* Tile values have binary constraints on all $L^1$ distance neighbors ( $f(\cdot,\cdot)$ )
* Goal is to find a realization that has no contradictions
  - For all adjacent tiles, $u, v$, $f(u,v)>0$
  - $\forall w \in G, |w|=1$, that is all cells only have one tile value
* Example
  - road
  - PM
  - RRTI
* Prior work:
  - WFC
  - MMS
* Arc consistency: (AC) grid is in locally consistent state with no tiles needing to be
  removed that could obviously be cast out
  - AC3, AC4 algorithms to create arc consistent grid ($O(N \cdot M^3)$, $O(N \cdot M^2)$ resp.)
  - arc consistency doesn't imply non-contradictory or solvable. AC is purely a local property
    without any statement about the global system
* General problem is NP-Complete but these algorithms work because we're in the easy region of the NP-Complete space
* Describe Breakout Model Synthesis (BMS):
  - proceed as in WFC
  - if reach a contradiction, reject choice, backtrack one level and try again
  - if retry count exceeded, choose a larger block to revert to wildcard state
* BMS similarities/differences with MCMC:
  - normally a full (contradictory) realization is taken with zero energy as the
    non-contradiction state and contradictions taken to be non-zero energy
  - "canonical" MCMC proceeds with choosing tile choice, accepting if energy is lower
    or probabilistically accepting if energy is higher
  - contrast with BMS, which is always in an arc consistent state
  - BMS perhaps can be thought in terms of an MCMC but energy is different and there's
    an additional constraint that system must be arc consistent as it proceeds
* BMS critical insight is 'soften' step which allows the search to get past the local minima
  based on local constraints.
  - effectively only works for tilesets whose rules only have local effect
  - global constraints will foil BMS but some global constraints are weak
* Weak global constraints can be overcome by better search strategies

