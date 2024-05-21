// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//


var m4 = require("./m4.js");

let VDIR = [
  [1,0,0], [-1,0,0],
  [0,1,0], [0,-1,0],
  [0,0,1], [0,0,-1]
];

let BASIS = [
  [ [ 1, 0,0], [0,0,1], [  0, 1/2,   0] ],
  [ [-1, 0,0], [0,0,1], [  0,-1/2,   0] ],
  [ [ 0, 1,0], [0,0,1], [ 1/2,  0,   0] ],
  [ [ 0,-1,0], [0,0,1], [-1/2,  0,   0] ],
  [ [ 1, 0,0], [0,1,0], [   0,  0, 1/2] ],
  [ [-1, 0,0], [0,1,0], [   0,  0,-1/2] ]
];

function rand(a,b) {
  if (typeof a === "undefined") {
    a=0.0; b=1.0;
  }
  else if (typeof b === "undefined") {
    b=a; a=0.0;
  }

  return ((b-a)*Math.random()) + a;
}

function stickum_square(idir, l) {
  l = ((typeof l === "undefined") ? rand(0.25,0.75) : l);

  let p = [
    [  BASIS[idir][0][0]*l/2,  BASIS[idir][0][1]*l/2,  BASIS[idir][0][2]*l/2 ],
    [  BASIS[idir][1][0]*l/2,  BASIS[idir][1][1]*l/2,  BASIS[idir][1][2]*l/2 ],
    [ -BASIS[idir][0][0]*l/2, -BASIS[idir][0][1]*l/2, -BASIS[idir][0][2]*l/2 ],
    [ -BASIS[idir][1][0]*l/2, -BASIS[idir][1][1]*l/2, -BASIS[idir][1][2]*l/2 ]
  ];

  for (let ii=0; ii<p.length; ii++) {
    p[ii][0] += BASIS[idir][2][0];
    p[ii][1] += BASIS[idir][2][1];
    p[ii][2] += BASIS[idir][2][2];
  }

  return p;
}

function stickum_rect(idir, l0, l1) {
  l0 = ((typeof l0 === "undefined") ? rand(0.25,0.75) : l0);
  l1 = ((typeof l1 === "undefined") ? rand(0.25,0.75) : l1);

  let p = [
    [  BASIS[idir][0][0]*l0/2,  BASIS[idir][0][1]*l0/2,  BASIS[idir][0][2]*l0/2 ],
    [  BASIS[idir][1][0]*l1/2,  BASIS[idir][1][1]*l1/2,  BASIS[idir][1][2]*l1/2 ],
    [ -BASIS[idir][0][0]*l0/2, -BASIS[idir][0][1]*l0/2, -BASIS[idir][0][2]*l0/2 ],
    [ -BASIS[idir][1][0]*l1/2, -BASIS[idir][1][1]*l1/2, -BASIS[idir][1][2]*l1/2 ]
  ];

  for (let ii=0; ii<p.length; ii++) {
    p[ii][0] += BASIS[idir][2][0];
    p[ii][1] += BASIS[idir][2][1];
    p[ii][2] += BASIS[idir][2][2];
  }

  return p;
}

function stickum_trapezoid(idir, l0, l1, h) {
  l0 = ((typeof l0 === "undefined") ? rand(0.25,0.75) : l0);
  l1 = ((typeof l1 === "undefined") ? rand(0.25,0.75) : l1);
  h  = ((typeof h  === "undefined") ? rand(0.25,0.75) : h);

  let dx0 = (BASIS[idir][0][0]*l0/2) + (BASIS[idir][1][0]*h/2),
      dy0 = (BASIS[idir][0][1]*l0/2) + (BASIS[idir][1][1]*h/2),
      dz0 = (BASIS[idir][0][2]*l0/2) + (BASIS[idir][1][2]*h/2);

  let dx1 = -(BASIS[idir][0][0]*l0/2) + (BASIS[idir][1][0]*h/2),
      dy1 = -(BASIS[idir][0][1]*l0/2) + (BASIS[idir][1][1]*h/2),
      dz1 = -(BASIS[idir][0][2]*l0/2) + (BASIS[idir][1][2]*h/2);

  let dx2 = -(BASIS[idir][0][0]*l1/2) - (BASIS[idir][1][0]*h/2),
      dy2 = -(BASIS[idir][0][1]*l1/2) - (BASIS[idir][1][1]*h/2),
      dz2 = -(BASIS[idir][0][2]*l1/2) - (BASIS[idir][1][2]*h/2);

  let dx3 = (BASIS[idir][0][0]*l1/2) - (BASIS[idir][1][0]*h/2),
      dy3 = (BASIS[idir][0][1]*l1/2) - (BASIS[idir][1][1]*h/2),
      dz3 = (BASIS[idir][0][2]*l1/2) - (BASIS[idir][1][2]*h/2);

  let p = [
    [ dx0, dy0, dz0 ],
    [ dx1, dy1, dz1 ],
    [ dx2, dy2, dz2 ],
    [ dx3, dy3, dz3 ]
  ];

  for (let ii=0; ii<p.length; ii++) {
    p[ii][0] += BASIS[idir][2][0];
    p[ii][1] += BASIS[idir][2][1];
    p[ii][2] += BASIS[idir][2][2];
  }

  return p;
}

