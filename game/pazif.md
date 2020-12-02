ZProc
===

A 'zelda-like' game without combat.

Each level is procedurally generated.

| Item | Effect |
|---|---|
| book | mcguffin (gives information when read?) |
| ring | teleport |
| bomb | clear rock |
| raft | sail across water (but only on docking station?) |
| ladder | walk across single stream |
| glove | pick up / levitate (metal?) statues |
| boomerang | pick up item |
| boot | walk in mud |
| metal boot | walk on ice |
| torch | see in dark |
| flute | mcguffin |
| meat | mcguffin |
| scroll | mcguffin (gives information when read?) |
| potion | mcguffin |
| compass | shows the way through the forgetful forest / end gate |
| wrist band | can shove rock |
| key | mcguffin |
| flowers | mcguffin |


| Creature | Item / Effect |
|---|---|
| bat | flies at night, torch disperses them (blocks item/path/access?) |
| skull | captured by ring? released at grave? |
| eye | potion, clears red eye? |
| skeleton | ? |
| knight | ? |
| wizard | book |
| occultist | scroll |
| goblin | meat |
| giant | keep company / light fire |
| snake | flute |
| spider | ? |
| mushroom | potion |

| World Effect | Description |
|---|---|
| mud | needs boots to walk through |
| ice | needs metal boots to not slip |
| water body | needs raft to go across |
| stream | needs bridge to go across |
| rock | needs bomb to clear |
| grave | needs spirit to release |
| entrance | needs key |
| pressure plate | needs (metal) statue to have it be put on |

All items are accessible if you search around.

Characters will give you information about
where the items are hidden.
An interaction can be triggered if you do a certain task or
give them an item.

| Situation | Prompt | Trigger | Dialogue |
|---|---|---|
| next to grave | `My [relation] used to love flowers` | place flowers on grave | `[relation] would have thought these flowers were so nice` |
| next to tree | `My [relation] and I used to have picnics under this tree` | give mutton | `It's been so long since I picniced here` |
| next to fire | `It gets so cold and lonely at night` | light fire, stay at night | `That fire is nice` |
| being still in the (rain|snow) | `...` | stay still while it's raining | `It's so beuatiful when it (snows|rains).` |
| next to (waves|pond|stream) | `...` | stand next to them for some time | `My [relation] and I used to come here and watch the water. It's nice to have someone listen` | 
| n/a | `My [relation] and I used to read together` | give book | `It's been so long since I've seen this book` |
| n/a | `My [relation] used to read poetry to me` | give scroll | `It's been so long since I've seen this poem` |
| n/a | `My [relation] used to play the flute for me` | play flute | `It's been so long since I've heard that tune` |
| n/a | `My [relation] used to make the most wonderful potions for me` | give potion | `This reminds me of the potions my [relation] used to give me` |
| n/a | `Would you like to join me for tea?` | serve tea | `How nice it is to drink a hot cup of tea with good company` |

* spider
* eye
* giant
* skeleton
* occultist
* wizard
* ghoul
* snake
* mushroom
* skull
* horns
* deer


Each level has 3 exits, a forest exit, a grave exit and a castle exit.
This informs the next level generated.

Each level has 9 gates.

* `m` - mud gate (boots)
* `i` - ice gate (metal boots)
* `r` - river gate (bridge)
* `p` - pond gate (raft)
* `b` - barrier gate (teleportation)
* `c` - rock gate (bomb)
* `o` - boulder gate (wrist band)
* `k` - key gate (final level)
* `f` - forgetful forest gate (compass)
* `s` - switch gate (boomerang)
* `e` - pressure plate (statue + glove)
* `t` - pit gate (winged boots)

Example:


```

boots
  |
[mud]
  |___________________________________
  |                \                  \
(metal boots) - (bridge)    -        (bridge)
  |


```


