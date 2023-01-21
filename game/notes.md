Notes
===

Games I Like
---

* Fez
* Braid
* Monument Valley
* Hyperlight Drifter
* Original Legend of Zelda
* Crypto of the Necrodancer
* Cup Head
* Beat Saber
* Pistol Whip
* Teeworlds
* Tunic (?)
* Unrailed
* Overcooked

Ideas
---

There's three major concepts that I think are important:

* Logical graphs
* Topological graphs
* Spatial graphs

Where the logical graphs are more abstract than the topological graphs and the topological
graphs are more abstract than the spatial graphs and the spatial graphs.

The spatial graphs are the most concrete and tell you how rooms, structures, etc. get placed
in the physical realization of the world.

The topological graphs tell the relative position of the spatial graph elements but essentially
only have hints as to how to realize them spatially.

The logical graph is the catch-all term for how nodes of interest are joined.

A common theme is that a topological planar tree graph is generated to represent the nodes of interest.
For example, for a dungeon each node could be a dungeon room or collection of rooms with doorways or corridors
representing the edges connecting nodes.
The tree property allows for easy reasoning of flow/difficulty and lock-and-key type puzzles, among other properties.
The planar property allows the spatial graph to be generated more easily as minimal special treatment needs
to be applied, in terms of spatial placement, to figure out how to realize the implied graph.

Often, a 2D grid will be used to generate the topological map but it need not be.

At some stage after the topological graph is generated and processing has been done, say for the lock-and-key type
puzzles, additional edges can be joined, potentially preferring neighboring spatial nodes, either in the graph or by
some other metric, to create more pleasing graphs and to provide exit shortcut once that portion of the graph
has been explored/won.

### Example

Base Topological Grid:

```
  _      _      _      _      _
 |2| -> |2| -> |3|    |1| -> |2|
  -      -      -      -      -
  ^                    ^
  |                    |
  _      _      _      _
 |2| <- |1| <- |0| -> |0|
  -      -      -      -
                ^      |
                |      v
                _      _
               |0|    |1|
                -      -
              start
```

```
        *k3
  _      _         _         _         _
 |2| -> |2| -l3-> |3|       |1| -l2-> |2|
  -      -         -         -         -
  ^                          ^
  |                          |
  |                          l1
  |         *k2              |
  _         _         _      _
 |2| <-l2- |1| <-l1- |0| -> |0| *k1
  -         -         -      -
                      ^      |
                      |      l1
                      |      |
                      |      v
                      _      _
                     |0|    |1|
                      -      -
                    start
```

Where locks have been added to edges and keys have been added to rooms.

Note that keys can be placed based on some 'difficulty' heuristic, weighting
each room by distance from start, number of monsters, etc. to allow for
placement of the key that maximizes the cost function.

Now additional edges can be added for quick exit and aesthetics:

```
           *k3
  _         _         _       _         _
 |2| ----> |2| -l3-> |3|.....|1| -l2-> |2|
  -         -         -       -         -
  ^                   .       ^
  |                   .       |
  |                   .      l1
  |         *k2       .      |
  _         _         _      _
 |2| <-l2- |1| <-l1- |0| -> |0| *k1
  -         -         -      -
                      ^      |
                      |      l1
                      |      |
                      |      v
                      _      _
                     |0|....|1|
                      -      -
                    start
```

Where the `.` connections are chosen to either be valves (one way corridors)
or locks with the appropriately weighted value.

From this, we can create a dungeon, say, either by using each node directly as a
room or by expanding the individual nodes into multiple spatial nodes/rooms while
respecting the topological connections. 

Cyclic Dungeons
---

Dormans suggests a "cyclic" approach to dungeon creation.

The term cyclic is used as a vague term to describe multiple paths from the start to the goal node, with a preference
for going  in a single direction in a loop.
The "loop" might be connected by a non traversable edge, a so-called "window", but I think the major idea is that it's supposed
to reduce the drawbacks of backtracking in more linear or tree like lock-and-key dungeon graphs.

The idea is to start with a two node graph:

```
  |-------| -----------> |------|
  | start |              | goal |
  |-------| <----------- |------|
```

From this we can get grammar rules to operate on the high level ideas of the graph:


