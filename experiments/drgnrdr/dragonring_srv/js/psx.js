// PSX-style rendering:
// - the scene renders into a small image (height 'height' pixels,
//   width by the window's shape), shown with hard (nearest) pixels;
// - vertices snap to a coarse screen grid ('snap' steps over the screen
//   height), which gives the PlayStation's wobble; this patches the
//   built-in materials' vertex code, so it must run before any material
//   is first drawn, and a change needs a reload;
// - colours are cut to 'bits' bits per channel (5 = the PlayStation's
//   15-bit colour) with 4 x 4 ordered dithering ('dither' 0..1).
//
//   DR.PSX.install(cfg)             // once, before rendering anything
//   var psx = new DR.PSX(renderer);
//   psx.render(scene, camera, cfg)  // instead of renderer.render
//
(function() {
  var DR = window.DR = window.DR || {};

  var DEFAULTS = { enabled: true, height: 240, snap: 120, bits: 5, dither: 1, bloom: true, bloomStrength: 0.6, bloomThreshold: 0.88,
                   bloomRadius: 3 };

  function install(cfg) {
    if ( !cfg || !cfg.enabled || !(cfg.snap > 0) ) { return; }
    var sy = cfg.snap.toFixed(1), sx = (cfg.snap * (16 / 9)).toFixed(1);
    THREE.ShaderChunk.project_vertex += [
      "",
      "gl_Position.xy = (floor(((gl_Position.xy / gl_Position.w) * vec2(" + sx + ", " + sy + ") * 0.5) + 0.5) / (vec2(" + sx + ", " + sy + ") * 0.5)) * gl_Position.w;"
    ].join("\n");
  }

  var VERT = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

  var FRAG = [
    "uniform sampler2D tex; uniform vec2 res; uniform float levels, dither, bloom, thresh, radius, quant; varying vec2 vUv;",
    "float m2(float a, float b) { return (2.0 * a * (1.0 - b)) + (3.0 * b * (1.0 - a)) + (a * b); }",
    "float bayer(vec2 p) {",
    "  p = floor(mod(p, 4.0));",
    "  float m = (4.0 * m2(mod(p.x, 2.0), mod(p.y, 2.0))) + m2(floor(p.x / 2.0), floor(p.y / 2.0));",
    "  return (m + 0.5) / 16.0;",
    "}",
    "void main() {",
    "  vec4 c = linearToOutputTexel(texture2D(tex, vUv));",
    "  // Bloom: the bright part of 24 samples in three rings around the",
    "  // pixel, weighted toward the centre, added on.",
    "  if (bloom > 0.0) {",
    "    vec3 g = vec3(0.0); float wsum = 0.0;",
    "    for (int i = 0; i < 24; i++) {",
    "      float a = float(i) * 2.399, rr = radius * (0.5 + float(i / 8)) * 0.7, w = 1.0 / (1.0 + float(i / 8));",
    "      vec3 s = linearToOutputTexel(texture2D(tex, vUv + (vec2(cos(a), sin(a)) * rr / res))).rgb;",
    "      g += max(s - thresh, 0.0) * w;  wsum += w;",
    "    }",
    "    c.rgb += (g / wsum) * bloom * 3.0;",
    "  }",
    "  float d = mix(0.5, bayer(floor(vUv * res)), dither);",
    "  if (quant > 0.5) { c.rgb = floor((c.rgb * (levels - 1.0)) + d) / (levels - 1.0); }",
    "  gl_FragColor = vec4(clamp(c.rgb, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  function PSX(renderer) {
    this.r  = renderer;
    this.rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.u  = { tex: { value: this.rt.texture }, res: { value: new THREE.Vector2() }, levels: { value: 32 }, dither: { value: 1 },
                bloom: { value: 0 }, thresh: { value: 0.7 }, radius: { value: 3 }, quant: { value: 1 } };
    this.cam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    var q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
                           new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false }));
    q.frustumCulled = false;
    this.scene.add(q);
  }

  PSX.prototype.render = function(scene, camera, cfg) {
    var r = this.r;
    if ( !cfg || (!cfg.enabled && !cfg.bloom) ) { r.render(scene, camera);  return; }

    // PSX off but bloom on: the same pass at full resolution, no colour
    // cutting.
    //
    var sz = r.getDrawingBufferSize(new THREE.Vector2()),
        h  = ( cfg.enabled ? Math.max(60, Math.round(cfg.height)) : sz.y ), w = Math.max(80, Math.round(h * (sz.x / sz.y))),
        lin = ( cfg.enabled ? THREE.NearestFilter : THREE.LinearFilter );
    if (this.rt.texture.magFilter !== lin) {
      this.rt.texture.magFilter = this.rt.texture.minFilter = lin;
      this.rt.texture.needsUpdate = true;
    }
    this.u.bloom.value  = ( cfg.bloom ? cfg.bloomStrength : 0 );
    this.u.thresh.value = cfg.bloomThreshold;
    this.u.radius.value = cfg.bloomRadius * ( cfg.enabled ? 1 : (sz.y / 240) );
    this.u.quant.value  = ( cfg.enabled ? 1 : 0 );
    if ( (this.rt.width !== w) || (this.rt.height !== h) ) { this.rt.setSize(w, h); }
    this.u.res.value.set(w, h);
    this.u.levels.value = Math.pow(2, cfg.bits);
    this.u.dither.value = cfg.dither;
    r.setRenderTarget(this.rt);
    r.render(scene, camera);
    r.setRenderTarget(null);
    r.render(this.scene, this.cam);
  };

  DR.PSX = PSX;
  DR.PSX.install = install;
  DR.PSX_DEFAULTS = DEFAULTS;
})();
