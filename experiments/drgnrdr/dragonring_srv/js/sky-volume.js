// Volumetric mammatus sky.  A full-screen shader ray-marches through a
// cloud deck whose underside hangs down in soft pouches, into a
// low-resolution image that the scene then uses as its background.
//
// Deck: bottom at height BASE (camera at 0), solid above.  The
// underside hangs down in sacks: rounded tips, steep sides, each
// 1.5..2.7 times as deep as its radius at 'relief' 1 (radius about
// 0.06..0.1 of the deck height at 'scale' 1), merging only
// near their roots ('scale' sets their size, 'curl' warps them,
// 'variety' gives patches of deeper and shallower sacks).
//
// Light, per sample along the ray:
// - sun light reaching it through the cloud (three steps toward a sun
//   just below the deck, from the 'sunAngle' side), scattered mostly
//   forward: sack bottoms facing the sun light up, neighbours shadow
//   each other, and the deck brightens toward the sun;
// - warm light from the ground lighting pouch bottoms, fading deeper
//   into the cloud;
// - the colour builds up front to back until the cloud is opaque.
// Distant cloud fades into the horizon haze.
//
//   var v = new DR.SkyVolume();
//   v.set(preset, settings, glowDir, drift);
//   v.render(renderer, camera)  -> texture for scene.background
//
(function() {
  var DR = window.DR = window.DR || {};

  var VERT = [
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = uv;",
    "  gl_Position = vec4(position.xy, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "uniform mat4 invProj, camRot;",
    "uniform vec3 Ld, sunCol, ambLow, ambDeep, skyCol, haze;",
    "uniform vec2 drift;",
    "uniform float scale, relief, variety, curl;",
    "varying vec2 vUv;",
    "",
    "const float BASE = 1.0, TOP = 1.45, SZ = 6.5;",
    "const mat2 R = mat2(0.8, -0.6, 0.6, 0.8);",
    "",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "vec2 hash2(vec2 p) {",
    "  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);",
    "}",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);",
    "}",
    "float fbm(vec2 p) {",
    "  float s = 0.0, a = 0.5;",
    "  for (int i = 0; i < 3; i++) { s += a * noise(p);  p = (R * p * 2.03) + vec2(1.7, 9.2);  a *= 0.5; }",
    "  return s / 0.875;",
    "}",
    "// Hanging sacks on a jittered grid: each a rounded tip with steep",
    "// sides, radius 0.38..0.65, hanging 1.5..2.7 times its radius;",
    "// neighbours merge only near their roots (smooth maximum).",
    "float sacks(vec2 q) {",
    "  vec2 i = floor(q), f = fract(q);",
    "  float s = 1.0;",
    "  for (int y = -1; y <= 1; y++) {",
    "    for (int x = -1; x <= 1; x++) {",
    "      vec2 g = vec2(float(x), float(y)), e = f - (g + 0.2 + (0.6 * hash2(i + g)));",
    "      float r = 0.38 + (0.27 * hash(i + g + vec2(9.1, 3.7))),",
    "            k = 1.0 - (dot(e, e) / (r * r));",
    "      if (k > 0.0) { s += exp(12.0 * r * (1.5 + (1.2 * hash(i + g + vec2(4.2, 8.1)))) * sqrt(k)); }",
    "    }",
    "  }",
    "  return log(s) / 12.0;",
    "}",
    "// Height of the deck's underside at (x, z); also the deepest it",
    "// can reach (for the march).",
    "float maxDepth() { return (relief * 1.8 * (1.0 + (0.8 * variety))) / (SZ * scale); }",
    "float under(vec2 xz) {",
    "  vec2 q = (xz * SZ * scale) + (drift * 3.0);",
    "  q += (vec2(fbm(q * 0.12), fbm((q * 0.12) + vec2(5.2, 1.3))) - 0.5) * (0.3 + (2.2 * curl));",
    "  float big = smoothstep(0.3, 0.7, fbm((xz * 0.35) + vec2(3.0, 7.0))),",
    "        amp = (relief * max(0.1, 1.0 + ((big - 0.5) * 1.6 * variety))) / (SZ * scale);",
    "  return BASE - (amp * sacks(q));",
    "}",
    "float dens(vec3 x, float b) {",
    "  float d = smoothstep(b - 0.004, b + 0.035, x.y) * smoothstep(TOP, TOP - 0.25, x.y);",
    "  return d * (0.95 + (0.1 * noise((x.xz * 24.0) + vec2(x.y * 31.0, -x.y * 23.0))));",
    "}",
    "",
    "void main() {",
    "  vec4 v = invProj * vec4((vUv * 2.0) - 1.0, 1.0, 1.0);",
    "  vec3 d = normalize((camRot * vec4(v.xyz / v.w, 0.0)).xyz);",
    "  vec3 col = haze;",
    "  if (d.y > 0.004) {",
    "    float lo = BASE - maxDepth(),",
    "          t0 = lo / d.y,",
    "          t1 = min((BASE + 0.3) / d.y, t0 + 2.0),",
    "          n  = 48.0,",
    "          dt = (t1 - t0) / n,",
    "          t  = t0 + (dt * hash(gl_FragCoord.xy)),",
    "          T  = 1.0,",
    "          c  = dot(d, Ld),",
    "          g  = 0.45,",
    "          ph = (1.0 - (g * g)) / pow(1.0 + (g * g) - (2.0 * g * c), 1.5);",
    "    vec3 acc = vec3(0.0);",
    "    for (int i = 0; i < 48; i++) {",
    "      vec3  x = d * t;",
    "      float b = under(x.xz), den = dens(x, b);",
    "      if (den > 0.002) {",
    "        // Sun light: three steps toward the sun, so neighbouring sacks",
    "        // shadow each other.",
    "        vec3  a1 = x + (Ld * 0.03), a2 = x + (Ld * 0.08), a3 = x + (Ld * 0.17);",
    "        float l1 = dens(a1, under(a1.xz)), l2 = dens(a2, under(a2.xz)), l3 = dens(a3, under(a3.xz)),",
    "              beer = exp(-((l1 * 0.03) + (l2 * 0.05) + (l3 * 0.09)) * 30.0),",
    "              deep = clamp((x.y - b) / 0.08, 0.0, 1.0),",
    "              occ  = clamp((x.y - lo) / ((BASE - lo) + 0.05), 0.0, 1.0);",
    "        // Ground light reaches pouch bottoms; hollows higher up and",
    "        // the inside of the cloud get less.",
    "        vec3  S = (sunCol * beer * ph) + mix(ambLow, ambDeep, max(deep, occ * 0.85));",
    "        float a = den * dt * 22.0;",
    "        acc += T * (1.0 - exp(-a)) * S;",
    "        T   *= exp(-a);",
    "        if (T < 0.02) { break; }",
    "      }",
    "      t += dt;",
    "    }",
    "    // Whatever the march did not resolve (long, low rays) is more of",
    "    // the deck: its average colour, not open sky.",
    "    vec3 deck = mix(ambLow, ambDeep, 0.55) + (sunCol * 0.15 * ph);",
    "    col = acc + (T * deck);",
    "    // Far away the sacks are too small to resolve: blend to the",
    "    // deck's average tone, then haze with distance.",
    "    col = mix(col, deck, smoothstep(2.5, 9.0, t0));",
    "    col = mix(col, haze, 1.0 - exp(-t0 * 0.06));",
    "    col = mix(haze, col, smoothstep(0.004, 0.03, d.y));",
    "  }",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function SkyVolume() {
    this.res = 0.5;
    this.rt  = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, depthBuffer: false });
    this.rt.texture.minFilter = THREE.LinearFilter;
    this.rt.texture.magFilter = THREE.LinearFilter;
    this.u = {
      invProj : { value: new THREE.Matrix4() },
      camRot  : { value: new THREE.Matrix4() },
      Ld      : { value: new THREE.Vector3(0, 0, 1) },
      sunCol  : { value: new THREE.Color() },
      ambLow  : { value: new THREE.Color() },
      ambDeep : { value: new THREE.Color() },
      skyCol  : { value: new THREE.Color() },
      haze    : { value: new THREE.Color() },
      drift   : { value: new THREE.Vector2() },
      scale   : { value: 1 },
      relief  : { value: 1 },
      variety : { value: 0.3 },
      curl    : { value: 0.5 }
    };
    this.scene  = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
                                  new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: VERT, fragmentShader: FRAG,
                                                             depthTest: false, depthWrite: false })));
  }

  // 'p' the preset's colours, 'S' the sky settings; the light comes
  // from the 'sunAngle' side, skimming just under the deck.
  //
  SkyVolume.prototype.set = function(p, S, drift) {
    var u = this.u, az = (S.sunAngle * Math.PI) / 180, el = ( (S.sunHeight * Math.PI) / 180 ) * 0.25;
    u.Ld.value.set(Math.sin(az), (Math.sin(el) * 0.5) - 0.08, Math.cos(az)).normalize();
    u.sunCol.value.set(p.glowCol).multiplyScalar(0.9 + (S.glow * 1.2));
    u.ambLow.value.set(p.cloud);
    u.ambDeep.value.set(p.shade);
    u.skyCol.value.set(p.zenith);
    u.haze.value.set(p.horizon);
    u.drift.value     = drift;
    u.scale.value     = S.scale;
    u.relief.value    = S.relief;
    u.variety.value   = S.variety;
    u.curl.value      = S.curl;
    this.res          = S.volumeRes || 0.5;
  };

  SkyVolume.prototype.render = function(renderer, camera) {
    var sz = renderer.getDrawingBufferSize(new THREE.Vector2()),
        w  = Math.max(16, Math.round(sz.x * this.res)), h = Math.max(16, Math.round(sz.y * this.res));
    if ( (this.rt.width !== w) || (this.rt.height !== h) ) { this.rt.setSize(w, h); }
    this.u.invProj.value.copy(camera.projectionMatrixInverse);
    this.u.camRot.value.extractRotation(camera.matrixWorld);
    var prev = renderer.getRenderTarget();
    renderer.setRenderTarget(this.rt);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(prev);
    return this.rt.texture;
  };

  DR.SkyVolume = SkyVolume;
})();
