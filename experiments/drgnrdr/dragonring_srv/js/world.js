// Meshes for a level or session stage: terrain, water, buildings,
// rocks, hoops, finish.  Flat-shaded; colours from the stage's palette
// roles (levelgen/stages.js) or, for plain levels, DR.COLORS.
//
(function() {
  var DR = window.DR = window.DR || {};

  var COLORS = {
    sky    : 0xbfe0e6,
    grass  : 0x8fb26a,
    grass2 : 0x7ea55e,
    rock   : 0xd2a877,
    rock2  : 0xb9875a,
    top    : 0xa3b86e,
    water  : 0x4f9ec4,
    stone  : 0xa98f74,
    wood   : 0x6b4a32,
    leaf   : 0x4f7a3a,
    leaf2  : 0x6d8f45,
    walls  : [0xf2e6cf, 0xe8d2b0, 0xd9c7a7, 0xf5f0e6],
    roofs  : [0xc8553d, 0x4a6070, 0x3f8f8a],
    hoop   : 0xf4c542,
    next   : 0xff7a2f,
    done   : 0xffffff,
    finish : 0x5bd66a
  };

  function lambert(color, extra) {
    return new THREE.MeshLambertMaterial(Object.assign({ color: color, flatShading: true }, extra || {}));
  }

  // ------------------------------------------------------------ terrain

  // Colour roles at stage-relative position t: the stage's own, blended
  // toward the previous / next stage's near the joins (the same weights
  // as the shape, levelgen/stages.js), so colours change without seams.
  //
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - (2 * t)); }
  function roleBlend(L, t) {
    var B = L.blend || 0.12;
    if ( (t < B) && L.rolesPrev )       { return { other: L.rolesPrev, w: 1 - smooth(-B, B, t) }; }
    if ( (t > (1 - B)) && L.rolesNext ) { return { other: L.rolesNext, w: smooth(1 - B, 1 + B, t) }; }
    return { other: null, w: 0 };
  }
  var C1 = new THREE.Color(), C2 = new THREE.Color();
  function roleColor(L, b, key, out) {
    out.set(L.roles[key]);
    if (b.other) { out.lerp(C2.set(b.other[key]), b.w); }
    return out;
  }

  // One indexed grid (flat shading from screen-space derivatives), a
  // colour per vertex: floor, river channel, banded walls, plateau.
  //
  function terrain(L) {
    var T = L.terrain, nx = T.nx, nz = T.nz, H = T.heights,
        g = new THREE.BufferGeometry(), pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3),
        idx = new Uint32Array((nx - 1) * (nz - 1) * 6), c = new THREE.Color(), q = 0,
        wh = ( (L.options && L.options.wallHeight) ? L.options.wallHeight : 60 ), C = {};
    if (!L.roles) { ["grass", "grass2", "rock", "rock2", "top", "water"].forEach(function(k) { C[k] = new THREE.Color(COLORS[k]); }); }
    for (var j = 0; j < nz; j++) {
      var lo = 1e9, hi = -1e9, z = T.z0 + (j * T.cell), b = ( L.roles ? roleBlend(L, (z - T.z0) / ((nz - 1) * T.cell)) : null );
      for (var i0 = 0; i0 < nx; i0++) { lo = Math.min(lo, H[i0 + (nx * j)]);  hi = Math.max(hi, H[i0 + (nx * j)]); }
      for (var i = 0; i < nx; i++) {
        var k = i + (nx * j), y = H[k],
            dx = H[Math.min(nx - 1, i + 1) + (nx * j)] - H[Math.max(0, i - 1) + (nx * j)],
            dz = H[i + (nx * Math.min(nz - 1, j + 1))] - H[i + (nx * Math.max(0, j - 1))],
            ny = 1 / Math.sqrt(1 + (((dx * dx) + (dz * dz)) / (4 * T.cell * T.cell))),
            rel = y - lo, v = (Math.sin((i * 12.9898) + (j * 78.233)) * 43758.5453) % 1;
        pos[3 * k] = T.x0 + (i * T.cell);  pos[(3 * k) + 1] = y;  pos[(3 * k) + 2] = z;
        if (L.roles) {
          if      ( L.river && (Math.abs(pos[3 * k] - L.river[j]) < 5.5) && (rel < 2.5) ) { roleColor(L, b, "river", c); }
          else if ( (ny > 0.8) && (rel < 9) )                           { roleColor(L, b, ( (v > 0.35) ? "floor" : "floor2" ), c); }
          else if ( (ny > 0.88) && (rel > (0.7 * (hi - lo))) )          { roleColor(L, b, "top", c); }
          else { roleColor(L, b, "wallA", c).lerp(roleColor(L, b, "wallB", C1.clone()), 0.5 + (0.5 * Math.sin(y / 3.5))); }
        }
        else {
          if      ( (ny > 0.7) && (y < 8) )                  { c.copy(( (v > 0.3) ? C.grass : C.grass2 )); }
          else if ( (ny > 0.9) && (y > (wh * 0.8)) )         { c.copy(C.top); }
          else                                               { c.copy(C.rock).lerp(C.rock2, 0.5 + (0.5 * Math.sin(y / 3.5))); }
        }
        col[3 * k] = c.r;  col[(3 * k) + 1] = c.g;  col[(3 * k) + 2] = c.b;
      }
    }
    for (var bz = 0; bz < (nz - 1); bz++) {
      for (var a = 0; a < (nx - 1); a++) {
        var e = a + (nx * bz);
        idx[q++] = e;  idx[q++] = e + nx;  idx[q++] = e + 1;
        idx[q++] = e + 1;  idx[q++] = e + nx;  idx[q++] = e + nx + 1;
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeVertexNormals();
    return new THREE.Mesh(g, lambert(0xffffff, { vertexColors: true }));
  }

  function water(L) {
    var T = L.terrain, w = (T.nx - 1) * T.cell, d = (T.nz - 1) * T.cell,
        m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), lambert(COLORS.water));
    m.position.set(T.x0 + (w / 2), L.water, T.z0 + (d / 2));
    return m;
  }

  // ------------------------------------------------------------ buildings

  // Gable roof: ridge along local x, overhanging the walls a little.
  //
  function gable(w, d, h) {
    var x = (w / 2) + 0.5, z = (d / 2) + 0.6,
        v = [ -x, 0, -z,   x, 0, -z,   x, 0, z,   -x, 0, z,   -x, h, 0,   x, h, 0 ],
        f = [ 0, 4, 1,  1, 4, 5,   2, 5, 3,  3, 5, 4,   0, 3, 4,   1, 5, 2,   0, 1, 2,  0, 2, 3 ],
        g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.setIndex(f);
    g = g.toNonIndexed();
    g.computeVertexNormals();
    return g;
  }

  // All houses of a level merged into one mesh per colour (walls, roofs,
  // dark doors and windows): a few draw calls however many houses.
  //
  function buildings(L) {
    var grp = new THREE.Group(), byMat = {}, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Yax = new THREE.Vector3(0, 1, 0),
        walls = ( L.roles ? L.roles.houses : COLORS.walls ), roofs = ( L.roles ? L.roles.roofs : COLORS.roofs );
    function add(key, geo, b, x, y, z) {
      if (geo.attributes.uv) { geo.deleteAttribute("uv"); }
      geo.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
      geo.applyMatrix4(M.compose(new THREE.Vector3(b.x, b.y, b.z), Q.setFromAxisAngle(Yax, b.rot), new THREE.Vector3(1, 1, 1)));
      (byMat[key] = byMat[key] || []).push(( geo.index ? geo.toNonIndexed() : geo ));
    }
    (L.buildings || []).forEach(function(b) {
      if ( (b.kind === "stone") || (b.kind === "wood") ) {
        var key = ( (b.kind === "wood") ? "o" : "s" );
        add(key, ( (b.shape === "cyl") ? new THREE.CylinderGeometry(b.w / 2, b.w / 2, b.h, 8) : new THREE.BoxGeometry(b.w, b.h, b.d) ), b, 0, b.h / 2, 0);
        if (b.roofH > 0) { add(key, gable(b.w, b.d, b.roofH), b, 0, b.h, 0); }
        return;
      }
      add("w" + ((b.wall || 0) % walls.length), new THREE.BoxGeometry(b.w, b.h, b.d), b, 0, b.h / 2, 0);
      add("r" + ((b.roof || 0) % roofs.length), gable(b.w, b.d, b.roofH), b, 0, b.h, 0);
      add("d", new THREE.BoxGeometry(1.4, 2.4, 0.2), b, 0, 2.0, (b.d / 2) + 0.05);
      for (var s = -1; s <= 1; s += 2) {
        for (var wx = -(b.w / 2) + 2; wx < ((b.w / 2) - 1); wx += 3) {
          for (var wy = 3; wy < (b.h - 1.5); wy += 4) {
            if ( (s > 0) && (Math.abs(wx + 0.5) < 1.2) && (wy < 4) ) { continue; }
            add("d", new THREE.BoxGeometry(1, 1.4, 0.2), b, wx + 0.5, wy, s * ((b.d / 2) + 0.05));
          }
        }
      }
    });
    Object.keys(byMat).forEach(function(key) {
      var color = ( (key === "d") ? 0x2b2a33 :
                    ( (key === "s") ? ( (L.roles && L.roles.stone) ? L.roles.stone : COLORS.stone ) :
                    ( (key === "o") ? ( (L.roles && L.roles.wood) ? L.roles.wood : COLORS.wood ) :
                      ( (key.charAt(0) === "w") ? walls[+key.slice(1)] : roofs[+key.slice(1)] ) ) ) ),
          geo = THREE.BufferGeometryUtils.mergeGeometries(byMat[key], false),
          m = new THREE.Mesh(geo, lambert(color, { side: ( ("rso".indexOf(key.charAt(0)) >= 0) ? THREE.DoubleSide : THREE.FrontSide ) }));
      byMat[key].forEach(function(g) { g.dispose(); });
      grp.add(m);
    });
    return grp;
  }

  // ------------------------------------------------------------ rocks

  // Surface nets over a box: one vertex per cell where the surface
  // passes, placed at the mean of the edge crossings; one quad per grid
  // edge that the surface crosses.
  //
  function surfaceNets(f, lo, hi, h) {
    var nx = Math.ceil((hi[0] - lo[0]) / h), ny = Math.ceil((hi[1] - lo[1]) / h), nz = Math.ceil((hi[2] - lo[2]) / h),
        sx = nx + 1, sy = ny + 1,
        V  = new Float32Array(sx * sy * (nz + 1)),
        cv = new Int32Array(nx * ny * nz).fill(-1),
        pos = [], idx = [];
    function vi(i, j, k) { return i + (sx * (j + (sy * k))); }
    function ci(i, j, k) { return i + (nx * (j + (ny * k))); }
    for (var k = 0; k <= nz; k++) {
      for (var j = 0; j <= ny; j++) {
        for (var i = 0; i <= nx; i++) { V[vi(i, j, k)] = f(lo[0] + (i * h), lo[1] + (j * h), lo[2] + (k * h)); }
      }
    }
    var E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]],
        cs = [];
    for (var c8 = 0; c8 < 8; c8++) { cs.push([c8 & 1, (c8 >> 1) & 1, (c8 >> 2) & 1]); }
    for (k = 0; k < nz; k++) {
      for (j = 0; j < ny; j++) {
        for (i = 0; i < nx; i++) {
          var val = [], neg = 0;
          for (var c = 0; c < 8; c++) {
            val.push(V[vi(i + cs[c][0], j + cs[c][1], k + cs[c][2])]);
            if (val[c] < 0) { neg++; }
          }
          if ( (neg === 0) || (neg === 8) ) { continue; }
          var ax = 0, ay = 0, az = 0, n = 0;
          E.forEach(function(e) {
            var a = val[e[0]], b = val[e[1]];
            if ((a < 0) === (b < 0)) { return; }
            var t = a / (a - b), A = cs[e[0]], B = cs[e[1]];
            ax += A[0] + ((B[0] - A[0]) * t);
            ay += A[1] + ((B[1] - A[1]) * t);
            az += A[2] + ((B[2] - A[2]) * t);
            n++;
          });
          cv[ci(i, j, k)] = pos.length / 3;
          pos.push(lo[0] + ((i + (ax / n)) * h), lo[1] + ((j + (ay / n)) * h), lo[2] + ((k + (az / n)) * h));
        }
      }
    }

    // Quads, wound so the outside (positive side) faces out.
    //
    function quad(a, b, c, d, flip) {
      if ( (a < 0) || (b < 0) || (c < 0) || (d < 0) ) { return; }
      if (flip) { idx.push(a, c, b,  a, d, c); }
      else      { idx.push(a, b, c,  a, c, d); }
    }
    for (k = 1; k < nz; k++) {
      for (j = 1; j < ny; j++) {
        for (i = 0; i < nx; i++) {
          var p0 = V[vi(i, j, k)], p1 = V[vi(i + 1, j, k)];
          if ((p0 < 0) !== (p1 < 0)) {
            quad(cv[ci(i, j - 1, k - 1)], cv[ci(i, j, k - 1)], cv[ci(i, j, k)], cv[ci(i, j - 1, k)], !(p0 < 0));
          }
        }
      }
    }
    for (k = 1; k < nz; k++) {
      for (j = 0; j < ny; j++) {
        for (i = 1; i < nx; i++) {
          var q0 = V[vi(i, j, k)], q1 = V[vi(i, j + 1, k)];
          if ((q0 < 0) !== (q1 < 0)) {
            quad(cv[ci(i - 1, j, k - 1)], cv[ci(i - 1, j, k)], cv[ci(i, j, k)], cv[ci(i, j, k - 1)], !(q0 < 0));
          }
        }
      }
    }
    for (k = 0; k < nz; k++) {
      for (j = 1; j < ny; j++) {
        for (i = 1; i < nx; i++) {
          var r0 = V[vi(i, j, k)], r1 = V[vi(i, j, k + 1)];
          if ((r0 < 0) !== (r1 < 0)) {
            quad(cv[ci(i - 1, j - 1, k)], cv[ci(i, j - 1, k)], cv[ci(i, j, k)], cv[ci(i - 1, j, k)], !(r0 < 0));
          }
        }
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g = g.toNonIndexed();
    g.computeVertexNormals();
    return g;
  }

  // Rocks, arches, ledges.  Below-ground parts are skipped where the
  // kind says how deep it reaches: spires from 2 under their centre,
  // arches and tunnels from 6 under.
  //
  function rocks(L) {
    var grp = new THREE.Group(), m = lambert(( L.roles ? L.roles.rock : COLORS.stone )),
        ms = lambert(( (L.roles && L.roles.stone) ? L.roles.stone : COLORS.stone ));
    (L.rocks || []).forEach(function(k) {
      // The rock alone, with no terrain (a flat floor far below).
      //
      var F   = LevelGen.sdf({ terrain: { nx: 2, nz: 2, cell: 1e6, x0: -1e6, z0: -1e6, heights: [-1e9, -1e9, -1e9, -1e9] },
                               rocks: [k], buildings: [], ceiling: 1e9 }),
          pad = k.bump + 3,
          down = ( (k.kind === "spire") ? 2 : ( ( ((k.kind === "arch") || (k.kind === "tunnel")) && !k.mat ) ? 6 : k.radii[1] + pad ) ),
          rx  = k.radii[0], rz = k.radii[2],
          lo  = [k.center[0] - rx - pad, k.center[1] - down, k.center[2] - rz - pad],
          hi  = [k.center[0] + rx + pad, k.center[1] + k.radii[1] + pad, k.center[2] + rz + pad];
      grp.add(new THREE.Mesh(surfaceNets(F, lo, hi, 1.75), ( (k.mat === "stone") ? ms : m )));
    });
    return grp;
  }

  // ------------------------------------------------------------ trees

  // Low-poly trees merged per colour: pines (a stack of two cones),
  // round trees (a ball), dead trees (a trunk and bare branches).
  //
  function trees(L) {
    var grp = new THREE.Group();
    if (!L.trees || !L.trees.length) { return grp; }
    var R = L.roles, parts = { t: [], a: [], b: [] }, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1);
    function put(key, geo, x, y, z, ry, rz) {
      Q.setFromEuler(new THREE.Euler(0, ry || 0, rz || 0));
      if (geo.attributes.uv) { geo.deleteAttribute("uv"); }
      geo.applyMatrix4(M.compose(V.set(x, y, z), Q, S1));
      parts[key].push(( geo.index ? geo.toNonIndexed() : geo ));
    }
    L.trees.forEach(function(t, i) {
      var h = t.h, tr = 0.35 + (0.1 * t.r), spin = i * 2.399, alt = ( ((i % 3) === 0) ? "b" : "a" );
      if (t.kind === "dead") {
        put("t", new THREE.CylinderGeometry(tr * 0.6, tr, h, 5), t.x, t.y + (h / 2), t.z, spin);
        for (var b = 0; b < 4; b++) {
          var a = spin + (b * 1.7), bl = t.r * (0.6 + (0.1 * b)), by = t.y + (h * (0.45 + (0.13 * b))),
              g = new THREE.CylinderGeometry(tr * 0.25, tr * 0.45, bl, 4).translate(0, bl / 2, 0);
          put("t", g, t.x, by, t.z, a, 0.9 + (0.15 * b));
        }
        return;
      }
      if (t.kind === "giant") {
        put("t", new THREE.CylinderGeometry(t.tr * 0.55, t.tr * 1.15, h * 0.85, 9), t.x, t.y + (h * 0.425), t.z, spin);
        for (var cb = 0; cb < 6; cb++) {
          var ca = spin + (cb * 1.05), cr = ( (cb === 0) ? 0 : t.r * 0.45 ),
              cg = new THREE.IcosahedronGeometry(1, 0).scale(t.r * 0.6, h * 0.13, t.r * 0.6);
          put(( ((cb % 2) === 0) ? "a" : "b" ), cg, t.x + (Math.cos(ca) * cr), t.y + (h * (0.78 + (0.05 * (cb % 3)))), t.z + (Math.sin(ca) * cr), ca);
        }
        return;
      }
      put("t", new THREE.CylinderGeometry(tr * 0.7, tr, h * 0.6, 5), t.x, t.y + (h * 0.3), t.z, spin);
      if (t.kind === "pine") {
        put(alt, new THREE.ConeGeometry(t.r, h * 0.55, 7), t.x, t.y + (h * 0.48), t.z, spin);
        put(alt, new THREE.ConeGeometry(t.r * 0.72, h * 0.45, 7), t.x, t.y + (h * 0.75), t.z, spin);
      }
      else {
        put(alt, new THREE.IcosahedronGeometry(1, 0).scale(t.r, h * 0.36, t.r), t.x, t.y + (h * 0.68), t.z, spin);
      }
    });
    var cols = { t: ( (R && R.wood) || COLORS.wood ), a: ( (R && R.leaf) || COLORS.leaf ), b: ( (R && R.leaf2) || COLORS.leaf2 ) };
    Object.keys(parts).forEach(function(key) {
      if (!parts[key].length) { return; }
      var geo = THREE.BufferGeometryUtils.mergeGeometries(parts[key], false);
      parts[key].forEach(function(g) { g.dispose(); });
      grp.add(new THREE.Mesh(geo, lambert(cols[key] || COLORS.leaf)));
    });
    return grp;
  }

  // ------------------------------------------------------------ logs

  // Logs: cylinders between two points (fallen trunks, roots, limbs in
  // wood; fallen column drums in stone), merged per material.
  //
  function logs(L) {
    var grp = new THREE.Group();
    if (!L.logs || !L.logs.length) { return grp; }
    var R = L.roles, parts = { wood: [], stone: [] }, Y = new THREE.Vector3(0, 1, 0), A = new THREE.Vector3(), B = new THREE.Vector3(),
        Q = new THREE.Quaternion(), M = new THREE.Matrix4(), S1 = new THREE.Vector3(1, 1, 1);
    L.logs.forEach(function(g) {
      A.fromArray(g.a);  B.fromArray(g.b);
      var len = A.distanceTo(B), geo = new THREE.CylinderGeometry(g.r * 0.85, g.r, len, 7);
      geo.deleteAttribute("uv");
      Q.setFromUnitVectors(Y, B.clone().sub(A).normalize());
      geo.applyMatrix4(M.compose(A.clone().add(B).multiplyScalar(0.5), Q, S1));
      parts[( (g.mat === "stone") ? "stone" : "wood" )].push(geo.toNonIndexed());
    });
    var cols = { wood: ( (R && R.wood) || COLORS.wood ), stone: ( (R && R.stone) || COLORS.stone ) };
    Object.keys(parts).forEach(function(key) {
      if (!parts[key].length) { return; }
      var geo = THREE.BufferGeometryUtils.mergeGeometries(parts[key], false);
      parts[key].forEach(function(g) { g.dispose(); });
      grp.add(new THREE.Mesh(geo, lambert(cols[key])));
    });
    return grp;
  }

  // ------------------------------------------------------------ floaters

  // Floating boulders: a lumpy ball (islands: flat top, drawn-out bottom)
  // built around its own centre, turning about its axis at 'rate' (radians
  // a second) and bobbing a little.  Collision stays a fixed ball inside.
  //
  function floaters(L) {
    var grp = new THREE.Group();
    if (!L.floaters || !L.floaters.length) { return grp; }
    var m = lambert(( L.roles ? L.roles.rock : COLORS.stone )), fbm = LevelGen.util.fbm;
    L.floaters.forEach(function(fo, i) {
      var o = { c: [0, 0, 0], r: fo.r, island: fo.island }, bump = fo.r * 0.18,
          F = function(x, y, z) { return LevelGen.util.floaterD(o, x, y, z, 1) + (bump * (fbm((x / 4) + (y / 6), (z / 4) - (y / 5), fo.seed, 2) - 0.5)); },
          e = (fo.r * ( fo.island ? 1.7 : 1 )) + bump + 2, h = Math.max(0.8, Math.min(1.75, fo.r / 5)),
          mesh = new THREE.Mesh(surfaceNets(F, [-fo.r - bump - 2, -e, -fo.r - bump - 2], [fo.r + bump + 2, fo.r + bump + 2, fo.r + bump + 2], h), m),
          ax = new THREE.Vector3().fromArray(fo.axis || [0, 1, 0]), ph = i * 1.7;
      mesh.position.fromArray(fo.c);
      mesh.onBeforeRender = function() {
        var t = TIME.value;
        mesh.quaternion.setFromAxisAngle(ax, (fo.rate || 0) * t);
        mesh.position.y = fo.c[1] + (0.5 * Math.sin((t * 0.6) + ph));
        mesh.updateMatrixWorld();
      };
      grp.add(mesh);
    });
    return grp;
  }

  // ------------------------------------------------------------ streams

  // Flowing water: a ribbon along each stream's points, 'w' wide (one
  // number or one per point).  The shader scrolls foam stripes downhill
  // where the water is steep (falls), and a slow sheen where it is
  // flat.  'flow' (per vertex) increases in the direction the water
  // runs; 'steep' is 0 flat .. 1 falling.  Vertices go through the
  // project_vertex chunk, so the PSX wobble applies.
  //
  var TIME = { value: 0 };
  var SVERT = [
    "attribute float flow; attribute float steep; varying float vF; varying float vS; varying vec2 vUv; varying vec3 vW;",
    "#include <common>",
    "#include <fog_pars_vertex>",
    "void main() {",
    "  vF = flow;  vS = steep;  vUv = uv;  vW = position;",
    "  vec3 transformed = position;",
    "  #include <project_vertex>",
    "  #include <fog_vertex>",
    "}"
  ].join("\n");
  var SFRAG = [
    "uniform float time; uniform vec3 deep; uniform vec3 foam; varying float vF; varying float vS; varying vec2 vUv; varying vec3 vW;",
    "#include <common>",
    "#include <fog_pars_fragment>",
    "void main() {",
    "  float st = fract((vF * 0.16) - (time * 1.4) + (0.12 * sin((vUv.x * 9.0) + (vF * 0.3))));",
    "  float f = smoothstep(0.5, 0.72, st) * vS;",
    "  float edge = smoothstep(0.32, 0.5, abs(vUv.x - 0.5));",
    "  float sheen = (0.5 + (0.5 * sin((vW.x * 0.35) + (vW.z * 0.27) + (time * 1.3)))) * (0.5 + (0.5 * sin((vW.z * 0.21) - (time * 0.9))));",
    "  float t = clamp(f + (vS * 0.3) + (edge * (0.25 + (0.5 * vS))) + (sheen * 0.15 * (1.0 - vS)), 0.0, 1.0);",
    "  gl_FragColor = vec4(mix(deep, foam, t), 1.0);",
    "  #include <fog_fragment>",
    "}"
  ].join("\n");

  // Pools: flat discs, water (the stream shader, calm) or lava (glowing,
  // slowly churning).
  //
  var LFRAG = [
    "uniform float time; varying float vF; varying float vS; varying vec2 vUv; varying vec3 vW;",
    "#include <common>",
    "#include <fog_pars_fragment>",
    "void main() {",
    "  float n = (0.5 + (0.5 * sin((vW.x * 0.45) + (time * 0.7)))) * (0.5 + (0.5 * sin((vW.z * 0.38) - (time * 0.5) + (vW.x * 0.2))));",
    "  float k = (0.5 + (0.5 * sin((vW.x * 1.3) - (vW.z * 1.1) + (time * 1.6))));",
    "  vec3 c = mix(vec3(0.55, 0.06, 0.02), vec3(1.0, 0.45, 0.08), n);",
    "  c = mix(c, vec3(1.0, 0.85, 0.35), smoothstep(0.82, 1.0, k * n) * 0.8);",
    "  gl_FragColor = vec4(c, 1.0);",
    "  #include <fog_fragment>",
    "}"
  ].join("\n");
  function pools(L, waterMat) {
    var grp = new THREE.Group();
    if (!L.pools || !L.pools.length) { return grp; }
    var lu = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]);
    lu.time = TIME;
    var lava = new THREE.ShaderMaterial({ uniforms: lu, vertexShader: SVERT, fragmentShader: LFRAG, fog: true, polygonOffset: true,
                                          polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
    L.pools.forEach(function(p) {
      var g = new THREE.CircleGeometry(p.r, 28).rotateX(-Math.PI / 2), n = g.attributes.position.count;
      g.setAttribute("flow", new THREE.Float32BufferAttribute(new Float32Array(n), 1));
      g.setAttribute("steep", new THREE.Float32BufferAttribute(new Float32Array(n), 1));
      g.translate(p.x, p.y, p.z);
      grp.add(new THREE.Mesh(g, ( p.lava ? lava : waterMat(L) )));
    });
    return grp;
  }

  function streamMat(L) {
    var deep = new THREE.Color(( L.roles ? L.roles.river : COLORS.water )).lerp(new THREE.Color(( L.roles ? L.roles.skyTop : COLORS.sky )), 0.35), foam = deep.clone().lerp(new THREE.Color(0xf4f6f8), 0.8),
        u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { deep: { value: deep }, foam: { value: foam } }]);
    u.time = TIME;
    return new THREE.ShaderMaterial({ uniforms: u, vertexShader: SVERT, fragmentShader: SFRAG, fog: true, side: THREE.DoubleSide,
                                      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  }

  function streams(L) {
    var grp = new THREE.Group();
    if (!L.streams || !L.streams.length) { return grp; }
    var mat = streamMat(L);
    L.streams.forEach(function(sm) {
      var P = sm.pts, n = P.length, pos = [], uv = [], flow = [], steep = [], idx = [], phi = 0;
      for (var i = 0; i < n; i++) {
        var a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)],
            tx = b[0] - a[0], tz = b[2] - a[2], th = Math.hypot(tx, tz) || 1, dy = b[1] - a[1],
            w = ( Array.isArray(sm.w) ? sm.w[i] : sm.w ) / 2, nx = tz / th, nz = -tx / th;
        if (i > 0) {
          var q = P[i - 1], ds = Math.hypot(P[i][0] - q[0], P[i][1] - q[1], P[i][2] - q[2]),
              sl = (P[i][1] - q[1]) / (Math.hypot(P[i][0] - q[0], P[i][2] - q[2]) || 0.01);
          phi += ds * Math.max(-1, Math.min(1, -sl * 4));
        }
        var s = Math.min(1, Math.abs(dy / th) * 2.2);
        pos.push(P[i][0] + (nx * w), P[i][1], P[i][2] + (nz * w),  P[i][0] - (nx * w), P[i][1], P[i][2] - (nz * w));
        uv.push(0, 0, 1, 0);
        flow.push(phi, phi);
        steep.push(s, s);
        if (i > 0) { var e = 2 * (i - 1); idx.push(e, e + 2, e + 1,  e + 1, e + 2, e + 3); }
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setAttribute("flow", new THREE.Float32BufferAttribute(flow, 1));
      g.setAttribute("steep", new THREE.Float32BufferAttribute(steep, 1));
      g.setIndex(idx);
      grp.add(new THREE.Mesh(g, mat));
    });
    return grp;
  }

  // ------------------------------------------------------------ hoops

  function ring(h, color, tube) {
    var m = new THREE.Mesh(new THREE.TorusGeometry(h.r, tube, 8, 48),
                           new THREE.MeshLambertMaterial({ color: color, emissive: color, emissiveIntensity: 0.35, transparent: true }));
    m.position.set(h.p[0], h.p[1], h.p[2]);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(h.n[0], h.n[1], h.n[2]));
    return m;
  }

  // Returns { group, hoops (meshes, same order as L.hoops), finish (or
  // null), colors (hoop, next, done, finish as numbers) }.
  //
  function build(L) {
    var R = L.roles, cols = { hoop: ( R ? new THREE.Color(R.hoop).getHex() : COLORS.hoop ), next: ( R ? new THREE.Color(R.next).getHex() : COLORS.next ),
                              done: COLORS.done, finish: ( R ? new THREE.Color(R.finish).getHex() : COLORS.finish ) },
        g = new THREE.Group(), hoops = L.hoops.map(function(h) { return ring(h, cols.hoop, 0.45); }),
        fin = ( L.finish ? ring(L.finish, cols.finish, 0.8) : null );

    // Finish: the ring plus two banner poles on the ground.
    //
    var F = L.sdf || LevelGen.sdf(L), poles = ( L.finish ? [-1, 1] : [] );
    poles.forEach(function(s) {
      var n = L.finish.n, l = Math.sqrt((n[0] * n[0]) + (n[2] * n[2])) || 1,
          x = L.finish.p[0] + ((n[2] / l) * s * (L.finish.r + 2)),
          z = L.finish.p[2] - ((n[0] / l) * s * (L.finish.r + 2)),
          gy = F.height(x, z), top = L.finish.p[1] + 4,
          pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, top - gy), lambert(0xf5f0e6)),
          flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), lambert(cols.finish, { side: THREE.DoubleSide }));
      pole.position.set(x, (top + gy) / 2, z);
      flag.position.set(x + 1.5, top - 1, z);
      g.add(pole, flag);
    });

    g.add(terrain(L), buildings(L), rocks(L), streams(L), trees(L), logs(L), floaters(L), pools(L, streamMat));
    if (fin) { g.add(fin); }
    if (typeof L.water === "number") { g.add(water(L)); }
    hoops.forEach(function(h) { g.add(h); });
    return { group: g, hoops: hoops, finish: fin, colors: cols };
  }

  DR.COLORS = COLORS;
  DR.World  = { build: build, roleBlend: roleBlend, time: TIME };
})();
