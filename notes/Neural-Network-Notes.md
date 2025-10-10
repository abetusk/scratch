Neural Network Notes
===

###### 2025-10-10

[Stochastic Gradient Descent by R. Ward](https://youtu.be/NQ0AaVjMcZQ?si=BztKEvVaMRpY_B_n)

Some takeaways:

* SGD converges in settings where $F(w) = \frac{1}{n} \sum f _ j (w)$, where each $f _ j$ convex, loss
  function $F$ is $\mu$ strongly convex (has curvature that's reasonable) and has some $L$-smooth conditions
* A lot of training is preconditioning data to be in this regime
* Lifting to higher dimensions often "smooths" functions out so that these methods work better
* Hyperparameters, such as step size, are even more sensitive in the SGD realm
* Double (triple, quadruple?) descent might happen because of decreasing step size schedule???
* Adaptive gradient descent, take some type of variance, norm, average, etc. of the step size length
  and adjust step size to this average
  - $b^2 _ {t+1} \leftarrow b^2 _ t + || \nabla f _ {i _ t} (w ^{(t)} || ^ 2 _ 2$ ( $i _ t \sim \text{Uniform}\{1,2,\dots,n\}$ )
  - $w^{(t+1)} \leftarrow w^{(t)} - \frac{ \eta }{ b _ {t+1} } \nabla f _ {i _ t} ( w ^{(t)} )$
  - $b _ {t+1}$ bigger leads to smaller step sizes, smaller leads to larger step sizes

###### 2025-09-01

Some high level intuition:

* a layer in a NN does a transformation on an input space and effectively does a partition.
  Multiple layers to multiple partitions but subsequent layers partition in transformed space
  rather than the original space.
  This allows for discrimination based on the transformed space rather than the original space,
  allowing for more abstracted methods of pattern classification
* Universal approximation makes no bounds on width of layer, with (most likely) exponential growth
  for some functions. Chaining NN layers allows for the potential of multiplicative pattern matching
  growth with polynomial sized computational model growth. The type of function that can be approximated
  (well) by this method is of a particular structure (maybe represented well by iterated function systems?
  scale symmetry? etc.) so exponential pattern classification is not naively true. Another idea is that
  this is exploiting symmetry, where the symmetry is this type of compression by scale or iterated function
  application.
* It seems like there should be some type of continuity condition, even if very weak, but this could be
  technically true while being practically not, as a highly variable continuous function sub-sampled might as well 
  be discontinuous. It seems like continuity is needed, or at least beneficial, as there needs to be a path
  to progress, but this is counter weighed by jumbling up the input so that more novel patterns can be detected.

I don't particularly like the video but it was the inspiration for these insights ([here](https://www.youtube.com/watch?v=qx7hirqgfuU)).


###### 2025-03-17

* *loss function* - synonymous with 'objective function', the function we're ultimately
  trying to run gradient descent on (e.g. mean square error of calculated value vs. training values)
* *epoch* - one complete pass through a training dataset


###### 2024-09-22

A place to put some notes about neural networks.

---

* Simple algorithms on lots of data beat out complex algorithms on little data ([1][1])
  - Algorithms conditioned on naive parallelism will win out
  - "The Bitter Lesson" says that "general methods that leverage computation are most effective", *not*
    that simple algorithms on lots of data will win out, so methods that do reasoning, on little data,
    for example, still have the bitter lesson applied to them
* Neural networks work best when the networks themselves are highly parallel and shallow
  - "Deep" neural networks are inherently serial, so aren't as amenable to parallel speedups
  - I suspect back propagation also has a harder time on deep neural networks and the success
    of gradient descent like algorithms comes from shallow but parallel networks
* Higher dimensional space is a blessing, not a curse
  - If there's a signal, even weak, and directions are random, the chance of going down a dead end
    is small
  - The chance of getting stuck in a local minima in higher dimensions is small
  - I suspect one of the main effects if finding a dimensional reduction, finding a (linear) subspace within
    the higher dimensional space that captures the qualities of interest
* Preconditioning the data is necessary for proper functioning of neural networks
  - Attention and other structures/algorithms are basically exploiting structure of the data
    to help the neural network learn
  - Attention is effectively a pre-processing step and might itself be doing gradient descent in some other space ([2][2])
  - This goes beyond "garbage-in/garbage-out" as it's specifically conditioning data to be amenable
    to the type of classification that NNs do
* Automatic differentiation allows for a mixed numerical and symbolic derivative and gradient descent with
  a minimum of resources ([3][3])
  - As far as I can tell, it's a dynamic programming like method
* Simple frameworks that leverage compute (GPU, FPGA) will still work
  - e.g. micrograd ([4][4]), tinygrad ([5][5])
  - PyTorch ([6][6]) and the like are also, effectively, minimal and straightforward
* Once the hype dies down, we'll get a better sense of what the limitations are and how other methods
  can complement using NNs as a fundamental tool
  - Search/inference (aka "runtime search") can improve quality by many orders of magnitude (5-6 as opposed to 1-2) ([7][7])
  - I suspect other methods like decision trees for the like can be made to do equivalent reasoning given the proper
    ability to exploit parallelism, low level tools, preprocessing and framework


References
---

[1]: http://www.incompleteideas.net/IncIdeas/BitterLesson.html
[2]: https://youtu.be/XfpMkf4rD6E?si=0nj0wFFfcFzbwnsf
[3]: https://www.sscardapane.it/alice-book/
[4]: https://github.com/karpathy/micrograd
[5]: https://github.com/tinygrad/tinygrad
[6]: https://pytorch.org/
[7]: https://www.youtube.com/watch?v=eaAonE58sLU
[8]: https://arxiv.org/pdf/2203.10036
