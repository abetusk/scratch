// Dragon models loaded from glTF files (.glb), registered in the model
// list (js/models.js).  Needs THREE.GLTFLoader (vendor/three-addons)
// to fetch the file: fine over HTTP and from file:// in Firefox; Chrome-
// based browsers block file:// fetches, and the model list then falls
// back to the teal dragon.
//
// What the wrapper does with a file:
// - plays its flying clip in step with the pedal presses
//   (js/wingsync.js), one beat per press, each press at the top of the
//   beat; with no pedalling it eases to the clip's widest-wing frame
//   and holds it (glide);
// - optionally swaps unlit materials for flat-shaded lit ones (same
//   texture), to match the scene;
// - centres the model on its body bone and seats the hooded rider from
//   js/dragon.js on the back, just behind the neck, found from the
//   mesh; the rider rides on the back bone, so it moves with the body;
//   reins run from the rider's hands to the head bone.
//
(function() {
  var DR = window.DR, V3 = THREE.Vector3;

  // Paths are relative to the folder holding js/ (works from the game
  // page and from tools/ pages alike).
  //
  var BASE = (function() {
    var s = document.currentScript && document.currentScript.src;
    return ( s ? s.replace(/js\/models-gltf\.js(\?.*)?$/, "") : "" );
  })();

  function GltfDragon(gltf, o) {
    var root = new THREE.Group(), inner = gltf.scene, self = this;
    root.add(inner);
    inner.scale.setScalar(o.scale || 1);
    this.root  = root;
    this.inner = inner;
    this.o     = o;
    this.bones = {};
    inner.traverse(function(n) {
      if (n.isBone || n.type === "Object3D" || n.isGroup) { self.bones[n.name] = n; }
      if (n.isMesh) {
        n.frustumCulled = false;
        if (o.lit && n.material && n.material.isMeshBasicMaterial) {
          var m = n.material;
          n.material = new THREE.MeshLambertMaterial({ map: m.map, color: m.color, side: m.side, flatShading: true,
                                                       transparent: m.transparent, alphaTest: m.alphaTest });
        }
        if (n.isSkinnedMesh) { self.skinned = n; }
      }
    });

    this.mixer  = new THREE.AnimationMixer(inner);
    this.clip   = THREE.AnimationClip.findByName(gltf.animations, o.clip) || gltf.animations[0];
    this.action = this.mixer.clipAction(this.clip);
    this.action.play();
    this.dur    = this.clip.duration;
    this.glideT = this.findGlide();
    this.ct     = this.glideT;
    this.sync   = new DR.WingSync();
    this.action.time = this.glideT;
    this.mixer.update(0);
    root.updateMatrixWorld(true);

    // Centre: body bone at the origin (plus a small lift).
    //
    var body = this.bones[o.bodyBone];
    if (body) {
      var bp = root.worldToLocal(body.getWorldPosition(new V3()));
      inner.position.x -= bp.x;
      inner.position.y -= bp.y - (o.lift || 0);
      inner.position.z -= bp.z;
      root.updateMatrixWorld(true);
    }
    this.seatRider();
    this.speedUp = 0;
  }

  // The clip time where the wings are spread widest: the glide pose.
  //
  GltfDragon.prototype.findGlide = function() {
    var L = this.bones[this.o.tipL], R = this.bones[this.o.tipR], best = 0, bt = 0, hi = -1e9, lo = 1e9;
    this.tTop = 0;
    this.tBot = this.dur / 2;
    if (!L || !R) { return 0; }
    for (var i = 0; i < 48; i++) {
      this.action.time = (i / 48) * this.dur;
      this.mixer.update(0);
      this.root.updateMatrixWorld(true);
      var a = this.root.worldToLocal(L.getWorldPosition(new V3())),
          b = this.root.worldToLocal(R.getWorldPosition(new V3())),
          span = Math.abs(a.x - b.x) - (Math.abs(a.y - b.y) * 0.5);
      if (span > best) { best = span;  bt = this.action.time; }

      // Wing-tip height: highest = top of the beat, lowest = bottom.
      //
      var y = (a.y + b.y) / 2;
      if (y > hi) { hi = y;  this.tTop = this.action.time; }
      if (y < lo) { lo = y;  this.tBot = this.action.time; }
    }
    return bt;
  };

  // Seat: the highest point of the back near the centre line, a little
  // behind the base of the neck.
  //
  GltfDragon.prototype.seatRider = function() {
    var o = this.o, neck = this.bones[o.neckBone], back = this.bones[o.backBone], sk = this.skinned;
    if (!neck || !back || !sk) { return; }
    var N  = this.root.worldToLocal(neck.getWorldPosition(new V3())),
        zs = N.z - (o.seatBack || 0.4), top = -1e9, v = new V3(),
        n  = sk.geometry.attributes.position.count;
    for (var i = 0; i < n; i++) {
      sk.getVertexPosition(i, v);
      sk.localToWorld(v);
      this.root.worldToLocal(v);
      if ( (Math.abs(v.x) < 0.3) && (Math.abs(v.z - zs) < 0.35) ) { top = Math.max(top, v.y); }
    }
    if (top < -1e8) { top = N.y; }

    var P = DR.TealParts, rider = P.rider(), seat = new THREE.Group(),
        sad = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 0.85), P.lam({ color: P.COL.saddle }));
    sad.position.set(0, -0.08, 0.05);
    rider.position.set(0, 0.06, 0);
    rider.rotation.x = 0.3;
    seat.add(sad, rider);
    seat.scale.setScalar(o.riderScale || 1);

    // Hang the seat on the back bone, upright in the dragon's frame.
    //
    var wp = this.root.localToWorld(new V3(0, top + 0.02, zs)),
        bq = back.getWorldQuaternion(new THREE.Quaternion()),
        rq = this.root.getWorldQuaternion(new THREE.Quaternion());
    seat.position.copy(back.worldToLocal(wp));
    seat.quaternion.copy(bq.invert().multiply(rq));
    back.add(seat);
    this.seat  = seat;
    this.rider = rider;

    this.reins = [-1, 1].map(function(s) {
      var g = new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]),
          l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: P.COL.rein }));
      l.frustumCulled = false;
      return { s: s, line: l };
    });
    var root = this.root;
    this.reins.forEach(function(r) { root.add(r.line); });
  };

  // Show or hide the rider, with the saddle and reins.
  //
  GltfDragon.prototype.setRider = function(on) {
    if (!this.seat) { return; }
    this.seat.visible = on;
    this.reins.forEach(function(r) { r.line.visible = on; });
  };

  // One pedal press: keeps the wing beat in step (js/wingsync.js).
  //
  GltfDragon.prototype.stroke = function() { this.sync.press(); };

  // Clip time follows the beat phase: top of the beat (tTop) at each
  // press, down to the bottom (tBot), back up.  Gliding (no rhythm):
  // ease to the glide pose.
  //
  GltfDragon.prototype.animate = function(dt, cad, turn, speed) {
    var a = this.action, D = this.dur, w = this.sync.update(dt), target, k;
    if (this.sync.active) {
      var down = ((this.tBot - this.tTop) % D + D) % D, sp = DR.wingShape(w.phase);
      target = this.tTop + ( (sp < 0.5) ? (2 * sp * down) : (down + ((2 * sp) - 1) * (D - down)) );
      k = 25;
    }
    else {
      target = this.glideT;
      k = 3;
    }
    var d = target - this.ct;
    d -= D * Math.round(d / D);
    this.ct += d * (1 - Math.exp(-dt * k));
    a.timeScale = 0;
    a.time = ((this.ct % D) + D) % D;
    this.mixer.update(0);
    if (!this.rider) { return; }

    this.root.updateMatrixWorld(true);
    var head = this.bones[this.o.headBone], root = this.root, rider = this.rider;
    this.reins.forEach(function(r) {
      var h = rider.localToWorld(new V3(0.15 * r.s, 0.3, 0.75)),
          j = ( head ? head.localToWorld(new V3(0.15 * r.s, 0.15, 0.2)) : h.clone() );
      r.line.geometry.setFromPoints([root.worldToLocal(h), root.worldToLocal(j)]);
    });
  };

  // id, label, file and how to read it.  'credit' is shown in the game
  // while the model is in use (the licence asks for attribution).
  //
  var FILES = [
    { id: "mattbas-dragon", label: "Simple dragon (MattBas, CC-BY-SA 4.0)",
      url: "vendor/models/mattbas-dragon/dragon.glb",
      credit: "Dragon model by MattBas, CC-BY-SA 4.0 (opengameart.org/content/simple-3d-dragon-model)",
      clip: "Flying-loop", lit: true, scale: 1, lift: 0.2,
      bodyBone: "Body", backBone: "UpperBack", neckBone: "Neck0", headBone: "Head",
      tipL: "LeftWingFingerOutBottom", tipR: "RightWingFingerOutBottom", seatBack: 0.35, riderScale: 0.8 }
  ];

  FILES.forEach(function(F) {
    DR.Models.register(F.id, F.label, function(done) {
      if (!THREE.GLTFLoader) { done(null, "GLTFLoader not loaded");  return; }
      new THREE.GLTFLoader().load(BASE + F.url,
        function(g) {
          try {
            var m = new GltfDragon(g, F);
            m.credit = F.credit;
            done(m);
          }
          catch (e) { done(null, "model setup failed: " + e.message); }
        },
        undefined,
        function(e) { done(null, "could not load " + F.url + ( (location.protocol === "file:") ? " (page opened as file://)" : "" )); });
    });
  });
})();
