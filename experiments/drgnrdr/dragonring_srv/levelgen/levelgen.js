// Dragon-ride level generator.  Standalone: no three.js, runs in a
// browser (<script>) or in node (require).
//
//   LevelGen.generate({ seed: 1 })  ->  plain JSON level (see README)
//   LevelGen.sdf(level)             ->  f(x, y, z), signed distance to
//                                       the nearest solid (negative
//                                       inside), shared by the
//                                       generator's checks and the game
//
// World axes: y up, the gully runs along +z from the start (z = 0) to
// the finish (z = length), x across it.
//
(function(root) {

  var DEFAULTS = {
    seed        : 1,
    length      : 1400,
    halfWidth   : 230,
    cell        : 4,
    wind        : 50,
    floorHalf   : 50,
    wallRun     : 40,
    wallHeight  : 70,
    cruise      : 16,
    townCruise  : 8,
    tunnelR     : 11,
    hoopSpacing : 65,
    hoopR       : 7,
    finishR     : 12,
    streetClear : 8,
    townDensity : 0.75
  };

  // Where things go along the gully, as fractions of its length.
  //
  // Water surface height; the game draws water here.
  //
  var L_WATER = -1.3;

  var ZONES = {
    start  : 0.035,
    arch   : 0.18,
    town0  : 0.30,
    town1  : 0.585,
    tunnel : 0.79,
    finish : 0.95
  };

  function clamp(x, a, b) { return ( (x < a) ? a : ( (x > b) ? b : x ) ); }
  function lerp(a, b, t)  { return a + ((b - a) * t); }

  // Smooth 0..1 step from a to b (a > b gives a falling step).
  //
  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - (2 * t));
  }

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(ix, iz, s) {
    var h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(s + 1, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function vnoise(x, z, s) {
    var ix = Math.floor(x), iz = Math.floor(z),
        fx = x - ix,        fz = z - iz;
    fx = fx * fx * (3 - (2 * fx));
    fz = fz * fz * (3 - (2 * fz));
    return lerp(lerp(hash2(ix, iz, s),     hash2(ix + 1, iz, s),     fx),
                lerp(hash2(ix, iz + 1, s), hash2(ix + 1, iz + 1, s), fx), fz);
  }

  // Fractal value noise, roughly 0..1 around 0.5.
  //
  function fbm(x, z, s, oct) {
    var sum = 0, amp = 0.5, tot = 0;
    for (var i = 0; i < oct; i++) {
      sum += amp * vnoise(x, z, s + (i * 17));
      tot += amp;
      x *= 2.03;  z *= 2.03;  amp *= 0.5;
    }
    return sum / tot;
  }

  // ------------------------------------------------------------ distances

  function boxD(px, py, pz, hx, hy, hz) {
    var qx = Math.abs(px) - hx, qy = Math.abs(py) - hy, qz = Math.abs(pz) - hz,
        ox = Math.max(qx, 0),   oy = Math.max(qy, 0),   oz = Math.max(qz, 0);
    return Math.sqrt((ox * ox) + (oy * oy) + (oz * oz)) + Math.min(Math.max(qx, Math.max(qy, qz)), 0);
  }

  // A building collides as one box from its base to partway up the
  // roof, which is forgiving at the eaves.
  //
  function buildingD(b, x, y, z) {
    var dx = x - b.x, dz = z - b.z,
        c  = Math.cos(b.rot), s = Math.sin(b.rot),
        lx = (dx * c) - (dz * s),
        lz = (dx * s) + (dz * c),
        H  = b.h + (b.roofH * 0.6);
    if (b.shape === "cyl") {
      var qr = Math.sqrt((lx * lx) + (lz * lz)) - (b.w / 2), qy = Math.abs(y - (b.y + (H / 2))) - (H / 2);
      return Math.sqrt((Math.max(qr, 0) * Math.max(qr, 0)) + (Math.max(qy, 0) * Math.max(qy, 0))) + Math.min(Math.max(qr, qy), 0);
    }
    return boxD(lx, y - (b.y + (H / 2)), lz, b.w / 2, H / 2, b.d / 2);
  }

  function segD(px, py, pz, a, b) {
    var abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2],
        apx = px - a[0],   apy = py - a[1],   apz = pz - a[2],
        L2  = (abx * abx) + (aby * aby) + (abz * abz),
        t   = ( (L2 > 0) ? clamp(((apx * abx) + (apy * aby) + (apz * abz)) / L2, 0, 1) : 0 ),
        ex  = apx - (abx * t), ey = apy - (aby * t), ez = apz - (abz * t);
    return Math.sqrt((ex * ex) + (ey * ey) + (ez * ez));
  }

  // Ellipsoid distance (approximate, exact on the surface).
  //
  function ellD(px, py, pz, rx, ry, rz) {
    var k0 = Math.sqrt(((px / rx) * (px / rx)) + ((py / ry) * (py / ry)) + ((pz / rz) * (pz / rz))),
        k1 = Math.sqrt(((px / (rx * rx)) * (px / (rx * rx))) + ((py / (ry * ry)) * (py / (ry * ry))) + ((pz / (rz * rz)) * (pz / (rz * rz))));
    return ( (k1 > 1e-9) ? ((k0 * (k0 - 1)) / k1) : -Math.min(rx, Math.min(ry, rz)) );
  }

  // Trees: a trunk (vertical capsule) and a crown (ellipsoid), which is
  // forgiving next to the drawn cone or ball.  kind: "pine", "round",
  // "dead" (a thin crown of bare branches).
  //
  function treeD(t, x, y, z) {
    var dx = x - t.x, dz = z - t.z, hz = Math.sqrt((dx * dx) + (dz * dz)), h = t.h,
        yy = clamp(y - t.y, 0, h * 0.9), tr = t.tr || (0.35 + (0.1 * t.r)),
        d = Math.sqrt((hz * hz) + ((y - t.y - yy) * (y - t.y - yy))) - tr;
    if      (t.kind === "pine")  { d = Math.min(d, ellD(dx, y - (t.y + (0.55 * h)), dz, t.r, 0.45 * h, t.r)); }
    else if (t.kind === "round") { d = Math.min(d, ellD(dx, y - (t.y + (0.68 * h)), dz, t.r, 0.36 * h, t.r)); }
    else if (t.kind === "giant") { d = Math.min(d, ellD(dx, y - (t.y + (0.8 * h)), dz, t.r, 0.17 * h, t.r)); }
    else                         { d = Math.min(d, ellD(dx, y - (t.y + (0.7 * h)), dz, t.r * 0.45, 0.25 * h, t.r * 0.45)); }
    return d;
  }

  // Floating boulders: a ball of radius r times 'k'; islands have a flat
  // top (at half the radius) and a bottom drawn out downward.
  //
  function floaterD(fo, x, y, z, k) {
    var fx = x - fo.c[0], fy = y - fo.c[1], fz = z - fo.c[2];
    if (!fo.island) { return Math.sqrt((fx * fx) + (fy * fy) + (fz * fz)) - (fo.r * k); }
    var sy = ( (fy < 0) ? fy / 1.6 : fy );
    return Math.max(Math.sqrt((fx * fx) + (sy * sy) + (fz * fz)) - (fo.r * k), fy - (0.5 * fo.r));
  }

  // A rock is a lumpy ellipsoid with an optional tunnel (a tube along a
  // polyline) cut through it.
  //
  function rockD(k, x, y, z) {
    var px = x - k.center[0], py = y - k.center[1], pz = z - k.center[2],
        rx = k.radii[0],      ry = k.radii[1],      rz = k.radii[2],
        k0 = Math.sqrt(((px / rx) * (px / rx)) + ((py / ry) * (py / ry)) + ((pz / rz) * (pz / rz))),
        k1 = Math.sqrt(((px / (rx * rx)) * (px / (rx * rx))) + ((py / (ry * ry)) * (py / (ry * ry))) + ((pz / (rz * rz)) * (pz / (rz * rz)))),
        d  = ( (k1 > 1e-9) ? ((k0 * (k0 - 1)) / k1) : -Math.min(rx, Math.min(ry, rz)) );
    d += k.bump * (fbm((x / 15) + (y / 23), (z / 15) - (y / 19), k.seed, 2) - 0.5);
    if (k.tunnel) {
      var P = k.tunnel.pts, t = 1e9;
      for (var i = 0; (i + 1) < P.length; i++) { t = Math.min(t, segD(x, y, z, P[i], P[i + 1])); }
      d = Math.max(d, k.tunnel.r - t);
    }
    return d;
  }

  function sdf(L) {
    var T  = L.terrain, H = T.heights, nx = T.nx, nz = T.nz,
        c  = T.cell,    x0 = T.x0,     z0 = T.z0,
        Bs = L.buildings || [], Rs = L.rocks || [],
        ceil = ( (typeof L.ceiling === "number") ? L.ceiling : 1e9 );

    // Buildings sorted by z (as trees below): only those within reach
    // of the current bound are tested.
    //
    Bs = Bs.slice().sort(function(a, b) { return a.z - b.z; });
    var Bz = Bs.map(function(b) { return b.z; }), bMax = 0;
    Bs.forEach(function(b) { b._r = 0.5 * Math.sqrt((b.w * b.w) + (b.d * b.d));  bMax = Math.max(bMax, b._r); });
    function firstB(z) {
      var lo = 0, hi = Bz.length;
      while (lo < hi) { var m = (lo + hi) >> 1; if (Bz[m] < z) { lo = m + 1; } else { hi = m; } }
      return lo;
    }

    // Trees sorted by z: only those within reach of the current bound
    // are tested.
    //
    var Ts = (L.trees || []).slice().sort(function(a, b) { return a.z - b.z; }), Tz = Ts.map(function(t) { return t.z; }), tMax = 0;
    Ts.forEach(function(t) { tMax = Math.max(tMax, t.r); });

    // Logs (capsules: fallen trunks and columns, roots, branches) and
    // floating boulders (spheres; drawn lumpy and turning, collision a
    // little inside).
    //
    var Ls = (L.logs || []), Fs = (L.floaters || []);
    Ls.forEach(function(g) { g._z = (g.a[2] + g.b[2]) / 2;  g._hz = (Math.abs(g.a[2] - g.b[2]) / 2) + g.r; });
    function firstZ(z) {
      var lo = 0, hi = Tz.length;
      while (lo < hi) { var m = (lo + hi) >> 1; if (Tz[m] < z) { lo = m + 1; } else { hi = m; } }
      return lo;
    }

    function th(x, z) {
      var gx = clamp((x - x0) / c, 0, nx - 1.0001),
          gz = clamp((z - z0) / c, 0, nz - 1.0001),
          i  = Math.floor(gx), j = Math.floor(gz),
          fx = gx - i,         fz = gz - j,
          a  = H[i + (nx * j)],       b = H[i + 1 + (nx * j)],
          d  = H[i + (nx * (j + 1))], e = H[i + 1 + (nx * (j + 1))];
      return lerp(lerp(a, b, fx), lerp(d, e, fx), fz);
    }

    function f(x, y, z) {
      var h  = th(x, z),
          gx = (th(x + 1, z) - th(x - 1, z)) / 2,
          gz = (th(x, z + 1) - th(x, z - 1)) / 2,
          d  = (y - h) / Math.sqrt(1 + (gx * gx) + (gz * gz));
      d = Math.min(d, ceil - y);

      // Cheap lower bounds skip far buildings and rocks.
      //
      for (var i = firstB(z - d - bMax); (i < Bs.length) && (Bz[i] < (z + d + bMax)); i++) {
        var b = Bs[i], hx = x - b.x, hz = z - b.z;
        if ((Math.sqrt((hx * hx) + (hz * hz)) - b._r) < d) { d = Math.min(d, buildingD(b, x, y, z)); }
      }
      for (var k = 0; k < Rs.length; k++) {
        var r = Rs[k], qz = Math.abs(z - r.center[2]) - r.radii[2] - r.bump;
        if (qz < d) { d = Math.min(d, rockD(r, x, y, z)); }
      }
      if (Ts.length) {
        for (var ti = firstZ(z - d - tMax); (ti < Ts.length) && (Tz[ti] < (z + d + tMax)); ti++) {
          var t = Ts[ti], ex = x - t.x, ez = z - t.z;
          if ((Math.sqrt((ex * ex) + (ez * ez)) - t.r - 1) < d) { d = Math.min(d, treeD(t, x, y, z)); }
        }
      }
      for (var li = 0; li < Ls.length; li++) {
        var lg = Ls[li];
        if ((Math.abs(z - lg._z) - lg._hz) < d) { d = Math.min(d, segD(x, y, z, lg.a, lg.b) - lg.r); }
      }
      for (var fi = 0; fi < Fs.length; fi++) {
        var fo = Fs[fi];
        if ((Math.abs(z - fo.c[2]) - fo.r) < d) { d = Math.min(d, floaterD(fo, x, y, z, 0.92)); }
      }
      return d;
    }
    f.height = th;
    return f;
  }

  // ------------------------------------------------------------ generate

  function generate(opts) {
    var o  = Object.assign({}, DEFAULTS, opts || {}),
        r  = rng(o.seed),
        Ln = o.length,
        ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28],
        sd = (o.seed * 7919) % 100000;

    var zStart  = ZONES.start  * Ln, zFinish = ZONES.finish * Ln,
        zArch   = ZONES.arch   * Ln, zTunnel = ZONES.tunnel * Ln,
        town0   = ZONES.town0  * Ln, town1   = ZONES.town1  * Ln;

    function cx(z)     { return o.wind * ((0.65 * Math.sin((z / 190) + ph[0])) + (0.35 * Math.sin((z / 83) + ph[1]))); }
    function slope(z)  { return (cx(z + 1) - cx(z - 1)) / 2; }
    function hf(z)     { return o.floorHalf + (10 * Math.sin((z / 140) + ph[2])); }
    function riverX(z) { return cx(z) + (18 * Math.sin((z / 65) + ph[3])); }
    function townW(z)  { return smooth(town0 - 30, town0 + 20, z) * smooth(town1 + 30, town1 - 20, z); }

    // Hills on the gully floor, off to one side of the centre.
    //
    var hills = [0.25, 0.66, 0.70].map(function(f) {
      var z = f * Ln, side = ( (r() < 0.5) ? -1 : 1 );
      return { x: cx(z) + (side * hf(z) * (0.45 + (0.25 * r()))), z: z, a: 10 + (8 * r()), s: 20 + (8 * r()) };
    });

    function baseH(x, z) {
      var d = Math.abs(x - cx(z)) - hf(z),
          t = smooth(0, o.wallRun, d),
          n = fbm(x / 40, z / 40, sd, 3) - 0.5,
          h = (2 * n) + (t * (o.wallHeight + (18 * n)));

      // Rock strata: gentle terraces on the walls.
      //
      if (t > 0) {
        var band = h / 9, fr = band - Math.floor(band);
        h += t * (1 - t) * 4 * (smooth(0.55, 0.9, fr) - 0.5) * 3;
      }

      // River channel, then hills, then the end caps.
      //
      h -= 3.2 * (1 - smooth(3, 8, Math.abs(x - riverX(z)))) * (1 - t);
      hills.forEach(function(k) {
        var dx = x - k.x, dz = z - k.z;
        h += k.a * Math.exp(-((dx * dx) + (dz * dz)) / (k.s * k.s));
      });
      var e = Math.max(smooth(45, 0, z), smooth(Ln - 45, Ln, z));
      return ( (e > 0) ? Math.max(h, e * o.wallHeight) : h );
    }

    // ---- terrain grid

    var T = { cell: o.cell, x0: -o.halfWidth, z0: 0,
              nx: Math.round((2 * o.halfWidth) / o.cell) + 1,
              nz: Math.round(Ln / o.cell) + 1, heights: [] };
    for (var j = 0; j < T.nz; j++) {
      for (var i = 0; i < T.nx; i++) {
        T.heights.push(Math.round(baseH(T.x0 + (i * T.cell), T.z0 + (j * T.cell)) * 100) / 100);
      }
    }

    // ---- flight path

    // Features cut through a rock wall: the arch is a thin gate, the
    // tunnel a long hill.
    //
    var feats = [
      { z: zArch,   radii: [0, 34, 12], y: 13 },
      { z: zTunnel, radii: [0, 42, 60], y: 14 }
    ];
    feats.forEach(function(f) { f.radii[0] = hf(f.z) + 42; });

    function groundMax(x, z) {
      var m = -1e9;
      for (var a = -1; a <= 1; a++) {
        for (var b = -1; b <= 1; b++) { m = Math.max(m, baseH(x + (6 * a), z + (6 * b))); }
      }
      return m;
    }

    var P = [];
    for (var z = zStart; z <= (zFinish + 0.01); z += 8) {
      var w = (0.18 * Math.sin((z / 95) + ph[4])) + (townW(z) * 0.42 * Math.sin((2 * Math.PI * (z - town0)) / 150)),
          x = cx(z) + clamp(w * hf(z), -(hf(z) - 12), hf(z) - 12),
          y = groundMax(x, z) + lerp(o.cruise, o.townCruise, townW(z));
      feats.forEach(function(f) {
        var fw = smooth(f.radii[2] + 45, f.radii[2] + 10, Math.abs(z - f.z));
        y = lerp(y, f.y, fw);
      });
      P.push([x, y, z]);
    }
    for (var pass = 0; pass < 6; pass++) {
      var Y = P.map(function(p) { return p[1]; });
      for (var q = 1; (q + 1) < P.length; q++) { P[q][1] = (Y[q - 1] + (2 * Y[q]) + Y[q + 1]) / 4; }
    }
    P.forEach(function(p) {
      var inFeat = feats.some(function(f) { return Math.abs(p[2] - f.z) < (f.radii[2] + 12); });
      if (!inFeat) { p[1] = Math.max(p[1], groundMax(p[0], p[2]) + 6); }
    });
    P = P.map(function(p) { return p.map(function(v) { return Math.round(v * 100) / 100; }); });

    var rocks = feats.map(function(f, n) {
      var tp = P.filter(function(p) { return Math.abs(p[2] - f.z) < (f.radii[2] + 25); });
      return { kind: ( (n === 0) ? "arch" : "tunnel" ), center: [cx(f.z), 0, f.z], radii: f.radii,
               bump: 4, seed: sd + 101 + n, tunnel: { r: o.tunnelR, pts: tp } };
    });

    // Dense samples of the path, used for clearance checks.
    //
    var S = [];
    for (var a = 0; (a + 1) < P.length; a++) {
      for (var t = 0; t < 4; t++) {
        S.push([lerp(P[a][0], P[a + 1][0], t / 4), lerp(P[a][1], P[a + 1][1], t / 4), lerp(P[a][2], P[a + 1][2], t / 4)]);
      }
    }
    S.push(P[P.length - 1]);

    // ---- buildings

    var B = [];
    function tryBuilding(x, z) {
      var tower = (r() < 0.1),
          b = { x: x, z: z,
                w: ( tower ? 7 + (2 * r()) : 8 + (7 * r()) ),
                d: ( tower ? 7 + (2 * r()) : 7 + (6 * r()) ),
                h: ( tower ? 18 + (10 * r()) : 6 + (8 * r()) ),
                roofH: ( tower ? 5 : 3 + (3 * r()) ),
                rot: Math.atan(slope(z)) + ( (r() < 0.5) ? 0 : (Math.PI / 2) ) + ((r() - 0.5) * 0.3),
                wall: Math.floor(r() * 4), roof: Math.floor(r() * 3) },
          c = Math.cos(b.rot), s = Math.sin(b.rot),
          lo = 1e9, hi = -1e9;

      if (rocks.some(function(k) { return Math.abs(z - k.center[2]) < (k.radii[2] + 20); })) { return; }

      // Footprint corners must sit on the dry, flat floor.
      //
      [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].forEach(function(u) {
        var lx = u[0] * b.w / 2, lz = u[1] * b.d / 2,
            h  = baseH(b.x + (lx * c) + (lz * s), b.z - (lx * s) + (lz * c));
        lo = Math.min(lo, h);  hi = Math.max(hi, h);
      });
      if ( (hi > 4) || (lo < (L_WATER + 0.3)) || ((hi - lo) > 2.5) ) { return; }
      b.y = Math.round((lo - 0.8) * 100) / 100;

      var hd = 0.5 * Math.sqrt((b.w * b.w) + (b.d * b.d));
      for (var n = 0; n < B.length; n++) {
        var o2 = B[n], dx = o2.x - b.x, dz = o2.z - b.z,
            hd2 = 0.5 * Math.sqrt((o2.w * o2.w) + (o2.d * o2.d));
        if (Math.sqrt((dx * dx) + (dz * dz)) < (hd + hd2 + 1.5)) { return; }
      }
      for (var m = 0; m < S.length; m++) {
        if ( (Math.abs(S[m][2] - b.z) < 40) &&
             (buildingD(b, S[m][0], S[m][1], S[m][2]) < o.streetClear) ) { return; }
      }
      ["x", "z", "w", "d", "h", "roofH", "rot"].forEach(function(k) { b[k] = Math.round(b[k] * 100) / 100; });
      B.push(b);
    }
    for (var gz = town0; gz < town1; gz += 14) {
      for (var off = -hf(gz); off <= hf(gz); off += 14) {
        if (r() < o.townDensity) { tryBuilding(cx(gz) + off + ((r() - 0.5) * 6), gz + ((r() - 0.5) * 6)); }
      }
    }
    for (var k = 0; k < 40; k++) {
      var zz = lerp(zStart + 40, zFinish - 40, r());
      if (townW(zz) > 0) { continue; }
      tryBuilding(cx(zz) + ((r() - 0.5) * 2 * hf(zz)), zz);
    }

    var level = { format: "dragonride-level", version: 1, seed: o.seed, options: o,
                  length: Ln, ceiling: o.wallHeight + 45, water: L_WATER,
                  terrain: T, rocks: rocks, buildings: B, path: P };
    var F = sdf(level);

    // ---- hoops along the path by arc length; each shrinks if needed
    // so its rim clears nearby walls.
    //
    var cum = [0];
    for (var u = 1; u < P.length; u++) {
      var ax = P[u][0] - P[u - 1][0], ay = P[u][1] - P[u - 1][1], az = P[u][2] - P[u - 1][2];
      cum.push(cum[u - 1] + Math.sqrt((ax * ax) + (ay * ay) + (az * az)));
    }
    var total = cum[cum.length - 1];
    function at(sv) {
      var q = 1;
      while ((q < (cum.length - 1)) && (cum[q] < sv)) { q++; }
      var f = (sv - cum[q - 1]) / (cum[q] - cum[q - 1]), A = P[q - 1], Bp = P[q],
          tx = Bp[0] - A[0], ty = Bp[1] - A[1], tz = Bp[2] - A[2], tl = Math.sqrt((tx * tx) + (ty * ty) + (tz * tz));
      return { p: [lerp(A[0], Bp[0], f), lerp(A[1], Bp[1], f), lerp(A[2], Bp[2], f)], n: [tx / tl, ty / tl, tz / tl] };
    }
    function round3(v) { return v.map(function(x) { return Math.round(x * 1000) / 1000; }); }

    var hoops = [];
    for (var hs = 45; hs < (total - 40); hs += o.hoopSpacing) {
      var A = at(hs), rr = clamp(F(A.p[0], A.p[1], A.p[2]) - 1.5, 3.5, o.hoopR);
      hoops.push({ p: round3(A.p), n: round3(A.n), r: Math.round(rr * 100) / 100 });
    }
    var A0 = at(0), A1 = at(total);
    level.start  = { p: round3(A0.p), n: round3(A0.n) };
    level.finish = { p: round3(A1.p), n: round3(A1.n), r: clamp(F(A1.p[0], A1.p[1], A1.p[2]) - 1.5, 6, o.finishR) };
    level.hoops  = hoops;

    // ---- checks: how close the path comes to anything solid.
    //
    var minC = 1e9, minAt = null;
    S.forEach(function(p) {
      var d = F(p[0], p[1], p[2]);
      if (d < minC) { minC = d;  minAt = p; }
    });
    level.meta = { pathLength: Math.round(total), hoops: hoops.length, buildings: B.length,
                   minClearance: Math.round(minC * 100) / 100, minClearanceAt: round3(minAt), warnings: [] };
    if (minC < 4) { level.meta.warnings.push("path passes within " + minC.toFixed(2) + " of a solid"); }
    return level;
  }

  // ------------------------------------------------------------ validate

  // Check a level against the format (docs/level-format.md).  Errors
  // stop the game from using it; warnings are things that load but
  // likely play badly (a hoop rim inside a wall, the start inside rock).
  //
  function validate(L) {
    var E = [], Wn = [];
    function num(v)  { return ( (typeof v === "number") && isFinite(v) ); }
    function vec3(v) { return ( Array.isArray(v) && (v.length === 3) && v.every(num) ); }
    function need(ok, msg) {
      if (!ok) { E.push(msg); }
      return ok;
    }
    function unit(v, where) {
      if (!need(vec3(v), where + ": must be [x, y, z] numbers")) { return; }
      var l = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
      need(Math.abs(l - 1) < 0.01, where + ": must be a unit vector (length " + l.toFixed(3) + ")");
    }

    if (!need( (L !== null) && (typeof L === "object"), "level must be a JSON object")) { return { errors: E, warnings: Wn }; }
    if (L.format !== "dragonride-level") { Wn.push("format is not \"dragonride-level\""); }
    if (L.version !== 1)                 { Wn.push("version is not 1"); }

    var T = L.terrain;
    if (need( T && (typeof T === "object"), "terrain: missing")) {
      need( Number.isInteger(T.nx) && (T.nx >= 2) && Number.isInteger(T.nz) && (T.nz >= 2), "terrain: nx and nz must be integers >= 2");
      need( num(T.cell) && (T.cell > 0), "terrain: cell must be a number > 0");
      need( num(T.x0) && num(T.z0), "terrain: x0 and z0 must be numbers");
      if (need(Array.isArray(T.heights), "terrain: heights must be an array")) {
        need(T.heights.length === (T.nx * T.nz), "terrain: heights has " + T.heights.length + " values, nx * nz = " + (T.nx * T.nz));
        need(T.heights.every(num), "terrain: every height must be a number");
      }
    }
    if ( (L.water !== undefined) && !num(L.water) )     { E.push("water: must be a number"); }
    if ( (L.ceiling !== undefined) && !num(L.ceiling) ) { E.push("ceiling: must be a number"); }

    if ( (L.buildings !== undefined) && !Array.isArray(L.buildings) ) { E.push("buildings: must be an array"); }
    if ( (L.rocks !== undefined) && !Array.isArray(L.rocks) )         { E.push("rocks: must be an array"); }
    (Array.isArray(L.buildings) ? L.buildings : []).forEach(function(b, i) {
      var w = "buildings[" + i + "]";
      need(["x", "z", "y", "w", "d", "h", "rot"].every(function(k) { return num(b[k]); }), w + ": x, z, y, w, d, h, rot must be numbers");
      need( (b.w > 0) && (b.d > 0) && (b.h > 0), w + ": w, d, h must be > 0");
      need( num(b.roofH) && (b.roofH >= 0), w + ": roofH must be a number >= 0");
      if ( (b.wall !== undefined) && !Number.isInteger(b.wall) ) { E.push(w + ": wall must be an integer"); }
      if ( (b.roof !== undefined) && !Number.isInteger(b.roof) ) { E.push(w + ": roof must be an integer"); }
    });
    (Array.isArray(L.rocks) ? L.rocks : []).forEach(function(k, i) {
      var w = "rocks[" + i + "]";
      need(vec3(k.center), w + ": center must be [x, y, z]");
      need( vec3(k.radii) && k.radii.every(function(v) { return v > 0; }), w + ": radii must be three numbers > 0");
      need( num(k.bump) && (k.bump >= 0), w + ": bump must be a number >= 0");
      need(Number.isInteger(k.seed), w + ": seed must be an integer");
      if (k.tunnel !== undefined) {
        need( k.tunnel && num(k.tunnel.r) && (k.tunnel.r > 0), w + ".tunnel: r must be a number > 0");
        need( k.tunnel && Array.isArray(k.tunnel.pts) && (k.tunnel.pts.length >= 2) && k.tunnel.pts.every(vec3),
              w + ".tunnel: pts must be two or more [x, y, z] points");
      }
    });

    function ring(h, w, needR) {
      if (!need( h && (typeof h === "object"), w + ": missing")) { return; }
      need(vec3(h.p), w + ": p must be [x, y, z]");
      unit(h.n, w + ".n");
      if (needR) { need( num(h.r) && (h.r > 0), w + ": r must be a number > 0"); }
    }
    ring(L.start, "start", false);
    ring(L.finish, "finish", true);
    if (need(Array.isArray(L.hoops), "hoops: must be an array (may be empty)")) {
      L.hoops.forEach(function(h, i) { ring(h, "hoops[" + i + "]", true); });
    }
    if ( (L.path !== undefined) && !( Array.isArray(L.path) && L.path.every(vec3) ) ) { E.push("path: must be a list of [x, y, z]"); }

    // Play checks, only once the shape is right.
    //
    if (!E.length) {
      var F = sdf(L);
      var dist = function(p) { return F(p[0], p[1], p[2]); };
      if (dist(L.start.p) < 3) { Wn.push("start: within 3 (the dragon's radius) of a solid, distance " + dist(L.start.p).toFixed(2)); }
      L.hoops.concat([L.finish]).forEach(function(h, i) {
        var w = ( (i < L.hoops.length) ? "hoops[" + i + "]" : "finish" ), d = dist(h.p);
        if      (d < 0)   { Wn.push(w + ": centre is inside a solid"); }
        else if (d < h.r) { Wn.push(w + ": rim (r " + h.r + ") reaches into a solid " + d.toFixed(2) + " from the centre"); }
      });
    }
    return { errors: E, warnings: Wn };
  }

  var LevelGen = { DEFAULTS: DEFAULTS, ZONES: ZONES, generate: generate, sdf: sdf, validate: validate, rng: rng,
                   util: { clamp: clamp, lerp: lerp, smooth: smooth, fbm: fbm, vnoise: vnoise, buildingD: buildingD, rockD: rockD, segD: segD,
                           treeD: treeD, floaterD: floaterD } };
  root.LevelGen = LevelGen;
  if ((typeof module !== "undefined") && module.exports) { module.exports = LevelGen; }

})(typeof window !== "undefined" ? window : globalThis);
