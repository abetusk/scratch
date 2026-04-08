Hobby Curve
===

This is a consolidation of different implemenations of the Hobby curve and Bezier curve
into a more easily usable package.

See [References.md](References.md) for sites where packages were drawn from.

`hob.js`
---

This is the main consolidated library.

To build:

```
browserify ./hob.js --standalone Hobby -o dist/Hobby.js
```

This will create a file `dist/Hobby.js` that can be used by node or in the browser.

For browser use, this exposes a `Hobby` object for use.

| Function | Description | Example |
|---|---|---|
| `HobbyLUT(p,seg,tension=1,isloop=false)` | `p` holds knot points, `seg` is the number of segments per Bezier segment (default `100`) | `HobbyLUT( [[0,0], [200,133], [130,300], [33,233], [100,167]], 16)` |
| `Bezier(x,y, rx,ry, lx,ly, xn,yn)` | Bezier curve helper function. `x,y` and `xn,yn` are endpoints, `rx,ry` and `lx,ly` are control points | ... |



`bez.cjs`
---

This is a Common JS compilation of Pomax's Bezier.js package.

The implementation that the above Hobby curve library uses creates
a Bezier curve control points.
This library is needed to use this resulting Bezier curve (linear interpolation,
etc.).

To build:

```
esbuild ./bezier.js --bundle --platform=node --outfile=bez.cjs
```


LICENSE
---

All packages used, including the consolidated package, should be libre/free licensed.
See appropriate packages for details.

Unless explicitely stated otherwise, all source code is CC0 licensed.
