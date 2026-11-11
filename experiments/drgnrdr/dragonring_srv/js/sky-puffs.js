// Volumetric sky with fully 3D clouds (preset 'puffs', and 'dusk').
// A full-screen shader ray-marches a cloud layer into a low-resolution
// image that the scene uses as its background (like js/sky-deck.js).
//
// - Baked on the GPU into a 3D texture (a TILE x TILE tile of the
//   layer, repeating in x and z), re-baked when puff size, cover or
//   light directions change:
//   r  two broad octaves of value noise (periodic over the tile),
//   g  optical depth toward the sun (cloud between the voxel and sun),
//   b  optical depth straight up (for ambient light),
//   a  optical depth toward the second light (dusk).
// - Per frame: one baked read per sample, plus up to three finer
//   octaves of live noise near the camera; density = noise minus a
//   falloff toward the top and bottom of the layer, shifted by cover.
// - Light: the baked depth gives the direct sun through the cloud,
//   plus two weaker, wider, less-absorbed orders standing in for light
//   scattered more than once (a common approximation), with a
//   two-lobe phase function (forward and back scattering); thin edges
//   catch less light ('powder'); ambient light dims with the cloud
//   above.  Presets with 'fillCol' (dusk) add a second coloured light
//   from the opposite side and a film-style tone curve (ACES fit).
// - 3D value noise for the live octaves from one 2D texture of random
//   values (two neighbouring height slices per lookup).
//
//   var v = new DR.SkyPuffs();
//   v.set(preset, settings, drift);
//   v.render(renderer, camera)  -> texture for scene.background
//
(function() {
  var DR = window.DR = window.DR || {};

  var N = 256, SHIFT_X = 37, SHIFT_Y = 17;

  var VERT = [
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = uv;",
    "  gl_Position = vec4(position.xy, 0.0, 1.0);",
    "}"
  ].join("\n");

  // Cloud layer (world units, camera at 0) and the baked tile: TILE
  // square in x and z, repeating; NX x NX voxels across, NY up.
  //
  var BOT = 1.0, TOP = 1.7, TILE = 12, NX = 160, NY = 40, SIGMA = 9.0;

  var COMMON = [
    "const float BOT = " + BOT.toFixed(2) + ", TOP = " + TOP.toFixed(2) + ", MID = " + ((BOT + TOP) / 2).toFixed(3) + ";",
    "const float TILE = " + TILE.toFixed(1) + ", SIGMA = " + SIGMA.toFixed(1) + ";",
    "uniform float coverage;",
    "// Density from the noise sum f at height y: cover shifts it, and it",
    "// thins toward the top and bottom of the layer.",
    "float densOf(float f, float y) {",
    "  float fall = abs(y - MID) / (0.5 * (TOP - BOT));",
    "  return clamp(((1.6 * f) + ((coverage - 0.5) * 1.0) - (fall * fall * 0.8) + 0.05) * 2.5, 0.0, 1.0);",
    "}"
  ].join("\n");

  // Bake pass 1, one slice per draw: two octaves of value noise,
  // periodic over the tile (whole numbers of cells per tile).
  //
  var BAKE_SHAPE = [
    "uniform float slice, cells;",
    "varying vec2 vUv;",
    "float h3(vec3 c, float per) {",
    "  c.xz = mod(c.xz, per);",
    "  return fract(sin(dot(c, vec3(127.1, 311.7, 74.7))) * 43758.5453);",
    "}",
    "float pnoise(vec3 x, float per) {",
    "  vec3 p = floor(x), f = fract(x);",
    "  f = f * f * (3.0 - (2.0 * f));",
    "  float a = mix(mix(h3(p, per), h3(p + vec3(1, 0, 0), per), f.x), mix(h3(p + vec3(0, 1, 0), per), h3(p + vec3(1, 1, 0), per), f.x), f.y),",
    "        b = mix(mix(h3(p + vec3(0, 0, 1), per), h3(p + vec3(1, 0, 1), per), f.x), mix(h3(p + vec3(0, 1, 1), per), h3(p + vec3(1, 1, 1), per), f.x), f.y);",
    "  return (2.0 * mix(a, b, f.z)) - 1.0;",
    "}",
    "void main() {",
    "  float y = " + BOT.toFixed(2) + " + (slice * " + (TOP - BOT).toFixed(2) + ");",
    "  vec3 q = vec3(vUv.x * cells, y * (cells / " + TILE.toFixed(1) + "), vUv.y * cells);",
    "  float f = (0.5 * pnoise(q, cells)) + (0.25 * pnoise((q * 2.0) + vec3(0.0, 1.7, 0.0), cells * 2.0));",
    "  gl_FragColor = vec4(f, 0.0, 0.0, 1.0);",
    "}"
  ].join("\n");

  // Bake pass 2: how much cloud lies between each voxel and the sun,
  // straight up, and toward the second light (optical depth: density
  // summed along the path).
  //
  var BAKE_LIGHT = [
    "precision highp sampler3D;",
    COMMON,
    "uniform sampler3D shape;",
    "uniform float slice;",
    "uniform vec3 sunDir, fillDir;",
    "varying vec2 vUv;",
    "float densAt(vec3 x) {",
    "  if ( (x.y < BOT) || (x.y > TOP) ) { return 0.0; }",
    "  return densOf(texture(shape, vec3(x.x / TILE, x.z / TILE, (x.y - BOT) / (TOP - BOT))).r, x.y);",
    "}",
    "float depth(vec3 x, vec3 dir, float len) {",
    "  float od = 0.0, ds = len / 24.0;",
    "  for (int i = 0; i < 24; i++) { od += densAt(x + (dir * (ds * (float(i) + 0.5)))) * ds; }",
    "  return od;",
    "}",
    "void main() {",
    "  vec3 x = vec3(vUv.x * TILE, BOT + (slice * (TOP - BOT)), vUv.y * TILE);",
    "  float f = texture(shape, vec3(vUv, slice)).r;",
    "  gl_FragColor = vec4(f, depth(x, sunDir, 1.6), depth(x, vec3(0.0, 1.0, 0.0), TOP - x.y), depth(x, fillDir, 1.6));",
    "}"
  ].join("\n");

  var FRAG = [
    "precision highp sampler3D;",
    COMMON,
    "uniform sampler2D rnd;",
    "uniform sampler3D baked;",
    "uniform mat4 invProj, camRot;",
    "uniform vec3 sunDir, sunCol, lit, shade, zenith, haze, fillDir, fillCol;",
    "uniform vec2 drift;",
    "uniform float detailFreq, exposure, twoTone;",
    "varying vec2 vUv;",
    "",
    "float vnoise(vec3 x) {",
    "  vec3 p = floor(x), f = fract(x);",
    "  f = f * f * (3.0 - (2.0 * f));",
    "  vec2 uv = p.xy + (vec2(" + SHIFT_X + ".0, " + SHIFT_Y + ".0) * p.z) + f.xy,",
    "       rg = textureLod(rnd, (uv + 0.5) / " + N + ".0, 0.0).rg;",
    "  return (2.0 * mix(rg.r, rg.g, f.z)) - 1.0;",
    "}",
    "float hg(float c, float g) { return (1.0 - (g * g)) / (12.566 * pow(1.0 + (g * g) - (2.0 * g * c), 1.5)); }",
    "",
    "// Light reaching a point through optical depth od: the direct beam",
    "// plus two weaker, wider, less-absorbed orders standing in for light",
    "// scattered more than once (so thick cloud is not black inside).",
    "float multi(float od, float c, float g) {",
    "  float s = 0.0, a = 1.0, b = 1.0, e = 1.0;",
    "  for (int i = 0; i < 3; i++) {",
    "    s += b * exp(-SIGMA * a * od) * mix(hg(c, g * e), hg(c, -0.3 * e), 0.5);",
    "    a *= 0.35;  b *= 0.55;  e *= 0.5;",
    "  }",
    "  return s;",
    "}",
    "",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "",
    "void main() {",
    "  vec4 v = invProj * vec4((vUv * 2.0) - 1.0, 1.0, 1.0);",
    "  vec3 d = normalize((camRot * vec4(v.xyz / v.w, 0.0)).xyz);",
    "  float sd  = max(dot(d, sunDir), 0.0),",
    "        cs  = dot(d, sunDir), cf = dot(d, fillDir);",
    "  vec3  bg  = mix(haze, zenith, smoothstep(0.0, 0.5, d.y)) + (sunCol * 0.2 * pow(sd, 8.0));",
    "  vec3  col = bg;",
    "  if (d.y > 0.004) {",
    "    float t0 = BOT / d.y, t1 = min(TOP / d.y, t0 + 14.0),",
    "          t  = t0 + (0.02 * hash(gl_FragCoord.xy)), T = 1.0;",
    "    vec3  acc = vec3(0.0);",
    "    for (int i = 0; i < 140; i++) {",
    "      if ( (t > t1) || (T < 0.01) ) { break; }",
    "      vec3  x  = d * t;",
    "      float r  = t - t0,",
    "            dt = 0.02 + (r * 0.02);",
    "      vec3  w  = vec3((x.x + drift.x) / TILE, (x.z + drift.y) / TILE, (x.y - BOT) / (TOP - BOT));",
    "      vec4  B  = texture(baked, w);",
    "      float f  = B.r;",
    "",
    "      // Finer octaves live: three near the camera, fewer further out",
    "      // (each fading out over its last stretch).",
    "      //",
    "      vec3 q = (x + vec3(drift.x, 0.0, drift.y)) * detailFreq;",
    "      f += 0.17 * vnoise(q) * smoothstep(9.0, 6.0, r);",
    "      if (r < 4.0) { f += 0.09 * vnoise((q * 2.03) + 5.1) * smoothstep(4.0, 2.5, r); }",
    "      if (r < 1.6) { f += 0.045 * vnoise((q * 4.1) + 9.7) * smoothstep(1.6, 0.9, r); }",
    "      float de = densOf(f, x.y);",
    "      if (de > 0.01) {",
    "        // Thin, low-density edges catch less light (the 'powder'",
    "        // look: dark rims, bright insides seen from the sun side).",
    "        //",
    "        float pw  = 1.0 - (0.55 * exp(-de * 5.0)),",
    "              amb = exp(-SIGMA * 0.35 * B.b) * mix(0.55, 1.0, (x.y - BOT) / (TOP - BOT));",
    "        vec3  L   = (sunCol * multi(B.g, cs, 0.65) * pw * 13.0) + (mix(lit, zenith, 0.3) * amb * 0.95);",
    "        if (twoTone > 0.5) {",
    "          L = (sunCol * multi(B.g, cs, 0.5) * pw * 12.0) + (fillCol * multi(B.a, cf, 0.3) * pw * 10.0) + (zenith * amb * 0.3);",
    "        }",
    "        vec3  c   = mix(L * mix(lit, shade, de * 0.25), haze, 1.0 - exp(-0.003 * t * t));",
    "        float a   = 1.0 - exp(-SIGMA * de * dt);",
    "        acc += T * a * c;",
    "        T   *= 1.0 - a;",
    "      }",
    "      t += dt;",
    "    }",
    "    col = (bg * T) + acc;",
    "    col = mix(haze, col, smoothstep(0.004, 0.05, d.y));",
    "  }",
    "  col += sunCol * 0.15 * pow(sd, 3.0);",
    "  if (twoTone > 0.5) {",
    "    // Film-style tone curve (ACES fit): soft highlight roll-off.",
    "    vec3 x = col * exposure * 0.8;",
    "    col = clamp((x * ((2.51 * x) + 0.03)) / ((x * ((2.43 * x) + 0.59)) + 0.14), 0.0, 1.0);",
    "    vec2 q = vUv;",
    "    col *= pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.08);",
    "  }",
    "  else {",
    "    col = 1.0 - exp(-col * exposure);",
    "  }",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  // Random values for the 3D noise: red random; green at (x, y) holds
  // red at (x + SHIFT_X, y + SHIFT_Y), which is where slice z + 1 of
  // the same point lands, so one lookup gives slices z and z + 1.
  //
  function randomTexture(seed) {
    var a = seed >>> 0, R = new Uint8Array(N * N), D = new Uint8Array(N * N * 4);
    function next() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) & 255;
    }
    for (var i = 0; i < (N * N); i++) { R[i] = next(); }
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var k = x + (N * y), sx = (x + SHIFT_X) % N, sy = (y + SHIFT_Y) % N;
        D[4 * k]       = R[k];
        D[(4 * k) + 1] = R[sx + (N * sy)];
        D[(4 * k) + 3] = 255;
      }
    }
    var tex = new THREE.DataTexture(D, N, N, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  function quad(frag, uniforms) {
    var scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
                             new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: VERT, fragmentShader: frag,
                                                        depthTest: false, depthWrite: false })));
    return scene;
  }

  function volume() {
    var rt = new THREE.WebGL3DRenderTarget(NX, NX, NY, { type: THREE.HalfFloatType, depthBuffer: false });
    var t = rt.texture;
    t.format    = THREE.RGBAFormat;
    t.wrapS     = t.wrapT = THREE.RepeatWrapping;
    t.wrapR     = THREE.ClampToEdgeWrapping;
    t.minFilter = t.magFilter = THREE.LinearFilter;
    return rt;
  }

  function SkyPuffs() {
    this.res = 0.5;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.rt  = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, depthBuffer: false });
    this.rt.texture.minFilter = THREE.LinearFilter;
    this.shapeRT = volume();
    this.lightRT = volume();
    this.bakeKey = "";
    this.us = { slice: { value: 0 }, cells: { value: 16 } };
    this.ul = { slice: { value: 0 }, coverage: { value: 0.6 }, shape: { value: this.shapeRT.texture },
                sunDir: { value: new THREE.Vector3() }, fillDir: { value: new THREE.Vector3() } };
    this.shapeScene = quad(BAKE_SHAPE, this.us);
    this.lightScene = quad(BAKE_LIGHT, this.ul);
    this.u = {
      rnd        : { value: randomTexture(7) },
      baked      : { value: this.lightRT.texture },
      invProj    : { value: new THREE.Matrix4() },
      camRot     : { value: new THREE.Matrix4() },
      sunDir     : { value: new THREE.Vector3(0, 1, 0) },
      sunCol     : { value: new THREE.Color() },
      lit        : { value: new THREE.Color() },
      shade      : { value: new THREE.Color() },
      zenith     : { value: new THREE.Color() },
      haze       : { value: new THREE.Color() },
      drift      : { value: new THREE.Vector2() },
      detailFreq : { value: 10 },
      coverage   : { value: 0.6 },
      exposure   : { value: 1.5 },
      twoTone    : { value: 0 },
      fillDir    : { value: new THREE.Vector3(0, 0.3, -1).normalize() },
      fillCol    : { value: new THREE.Color() }
    };
    this.scene = quad(FRAG, this.u);
    this.drift = new THREE.Vector2();
  }

  // Puff size: whole noise cells per tile, so the baked tile repeats
  // without seams; 'scale' 1 is 16 cells (about 1.3 per unit).
  //
  function cellsFor(scale) { return Math.max(4, Math.round(16 * scale)); }

  SkyPuffs.prototype.set = function(p, S, drift) {
    var u = this.u, az = (S.sunAngle * Math.PI) / 180, el = (Math.max(S.sunHeight, 3) * Math.PI) / 180;
    u.sunDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    u.sunCol.value.set(p.glowCol).multiplyScalar(0.8 + (S.glow * 1.2));
    u.lit.value.set(p.cloud);
    u.shade.value.set(p.shade);
    u.zenith.value.set(p.zenith);
    u.haze.value.set(p.horizon);
    u.coverage.value = S.coverage;
    u.twoTone.value  = ( p.fillCol ? 1 : 0 );
    u.fillCol.value.set(p.fillCol || 0);
    u.fillDir.value.set(-Math.sin(az), 0.35, -Math.cos(az)).normalize();
    var cells = cellsFor(S.scale);
    u.detailFreq.value = (cells / TILE) * 4;
    this.us.cells.value = cells;
    this.ul.coverage.value = S.coverage;
    this.ul.sunDir.value.copy(u.sunDir.value);
    this.ul.fillDir.value.copy(u.fillDir.value);
    this.driftSrc = drift;
    this.res = S.volumeRes || 0.5;
  };

  // Re-bake when puff size, cover or light directions change: shape
  // (only if the size changed), then the light depths.  40 + 40 small
  // draws, a few milliseconds on a desktop GPU.
  //
  SkyPuffs.prototype.bake = function(renderer) {
    var key = [this.us.cells.value, this.ul.coverage.value, this.ul.sunDir.value.toArray().join(), this.ul.fillDir.value.toArray().join()].join("|"),
        shapeKey = String(this.us.cells.value);
    if (key === this.bakeKey) { return; }
    if (shapeKey !== this.shapeKey) {
      for (var k = 0; k < NY; k++) {
        this.us.slice.value = (k + 0.5) / NY;
        renderer.setRenderTarget(this.shapeRT, k);
        renderer.render(this.shapeScene, this.cam);
      }
      this.shapeKey = shapeKey;
    }
    for (var j = 0; j < NY; j++) {
      this.ul.slice.value = (j + 0.5) / NY;
      renderer.setRenderTarget(this.lightRT, j);
      renderer.render(this.lightScene, this.cam);
    }
    this.bakeKey = key;
  };

  SkyPuffs.prototype.render = function(renderer, camera) {
    var prev = renderer.getRenderTarget();
    this.bake(renderer);
    var sz = renderer.getDrawingBufferSize(new THREE.Vector2()),
        w  = Math.max(16, Math.round(sz.x * this.res)), h = Math.max(16, Math.round(sz.y * this.res));
    if ( (this.rt.width !== w) || (this.rt.height !== h) ) { this.rt.setSize(w, h); }
    this.u.invProj.value.copy(camera.projectionMatrixInverse);
    this.u.camRot.value.extractRotation(camera.matrixWorld);

    // Drift: the sky's offset is in noise units (about 1.3 per world
    // unit at 'scale' 1); move the world tile by the same amount.
    //
    if (this.driftSrc) { this.u.drift.value.copy(this.driftSrc).multiplyScalar(TILE / this.us.cells.value); }
    renderer.setRenderTarget(this.rt);
    renderer.render(this.scene, this.cam);
    renderer.setRenderTarget(prev);
    return this.rt.texture;
  };

  DR.SkyPuffs = SkyPuffs;
})();
