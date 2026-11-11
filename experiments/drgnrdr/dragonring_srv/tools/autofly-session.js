// Fly a whole session with a keyboard-style autopilot (turn and climb
// only -1, 0 or 1; constant cadence): stages stream in and out
// and the finish ends it.  Reports per stage: type, hoops taken
// of hoops, contacts, closest approach to a solid; then totals.
//
//   node tools/autofly-session.js [seed] [minutes] [cadence] ['{"width": 0.5, ...}']
//
var vm = require("vm"), fs = require("fs"), path = require("path"), D = path.join(__dirname, "..");
global.LevelGen = require(D + "/levelgen/levelgen.js");
vm.runInThisContext(fs.readFileSync(D + "/vendor/palettes500.js", "utf8") + ";globalThis.color500 = color500;");
require(D + "/levelgen/stages.js");
var CO = require(D + "/js/course.js");
global.DR = { Course: CO.Course };
var FL = require(D + "/js/flight.js"), RN = require(D + "/js/session.js");

var seed = +(process.argv[2] || 3), minutes = +(process.argv[3] || 6), cad = +(process.argv[4] || 140),
    knobs = JSON.parse(process.argv[5] || "{}"),
    run = new RN.Run(Object.assign({ seed: seed }, knobs), color500, { minutes: minutes }), fl, dt = 1 / 30, t = 0, per = {}, minD = 1e9, contact = 0, speedSum = 0, n = 0;

function wrap(a) { while (a > Math.PI) { a -= 2 * Math.PI; } while (a < -Math.PI) { a += 2 * Math.PI; } return a; }

run.onBuild = function(st) { per[st.stage] = { type: st.type, hoops: st.hoops.length, taken: 0, contact: 0, minD: 1e9, final: st.final }; };
var s0 = run.ensure(0, 0, 20).start;
fl = new FL.Flight(function(x, y, z) { return run.sdf(x, y, z); });
fl.place(s0.p, s0.n);

while ( !run.finished && (t < ((minutes * 60) + 600)) ) {
  run.ensure(fl.pos[2], t, ( n ? speedSum / n : 20 ));
  var g = run.target(), c = { cadence: cad, turn: 0, climb: 0, force: [0, 0, 0] };
  if (g) {
    var aim = [g.p[0] + (g.n[0] * 3), g.p[1] + (g.n[1] * 3), g.p[2] + (g.n[2] * 3)],
        dx = aim[0] - fl.pos[0], dy = aim[1] - fl.pos[1], dz = aim[2] - fl.pos[2],
        sy = Math.sin(fl.yaw), cy = Math.cos(fl.yaw), fwd = (dx * sy) + (dz * cy),
        ey = wrap(Math.atan2(dx, dz) - fl.yaw), ep = wrap(Math.atan2(dy, fwd) - fl.pitch),
        upright = Math.abs(fl.pitch) < (Math.PI / 2);
    c.turn  = ( (upright && (Math.abs(ey) > 0.04)) ? Math.sign(ey) : 0 );
    c.climb = ( (Math.abs(ep) > 0.05) ? Math.sign(ep) : 0 );
  }
  var a = fl.pos.slice();
  fl.step(dt, c);
  var k = Math.floor(fl.pos[2] / run.L), d = run.sdf(fl.pos[0], fl.pos[1], fl.pos[2]);
  run.update(a, fl.pos).forEach(function(e) { if (e.hoop !== undefined) { per[e.stage.stage].taken++; } });
  if (per[k]) { per[k].minD = Math.min(per[k].minD, d);  if (fl.contact > 0) { per[k].contact += dt; } }
  minD = Math.min(minD, d);
  speedSum += fl.speed;  n++;
  t += dt;
}
Object.keys(per).forEach(function(k) {
  var p = per[k];
  console.log("stage", k, p.type, "hoops", p.taken + "/" + p.hoops, "contact", p.contact.toFixed(1) + "s",
              "minDist", p.minD.toFixed(2), ( p.final ? "FINAL" : "" ));
});
console.log("finished", run.finished, "time", (t / 60).toFixed(1) + " min (target " + minutes + ")", "hoops", run.taken + "/" + run.seen,
            "avg speed", (speedSum / n).toFixed(1), "minDist", minD.toFixed(2));