function stickum_z(idir, b, h) {
  b = ((typeof b === "undefined") ? rand(0.25,0.75) : b);
  h = ((typeof h === "undefined") ? rand(0.25,0.75) : h);

  let dx0 = (BASIS[idir][0][0]*b/2) + (BASIS[idir][1][0]*h/2),
      dy0 = (BASIS[idir][0][1]*b/2) + (BASIS[idir][1][1]*h/2),
      dz0 = (BASIS[idir][0][2]*b/2) + (BASIS[idir][1][2]*h/2);

  let dx1 = (BASIS[idir][1][0]*h/2),
      dy1 = (BASIS[idir][1][1]*h/2),
      dz1 = (BASIS[idir][1][2]*h/2);


  let p = [
    [  dx0, dy0, dz0 ],
    [  dx1, dy1, dz1 ],
    [ -dx0,-dy0,-dz0 ],
    [ -dx1,-dy1,-dz1 ]
  ];

  for (let ii=0; ii<p.length; ii++) {
    p[ii][0] += BASIS[idir][2][0];
    p[ii][1] += BASIS[idir][2][1];
    p[ii][2] += BASIS[idir][2][2];
  }

  return p;
}

function stickum_askew(idir, w, h0, h1) {
  w  = ((typeof w  === "undefined") ? rand(0.25,0.75) : w);
  h0 = ((typeof h0 === "undefined") ? rand(0.25,0.75) : h0);
  h1 = ((typeof h1 === "undefined") ? rand(0.25,0.75) : h1);

  let dx0 = (BASIS[idir][0][0]*w/2) + (BASIS[idir][1][0]*h0/2),
      dy0 = (BASIS[idir][0][1]*w/2) + (BASIS[idir][1][1]*h0/2),
      dz0 = (BASIS[idir][0][2]*w/2) + (BASIS[idir][1][2]*h0/2);

  let dx1 = -(BASIS[idir][0][0]*w/2) + (BASIS[idir][1][0]*h0/2),
      dy1 = -(BASIS[idir][0][1]*w/2) + (BASIS[idir][1][1]*h0/2),
      dz1 = -(BASIS[idir][0][2]*w/2) + (BASIS[idir][1][2]*h0/2);

  let dx2 = (BASIS[idir][0][0]*w/2) - (BASIS[idir][1][0]*h1/2),
      dy2 = (BASIS[idir][0][1]*w/2) - (BASIS[idir][1][1]*h1/2),
      dz2 = (BASIS[idir][0][2]*w/2) - (BASIS[idir][1][2]*h1/2);

  let p = [
    [  dx0,  dy0,  dz0 ],
    [  dx1,  dy1,  dz1 ],
    [ -dx0, -dy0, -dz0 ],
    [  dx2,  dy2,  dz2 ]
  ];

  for (let ii=0; ii<p.length; ii++) {
    p[ii][0] += BASIS[idir][2][0];
    p[ii][1] += BASIS[idir][2][1];
    p[ii][2] += BASIS[idir][2][2];
  }

  return p;
}

// dock_list is an array of point docks,
// with each point dock an array of points
//
//
function stickum_create_rep(dock_list, sym) {
  sym = ((typeof sym === "undefined") ? '*' : sym);

  let sym_code = [];
  let sym_code_m = {};

  for (let ii=0; ii<sym.length; ii++) {
    if (sym[ii] == '*') {
      sym_code_m['x'] = 1;
      sym_code_m['y'] = 1;
      sym_code_m['z'] = 1;
    }
    else if (sym[ii] == 'x') { sym_code_m['x'] = 1; }
    else if (sym[ii] == 'y') { sym_code_m['y'] = 1; }
    else if (sym[ii] == 'z') { sym_code_m['z'] = 1; }
  }

  if ('x' in sym_cod_m) { sym_code.push('x'); }
  if ('y' in sym_cod_m) { sym_code.push('y'); }
  if ('z' in sym_cod_m) { sym_code.push('z'); }

  for (let sc in sym_code) {
    let axis = [0,0,1];
    if (sc == 'x') { axis = [1,0,0]; }
    if (sc == 'y') { axis = [0,1,0]; }
    if (sc == 'z') { axis = [0,0,1]; }

    for (let ang_idx=0; ang_idx<4; ang_idx++) {
    let m = m4.axisRotation(
  }

}

function main() {

  let s = rand(0.25,0.75);
  let s1 = rand(0.25,0.75);
  let s2 = rand(0.25, 0.75);

  for (let idir=0; idir<6; idir++) {
    //let p = stickum_square(idir, s);
    //let p = stickum_rect(idir, s, s1);
    //let p = stickum_trapezoid(idir, s, s1,s2);
    //let p = stickum_z(idir, s, s1);
    let p = stickum_askew(idir, s, s1,s2);
    for (let ii=0; ii<p.length; ii++) {
      console.log(p[ii][0], p[ii][1], p[ii][2]);
    }
    console.log(p[0][0], p[0][1], p[0][2]);
    console.log("\n");
  }


}

main();