```
             long a                                monsters
  |-------| -----------> |------|      |-------| -----------> |------|
  | start |              | goal |  =>  | start |              | goal |
  |-------| <----------- |------|      |-------| <----------- |------|
             long b                                 traps


                                       Hidden shortcut

             long a                                monsters
  |-------| -----------> |------|      |-------| -----------> |------|
  | start |              | goal |  =>  | start |              | goal |
  |-------|    <---      |------|      |-------|     --->     |------|
              short b                               secret


                                        Lock and key cycle

                                                         /--|lock|-> (goal)
               short a                                  /
  |-------|     --->     |------|      |-------| ------.--------> |------|
  | start |              | goal |  =>  | start |                  | node |
  |-------| <----------- |------|      |-------| <valve|-(key)--- |------|
             long b                                 

                                                   patrolling
               short a                              monster
  |-------|    --->      |------|      |-------|     --->     |------|
  | start |              | goal |  =>  | start |              | goal |
  |-------|    <---      |------|      |-------|     <---     |------|
              short b                               


  Double key cycle
             
  |-------| --------------(key a)------\
  | start |                             \
  |-------| -|lock a|--(key b)-|valve>---.-|lock b|-> (goal)
             

  Key behind valve

  |-------| ---------------------------\
  | start |                             \
  |-------| <valve|-----(key)--<valve|---.---|lock|--> (goal)


  Dramatic Cycle                       Dangerous route

                                                     some
             long a                                monsters
  |-------| -----------> |------|      |-------| -----------> |------|
  | start |              | goal |      | start |              | goal |
  |-------|   - - - >    |------|      |-------|     --->     |------|
              visible                               many
                                                   monsters

  Unknown return path

  |-------| ->collapsing bridge<--> |------|
  | start |                         | goal |
  |-------| <valve|---------------- |------|


  Lure and setback

  |-------| -------------------------------------------------> |------|
  | start |                                                    | goal |
  |-------| <valve|-{danger}--{reward}-->collapsing bridge<--- |------|


  Simple lock and key

  |-------| ------------------------------
  | start |                                \
  |-------| - - -{visible}- - -> ---(key)---.---|lock|---> (goal)


  Gambit

  |-------| ----------------------------------------------
  | start |                                               \
  |-------| - - -{visible}- - -> ---{rewards}---{danger}---.---> (goal)


```


The idea is to create some basic loop patterns to draw from.

In addition, there's catalogue of lock types.

Locks may be conditional, dangerous or uncertain:

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Lock | Conditional | Can only be opened conditioned on key |
|  Lock | Dangerous   | Lock can be navigated without key but with an element of danger, with danger being reduced potentially with a key |
|  Lock | Uncertain   | Lock can be navigated without key but but its discovery may be uncertain (it's hidden or there's an element of randomness) |

Locks are permanent, reversible, temporary or collapsing

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Lock | Permanent   | Once opened or closed they stay opened or closed |
|  Lock | Reversible  | The key may be used to change the state of the lock from open to closed or vice versa |
|  Lock | Temporary   | The key may open or close the lock, but only temporarily |
|  Lock | Collapsing  | Can only be used once before it is removed |

Locks might be valves or asymmetric

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Lock | Valve       | Locks may only be crossed in a certain direction |
|  Lock | Assymetrical | Locks may allow crossing in multiple directions but only be opened from one or a few directions |

Locks can be safe or unsafe:

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Lock | Safe | A safe lock always has a solution |
|  Lock | Unsafe | Unsafe locks may not have a solution |

Keys can be single purpose or multipurpose:

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Key | Single Purpose | A key can only be used to open a single lock |
|  Key | Multi Purpose | A key can be used for other purposes than opening a single lock, including opening multiple locks |

Keys are particular or non particular:

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Key | Particular | Particular locks only unlock a particular lock |
|  Key | Nonparticular |  A nonparticular key may open many locks |

Keys might be consumed or persistent

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Key | Consumed |  Disappear after some number of uses |
|  Key | Persistent |  Keys persist after use |


Keys might be fixed or mobile

| Class |    Type     | Description |
|-------|-------------|-------------|
|  Key | Fixed |  Key is stationary and cannot be moved from a particular location |
|  Key | Mobile |  Key can be carried |


* [Joris Dormans - Cyclic Dungeon Generation - PROCJAM 2016](https://www.youtube.com/watch?v=yxMY6hsAzf8)
* [A Handcrafted Feel: ‘Unexplored’ Explores Cyclic Dungeon Generation](https://ctrl500.com/tech/handcrafted-feel-dungeon-generation-unexplored-explores-cyclic-dungeon-generation/)

Flow Control
---

Tom Coxon has a few suggestions on scaling difficulty for generative games

* Generate a "topological" graph with monotonically increasing key count, with gates needed to progress
* The graph should be planar and should be a tree
* Place keys on the map that maximize difficulty, where node difficulty can be increased by monsters, traps,
  etc.
* Add connective edges to the tree, using the appropriate gates or other one-way valves to connect the graph
  further and allow for easy exit or more aesthetically pleasing connectivity

### References

* [PROCJAM 2014 - Flow In Procedural Generation - Tom Coxon](https://www.youtube.com/watch?v=z6lweIGJYS8)
* [Lenna's Inception devblog](https://web.archive.org/web/20200928152732/http://www.squidi.net/three/entry.php?id=54)
* [dungeon](https://web.archive.org/web/20160817151306/https://dl.dropboxusercontent.com/u/100579483/haxe-metazelda/html5/index.html)
