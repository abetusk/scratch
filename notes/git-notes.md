Git Notes
===

The basic `blob` unit.
The content of the file is prefixed with the `blob `
and ASCII length, terminated by a `0` character.

This new data is `zlib` compressed and the `sha1sum` of
that data is hashed to produce the unique hash identifier
for the blob.

```
$ printf "blob 12\000Hello World\n" | sha1sum
557db03de997c86a4a028e1ebd3a1ceb225be238  -
$ printf "Hello World\n" > hello.txt ; git add hello.txt ; tree .git/objects
.git/objects/
├── 55
│   └── 7db03de997c86a4a028e1ebd3a1ceb225be238
├── hello.txt
├── info
└── pack

3 directories, 2 files

$ printf "\x1f\x8b\x08\x00\x00\x00\x00\x00" | cat - .git/objects/55/7db03de997c86a4a028e1ebd3a1ceb225be238 | gzip -dc | hexdump -C

gzip: stdin: unexpected end of file
00000000  62 6c 6f 62 20 31 32 00  48 65 6c 6c 6f 20 57 6f  |blob 12.Hello Wo|
00000010  72 6c 64 0a                                       |rld.|
00000014
$ hexdump -C .git/objects/55/7db03de997c86a4a028e1ebd3a1ceb225be238 
00000000  78 01 4b ca c9 4f 52 30  34 62 f0 48 cd c9 c9 57  |x.K..OR04b.H...W|
00000010  08 cf 2f ca 49 e1 02 00  41 d1 06 49              |../.I...A..I|
0000001c
$ printf 'blob 12\000Hello World\n' | pigz -z | hexdump -C
00000000  78 5e 4b ca c9 4f 52 30  34 62 f0 48 cd c9 c9 57  |x^K..OR04b.H...W|
00000010  08 cf 2f ca 49 e1 02 00  41 d1 06 49              |../.I...A..I|
0000001c
$ printf 'blob 12\000Hello World\n' | zlib-flate -compress | hexdump -C
00000000  78 9c 4b ca c9 4f 52 30  34 62 f0 48 cd c9 c9 57  |x.K..OR04b.H...W|
00000010  08 cf 2f ca 49 e1 02 00  41 d1 06 49              |../.I...A..I|
0000001c
```

---

`tree` type:

`tree <len>\0<perm> <filename>\0<binhash>`

```
$ zlib-flate -uncompress < .git/objects/97/b49d4c943e3715fe30f141cc6f27a8548cee0e  | hexdump -C
00000000  74 72 65 65 20 33 37 00  31 30 30 36 34 34 20 68  |tree 37.100644 h|
00000010  65 6c 6c 6f 2e 74 78 74  00 55 7d b0 3d e9 97 c8  |ello.txt.U}.=...|
00000020  6a 4a 02 8e 1e bd 3a 1c  eb 22 5b e2 38           |jJ....:.."[.8|
0000002d
```


References
---

* [Advanced Git Graphs, Hashes, and Compression, Oh My!](https://www.youtube.com/watch?v=ig5E8CcdM9g)
* [SO: How to uncompress zlib data in UNIX?](https://unix.stackexchange.com/questions/22834/how-to-uncompress-zlib-data-in-unix/49066#49066)
* [SO: What is the internal format of a Git tree object?](https://stackoverflow.com/questions/14790681/what-is-the-internal-format-of-a-git-tree-object)
