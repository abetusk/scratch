Random Forest Notes
===

Random forests (RF) are built from individual decision trees and
averaged.

For this note, RFs have $n$ items in the training dataset, with each being
a pair of values $(x_k,y_k)$, denoting the input and output.

$p$ classifiers are chosen.

Classifiers can typically be categorical data or continuous data,
where categorical data is put into discrete bins, perhaps an
integer label.

---

At the most basic level is the decision tree.
A decision tree is built from a series of 'yes/no' questions
attempting to split the data maximally based on a classifier.

A typical process can be:

* A classifier is chosen, scanning the data for which splits the set the most (maximum entropy)
  - Gini impurity is often used for categorical data, asking for a metric of
    how often a random label is chosen incorrectly ($\sum^J p_i \cdot (\sum_{j \ne i} p_j) = \sum^J p_i \cdot (1 - p_i)$)
  - Variance reduction is often used for continuous data
* Once a classifier is chosen, a decision tree node is chosen with the classifier and parameter for the classifier
  that makes the split maximal (maximum entropy)
  - For categorical data, information can be chosen with is $IG(T,a) = H(T) - H(T | a)$
  - For continuous data...least squares?

Each decision node restricts the input space further, allowing for further refinement.

---

A single tree has high variance, so "bagging" is proposed whereby many trees constructed, all
using the same classifiers.

Sing bagging uses the same classifiers, an additional constraint can be imposed to use only
a subset of the classifiers for each decision tree, reducing any bias that might be inherent
in one classifier or group of classifiers and allowing other classifiers to pick out signal.

Tree pruning can further be employed.
A balance can be had by throwing out decision tree nodes to retain predictive power
while keeping tree depth or width within some bound.


