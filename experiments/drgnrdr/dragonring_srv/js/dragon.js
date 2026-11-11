// Teal dragon and hooded rider, built in code: the built-in model
// ("teal-dragon"), and the fallback when another model is missing or
// fails to load (see js/models.js).  Faces +z, +x is its left.
//
// The body, neck and tail are one tube (a "loft": rings of vertices
// swept along a curve) whose centre line is re-bent every frame, so
// the tail sways and the neck turns into a turn.  The wings are a bone
// chain, shoulder -> elbow -> wrist -> three fingers, with the
// membrane stretched between the bones and the body; each frame the
// joints are rotated and the membrane rebuilt.  The wings beat in step
// with the pedal presses (js/wingsync.js), one beat per press, and fold
// at the wrist on the upstroke; with no pedalling they hold out in a
// glide.
//
(function() {
  var DR = window.DR = window.DR || {};
  var V3 = THREE.Vector3;

  var COL = {
    body   : 0x2f6b5e, belly : 0xe8d9a8, ridge : 0x1d443c, horn  : 0xf1e6c8,
    wing   : 0xc8643c, wing2 : 0xe7a066, claw  : 0x2a2622, eye   : 0xffd34a,
    cloak  : 0x8b2e3c, tunic : 0x3c4a6b, pants : 0x5a4634, boot  : 0x2a2420,
    skin   : 0xf0c8a0, saddle: 0x6b4228, rein  : 0x3b2a1e
  };

  function lam(opt) {
    return new THREE.MeshLambertMaterial(Object.assign({ flatShading: true }, opt));
  }

  // Piecewise-linear profile: keys [[t, v], ...] with t increasing.
  //
  function prof(keys, t) {
    if (t <= keys[0][0]) { return keys[0][1]; }
    for (var i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        var a = keys[i - 1], b = keys[i], f = (t - a[0]) / (b[0] - a[0]);
        return a[1] + ((b[1] - a[1]) * f);
      }
    }
    return keys[keys.length - 1][1];
  }

  // ---------------------------------------------------------------- loft

  // m rings of n vertices; ring i is placed by set().  Colours per
  // vertex: 'top' along the top line, 'belly' underneath, 'side' else.
  //
  function Loft(m, n, mat) {
    var g = new THREE.BufferGeometry(), idx = [];
    this.m   = m;
    this.n   = n;
    this.pos = new Float32Array(m * n * 3);
    this.col = new Float32Array(m * n * 3);
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(m * n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    for (var i = 0; (i + 1) < m; i++) {
      for (var k = 0; k < n; k++) {
        var a = (i * n) + k, b = (i * n) + ((k + 1) % n),
            c = ((i + 1) * n) + k, d = ((i + 1) * n) + ((k + 1) % n);
        idx.push(a, b, c,  b, d, c);
      }
    }
    g.setIndex(idx);
    this.geo  = g;
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false;
    this.X = new V3(1, 0, 0);
  }

  // R[i] = { p: V3, t: V3 (unit tangent), rx, ry, ridge, top, side,
  // belly (THREE.Color) }.
  //
  Loft.prototype.set = function(R, colors) {
    var n = this.n, P = this.pos, C = this.col, X = this.X.clone(), Y = new V3(), ref = new V3();
    for (var i = 0; i < this.m; i++) {
      var r = R[i];
      ref.set(0, 1, 0);
      if (Math.abs(r.t.y) > 0.9) { ref.set(0, 0, -1); }
      var nx = new V3().crossVectors(ref, r.t);
      if (nx.lengthSq() > 1e-8) { X.copy(nx.normalize()); }
      Y.crossVectors(r.t, X).normalize();
      for (var k = 0; k < n; k++) {
        var th = (2 * Math.PI * k) / n, c = Math.cos(th), s = Math.sin(th),
            ry = r.ry * ( (s < 0) ? 0.85 : 1 ),
            up = (s * ry) + ( (k === (n / 4)) ? r.ridge : 0 ),
            j  = 3 * ((i * n) + k);
        P[j]     = r.p.x + (X.x * c * r.rx) + (Y.x * up);
        P[j + 1] = r.p.y + (X.y * c * r.rx) + (Y.y * up);
        P[j + 2] = r.p.z + (X.z * c * r.rx) + (Y.z * up);
        if (colors) {
          var col = ( (s > 0.9) ? r.top : ( (s < -0.3) ? r.belly : r.side ) );
          C[j] = col.r;  C[j + 1] = col.g;  C[j + 2] = col.b;
        }
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    if (colors) { this.geo.attributes.color.needsUpdate = true; }
  };

  // Rings along a Catmull-Rom curve through 'pts', sizes from profile
  // keys over t in 0..1.
  //
  function curveRings(curve, m, o) {
    var R = [];
    for (var i = 0; i < m; i++) {
      var t = i / (m - 1), r = prof(o.r, t);
      R.push({ p: curve.getPoint(t), t: curve.getTangent(t).normalize(),
               rx: r * (o.wx || 1), ry: r * (o.wy || 1),
               ridge: ( o.ridge ? prof(o.ridge, t) * ( ((i % 2) === 0) ? 1 : 0.35 ) : 0 ),
               top: o.top, side: o.side, belly: o.belly });
    }
    return R;
  }

  // A static tube through points, one colour (or top/side/belly).
  //
  function limb(pts, radii, color, n, m) {
    var c = new THREE.Color(color),
        curve = new THREE.CatmullRomCurve3(pts.map(function(p) { return new V3(p[0], p[1], p[2]); })),
        L = new Loft(m || 8, n || 8, lam({ vertexColors: true })),
        keys = radii.map(function(r, i) { return [i / (radii.length - 1), r]; });
    L.set(curveRings(curve, L.m, { r: keys, top: c, side: c, belly: c }), true);
    return L.mesh;
  }

  // Bone between two moving points: a unit cylinder along +y, placed
  // and stretched each frame.
  //
  function Bone(r0, r1, mat) {
    var g = new THREE.CylinderGeometry(r1, r0, 1, 6, 1).translate(0, 0.5, 0);
    this.mesh = new THREE.Mesh(g, mat);
  }
  var UPY = new V3(0, 1, 0);
  Bone.prototype.place = function(a, b) {
    var d = new V3().subVectors(b, a), l = d.length();
    this.mesh.position.copy(a);
    this.mesh.quaternion.setFromUnitVectors(UPY, d.divideScalar(l || 1));
    this.mesh.scale.set(1, l, 1);
  };

  // ---------------------------------------------------------------- parts

  var SPINE = [
    [0, 1.55, 3.05], [0, 1.2, 2.4], [0, 0.6, 1.6], [0, 0.3, 0.6], [0, 0.22, -0.5],
    [0, 0.15, -1.5], [0, 0.05, -2.6], [0, -0.05, -3.7], [0, -0.1, -4.8], [0, -0.12, -5.9]
  ];
  var SPINE_R     = [[0, 0.3], [0.12, 0.36], [0.22, 0.6], [0.33, 0.78], [0.45, 0.74], [0.56, 0.55], [0.68, 0.3], [0.85, 0.14], [1, 0.03]],
      SPINE_RIDGE = [[0, 0.1], [0.3, 0.22], [0.6, 0.16], [0.9, 0.08], [1, 0.02]];

  function head(cols) {
    var g = new THREE.Group(), mv = lam({ vertexColors: true }),
        skull = new Loft(9, 10, mv), jaw = new Loft(6, 8, mv),
        sc = new THREE.CatmullRomCurve3([new V3(0, 0, -0.4), new V3(0, 0.02, 0.2), new V3(0, -0.04, 0.8), new V3(0, -0.1, 1.3)]),
        jc = new THREE.CatmullRomCurve3([new V3(0, -0.2, -0.1), new V3(0, -0.28, 0.5), new V3(0, -0.3, 1.05)]);
    skull.set(curveRings(sc, 9, { r: [[0, 0.3], [0.2, 0.42], [0.45, 0.38], [0.75, 0.26], [1, 0.13]], wx: 1, wy: 0.72,
                                  ridge: [[0, 0.12], [0.4, 0.06], [1, 0]], top: cols.ridge, side: cols.body, belly: cols.body }), true);
    jaw.set(curveRings(jc, 6, { r: [[0, 0.24], [0.6, 0.16], [1, 0.07]], wx: 1, wy: 0.6,
                                top: cols.body, side: cols.body, belly: cols.belly }), true);
    g.add(skull.mesh, jaw.mesh);

    // Horns sweep back and up; small fins behind the jaw; eyes.
    //
    [-1, 1].forEach(function(s) {
      g.add(limb([[0.2 * s, 0.22, -0.15], [0.32 * s, 0.42, -0.6], [0.36 * s, 0.62, -1.15]], [0.11, 0.07, 0.01], COL.horn, 6, 6));
      g.add(limb([[0.36 * s, -0.05, -0.1], [0.55 * s, 0.0, -0.45]], [0.06, 0.0], COL.ridge, 4, 3));
      var eye = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshBasicMaterial({ color: COL.eye }));
      eye.position.set(0.31 * s, 0.1, 0.42);
      g.add(eye);
      var brow = limb([[0.2 * s, 0.2, 0.25], [0.33 * s, 0.18, 0.55]], [0.07, 0.03], COL.ridge, 5, 3);
      g.add(brow);
      var nost = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), lam({ color: COL.claw }));
      nost.position.set(0.06 * s, 0.07, 1.18);
      g.add(nost);
    });
    return g;
  }

  // Wing in the left wing's frame (x out from the shoulder, z forward);
  // the right wing mirrors x.
  //
  var WREST = {
    E  : new V3(1.4, 0.15, 0.25),
    W  : new V3(2.9, 0.25, 0.05),
    F1 : new V3(5.0, 0.05, -0.6),
    F2 : new V3(4.4, -0.05, -1.75),
    F3 : new V3(3.3, -0.05, -2.45),
    B  : new V3(0.0, -0.2, -2.35)
  };
  var TRIS = [["S", "E", "B"], ["E", "W", "B"], ["W", "M3B", "B"], ["W", "F3", "M3B"],
              ["W", "M23", "F3"], ["W", "F2", "M23"], ["W", "M12", "F2"], ["W", "F1", "M12"]];

  function Wing(side, mBone, mMem) {
    var g = new THREE.BufferGeometry();
    this.side = side;
    this.pos  = new Float32Array(TRIS.length * 9);
    var col = new Float32Array(TRIS.length * 9), dark = new THREE.Color(COL.wing), light = new THREE.Color(COL.wing2);
    TRIS.forEach(function(t, i) {
      t.forEach(function(k, j) {
        var c = ( (k[0] === "M") ? light : dark );
        col.set([c.r, c.g, c.b], (9 * i) + (3 * j));
      });
    });
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(TRIS.length * 9), 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    this.geo   = g;
    this.mem   = new THREE.Mesh(g, mMem);
    this.mem.frustumCulled = false;
    this.bones = [new Bone(0.15, 0.11, mBone), new Bone(0.11, 0.08, mBone), new Bone(0.08, 0.025, mBone),
                  new Bone(0.06, 0.02, mBone), new Bone(0.06, 0.02, mBone)];
    this.thumb = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), lam({ color: COL.claw }));
    this.group = new THREE.Group();
    this.group.add(this.mem, this.thumb);
    var grp = this.group;
    this.bones.forEach(function(b) { grp.add(b.mesh); });
  }

  // a1 shoulder, a2 elbow, a3 wrist (raise, radians); sweep folds the
  // hand back at the wrist (and half as much at the elbow).
  //
  Wing.prototype.pose = function(a1, a2, a3, sweep) {
    var P = {}, Z = new V3(0, 0, 1), Yx = new V3(0, 1, 0), s = this.side;
    Object.keys(WREST).forEach(function(k) { P[k] = WREST[k].clone(); });
    P.S = new V3();
    function rot(keys, piv, axis, ang) {
      keys.forEach(function(k) { P[k].sub(piv).applyAxisAngle(axis, ang).add(piv); });
    }
    var hand = ["F1", "F2", "F3"];
    rot(hand, P.W.clone(), Yx, sweep);
    rot(hand, P.W.clone(), Z, a3);
    rot(["W"].concat(hand), P.E.clone(), Yx, sweep * 0.5);
    rot(["W"].concat(hand), P.E.clone(), Z, a2);
    rot(["E", "W"].concat(hand), P.S.clone(), Z, a1);

    // Scallops: trailing edge between fingers pulled in toward the wrist.
    //
    function mid(a, b, f) { return new V3().lerpVectors(P[a], P[b], 0.5).lerp(P.W, f); }
    P.M12 = mid("F1", "F2", 0.22);
    P.M23 = mid("F2", "F3", 0.25);
    P.M3B = mid("F3", "B", 0.3);
    Object.keys(P).forEach(function(k) { P[k].x *= s; });

    var A = this.pos;
    TRIS.forEach(function(t, i) {
      t.forEach(function(k, j) { A.set([P[k].x, P[k].y, P[k].z], (9 * i) + (3 * j)); });
    });
    this.geo.attributes.position.needsUpdate = true;
    this.bones[0].place(P.S, P.E);
    this.bones[1].place(P.E, P.W);
    this.bones[2].place(P.W, P.F1);
    this.bones[3].place(P.W, P.F2);
    this.bones[4].place(P.W, P.F3);
    this.thumb.position.copy(P.W);
    this.thumb.position.z += 0.12;
  };

  function rider() {
    var g = new THREE.Group();

    // Legs astride the neck, torso leaning forward, arms to the reins.
    //
    [-1, 1].forEach(function(s) {
      g.add(limb([[0.14 * s, 0.02, 0.0], [0.5 * s, -0.12, 0.3], [0.72 * s, -0.5, 0.18]], [0.13, 0.11, 0.09], COL.pants));
      g.add(limb([[0.72 * s, -0.48, 0.18], [0.76 * s, -0.68, 0.22], [0.76 * s, -0.72, 0.4]], [0.1, 0.09, 0.07], COL.boot, 6, 5));
      g.add(limb([[0.2 * s, 0.58, 0.12], [0.3 * s, 0.34, 0.42], [0.16 * s, 0.3, 0.72]], [0.09, 0.075, 0.06], COL.tunic, 6, 6));
      var hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), lam({ color: COL.skin }));
      hand.position.set(0.15 * s, 0.3, 0.75);
      g.add(hand);
    });
    g.add(limb([[0, 0.0, 0.0], [0, 0.35, 0.08], [0, 0.66, 0.16]], [0.22, 0.24, 0.2], COL.tunic, 8, 5));
    var cloak = limb([[0, 0.72, 0.12], [0, 0.35, -0.02], [0, 0.0, -0.12]], [0.22, 0.34, 0.42], COL.cloak, 9, 5);
    cloak.material.side = THREE.DoubleSide;
    g.add(cloak);

    // Head: face inside a hood (a shell open at the front) with a
    // point falling back onto the cloak.
    //
    var hd = new THREE.Group(), gap = 1.9, mh = lam({ color: COL.cloak, side: THREE.DoubleSide });
    hd.position.set(0, 0.9, 0.2);
    var face = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), lam({ color: COL.skin }));
    face.scale.set(1, 1.1, 1);
    var hood = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 8, (Math.PI / 2) + (gap / 2), (2 * Math.PI) - gap, 0, Math.PI * 0.75), mh);
    hood.scale.set(1, 1.08, 1.05);
    hood.position.set(0, 0.03, -0.02);
    hood.rotation.x = -0.2;
    var tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 6), mh);
    tip.position.set(0, 0.02, -0.3);
    tip.rotation.x = -2.0;
    hd.add(face, hood, tip);
    g.add(hd);
    return g;
  }

  // ---------------------------------------------------------------- dragon

  function Dragon() {
    var root = new THREE.Group(), body = new THREE.Group(), self = this;
    root.add(body);
    this.cols = { body: new THREE.Color(COL.body), belly: new THREE.Color(COL.belly), ridge: new THREE.Color(COL.ridge) };

    this.spineRest = SPINE.map(function(p) { return new V3(p[0], p[1], p[2]); });
    this.spinePts  = this.spineRest.map(function(p) { return p.clone(); });
    this.curve     = new THREE.CatmullRomCurve3(this.spinePts);
    this.trunk     = new Loft(46, 12, lam({ vertexColors: true }));
    this.trunk.set(this.rings(), true);
    body.add(this.trunk.mesh);

    this.head = head(this.cols);
    body.add(this.head);

    // Spade at the tail tip.
    //
    var sp = new THREE.Shape();
    sp.moveTo(0, 0);  sp.lineTo(0.45, -0.35);  sp.lineTo(0, -0.95);  sp.lineTo(-0.45, -0.35);  sp.lineTo(0, 0);
    this.spade = new THREE.Mesh(new THREE.ShapeGeometry(sp).rotateX(-Math.PI / 2), lam({ color: COL.wing, side: THREE.DoubleSide }));
    body.add(this.spade);

    // Legs tucked under: thighs and feet, hind and fore.
    //
    [-1, 1].forEach(function(s) {
      body.add(limb([[0.5 * s, 0.1, -1.1], [0.72 * s, -0.4, -1.5], [0.55 * s, -0.55, -2.25]], [0.34, 0.2, 0.1], COL.body));
      body.add(limb([[0.55 * s, -0.55, -2.2], [0.5 * s, -0.62, -2.6]], [0.12, 0.04], COL.claw, 5, 3));
      body.add(limb([[0.42 * s, 0.0, 1.2], [0.55 * s, -0.4, 1.35], [0.38 * s, -0.55, 1.05]], [0.2, 0.12, 0.07], COL.body));
      body.add(limb([[0.38 * s, -0.55, 1.05], [0.3 * s, -0.6, 0.8]], [0.08, 0.03], COL.claw, 5, 3));
    });

    var mBone = lam({ color: COL.body }), mMem = lam({ vertexColors: true, side: THREE.DoubleSide, emissive: 0x4a1c0a });
    this.wings = [1, -1].map(function(s) {
      var w = new Wing(s, mBone, mMem);
      w.group.position.set(0.5 * s, 0.68, 0.95);
      body.add(w.group);
      return w;
    });

    // Saddle and rider at the base of the neck.
    //
    var saddle = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 0.85), lam({ color: COL.saddle }));
    saddle.position.set(0, 1.08, 0.78);
    saddle.rotation.x = 0.12;
    body.add(saddle);
    this.saddle = saddle;
    this.rider = rider();
    this.rider.position.set(0, 1.18, 0.72);
    this.rider.rotation.x = 0.3;
    body.add(this.rider);

    this.reins = [-1, 1].map(function(s) {
      var g = new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]),
          l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: COL.rein }));
      l.frustumCulled = false;
      body.add(l);
      return { s: s, line: l };
    });

    this.root  = root;
    this.body  = body;
    this.phase = 0;
    this.amp   = 0;
    this.sync  = new DR.WingSync();
    this.t     = 0;
    this.animate(0, 0, 0, 0);
  }

  Dragon.prototype.rings = function() {
    var c = this.cols;
    return curveRings(this.curve, this.trunk.m, { r: SPINE_R, wx: 1.05, wy: 0.9, ridge: SPINE_RIDGE,
                                                  top: c.ridge, side: c.body, belly: c.belly });
  };

  // 'cad' strokes per minute, 'turn' -1..1, 'speed' units/s.
  //
  Dragon.prototype.animate = function(dt, cad, turn, speed) {
    var t = (this.t += dt), self = this;
    // Beat locked to the pedal presses (js/wingsync.js): top of the
    // beat at phase pi/2, bottom at 3 pi/2; between rhythms the beat
    // fades to a glide.
    //
    var w = this.sync.update(dt);
    this.phase = (Math.PI / 2) + (2 * Math.PI * DR.wingShape(w.phase));
    this.amp   = w.amp * 0.85;
    var A = this.amp, ph = this.phase, sn = Math.sin(ph);

    // Spine: the neck leans into the turn, the tail sways and trails
    // the turn.
    //
    this.spinePts.forEach(function(p, i) {
      var r = self.spineRest[i], k = Math.max(0, i - 4);
      p.copy(r);
      if (i <= 2) { p.x += turn * 0.35 * (1 - (i / 3));  p.y += (sn * A * 0.06) * (2 - i); }
      p.x += (Math.sin((t * 1.7) - (i * 0.55)) * 0.09 * k) - (turn * 0.12 * k);
      p.y += Math.sin((t * 1.1) - (i * 0.4)) * 0.04 * k;
    });
    this.trunk.set(this.rings(), false);

    // Head on the neck tip, looking mostly ahead.
    //
    var p0 = this.curve.getPoint(0), dir = new V3().subVectors(this.spinePts[0], this.spinePts[1]).normalize();
    dir.lerp(new V3(turn * 0.25, -0.12, 1).normalize(), 0.7).normalize();
    this.head.position.copy(p0);
    this.head.quaternion.setFromUnitVectors(new V3(0, 0, 1), dir);

    var tip = this.curve.getPoint(1), pre = this.curve.getPoint(0.97);
    this.spade.position.copy(tip);
    this.spade.lookAt(new V3().subVectors(tip, pre).add(tip));
    this.spade.rotateX(Math.PI);

    // Wing beat: the elbow and wrist lag the shoulder, the hand folds
    // back on the way up.  Gliding: slight dihedral, tips up.
    //
    var a1 = 0.14 + (A * sn),
        a2 = -0.08 + (A * 0.5 * Math.sin(ph - 0.7)),
        a3 = 0.1 + (A * 0.4 * Math.sin(ph - 1.3)),
        sw = A * 0.55 * Math.max(0, Math.cos(ph));
    this.wings.forEach(function(w) { w.pose(a1, a2, a3, sw); });
    this.body.position.y = -sn * A * 0.18;

    // Reins run from the hands to the corners of the jaw.
    //
    this.rider.updateMatrix();
    this.head.updateMatrix();
    this.reins.forEach(function(r) {
      var a = new V3(0.15 * r.s, 0.3, 0.75).applyMatrix4(self.rider.matrix),
          b = new V3(0.3 * r.s, -0.22, 0.75).applyMatrix4(self.head.matrix);
      r.line.geometry.setFromPoints([a, b]);
    });
  };

  // One pedal press: keeps the wing beat in step (js/wingsync.js).
  //
  Dragon.prototype.stroke = function() { this.sync.press(); };

  // Show or hide the rider, with the saddle and reins.
  //
  Dragon.prototype.setRider = function(on) {
    this.rider.visible  = on;
    this.saddle.visible = on;
    this.reins.forEach(function(r) { r.line.visible = on; });
  };

  DR.Dragon    = Dragon;
  DR.TealParts = { COL: COL, rider: rider, lam: lam };
  DR.Models.register("teal-dragon", "Teal dragon (built-in)", function(done) { done(new Dragon()); });
})();
