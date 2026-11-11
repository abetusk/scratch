// Wing beat locked to the pedal presses.
//
// The wings flap continuously at the predicted press rate; each press
// only nudges their timing.  Phase runs 0..1 per beat, 0 = top of the
// beat, so a press lands at the top and the downstroke starts with it.
//
// - Rate: smoothed mean of recent press intervals, limited to
//   MIN_IV..MAX_IV (about 0.4 to 3 presses per second).
// - Timing: at each press the phase error (how far the wings are from
//   the top, -0.5..0.5 beat) is added to a correction that is applied
//   smoothly over about a tenth of a second, a share GAIN of it per
//   press, so the beat settles into the rhythm without jumps.
// - The interval estimate also shifts by the part of the error that
//   is consistent from press to press (a slow frequency correction).
// - A late press: the wings wait at the top (up to HOLD intervals
//   after the last press) instead of sweeping on, so the press still
//   starts the downstroke.
// - With no press for STOP intervals, 'amp' eases to 0 (glide) and
//   the phase drifts on slowly.
//
//   var w = new DR.WingSync();
//   w.press();                  // on each pedal press
//   w.update(dt) -> { phase, amp }
//
// Plain math: also runs in node for tests.
//
(function(root) {

  var MIN_IV = 0.33, MAX_IV = 2.5, FIRST_IV = 0.6, GAIN = 0.6, STOP = 1.8, HOLD = 1.35;

  function wrap(x) { return x - Math.round(x); }

  function WingSync() {
    this.t      = 0;
    this.last   = null;
    this.iv     = null;
    this.phase  = 0.3;
    this.corr   = 0;
    this.amp    = 0;
    this.active = false;
  }

  WingSync.prototype.press = function() {
    var t = this.t;
    if (this.last !== null) {
      var d = t - this.last;

      // Ignore key bounce; a long gap starts a new rhythm.
      //
      if (d < (MIN_IV * 0.6)) { return; }
      if (d <= MAX_IV) {
        this.iv = ( (this.iv === null) ? d : (this.iv * 0.4) + (d * 0.6) );
        this.iv = Math.min(MAX_IV, Math.max(MIN_IV, this.iv));
      }
      else {
        this.iv = null;
      }
    }
    this.last = t;

    // Waiting at the top: release straight into the downstroke.
    //
    if (this.phase >= 0.999) { this.phase = 0; }
    var err = wrap(-this.phase);
    if (!this.active) {

      // From a glide: go straight to the top (amp is near 0, so the
      // jump does not show).
      //
      this.phase  = 0;
      this.corr   = 0;
      this.active = true;
    }
    else {
      this.corr = (this.corr * 0.3) + (err * GAIN);
      if (this.iv !== null) { this.iv = Math.min(MAX_IV, Math.max(MIN_IV, this.iv * (1 - (err * 0.5)))); }
    }
  };

  WingSync.prototype.update = function(dt) {
    this.t += dt;
    var iv = ( (this.iv !== null) ? this.iv : FIRST_IV );
    if ( this.active && ((this.last === null) || ((this.t - this.last) > (iv * STOP))) ) { this.active = false; }

    var c = this.corr * (1 - Math.exp(-dt * 10));
    this.phase += c;
    this.corr  -= c;
    var step = dt * ( this.active ? (1 / iv) : 0.15 );

    // Late press: rather than sweep on past the top, wait there (up to
    // HOLD intervals after the last press) for the press to arrive.
    //
    if ( this.active && ((this.phase + step) >= 1) && ((this.t - this.last) < (iv * HOLD)) ) {
      this.phase = Math.max(this.phase, 0.999);
    }
    else {
      this.phase += step;
    }
    this.phase -= Math.floor(this.phase);

    this.amp += (( this.active ? 1 : 0 ) - this.amp) * (1 - Math.exp(-dt * ( this.active ? 8 : 2 )));
    return { phase: this.phase, amp: this.amp };
  };

  // Downstroke share of the beat: the stroke is quicker than the
  // recovery.  Maps phase 0..1 to 0..1 of a symmetric beat
  // (0 top, 0.5 bottom).
  //
  var DOWN = 0.42;
  function shape(p) {
    return ( (p < DOWN) ? (0.5 * p / DOWN) : (0.5 + (0.5 * (p - DOWN) / (1 - DOWN))) );
  }

  var W = { WingSync: WingSync, wingShape: shape };
  if (root.DR) { Object.assign(root.DR, W); }
  else         { root.DR = W; }
  if ((typeof module !== "undefined") && module.exports) { module.exports = W; }

})(typeof window !== "undefined" ? window : globalThis);
