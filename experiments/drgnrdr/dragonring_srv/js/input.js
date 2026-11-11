// Keyboard input.
//
// The pedal is a stream of strokes: each press of the pedal key is one
// stroke (key auto-repeat is ignored, so holding the key does nothing).
// DR.Pedal turns stroke times into a cadence, strokes per minute.  An
// exercise-bike sensor would replace the keyboard as the source of
// strokes, or give the cadence directly; the flight model only reads
// the cadence.
//
(function() {
  var DR = window.DR = window.DR || {};

  var KEYS = {
    pedal   : ["ArrowUp", "Space"],
    up      : ["KeyW"],
    down    : ["KeyS"],
    left    : ["KeyA", "ArrowLeft"],
    right   : ["KeyD", "ArrowRight"],
    fFwd    : ["KeyI"],
    fBack   : ["KeyK"],
    fLeft   : ["KeyJ"],
    fRight  : ["KeyL"],
    fUp     : ["KeyU"],
    fDown   : ["KeyO"],
    fBoost  : ["ShiftLeft", "ShiftRight"],
    reset   : ["KeyR"],
    restart : ["Enter"],
    pause   : ["KeyP", "Escape"],
    fullscreen : ["KeyF"]
  };

  var LABELS = {
    pedal   : "pedal (tap)",
    up      : "nose up",
    down    : "nose down",
    left    : "turn left",
    right   : "turn right",
    fFwd    : "force move forward",
    fBack   : "force move back",
    fLeft   : "force move left",
    fRight  : "force move right",
    fUp     : "force move up",
    fDown   : "force move down",
    fBoost  : "force move faster (hold)",
    reset   : "back to last hoop",
    restart : "restart run",
    pause   : "pause",
    fullscreen : "fullscreen"
  };

  // Short display name for a KeyboardEvent.code.
  //
  function keyName(code) {
    var A = { ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right", Escape: "Esc" };
    if (A[code]) { return A[code]; }
    return code.replace(/^Key/, "").replace(/^Digit/, "").replace(/^Numpad/, "Num ");
  }

  function Pedal() {
    this.times   = [];
    this.weights = [];
    this.cad     = 0;
  }

  // 'w' how many strokes this event stands for (a crank sensor pulse
  // once per turn is 2); the cadence is in strokes per minute.
  //
  Pedal.prototype.stroke = function(t, w) {
    this.times.push(t);
    this.weights.push(( (w === undefined) ? 1 : w ));
    if (this.times.length > 6) { this.times.shift();  this.weights.shift(); }
  };

  // Cadence from the mean interval of the last few strokes.  If the
  // next stroke is overdue, the cadence falls as if it came now, so
  // stopping slows the dragon at once rather than after a timeout.
  //
  Pedal.prototype.update = function(t, dt) {
    var T = this.times, n = T.length, raw = 0;
    if (n >= 2) {
      var k     = Math.min(n - 1, 4),
          iv    = (T[n - 1] - T[n - 1 - k]) / k,
          since = t - T[n - 1];
      raw = ( (since > 3) ? 0 : (60 * this.weights[n - 1]) / Math.max(iv, since, 0.08) );
    }
    else if ( (n === 1) && ((t - T[0]) < 1) ) {
      raw = 40 * this.weights[0];
    }
    this.cad += (raw - this.cad) * (1 - Math.exp(-dt / 0.35));
    return this.cad;
  };

  // 'keys': action -> list of KeyboardEvent.code, read live, so the
  // remap panel can change it in place.  'enabled' false ignores all
  // keys (while the remap panel listens).
  //
  function Keyboard(keys) {
    var self = this;
    this.keys    = keys || JSON.parse(JSON.stringify(KEYS));
    this.enabled = true;
    this.down    = {};
    this.pedal   = new Pedal();
    this.onPress = null;

    function act(code) {
      for (var k in self.keys) {
        if (self.keys[k].indexOf(code) >= 0) { return k; }
      }
      return null;
    }

    window.addEventListener("keydown", function(e) {
      if (!self.enabled) { return; }
      var a = act(e.code);
      if (!a) { return; }
      if ( (e.target.tagName === "INPUT") || (e.target.tagName === "SELECT") ) { return; }
      e.preventDefault();
      if (e.repeat) { return; }
      self.down[a] = true;
      if (a === "pedal") { self.stroke(performance.now() / 1000, 1);  return; }
      if (self.onPress) { self.onPress(a); }
    });
    window.addEventListener("keyup", function(e) {
      var a = act(e.code);
      if (a) { self.down[a] = false; }
    });
    window.addEventListener("blur", function() { self.down = {}; });
  }

  // One pedal stroke from any source (keys, MIDI sensor, gamepad).
  //
  Keyboard.prototype.stroke = function(t, w) {
    this.pedal.stroke(t, w);
    if (this.onPress) { this.onPress("pedal"); }
  };

  // Controls for one frame: cadence, steering in -1..1 (turn > 0 is
  // left, climb > 0 is nose up), and the force-move vector in the
  // dragon's frame (x left, y up, z forward).
  //
  Keyboard.prototype.read = function(t, dt, invert) {
    var d = this.down;
    function ax(a, b) { return ( (d[a] ? 1 : 0) - (d[b] ? 1 : 0) ); }
    return {
      cadence : this.pedal.update(t, dt),
      turn    : ax("left", "right"),
      climb   : ax("up", "down") * ( invert ? -1 : 1 ),
      force   : [ax("fLeft", "fRight"), ax("fUp", "fDown"), ax("fFwd", "fBack")],
      boost   : !!d.fBoost
    };
  };

  DR.KEYS     = KEYS;
  DR.LABELS   = LABELS;
  DR.keyName  = keyName;
  DR.Pedal    = Pedal;
  DR.Keyboard = Keyboard;
})();
