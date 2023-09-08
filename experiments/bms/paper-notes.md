paper notes
===

Abstract
---


In this paper we present a new algorithm called "breakout model synthesis" (BMS) used to create 2D and 3D designs from small example model inputs. Breakout model synthesis combines ideas from M. Gumin's "Wave Function Collapse" (GWFC) project with P. Merrell's modify in place model synthesis (MMS) algorithm to overcome the limitations of each by allowing large instance sizes to be realized with minimal assumption about the initial state. BMS starts from an initial indeterminate state and then progressively fixes sub-blocks until a solution is found, setting the block and its neighbors back to the initial state if no sub-block solution can be found. BMS relies on a finite "influence radius", dependent on the tile set and grid configuration, that makes the breakout model synthesis algorithm's block realizations independent enough from the surrounding grid to make progress.We present attempts at defining the influence radius and algorithms for estimating it. We further use the algorithmic estimations to estimate the influence radius for a variety of tile sets. Finally, we preset comparisons with GWFC and MiP-MS on a variety of tile sets to highlight the benefits and limitations of each method.

---

1. starting sentence on who/what area would use it. why.           
2. abstract: refer to idea sources by name... "ideas from Wave Function Collapse (Gumin) and from modify-in-place Model Synthesis (Merrell)..." - consider not having Gumin, Merrell at all.           
3. "overcome the limiations of each. Our solution allows for large instances to be realized with minimal assumption.."           
4. one sentence on radius. "We introduce the concept of 'influence radius' and demonstrate how it is used to solve large instances."           
5. remove "finally", and make results more prominent in abstract. "We present results of large scale runs of BMS compared to MMS and WFC, and examples of challenging tilesets that we can solve."
