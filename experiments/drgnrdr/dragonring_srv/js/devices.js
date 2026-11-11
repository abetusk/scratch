// Input devices beyond the keyboard: a MIDI pedal sensor and a gamepad.
// Both feed the same controls as the keyboard (js/input.js): pedal
// strokes go into the keyboard's Pedal (so cadence, thrust and the wing
// beat follow them), steering adds to the keyboard's.
//
// MIDI: each matching note-on is one sensor pulse (the BikeMidi
// firmware sends note 60 on channel 1 each time the crank magnet
// passes).  A pulse counts as 'strokesPerPulse' pedal strokes for the
// cadence (2: one crank turn is two pedal strokes) and as one wing
// beat.  Uses the Web MIDI API: Chrome / Edge; Firefox only with its
// site-permission prompt on an http(s) page.
//
// Gamepad: the browser's standard mapping (PlayStation / Xbox layout):
//   axes    0, 1 left stick x, y      2, 3 right stick x, y
//   buttons 0 cross / A   1 circle / B   2 square / X   3 triangle / Y
//           4 L1  5 R1  6 L2  7 R2  8 share / back  9 options / start
//           12-15 d-pad up, down, left, right
// Defaults: left stick steers (pull back = nose up), cross or R2 pedals
// (each press one stroke), right stick and L1 / R1 force-move,
// triangle back to last hoop, options / start restart (a new session),
// share pause, L3 (left stick press) fullscreen.
//
(function() {
  var DR = window.DR = window.DR || {};

  var MIDI_DEFAULTS = { enabled: true, source: "auto", device: "", note: 60, channel: 1, strokesPerPulse: 2 };
  var PAD_DEFAULTS  = { enabled: true, deadzone: 0.15, turnAxis: 0, climbAxis: 1, invertTurn: false, invertClimb: false,
                        forceXAxis: 2, forceZAxis: 3, pedal: [0, 7], forceUp: [5], forceDown: [4],
                        forceBoost: [6], reset: [3], restart: [9], pause: [8], fullscreen: [10] };

  // Names for the panel (standard layout).
  //
  var BUTTON_NAMES = ["cross / A", "circle / B", "square / X", "triangle / Y", "L1", "R1", "L2", "R2", "share / back",
                      "options / start", "L3 (left stick)", "R3 (right stick)", "d-pad up", "d-pad down", "d-pad left",
                      "d-pad right", "home / PS"];
  var AXIS_NAMES   = ["left stick x", "left stick y", "right stick x", "right stick y"];
  var ACTIONS      = { pedal: "pedal", forceUp: "force move up", forceDown: "force move down", forceBoost: "force move faster (hold)", reset: "back to last hoop",
                       restart: "restart (new session)", pause: "pause", fullscreen: "fullscreen" };

  // ---------------------------------------------------------------- MIDI

  function Midi(cfg, kb) {
    this.cfg    = cfg;
    this.kb     = kb;
    this.status = "not started";
    this.pulses = 0;
    this.last   = null;
    this.access = null;
    this.devices = [];
    this.lastMsg = "none yet";
    this.learn   = null;
    this.onDevices = null;
  }

  // Sources: 'bridge' (tools/serve.py streams notes read with aseqdump
  // as Server-Sent Events at /midi: no browser permission needed),
  // 'webmidi' (the browser's Web MIDI), or 'auto' (the bridge when the
  // page is served by tools/serve.py, otherwise Web MIDI).
  //
  Midi.prototype.start = function() {
    var self = this;
    if (!this.cfg.enabled) { this.status = "off";  return; }
    if ( (this.cfg.source !== "webmidi") && (location.protocol !== "file:") && window.EventSource ) {
      if (this.bridge) { return; }
      this.status = "connecting to the MIDI bridge";
      var es = new EventSource("midi"), opened = false;
      this.bridge = es;
      es.onmessage = function(e) {
        opened = true;
        var w = e.data.split(" ");
        if (w[0] === "status") { self.status = "bridge: " + e.data.slice(7);  return; }
        var t = ( (w[0] === "on") ? 0x90 : 0x80 ) | ((parseInt(w[1], 10) - 1) & 15);
        self.message({ data: new Uint8Array([t, parseInt(w[2], 10), parseInt(w[3], 10)]), target: { name: "bridge" } });
      };
      es.onerror = function() {
        if (opened) { self.status = "bridge connection lost; retrying";  return; }
        es.close();
        self.bridge = null;
        if (self.cfg.source === "bridge") { self.status = "no MIDI bridge here (start the page with: python3 tools/serve.py)";  return; }
        self.cfg.source = "webmidi";
        self.start();
        self.cfg.source = "auto";
      };
      return;
    }
    if (!navigator.requestMIDIAccess) {
      this.status = ( (location.protocol === "file:")
                      ? "no Web MIDI on a file:// page in this browser: serve the folder and open http://localhost (see README)"
                      : "this browser has no Web MIDI (use Firefox with dom.webmidi.enabled, Chrome or Edge)" );
      return;
    }
    this.status = "asking for MIDI access (accept the browser's prompt)";
    navigator.requestMIDIAccess({ sysex: false }).then(function(access) {
      self.access = access;
      access.onstatechange = function() { self.attach(); };
      self.attach();
    }, function(e) {
      self.status = "MIDI access refused: " + ( (e && e.message) ? e.message : String(e) ) +
                    " (press a key, click the page, or 'connect / rescan' to ask again; Firefox: accept the add-on prompt," +
                    " and have the sensor plugged in before starting Firefox)";
    });
  };

  // Listen on every input (devices plugged in later are picked up by
  // onstatechange).
  //
  Midi.prototype.attach = function() {
    var self = this, names = [];
    this.access.inputs.forEach(function(inp) {
      inp.onmidimessage = function(e) { self.message(e); };
      names.push(inp.name);
    });
    this.devices = names;
    this.status = ( names.length ? "inputs: " + names.join(", ")
                                 : "MIDI allowed but no inputs visible (plug in the sensor; Snap Firefox: sudo snap connect firefox:alsa)" );
    if (this.onDevices) { this.onDevices(names); }
  };

  // Every message is shown in the panel; note-ons that match the
  // device, channel and note are pulses.  While learning, the next
  // note-on sets the note and channel instead.
  //
  Midi.prototype.message = function(e) {
    var d = e.data, c = this.cfg, src = ( (e.target && e.target.name) ? e.target.name : "?" );
    if ( !c.enabled || (d.length < 3) ) { return; }
    var type = d[0] & 0xF0, ch = (d[0] & 0x0F) + 1,
        kind = { 0x80: "note off", 0x90: "note on", 0xB0: "control", 0xE0: "pitch bend" }[type] || ("0x" + type.toString(16));
    this.lastMsg = kind + " " + d[1] + ", channel " + ch + ", value " + d[2] + " (" + src + ")";
    if ( (type !== 0x90) || (d[2] === 0) ) { return; }
    if ( c.device && (src !== c.device) && (src !== "bridge") ) { return; }
    if (this.learn) {
      c.note = d[1];
      c.channel = ch;
      var cb = this.learn;
      this.learn = null;
      cb();
      return;
    }
    if ( (c.channel > 0) && (ch !== c.channel) ) { return; }
    if ( (c.note >= 0) && (d[1] !== c.note) ) { return; }
    this.pulses++;
    // Browser clock, not the event's own time stamp: its time base
    // differs between browsers.
    //
    this.last = performance.now() / 1000;
    this.kb.stroke(this.last, c.strokesPerPulse);
  };

  Midi.prototype.describe = function(now) {
    if (this.last === null) { return this.status; }
    return this.status + "; " + this.pulses + " pulses, last " + (now - this.last).toFixed(1) + " s ago";
  };

  // ---------------------------------------------------------------- gamepad

  function Gamepad(cfg, kb) {
    this.cfg    = cfg;
    this.kb     = kb;
    this.prev   = {};
    this.status = "press any button on the controller";
    this.live   = "";
    this.learn  = null;
    var self = this;
    window.addEventListener("gamepadconnected", function(e) { self.status = "connected: " + e.gamepad.id; });
    window.addEventListener("gamepaddisconnected", function() { self.status = "disconnected"; });
  }

  function dz(v, d) {
    var a = Math.abs(v);
    return ( (a < d) ? 0 : Math.sign(v) * ((a - d) / (1 - d)) );
  }

  // The first connected pad with the standard layout (or any pad).
  //
  Gamepad.prototype.pad = function() {
    var list = ( navigator.getGamepads ? navigator.getGamepads() : [] ), any = null;
    for (var i = 0; i < list.length; i++) {
      var g = list[i];
      if (!g || !g.connected) { continue; }
      if (g.mapping === "standard") { return g; }
      any = any || g;
    }
    return any;
  };

  // Poll once per frame: fires button actions on press (not hold) and
  // returns the analogue part of the controls.
  //
  Gamepad.prototype.poll = function(t) {
    var c = this.cfg, out = { turn: 0, climb: 0, force: [0, 0, 0], boost: false }, self = this;
    var g = this.pad();
    if (!g) { return out; }
    var down = [], ax = [];
    g.buttons.forEach(function(b, i) { if (b.pressed || (b.value > 0.5)) { down.push(i); } });
    g.axes.forEach(function(v, i) { if (Math.abs(v) > 0.3) { ax.push(i + ": " + v.toFixed(2)); } });
    this.live = "buttons [" + down.join(", ") + "]  axes [" + ax.join(", ") + "]";

    // Learning: the first button newly pressed is assigned.
    //
    if (this.learn) {
      var fresh = down.filter(function(i) { return !self.wasDown || (self.wasDown.indexOf(i) < 0); });
      this.wasDown = down;
      if (fresh.length) {
        var L = this.learn;
        this.learn = null;
        L(fresh[0]);
      }
      return out;
    }
    this.wasDown = down;
    if (!c.enabled) { return out; }
    function axis(i) { return ( (i >= 0) && (i < g.axes.length) ) ? dz(g.axes[i], c.deadzone) : 0; }
    function held(list) {
      return list.some(function(i) { return ( (i < g.buttons.length) && (g.buttons[i].pressed || (g.buttons[i].value > 0.5)) ); });
    }
    function pressed(name) {
      var now = held(c[name]), was = !!self.prev[name];
      self.prev[name] = now;
      return ( now && !was );
    }

    // Stick right = turn right (turn > 0 is left); pull back = nose up.
    //
    out.turn  = -axis(c.turnAxis) * ( c.invertTurn ? -1 : 1 );
    out.climb = axis(c.climbAxis) * ( c.invertClimb ? -1 : 1 );
    out.force = [-axis(c.forceXAxis), ( held(c.forceUp) ? 1 : 0 ) - ( held(c.forceDown) ? 1 : 0 ), -axis(c.forceZAxis)];
    out.boost = held(c.forceBoost || []);

    if (pressed("pedal")) { this.kb.stroke(t, 1); }
    ["reset", "restart", "pause", "fullscreen"].forEach(function(a) { if ( pressed(a) && self.kb.onPress ) { self.kb.onPress(a); } });
    this.status = "connected: " + g.id;
    return out;
  };

  DR.MIDI_DEFAULTS = MIDI_DEFAULTS;
  DR.PAD_DEFAULTS  = PAD_DEFAULTS;
  DR.Midi          = Midi;
  DR.PAD_BUTTONS   = BUTTON_NAMES;
  DR.PAD_AXES      = AXIS_NAMES;
  DR.PAD_ACTIONS   = ACTIONS;
  DR.Gamepad       = Gamepad;
})();
