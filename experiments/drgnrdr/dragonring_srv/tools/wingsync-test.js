// Press a WingSync at human-like rhythms (jittered intervals, slow
// tempo changes) and report the beat phase at each press: 0 means the
// press landed exactly at the top of the beat.  Errors in beats
// (-0.5..0.5), as mean |error| per segment (after the first three
// presses), and the share of time the wings wait at the top for a
// late press.
//
//   node tools/wingsync-test.js
//
var W = require("../js/wingsync.js");

function run(name, rates, jitter, seed) {
  var held = 0, w = new W.WingSync(), dt = 1 / 60, t = 0, next = 0.5, i = 0, a = seed, errs = [], segs = [];
  function rnd() { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; }
  rates.forEach(function(seg) {
    var tEnd = t + seg[1], e = [];
    while (t < tEnd) {
      var before = w.phase;
      w.update(dt);
      if ( (w.phase === before) || ((w.phase >= 0.999) && (before >= 0.999)) ) { held += dt; }
      t += dt;
      if (t >= next) {
        e.push(Math.abs(w.phase > 0.5 ? w.phase - 1 : w.phase));
        w.press();
        next = t + ((1 / seg[0]) * (1 + ((rnd() - 0.5) * 2 * jitter)));
      }
    }
    var tail = e.slice(3);
    segs.push(seg[0] + "/s: " + (tail.reduce(function(s, x) { return s + x; }, 0) / Math.max(1, tail.length)).toFixed(3) +
              " (first " + e.slice(0, 3).map(function(x) { return x.toFixed(2); }).join(",") + ")");
  });
  console.log(name, "jitter", jitter, "| wings held at top", (100 * held / t).toFixed(1) + "% of the time |", segs.join("  "));
}
run("steady  ", [[2, 8], [2.5, 8], [3, 8], [1.2, 8], [0.6, 8]], 0.05, 7);
run("jittery ", [[2, 8], [2.5, 8], [3, 8], [1.2, 8], [0.6, 8]], 0.12, 9);
run("ramp    ", [[1.5, 4], [1.8, 4], [2.1, 4], [2.4, 4], [2.7, 4], [3, 4]], 0.08, 3);
run("slowdown", [[3, 4], [2.5, 4], [2, 4], [1.6, 5], [1.2, 6], [0.9, 8], [0.6, 10]], 0.08, 5);
