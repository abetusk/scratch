// Sky: a dome that follows the camera, drawn by a shader.
//
// - Colour runs from 'horizon' to 'zenith'.
// - Main cloud layer: fractal noise mixed with 'billow' noise (folded
//   at the middle: rounded lumps with creases between them).  Each
//   noise octave is rotated against the last, so the noise's square
//   grid does not line up into streaks.
// - 'variety': cover varies across the sky, from heavy banks to clear
//   gaps (a large, slowly drifting map, contrast-stretched so the
//   slider spans the whole range).  'curl': how much the noise space
//   is warped, so heaps roll and curl.
// - Lighting: darker where more cloud lies toward the sun and in thick
//   cores, bright at thin edges; thin to haze at the horizon.
// - 'cirrus': a thin, wispy high layer, behind the heaps (seen in the
//   gaps and through thin cloud), drifting a different way and faster.
// - 'glow' (0 = off): a soft sun low in the sky ('sunHeight',
//   'sunAngle'), warming thin cloud near it.  Sky only; the scene's
//   light stays high so the canyon stays lit.
// - Preset 'deck' (volumetric overcast) is drawn by js/sky-deck.js: a
//   ray-marched cloud slab lit through by a sun above it ('coverage',
//   'relief', 'volumeRes'; billow and cirrus do not apply).
// - Preset 'puffs' is drawn by js/sky-puffs.js: fully 3D clouds from
//   layered 3D noise ('coverage', 'scale', 'glow', 'volumeRes').
// - Preset 'mammatus' is drawn by js/sky-volume.js instead: a
//   ray-marched deck with hanging pouches, covering the whole sky
//   ('relief', 'volumeRes'; cover, billow and cirrus do not apply).
//
// - Night presets ('stars'): a star field (cells in direction space,
//   random brightness and colour, slow twinkle), a faint Milky Way
//   band, and the moon as a small disc at the glow direction; with
//   'noClouds' the cloud layer is off.
//
// A preset also sets the scene's light and fog to match: overcast is
// soft, mostly ambient light with fog the horizon colour, so distant
// terrain fades into the sky.
//
//   var sky = new DR.Sky(scene, hemiLight, sunLight);
//   sky.set(settings);           // see DEFAULTS
//   sky.update(dt, camera);      // each frame
//
(function() {
  var DR = window.DR = window.DR || {};

  var PRESETS = {
    nightClear    : { zenith: 0x060a18, horizon: 0x1a2236, cloud: 0x2a3142, shade: 0x0c1018, wisp: 0x2a3142, glowCol: 0xe8eeff,
                      softness: 0.12, hemiSky: 0x3a4a78, hemiGround: 0x14161c, hemi: 0.9, sun: 0.35, sunColor: 0xa8b8e8,
                      fogNear: 90, fogFar: 520, stars: 1, noClouds: true },
    nightOvercast : { zenith: 0x080c16, horizon: 0x1c212c, cloud: 0x2e3440, shade: 0x0a0d13, wisp: 0x262c38, glowCol: 0xd8e2ff,
                      softness: 0.14, hemiSky: 0x343c56, hemiGround: 0x121418, hemi: 0.8, sun: 0.2, sunColor: 0x98a8d0,
                      fogNear: 80, fogFar: 460, stars: 1 },
    overcast : { zenith: 0x8e99a5, horizon: 0xc8ced3, cloud: 0xe6eaed, shade: 0x6f7984, wisp: 0xeef1f4, glowCol: 0xffeccc,
                 softness: 0.14, hemiSky: 0xe2e8ec, hemiGround: 0x5c6457, hemi: 2.0, sun: 0.55, sunColor: 0xf2f0ea,
                 fogNear: 110, fogFar: 560 },
    mammatus : { zenith: 0x4a5263, horizon: 0x85868b, cloud: 0xcfc4b6, shade: 0x343c4c, wisp: 0xcfc4b6, glowCol: 0xffd2a0,
                 softness: 0.1, hemiSky: 0xd2c9bf, hemiGround: 0x4f5648, hemi: 1.7, sun: 0.5, sunColor: 0xffdcb6,
                 fogNear: 100, fogFar: 520, volume: "mammatus" },
    deck     : { zenith: 0x7d8fa3, horizon: 0xb8bec4, cloud: 0xa9b2bc, shade: 0x464c56, wisp: 0xb4bcc5, glowCol: 0xfff1df,
                 softness: 0.1, hemiSky: 0xe2e8ec, hemiGround: 0x5c6457, hemi: 2.0, sun: 0.55, sunColor: 0xf2f0ea,
                 fogNear: 110, fogFar: 560, volume: "deck" },
    puffs    : { zenith: 0x7f97ad, horizon: 0xbfc8cf, cloud: 0xfff6e6, shade: 0x46505c, wisp: 0xffffff, glowCol: 0xffd9a8,
                 softness: 0.1, hemiSky: 0xeef0ec, hemiGround: 0x5c6457, hemi: 1.8, sun: 1.0, sunColor: 0xfff0d8,
                 fogNear: 130, fogFar: 600, volume: "puffs" },
    dusk     : { zenith: 0x2e3a5c, horizon: 0x6a5a6a, cloud: 0xffffff, shade: 0x8a8aa0, wisp: 0xffffff, glowCol: 0xff6a3a,
                 fillCol: 0x4a8cff, softness: 0.1, hemiSky: 0xb0a0c8, hemiGround: 0x4a4038, hemi: 1.4, sun: 0.9, sunColor: 0xffb080,
                 fogNear: 90, fogFar: 480, volume: "puffs" },
    clear    : { zenith: 0x7fb6d6, horizon: 0xcde6ea, cloud: 0xffffff, shade: 0xa9b6c2, wisp: 0xffffff, glowCol: 0xfff1d6,
                 softness: 0.08, hemiSky: 0xfff4e0, hemiGround: 0x6a7a60, hemi: 1.6, sun: 1.6, sunColor: 0xfff0d8,
                 fogNear: 150, fogFar: 650 }
  };

  var DEFAULTS = { preset: "overcast", coverage: 0.82, billow: 0.7, variety: 0.3, curl: 0.6, cirrus: 0.5, relief: 1,
                   glow: 0, sunHeight: 20, sunAngle: 15, speed: 1, scale: 1, wind: 30, volumeRes: 0.5, fogScale: 1.6 };

  var VERT = [
    "varying vec3 vDir;",
    "void main() {",
    "  vDir = position;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "uniform vec3 zenith, horizon, cloud, shade, wisp, glowCol;",
    "uniform vec3 sunDir, glowDir;",
    "uniform vec2 drift, drift2;",
    "uniform float coverage, softness, scale, variety, curl, billowAmt, cirrus, glow;",
    "uniform float stars, clouds, time;",
    "varying vec3 vDir;",
    "",
    "const mat2 R = mat2(0.8, -0.6, 0.6, 0.8);",
    "",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);",
    "}",
    "// Plain fractal noise, and 'billow' noise (folded at the middle:",
    "// rounded lumps with creases between them); octaves rotated.",
    "float fbm(vec2 p, int oct) {",
    "  float s = 0.0, a = 0.5, t = 0.0;",
    "  for (int i = 0; i < 5; i++) {",
    "    if (i >= oct) { break; }",
    "    s += a * noise(p);  t += a;",
    "    p = (R * p * 2.03) + vec2(1.7, 9.2);  a *= 0.5;",
    "  }",
    "  return s / t;",
    "}",
    "float billow(vec2 p, int oct) {",
    "  float s = 0.0, a = 0.5, t = 0.0;",
    "  for (int i = 0; i < 5; i++) {",
    "    if (i >= oct) { break; }",
    "    s += a * abs((2.0 * noise(p)) - 1.0);  t += a;",
    "    p = (R * p * 2.03) + vec2(4.1, 2.3);  a *= 0.5;",
    "  }",
    "  return s / t;",
    "}",
    "// Stars: the sky split into small cells (a grid in direction",
    "// space); about one cell in six holds a star at a random spot,",
    "// with random brightness (most faint, a few bright), colour from",
    "// warm to blue-white, and a slow twinkle.",
    "vec3 starField(vec3 d) {",
    "  vec3 p = d * 220.0, c = floor(p), f = p - c;",
    "  float r = fract(sin(dot(c, vec3(127.1, 311.7, 74.7))) * 43758.5453);",
    "  if (r > 0.17) { return vec3(0.0); }",
    "  vec3 o = fract(sin(vec3(dot(c, vec3(269.5, 183.3, 246.1)), dot(c, vec3(113.5, 271.9, 124.6)),",
    "                          dot(c, vec3(37.1, 59.3, 91.7)))) * 43758.5453);",
    "  float k  = r / 0.17,",
    "        br = pow(k, 6.0) * 2.2 + 0.08,",
    "        dd = length(f - (0.2 + (0.6 * o))),",
    "        sz = 0.1 + (0.12 * pow(k, 4.0)),",
    "        tw = 0.75 + (0.25 * sin((time * (1.5 + (3.0 * o.x))) + (o.y * 40.0)));",
    "  vec3 tint = mix(vec3(1.0, 0.82, 0.62), vec3(0.75, 0.85, 1.0), o.z);",
    "  return tint * br * tw * smoothstep(sz, 0.0, dd);",
    "}",
    "// Faint Milky Way: a band along a tilted great circle, broken up",
    "// by noise.",
    "float milky(vec3 d) {",
    "  vec3 n = normalize(vec3(0.35, 0.55, 0.75));",
    "  float b = exp(-pow(dot(d, n) / 0.16, 2.0));",
    "  return b * (0.4 + (0.6 * fbm((d.xz + d.yy) * 7.0, 4)));",
    "}",
    "",
    "float shapeAt(vec2 p, int oct) {",
    "  return mix(fbm(p, oct), (billow(p * 0.8, oct) * 1.25) - 0.1, billowAmt);",
    "}",
    "",
    "void main() {",
    "  vec3 d = normalize(vDir);",
    "  float h  = d.y,",
    "        gd = max(dot(d, glowDir), 0.0);",
    "  vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.55, h));",
    "  col += glowCol * glow * ((pow(gd, 8.0) * 0.3) + (pow(gd, 90.0) * 0.6));",
    "  if ( (stars > 0.0) && (h > 0.0) ) {",
    "    float above = smoothstep(0.0, 0.25, h);",
    "    col += (starField(d) * stars * above) + (vec3(0.55, 0.6, 0.75) * milky(d) * 0.07 * stars * above);",
    "    col += glowCol * smoothstep(0.99992, 0.99996, gd);",
    "  }",
    "  if ( (h > 0.0) && (clouds > 0.5) ) {",
    "    float fade = smoothstep(0.0, 0.2, h);",
    "",
    "    // High wisps, behind the heaps: thin streaks along the wind.",
    "    vec2 u2 = ((d.xz / (h + 0.25)) * 0.9 * scale) + drift2;",
    "    float wv = fbm(vec2(u2.x * 0.5, u2.y * 3.0), 4),",
    "          ci = smoothstep(0.48, 0.64, wv) * cirrus;",
    "    col = mix(col, wisp, ci * 0.85 * fade);",
    "",
    "    // Heaps: project onto a flat layer, so far clouds bunch toward the horizon.",
    "    vec2 uv = ((d.xz / (h + 0.1)) * 1.4 * scale) + drift;",
    "",
    "    // Cover varies over the sky: the map is stretched to 0..1 so",
    "    // 'variety' 1 swings cover by about +-0.8 (banks and clear gaps).",
    "    float m   = smoothstep(0.36, 0.64, fbm((uv * 0.12) + vec2(3.1, 7.7) - (drift * 0.4), 3)),",
    "          cov = clamp(coverage + ((m - 0.5) * 1.6 * variety), 0.0, 1.0);",
    "",
    "    // Warp the noise space so the heaps roll and curl.",
    "    vec2 q = vec2(fbm((uv * 0.35) + vec2(0.0, 2.4), 3), fbm((R * uv * 0.35) + vec2(5.2, 1.3), 3)),",
    "         p = uv + ((q - 0.5) * (0.2 + (1.8 * curl)));",
    "",
    "    float t    = 1.0 - cov,",
    "          soft = mix(softness, softness * 0.55, billowAmt),",
    "          v    = shapeAt(p, 5),",
    "          c    = smoothstep(t - soft, t + soft, v),",
    "          core = smoothstep(t, t + 0.3, v);",
    "",
    "    // Light: less where there is more cloud toward the sun; thick",
    "    // cores darker underneath, thin edges bright.",
    "    vec2 sd = normalize(sunDir.xz + vec2(1e-4)) * 0.12;",
    "    float acc = 0.0;",
    "    for (int i = 1; i <= 4; i++) {",
    "      acc += smoothstep(t - soft, t + soft, shapeAt(p + (sd * float(i)), 3));",
    "    }",
    "    float lit = exp(-acc * 0.45);",
    "    lit = clamp(lit + ((1.0 - core) * 0.4) - (core * 0.15), 0.0, 1.0);",
    "    vec3 cc = mix(shade, cloud, lit);",
    "    cc += glowCol * glow * (1.0 - core) * pow(gd, 6.0) * 0.8;",
    "    col = mix(col, cc, c * fade);",
    "  }",
    "  gl_FragColor = vec4(col, 1.0);",
    "  #include <colorspace_fragment>",
    "}"
  ].join("\n");

  function Sky(scene, hemi, sun) {
    this.scene = scene;
    this.hemi  = hemi;
    this.sun   = sun;
    this.S     = Object.assign({}, DEFAULTS);
    this.off   = new THREE.Vector2();
    this.off2  = new THREE.Vector2(13.7, 4.2);
    this.u = {
      zenith    : { value: new THREE.Color() },
      horizon   : { value: new THREE.Color() },
      cloud     : { value: new THREE.Color() },
      shade     : { value: new THREE.Color() },
      wisp      : { value: new THREE.Color() },
      glowCol   : { value: new THREE.Color() },
      sunDir    : { value: sun.position.clone().normalize() },
      glowDir   : { value: new THREE.Vector3(0, 0.3, 1).normalize() },
      drift     : { value: this.off },
      drift2    : { value: this.off2 },
      coverage  : { value: 0.5 },
      softness  : { value: 0.2 },
      scale     : { value: 1 },
      variety   : { value: 0.3 },
      curl      : { value: 0.6 },
      billowAmt : { value: 0.5 },
      cirrus    : { value: 0.5 },
      glow      : { value: 0 },
      stars     : { value: 0 },
      clouds    : { value: 1 },
      time      : { value: 0 }
    };
    var m = new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: VERT, fragmentShader: FRAG,
                                       side: THREE.BackSide, depthWrite: false, fog: false });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 128, 64), m);
    this.mesh.renderOrder   = -1;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  // 'over': optional colour overrides on the preset (zenith, horizon,
  // cloud, shade, hemiSky, hemiGround, sunColor), e.g. from a stage's
  // palette; the fog takes the horizon colour.
  //
  Sky.prototype.set = function(s, over) {
    Object.assign(this.S, s || {});
    var S = this.S, p = Object.assign({}, PRESETS[S.preset] || PRESETS.overcast, over || {}), u = this.u,
        el = (S.sunHeight * Math.PI) / 180, az = (S.sunAngle * Math.PI) / 180;
    u.zenith.value.set(p.zenith);
    u.horizon.value.set(p.horizon);
    u.cloud.value.set(p.cloud);
    u.shade.value.set(p.shade);
    u.wisp.value.set(p.wisp);
    u.glowCol.value.set(p.glowCol);
    u.softness.value  = p.softness;
    u.coverage.value  = S.coverage;
    u.scale.value     = S.scale;
    u.variety.value   = S.variety;
    u.curl.value      = S.curl;
    u.billowAmt.value = S.billow;
    u.cirrus.value    = S.cirrus;
    u.glow.value      = S.glow;
    u.stars.value     = p.stars || 0;
    u.clouds.value    = ( p.noClouds ? 0 : 1 );
    u.glowDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    this.hemi.color.set(p.hemiSky);
    this.hemi.groundColor.set(p.hemiGround);
    this.hemi.intensity = p.hemi;
    this.sun.color.set(p.sunColor);
    this.sun.intensity = p.sun;
    this.scene.fog.color.set(p.horizon);
    this.scene.fog.near = p.fogNear * (S.fogScale || 1);
    this.scene.fog.far  = p.fogFar * (S.fogScale || 1);
    this.volume = !!p.volume;
    this.mesh.visible = !this.volume;
    if (this.volume) {
      this.vols = this.vols || {};
      if (!this.vols[p.volume]) {
        this.vols[p.volume] = ( (p.volume === "deck") ? new DR.SkyDeck() : ( (p.volume === "puffs") ? new DR.SkyPuffs() : new DR.SkyVolume() ) );
      }
      this.vol = this.vols[p.volume];
      this.vol.set(p, S, this.off);
    }
    else {
      this.scene.background = new THREE.Color(p.horizon);
    }
  };

  // Before each frame's render: the volumetric sky draws itself into a
  // low-resolution image that becomes the scene background.
  //
  Sky.prototype.prerender = function(renderer, camera) {
    if (!this.volume) { return; }
    camera.updateMatrixWorld();
    this.scene.background = this.vol.render(renderer, camera);
  };

  // Drift: 'speed' 1 moves the heaps about 0.006 of their base noise
  // cell per second along 'wind'; the high layer goes 1.7 times as
  // fast, 50 degrees further round.
  //
  Sky.prototype.update = function(dt, camera) {
    var a = (this.S.wind * Math.PI) / 180, b = a + 0.87, k = 0.006 * this.S.speed * dt;
    this.off.x  += Math.sin(a) * k;
    this.off.y  += Math.cos(a) * k;
    this.off2.x += Math.sin(b) * k * 1.7;
    this.off2.y += Math.cos(b) * k * 1.7;
    this.u.time.value += dt;
    this.mesh.position.copy(camera.position);
  };

  DR.Sky = Sky;
  DR.SKY_PRESETS  = PRESETS;
  DR.SKY_DEFAULTS = DEFAULTS;

  // Settings that do nothing for a preset (the panel greys them out).
  //
  DR.skyUnused = function(preset) {
    var v = ( PRESETS[preset] ? PRESETS[preset].volume : null );
    if (v === "mammatus") { return ["coverage", "billow", "cirrus"]; }
    if (v === "deck")     { return ["billow", "cirrus"]; }
    if (v === "puffs")    { return ["billow", "cirrus", "relief", "variety", "curl"]; }
    if (PRESETS[preset] && PRESETS[preset].noClouds) {
      return ["coverage", "billow", "variety", "curl", "cirrus", "speed", "scale", "wind", "relief", "volumeRes"];
    }
    return ["relief", "volumeRes"];
  };
})();
