// A play session: stages (levelgen/stages.js) built ahead of the
// dragon and dropped behind it, one collision function across them, the
// hoops of all built stages, and the finish.  Pure maths (no three.js):
// the game draws stages through onBuild / onDrop, and node tests fly
// whole sessions.
//
//   var run = new DR.Run(sessionOptions, palettes, { minutes: 15 });
//   run.ensure(z, elapsed, avgSpeed);   // each frame (builds / drops)
//   run.sdf(x, y, z)                    // signed distance to any solid
//   run.update(a, b)                    // movement -> events
//   run.target()                        // next hoop or finish, or null
//
// The finish: once the session's target time would be reached by the
// end of a stage being built (at the recent average speed), that stage
// is the last one: it ends in the finish ring and a closed valley end.
// minutes 0 = endless.
//
(function(root) {
  var LG = root.LevelGen || require("../levelgen/levelgen.js");
  if (!LG.Session) { require("../levelgen/stages.js"); }
  var CO = ( root.DR && root.DR.Course ) ? root.DR : require("./course.js");

  function Run(opts, palettes, o) {
    this.gen     = new LG.Session(opts, palettes);
    this.L       = this.gen.L;
    this.minutes = ( (o && o.minutes) || 0 );
    this.stages  = {};
    this.final   = -1;
    this.taken   = 0;
    this.seen    = 0;
    this.cur     = 0;
    this.lastK   = -1;
    this.lastHoop = null;
    this.finished = false;
    this.onBuild = null;
    this.onDrop  = null;
  }

  Run.prototype.build = function(k, elapsed, z, speed) {
    if ( (this.final >= 0) && (k > this.final) ) { return null; }
    var fin = false;
    if ( (this.minutes > 0) && (this.final < 0) && (k > 0) ) {
      var eta = elapsed + ((((k + 1) * this.L) - z) / Math.max(speed, 8));
      if (eta >= (this.minutes * 60)) { fin = true;  this.final = k; }
    }
    var st = this.gen.stage(k, fin);
    st.course = new CO.Course(st);
    this.seen += st.hoops.length;
    this.stages[k] = st;
    if (this.onBuild) { this.onBuild(st); }
    return st;
  };

  // Keep the previous and current stages, and the next one (below).
  //
  Run.prototype.ensure = function(z, elapsed, speed) {
    var k = Math.max(0, Math.floor(z / this.L)), self = this;
    this.cur = k;
    for (var j = Math.max(0, k - 1); j <= k; j++) {
      if (!this.stages[j]) { this.build(j, elapsed || 0, z, speed || 20); }
    }

    // The next stage once 30% into this one: by then the average speed
    // is known, so the finish lands near the target time.
    //
    if ( !this.stages[k + 1] && ((z - (k * this.L)) > (0.3 * this.L)) ) { this.build(k + 1, elapsed || 0, z, speed || 20); }
    Object.keys(this.stages).forEach(function(key) {
      if (+key < (k - 1)) {
        if (self.onDrop) { self.onDrop(self.stages[key]); }
        delete self.stages[key];
      }
    });
    return this.stages[k];
  };

  Run.prototype.stageAt = function(z) { return this.stages[Math.max(0, Math.floor(z / this.L))] || null; };

  // Solid distance: the stage under the point, and its neighbour too
  // within 40 of a join.
  //
  Run.prototype.sdf = function(x, y, z) {
    var k = Math.max(0, Math.floor(z / this.L)), st = this.stages[k], d = ( st ? st.sdf(x, y, z) : 1e3 ), t = z - (k * this.L);
    if ( (t < 40) && this.stages[k - 1] ) { d = Math.min(d, this.stages[k - 1].sdf(x, y, z)); }
    if ( (t > (this.L - 40)) && this.stages[k + 1] ) { d = Math.min(d, this.stages[k + 1].sdf(x, y, z)); }
    return d;
  };

  Run.prototype.height = function(x, z) {
    var st = this.stageAt(z);
    return ( st ? st.sdf.height(x, z) : 0 );
  };

  Run.prototype.update = function(a, b) {
    var out = [], self = this;
    Object.keys(this.stages).forEach(function(key) {
      var st = self.stages[key];
      st.course.update(a, b).forEach(function(e) {
        e.stage = st;
        if (e.hoop !== undefined) { self.taken++;  self.lastHoop = st.hoops[e.hoop]; }
        if (e.finish) { self.finished = true; }
        out.push(e);
      });
    });
    return out;
  };

  // Next hoop: in the current stage, else the first of the next.
  //
  Run.prototype.target = function() {
    for (var k = this.cur; k <= (this.cur + 1); k++) {
      var st = this.stages[k];
      if (!st) { continue; }
      var t = st.course.target();
      if (t) { return t; }
    }
    return null;
  };

  // Respawn just behind the last hoop taken, or at the start.
  //
  Run.prototype.respawn = function() {
    var h = this.lastHoop;
    if (!h) { return this.stages[0] ? this.stages[0].start : null; }
    return { p: [h.p[0] - (h.n[0] * 4), h.p[1] - (h.n[1] * 4), h.p[2] - (h.n[2] * 4)], n: h.n };
  };

  // One fixed level (a loaded level JSON or LevelGen.generate) with the
  // same interface as Run.
  //
  function SingleRun(level) {
    level.sdf    = LG.sdf(level);
    level.stage  = 0;
    level.course = new CO.Course(level);
    this.level   = level;
    this.L       = 1e9;
    this.stages  = { 0: level };
    this.final   = 0;
    this.minutes = 0;
    this.taken   = 0;
    this.seen    = level.hoops.length;
    this.cur     = 0;
    this.lastHoop = null;
    this.finished = false;
    this.onBuild = null;
    this.onDrop  = null;
    this.built   = false;
  }
  SingleRun.prototype.ensure = function() {
    if ( !this.built && this.onBuild ) { this.built = true;  this.onBuild(this.level); }
    return this.level;
  };
  SingleRun.prototype.stageAt = function() { return this.level; };
  SingleRun.prototype.sdf     = function(x, y, z) { return this.level.sdf(x, y, z); };
  SingleRun.prototype.height  = function(x, z) { return this.level.sdf.height(x, z); };
  SingleRun.prototype.update  = Run.prototype.update;
  SingleRun.prototype.target  = Run.prototype.target;
  SingleRun.prototype.respawn = Run.prototype.respawn;

  var DRR = { Run: Run, SingleRun: SingleRun };
  if (root.DR) { Object.assign(root.DR, DRR); }
  else         { root.DR = DRR; }
  if ((typeof module !== "undefined") && module.exports) { module.exports = DRR; }

})(typeof window !== "undefined" ? window : globalThis);
