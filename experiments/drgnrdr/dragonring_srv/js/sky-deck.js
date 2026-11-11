// Volumetric overcast sky.  A full-screen shader ray-marches through a
// cloud slab into a low-resolution image that the scene uses as its
// background (like js/sky-volume.js).
//
// - Noise: a tileable texture of layered "alligator" noise, made once
//   on the GPU.  Alligator noise (as documented for Houdini): soft
//   bumps of random height on jittered points; the value is the
//   tallest bump minus the second tallest, which gives lumpy,
//   cauliflower-like cells.  Three channels at different cell sizes.
// - Slab: from the noise, a height h(x, z) in 0..1 sets both the
//   slab's top (thicker where h is high) and its bottom (sagging a
//   little, 'relief').  'coverage' shifts h, so low cover opens gaps;
//   'variety' weights the largest noise (banks of thick and thin
//   cloud); 'curl' warps the lookups.  Density rises smoothly with
//   depth inside the slab, so edges stay soft.
// - Light: each sample looks toward a sun above the deck ('sunHeight',
//   'sunAngle') through five steps of cloud, so thin parts glow and
//   thick masses go dark; a phase function brightens the deck toward
//   the sun; sky light from above and ground light from below fill
//   the rest.  An exposure curve maps the result to the screen.
//
//   var v = new DR.SkyDeck();
//   v.set(preset, settings, drift);
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

  var HASH = [
    "float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "vec2 h22(vec2 p) {",
    "  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);",
    "}"
  ].join("\n");

  // Tileable layered alligator noise, three cell sizes in r, g, b.
  //
  var NOISE_FRAG = [
    HASH,
    "varying vec2 vUv;",
    "float gator(vec2 p, float per) {",
    "  vec2 i = floor(p);",
    "  float a = 0.0, b = 0.0;",
    "  for (int y = -1; y <= 1; y++) {",
    "    for (int x = -1; x <= 1; x++) {",
    "      vec2 c  = i + vec2(float(x), float(y)),",
    "           cw = mod(c, per);",
    "      float r = length(p - (c + h22(cw)));",
    "      if (r < 1.0) {",
    "        float s = 1.0 - r,",
    "              v = h21(cw + 17.0) * s * s * (3.0 - (2.0 * s));",
    "        if (v > a)      { b = a;  a = v; }",
    "        else if (v > b) { b = v; }",
    "      }",
    "    }",
    "  }",
    "  return a - b;",
    "}",
    "float layered(vec2 uv, float cells) {",
    "  float s = 0.0, w = 0.5, t = 0.0, f = cells;",
    "  for (int k = 0; k < 6; k++) { s += w * gator(uv * f, f);  t += w;  f *= 2.0;  w *= 0.5; }",
    "  return s / t;",
    "}",
    "void main() {",
    "  gl_FragColor = vec4(layered(vUv, 4.0), layered(vUv, 8.0), layered(vUv, 3.0), 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "uniform sampler2D noiseTex;",
    "uniform mat4 invProj, camRot;",
    "uniform vec3 sunDir, sunCol, skyAmb, groundAmb, zenith, haze;",
    "uniform vec2 drift;",
    "uniform float scale, coverage, relief, variety, curl, exposure, pixPerRad;",
    "varying vec2 vUv;",
    HASH,
    "",
    "const float B = 1.0;",
    "",
    "// Texture detail level, set per sample from the distance along the",
    "// ray: automatic selection is unreliable inside a loop that exits",
    "// at different points for neighbouring pixels (blocky edges).",
    "float lod = 0.0;",
    "vec4 tex(vec2 uv) { return textureLod(noiseTex, uv, lod); }",
    "",
    "// Cloud height 0..1 at (x, z).",
    "float hgt(vec2 xz) {",
    "  vec2 uv = xz * 0.3 * scale;",
    "  uv += (tex((uv * 0.07) + (drift * 0.1)).rg - 0.2) * curl * 0.5;",
    "  float n1 = tex(uv + drift).r,",
    "        n2 = tex((uv * 0.37) + (drift * 0.6)).g,",
    "        n3 = tex((uv * 0.11) + (drift * 0.3)).b;",
    "  float h = (n1 * 0.5) + (n2 * 0.8) + (n3 * (0.4 + (1.6 * variety)));",
    "  return clamp((h * 1.6) - ((1.0 - coverage) * 1.4) - 0.05, 0.0, 1.0);",
    "}",
    "",
    "// Density at p, and the vertical distance to the slab (negative",
    "// inside); the slab is bottom..top with both from h.",
    "float dens(vec3 p, out float dist) {",
    "  float h   = hgt(p.xz),",
    "        bot = B - (0.22 * relief * h),",
    "        top = B + 0.04 + (0.55 * h);",
    "  dist = max(bot - p.y, p.y - top);",
    "  if (h < 0.002) { dist = max(dist, 0.03); }",
    "  // Thin cloud fades out sideways too, so edges are soft, not walls.",
    "  return ( (dist < 0.0) ? (1.0 - exp(-(-dist) * 40.0)) * smoothstep(0.0, 0.18, h) : 0.0 );",
    "}",
    "",
    "float hg(float c, float g) { return (1.0 - (g * g)) / pow(1.0 + (g * g) - (2.0 * g * c), 1.5); }",
    "",
    "void main() {",
    "  vec4 v = invProj * vec4((vUv * 2.0) - 1.0, 1.0, 1.0);",
    "  vec3 d = normalize((camRot * vec4(v.xyz / v.w, 0.0)).xyz);",
    "  float c  = dot(d, sunDir),",
    "        ph = (0.75 * hg(c, 0.55)) + (0.25 * hg(c, -0.15));",
    "  vec3 sky = mix(haze, zenith, smoothstep(0.0, 0.5, d.y)) + (sunCol * pow(max(c, 0.0), 300.0) * 2.0);",
    "  vec3 col = haze;",
    "  if (d.y > 0.003) {",
    "    float t0 = (B - (0.22 * relief)) / d.y,",
    "          t1 = min((B + 0.62) / d.y, t0 + 6.0),",
    "          t  = t0 + ((0.012 / max(d.y, 0.12)) * h21(gl_FragCoord.xy)),",
    "          T  = 1.0, dist;",
    "    vec3 acc = vec3(0.0);",
    "    for (int i = 0; i < 110; i++) {",
    "      if (t > t1) { break; }",
    "      vec3  x  = d * t;",
    "      lod = clamp(log2((t * 0.3 * scale * 512.0) / pixPerRad), 0.0, 8.0);",
    "      float de = dens(x, dist), dt;",
    "      if (de > 0.001) {",
    "        // Light from the sun through the cloud above.",
    "        float od = 0.0, ds, sl = 0.0;",
    "        for (int j = 1; j <= 5; j++) {",
    "          float l = 0.025 * float(j * j);",
    "          od += dens(x + (sunDir * l), ds) * (l - sl);",
    "          sl = l;",
    "        }",
    "        float Ts = exp(-od * 4.5),",
    "              pw = 1.0 - exp(-od * 9.0),",
    "              hf = clamp((x.y - (B - (0.22 * relief))) / 0.75, 0.0, 1.0);",
    "        vec3  L  = (sunCol * Ts * ph * mix(0.6, 1.0, pw)) + mix(groundAmb, skyAmb, hf);",
    "        dt = clamp(0.012 / max(d.y, 0.12), 0.008, 0.1);",
    "        float a = de * dt * 30.0;",
    "        acc += T * (1.0 - exp(-a)) * L;",
    "        T   *= exp(-a);",
    "        if (T < 0.01) { break; }",
    "      }",
    "      else {",
    "        dt = clamp((max(dist, 0.004) * 0.6) / max(d.y, 0.05), 0.006, 0.05);",
    "      }",
    "      t += dt;",
    "    }",
    "    col = acc + (T * sky);",
    "    col = 1.0 - exp(-col * exposure);",
    "    col = mix(col, 1.0 - exp(-haze * exposure), 1.0 - exp(-t0 * 0.07));",
    "    col = mix(1.0 - exp(-haze * exposure), col, smoothstep(0.003, 0.04, d.y));",
    "  }",
    "  else {",
    "    col = 1.0 - exp(-haze * exposure);",
    "  }",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function pass(frag, uniforms) {
    var scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
                             new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: VERT, fragmentShader: frag,
                                                        depthTest: false, depthWrite: false })));
    return scene;
  }

  function SkyDeck() {
    this.res = 0.5;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.rt  = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, depthBuffer: false });
    this.rt.texture.minFilter = THREE.LinearFilter;
    this.noise = new THREE.WebGLRenderTarget(512, 512, { depthBuffer: false, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping,
                                                         minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true });
    this.noiseScene = pass(NOISE_FRAG, {});
    this.noiseReady = false;
    this.u = {
      noiseTex  : { value: this.noise.texture },
      invProj   : { value: new THREE.Matrix4() },
      camRot    : { value: new THREE.Matrix4() },
      sunDir    : { value: new THREE.Vector3(0, 1, 0) },
      sunCol    : { value: new THREE.Color() },
      skyAmb    : { value: new THREE.Color() },
      groundAmb : { value: new THREE.Color() },
      zenith    : { value: new THREE.Color() },
      haze      : { value: new THREE.Color() },
      drift     : { value: new THREE.Vector2() },
      scale     : { value: 1 },
      coverage  : { value: 0.8 },
      relief    : { value: 1 },
      variety   : { value: 0.3 },
      curl      : { value: 0.5 },
      exposure  : { value: 1.4 },
      pixPerRad : { value: 500 }
    };
    this.scene = pass(FRAG, this.u);
  }

  SkyDeck.prototype.set = function(p, S, drift) {
    var u = this.u, az = (S.sunAngle * Math.PI) / 180, el = (Math.max(S.sunHeight, 5) * Math.PI) / 180;
    u.sunDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    u.sunCol.value.set(p.glowCol).multiplyScalar(1.1 + (S.glow * 1.5));
    u.skyAmb.value.set(p.cloud);
    u.groundAmb.value.set(p.shade);
    u.zenith.value.set(p.zenith);
    u.haze.value.set(p.horizon);
    u.drift.value    = drift;
    u.scale.value    = S.scale;
    u.coverage.value = S.coverage;
    u.relief.value   = S.relief;
    u.variety.value  = S.variety;
    u.curl.value     = S.curl;
    this.res         = S.volumeRes || 0.5;
  };

  SkyDeck.prototype.render = function(renderer, camera) {
    var prev = renderer.getRenderTarget();
    if (!this.noiseReady) {
      renderer.setRenderTarget(this.noise);
      renderer.render(this.noiseScene, this.cam);
      this.noiseReady = true;
    }
    var sz = renderer.getDrawingBufferSize(new THREE.Vector2()),
        w  = Math.max(16, Math.round(sz.x * this.res)), h = Math.max(16, Math.round(sz.y * this.res));
    if ( (this.rt.width !== w) || (this.rt.height !== h) ) { this.rt.setSize(w, h); }
    this.u.invProj.value.copy(camera.projectionMatrixInverse);
    this.u.pixPerRad.value = h / ((camera.fov * Math.PI) / 180);
    this.u.camRot.value.extractRotation(camera.matrixWorld);
    renderer.setRenderTarget(this.rt);
    renderer.render(this.scene, this.cam);
    renderer.setRenderTarget(prev);
    return this.rt.texture;
  };

  DR.SkyDeck = SkyDeck;
})();
