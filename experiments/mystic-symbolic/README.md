Notes on SVG
---

```
       crown
 horn          horn
    arm     arm
      nesting 
    leg     leg
        tail

       anchor
```



Description Language
---

Here is a simple character to highlight the syntax:

```
    !^!
[] ~(@)~ {}
     .
    | |
```

| Symbol | Meaning | Description |
|---|---|---|
| `^` | crown | |
| `!` | horn | |
| `~` | arm | |
| `@` | nesting | |
| `|` | leg | |
| `.` | tail | |
| `()` | sub-expression | |
| `[]` | ring | |
| `{}` | random | |

For example, Here is a simple creature with most the features listed above:

```
scales @ [infinity,key] ^ pentacle ! (moons_triple@mushroom_cloud) ~ (ring@ snake_eye) | death . star_7pt
```

That produces

| |
|---|
| ![example0](img/example0.svg) |


The `ring` (`[]`) (not to be confused with the symbol `ring`) iterates through the list, modulo
the attach point index.

By default, the symbols are inverted every other index but an optional negation (`-`) can be
used in front of the symbol to reverse the direction.
This negation can be done for both nesting and other attach points.

Here are some examples to illustrate the idea:

| | |
|---|---|
| `face_nest @ hand_point ~ wing_angel2 ` | ![example1](img/example1.svg) |
| `face_nest @ [hand_point,-hand_point] ~ [wing_angel2,-wing_angel2]` | ![example2](img/example2.svg) |
| `face_nest @ [-hand_point,hand_point] ~ [-wing_angel2,wing_angel2]` | ![example3](img/example3.svg) |

The `{}` produces a random drawing from the list, with `*` being the 'universe' and a negation being a
removal of that item, with order mattering.
The `{}` can be thought of as a 'macro' with it expanding at "compile time".


For example, here is a creature, without Bob or his pipe:

| | |
|---|---|
| `{*,-bob,-pipe} @ {*,-bob,-pipe} ^ ({*,-bob,-pipe} @ {*,-bob,-pipe}) ! ({*,-bob,-pipe}@{*,-bob,-pipe}) ~ {*,-bob,-pipe} | {*,-bob,-pipe} . {*,-bob,-pipe} ` | ![example4](img/example4.svg) |

If a symbol doesn't have the attach points, the specified symbol will be ignored.

