// Dragon ride: fly a dragon through a gully town, through the hoops,
// to the finish.  Pedal (Up arrow / Space) for thrust, W/S pitch,
// A/D turn; I/J/K/L/U/O force-move out of tight spots; R back to the
// last hoop; Enter restarts; P pauses.  Keys can be remapped.
//
// Settings come from, in order: built-in defaults, config.json (read
// at load), then the panel's saved edits.  Saved edits are dropped
// when config.json changes, so editing the file always takes effect.
//
// The level comes from LevelGen (seed from ?seed=N or the panel), or
// from a level JSON file loaded in the panel.
//
(function() {
  var DR = window.DR, KEY = "dragonride.v2";

  // Single-level generator options (config.json 'level').
  //
  var LEVEL_KEYS = ["length", "wind", "floorHalf", "wallHeight", "cruise", "townCruise",
                    "tunnelR", "hoopSpacing", "hoopR", "finishR", "streetClear", "townDensity"];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function defaults() {
    var lv = {};
    LEVEL_KEYS.forEach(function(k) { lv[k] = LevelGen.DEFAULTS[k]; });
    return {
      seed   : 1,
      level  : lv,
      flight : clone(DR.PARAMS),
      view   : { model: DR.Models.FALLBACK, showRider: true, camDist: 13, camHeight: 6, fov: 65, showSphere: false, invertPitch: false, showMidiStatus: true, showStageName: true },
      keys   : clone(DR.KEYS),
      midi   : clone(DR.MIDI_DEFAULTS),
      gamepad: clone(DR.PAD_DEFAULTS),
      sky    : clone(DR.SKY_DEFAULTS),
      session: { minutes: 15, seed: 1, newSeed: true, types: Object.keys(LevelGen.STAGE_TYPES).join(","), palettes: true, bold: true,
                 palette: -1, stageLength: 2400, width: 1, hoopSpacing: 70, hoopR: 7, wallHeight: 1, flyHeight: 1, heightVariety: 1, curve: 1,
                 townDensity: 0.4, spires: 12 },
      psx    : clone(DR.PSX_DEFAULTS),
      fx     : clone(DR.FX_DEFAULTS)
    };
  }

  // Copy the known sections of 'src' over 'dst'; keys are replaced
  // per action, everything else per value.
  //
  function merge(dst, src) {
    if (!src) { return dst; }
    if (src.seed !== undefined) { dst.seed = src.seed; }
    ["level", "flight", "view", "keys", "sky", "midi", "gamepad", "session", "psx", "fx"].forEach(function(k) {
      if (src[k]) { Object.assign(dst[k], clone(src[k])); }
    });
    return dst;
  }

  function stamp(o) {
    var s = JSON.stringify(o || null), h = 0;
    for (var i = 0; i < s.length; i++) { h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0; }
    return h;
  }

  var S = defaults(), CFG = null, cfgNote = "built-in defaults";

  function settle(cfg) {
    CFG = cfg;
    S   = merge(defaults(), cfg);
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if ( saved && (saved.stamp === stamp(cfg)) ) { merge(S, saved.S); }
    }
    catch (e) { }
    var qs = /[?&]seed=(\d+)/.exec(location.search);
    if (qs) { S.session.seed = S.seed = parseInt(qs[1], 10); }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ stamp: stamp(CFG), S: S })); }
    catch (e) { }
  }

  function configJSON() {
    return JSON.stringify({ format: "dragonride-config", version: 1, seed: S.seed, level: S.level,
                            flight: S.flight, view: S.view, sky: S.sky, keys: S.keys,
                            midi: S.midi, gamepad: S.gamepad, session: S.session, psx: S.psx, fx: S.fx }, null, 2);
  }

  // Chrome-based browsers cannot fetch config.json from a file://
  // page (Firefox can); then the built-in defaults are used.
  //
  function loadConfig() {
    return fetch("config.json", { cache: "no-store" })
      .then(function(r) {
        if (!r.ok) { throw new Error("HTTP " + r.status); }
        return r.json();
      })
      .then(function(c) {
        cfgNote = "config.json";
        return c;
      })
      .catch(function(e) {
        cfgNote = "built-in defaults (config.json not read: " + ( (location.protocol === "file:") ? "page opened as file://" : String(e) ) + ")";
        console.warn("dragonride: " + cfgNote);
        return null;
      });
  }

  // ---------------------------------------------------------------- scene

  var view     = document.getElementById("view"),
      renderer = new THREE.WebGLRenderer({ antialias: true }),
      scene    = new THREE.Scene(),
      camera   = new THREE.PerspectiveCamera(S.view.fov, 1, 0.3, 1500);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  view.appendChild(renderer.domElement);
  scene.background = new THREE.Color(DR.COLORS.sky);
  scene.fog        = new THREE.Fog(DR.COLORS.sky, 150, 650);
  var hemi = new THREE.HemisphereLight(0xfff4e0, 0x6a7a60, 1.6),
      sun  = new THREE.DirectionalLight(0xfff0d8, 1.6);
  sun.position.set(-0.5, 1, 0.35);
  scene.add(hemi, sun);
  var sky = new DR.Sky(scene, hemi, sun);

  // The dragon model (js/models.js); swapped from the panel.
  //
  var dragon = null, MI = { using: "" }, psx = null, fx = new DR.Fx(scene);
  function setModel(id) {
    DR.Models.create(id, function(m, used, err) {
      if (dragon) { scene.remove(dragon.root); }
      dragon    = m;
      MI.using  = ( err ? used + " (fallback: " + err + ")" : used );
      scene.add(dragon.root);
      if (dragon.setRider) { dragon.setRider(S.view.showRider); }
    });
  }
  fx.setLights(hemi, sun);
  fx.setGround(function(x, z) { return ( run ? run.height(x, z) : 0 ); });

  // Soft round shadow on the ground under the dragon.
  //
  var shadowTex = (function() {
    var c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = c.height = 64;
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(0,0,0,0.4)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  var shadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2),
                              new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  scene.add(shadow);

  var sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12),
                              new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 }));
  scene.add(sphere);


  // ---------------------------------------------------------------- level

  // The run: a session of streamed stages (js/session.js), or one
  // loaded level.  Each built stage gets its meshes (js/world.js), kept
  // in 'worlds' by stage number and dropped when the stage is.
  //
  var run = null, single = null, worlds = {}, fl = null, state = "ready", runTime = 0, paused = false, msgUntil = 0,
      avgSpeed = 20, stageShown = -1;
  function F(x, y, z) { return ( run ? run.sdf(x, y, z) : 1e3 ); }
  F.height = function(x, z) { return ( run ? run.height(x, z) : 0 ); };

  function addWorld(st) {
    var W = DR.World.build(st);
    W.stage = st;
    fx.decorate(st, W.group, S.fx, ( single ? 1 : S.session.seed ));
    scene.add(W.group);
    worlds[st.stage] = W;
  }
  function dropWorld(st) {
    var W = worlds[st.stage];
    if (!W) { return; }
    scene.remove(W.group);
    W.group.traverse(function(o) {
      if (o.geometry) { o.geometry.dispose(); }
      if (o.material && o.material.dispose) { o.material.dispose(); }
    });
    delete worlds[st.stage];
  }

  function sessionOpts() {
    var o = S.session;
    return { seed: o.seed, types: o.types, palettes: o.palettes, bold: o.bold, palette: o.palette, stageLength: o.stageLength,
             width: o.width, hoopSpacing: o.hoopSpacing, hoopR: o.hoopR, wallHeight: o.wallHeight, flyHeight: o.flyHeight,
             heightVariety: o.heightVariety, curve: o.curve, townDensity: o.townDensity, spires: o.spires };
  }

  // A new run: 'level' a level object to fly alone, or null for a
  // session.
  //
  function startRun(level) {
    Object.keys(worlds).forEach(function(k) { dropWorld(worlds[k].stage); });
    single = level || null;
    run = ( single ? new DR.SingleRun(single) : new DR.Run(sessionOpts(), window.color500, { minutes: S.session.minutes }) );
    run.onBuild = addWorld;
    run.onDrop  = dropWorld;
    var st0 = run.ensure(0, 0, 20);
    if (!fl) { fl = new DR.Flight(F, S.flight); }
    fl.place(st0.start.p, st0.start.n);
    fl.hold    = true;
    state      = "ready";
    runTime    = 0;
    avgSpeed   = 20;
    stageShown = -1;

    // Clear any message left from the last run (the finish message is
    // set to stay until the next run).
    //
    msgUntil = 0;
    if (hud) { hud.msg.textContent = ""; }
    snapCamera();
  }
  function load(level) { startRun(level); }

  function restart() {
    if ( !single && S.session.newSeed ) { S.session.seed = 1 + Math.floor(Math.random() * 99999); }
    startRun(single);
  }

  function respawn() {
    if (state === "finished") { restart(); return; }
    var r = run.respawn();
    if (!r) { return; }
    fl.place(r.p, r.n);
    snapCamera();
    flash("Back at the last hoop", 1.5);
  }

  // ---------------------------------------------------------------- input

  var kb = new DR.Keyboard(S.keys), midi = new DR.Midi(S.midi, kb), pad = new DR.Gamepad(S.gamepad, kb),
      DEV = { midi: "", midiLast: "", pad: "", padLive: "" };

  // Device status, shown in the panel (and checked by tests).
  //
  function devStatus(now) {
    DEV.midi = midi.describe(now);
    DEV.pad  = pad.status;
    if (!midi.learn) { DEV.midiLast = midi.lastMsg; }

    // On screen until the first pulse arrives (then for 5 s), unless
    // turned off in View (the Devices panel still shows it).
    //
    var ms = document.getElementById("midistat"),
        show = ( S.view.showMidiStatus && S.midi.enabled && ((midi.last === null) || ((now - midi.last) < 5)) );
    if (!ms) { return; }
    ms.style.display = ( show ? "block" : "none" );
    if (show) { ms.textContent = "MIDI: " + DEV.midi + ( (midi.lastMsg !== "none yet") ? " | last: " + midi.lastMsg : "" ); }
    if (!pad.learn)  { DEV.padLive = pad.live; }
  }
  kb.onPress = function(a) {
    if (a === "reset")   { respawn(); }
    if (a === "restart") { restart(); }
    if (a === "pause")   { paused = !paused; }
    if (a === "fullscreen") { toggleFullscreen(); }
    if (a === "pedal") {
      paused = false;
      if (dragon && dragon.stroke) { dragon.stroke(); }
    }
  };

  function keys(a) {
    return ( (S.keys[a] && S.keys[a].length) ? S.keys[a].map(DR.keyName).join(" / ") : "(no key)" );
  }

  // The help line and the stuck hint follow the current bindings.
  //
  function keyHelp() {
    var h = [
      "<b>" + keys("pedal") + "</b> tap to pedal",
      "<b>" + keys("up") + " , " + keys("down") + "</b> pitch",
      "<b>" + keys("left") + " , " + keys("right") + "</b> turn",
      "<b>" + ["fFwd", "fLeft", "fBack", "fRight", "fUp", "fDown"].map(keys).join(" ") + "</b> force move",
      "<b>" + keys("reset") + "</b> last hoop",
      "<b>" + keys("restart") + "</b> restart",
      "<b>" + keys("pause") + "</b> pause"
    ];
    document.getElementById("keys").innerHTML = h.join(" &nbsp; ");
    document.getElementById("hint").textContent =
      "Stuck?  Hold " + ["fFwd", "fLeft", "fBack", "fRight"].map(keys).join(" ") +
      " (and " + keys("fUp") + " / " + keys("fDown") + " for up / down) to force-move, or " +
      keys("reset") + " to go back to the last hoop.";
  }

  // ---------------------------------------------------------------- HUD

  var hud = {
    time : document.getElementById("time"),
    hoop : document.getElementById("hoops"),
    cad  : document.getElementById("cad"),
    bar  : document.getElementById("cadbar"),
    spd  : document.getElementById("speed"),
    msg  : document.getElementById("msg"),
    hint : document.getElementById("hint")
  };

  // Stage name banner: pixel font, white with a black outline, "STAGE n"
  // above the stage's name, for 'sec' seconds.
  //
  var bannerTimer = null;
  function stageBanner(st, sec) {
    var el = document.getElementById("stagebanner");
    if (!el) { return; }
    var small = Math.max(2, Math.round(window.innerHeight / 260)), name = st.label.toUpperCase(),
        big = Math.max(small, Math.min(small * 2, Math.floor((0.9 * window.innerWidth) / ((name.length * 6) + 1))));
    el.innerHTML = "";
    el.appendChild(DR.PixelFont.canvas(( st.final ? "FINAL STAGE" : "STAGE " + (st.stage + 1) ), small));
    el.appendChild(DR.PixelFont.canvas(name, big));
    el.style.opacity = "1";
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function() { el.style.opacity = "0"; }, sec * 1000);
  }

  function flash(text, sec) {
    hud.msg.textContent = text;
    msgUntil = performance.now() / 1000 + sec;
  }

  function fmt(t) {
    var m = Math.floor(t / 60), s = t - (m * 60);
    return m + ":" + ( (s < 10) ? "0" : "" ) + s.toFixed(1);
  }

  // ---------------------------------------------------------------- camera

  var camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), camUp = new THREE.Vector3(0, 1, 0);

  // Where the camera wants to be: behind and above the dragon in its own
  // frame (so it stays behind through a loop), pulled in along the line
  // to the dragon if that would put it inside rock.
  //
  function camGoal() {
    var p = fl.pos, f = fl.forward(), u = fl.up(), D = S.view.camDist, Hh = S.view.camHeight,
        a = [p[0] + (u[0] * 1.5), p[1] + (u[1] * 1.5), p[2] + (u[2] * 1.5)],
        b = [p[0] - (f[0] * D) + (u[0] * Hh), p[1] - (f[1] * D) + (u[1] * Hh), p[2] - (f[2] * D) + (u[2] * Hh)],
        d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
        len = Math.sqrt((d[0] * d[0]) + (d[1] * d[1]) + (d[2] * d[2])), t = 0;
    while (t < len) {
      var x = a[0] + ((d[0] / len) * t), y = a[1] + ((d[1] / len) * t), z = a[2] + ((d[2] / len) * t),
          s = F(x, y, z);
      if (s < 1.2) { break; }
      t += Math.max(0.3, s - 1);
    }
    t = Math.min(t, len);
    return new THREE.Vector3(a[0] + ((d[0] / len) * t), a[1] + ((d[1] / len) * t), a[2] + ((d[2] / len) * t));
  }

  function lookGoal() {
    var f = fl.forward(), u = fl.up();
    return new THREE.Vector3(fl.pos[0] + (f[0] * 10) + u[0], fl.pos[1] + (f[1] * 10) + u[1], fl.pos[2] + (f[2] * 10) + u[2]);
  }

  function snapCamera() {
    camPos.copy(camGoal());
    camLook.copy(lookGoal());
    camUp.fromArray(fl.up());
  }

  // ---------------------------------------------------------------- loop

  function resize() {
    var w = view.clientWidth, h = view.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  var clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    var dt = Math.min(clock.getDelta(), 0.05), now = performance.now() / 1000;
    sky.update(dt, camera);
    if (paused) { dt = 0; }
    var c = kb.read(now, dt, S.view.invertPitch), g = pad.poll(now);

    // Gamepad steering adds to the keys (each limited to -1..1).
    //
    c.turn  = Math.max(-1, Math.min(1, c.turn + g.turn));
    c.climb = Math.max(-1, Math.min(1, c.climb + (g.climb * ( S.view.invertPitch ? -1 : 1 ))));
    c.force = c.force.map(function(v, i) { return Math.max(-1, Math.min(1, v + g.force[i])); });
    c.boost = ( c.boost || g.boost );
    devStatus(now);
    if (dt > 0) { step(dt, c); }
    draw(dt, c, now);
  }

  function step(dt, c) {
    var a = fl.pos.slice();
    fl.step(dt, c);
    if ( (state === "ready") && !fl.hold ) { state = "flying"; }
    if (state === "flying") {
      runTime  += dt;
      avgSpeed += (fl.speed - avgSpeed) * (1 - Math.exp(-dt / 20));
    }
    run.ensure(fl.pos[2], runTime, avgSpeed);
    run.update(a, fl.pos).forEach(function(e) {
      var W = worlds[e.stage.stage];
      if ( W && (e.hoop !== undefined) ) { W.hoops[e.hoop].material.opacity = 0.18; }
      if (e.finish) {
        state = "finished";
        flash(( single ? "Finished" : "Session complete" ) + " in " + fmt(runTime) + " with " + run.taken + " of " + run.seen +
              " hoops.  " + keys("restart") + " to fly again.", 1e9);
      }
    });
  }

  // Weather at z: each stage's (rain, snow or clear, by chance), blended
  // across joins like the colours.
  //
  function weatherAt(z) {
    var st = ( run ? run.stageAt(z) : null ), out = { rain: 0, snow: 0 };
    if (!st) { return out; }
    var seed = ( single ? 1 : S.session.seed ), w0 = fx.weatherOf(seed, st.stage, S.fx), b = { other: null, w: 0 }, w1 = w0;
    if (!single) {
      var t = (z - (st.stage * st.length)) / st.length, B = st.blend || 0.12;
      if (t < B)             { b = { k: st.stage - 1, w: 1 - ((t + B) / (2 * B)) }; }
      else if (t > (1 - B))  { b = { k: st.stage + 1, w: (t - (1 - B)) / (2 * B) }; }
      if (b.k !== undefined) { w1 = fx.weatherOf(seed, Math.max(0, b.k), S.fx); }
    }
    out.rain = (((w0 === 1) ? 1 : 0) * (1 - b.w)) + (((w1 === 1) ? 1 : 0) * b.w);
    out.snow = (((w0 === 2) ? 1 : 0) * (1 - b.w)) + (((w1 === 2) ? 1 : 0) * b.w);
    return out;
  }

  // Sky and fog take the palette of the stage under the dragon, blended
  // across joins like the terrain.
  //
  var TC1 = new THREE.Color(), TC2 = new THREE.Color();
  function skyTint() {
    var st = ( run ? run.stageAt(fl.pos[2]) : null );
    if ( !st || !st.roles ) { return null; }
    var b = DR.World.roleBlend(st, (fl.pos[2] - (st.stage * st.length)) / st.length), o = {};
    [["zenith", "skyTop"], ["horizon", "skyHorizon"], ["hemiSky", "hemiSky"], ["hemiGround", "hemiGround"]].forEach(function(q) {
      TC1.set(st.roles[q[1]]);
      if (b.other) { TC1.lerp(TC2.set(b.other[q[1]]), b.w); }
      o[q[0]] = "#" + TC1.getHexString();
    });
    return o;
  }

  function draw(dt, c, now) {
    var p = fl.pos;
    if (dragon) {
      dragon.root.position.set(p[0], p[1], p[2]);
      dragon.root.rotation.set(-fl.pitch, fl.yaw, -fl.turn * 0.55, "YXZ");
      dragon.animate(dt, c.cadence, fl.turn, fl.speed);
    }
    sphere.visible = S.view.showSphere;
    sphere.position.set(p[0], p[1], p[2]);
    sphere.scale.setScalar(fl.P.radius);
    shadow.position.set(p[0], F.height(p[0], p[2]) + 0.08, p[2]);
    var sh = Math.max(0, 1 - ((p[1] - shadow.position.y) / 40));
    shadow.material.opacity = sh;

    // Next hoop: highlight and pulse it.
    //
    var pulse = 1 + (0.06 * Math.sin(now * 6)), tg = run.target();
    Object.keys(worlds).forEach(function(key) {
      var W = worlds[key], co = W.stage.course;
      W.hoops.forEach(function(h, i) {
        var nx = ( (W.stage.hoops[i] === tg) && !co.finished );
        h.material.color.setHex(( co.taken[i] ? W.colors.done : ( nx ? W.colors.next : W.colors.hoop ) ));
        h.material.emissive.copy(h.material.color);
        h.scale.setScalar(( nx ? pulse : 1 ));
      });
    });

    // Stage names as they come up.
    //
    var stNow = run.stageAt(p[2]);
    if ( stNow && stNow.label && (stNow.stage !== stageShown) ) {
      stageShown = stNow.stage;
      if ( (state !== "finished") && S.view.showStageName ) { stageBanner(stNow, 3); }
    }
    fx.unflash(scene);
    if ( !single && S.session.palettes ) { sky.set(S.sky, skyTint()); }

    var k = 1 - Math.exp(-dt * 5);
    camPos.lerp(camGoal(), k);
    camLook.lerp(lookGoal(), 1 - Math.exp(-dt * 8));
    camUp.lerp(new THREE.Vector3().fromArray(fl.up()), 1 - Math.exp(-dt * 6)).normalize();
    camera.position.copy(camPos);
    camera.up.copy(camUp);
    camera.lookAt(camLook);
    if (camera.fov !== S.view.fov) { camera.fov = S.view.fov;  camera.updateProjectionMatrix(); }
    DR.World.time.value = (DR.World.time.value + dt) % 1000;
    fx.update(dt, camera, scene, renderer, S.fx, weatherAt(p[2]));
    sky.prerender(renderer, camera);
    psx.render(scene, camera, S.psx);

    hud.time.textContent = fmt(runTime) + ( (!single && (S.session.minutes > 0)) ? " / " + S.session.minutes + ":00" : "" );
    hud.hoop.textContent = run.taken + " / " + run.seen;
    hud.cad.textContent  = Math.round(c.cadence);
    hud.spd.textContent  = fl.speed.toFixed(0);
    hud.bar.style.width  = Math.min(100, (100 * c.cadence) / (fl.P.cadFull * 1.3)) + "%";
    if (paused)                 { hud.msg.textContent = "Paused.  " + keys("pause") + " or " + keys("pedal") + " to continue."; }
    else if (state === "ready") { } // hud.msg.textContent = "Tap " + keys("pedal") + " to pedal."; }
    else if (now > msgUntil)    { hud.msg.textContent = ""; }
    hud.hint.style.opacity = ( (fl.contact > 2) ? 1 : 0 );
  }

  // ---------------------------------------------------------------- panel

  function newLevel() {
    startRun(null);
    save();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) { document.exitFullscreen();  return; }
    var p = document.documentElement.requestFullscreen();
    if (p && p.catch) { p.catch(function() { flash("Fullscreen needs a key press or click (browser rule)", 3); }); }
  }

  // Credits: shown on request, never over the game.
  //
  function showCredits() {
    var el = document.getElementById("credits");
    el.style.display = ( (el.style.display === "block") ? "none" : "block" );
  }
  document.getElementById("credits").addEventListener("click", showCredits);

  function download(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name;
    a.click();
  }

  function buildGui() {
    var gui = new lil.GUI({ title: "settings" });
    gui.add({ f: toggleFullscreen }, "f").name("fullscreen (F)");
    gui.add({ c: showCredits }, "c").name("credits");

    // Session: length, stage types, palettes, seed.  Changes start a new
    // session.  A loaded level JSON is flown alone instead.
    //
    var fL = gui.addFolder("Session"), ses = S.session, typeSw = {};
    fL.add(ses, "minutes", { "15 minutes": 15, "30 minutes": 30, "45 minutes": 45, "60 minutes": 60, "endless": 0 }).name("length")
      .onChange(newLevel);
    fL.add(ses, "seed", 1, 99999, 1).onFinishChange(newLevel);
    fL.add(ses, "newSeed").name("new seed on restart").onChange(save);
    fL.add({ r: function() { ses.seed = 1 + Math.floor(Math.random() * 99999); gui.controllersRecursive().forEach(function(c) { c.updateDisplay(); }); newLevel(); } }, "r").name("new session");
    var fT = fL.addFolder("stage types");
    Object.keys(LevelGen.STAGE_TYPES).forEach(function(t) {
      typeSw[t] = (ses.types.split(",").indexOf(t) >= 0);
      fT.add(typeSw, t).name(LevelGen.STAGE_TYPES[t].label).onChange(function() {
        var on = Object.keys(typeSw).filter(function(k) { return typeSw[k]; });
        ses.types = ( on.length ? on.join(",") : t );
        newLevel();
      });
    });
    fT.close();
    var fPal = fL.addFolder("palettes (color500)");
    fPal.add(ses, "palettes").name("use palettes").onChange(newLevel);
    fPal.add(ses, "bold").name("bold palettes only").onChange(newLevel);
    fPal.add(ses, "palette", -1, (window.color500 ? color500.length - 1 : 0), 1).name("fixed palette (-1 per stage)").onFinishChange(newLevel);
    fPal.close();
    var fLs = fL.addFolder("landscape");
    [["width", "valley width (x)", 0.4, 2.5, 0.05], ["hoopSpacing", "hoop spacing", 20, 250, 1], ["hoopR", "hoop size", 3, 15, 0.5],
     ["wallHeight", "wall height (x)", 0.2, 2.5, 0.05], ["flyHeight", "flying height (x)", 0.4, 3, 0.05],
     ["heightVariety", "height variety (x)", 0, 2, 0.05],
     ["curve", "bendiness (x)", 0, 2.5, 0.05], ["townDensity", "town density", 0, 1, 0.05], ["spires", "spires per stage", 0, 40, 1],
     ["stageLength", "stage length", 800, 6000, 100]].forEach(function(q) {
      fLs.add(ses, q[0], q[2], q[3], q[4]).name(q[1]).onFinishChange(newLevel);
    });
    fL.add({ l: function() {
      var inp = document.createElement("input");
      inp.type = "file";  inp.accept = ".json,application/json";
      inp.onchange = function() {
        inp.files[0].text().then(function(t) {
          var lv = JSON.parse(t), r = LevelGen.validate(lv);
          if (r.errors.length) { alert("Level not loaded:\n" + r.errors.join("\n"));  return; }
          if (r.warnings.length) { console.warn("dragonride level warnings:\n" + r.warnings.join("\n")); }
          load(lv);
        }).catch(function(e) { alert(String(e)); });
      };
      inp.click();
    } }, "l").name("load level JSON (fly alone)");
    fL.add({ s: function() {
      var st = run.stageAt(fl.pos[2]), out = {};
      Object.keys(st).forEach(function(k) { if ( (k !== "sdf") && (k !== "course") ) { out[k] = st[k]; } });
      download("stage-" + ( (st.seed !== undefined) ? st.seed + "-" + st.stage : "custom" ) + ".json", JSON.stringify(out));
    } }, "s").name("save current stage JSON");

    // Effects: bloom, rain and snow change live; placed effects
    // (geysers, vents, birds, critters) start a new session.
    //
    var fFx = gui.addFolder("Effects");
    var fBl = fFx.addFolder("bloom");
    fBl.add(S.psx, "bloom").name("on").onChange(save);
    fBl.add(S.psx, "bloomStrength", 0, 3, 0.05).name("strength").onChange(save);
    fBl.add(S.psx, "bloomThreshold", 0, 1, 0.01).name("threshold").onChange(save);
    fBl.add(S.psx, "bloomRadius", 0.5, 12, 0.5).name("radius").onChange(save);
    var FXR = { chance: [0, 1, 0.01], amount: [0, 1, 0.01], speed: [0.5, 60, 0.5], length: [0.1, 4, 0.05], wind: [-1, 1, 0.01],
                opacity: [0, 1, 0.01], size: [0.02, 1.5, 0.01], sway: [0, 4, 0.05], perStage: [0, 20, 1], height: [3, 120, 1],
                period: [2, 30, 0.5], flocks: [0, 12, 1], splashes: [0, 3, 0.05], splashRange: [30, 500, 5], every: [3, 60, 1], bolts: [0, 1, 0.05],
                brightness: [0, 2, 0.05] }, LIVE = { rain: true, snow: true, lightning: true };
    Object.keys(S.fx).forEach(function(name) {
      var f = fFx.addFolder(name), o = S.fx[name], on = ( LIVE[name] ? save : newLevel );
      Object.keys(o).forEach(function(k) {
        var v = o[k], c;
        if (typeof v === "boolean")                         { c = f.add(o, k).name( (k === "enabled") ? "on" : k ); }
        else if ( (typeof v === "string") && (v[0] === "#") ) { c = f.addColor(o, k); }
        else if (FXR[k])                                    { c = f.add(o, k, FXR[k][0], FXR[k][1], FXR[k][2]); }
        if (c) { ( LIVE[name] ? c.onChange(on) : c.onFinishChange(on) ); }
      });
      f.close();
    });
    fFx.close();

    var fPs = gui.addFolder("PSX look");
    fPs.add(S.psx, "enabled").name("on").onChange(save);
    fPs.add(S.psx, "height", 120, 720, 1).name("vertical pixels").onChange(save);
    fPs.add(S.psx, "bits", 3, 8, 1).name("bits per colour").onChange(save);
    fPs.add(S.psx, "dither", 0, 1, 0.01).onChange(save);
    fPs.add(S.psx, "snap", 0, 480, 1).name("vertex snap (reload)").onChange(save);
    fPs.close();

    var fF = gui.addFolder("Flight");
    var lim = { radius: [1, 6, 0.1], vMax: [10, 80, 1], cadFull: [40, 240, 5], spinUp: [0.2, 5, 0.1], coast: [0.5, 10, 0.1],
                turnRate: [0.3, 3, 0.05], pitchRate: [0.3, 3, 0.05], pitchMax: [0.2, 1.4, 0.05], pitchLevel: [0, 4, 0.1],
                liftSpeed: [0, 30, 1], sinkMax: [0, 15, 0.5], follow: [1, 15, 0.5], bounce: [0, 1, 0.05],
                hitSlow: [0, 1, 0.05], scrape: [0, 3, 0.05], forceSpeed: [2, 40, 1], forceBoost: [1, 30, 0.5] };
    Object.keys(lim).forEach(function(k) {
      fF.add(S.flight, k, lim[k][0], lim[k][1], lim[k][2]).onChange(function(v) { fl.P[k] = v;  save(); });
    });
    fF.add({ r: function() {
      var base = merge(defaults(), CFG).flight;
      Object.assign(S.flight, base);
      Object.assign(fl.P, base);
      gui.controllersRecursive().forEach(function(c) { c.updateDisplay(); });
      save();
    } }, "r").name("reset flight");
    fF.close();

    var fV = gui.addFolder("View");
    fV.add(S.view, "model", DR.Models.options()).name("dragon model").onChange(function(v) { setModel(v);  save(); });
    fV.add(MI, "using").name("model in use").disable().listen();
    fV.add(S.view, "showRider").name("show rider").onChange(function(v) {
      if (dragon && dragon.setRider) { dragon.setRider(v); }
      save();
    });
    fV.add(S.view, "camDist", 5, 30, 0.5).name("camera distance").onChange(save);
    fV.add(S.view, "camHeight", 0, 12, 0.5).name("camera height").onChange(save);
    fV.add(S.view, "fov", 40, 100, 1).onChange(save);
    fV.add(S.view, "invertPitch").name("invert pitch (W = dive)").onChange(save);
    fV.add(S.view, "showSphere").name("show collision sphere").onChange(save);
    fV.add(S.view, "showMidiStatus").name("show MIDI message").onChange(save);
    fV.add(S.view, "showStageName").name("show stage names").onChange(function(v) {
      if (!v) { var el = document.getElementById("stagebanner");  if (el) { el.style.opacity = "0"; } }
      save();
    });
    fV.close();

    var fS = gui.addFolder("Sky");
    function onSky() {
      sky.set(S.sky);
      var off = DR.skyUnused(S.sky.preset);
      fS.controllers.forEach(function(c) { c.enable(off.indexOf(c.property) < 0); });
      save();
    }
    fS.add(S.sky, "preset", Object.keys(DR.SKY_PRESETS)).onChange(onSky);
    fS.add(S.sky, "coverage", 0, 1, 0.01).name("cloud cover").onChange(onSky);
    fS.add(S.sky, "billow", 0, 1, 0.01).onChange(onSky);
    fS.add(S.sky, "variety", 0, 1, 0.01).name("variety (uneven cover)").onChange(onSky);
    fS.add(S.sky, "curl", 0, 1, 0.01).onChange(onSky);
    fS.add(S.sky, "relief", 0, 3, 0.05).name("relief (mammatus)").onChange(onSky);
    fS.add(S.sky, "volumeRes", 0.25, 1, 0.05).name("mammatus resolution").onChange(onSky);
    fS.add(S.sky, "cirrus", 0, 1, 0.01).name("high wisps").onChange(onSky);
    fS.add(S.sky, "glow", 0, 1.5, 0.01).name("sun glow").onChange(onSky);
    fS.add(S.sky, "sunHeight", -5, 60, 1).name("glow height (deg)").onChange(onSky);
    fS.add(S.sky, "sunAngle", -180, 180, 1).name("glow direction (deg)").onChange(onSky);
    fS.add(S.sky, "speed", 0, 20, 0.1).name("drift speed").onChange(onSky);
    fS.add(S.sky, "scale", 0.2, 4, 0.05).name("cloud size (1/x)").onChange(onSky);
    fS.add(S.sky, "wind", 0, 360, 1).name("wind direction").onChange(onSky);
    fS.add(S.sky, "fogScale", 0.5, 5, 0.05).name("fog distance").onChange(onSky);
    onSky();
    fS.close();

    // Devices: every MIDI and gamepad setting from config.json, with
    // live readouts and "learn" buttons.
    //
    var fD = gui.addFolder("Devices");
    var fMi = fD.addFolder("MIDI pedal sensor"), noteOpts = { "any note": -1 }, chOpts = { "any channel": 0 };
    for (var nn = 0; nn < 128; nn++) { noteOpts[nn + " (" + ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][nn % 12] + (Math.floor(nn / 12) - 1) + ")"] = nn; }
    for (var cc = 1; cc <= 16; cc++) { chOpts["channel " + cc] = cc; }
    fMi.add(DEV, "midi").name("status").disable().listen();
    fMi.add(DEV, "midiLast").name("last message").disable().listen();
    fMi.add(S.midi, "enabled").name("use MIDI").onChange(function() { save();  midi.start(); });
    fMi.add(S.midi, "source", ["auto", "bridge", "webmidi"]).name("source").onChange(function() {
      save();
      if (midi.bridge) { midi.bridge.close();  midi.bridge = null; }
      midi.start();
    });
    var devCtl = fMi.add(S.midi, "device", { "any input": "" }).name("device").onChange(save);
    midi.onDevices = function(names) {
      var o = { "any input": "" };
      names.forEach(function(n) { o[n] = n; });
      if ( S.midi.device && !o[S.midi.device] ) { o[S.midi.device + " (not connected)"] = S.midi.device; }
      devCtl = devCtl.options(o).name("device").onChange(save);
    };
    if (midi.devices.length) { midi.onDevices(midi.devices); }
    var noteCtl = fMi.add(S.midi, "note", noteOpts).name("note").onChange(save),
        chCtl   = fMi.add(S.midi, "channel", chOpts).name("channel").onChange(save);
    fMi.add(S.midi, "strokesPerPulse", 0.5, 8, 0.5).name("strokes per pulse").onChange(save);
    var learnMidi = { l: function() {
      DEV.midiLast = "learning: turn the crank (next note sets note and channel)";
      midi.learn = function() { noteCtl.updateDisplay();  chCtl.updateDisplay();  save(); };
    } };
    fMi.add(learnMidi, "l").name("learn note from sensor");
    fMi.add({ c: function() { midi.start(); } }, "c").name("connect / rescan");

    var fGp = fD.addFolder("Gamepad"), btnOpts = { "none": -1 }, axOpts = { "none": -1 };
    for (var b = 0; b < 20; b++) { btnOpts[b + ( DR.PAD_BUTTONS[b] ? " " + DR.PAD_BUTTONS[b] : "" )] = b; }
    for (var a = 0; a < 8; a++)  { axOpts[a + ( DR.PAD_AXES[a] ? " " + DR.PAD_AXES[a] : "" )] = a; }
    fGp.add(DEV, "pad").name("status").disable().listen();
    fGp.add(DEV, "padLive").name("pressed now").disable().listen();
    fGp.add(S.gamepad, "enabled").name("use gamepad").onChange(save);
    fGp.add(S.gamepad, "deadzone", 0, 0.6, 0.01).onChange(save);
    [["turnAxis", "turn axis"], ["climbAxis", "climb axis"], ["forceXAxis", "force left / right axis"], ["forceZAxis", "force fwd / back axis"]].forEach(function(q) {
      fGp.add(S.gamepad, q[0], axOpts).name(q[1]).onChange(save);
    });
    fGp.add(S.gamepad, "invertTurn").name("invert turn").onChange(save);
    fGp.add(S.gamepad, "invertClimb").name("invert climb").onChange(save);

    // Each action has two button slots (stored as a list in config.json)
    // and a learn button that fills the first slot.
    //
    Object.keys(DR.PAD_ACTIONS).forEach(function(act) {
      var f = fGp.addFolder(DR.PAD_ACTIONS[act]), slots = [];
      [0, 1].forEach(function(k) {
        var proxy = {};
        Object.defineProperty(proxy, "b", {
          get: function() { var L = S.gamepad[act] || []; return ( (L[k] === undefined) ? -1 : L[k] ); },
          set: function(v) {
            var L = (S.gamepad[act] || []).slice();
            L[k] = v;
            S.gamepad[act] = L.filter(function(x) { return ( (x !== undefined) && (x >= 0) ); });
          }
        });
        slots.push(f.add(proxy, "b", btnOpts).name("button " + (k + 1)).onChange(save));
      });
      f.add({ l: function() {
        DEV.padLive = "learning: press the button for " + DR.PAD_ACTIONS[act];
        pad.learn = function(i) {
          var L = (S.gamepad[act] || []).filter(function(x) { return x !== i; });
          S.gamepad[act] = [i].concat(L).slice(0, 2);
          slots.forEach(function(c) { c.updateDisplay(); });
          save();
        };
      } }, "l").name("learn");
      f.close();
    });
    fD.close();

    var fK = gui.addFolder("Keys");
    fK.add({ k: function() {
      paused     = true;
      kb.enabled = false;
      kb.down    = {};
      DR.KeyMap.open(S.keys, function() { save();  keyHelp(); }, function() { kb.enabled = true; });
    } }, "k").name("remap keys");

    var fC = gui.addFolder("Config");
    fC.add({ s: cfgNote }, "s").name("loaded from").disable();
    fC.add({ e: function() { download("config.json", configJSON()); } }, "e").name("export config JSON");
    fC.add({ r: function() {
      try { localStorage.removeItem(KEY); }
      catch (e) { }
      location.reload();
    } }, "r").name("reset to config.json");
    gui.close();
  }

  loadConfig().then(function(cfg) {
    settle(cfg);
    kb.keys = S.keys;
    midi.cfg = S.midi;
    pad.cfg = S.gamepad;
    midi.start();

    // Browsers often only show the MIDI permission prompt in answer to
    // a click or key press: ask again on the first one if access is
    // not granted yet.
    //
    function askMidi() {
      if ( S.midi.enabled && !midi.access && !midi.bridge ) { midi.start(); }
      window.removeEventListener("keydown", askMidi, true);
      window.removeEventListener("pointerdown", askMidi, true);
    }
    window.addEventListener("keydown", askMidi, true);
    window.addEventListener("pointerdown", askMidi, true);
    keyHelp();
    DR.PSX.install(S.psx);
    psx = new DR.PSX(renderer);
    if (S.session.newSeed && !/[?&]seed=/.test(location.search)) { S.session.seed = 1 + Math.floor(Math.random() * 99999); }
    resize();
    setModel(S.view.model);
    sky.set(S.sky);
    buildGui();
    newLevel();
    frame();
  });

  window.GAME = { fx: fx, run: function() { return run; }, worlds: function() { return worlds; }, step: function(dt, c) { step(dt, c); }, midi: midi, pad: pad, S: function() { return S; }, configJSON: configJSON, load: load, setModel: setModel, modelInUse: function() { return MI.using; }, dragon: function() { return dragon; }, restart: restart, flight: function() { return fl; }, course: function() { return co; },
                  level: function() { return L; }, camera: camera, kb: kb };
})();
