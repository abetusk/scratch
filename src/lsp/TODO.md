TODO
===

###### 2026-05-31

I'm not recursively resolving things correctly, I don't think.

Here's the example (`err0.lsp`):

```
(d gg (f (R) (f (n) (R n))))
(d w (gg +))
(w 3)
```

`gg` is a function that returns a function, where `gg` proper takes in a function as a parameter, `R`,
and returns a function that takes in a number, `n`, as parameter with `R` executed on it.
That is, it should create a function `(R n)`, where `R` is `+`, for example.

`(w 3)` should result in `3` as a return value (`(+ 3)` -> `0`).

Instead, what happens is it returns `(R n)`, without evaluating `R`.

So there's some sort of recursive application of evalulation that I've done wrong for funcdefs or some such.

