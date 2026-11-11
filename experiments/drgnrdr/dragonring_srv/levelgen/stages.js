// Sessions: an endless chain of stages generated on demand, for play
// sessions of any length.  Plain script (browser or node), no three.js.
//
//   var S = new LevelGen.Session({ seed: 7 }, color500);
//   var stage = S.stage(k, isFinal);   // a level object (docs/level-format.md)
//                                      // spanning z = k*L .. (k+1)*L
//
// The landscape is one continuous function of position for the whole
// session: the gully's centre line, its floor elevation, and every
// stage-type parameter (floor width, wall height, hills, flying height)
// blend between neighbouring stages over the last / first 12% of each,
// so stages join without seams.  Features (town, arches, tunnels, rock
// spires) stay in each stage's interior.
//
// Stage types: town (houses along a gentle slalom, flown low), canyon
// (narrow and deep, rock arches), highlands (open hills, high flying
// with dives, spires), caves (tunnel hills), spires (open valley with
// rock spires to weave between), basin (cliffs down into lake basins),
// falls (a stepped gorge with waterfalls), mesa (flat-topped hills to
// climb over), ruins (pillar rows and stone gateways), bridges (a deep
// gorge with bridges in five styles), hoodoos (capped rock pillars),
// river (low over wide water), sunken (flooded ruins), slot (a narrow slot canyon with
// wedged boulders), terraces (benched walls), overhang (rock ledges
// overhead), cemetery, dunes (dune desert with pyramids), forest (a
// corridor through dense trees), floating (boulders turning in the air
// over a chasm), temples (abandoned temples, a columned hall over the
// route), swamp (water, islands, swamp trees, logs), crater (craters
// with lava or water pools), roman (colonnades, triumphal arches),
// village (roofless broken houses), giants (old world trees).
//
// Palettes: each stage takes one 5-colour palette (color500 list passed
// in) and assigns colours to roles (terrain, rock, houses, roofs, river,
// hoops, sky, fog); terrain colours blend across stage joins like the
// shape does.
//
(function(root) {
  var LG = root.LevelGen || require("./levelgen.js"), U = LG.util,
      clamp = U.clamp, lerp = U.lerp, smooth = U.smooth, fbm = U.fbm;

  // riverW: width of the river (a flowing water ribbon along the floor);
  // it blends across joins like the rest, so a river narrows to nothing
  // into a dry stage.
  //
  var TYPES = {
    town      : { label: "Gully town",       floorHalf: 62,  wallHeight: 55,  wallRun: 40,  hills: 0,  cruise: 10, swing: 0.15, weave: 0.3,  riverW: 6 },
    canyon    : { label: "Deep canyon",      floorHalf: 34,  wallHeight: 95,  wallRun: 24,  hills: 0,  cruise: 15, swing: 0.35, weave: 0.15, riverW: 6 },
    highlands : { label: "Highlands",        floorHalf: 95,  wallHeight: 22,  wallRun: 120, hills: 26, cruise: 30, swing: 0.7,  weave: 0.2,  riverW: 0 },
    caves     : { label: "Cave run",         floorHalf: 48,  wallHeight: 60,  wallRun: 40,  hills: 5,  cruise: 16, swing: 0.3,  weave: 0.15, riverW: 5 },
    spires    : { label: "Spire valley",     floorHalf: 85,  wallHeight: 35,  wallRun: 70,  hills: 8,  cruise: 18, swing: 0.3,  weave: 0.2,  riverW: 5 },
    basin     : { label: "Cliff basin",      floorHalf: 80,  wallHeight: 60,  wallRun: 40,  hills: 3,  cruise: 14, swing: 0.25, weave: 0.2,  riverW: 9 },
    falls     : { label: "Waterfall gorge",  floorHalf: 44,  wallHeight: 75,  wallRun: 30,  hills: 0,  cruise: 14, swing: 0.2,  weave: 0.15, riverW: 10 },
    mesa      : { label: "Mesa climb",       floorHalf: 110, wallHeight: 30,  wallRun: 100, hills: 5,  cruise: 15, swing: 0.25, weave: 0.15, riverW: 0 },
    ruins     : { label: "Ruined colonnade", floorHalf: 60,  wallHeight: 45,  wallRun: 50,  hills: 2,  cruise: 10, swing: 0.15, weave: 0.2,  riverW: 5 },
    bridges   : { label: "Bridge gorge",     floorHalf: 38,  wallHeight: 100, wallRun: 22,  hills: 0,  cruise: 17, swing: 0.25, weave: 0.15, riverW: 8 },
    hoodoos   : { label: "Hoodoo field",     floorHalf: 100, wallHeight: 28,  wallRun: 90,  hills: 5,  cruise: 12, swing: 0.2,  weave: 0.35, riverW: 0 },
    river     : { label: "River run",        floorHalf: 90,  wallHeight: 40,  wallRun: 60,  hills: 0,  cruise: 7,  swing: 0.25, weave: 0.25, riverW: 70 },
    sunken    : { label: "Sunken ruins",     floorHalf: 85,  wallHeight: 45,  wallRun: 60,  hills: 0,  cruise: 8,  swing: 0.2,  weave: 0.25, riverW: 70 },
    slot      : { label: "Slot canyon",      floorHalf: 17,  wallHeight: 110, wallRun: 14,  hills: 0,  cruise: 12, swing: 0.2,  weave: 0.1,  riverW: 4 },
    terraces  : { label: "Terraced canyon",  floorHalf: 50,  wallHeight: 90,  wallRun: 75,  hills: 0,  cruise: 16, swing: 0.35, weave: 0.2,  riverW: 6, terrace: 1 },
    overhang  : { label: "Overhang canyon",  floorHalf: 40,  wallHeight: 85,  wallRun: 26,  hills: 0,  cruise: 14, swing: 0.2,  weave: 0.15, riverW: 6 },
    cemetery  : { label: "Cemetery",         floorHalf: 70,  wallHeight: 40,  wallRun: 60,  hills: 2,  cruise: 9,  swing: 0.15, weave: 0.25, riverW: 0 },
    dunes     : { label: "Dune desert",      floorHalf: 130, wallHeight: 25,  wallRun: 120, hills: 0,  cruise: 14, swing: 0.15, weave: 0.2,  riverW: 0, dunes: 11 },
    forest    : { label: "Forest",           floorHalf: 75,  wallHeight: 45,  wallRun: 60,  hills: 4,  cruise: 9,  swing: 0.2,  weave: 0.3,  riverW: 5, trees: 0.6 }
  };

  Object.assign(TYPES, {
    floating  : { label: "Floating stones",   floorHalf: 90,  wallHeight: 60, wallRun: 60, hills: 3, cruise: 18, swing: 0.4,  weave: 0.25, riverW: 6 },
    temples   : { label: "Abandoned temples", floorHalf: 85,  wallHeight: 50, wallRun: 55, hills: 2, cruise: 11, swing: 0.15, weave: 0.2,  riverW: 0, trees: 0.03 },
    swamp     : { label: "Swamp",             floorHalf: 95,  wallHeight: 30, wallRun: 70, hills: 0, cruise: 7,  swing: 0.15, weave: 0.3,  riverW: 90, rough: 2.2, trees: 0.22 },
    crater    : { label: "Crater field",      floorHalf: 120, wallHeight: 35, wallRun: 90, hills: 2, cruise: 14, swing: 0.3,  weave: 0.15, riverW: 0 },
    roman     : { label: "Roman columns",     floorHalf: 70,  wallHeight: 45, wallRun: 55, hills: 1, cruise: 11, swing: 0.15, weave: 0.15, riverW: 4 },
    village   : { label: "Abandoned village", floorHalf: 62,  wallHeight: 50, wallRun: 45, hills: 0, cruise: 10, swing: 0.15, weave: 0.3,  riverW: 5, trees: 0.12 },
    giants    : { label: "Old world trees",   floorHalf: 95,  wallHeight: 45, wallRun: 60, hills: 3, cruise: 14, swing: 0.25, weave: 0.3,  riverW: 4, trees: 0.08 }
  });

  // Scattered trees elsewhere (fraction of the forest's density).
  //
  [["town", 0.04], ["highlands", 0.04], ["spires", 0.03], ["basin", 0.03], ["mesa", 0.015], ["ruins", 0.02]].forEach(function(e) {
    TYPES[e[0]].trees = e[1];
  });
  var TYPE_IDS = Object.keys(TYPES);

  // Landscape knobs (all sessions): width / wall / flying height scale
  // every stage type's values; curve scales the valley's bends;
  // spires: rock spires per stage in highlands and spire valleys.
  //
  var DEFAULTS = { seed: 1, stageLength: 2400, cell: 6, halfWidth: 380, types: TYPE_IDS.join(","), hoopSpacing: 70, hoopR: 7,
                   finishR: 12, streetClear: 8, townDensity: 0.4, width: 1, wallHeight: 1, flyHeight: 1, heightVariety: 1, curve: 1, spires: 12,
                   palettes: true, bold: true, palette: -1 };
  var SCALE = { floorHalf: "width", wallHeight: "wallHeight", cruise: "flyHeight" };

  var BLEND = 0.12, MARGIN = 260, SLOPE = 0.42;

  // ---------------------------------------------------------------- colour

  function hex2rgb(h) { var n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
  function rgb2hex(c) {
    return "#" + c.map(function(v) { var s = Math.round(clamp(v, 0, 1) * 255).toString(16); return ( (s.length < 2) ? "0" + s : s ); }).join("");
  }
  function lum(c) { return (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]); }
  function sat(c) { var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]); return ( (mx > 0) ? (mx - mn) / mx : 0 ); }
  function mix(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }

  function boldList(pals) {
    var out = [];
    pals.forEach(function(p, i) {
      var c = p.map(hex2rgb), md = 9;
      for (var a = 0; a < c.length; a++) { for (var b = a + 1; b < c.length; b++) { md = Math.min(md, dist(c[a], c[b])); } }
      if (md >= 0.3) { out.push(i); }
    });
    return out;
  }

  // Five colours -> roles.  The two most saturated colours are accents
  // (roofs, hoops); the other three, a little desaturated, colour the
  // land: the lightest is the floor, the others band the walls, and rock
  // is darker still.  Hoops are an accent pushed light enough to stand
  // out; the sky and fog are the lightest colour washed toward white.
  //
  function grey(c, t) { var l = lum(c); return mix(c, [l, l, l], t); }
  function lighten(c, minL) { var l = lum(c); return ( (l >= minL) ? c : mix(c, [1, 1, 1], (minL - l) / Math.max(0.01, 1 - l)) ); }
  function roles(hexes) {
    var c = hexes.map(hex2rgb), bySat = c.slice().sort(function(a, b) { return sat(b) - sat(a); }), white = [0.93, 0.93, 0.95],
        accent = bySat[0], accent2 = bySat[1],
        land = bySat.slice(2).map(function(x) { return grey(x, 0.3); }).sort(function(a, b) { return lum(a) - lum(b); }),
        all = c.slice().sort(function(a, b) { return lum(a) - lum(b); }),
        floor = land[2], wallA = mix(land[1], floor, 0.25), wallB = land[0];
    return {
      floor: rgb2hex(floor), floor2: rgb2hex(mix(floor, wallA, 0.3)), wallA: rgb2hex(wallA), wallB: rgb2hex(wallB),
      top: rgb2hex(mix(floor, all[4], 0.4)), rock: rgb2hex(mix(wallB, wallA, 0.35)), river: rgb2hex(mix(floor, grey(accent2, 0.3), 0.45)),
      houses: [rgb2hex(all[4]), rgb2hex(mix(all[4], floor, 0.5)), rgb2hex(mix(all[4], white, 0.4))],
      roofs: [rgb2hex(accent), rgb2hex(accent2), rgb2hex(mix(accent, all[0], 0.4))],
      hoop: rgb2hex(lighten(accent, 0.55)), next: rgb2hex(lighten(accent2, 0.75)), finish: rgb2hex(lighten(accent2, 0.6)),
      fog: rgb2hex(mix(all[4], white, 0.45)), skyTop: rgb2hex(mix(grey(all[2], 0.4), white, 0.35)), skyHorizon: rgb2hex(mix(all[4], white, 0.5)),
      stone: rgb2hex(mix(mix(all[4], wallA, 0.45), white, 0.15)),
      wood: rgb2hex(mix(wallB, [0.32, 0.22, 0.14], 0.55)),
      leaf: rgb2hex(mix(grey(accent2, 0.35), [0.12, 0.2, 0.1], 0.35)), leaf2: rgb2hex(mix(grey(accent2, 0.35), land[0], 0.5)),
      hemiSky: rgb2hex(mix(all[4], white, 0.5)), hemiGround: rgb2hex(mix(wallB, all[0], 0.5)), sun: rgb2hex(mix(all[4], white, 0.7))
    };
  }

  // ---------------------------------------------------------------- session

  function Session(opts, palettes) {
    var o = this.o = Object.assign({}, DEFAULTS, opts || {}), r = LG.rng((o.seed * 2654435761) >>> 0);
    this.L     = o.stageLength;
    this.ph    = [];
    for (var i = 0; i < 12; i++) { this.ph.push(r() * 6.283); }
    this.sd    = (o.seed * 7919) % 100000;
    this.types = o.types.split(",").map(function(s) { return s.trim(); }).filter(function(s) { return TYPES[s]; });
    if (!this.types.length) { this.types = TYPE_IDS.slice(); }
    this.pals  = palettes || null;
    this.pool  = ( (this.pals && o.bold) ? boldList(this.pals) : null );
    this.memoT = {};
    this.memoP = {};
    this.memoS = {};
  }

  // Stage type: seeded per stage, never the same twice in a row.
  //
  Session.prototype.typeOf = function(k) {
    if (k < 0) { k = 0; }
    if (this.memoT[k]) { return this.memoT[k]; }
    var r = LG.rng((this.o.seed * 7919) + (k * 104729) + 11), prev = ( (k > 0) ? this.typeOf(k - 1) : null ), t, n = this.types.length;
    do { t = this.types[Math.floor(r() * n)]; } while ( (t === prev) && (n > 1) );
    return (this.memoT[k] = t);
  };

  Session.prototype.paletteOf = function(k) {
    if ( !this.pals || !this.o.palettes ) { return -1; }
    if (this.o.palette >= 0) { return this.o.palette % this.pals.length; }
    if (k < 0) { k = 0; }
    if (this.memoP[k] !== undefined) { return this.memoP[k]; }
    var r = LG.rng((this.o.seed * 31337) + (k * 9973) + 5), list = this.pool || null;
    return (this.memoP[k] = ( list ? list[Math.floor(r() * list.length)] : Math.floor(r() * this.pals.length) ));
  };

  Session.prototype.rolesOf = function(k) {
    var p = this.paletteOf(k);
    return ( (p >= 0) ? roles(this.pals[p]) : null );
  };

  // Blend weight toward the neighbour at stage-relative position t
  // (0.5 exactly at a join, from both sides).
  //
  function blendW(t) {
    if (t < BLEND)       { return { k: -1, w: 1 - smooth(-BLEND, BLEND, t) }; }
    if (t > (1 - BLEND)) { return { k: 1, w: smooth(1 - BLEND, 1 + BLEND, t) }; }
    return { k: 0, w: 0 };
  }
  Session.prototype.blendAt = function(z) {
    var k = Math.floor(z / this.L), b = blendW((z / this.L) - k);
    return { k: k, other: k + b.k, w: b.w };
  };

  Session.prototype.param = function(z, key) {
    var b = this.blendAt(z), v = TYPES[this.typeOf(b.k)][key] || 0;
    if (b.w > 0) { v = lerp(v, TYPES[this.typeOf(b.other)][key] || 0, b.w); }
    return ( SCALE[key] ? v * this.o[SCALE[key]] : v );
  };

  // Gentle, continuous curves: the narrowest turn of the centre line has
  // a radius of about 900.
  //
  Session.prototype.cx = function(z) {
    var p = this.ph;
    return this.o.curve * ((160 * Math.sin((z / 800) + p[0])) + (50 * Math.sin((z / 350) + p[1])) + (12 * Math.sin((z / 170) + p[2])));
  };
  Session.prototype.elev = function(z) {
    var p = this.ph;
    return (55 * Math.sin((z / 2200) + p[3])) + (25 * Math.sin((z / 800) + p[4]));
  };
  Session.prototype.halfFloor = function(z) { return this.param(z, "floorHalf") * (1 + (0.12 * Math.sin((z / 310) + this.ph[5]))); };
  Session.prototype.riverX = function(z) { return this.cx(z) + (0.3 * this.halfFloor(z) * Math.sin((z / 260) + this.ph[6])); };

  // ---------------------------------------------------------------- shapes

  // Stage shapes, inside each stage's interior (so joins never see them):
  // - steps: the height changes by 'dh' over 'r' around 'z' (smoothly);
  //   mode "floor" moves the valley floor only, so the walls stay where
  //   they are and a drop becomes a cliff into a basin; mode "all" moves
  //   the whole landscape (a stepped gorge with waterfalls);
  // - mesas: round flat-topped hills with steep sides.
  // Every stage's steps add up to zero, so the landscape outside is
  // unchanged.  A short ramp is a cliff; the path never follows it
  // straight down (see the slope limit in 'stage').
  //
  var NO_SHAPES = { steps: [], mesas: [], craters: [] };
  Session.prototype.shapesOf = function(k) {
    if (k < 0) { return NO_SHAPES; }
    if (this.memoS[k]) { return this.memoS[k]; }
    var self = this, type = this.typeOf(k), r = LG.rng((this.o.seed * 7877) + (k * 6151) + 3), z0 = k * this.L,
        zA = z0 + MARGIN + 40, zB = z0 + this.L - MARGIN - 40, S = { steps: [], mesas: [], craters: [] };
    function step(z, ramp, dh, mode) { S.steps.push({ z: z, r: ramp, dh: dh, mode: mode }); }

    // Basins: one or two drops of 45..70 with cliff edges (ramp 28..45),
    // flat for 350..650, then a cliff back up.
    //
    if (type === "basin") {
      var n = 1 + Math.floor(r() * 2), cz = zA + (r() * 120);
      for (var i = 0; i < n; i++) {
        var len = 350 + (300 * r()), D = 45 + (25 * r()), rr = 28 + (17 * r());
        if ((cz + len + rr) > zB) { break; }
        step(cz, rr, -D, "floor");
        step(cz + len, rr, D, "floor");
        cz += len + 220 + (200 * r());
      }
    }

    // Waterfall gorge: three or four steps up of 14..24 with near-vertical
    // faces (ramp 10..16), then one long gentle descent back down.
    //
    else if (type === "falls") {
      var fz = zA + 40, tot = 0, ns = 3 + Math.floor(r() * 2);
      for (var s = 0; s < ns; s++) {
        var dh = 14 + (10 * r());
        if ((zB - fz) < ((tot + dh) / 0.12)) { break; }
        step(fz, 10 + (6 * r()), dh, "all");
        tot += dh;
        fz  += 170 + (110 * r());
      }
      step((fz + zB) / 2, zB - fz, -tot, "all");
    }

    // Mesas: some on the route (fly up over the top and dive off the far
    // side), some beside it.
    //
    else if (type === "mesa") {
      var nm = 4 + Math.floor(r() * 3);
      for (var t = 0, m = 0; (m < nm) && (t < 60); t++) {
        var mz = lerp(zA, zB, r()), R = 35 + (30 * r()), hf = this.halfFloor(mz), on = (r() < 0.6),
            mx = this.cx(mz) + ( on ? ((r() - 0.5) * 20) : (( (r() < 0.5) ? -1 : 1 ) * hf * (0.6 + (0.3 * r()))) );
        if (S.mesas.some(function(q) { return Math.abs(q.z - mz) < (q.R + R + 60); })) { continue; }
        S.mesas.push({ x: mx, z: mz, R: R, H: 30 + (25 * r()), edge: 16 + (8 * r()) });
        m++;
      }
    }

    // Crater field: bowls with raised rims, some on the route (a dive in
    // and a climb out), some beside it; each holds a lava or water pool.
    //
    else if (type === "crater") {
      var nc = 4 + Math.floor(r() * 3);
      for (var ct = 0, cn = 0; (cn < nc) && (ct < 80); ct++) {
        var cz = lerp(zA, zB, r()), cR = 32 + (38 * r()), chf = this.halfFloor(cz), con = (r() < 0.5),
            cxx = this.cx(cz) + ( con ? ((r() - 0.5) * 30) : (( (r() < 0.5) ? -1 : 1 ) * chf * (0.4 + (0.5 * r()))) );
        if (S.craters.some(function(q) { return Math.hypot(q.x - cxx, q.z - cz) < ((q.R + cR) * 1.35); })) { continue; }
        S.craters.push({ x: cxx, z: cz, R: cR, D: 12 + (16 * r()), rim: 5 + (7 * r()), lava: (r() < 0.55) });
        cn++;
      }
    }

    // Floating stones: the floor sinks 45 into a long chasm under the
    // boulders.
    //
    else if (type === "floating") {
      step(zA + 120, 220, -45, "floor");
      step(zB - 120, 220, 45, "floor");
    }

    // Elsewhere (not towns or caves), sometimes a gentle dip or rise of
    // the floor.
    //
    else if ( ["town", "caves", "village", "swamp"].indexOf(type) < 0 && (r() < 0.4) ) {
      var gz = lerp(zA + 100, zB - 600, r()), glen = 300 + (200 * r()), gD = (20 + (20 * r())) * ( (r() < 0.6) ? -1 : 1 ),
          gr = 80 + (60 * r());
      step(gz, gr, gD, ( (gD < 0) ? "floor" : "all" ));
      step(gz + glen, gr, -gD, ( (gD < 0) ? "floor" : "all" ));
    }
    return (this.memoS[k] = S);
  };

  // Height offsets at z: 'all' (whole landscape) and 'floor' (valley floor).
  //
  Session.prototype.offsets = function(z) {
    var S = this.shapesOf(Math.floor(z / this.L)), a = 0, f = 0;
    for (var i = 0; i < S.steps.length; i++) {
      var s = S.steps[i], v = s.dh * smooth(s.z - (s.r / 2), s.z + (s.r / 2), z);
      if (s.mode === "all") { a += v; }
      else                  { f += v; }
    }
    return { all: a, floor: f };
  };
  Session.prototype.mesaH = function(x, z) {
    var S = this.shapesOf(Math.floor(z / this.L)), h = 0;
    for (var i = 0; i < S.mesas.length; i++) {
      var m = S.mesas[i], dz = z - m.z;
      if (Math.abs(dz) > m.R) { continue; }
      h = Math.max(h, m.H * smooth(m.R, m.R - m.edge, Math.hypot(x - m.x, dz)));
    }
    return h;
  };

  // Craters: a bowl (depth D) inside radius R with a rim (height 'rim')
  // around it.
  //
  Session.prototype.craterH = function(x, z) {
    var S = this.shapesOf(Math.floor(z / this.L)), h = 0;
    for (var i = 0; i < S.craters.length; i++) {
      var c = S.craters[i], dz = z - c.z;
      if (Math.abs(dz) > (c.R * 1.8)) { continue; }
      var d = Math.hypot(x - c.x, dz) / c.R;
      h += ( (d < 1) ? c.D * ((d * d) - 1) : 0 ) + (c.rim * Math.exp(-((d - 1) / 0.22) * ((d - 1) / 0.22)));
    }
    return h;
  };

  // Valley floor height (no noise) at z.
  //
  Session.prototype.floorY = function(z) { var o = this.offsets(z); return this.elev(z) + o.all + o.floor; };

  // True when z is within 'pad' of a step's ramp or a mesa.
  //
  Session.prototype.busy = function(z, pad) {
    var S = this.shapesOf(Math.floor(z / this.L));
    return ( S.steps.some(function(s) { return Math.abs(z - s.z) < ((s.r / 2) + pad); }) ||
             S.mesas.some(function(m) { return Math.abs(z - m.z) < (m.R + pad); }) ||
             S.craters.some(function(c) { return Math.abs(z - c.z) < ((1.4 * c.R) + pad); }) );
  };

  Session.prototype.baseH = function(x, z) {
    var hf = this.halfFloor(z), d = Math.abs(x - this.cx(z)) - hf, run = this.param(z, "wallRun"), of = this.offsets(z),
        e = this.elev(z) + of.all,
        t = smooth(0, run, d), n = fbm(x / 45, z / 45, this.sd, 3) - 0.5,
        wall = this.param(z, "wallHeight") * (1 + (0.35 * n)),
        hills = this.param(z, "hills") * Math.max(0, fbm(x / 90, z / 90, this.sd + 9, 3) - 0.42) * 3,
        tw = t * wall, ter = this.param(z, "terrace"), du = this.param(z, "dunes");

    // Terraces: the wall climbs in benches of 15 with steep risers.
    //
    if (ter > 0) { var tq = tw / 15;  tw = lerp(tw, 15 * (Math.floor(tq) + smooth(0.78, 1, tq - Math.floor(tq))), ter); }
    var h = e + (2 * n) + (hills * (1 - (t * 0.5))) + tw;
    if (t > 0) {
      var band = (h - e) / 9, fr = band - Math.floor(band);
      h += t * (1 - t) * 4 * (smooth(0.55, 0.9, fr) - 0.5) * 3 * (1 - ter);
    }

    // Dunes: ridges across the valley (wavy, uneven) with a long gentle
    // back and a short steep slip face.
    //
    if (du > 0) {
      var dv = (z / 75) + (0.7 * Math.sin((x / 60) + this.ph[9])) + (1.6 * (fbm(x / 140, z / 140, this.sd + 17, 2) - 0.5)),
          df = dv - Math.floor(dv), prof = ( (df < 0.64) ? smooth(0, 0.64, df) : 1 - smooth(0.64, 1, df) );
      h += du * prof * (0.4 + fbm(x / 110, z / 110, this.sd + 23, 2)) * (1 - (0.6 * t));
    }
    var mh = this.mesaH(x, z), ro = this.param(z, "rough");

    // Swamp: bumpy ground around the water level (islands and pools).
    //
    if (ro > 0) { h += ro * 2 * (fbm(x / 22, z / 22, this.sd + 31, 2) - 0.5) * (1 - t); }
    h += (of.floor * (1 - t)) + mh + (this.craterH(x, z) * (1 - t));
    h -= 3.2 * (1 - smooth(3, 9, Math.abs(x - this.riverX(z)))) * (1 - t) * (1 - smooth(0, 4, mh));
    return h;
  };

  // Highest ground within 7 (n = 1) or 10 (n = 2, for steep ground).
  //
  Session.prototype.groundMax = function(x, z, n) {
    var m = -1e9, e = ( (n === 2) ? 5 : 7 );
    n = n || 1;
    for (var a = -n; a <= n; a++) { for (var b = -n; b <= n; b++) { m = Math.max(m, this.baseH(x + (e * a), z + (e * b))); } }
    return m;
  };

  // Path position for station z, before features and smoothing: a
  // gentle slalom around the centre line, at the stage type's height
  // above ground with long swells (dives and climbs).
  //
  // Height plan per stage (seeded): how high above the stage type's
  // own flying height the route runs.  low (as the type), mid (+14..22,
  // among roofs and tree tops), high (+32..50, over everything), or vary
  // (rising and falling by up to 25..45 with a period of 500..900).
  //
  Session.prototype.planOf = function(k) {
    if (k < 0) { k = 0; }
    this.memoH = this.memoH || {};
    if (this.memoH[k]) { return this.memoH[k]; }
    var r = LG.rng((this.o.seed * 4241) + (k * 7187) + 9), roll = r(), p;
    if      (roll < 0.3)  { p = { mode: "low", a: 0 }; }
    else if (roll < 0.55) { p = { mode: "mid", a: 14 + (8 * r()) }; }
    else if (roll < 0.75) { p = { mode: "high", a: 32 + (18 * r()) }; }
    else                  { p = { mode: "vary", a: 25 + (20 * r()), per: 500 + (400 * r()), ph: r() * 6.283 }; }
    return (this.memoH[k] = p);
  };
  Session.prototype.liftOf = function(k, z) {
    var p = this.planOf(k);
    return ( (p.mode === "vary") ? p.a * 0.5 * (1 - Math.cos(((6.283 * z) / p.per) + p.ph)) : p.a );
  };
  Session.prototype.lift = function(z) {
    var b = this.blendAt(z), v = this.liftOf(b.k, z);
    if (b.w > 0) { v = lerp(v, this.liftOf(b.other, z), b.w); }
    return v * this.o.heightVariety;
  };

  Session.prototype.rawPath = function(z) {
    var p = this.ph, hf = this.halfFloor(z),
        w = this.param(z, "weave") * Math.sin((z / 90) + p[7]),
        x = this.cx(z) + clamp(w * hf, -(hf - 14), hf - 14),
        cr = this.param(z, "cruise") * (1 + (this.param(z, "swing") * Math.sin((z / 300) + p[8]))),
        g = this.groundMax(x, z);
    return [x, g + Math.max(7, cr) + this.lift(z), z, g];
  };

  // ---------------------------------------------------------------- stage

  Session.prototype.stage = function(k, isFinal) {
    var self = this, o = this.o, L = this.L, z0 = k * L, z1 = z0 + L, type = this.typeOf(k), T = TYPES[type],
        r = LG.rng((o.seed * 1000003) + (k * 7919) + 1), first = (k === 0);

    // ---- terrain (end caps at the session's start and finish only)
    //
    var cell = o.cell, ter = { cell: cell, x0: -o.halfWidth, z0: z0, nx: Math.round((2 * o.halfWidth) / cell) + 1,
                               nz: Math.round(L / cell) + 1, heights: [] }, hmax = -1e9;
    function capH(x, z, h) {
      var e = 0;
      if (first)   { e = Math.max(e, smooth(z0 + 45, z0, z)); }
      if (isFinal) { e = Math.max(e, smooth(z1 - 45, z1, z)); }
      return ( (e > 0) ? Math.max(h, self.elev(z) + (e * 90)) : h );
    }
    for (var j = 0; j < ter.nz; j++) {
      for (var i = 0; i < ter.nx; i++) {
        var hx = ter.x0 + (i * cell), hz = z0 + (j * cell), hh = capH(hx, hz, this.baseH(hx, hz));
        ter.heights.push(Math.round(hh * 100) / 100);
        hmax = Math.max(hmax, hh);
      }
    }

    // ---- features in the interior
    //
    var feats = [], zA = z0 + MARGIN, zB = z1 - MARGIN;
    function place(n, minGap, fn) {
      for (var t = 0; (t < (n * 20)) && (n > 0); t++) {
        var z = lerp(zA, zB, r());
        if (feats.some(function(f) { return Math.abs(f.z - z) < minGap; })) { continue; }
        if (self.busy(z, 120)) { continue; }
        fn(z);
        n--;
      }
    }
    if (type === "canyon")    { place(3, 380, function(z) { feats.push({ kind: "arch", z: z, rz: 12 }); }); }
    if (type === "caves")     { place(2 + Math.floor(r() * 2), 420, function(z) { feats.push({ kind: "tunnel", z: z, rz: 60 + (30 * r()) }); }); }
    if ( ["highlands", "caves", "spires", "basin", "mesa", "bridges", "hoodoos", "river", "terraces", "overhang", "dunes"].indexOf(type) >= 0 && (r() < 0.3) ) { place(1, 300, function(z) { feats.push({ kind: "arch", z: z, rz: 12 }); }); }
    feats.sort(function(a, b) { return a.z - b.z; });

    // ---- path: raw stations over a margin beyond the stage (so the
    // smoothing gives the same values at a join from both sides), then
    // features pull the height, then smoothing.
    //
    var step = 8, P = [];
    for (var z = z0 - 96; z <= (z1 + 96); z += step) { P.push(this.rawPath(z)); }
    P.forEach(function(q) {
      feats.forEach(function(f) {
        var half = f.rz + 45, w = smooth(half + 50, half, Math.abs(q[2] - f.z));
        if (w > 0) { q[1] = lerp(q[1], self.floorY(f.z) + 14, w); }
      });
    });
    function smoothY(passes) {
      for (var pass = 0; pass < passes; pass++) {
        var Y = P.map(function(q) { return q[1]; });
        for (var m = 1; (m + 1) < P.length; m++) { P[m][1] = (Y[m - 1] + (2 * Y[m]) + Y[m + 1]) / 4; }
      }
    }
    function clear(gap) {
      P.forEach(function(q) {
        var inFeat = feats.some(function(f) { return Math.abs(q[2] - f.z) < (f.rz + 12); });
        if (!inFeat) { q[1] = Math.max(q[1], self.groundMax(q[0], q[2], 2) + gap); }
      });
    }
    smoothY(6);
    clear(6);

    // Slope limit: the path never climbs or dives steeper than SLOPE, by
    // raising points only (so clearance holds): over a cliff edge it dives
    // gradually, and it starts climbing well before a rise.  Then a light
    // smoothing rounds the corners, and clearance again.
    //
    function limit() {
      for (var a1 = 1; a1 < P.length; a1++)      { P[a1][1] = Math.max(P[a1][1], P[a1 - 1][1] - (SLOPE * step)); }
      for (var a2 = P.length - 2; a2 >= 0; a2--) { P[a2][1] = Math.max(P[a2][1], P[a2 + 1][1] - (SLOPE * step)); }
    }
    limit();
    smoothY(3);
    clear(( (type === "mesa") ? 8 : ( (type === "dunes") ? 7 : 5 ) ));
    limit();
    P = P.filter(function(q) { return (q[2] >= (z0 + ( first ? 55 : 0 ))) && (q[2] <= (z1 - ( isFinal ? 60 : 0 ))); });

    // ---- rocks: arches and tunnels along the path, spires beside it
    //
    var rocks = [];
    feats.forEach(function(f, n) {
      if ( (f.kind !== "arch") && (f.kind !== "tunnel") ) { return; }
      var hf = self.halfFloor(f.z), tp = P.filter(function(q) { return Math.abs(q[2] - f.z) < (f.rz + 25); }).map(function(q) { return [q[0], q[1], q[2]]; });
      rocks.push({ kind: f.kind, center: [self.cx(f.z), self.floorY(f.z), f.z],
                   radii: [hf + 45, ( (f.kind === "arch") ? 34 : 44 ), f.rz], bump: 4, seed: self.sd + 101 + (k * 17) + n,
                   tunnel: { r: 11, pts: tp } });
    });

    // Spires (highlands, spire valleys), sea stacks in river runs, and
    // hoodoos: short thin spires, each with a flat cap rock.
    //
    var hood = (type === "hoodoos"),
        spireN = ( ((type === "highlands") || (type === "spires")) ? Math.round(o.spires * ( (type === "spires") ? 1.5 : 1 )) :
                   ( hood ? Math.round(o.spires * 3.5) : ( (type === "river") ? Math.round(o.spires * 0.6) : 0 ) ) );
    for (var s = 0, tries = 0; (s < spireN) && (tries < 600); tries++) {
      var sz = lerp(zA, zB, r()), shf = self.halfFloor(sz), sx = self.cx(sz) + ((r() - 0.5) * 2 * shf * 0.9),
          rad = ( hood ? 3 + (2.5 * r()) : 5 + (5 * r()) ), tall = ( hood ? 10 + (16 * r()) : 25 + (35 * r()) ),
          reach = ( hood ? rad * 1.9 : rad );
      if (feats.some(function(f) { return Math.abs(f.z - sz) < (f.rz + 40); })) { continue; }
      if (P.some(function(q) { return (Math.abs(q[2] - sz) < 30) && (Math.hypot(q[0] - sx, q[2] - sz) < (reach + 13)); })) { continue; }
      var sy = self.baseH(sx, sz) - 4;
      rocks.push({ kind: "spire", center: [sx, sy, sz], radii: [rad, tall, rad], bump: ( hood ? 2 : 3 ), seed: self.sd + 300 + (k * 31) + s });
      if (hood) {
        rocks.push({ kind: "cap", center: [sx, sy + tall - 0.5, sz], radii: [reach, rad * 0.6, reach], bump: 1.2, seed: self.sd + 700 + (k * 31) + s });
      }
      s++;
    }

    // A rock is kept only if the path stays 'gap' clear of it.
    //
    function rockClear(rk, gap) {
      return !P.some(function(q) { return (Math.abs(q[2] - rk.center[2]) < (rk.radii[2] + 10)) && (U.rockD(rk, q[0], q[1], q[2]) < gap); });
    }

    // Overhang canyon: rock ledges jutting from both walls high over the
    // floor.  Slot canyon: boulders wedged between the walls overhead.
    //
    if (type === "overhang") {
      for (var lsd = -1; lsd <= 1; lsd += 2) {
        for (var lz = zA + (100 * r()); lz < zB; lz += 140 + (80 * r())) {
          var lhf = self.halfFloor(lz), lrun = self.param(lz, "wallRun"),
              ledge = { kind: "ledge", center: [self.cx(lz) + (lsd * (lhf + (lrun * 0.9))), self.floorY(lz) + (self.param(lz, "wallHeight") * (0.45 + (0.3 * r()))), lz],
                        radii: [(lrun * 0.9) + (lhf * 0.55), 5 + (3 * r()), 25 + (15 * r())], bump: 2.5, seed: self.sd + 900 + rocks.length };
          for (var lt = 0; (lt < 3) && !rockClear(ledge, 9); lt++) { ledge.radii[0] *= 0.75; }
          if (rockClear(ledge, 9)) { rocks.push(ledge); }
        }
      }
    }
    if (type === "slot") {
      for (var cs = zA + (100 * r()); cs < zB; cs += 220 + (180 * r())) {
        if (self.busy(cs, 20)) { continue; }
        var csy = Math.max.apply(null, P.filter(function(q) { return Math.abs(q[2] - cs) < 12; }).map(function(q) { return q[1]; })),
            chock = { kind: "boulder", center: [self.cx(cs), csy + 14 + (8 * r()), cs], radii: [self.halfFloor(cs) + 8, 4 + (2 * r()), 5], bump: 1.5,
                      seed: self.sd + 950 + rocks.length };
        for (var ct = 0; (ct < 3) && !rockClear(chock, 9); ct++) { chock.center[1] += 4; }
        if (rockClear(chock, 9)) { rocks.push(chock); }
      }
    }

    var path = P.map(function(q) { return [q[0], q[1], q[2]]; });

    var level = { format: "dragonride-level", version: 1, seed: o.seed, stage: k, type: type, label: T.label, final: !!isFinal,
                  length: L, ceiling: hmax + 120, terrain: ter, rocks: rocks, buildings: [],
                  path: path.map(function(q) { return [round2(q[0]), round2(q[1]), round2(q[2])]; }),
                  palette: this.paletteOf(k), roles: this.rolesOf(k), rolesPrev: this.rolesOf(k - 1), rolesNext: this.rolesOf(k + 1),
                  blend: BLEND, river: [] };
    for (var rj = 0; rj < ter.nz; rj++) { level.river.push(round2(this.riverX(z0 + (rj * cell)))); }

    // ---- town
    //
    if ( (type === "town") || (type === "village") ) {
      var B = [], samples = [];
      P.forEach(function(q) { samples.push(q); });
      var tryB = function(x, z) {
        var b = { x: x, z: z, w: 8 + (7 * r()), d: 7 + (6 * r()), h: 6 + (8 * r()), roofH: 3 + (3 * r()),
                  rot: Math.atan((self.cx(z + 1) - self.cx(z - 1)) / 2) + ( (r() < 0.5) ? 0 : (Math.PI / 2) ) + ((r() - 0.5) * 0.3),
                  wall: Math.floor(r() * 3), roof: Math.floor(r() * 3) }, c = Math.cos(b.rot), sn = Math.sin(b.rot), lo = 1e9, hi = -1e9;
        if (r() < 0.1) { b.w = b.d = 7 + (2 * r());  b.h = 18 + (10 * r());  b.roofH = 5; }
        [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].forEach(function(u) {
          var lx = u[0] * b.w / 2, lz = u[1] * b.d / 2, hh = self.baseH(b.x + (lx * c) + (lz * sn), b.z - (lx * sn) + (lz * c));
          lo = Math.min(lo, hh);  hi = Math.max(hi, hh);
        });
        var e = self.floorY(z);
        if ( (hi > (e + 4)) || (lo < (e - 1.0)) || ((hi - lo) > 2.5) ) { return; }
        b.y = lo - 0.8;
        var hd = 0.5 * Math.hypot(b.w, b.d);
        if (B.some(function(q) { return Math.hypot(q.x - b.x, q.z - b.z) < (hd + (0.5 * Math.hypot(q.w, q.d)) + 1.5); })) { return; }
        if (samples.some(function(q) { return (Math.abs(q[2] - b.z) < 40) && (U.buildingD(b, q[0], q[1], q[2]) < o.streetClear); })) { return; }
        ["x", "y", "z", "w", "d", "h", "roofH", "rot"].forEach(function(key) { b[key] = round2(b[key]); });
        B.push(b);
      };
      for (var gz = zA; gz < zB; gz += 14) {
        var ghf = self.halfFloor(gz);
        for (var off = -ghf; off <= ghf; off += 14) {
          if (r() < (o.townDensity * ( (type === "village") ? 0.8 : 1 ))) { tryB(self.cx(gz) + off + ((r() - 0.5) * 6), gz + ((r() - 0.5) * 6)); }
        }
      }

      // Abandoned village: each house is only its walls, broken to
      // uneven heights, some missing, a gap for the door, no roof.
      //
      if (type === "village") {
        var VB = [];
        B.forEach(function(b) {
          var c = Math.cos(b.rot), sn = Math.sin(b.rot);
          function piece(lx, lz, w, d, h) {
            VB.push({ x: round2(b.x + (lx * c) + (lz * sn)), z: round2(b.z - (lx * sn) + (lz * c)), y: b.y, w: round2(w), d: round2(d), h: round2(h),
                      roofH: 0, rot: b.rot, kind: "stone" });
          }
          function hh() { return b.h * ( (r() < 0.3) ? 0.15 + (0.3 * r()) : 0.6 + (0.4 * r()) ); }
          if (r() > 0.12) { piece(0, -b.d / 2, b.w, 0.8, hh()); }
          if (r() > 0.12) { piece(-b.w / 2, 0, 0.8, b.d, hh()); }
          if (r() > 0.12) { piece(b.w / 2, 0, 0.8, b.d, hh()); }
          var half = (b.w - 2.2) / 4;
          piece(-(b.w / 2) + half, b.d / 2, half * 2, 0.8, hh());
          piece((b.w / 2) - half, b.d / 2, half * 2, 0.8, hh());
          if (r() < 0.2) { piece((r() - 0.5) * b.w * 0.6, (r() - 0.5) * b.d * 0.6, 1.4, 1.4, b.h + b.roofH); }
        });
        B = VB;
      }
      level.buildings = B;
    }

    // ---- stone structures (buildings of kind "stone": plain boxes, no
    // roof): colonnades and gateways in ruins, bridges across gorges.
    //
    var SB = [];
    function pathAt(z) {
      var f = clamp((z - path[0][2]) / step, 0, path.length - 1.001), i = Math.floor(f), u = f - i, A = path[i], Bq = path[i + 1];
      return [lerp(A[0], Bq[0], u), lerp(A[1], Bq[1], u), z, (Bq[0] - A[0]) / ((Bq[2] - A[2]) || 1)];
    }
    function topY(z, half) {
      var m = -1e9;
      for (var t = -half; t <= half; t += 2) { m = Math.max(m, pathAt(z + t)[1]); }
      return m;
    }

    // Place one block.  Without 'y' it stands on the ground (its base a
    // little below the lowest corner) and reaches 'top' (or 'h' above the
    // highest corner).  'gap' > 0: skip it if it comes nearer than 'gap'
    // to the path.
    //
    function stone(b, gap) {
      if (b.y === undefined) {
        var c = Math.cos(b.rot), sn = Math.sin(b.rot), lo = 1e9, hi = -1e9;
        [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].forEach(function(u) {
          var lx = u[0] * b.w / 2, lz = u[1] * b.d / 2, hh = self.baseH(b.x + (lx * c) + (lz * sn), b.z - (lx * sn) + (lz * c));
          lo = Math.min(lo, hh);  hi = Math.max(hi, hh);
        });
        b.y = lo - 1;
        b.h = ( (b.top !== undefined) ? b.top - b.y : b.h + (hi - b.y) );
        delete b.top;
      }
      if (b.h < 0.3) { return false; }
      b.roofH = b.roofH || 0;
      if ( (gap > 0) && path.some(function(q) { return (Math.abs(q[2] - b.z) < 40) && (U.buildingD(b, q[0], q[1], q[2]) < gap); }) ) { return false; }
      b.kind = b.kind || "stone";
      ["x", "y", "z", "w", "d", "h", "rot", "roofH"].forEach(function(key) { b[key] = round2(b[key]); });
      SB.push(b);
      return true;
    }
    function beside(z, lat) {
      var q = pathAt(z), m = q[3], nm = Math.sqrt(1 + (m * m));
      return { x: q[0] + (lat / nm), z: z - ((lat * m) / nm), rot: Math.atan(m) };
    }

    // A gateway: two pillars either side of the route and a lintel
    // 'clear' above the path's highest point under it.
    //
    // How high the route is above the ground at z (gateways, halls and
    // arches over the route are built only where it runs low).
    //
    function aboveGround(z) { var q = pathAt(z); return q[1] - self.baseH(q[0], z); }
    function gateway(z, half, clear) {
      if (aboveGround(z) > 20) { return; }
      var q = pathAt(z), rot = Math.atan(q[3]), y = topY(z, 6) + clear, ok = true;
      [-1, 1].forEach(function(sd) { var p = beside(z, sd * half); ok = ok && stone({ x: p.x, z: p.z, w: 3.2, d: 3.2, top: y + 3, rot: rot }, 6); });
      if (ok) { stone({ x: q[0], z: z, y: y, w: (2 * half) + 4, d: 3.4, h: 3, rot: rot }, 0); }
    }

    // Bridges across the valley, 'lift' above the path's highest point
    // under them, in five styles:
    // - slab: a deck from wall to wall, parapets, piers clear of the route;
    // - arch: a stone wall across the valley with a round arch over the
    //   route (a rock with a tunnel) and a deck on top;
    // - aqueduct: a high deck on a row of piers, flown between two;
    // - rope: a sagging wooden plank bridge with rail posts;
    // - broken: a deck at the route's height with its middle fallen out,
    //   flown through the gap, and the fallen blocks below.
    //
    var BRIDGES = ["slab", "arch", "aqueduct", "rope", "broken"];
    function bridge(z, lift, style) {
      if (self.busy(z, 30)) { return; }
      var hf = self.halfFloor(z), run = self.param(z, "wallRun"), cz = self.cx(z), rot = Math.atan((self.cx(z + 1) - self.cx(z - 1)) / 2),
          q = pathAt(z), y = topY(z, 8) + lift, c = Math.cos(rot), sn = Math.sin(rot), W = 2 * (hf + (run * 0.9)), fy = self.floorY(z);
      if (y > (fy + (0.85 * self.param(z, "wallHeight")))) { return; }
      function at(lx, b) { b.x = cz + (c * lx);  b.z = z - (sn * lx);  b.rot = rot;  return b; }
      function parapets(w, yy) { [-1, 1].forEach(function(sd) { stone({ x: cz + (sn * sd * 3.1), z: z + (c * sd * 3.1), y: yy, w: w, d: 0.8, h: 1.2, rot: rot }, 0); }); }
      if (style === "slab") {
        stone(at(0, { y: y, w: W, d: 7, h: 2.5 }), 0);
        parapets(2 * (hf + (run * 0.6)), y + 2.5);
        [-0.75, -0.4, 0.4, 0.75].forEach(function(f) { stone(at(f * hf, { w: 4, d: 5, top: y }), 7); });
      }
      else if (style === "arch") {
        var base = fy - 40, ar = { kind: "arch", mat: "stone", center: [round2(cz), round2(base), round2(z)], radii: [round2(W / 2), round2(y - base + 1), 4.5],
                                   bump: 0.6, seed: self.sd + 1200 + rocks.length,
                                   tunnel: { r: round2(lift - 3), pts: path.filter(function(p) { return Math.abs(p[2] - z) < 16; }).map(function(p) { return p.map(round2); }) } };
        rocks.push(ar);
        stone(at(0, { y: y, w: W, d: 9, h: 2.5 }), 0);
        parapets(2 * (hf + (run * 0.6)), y + 2.5);
      }
      else if (style === "aqueduct") {
        stone(at(0, { y: y, w: W, d: 6, h: 3 }), 0);
        parapets(2 * (hf + (run * 0.7)), y + 3);
        for (var px = -W / 2; px <= (W / 2); px += 13) { stone(at(px, { w: 3.5, d: 5, top: y }), 9); }
      }
      else if (style === "rope") {
        var sag = 6 + (4 * r());
        for (var xl = -W / 2, pi = 0; xl <= (W / 2); xl += 2.2, pi++) {
          var yl = y + (sag * (2 * xl / W) * (2 * xl / W)), wx = cz + (c * xl), wz = z - (sn * xl);
          if (yl < (self.baseH(wx, wz) + 0.6)) { continue; }
          stone(at(xl, { y: yl, w: 2.1, d: 3.6, h: 0.35, kind: "wood" }), 0);
          if ((pi % 3) === 0) {
            [-1.7, 1.7].forEach(function(o2) { stone({ x: wx + (sn * o2), z: wz + (c * o2), y: yl + 0.35, w: 0.3, d: 0.3, h: 1.6, rot: rot, kind: "wood" }, 0); });
          }
        }
      }
      else {
        var lp = (q[0] - cz) / c, yb = q[1] - 1.25, gapH = 12 + (3 * r());
        [[-W / 2, lp - gapH], [lp + gapH, W / 2]].forEach(function(seg) {
          if (seg[1] <= seg[0]) { return; }
          stone(at((seg[0] + seg[1]) / 2, { y: yb, w: seg[1] - seg[0], d: 7, h: 2.5 }), 0);
          stone(at((seg[0] + seg[1]) / 2, { y: yb + 2.5, w: seg[1] - seg[0], d: 0.8, h: 1.2 }), 0);
          var mid = (seg[0] + seg[1]) / 2;
          stone(at(mid, { w: 4, d: 5, top: yb }), 8);
        });
        for (var fb = 0; fb < 4; fb++) {
          stone(at(lp + ((r() - 0.5) * 30), { w: 3 + (4 * r()), d: 2.5 + (3 * r()), h: 1.5 + (1.5 * r()) }), 7);
          SB[SB.length - 1].rot = round2(r() * 3.14);
        }
      }
    }

    // A stepped pyramid: 'levels' blocks, each 'step' tall, narrowing to
    // 20% at the top.  Skipped whole if any block comes near the route.
    //
    function ziggurat(x, z, size, levels, step2, rot) {
      var n0 = SB.length, base = stone({ x: x, z: z, w: size, d: size, h: step2, rot: rot }, 10);
      if (!base) { return; }
      var y0 = SB[n0].y + SB[n0].h;
      for (var lv = 1; lv < levels; lv++) {
        var w = size * (1 - (0.8 * lv / levels));
        if (!stone({ x: x, z: z, y: y0 + ((lv - 1) * step2), w: w, d: w, h: step2, rot: rot }, 10)) { SB.length = n0;  return; }
      }
    }
    function valleyRot(z) { return Math.atan((self.cx(z + 1) - self.cx(z - 1)) / 2); }

    if (type === "ruins") {
      for (var cz2 = zA; cz2 < zB; cz2 += 22 + (6 * r())) {
        if (r() < 0.15) { continue; }
        for (var sd2 = -1; sd2 <= 1; sd2 += 2) {
          var lat = 13 + (3 * r()), br = (r() < 0.25), fal = (r() < 0.08), bp = beside(cz2, sd2 * ( fal ? lat + 5 : lat ));
          if (fal) { stone({ x: bp.x, z: bp.z, w: 9, d: 2.6, h: 2.6, rot: r() * 3.14 }, 6); }
          else     { stone({ x: bp.x, z: bp.z, w: 3, d: 3, h: ( br ? 3 + (4 * r()) : 11 + (7 * r()) ), rot: bp.rot }, 6); }
        }
      }
      for (var gz2 = zA + 100 + (100 * r()); gz2 < zB; gz2 += 220 + (120 * r())) { gateway(gz2, 11, 8.5); }
      if (r() < 0.6) {
        var zz = lerp(zA, zB, r()), zs = ( (r() < 0.5) ? -1 : 1 ), zp = beside(zz, zs * (32 + (12 * r())));
        ziggurat(zp.x, zp.z, 18 + (8 * r()), 5 + Math.floor(r() * 3), 3, zp.rot);
      }
    }

    // Sunken ruins: broken pillar rows and gateways standing in the water,
    // drowned stone houses (only roofs and wall tops showing), and stepped
    // temples beside the route.
    //
    if (type === "sunken") {
      for (var sz2 = zA; sz2 < zB; sz2 += 26 + (10 * r())) {
        if (r() < 0.3) { continue; }
        for (var ss = -1; ss <= 1; ss += 2) {
          if (r() < 0.3) { continue; }
          var sp = beside(sz2, ss * (13 + (5 * r())));
          stone({ x: sp.x, z: sp.z, w: 3, d: 3, h: ( (r() < 0.5) ? 2 + (4 * r()) : 9 + (8 * r()) ), rot: sp.rot }, 6);
        }
      }
      for (var sg = zA + 80 + (80 * r()); sg < zB; sg += 280 + (160 * r())) { gateway(sg, 11, 8.5); }
      for (var sh = 0; sh < 14; sh++) {
        var hz2 = lerp(zA, zB, r()), hp2 = beside(hz2, ( (r() < 0.5) ? -1 : 1 ) * (24 + (40 * r())));
        stone({ x: hp2.x, z: hp2.z, w: 8 + (6 * r()), d: 7 + (5 * r()), h: 0.8 + (2 * r()), roofH: 3 + (3 * r()), rot: hp2.rot + ( (r() < 0.5) ? 0 : 1.57 ) }, 8);
      }
      for (var tz = 0; tz < 2; tz++) {
        var tzz = lerp(zA, zB, (tz + r()) / 2), tp2 = beside(tzz, ( (r() < 0.5) ? -1 : 1 ) * (36 + (20 * r())));
        ziggurat(tp2.x, tp2.z, 22 + (10 * r()), 6 + Math.floor(r() * 3), 3, tp2.rot);
      }
    }

    // Cemetery: plots of headstones and crosses either side of the route,
    // low walls along it, mausoleums with stone roofs.
    //
    if (type === "cemetery") {
      for (var pz = zA; pz < zB; pz += 70 + (60 * r())) {
        var psd = ( (r() < 0.5) ? -1 : 1 ), plen = 20 + (15 * r());
        for (var rz2 = pz; rz2 < (pz + plen); rz2 += 5) {
          for (var lat2 = 11; lat2 <= 27; lat2 += 4) {
            if (r() < 0.5) { continue; }
            var gp = beside(rz2 + ((r() - 0.5) * 1.5), psd * (lat2 + ((r() - 0.5) * 1.5))), gr2 = gp.rot + ((r() - 0.5) * 0.25);
            if (r() < 0.25) {
              if (stone({ x: gp.x, z: gp.z, w: 0.6, d: 0.6, h: 3.4, rot: gr2 }, 5)) {
                var cb = SB[SB.length - 1];
                stone({ x: gp.x, z: gp.z, y: cb.y + cb.h - 1.3, w: 2.2, d: 0.5, h: 0.5, rot: gr2 }, 0);
              }
            }
            else { stone({ x: gp.x, z: gp.z, w: 2 + (0.8 * r()), d: 0.7, h: 2.2 + (1.6 * r()), rot: gr2 }, 5); }
          }
        }
      }
      for (var wz2 = zA; wz2 < zB; wz2 += 12) {
        for (var wsd = -1; wsd <= 1; wsd += 2) {
          if (r() < 0.15) { continue; }
          var wp = beside(wz2, wsd * 31);
          stone({ x: wp.x, z: wp.z, w: 0.8, d: 11.5, h: 1.4, rot: wp.rot }, 5);
        }
      }
      for (var mz = 0; mz < 6; mz++) {
        var mz3 = lerp(zA, zB, r()), mp = beside(mz3, ( (r() < 0.5) ? -1 : 1 ) * (38 + (20 * r())));
        stone({ x: mp.x, z: mp.z, w: 7 + (2 * r()), d: 9 + (3 * r()), h: 5 + (3 * r()), roofH: 3, rot: mp.rot + 1.57 }, 8);
      }
    }

    // Dune desert: big stepped pyramids off to the side, and half-buried
    // pillars.
    //
    if (type === "dunes") {
      for (var dp = 0, dt = 0; (dp < 3) && (dt < 20); dt++) {
        var dz2 = lerp(zA, zB, (dp + r()) / 3), dpp = beside(dz2, ( (r() < 0.5) ? -1 : 1 ) * (60 + (45 * r()))), n1 = SB.length;
        ziggurat(dpp.x, dpp.z, 36 + (20 * r()), 10 + Math.floor(r() * 4), 2.6, valleyRot(dz2));
        if (SB.length > n1) { dp++; }
      }
      for (var dq = 0; dq < 18; dq++) {
        var dqz = lerp(zA, zB, r()), dqp = beside(dqz, ( (r() < 0.5) ? -1 : 1 ) * (14 + (40 * r())));
        stone({ x: dqp.x, z: dqp.z, w: 3, d: 3, h: 1 + (5 * r()), rot: dqp.rot }, 6);
      }
    }

    // Columns: a shaft (round, or square) standing on a base slab with a
    // capital on top reaching 'top'; or a broken stump.  Ground-standing
    // when y is undefined.
    //
    function column(x, z, top, rot, rad, broken, y0) {
      var n0 = SB.length, base = { x: x, z: z, w: (2 * rad) + 1, d: (2 * rad) + 1, h: 0.7, rot: rot };
      if (y0 !== undefined) { base.y = y0;  base.h = 0.7; }
      if (!stone(base, 6)) { return false; }
      var by = SB[n0].y + SB[n0].h;
      if (broken) { return stone({ x: x, z: z, y: by, w: 2 * rad, d: 2 * rad, h: 1.5 + (4 * r()), rot: rot, shape: "cyl" }, 6); }
      if (!stone({ x: x, z: z, y: by, w: 2 * rad, d: 2 * rad, h: top - 0.8 - by, rot: rot, shape: "cyl" }, 6)) { SB.length = n0;  return false; }
      stone({ x: x, z: z, y: top - 0.8, w: (2 * rad) + 0.8, d: (2 * rad) + 0.8, h: 0.8, rot: rot }, 0);
      return true;
    }

    // A temple beside the route, in its own frame (local x along the
    // valley, z across): a stepped podium, a ring of columns, an inner
    // hall, beams and a gabled roof, any of which may have fallen.
    //
    function temple(z, side) {
      var Lt = 22 + (10 * r()), Wt = 14 + (6 * r()), bp = beside(z, side * ((Wt / 2) + 16 + (25 * r()))),
          rot = valleyRot(z) + (Math.PI / 2), c = Math.cos(rot), sn = Math.sin(rot), n0 = SB.length;
      function at(lx, lz) { return [bp.x + (lx * c) + (lz * sn), bp.z - (lx * sn) + (lz * c)]; }
      if (!stone({ x: bp.x, z: bp.z, w: Lt + 4, d: Wt + 4, h: 1, rot: rot }, 10)) { return; }
      var py = SB[n0].y + SB[n0].h;
      stone({ x: bp.x, z: bp.z, y: py, w: Lt + 2, d: Wt + 2, h: 1, rot: rot }, 10);
      py += 1;
      var H = 9 + (3 * r()), roof = (r() < 0.6), sp = 3.6;
      for (var lx = -Lt / 2; lx <= (Lt / 2) + 0.01; lx += sp) {
        for (var sdz = -1; sdz <= 1; sdz += 2) {
          if (r() < 0.2) { continue; }
          var q = at(lx, sdz * Wt / 2);
          column(q[0], q[1], py + H, rot, 0.8, (!roof && (r() < 0.4)), py);
        }
      }
      [-1, 1].forEach(function(sdx) {
        var q = at(sdx * Lt / 2, 0);
        if (r() < 0.8) { column(q[0], q[1], py + H, rot, 0.8, false, py); }
      });
      stone({ x: bp.x, z: bp.z, y: py, w: Lt * 0.55, d: Wt * 0.5, h: H * ( roof ? 1 : 0.3 + (0.5 * r()) ), rot: rot }, 10);
      if (roof) {
        stone({ x: bp.x, z: bp.z, y: py + H, w: Lt + 1.6, d: Wt + 1.6, h: 1.2, roofH: 3 + (1.5 * r()), rot: rot }, 10);
      }
    }

    // A temple hall the route flies through: rows of columns either side,
    // a lintel over each row and a gabled roof over each bay, following
    // the route's bends.
    //
    function hall(z0h, len) {
      if ( (aboveGround(z0h) > 20) || (aboveGround(z0h + len) > 20) ) { return; }
      var y = topY(z0h + (len / 2), (len / 2) + 6) + 9, prev = null;
      for (var hz = z0h; hz <= (z0h + len); hz += 8) {
        var q = pathAt(hz), rot = Math.atan(q[3]), L1 = beside(hz, -11), R1 = beside(hz, 11);
        column(L1.x, L1.z, y, rot, 0.9, false);
        column(R1.x, R1.z, y, rot, 0.9, false);
        stone({ x: q[0], z: hz, y: y, w: 26, d: 2, h: 1.2, rot: rot }, 0);
        if (prev) {
          var mz = (hz + prev) / 2, mq = pathAt(mz);
          stone({ x: mq[0], z: mz, y: y + 1.2, w: 26, d: 8.2, h: 0.5, roofH: 4, rot: Math.atan(mq[3]) }, 0);
        }
        prev = hz;
      }
    }

    if (type === "temples") {
      for (var tz3 = zA + (60 * r()); tz3 < zB; tz3 += 150 + (120 * r())) { temple(tz3, ( (r() < 0.5) ? -1 : 1 )); }
      hall(lerp(zA + 200, zB - 300, r()), 40);
      for (var tq2 = 0; tq2 < 12; tq2++) {
        var tqz = lerp(zA, zB, r()), tqp = beside(tqz, ( (r() < 0.5) ? -1 : 1 ) * (12 + (40 * r())));
        column(tqp.x, tqp.z, 0, tqp.rot, 0.8, true);
      }
    }

    // Roman columns: long colonnades either side of the route with beams
    // along their tops, gaps where columns fell, broken shafts, and
    // triumphal arches over the route.
    //
    if (type === "roman") {
      for (var rs = -1; rs <= 1; rs += 2) {
        var prevTop = null;
        for (var rz3 = zA; rz3 < zB; rz3 += 7) {
          var rp = beside(rz3, rs * 14), roll = r(), gy2 = self.baseH(rp.x, rp.z);
          if (roll < 0.12) { prevTop = null;  continue; }
          var ok2 = column(rp.x, rp.z, gy2 + 13, rp.rot, 1.2, (roll < 0.25));
          if ( ok2 && (roll >= 0.25) ) {
            var top3 = SB[SB.length - 1].y + SB[SB.length - 1].h;
            if (prevTop) {
              var mp2 = beside(rz3 - 3.5, rs * 14);
              stone({ x: mp2.x, z: mp2.z, y: Math.max(top3, prevTop), w: 3, d: 7.4, h: 1.6, rot: mp2.rot }, 0);
            }
            prevTop = top3;
          }
          else { prevTop = null; }
        }
      }
      for (var ra = zA + 250 + (200 * r()); ra < (zB - 100); ra += 500 + (400 * r())) {
        if (aboveGround(ra) > 20) { continue; }
        var aq = pathAt(ra), arot = Math.atan(aq[3]), ay = topY(ra, 8) + 11, aL = beside(ra, -13), aR = beside(ra, 13), n1 = SB.length;
        if ( stone({ x: aL.x, z: aL.z, w: 7, d: 9, top: ay, rot: arot }, 6) && stone({ x: aR.x, z: aR.z, w: 7, d: 9, top: ay, rot: arot }, 6) ) {
          stone({ x: aq[0], z: ra, y: ay, w: 33, d: 9, h: 7, rot: arot }, 0);
          stone({ x: aq[0], z: ra, y: ay + 7, w: 34, d: 9.6, h: 1, rot: arot }, 0);
        }
        else { SB.length = n1; }
      }
    }

    // Bridges: many and varied in bridge gorges; now and then elsewhere.
    //
    var nBr = ( (type === "bridges") ? 6 : ( (type === "river") ? 2 :
                ( (["canyon", "falls", "slot", "terraces", "overhang", "sunken", "roman"].indexOf(type) >= 0) ? ( (r() < 0.6) ? 1 : 0 ) : 0 ) ) );
    for (var bz2 = zA + (150 * r()), nb = 0; (nb < nBr) && (bz2 < zB); bz2 += 230 + (140 * r()), nb++) {
      var bst = ( (type === "river") ? ( (r() < 0.5) ? "slab" : "rope" ) : ( (type === "sunken") ? "broken" : ( (type === "roman") ? "aqueduct" : BRIDGES[Math.floor(r() * BRIDGES.length)] ) ) ),
          blift = { slab: ( (r() < 0.7) ? 10 + (3 * r()) : 26 + (14 * r()) ), arch: 22 + (6 * r()), aqueduct: 18 + (8 * r()), rope: 10 + (3 * r()), broken: 0 }[bst];
      if ( (type === "river") && (bst === "slab") ) { blift = 9 + (2 * r()); }
      bridge(bz2, blift, bst);
    }
    level.buildings = level.buildings.concat(SB);

    // ---- trees: scattered by the blended 'trees' density (dense in a
    // forest, a few elsewhere), clear of the route (a corridor through a
    // forest), the river, steep ground, buildings and rocks.  Cemeteries
    // get bare dead trees.
    //
    var trees = [];
    // Route within 'rad' (seen from above) of x, z, counting only route
    // points below 'top' (when given): a high route passes over trees.
    //
    function nearPath(x, z, rad, top) {
      var i0 = Math.floor((z - path[0][2]) / step);
      for (var i = Math.max(0, i0 - 6); i <= Math.min(path.length - 1, i0 + 6); i++) {
        if ( (Math.hypot(path[i][0] - x, path[i][2] - z) < rad) && ( (top === undefined) || (path[i][1] < top) ) ) { return true; }
      }
      return false;
    }
    function treeOK(x, z, rr, corridor, th) {
      var gy = self.baseH(x, z), g2 = self.baseH(x + 3, z), g3 = self.baseH(x, z + 3);
      if ( (Math.abs(g2 - gy) > 2.4) || (Math.abs(g3 - gy) > 2.4) ) { return false; }
      if (nearPath(x, z, rr + corridor, ( th ? gy + th + 7 : undefined ))) { return false; }
      var rw = self.param(z, "riverW");
      if ( (rw > 0.6) && (self.param(z, "rough") < 1) && (Math.abs(x - self.riverX(z)) < ((rw / 2) + 3)) ) { return false; }
      if (trees.some(function(t) { return (t.kind === "giant") && (Math.hypot(t.x - x, t.z - z) < (t.tr + rr + 3)); })) { return false; }
      if (level.buildings.some(function(b) { return (Math.abs(b.z - z) < 30) && (U.buildingD(b, x, gy + 2, z) < (rr + 1)); })) { return false; }
      if (rocks.some(function(rk) { return (Math.abs(rk.center[2] - z) < (rk.radii[2] + rr)) && (U.rockD(rk, x, gy + 4, z) < (rr + 1)); })) { return false; }
      return true;
    }
    var logs = [], floaters = [], pools = [];
    function logOK(a, b, rr, gap) {
      var z1 = Math.min(a[2], b[2]) - rr - gap - 8, z2 = Math.max(a[2], b[2]) + rr + gap + 8;
      return !P.some(function(q) { return (q[2] > z1) && (q[2] < z2) && ((U.segD(q[0], q[1], q[2], a, b) - rr) < gap); });
    }
    function addLog(a, b, rr, mat, gap) {
      if (!logOK(a, b, rr, gap)) { return false; }
      logs.push({ a: a.map(round2), b: b.map(round2), r: round2(rr), mat: mat });
      return true;
    }

    // Old world trees: giant trunks beside (some close to) the route, with
    // arching roots and great limbs under a high crown.
    //
    if (type === "giants") {
      for (var gz3 = zA - 60 + (80 * r()), gside = 1; gz3 < (zB + 60); gz3 += 120 + (110 * r()), gside = -gside) {
        var gtr = 5 + (3.5 * r()), gp2 = beside(gz3, gside * (gtr + 10 + (35 * r()))), gx = gp2.x, gzz = gp2.z, gy3 = self.baseH(gx, gzz) - 1,
            gh = 75 + (35 * r()), gR = 28 + (14 * r());
        if (nearPath(gx, gzz, gtr + 9)) { continue; }
        trees.push({ x: round2(gx), y: round2(gy3), z: round2(gzz), h: round2(gh), r: round2(gR), tr: round2(gtr), kind: "giant" });
        for (var gr3 = 0; gr3 < 6; gr3++) {
          var ga = (gr3 * 1.047) + (r() * 0.6), gd = gtr + 8 + (7 * r()), ex = gx + (Math.cos(ga) * gd), ez = gzz + (Math.sin(ga) * gd);
          addLog([gx + (Math.cos(ga) * gtr * 0.6), gy3 + 5 + (4 * r()), gzz + (Math.sin(ga) * gtr * 0.6)], [ex, self.baseH(ex, ez) - 0.8, ez], 1.4 + (1.1 * r()), "wood", 6);
        }
        for (var gl = 0; gl < 4; gl++) {
          var la = r() * 6.283, ly = gy3 + (gh * (0.42 + (0.2 * r()))), lr = gtr + (gR * (0.5 + (0.3 * r())));
          addLog([gx, ly, gzz], [gx + (Math.cos(la) * lr), ly + (gh * 0.12), gzz + (Math.sin(la) * lr)], 1.3 + (1 * r()), "wood", 8);
        }
      }
    }

    for (var tz2 = zA - 150; tz2 < (zB + 150); tz2 += 8) {
      var dens = self.param(tz2, "trees"), swampy = (self.param(tz2, "rough") > 1);
      if (dens <= 0) { continue; }
      var thf = self.halfFloor(tz2) + (self.param(tz2, "wallRun") * 0.7), tcx = self.cx(tz2);
      for (var tx = -thf; tx <= thf; tx += 8) {
        if (r() > (dens * 0.55)) { continue; }
        var x3 = tcx + tx + ((r() - 0.5) * 6), z3 = tz2 + ((r() - 0.5) * 6), pine = (r() < 0.6),
            th = ( (dens > 0.3) ? 14 + (12 * r()) : 9 + (9 * r()) ), tr = ( pine ? 2.6 + (1.6 * r()) : 3.2 + (2 * r()) ),
            kind = ( pine ? "pine" : "round" );
        if (swampy) { kind = ( (r() < 0.35) ? "dead" : "round" );  th = 7 + (6 * r());  tr = 2.5 + (1.5 * r()); }
        if (!treeOK(x3, z3, tr, ( ((dens > 0.3) && !swampy) ? 10 : 7 ), th)) { continue; }
        trees.push({ x: round2(x3), y: round2(self.baseH(x3, z3) - 0.5), z: round2(z3), h: round2(th), r: round2(tr), kind: kind });
      }
    }
    if (type === "cemetery") {
      for (var dtr = 0, dtt = 0; (dtr < 30) && (dtt < 300); dtt++) {
        var dz3 = lerp(zA, zB, r()), dp3 = beside(dz3, ( (r() < 0.5) ? -1 : 1 ) * (12 + (45 * r())));
        if (!treeOK(dp3.x, dp3.z, 3, 7, 16)) { continue; }
        trees.push({ x: round2(dp3.x), y: round2(self.baseH(dp3.x, dp3.z) - 0.5), z: round2(dp3.z), h: round2(8 + (8 * r())), r: round2(3 + (2 * r())), kind: "dead" });
        dtr++;
      }
    }

    // Swamp: fallen logs half in the water.  Roman columns: fallen column
    // drums.
    //
    if ( (type === "swamp") || (type === "roman") || (type === "temples") ) {
      var nl = ( (type === "swamp") ? 22 : 14 );
      for (var lt2 = 0, ln = 0; (ln < nl) && (lt2 < 200); lt2++) {
        var lz2 = lerp(zA, zB, r()), lp2 = beside(lz2, ( (r() < 0.5) ? -1 : 1 ) * (9 + (45 * r()))), la2 = r() * 3.14,
            ll = ( (type === "swamp") ? 8 + (8 * r()) : 3 + (4 * r()) ), lr2 = ( (type === "swamp") ? 0.6 + (0.4 * r()) : 1.2 ),
            ax = lp2.x - (Math.cos(la2) * ll / 2), az = lp2.z - (Math.sin(la2) * ll / 2), bx = lp2.x + (Math.cos(la2) * ll / 2), bz = lp2.z + (Math.sin(la2) * ll / 2);
        if (addLog([ax, self.baseH(ax, az) + (lr2 * 0.5), az], [bx, self.baseH(bx, bz) + (lr2 * 0.5), bz], lr2, ( (type === "swamp") ? "wood" : "stone" ), 6)) { ln++; }
      }
    }

    // Floating stones: boulders turning slowly in the air above the chasm,
    // and a few flat-topped islands with trees.
    //
    if (type === "floating") {
      for (var ft2 = 0, fn = 0; (fn < 46) && (ft2 < 900); ft2++) {
        var fz3 = lerp(zA - 80, zB + 80, r()), fhf = self.halfFloor(fz3) * 1.15, island = (r() < 0.15),
            fr = ( island ? 11 + (7 * r()) : 2.5 + (10 * r() * r()) ), fx3 = self.cx(fz3) + ((r() - 0.5) * 2 * fhf),
            fy3 = self.floorY(fz3) + 10 + fr + (65 * Math.pow(r(), 1.3)), fo = { c: [fx3, fy3, fz3], r: fr, island: island };
        if ((fy3 - (fr * ( island ? 1.6 : 1 ))) < (self.baseH(fx3, fz3) + 3)) { continue; }
        if (P.some(function(q) { return (Math.abs(q[2] - fz3) < (fr + 25)) && (U.floaterD(fo, q[0], q[1], q[2], 1) < 10); })) { continue; }
        if (floaters.some(function(g) { return Math.hypot(g.c[0] - fx3, g.c[1] - fy3, g.c[2] - fz3) < (g.r + fr + 4); })) { continue; }
        var ax2 = [r() - 0.5, r() - 0.5, r() - 0.5], al = Math.hypot(ax2[0], ax2[1], ax2[2]) || 1;
        fo.c = fo.c.map(round2);  fo.r = round2(fr);  fo.seed = self.sd + 1500 + fn;
        fo.axis = ( island ? [0, 1, 0] : ax2.map(function(v) { return round2(v / al); }) );
        fo.rate = ( island ? 0 : round2((0.06 + (0.25 * r())) * ( (r() < 0.5) ? -1 : 1 ) * (4 / (fr + 2))) );
        floaters.push(fo);
        fn++;
        if (island) {
          for (var it = 0; it < 3; it++) {
            var ia = r() * 6.283, id = fr * 0.35 * r(), ix = fx3 + (Math.cos(ia) * id), iz = fz3 + (Math.sin(ia) * id);
            trees.push({ x: round2(ix), y: round2(fy3 + (0.5 * fr) - 0.3), z: round2(iz), h: round2(7 + (6 * r())), r: round2(2.5 + (1.5 * r())), kind: ( (r() < 0.6) ? "pine" : "round" ) });
          }
        }
      }
    }

    // Crater pools: lava or water in each crater's bowl.
    //
    this.shapesOf(k).craters.forEach(function(c) {
      var pr = c.R * Math.sqrt(1.6 / c.D);
      pools.push({ x: round2(c.x), y: round2(self.baseH(c.x, c.z) + 1.0), z: round2(c.z), r: round2(pr), lava: c.lava });
    });

    // Every tree (giant crowns included) keeps 6 clear of the route.
    //
    trees = trees.filter(function(t) {
      return !P.some(function(q) { return (Math.abs(q[2] - t.z) < (t.r + 12)) && (U.treeD(t, q[0], q[1], q[2]) < 6); });
    });
    level.trees = trees;
    level.logs = logs;
    level.floaters = floaters;
    level.pools = pools;

    // ---- water: the river (a ribbon along the floor that follows its
    // height, so a cliff in the floor makes a waterfall; it widens into a
    // lake in a basin), and falls down the valley walls.
    //
    var streams = [], cur = null;
    for (var wj = 0; wj < ter.nz; wj++) {
      var wz = z0 + (wj * cell), wo = self.offsets(wz), ww = self.param(wz, "riverW");
      if (ww > 0.6) { ww += 28 * clamp(-wo.floor / 30, 0, 1); }
      if (ww <= 0.6) { cur = null;  continue; }
      if (!cur) { cur = { pts: [], w: [] };  streams.push(cur); }
      cur.pts.push([round2(lerp(self.riverX(wz), self.cx(wz), clamp((ww - 10) / 30, 0, 1))), round2(self.floorY(wz) - 0.8 + (1.5 * clamp((ww - 10) / 30, 0, 1))), round2(wz)]);
      cur.w.push(round2(ww));
    }
    streams = streams.filter(function(q) { return q.pts.length > 1; });
    var nFalls = ( (type === "falls") ? 4 : ( (type === "bridges") ? 3 : ( ((type === "canyon") || (type === "basin")) ? 2 : 0 ) ) );
    for (var fi = 0, ft = 0; (fi < nFalls) && (ft < 40); ft++) {
      var fz2 = lerp(zA, zB, r()), fsd = ( (r() < 0.5) ? -1 : 1 ), fhf = self.halfFloor(fz2), frun = self.param(fz2, "wallRun"),
          fc = self.cx(fz2), fpts = [];
      for (var fx = fhf + (frun * 1.05); fx >= (fhf * 0.85); fx -= 3) { fpts.push([round2(fc + (fsd * fx)), round2(self.baseH(fc + (fsd * fx), fz2) + 1.2), round2(fz2)]); }
      if ((fpts[0][1] - fpts[fpts.length - 1][1]) < 25) { continue; }
      streams.push({ pts: fpts, w: round2(3.5 + (2.5 * r())) });
      fi++;
    }
    level.streams = streams;

    // ---- hoops along the path every 'hoopSpacing', start and finish
    //
    var F = LG.sdf(level), hoops = [], acc = o.hoopSpacing * 0.5;
    function hoopAt(p, n, rr) {
      var d = F(p[0], p[1], p[2]), hr = clamp(Math.min(rr, d - 1.5), 3.5, rr);
      hoops.push({ p: p.map(round2), n: n.map(function(v) { return Math.round(v * 1000) / 1000; }), r: round2(hr) });
    }
    for (var h = 1; h < path.length; h++) {
      var A = path[h - 1], Bq = path[h],
          dx = Bq[0] - A[0], dy = Bq[1] - A[1], dz = Bq[2] - A[2], sl = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
      acc += sl;
      if (acc >= o.hoopSpacing) {
        acc = 0;
        hoopAt([Bq[0], Bq[1], Bq[2]], [dx / sl, dy / sl, dz / sl], o.hoopR);
      }
    }
    level.hoops = hoops;
    var p0 = path[0], p1 = path[1], pe = path[path.length - 1], pd = path[path.length - 2];
    function dirOf(a, b) { var v = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(v[0], v[1], v[2]); return v.map(function(x) { return x / l; }); }
    if (first)   { level.start  = { p: [p0[0], p0[1], p0[2]], n: dirOf(p0, p1) }; }
    if (isFinal) { level.finish = { p: [pe[0], pe[1], pe[2]], n: dirOf(pd, pe), r: o.finishR }; }

    // ---- checks: closest approach of the path to anything solid
    //
    var minC = 1e9;
    for (var q2 = 1; q2 < path.length; q2++) {
      for (var t2 = 0; t2 < 4; t2++) {
        var a3 = path[q2 - 1], b3 = path[q2];
        minC = Math.min(minC, F(lerp(a3[0], b3[0], t2 / 4), lerp(a3[1], b3[1], t2 / 4), lerp(a3[2], b3[2], t2 / 4)));
      }
    }
    level.meta = { type: type, hoops: hoops.length, buildings: level.buildings.length, rocks: rocks.length, streams: streams.length, trees: trees.length, logs: logs.length, floaters: floaters.length,
                   minClearance: round2(minC) };
    level.sdf = F;
    return level;
  };

  function round2(v) { return Math.round(v * 100) / 100; }

  LG.Session        = Session;
  LG.STAGE_TYPES    = TYPES;
  LG.STAGE_DEFAULTS = DEFAULTS;
  LG.paletteRoles   = roles;
  if ((typeof module !== "undefined") && module.exports) { module.exports = { Session: Session, TYPES: TYPES, DEFAULTS: DEFAULTS, roles: roles }; }

})(typeof window !== "undefined" ? window : globalThis);
