// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//   
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// makes one of those calligraphic flourishes that looks like loops
// zig-zagging across from each other.
// See https://archive.org/details/a-course-in-flourishing-for-learners/page/n8/mode/1up
//

var hob = require("./hob.js");
var printf = require("./printf.js");
var fs = require("fs");

var DEBUG = 1;

function _rnd(a,b) {
  if (typeof a === "undefined") { a = 0; b = 1; }
  if (typeof b === "undefined") { b = a; a = 0; }
  return (Math.random()*(b-a)) + a;
}

function swish() {

  let n = 10,
      ds = 3,
      dh = 2;

  let s = 4*ds,
      dh2 = dh/2;

  let knot = [];

  for (let i=0; i<n; i++) {
    knot.push( [ -2*ds,      -dh*i ] );
    knot.push( [ -2*ds + ds, -dh*i + dh2 ] );

    knot.push( [  2*ds - ds, -dh*i - dh ] );
    knot.push( [  2*ds ,     -dh*i - dh2 ] );
    knot.push( [  2*ds - ds ,-dh*i ] );

    knot.push( [ -2*ds + ds ,-dh*(i+1) - dh2 ] );
  }

  for (let i=0; i<knot.length; i++) {
    knot[i][0] += _rnd(-0.125,0.125);
    knot[i][1] += _rnd(-0.125,0.125);
  }

  if (DEBUG) {
    let knot_lines = [];
    for (let i=0; i<knot.length; i++) {
      //console.log(knot[i][0], knot[i][1]);
      knot_lines.push( printf("%f %f", knot[i][0], knot[i][1]) );

    }

    fs.writeFileSync("swish_knot.gp", knot_lines.join("\n"));

    //process.exit();
  }

  let lut = hob.HobbyLUT(knot);

  for (let i=0; i<lut.length; i++) {
    console.log(lut[i][0], lut[i][1]);
  }

}

// not looking good...
//
function swish1() {

  let knot = [
    [-12, 12],
    [-9, 5],
    [ -6, 0.0],
    [ 5, 0.5],
    [ -5, 0.5],
    [ 4, -0.5],
    [ 0, 0],
    [ -4, 0.0],
    [ 5, -1],
    [ -5, -1],
    [ 6, -0.5],
    [ 9, -5],
    [ 12, -12]
  ];

  knot = [
    [-12, 16],
    [ 2.5, -2],
    [ 5.5, 0.5],
    [ -2.5, 3],
    [ -5.5, 2],

    [ 1.5, -1],
    [3.5, -0.5],
    [ 2,0, 0.0],

    [0,0, 0.0],

    [-2,0, 0.0],
    [-3.5, 0.5],
    [-1.5, 1],

    [5.5, -1.5],
    [2.5, -3],
    [-5.5, 0],
    [-1.5, 2],
    [12, -16]
  ];

  if (DEBUG) {
    let knot_lines = [];
    for (let i=0; i<knot.length; i++) {
      knot_lines.push( printf("%f %f\n\n", knot[i][0], knot[i][1]) );
    }
    fs.writeFileSync("knot.gp", knot_lines.join("\n"));
  }

  let lut = hob.HobbyLUT(knot);

  for (let i=0; i<lut.length; i++) {
    console.log(lut[i][0], lut[i][1]);
  }


}

function capsule() {

  let dx = 10,
      dy = 5;

  let knot = [
    [ -2*dx, -5*dy ],
    [ dx, -4*dy ],
    [ -dx, -3*dy ],
    [ dx, -2*dy ],
    [ -dx, -dy ],
    [ dx, 0 ],
    [ -dx, dy ],
    [ dx, 2*dy ],
    [ -dx, 3*dy ],
    [ dx, 4*dy ],
    [ -2*dx, 5*dy]
  ];

  knot = [
    [ -2*dx, -5*dy ],
    [ dx, -4*dy ],
    [ 0, -3.5*dy],
    [ -dx, -3*dy ],
    [ 0, -2.5*dy ],
    [ dx, -2*dy ],
    [ 0, -1.5*dy ],
    [ -dx, -dy ],
    [ 0, -0.5*dy ],
    [ dx, 0 ],
    [ 0, 0.5*dy ],
    [ -dx, dy ],
    [ 0, 1.5*dy ],
    [ dx, 2*dy ],
    [ 0, 2.5*dy],
    [ -dx, 3*dy ],
    [ 0, 3.5*dy ],
    [ dx, 4*dy ],
    [ -2*dx, 5*dy]
  ];

  knot = [
    [ -2*dx, -5*dy ],

    [ dx, -4*dy ],
    [ dx/2, -3.5*dy],
    [ -dx/2, -3.5*dy],
    [ -dx, -3*dy ],

    [ -dx/2, -2.5*dy ],
    [ dx/2, -2.5*dy ],
    [ dx, -2*dy ],

    [ dx/2, -1.5*dy ],
    [ -dx/2, -1.5*dy ],
    [ -dx, -dy ],

    [ -dx/2, -0.5*dy ],
    [ dx/2, -0.5*dy ],
    [ dx, 0 ],

    [ dx/2, 0.5*dy ],
    [ -dx/2, 0.5*dy ],
    [ -dx, dy ],

    [ -dx/2, 1.5*dy ],
    [ dx/2, 1.5*dy ],
    [ dx, 2*dy ],

    [ dx/2, 2.5*dy],
    [ -dx/2, 2.5*dy],
    [ -dx, 3*dy ],

    [-dx/2, 3.5*dy ],
    [ dx/2, 3.5*dy ],
    [ dx, 4*dy ],
    [ -2*dx, 5*dy]
  ];

  // want control points to be close to a circle endpoint
  //
  dx = 25;
  let a = 1 - (dy / (1.125*dx));

  knot = [
    //[ -2*dx, -5*dy ],

    [ dx, -4*dy ],
    //[ dx*a, -3.5*dy],


    [ -dx*a, -3.5*dy],
    [ -dx, -3*dy ],
    [ -dx*a, -2.5*dy ],


    [ dx*a, -2.5*dy ],
    [ dx, -2*dy ],

    [ dx*a, -1.5*dy ],
    [ -dx*a, -1.5*dy ],
    [ -dx, -dy ],

    [ -dx*a, -0.5*dy ],
    [ dx*a, -0.5*dy ],
    [ dx, 0 ],

    [ dx*a, 0.5*dy ],
    [ -dx*a, 0.5*dy ],
    [ -dx, dy ],

    [ -dx*a, 1.5*dy ],
    [ dx*a, 1.5*dy ],
    [ dx, 2*dy ],

    [ dx*a, 2.5*dy],
    [ -dx*a, 2.5*dy],
    [ -dx, 3*dy ],

    [-dx*a, 3.5*dy ],
    //[ dx*a, 3.5*dy ],
    [ dx, 4*dy ],
    //[ -2*dx, 5*dy]
  ];

  if (DEBUG) {
    let knot_lines = [];
    for (let i=0; i<knot.length; i++) {
      knot_lines.push( printf("%f %f\n\n", knot[i][0], knot[i][1]) );
    }
    fs.writeFileSync("knot.gp", knot_lines.join("\n"));
  }

  let lut = hob.HobbyLUT(knot);

  for (let i=0; i<lut.length; i++) {
    console.log(lut[i][0], lut[i][1]);
  }


}

capsule();
