// Fly generated levels with a simple keyboard-style autopilot (turn
// and climb only -1, 0 or 1; constant cadence) and report hoops taken,
// time, contacts, and the deepest penetration of the collision sphere.
// Also runs a wall-ram test: full speed straight into the gully wall.
//
//   node tools/autofly.js [seeds or level.json files...]
//
var fs = require("fs"),
    LG = require("../levelgen/levelgen.js"),
    FL = require("../js/flight.js"),
    CO = require("../js/course.js");

function wrap(a) { while (a > Math.PI) { a -= 2 * Math.PI; } while (a < -Math.PI) { a += 2 * Math.PI; } return a; }

function level(seed) {
  return ( (typeof seed === "string") ? JSON.parse(fs.readFileSync(seed, "utf8")) : LG.generate({ seed: seed }) );
}

function fly(seed, cad) {
  var L = level(seed), F = LG.sdf(L),
      fl = new FL.Flight(F), co = new CO.Course(L),
      dt = 1 / 60, t = 0, minD = 1e9, contactT = 0, hits = 0;
  fl.place(L.start.p, L.start.n);

  // Aim a little past the next target, along the path.
  //
  while ( (t < 240) && !co.finished ) {
    var g = co.target(),
        aim = [g.p[0] + (g.n[0] * 2), g.p[1] + (g.n[1] * 2), g.p[2] + (g.n[2] * 2)],
        dx = aim[0] - fl.pos[0], dy = aim[1] - fl.pos[1], dz = aim[2] - fl.pos[2],
        dh = Math.sqrt((dx * dx) + (dz * dz)),
        ey = wrap(Math.atan2(dx, dz) - fl.yaw),
        ep = Math.atan2(dy, dh) - fl.pitch,
        c  = { cadence: cad, turn: ( (Math.abs(ey) > 0.04) ? Math.sign(ey) : 0 ),
               climb: ( (Math.abs(ep) > 0.05) ? Math.sign(ep) : 0 ), force: [0, 0, 0] },
        a  = fl.pos.slice();
    fl.step(dt, c);
    co.update(a, fl.pos);
    minD = Math.min(minD, F(fl.pos[0], fl.pos[1], fl.pos[2]));
    if (fl.contact > 0) { contactT += dt; }
    if (fl.hit > 0.99) { hits++; }
    t += dt;
  }
  return { seed: seed, cadence: cad, hoops: co.count + "/" + L.hoops.length, finished: co.finished,
           time: t.toFixed(1), contactSec: contactT.toFixed(2), minDist: minD.toFixed(2) };
}

// Ram the right-hand gully wall at full speed, then try to turn away.
//
function ram(seed) {
  var L = LG.generate({ seed: seed }), F = LG.sdf(L), fl = new FL.Flight(F), dt = 1 / 60,
      z = L.length * 0.5, x = L.path.find(function(p) { return p[2] >= z; })[0];
  fl.place([x, 20, z], [-1, 0, 0]);
  var minD = 1e9, vHit = null, log = [];
  for (var i = 0; i < 60 * 12; i++) {
    var turning = (i > 60 * 8);
    fl.step(dt, { cadence: 180, turn: ( turning ? 1 : 0 ), climb: 0, force: [0, 0, 0] });
    minD = Math.min(minD, F(fl.pos[0], fl.pos[1], fl.pos[2]));
    if ( (vHit === null) && (fl.hit > 0) ) { vHit = fl.speed; }
    if ((i % 120) === 0) { log.push(fl.speed.toFixed(1)); }
  }
  return { seed: seed, minDist: minD.toFixed(2), speedAfterFirstHit: ( (vHit === null) ? "-" : vHit.toFixed(1) ),
           speedEvery2s: log.join(" "), finalSpeed: fl.speed.toFixed(1), finalDist: F(fl.pos[0], fl.pos[1], fl.pos[2]).toFixed(1) };
}

var seeds = process.argv.slice(2).map(function(a) { return ( /\.json$/.test(a) ? a : Number(a) ); });
if (!seeds.length) { seeds = [1, 2, 3, 4, 5]; }
seeds.forEach(function(s) {
  console.log(JSON.stringify(fly(s, 150)));
  console.log(JSON.stringify(fly(s, 90)));
  if (typeof s === "number") { console.log(JSON.stringify(ram(s))); }
});
