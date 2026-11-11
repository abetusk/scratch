// Effects, each optional with parameters (config.json 'fx', Settings →
// Effects):
//
// - weather: rain streaks and snow flakes in a box around the camera,
//   anchored to the world (they wrap as the camera moves, never slide
//   with it).  Each stage has rain, snow or clear skies by chance
//   ('chance'); the amount blends across stage joins.  Rain makes small
//   splash rings on the ground in view, out to 'splashRange' ahead
//   ('splashes', a rate).
// - lightning (in rain): every 'every' seconds or so a flash lights the
//   scene, flickering two or three times; a share ('bolts') of them
//   also show a jagged bolt to the ground in the distance, the rest are
//   in the clouds.
// - geysers: jets of steam from the valley floor, erupting every few
//   seconds; lava vents: glowing vents trailing dark smoke.  Both are
//   GPU particles (all motion in the vertex shader).
// - birds: flocks circling above the valley, wings flapping.
// - critters: small animals hopping on the valley floor.
//
// Placed things (geysers, vents, birds, critters) are added to each
// stage's group when the stage is built, so they go with the stage.
//
//   var fx = new DR.Fx(scene);
//   fx.decorate(stage, group, cfg)       // when a stage is built
//   fx.update(dt, camera, cfg, weather)  // each frame
//
(function() {
  var DR = window.DR = window.DR || {};

  var DEFAULTS = {
    rain     : { enabled: true, chance: 0.3, amount: 1, speed: 30, length: 1.2, wind: 0.15, opacity: 0.45, color: "#b8c8e0", splashes: 1, splashRange: 220 },
    lightning: { enabled: true, every: 15, bolts: 0.6, brightness: 1 },
    snow     : { enabled: true, chance: 0.2, amount: 1, speed: 3, size: 0.09, sway: 1, color: "#ffffff" },
    geysers  : { enabled: true, perStage: 4, height: 30, period: 9, color: "#f2f6f8" },
    vents    : { enabled: true, perStage: 3, height: 40, glow: "#ff6a20", smoke: "#2a2624" },
    birds    : { enabled: true, flocks: 3, size: 0.9, color: "#1e1c22" },
    critters : { enabled: true, perStage: 14, size: 0.6, color: "#8a6a4a" }
  };

  // Shared uniforms: time, camera, fog (copied from the scene each frame).
  //
  var U = { time: { value: 0 }, camPos: { value: new THREE.Vector3() }, fogColor: { value: new THREE.Color() },
            fogNear: { value: 100 }, fogFar: { value: 600 }, scale: { value: 400 } };
  var FOG = "uniform vec3 fogColor; uniform float fogNear, fogFar; float fogAmt(float d) { return smoothstep(fogNear, fogFar, d); }";

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seeds(n, per, r) {
    var a = new Float32Array(n * per * 4);
    for (var i = 0; i < n; i++) {
      var s = [r(), r(), r(), r()];
      for (var k = 0; k < per; k++) { a.set(s, ((i * per) + k) * 4); }
    }
    return a;
  }

  // ---------------------------------------------------------------- weather

  // A box 80 wide, 50 high, 80 deep around the camera.
  //
  var BOX = [
    "uniform vec3 camPos;",
    "vec3 boxPos(vec3 s, float fall) {",
    "  vec3 S = vec3(80.0, 50.0, 80.0), p;",
    "  p.x = camPos.x + mod((s.x * S.x) - camPos.x, S.x) - (0.5 * S.x);",
    "  p.z = camPos.z + mod((s.z * S.z) - camPos.z, S.z) - (0.5 * S.z);",
    "  p.y = camPos.y + mod((s.y * S.y) - fall - camPos.y, S.y) - (0.5 * S.y);",
    "  return p;",
    "}"
  ].join("\n");

  function Rain(max) {
    var g = new THREE.BufferGeometry(), end = new Float32Array(max * 2), r = rng(7);
    for (var i = 0; i < max; i++) { end[(2 * i) + 1] = 1; }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(max * 6), 3));
    g.setAttribute("seed", new THREE.BufferAttribute(seeds(max, 2, r), 4));
    g.setAttribute("endF", new THREE.BufferAttribute(end, 1));
    this.u = Object.assign({ amount: { value: 0 }, speed: { value: 30 }, len: { value: 1 }, wind: { value: 0.1 },
                             opacity: { value: 0.4 }, color: { value: new THREE.Color() } }, U);
    this.mesh = new THREE.LineSegments(g, new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false,
      vertexShader: [
        BOX,
        "uniform float time, amount, speed, len, wind; attribute vec4 seed; attribute float endF; varying float vA, vD;",
        "void main() {",
        "  vec3 p = boxPos(seed.xyz, time * speed * (0.8 + (0.4 * seed.w)));",
        "  p += endF * vec3(wind * len, len, 0.0);",
        "  vec4 mv = viewMatrix * vec4(p, 1.0);",
        "  vA = 0.3 + (0.7 * endF);  vD = -mv.z;",
        "  gl_Position = ( (seed.w < amount) ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0) );",
        "}"
      ].join("\n"),
      fragmentShader: [
        FOG,
        "uniform vec3 color; uniform float opacity; varying float vA, vD;",
        "void main() { gl_FragColor = vec4(mix(color, fogColor, fogAmt(vD)), opacity * vA); }"
      ].join("\n")
    }));
    this.mesh.frustumCulled = false;
  }

  // Splashes: a pool of short-lived rings (squashed to lie on the
  // ground), reused oldest first.
  //
  function Splashes(max) {
    var g = new THREE.BufferGeometry();
    this.max  = max;  this.next = 0;
    this.pos  = new Float32Array(max * 3);
    this.info = new Float32Array(max * 2);
    for (var i = 0; i < max; i++) { this.info[2 * i] = -100; }
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("info", new THREE.BufferAttribute(this.info, 2));
    this.g = g;
    this.u = Object.assign({ color: { value: new THREE.Color() }, opacity: { value: 0.5 }, life: { value: 0.4 } }, U);
    this.mesh = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false,
      vertexShader: [
        "uniform float time, scale, life; attribute vec2 info; varying float vA, vD;",
        "void main() {",
        "  float a = (time - info.x) / life;",
        "  vec4 mv = viewMatrix * vec4(position, 1.0);",
        "  vD = -mv.z;",
        "  vA = ( ((a >= 0.0) && (a < 1.0)) ? 1.0 - a : 0.0 );",
        "  float sz = info.y * (0.35 + a);",
        "  gl_PointSize = max(1.0, (sz * scale) / max(vD, 0.5));",
        "  gl_Position = ( (vA > 0.0) ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0) );",
        "}"
      ].join("\n"),
      fragmentShader: [
        FOG,
        "uniform vec3 color; uniform float opacity; varying float vA, vD;",
        "void main() {",
        "  vec2 q = (gl_PointCoord * 2.0) - 1.0;",
        "  float r = length(vec2(q.x, q.y * 3.0)), a = smoothstep(0.55, 0.8, r) * (1.0 - smoothstep(0.85, 1.0, r));",
        "  if (a < 0.02) { discard; }",
        "  gl_FragColor = vec4(mix(color, fogColor, fogAmt(vD)), a * vA * opacity);",
        "}"
      ].join("\n")
    }));
    this.mesh.frustumCulled = false;
  }
  Splashes.prototype.add = function(x, y, z, size, t) {
    var i = this.next;
    this.next = (this.next + 1) % this.max;
    this.pos[3 * i] = x;  this.pos[(3 * i) + 1] = y;  this.pos[(3 * i) + 2] = z;
    this.info[2 * i] = t;  this.info[(2 * i) + 1] = size;
    this.dirty = true;
  };
  Splashes.prototype.flush = function() {
    if (!this.dirty) { return; }
    this.g.attributes.position.needsUpdate = true;
    this.g.attributes.info.needsUpdate = true;
    this.dirty = false;
  };

  // Lightning: flashes (light boost and a white screen wash, flickering)
  // and sometimes a jagged bolt (a few line strips) far ahead, from the
  // clouds to the ground.
  //
  function Lightning(scene) {
    this.r     = rng(97);
    this.next  = 4 + (6 * this.r());
    this.age   = 1e9;
    this.flash = 0;
    this.bolt  = new THREE.LineSegments(new THREE.BufferGeometry(),
                                        new THREE.LineBasicMaterial({ color: 0xffffff, fog: false, transparent: true, depthWrite: false }));
    this.bolt.frustumCulled = false;
    this.bolt.visible = false;
    scene.add(this.bolt);
    this.wash = document.createElement("div");
    this.wash.style.cssText = "position:fixed;left:0;top:0;right:0;bottom:0;background:#eef2ff;opacity:0;pointer-events:none;mix-blend-mode:screen;";
    document.body.appendChild(this.wash);
  }
  Lightning.prototype.strike = function(camera, ground, cfg) {
    var r = this.r, P = [];
    this.age  = 0;
    this.amps = [1, 0.5 + (0.4 * r()), ( (r() < 0.6) ? 0.7 : 0 )];
    this.hasBolt = (r() < cfg.bolts);
    if (!this.hasBolt) { return; }
    var f = new THREE.Vector3();
    camera.getWorldDirection(f);
    var a = Math.atan2(f.x, f.z) + ((r() - 0.5) * 1.6), d = 180 + (240 * r()),
        gx = camera.position.x + (Math.sin(a) * d), gz = camera.position.z + (Math.cos(a) * d), gy = ( ground ? ground(gx, gz) : 0 ),
        top = gy + 230 + (60 * r());
    function strip(x, y, z, x1, y1, z1, n, jit) {
      var px = x, py = y, pz = z;
      for (var i = 1; i <= n; i++) {
        var t = i / n, nx = lerpN(x, x1, t) + ( (i < n) ? (r() - 0.5) * jit : 0 ), ny = lerpN(y, y1, t), nz = lerpN(z, z1, t) + ( (i < n) ? (r() - 0.5) * jit : 0 );
        P.push(px, py, pz, nx, ny, nz);
        px = nx;  py = ny;  pz = nz;
      }
    }
    strip(gx + ((r() - 0.5) * 60), top, gz + ((r() - 0.5) * 60), gx, gy, gz, 16, 22);
    for (var b = 0; b < 2; b++) {
      var k = 4 + Math.floor(r() * 8), sx = P[(k * 6)], sy = P[(k * 6) + 1], sz = P[(k * 6) + 2];
      strip(sx, sy, sz, sx + ((r() - 0.5) * 80), sy - 40 - (40 * r()), sz + ((r() - 0.5) * 80), 6, 14);
    }
    this.bolt.geometry.dispose();
    this.bolt.geometry = new THREE.BufferGeometry();
    this.bolt.geometry.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  };
  function lerpN(a, b, t) { return a + ((b - a) * t); }
  Lightning.prototype.update = function(dt, rain, camera, ground, cfg) {
    if ( !cfg.enabled || (rain < 0.3) ) {
      this.flash = 0;  this.bolt.visible = false;  this.wash.style.opacity = "0";
      return;
    }
    this.next -= dt * rain;
    if (this.next <= 0) {
      this.strike(camera, ground, cfg);
      this.next = cfg.every * (0.4 + (1.2 * this.r()));
    }
    this.age += dt;
    var f = 0, T = [0, 0.11, 0.24];
    for (var i = 0; i < 3; i++) {
      if ( this.amps && (this.age >= T[i]) ) { f += this.amps[i] * Math.exp(-(this.age - T[i]) * 16); }
    }
    if (this.age > 0.8) { f = 0; }
    f *= cfg.brightness * ( this.hasBolt ? 1 : 0.55 );
    this.flash = f;
    this.bolt.visible = ( this.hasBolt && (f > 0.12) );
    this.bolt.material.opacity = Math.min(1, f * 1.5);
    this.wash.style.opacity = String(Math.min(0.45, f * 0.3));
  };

  function Snow(max) {
    var g = new THREE.BufferGeometry(), r = rng(11);
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(max * 3), 3));
    g.setAttribute("seed", new THREE.BufferAttribute(seeds(max, 1, r), 4));
    this.u = Object.assign({ amount: { value: 0 }, speed: { value: 3 }, size: { value: 0.2 }, sway: { value: 1 },
                             color: { value: new THREE.Color() } }, U);
    this.mesh = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false,
      vertexShader: [
        BOX,
        "uniform float time, amount, speed, size, sway, scale; attribute vec4 seed; varying float vD;",
        "void main() {",
        "  vec3 p = boxPos(seed.xyz, time * speed * (0.6 + (0.8 * seed.w)));",
        "  float ph = (seed.w * 40.0) + (time * (0.5 + seed.x));",
        "  p.x += sin(ph) * sway;  p.z += cos(ph * 0.7) * sway * 0.6;",
        "  vec4 mv = viewMatrix * vec4(p, 1.0);",
        "  vD = -mv.z;",
        "  gl_PointSize = (size * scale) / max(vD, 0.5);",
        "  gl_Position = ( (seed.w < amount) ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0) );",
        "}"
      ].join("\n"),
      fragmentShader: [
        FOG,
        "uniform vec3 color; varying float vD;",
        "void main() {",
        "  vec2 q = (gl_PointCoord * 2.0) - 1.0;",
        "  if (dot(q, q) > 1.0) { discard; }",
        "  gl_FragColor = vec4(mix(color, fogColor, fogAmt(vD)), smoothstep(0.5, 2.0, vD));",
        "}"
      ].join("\n")
    }));
    this.mesh.frustumCulled = false;
  }

  // ---------------------------------------------------------------- plumes

  // Particles rising from emitters.  Per particle: emitter position,
  // seed.  Geysers (kind 0): fast jets with gravity, erupting for a third
  // of each 'period'; vents (kind 1): slow dark smoke always.
  //
  function plumes(list, cfgG, cfgV, seed) {
    var per = [220, 120], n = 0, r = rng(seed);
    list.forEach(function(e) { n += per[e.kind]; });
    if (!n) { return null; }
    var base = new Float32Array(n * 3), sd = new Float32Array(n * 4), kind = new Float32Array(n), i = 0;
    list.forEach(function(e) {
      var ph = r() * 50;
      for (var k = 0; k < per[e.kind]; k++, i++) {
        base.set(e.p, 3 * i);
        sd.set([r(), r(), r(), ph], 4 * i);
        kind[i] = e.kind;
      }
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(base, 3));
    g.setAttribute("seed", new THREE.BufferAttribute(sd, 4));
    g.setAttribute("kind", new THREE.BufferAttribute(kind, 1));
    var m = new THREE.ShaderMaterial({
      uniforms: Object.assign({ gH: { value: cfgG.height }, gP: { value: cfgG.period }, gC: { value: new THREE.Color(cfgG.color) },
                                vH: { value: cfgV.height }, vC: { value: new THREE.Color(cfgV.smoke) } }, U),
      transparent: true, depthWrite: false,
      vertexShader: [
        "uniform float time, gH, gP, scale; uniform float vH; attribute vec4 seed; attribute float kind; varying float vA, vD, vK;",
        "void main() {",
        "  vec3 p = position; float a, size;",
        "  if (kind < 0.5) {",
        "    float life = 1.8, age = fract((time / life) + seed.x), te = time - (age * life),",
        "          on = step(mod(te + seed.w, gP), gP * 0.35), v0 = sqrt(2.0 * 9.8 * gH) * (0.75 + (0.35 * seed.y)), t = age * life;",
        "    p += vec3((seed.y - 0.5) * 3.0 * t, (v0 * t) - (4.9 * t * t), (seed.z - 0.5) * 3.0 * t);",
        "    a = on * (1.0 - age) * 0.9;  size = 0.6 + (1.8 * age);",
        "  }",
        "  else {",
        "    float life = 7.0, age = fract((time / life) + seed.x), t = age * life;",
        "    p += vec3(((seed.y - 0.5) * 2.0 + 1.2) * t, (vH / life) * t, (seed.z - 0.5) * 2.0 * t);",
        "    a = sin(age * 3.1416) * 0.55;  size = 1.5 + (6.0 * age);",
        "  }",
        "  vec4 mv = viewMatrix * vec4(p, 1.0);",
        "  vD = -mv.z;  vA = a;  vK = kind;",
        "  gl_PointSize = (size * scale) / max(vD, 0.5);",
        "  gl_Position = projectionMatrix * mv;",
        "}"
      ].join("\n"),
      fragmentShader: [
        FOG,
        "uniform vec3 gC, vC; varying float vA, vD, vK;",
        "void main() {",
        "  vec2 q = (gl_PointCoord * 2.0) - 1.0;",
        "  float d = dot(q, q);",
        "  if ( (d > 1.0) || (vA < 0.01) ) { discard; }",
        "  vec3 c = ( (vK < 0.5) ? gC : vC );",
        "  gl_FragColor = vec4(mix(c, fogColor, fogAmt(vD)), vA * (1.0 - d));",
        "}"
      ].join("\n")
    });
    var pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    return pts;
  }

  // ---------------------------------------------------------------- birds

  // Instanced birds: a body point and two wing tips per bird, the tips
  // flapping; each flock circles its centre, birds spread around it.
  //
  function birds(flocks, cfg, seed) {
    var r = rng(seed), list = [];
    flocks.forEach(function(f) {
      var n = 6 + Math.floor(r() * 12);
      for (var i = 0; i < n; i++) {
        list.push([f[0], f[1], f[2], f[3], f[4] + (r() * 0.6), (r() - 0.5) * 8, (r() - 0.5) * 4, (r() - 0.5) * 8, r() * 6.28]);
      }
    });
    if (!list.length) { return null; }
    var s = cfg.size,
        v = [0, 0, 0.6 * s,   -1.4 * s, 0, -0.3 * s,   0, 0, -0.5 * s,
             0, 0, 0.6 * s,    0, 0, -0.5 * s,         1.4 * s, 0, -0.3 * s],
        wing = [0, 1, 0, 0, 0, 1],
        g = new THREE.InstancedBufferGeometry(), A = new Float32Array(list.length * 4), B = new Float32Array(list.length * 4),
        Cc = new Float32Array(list.length);
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.setAttribute("wing", new THREE.Float32BufferAttribute(wing, 1));
    list.forEach(function(q, i) { A.set([q[0], q[1], q[2], q[3]], 4 * i);  B.set([q[4], q[5], q[6], q[7]], 4 * i);  Cc[i] = q[8]; });
    g.setAttribute("fA", new THREE.InstancedBufferAttribute(A, 4));
    g.setAttribute("fB", new THREE.InstancedBufferAttribute(B, 4));
    g.setAttribute("ph", new THREE.InstancedBufferAttribute(Cc, 1));
    g.instanceCount = list.length;
    var m = new THREE.ShaderMaterial({
      uniforms: Object.assign({ color: { value: new THREE.Color(cfg.color) } }, U), side: THREE.DoubleSide,
      vertexShader: [
        "uniform float time; attribute float wing, ph; attribute vec4 fA, fB; varying float vD;",
        "void main() {",
        "  float a = (time * fB.x) + ph, R = fA.w;",
        "  vec3 c = fA.xyz + vec3(cos(a) * R, sin((time * 0.4) + ph) * 2.0, sin(a) * R) + fB.yzw;",
        "  vec3 f = normalize(vec3(-sin(a), 0.0, cos(a))), side = vec3(f.z, 0.0, -f.x);",
        "  vec3 lp = position;",
        "  lp.y += wing * sin((time * 9.0) + (ph * 7.0)) * 0.9 * abs(lp.x);",
        "  vec3 w = c + (side * lp.x) + (vec3(0.0, 1.0, 0.0) * lp.y) + (f * lp.z);",
        "  vec4 mv = viewMatrix * vec4(w, 1.0);",
        "  vD = -mv.z;",
        "  gl_Position = projectionMatrix * mv;",
        "}"
      ].join("\n"),
      fragmentShader: [FOG, "uniform vec3 color; varying float vD;",
                       "void main() { gl_FragColor = vec4(mix(color, fogColor, fogAmt(vD)), 1.0); }"].join("\n")
    });
    var mesh = new THREE.Mesh(g, m);
    mesh.frustumCulled = false;
    return mesh;
  }

  // ---------------------------------------------------------------- critters

  // Little hoppers: body, head and two ears, merged; each hops a short
  // way, pauses, turns, hops again, following the ground.
  //
  function critterGeo(s) {
    var parts = [[0.9, 0.6, 1.2, 0, 0.3, 0], [0.55, 0.5, 0.55, 0, 0.75, 0.6], [0.12, 0.45, 0.08, -0.15, 1.15, 0.6],
                 [0.12, 0.45, 0.08, 0.15, 1.15, 0.6], [0.25, 0.25, 0.25, 0, 0.4, -0.65]], gs = [];
    parts.forEach(function(q) {
      var b = new THREE.BoxGeometry(q[0] * s, q[1] * s, q[2] * s);
      b.translate(q[3] * s, q[4] * s, q[5] * s);
      gs.push(b.toNonIndexed());
    });
    var g = THREE.BufferGeometryUtils.mergeGeometries(gs, false);
    gs.forEach(function(b) { b.dispose(); });
    return g;
  }

  // ---------------------------------------------------------------- Fx

  function Fx(scene) {
    this.scene = scene;
    this.rain  = new Rain(9000);
    this.snow  = new Snow(6000);
    this.splash = new Splashes(6000);
    this.light = new Lightning(scene);
    this.updaters = [];
    this.ground = null;
    this.lights = null;
    this.added  = { hemi: 0, sun: 0, fog: 0 };
    this.sr     = rng(31);
    scene.add(this.rain.mesh, this.snow.mesh, this.splash.mesh);
  }

  // Ground height function (x, z) for splashes and bolts.
  //
  Fx.prototype.setGround = function(f) { this.ground = f; };

  // Lights to brighten with lightning (added each frame, then removed
  // before the next, so whatever sets them stays in charge).
  //
  Fx.prototype.setLights = function(hemi, sun) { this.lights = { hemi: hemi, sun: sun }; };

  // Take off the light lightning added last frame: call each frame
  // before anything (the sky) sets the lights and fog.
  //
  Fx.prototype.unflash = function(scene) {
    var L = this.lights, A = this.added;
    if (L) { L.hemi.intensity -= A.hemi;  L.sun.intensity -= A.sun; }
    if (scene.fog) { var c = scene.fog.color;  c.r -= A.fog;  c.g -= A.fog;  c.b -= A.fog; }
    A.hemi = A.sun = A.fog = 0;
  };

  // Splashes fall only in the camera's view: a wedge as wide as the
  // horizontal field of view, from 3 to 'splashRange' ahead.  Distance is
  // picked evenly (so they thin out with distance, about even on screen),
  // and the rate grows with the range.  Far ones are drawn a little
  // larger so they still show at the low resolution.
  //
  var SF = new THREE.Vector3();
  Fx.prototype.rainSplashes = function(dt, camera, cfg, amount) {
    var sp = this.splash, t = U.time.value, r = this.sr;
    sp.u.color.value.set(cfg.color).lerp(new THREE.Color(0xffffff), 0.4);
    sp.u.opacity.value = Math.min(1, cfg.opacity * 1.3);
    if ( (amount > 0.01) && this.ground && (cfg.splashes > 0) ) {
      camera.getWorldDirection(SF);
      var R = Math.max(10, cfg.splashRange || 220), n = Math.min(400, Math.floor((11 * R * cfg.splashes * amount * dt) + r())),
          yaw = Math.atan2(SF.x, SF.z), half = 1.05 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect),
          px = camera.position.x, pz = camera.position.z;
      for (var i = 0; i < n; i++) {
        var a = yaw + ((r() - 0.5) * 2 * half), d = 3 + ((R - 3) * r()), x = px + (Math.sin(a) * d), z = pz + (Math.cos(a) * d);
        sp.add(x, this.ground(x, z) + 0.15, z, (0.6 + (0.4 * r())) * (1 + (d / 80)), t);
      }
    }
    sp.flush();
  };

  // Stage weather by chance (seeded per stage): 0 clear, 1 rain, 2 snow.
  //
  Fx.prototype.weatherOf = function(seed, k, cfg) {
    var r = rng((seed * 7349) + (k * 9157) + 3)(), rc = ( cfg.rain.enabled ? cfg.rain.chance : 0 ), sc = ( cfg.snow.enabled ? cfg.snow.chance : 0 );
    return ( (r < rc) ? 1 : ( (r < (rc + sc)) ? 2 : 0 ) );
  };

  // Spots on the valley floor beside the path (not on it), in the
  // stage's interior.
  //
  function floorSpots(st, n, r, minOff, maxOff) {
    var out = [], P = st.path, z0 = st.terrain.z0, L = st.length || 2400;
    for (var t = 0; (out.length < n) && (t < (n * 30)); t++) {
      var q = P[Math.floor(r() * P.length)];
      if ( (q[2] < (z0 + 150)) || (q[2] > (z0 + L - 150)) ) { continue; }
      var x = q[0] + (( (r() < 0.5) ? -1 : 1 ) * (minOff + (r() * (maxOff - minOff)))), z = q[2] + ((r() - 0.5) * 30),
          y = st.sdf.height(x, z);
      if (st.sdf(x, y + 2, z) < 1.5) { continue; }
      out.push([x, y, z]);
    }
    return out;
  }

  Fx.prototype.decorate = function(st, group, cfg, seed) {
    var r = rng((seed * 131) + (st.stage * 977) + 5), emit = [], self = this, roles = st.roles;

    if (cfg.geysers.enabled) { floorSpots(st, cfg.geysers.perStage, r, 12, 35).forEach(function(p) { emit.push({ kind: 0, p: p }); }); }
    if (cfg.vents.enabled) {
      floorSpots(st, cfg.vents.perStage, r, 14, 45).forEach(function(p) {
        emit.push({ kind: 1, p: [p[0], p[1] + 0.5, p[2]] });
        var vent = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3, 0.6, 9), new THREE.MeshBasicMaterial({ color: cfg.vents.glow }));
        vent.position.set(p[0], p[1] + 0.1, p[2]);
        var rim = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.2, 1.2, 9, 1, true), new THREE.MeshLambertMaterial({ color: 0x2a2220, flatShading: true }));
        rim.position.set(p[0], p[1] + 0.3, p[2]);
        group.add(vent, rim);
        var ph = r() * 9, mat = vent.material, base = new THREE.Color(cfg.vents.glow);
        self.updaters.push({ group: group, f: function(t) { mat.color.copy(base).multiplyScalar(0.75 + (0.25 * Math.sin((t * 3) + ph) * Math.sin((t * 1.7) + ph))); } });
      });
    }
    var pl = plumes(emit, cfg.geysers, cfg.vents, (seed * 31) + st.stage);
    if (pl) { group.add(pl); }

    if (cfg.birds.enabled) {
      var fl = [];
      for (var i = 0; i < cfg.birds.flocks; i++) {
        var q = st.path[Math.floor(r() * st.path.length)];
        fl.push([q[0] + ((r() - 0.5) * 60), q[1] + 18 + (r() * 30), q[2], 15 + (r() * 25), ( (r() < 0.5) ? -1 : 1 ) * (0.25 + (r() * 0.2))]);
      }
      var b = birds(fl, cfg.birds, (seed * 17) + st.stage);
      if (b) { group.add(b); }
    }

    if (cfg.critters.enabled) {
      var geo = critterGeo(cfg.critters.size), cm = new THREE.MeshLambertMaterial({ color: cfg.critters.color, flatShading: true }),
          list = floorSpots(st, cfg.critters.perStage, r, 6, 40).map(function(p) {
            var m = new THREE.Mesh(geo, cm);
            m.position.set(p[0], p[1], p[2]);
            group.add(m);
            return { m: m, x: p[0], z: p[2], h: r() * 6.28, t: r() * 3 };
          });
      if (list.length) {
        self.updaters.push({ group: group, f: function(t, dt) {
          list.forEach(function(c) {
            c.t += dt;
            var cyc = c.t % 2.4, hop = ( (cyc < 0.45) ? Math.sin((cyc / 0.45) * Math.PI) : 0 );
            if (cyc < 0.45) { c.x += Math.sin(c.h) * dt * 4;  c.z += Math.cos(c.h) * dt * 4; }
            else if ( (cyc > 2.3) && (r() < 0.3) ) { c.h += (r() - 0.5) * 2; }
            c.m.position.set(c.x, st.sdf.height(c.x, c.z) + (hop * 0.8), c.z);
            c.m.rotation.y = c.h;
          });
        } });
      }
    }
  };

  // 'weather': { rain: 0..1, snow: 0..1 } at the camera.
  //
  Fx.prototype.update = function(dt, camera, scene, renderer, cfg, weather) {
    U.time.value += dt;
    U.camPos.value.copy(camera.position);
    if (scene.fog) {
      U.fogColor.value.copy(scene.fog.color);
      U.fogNear.value = scene.fog.near;
      U.fogFar.value  = scene.fog.far;
    }
    var R = this.rain.u, Sn = this.snow.u;
    R.amount.value  = ( cfg.rain.enabled ? weather.rain * cfg.rain.amount : 0 );
    R.speed.value   = cfg.rain.speed;
    R.len.value     = cfg.rain.length;
    R.wind.value    = cfg.rain.wind;
    R.opacity.value = cfg.rain.opacity;
    R.color.value.set(cfg.rain.color);
    Sn.amount.value = ( cfg.snow.enabled ? weather.snow * cfg.snow.amount : 0 );
    Sn.speed.value  = cfg.snow.speed;
    Sn.size.value   = cfg.snow.size;
    Sn.sway.value   = cfg.snow.sway;
    Sn.color.value.set(cfg.snow.color);
    U.scale.value   = renderer.getSize(new THREE.Vector2()).y * 0.6;
    this.rain.mesh.visible = (R.amount.value > 0.001);
    this.rainSplashes(dt, camera, cfg.rain, R.amount.value);

    // Lightning: this frame's extra light (taken off again by unflash
    // at the start of the next frame).
    //
    var L = this.lights, A = this.added;
    this.light.update(dt, ( cfg.rain.enabled ? weather.rain : 0 ), camera, this.ground, cfg.lightning || DEFAULTS.lightning);
    var fl = this.light.flash;
    A.hemi = fl * 2.2;  A.sun = fl * 1.2;  A.fog = Math.min(0.5, fl * 0.35);
    if (L) { L.hemi.intensity += A.hemi;  L.sun.intensity += A.sun; }
    if (scene.fog) { var c = scene.fog.color;  c.r += A.fog;  c.g += A.fog;  c.b += A.fog; }
    this.snow.mesh.visible = (Sn.amount.value > 0.001);
    var t = U.time.value;
    this.updaters = this.updaters.filter(function(u) { return !!u.group.parent; });
    this.updaters.forEach(function(u) { u.f(t, dt); });
  };

  DR.Fx = Fx;
  DR.FX_DEFAULTS = DEFAULTS;
  DR.FX_UNIFORMS = U;
})();
