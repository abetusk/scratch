// Hoops and finish: which have been flown through, which is next.
// Pure math (no three.js).
//
// A hoop counts when the dragon's centre crosses the hoop's plane
// inside its radius (plus 'slack').  Any hoop counts, in any order;
// 'next' is the first one not yet taken after the last one taken.
//
(function(root) {

  function Course(level, slack) {
    this.hoops  = level.hoops;
    this.finish = level.finish;
    this.slack  = ( (slack === undefined) ? 1 : slack );
    this.reset();
  }

  Course.prototype.reset = function() {
    this.taken    = this.hoops.map(function() { return false; });
    this.count    = 0;
    this.last     = -1;
    this.next     = 0;
    this.finished = false;
  };

  function crosses(h, a, b, slack) {
    var n  = h.n, c = h.p,
        da = ((a[0] - c[0]) * n[0]) + ((a[1] - c[1]) * n[1]) + ((a[2] - c[2]) * n[2]),
        db = ((b[0] - c[0]) * n[0]) + ((b[1] - c[1]) * n[1]) + ((b[2] - c[2]) * n[2]);
    if ( (da > 0) || (db < 0) || (da === db) ) { return false; }
    var t = da / (da - db),
        x = a[0] + ((b[0] - a[0]) * t) - c[0],
        y = a[1] + ((b[1] - a[1]) * t) - c[1],
        z = a[2] + ((b[2] - a[2]) * t) - c[2];
    return Math.sqrt((x * x) + (y * y) + (z * z)) < (h.r + slack);
  }

  // Movement from a to b this frame; returns a list of events:
  // { hoop: i } and { finish: true }.
  //
  Course.prototype.update = function(a, b) {
    var ev = [];
    if (this.finished) { return ev; }
    for (var i = 0; i < this.hoops.length; i++) {
      if ( !this.taken[i] && crosses(this.hoops[i], a, b, this.slack) ) {
        this.taken[i] = true;
        this.count++;
        this.last = Math.max(this.last, i);
        ev.push({ hoop: i });
      }
    }
    var nx = this.last + 1;
    while ( (nx < this.hoops.length) && this.taken[nx] ) { nx++; }
    this.next = nx;
    if ( this.finish && crosses(this.finish, a, b, this.slack) ) {
      this.finished = true;
      ev.push({ finish: true });
    }
    return ev;
  };

  // Where 'next' points: the next hoop, or the finish (null when the
  // stage has neither left).
  //
  Course.prototype.target = function() {
    return ( (this.next < this.hoops.length) ? this.hoops[this.next] : (this.finish || null) );
  };

  // Respawn spot: just behind the last hoop taken, or the start.
  //
  Course.prototype.respawn = function(level) {
    if (this.last < 0) { return level.start; }
    var h = this.hoops[this.last];
    return { p: [h.p[0] - (h.n[0] * 4), h.p[1] - (h.n[1] * 4), h.p[2] - (h.n[2] * 4)], n: h.n };
  };

  var DRC = { Course: Course };
  if (root.DR) { Object.assign(root.DR, DRC); }
  else         { root.DR = DRC; }
  if ((typeof module !== "undefined") && module.exports) { module.exports = DRC; }

})(typeof window !== "undefined" ? window : globalThis);
