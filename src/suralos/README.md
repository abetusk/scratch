Work on creating an overworld map for "children of solarus".

Data files and tilemap images taken from [Children of Solarus](https://www.solarus-games.org/games/children-of-solarus/) ([gl](https://gitlab.com/solarus-games/games/children-of-solarus)).

Everything should be libre/free licensed (Solarus assets are CC-BY-SA 4.0).


---

There's still some problems with stitching on the sides, where some shadows don't appear (under the bridge) and some trees are screwed up.

I'm not sure how much is my fault and how much is the maps fault. I assume it's mine but the squished trees make me worried.

---

Some notes on errors:

* `a2` has issues on the right side and right corner with trees. I'm not sure if this is me or the map
* `b2` has an issue with shadows and placement of some temple entrances (in stone arches). Again, don't know if it's me or the map
* The final image has trees cutoff in the interface between `a3` and `a4`. I suspect this is from `a4` having negative values for
  the tree placement that don't appear in `a3`, so placing things in the final image instead of doing a straight stitch together might
  fix this.
* `a4` has a shadow under the bridge not appear (right side), again, don't know if its me or the map
* `a4` has some entrances that are just naked, not sure if that's supposed to be hidden or if there are other issues that I'm not taking
  into account
