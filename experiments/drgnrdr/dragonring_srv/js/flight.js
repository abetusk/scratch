// Flight model and collision.  Pure math (no three.js), so it also
// runs in node for tests.
//
// The rider steers heading (yaw) and nose angle (pitch); pedalling
// sets thrust, and thrust sets the cruising speed along the heading.
// Below 'liftSpeed' the dragon sinks, up to 'sinkMax'.  The velocity
// follows the heading with some lag, which is what lets a bump knock
// the dragon sideways for a moment.
//
// Collision: the dragon is a sphere of 'radius' in a signed-distance
// world.  On contact it is pushed out along the surface normal, the
// part of the velocity into the surface bounces back (scaled by
// 'bounce'), and the speed drops by up to 'hitSlow' for a head-on hit,
// little for a graze.  Steering is never blocked, so turning away
// always works.
//
// Force move ignores collision while held (the dragon passes through
// solids); on release it is eased back out of anything solid.
//
(function(root) {

  var PARAMS = {
    radius     : 3,
    vMax       : 36,
    cadFull    : 150,
    spinUp     : 1.4,
    coast      : 3.5,
    turnRate   : 1.5,
    pitchRate  : 1.3,
    pitchMax   : 0.8,
    loops      : false,
    pitchLevel : 1.2,
    liftSpeed  : 10,
    sinkMax    : 5,
    follow     : 5,
    bounce     : 0.4,
    hitSlow    : 0.6,
    scrape     : 0.5,
    forceSpeed : 14,
    forceBoost : 8
  };

  function clamp(x, a, b) { return ( (x < a) ? a : ( (x > b) ? b : x ) ); }

  function Flight(sdf, params) {
    this.sdf     = sdf;
    this.P       = Object.assign({}, PARAMS, params || {});
    this.pos     = [0, 0, 0];
    this.vel     = [0, 0, 0];
    this.yaw     = 0;
    this.pitch   = 0;
    this.speed   = 0;
    this.turn    = 0;
    this.contact = 0;
    this.hit     = 0;
    this.ghost   = false;
    this.hold    = true;
    this.loopDir = 0;
  }

  Flight.prototype.place = function(p, n) {
    this.pos   = p.slice();
    this.yaw   = Math.atan2(n[0], n[2]);
    this.pitch = 0;
    this.speed = 0;
    this.vel   = [0, 0, 0];
  };

  // The dragon's up direction (perpendicular to forward, in the
  // vertical plane of the heading): upside down at the top of a loop.
  //
  Flight.prototype.up = function() {
    var s = Math.sin(this.pitch), c = Math.cos(this.pitch);
    return [-Math.sin(this.yaw) * s, c, -Math.cos(this.yaw) * s];
  };

  Flight.prototype.forward = function() {
    var c = Math.cos(this.pitch);
    return [Math.sin(this.yaw) * c, Math.sin(this.pitch), Math.cos(this.yaw) * c];
  };

  Flight.prototype.normal = function(x, y, z) {
    var f = this.sdf, e = 0.25,
        nx = f(x + e, y, z) - f(x - e, y, z),
        ny = f(x, y + e, z) - f(x, y - e, z),
        nz = f(x, y, z + e) - f(x, y, z - e),
        l  = Math.sqrt((nx * nx) + (ny * ny) + (nz * nz)) || 1;
    return [nx / l, ny / l, nz / l];
  };

  // Push the sphere out of solids; returns the strongest head-on
  // factor (0 = graze, 1 = straight in) of this step's contacts.
  //
  Flight.prototype.collide = function() {
    var P = this.P, p = this.pos, v = this.vel, worst = 0;
    for (var it = 0; it < 4; it++) {
      var d = this.sdf(p[0], p[1], p[2]);
      if (d >= P.radius) { break; }
      var n  = this.normal(p[0], p[1], p[2]),
          vn = (v[0] * n[0]) + (v[1] * n[1]) + (v[2] * n[2]);
      p[0] += n[0] * (P.radius - d + 0.01);
      p[1] += n[1] * (P.radius - d + 0.01);
      p[2] += n[2] * (P.radius - d + 0.01);
      if (vn < 0) {
        var vl = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2])) || 1;
        worst = Math.max(worst, -vn / vl);
        v[0] -= n[0] * vn * (1 + P.bounce);
        v[1] -= n[1] * vn * (1 + P.bounce);
        v[2] -= n[2] * vn * (1 + P.bounce);
      }

      // Touching the ground nose-down: level out so the dragon skims
      // instead of grinding.
      //
      if ( (n[1] > 0.6) && (this.pitch < 0) && (this.pitch > -1.4) ) { this.pitch *= 0.5; }
    }
    return worst;
  };

  // One frame.  'c' is from DR.Keyboard.read: cadence, turn, climb,
  // force.
  //
  Flight.prototype.step = function(dt, c) {
    var P = this.P, p = this.pos, v = this.vel,
        f = c.force, forcing = ( (f[0] !== 0) || (f[1] !== 0) || (f[2] !== 0) );

    this.turn  += (c.turn - this.turn) * (1 - Math.exp(-dt * 6));
    this.yaw   += this.turn * P.turnRate * dt;
    // Pitch is free all the way round (loop-de-loops).  Without input:
    // near level the nose eases back to level; past vertical the loop
    // carries on at the pitch rate until level again.  With 'loops'
    // off, pitch stops at pitchMax.
    //
    // The loop's direction is set when the nose passes vertical and kept
    // through the top, where pitch wraps from +pi to -pi.
    //
    var hp = Math.PI / 2;
    if (Math.abs(this.pitch) <= hp) { this.loopDir = 0; }
    else if (!this.loopDir)         { this.loopDir = Math.sign(this.pitch); }
    if (c.climb !== 0)              { this.pitch += c.climb * P.pitchRate * dt; }
    else if (this.loopDir)          { this.pitch += this.loopDir * P.pitchRate * dt; }
    else                            { this.pitch -= this.pitch * Math.min(1, P.pitchLevel * dt); }
    if (P.loops) {
      if (this.pitch > Math.PI)   { this.pitch -= 2 * Math.PI; }
      if (this.pitch < -Math.PI)  { this.pitch += 2 * Math.PI; }
    }
    else {
      this.pitch = clamp(this.pitch, -P.pitchMax, P.pitchMax);
    }

    if (forcing) {
      var sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
      var fs = P.forceSpeed * ( c.boost ? P.forceBoost : 1 );
      p[0] += ((f[0] * cy) + (f[2] * sy)) * fs * dt;
      p[1] += f[1] * fs * dt;
      p[2] += ((-f[0] * sy) + (f[2] * cy)) * fs * dt;
      v[0] = v[1] = v[2] = 0;
      this.speed = Math.min(this.speed, 4);
      this.ghost = true;
      return;
    }

    // After a force move, ease out of solids instead of jumping.
    //
    if (this.ghost) {
      var d0 = this.sdf(p[0], p[1], p[2]);
      if (d0 < P.radius) {
        var n0 = this.normal(p[0], p[1], p[2]), m = Math.min(P.radius - d0, 25 * dt);
        p[0] += n0[0] * m;  p[1] += n0[1] * m;  p[2] += n0[2] * m;
        return;
      }
      this.ghost = false;
    }

    var thrust = clamp(c.cadence / P.cadFull, 0, 1.3),
        target = thrust * P.vMax,
        tau    = ( (target > this.speed) ? P.spinUp : P.coast );
    this.speed += (target - this.speed) * (1 - Math.exp(-dt / tau));

    // Before the first pedal stroke the dragon hovers at the start.
    //
    if (this.hold) {
      if (c.cadence > 1) { this.hold = false; }
      else               { return; }
    }

    var fw   = this.forward(),
        sink = P.sinkMax * (1 - clamp(this.speed / P.liftSpeed, 0, 1)),
        k    = 1 - Math.exp(-P.follow * dt);
    v[0] += ((fw[0] * this.speed) - v[0]) * k;
    v[1] += ((fw[1] * this.speed) - sink - v[1]) * k;
    v[2] += ((fw[2] * this.speed) - v[2]) * k;

    var vl = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2])),
        ns = Math.max(1, Math.ceil((vl * dt) / 0.5)),
        h  = dt / ns, hit = 0, touching = false;
    for (var s = 0; s < ns; s++) {
      p[0] += v[0] * h;  p[1] += v[1] * h;  p[2] += v[2] * h;
      var w = this.collide();
      hit = Math.max(hit, w);
      if (this.sdf(p[0], p[1], p[2]) < (P.radius + 0.05)) { touching = true; }
    }
    if (hit > 0) { this.speed *= 1 - (P.hitSlow * hit); }
    if (touching) { this.speed *= 1 - Math.min(1, P.scrape * dt); }
    this.hit     = Math.max(hit, this.hit - (dt * 2));
    this.contact = ( touching ? this.contact + dt : 0 );
  };

  var DRF = { PARAMS: PARAMS, Flight: Flight };
  if (root.DR) { Object.assign(root.DR, DRF); }
  else         { root.DR = DRF; }
  if ((typeof module !== "undefined") && module.exports) { module.exports = DRF; }

})(typeof window !== "undefined" ? window : globalThis);
