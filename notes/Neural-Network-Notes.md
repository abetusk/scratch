Neural Network Notes
===

###### 2024-09-22

A place to put some notes about neural networks.

---

* Simple algorithms on lots of data beat out complex algorithms on little data ([1][1])
  - Algorithms conditioned on naive parallelism will win out
  - "The Bitter Lesson" says that "genral methods that leverage computation are most effective", *not*
    that simple algorithms on lots of data will win out, so methods that do reasoning, on little data,
    for example, still have the bitter lesson applied to them
* Neural networks work best when the networks themselves are highly parallel and shallow
  - "Deep" neural networks are inherently serial, so aren't as amenable to parallel speedups
  - I suspect backpropagation also has a harder time on deep neural networks and the success
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
    to the type of classificatoin that NNs do
* Automatic differentiation allows for a mixed numerical and symbolic derivative and gradient descent with
  a minimum of resources ([3][3])
  - As far as I can tell, it's a dynamic programming like method
* Simple frameworks that leverage compute (GPU, FPGA) will still work
  - e.g. micrograd ([4][4]), tinygrad ([5][5])
  - PyTorch ([6][6]) and the like are also, effectively, minimal and straighforward
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
