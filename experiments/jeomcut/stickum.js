// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//


var m4 = require("./m4.js").m4;

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

//---

function dig_incr(dig) {
  let pos = 0;

  while (pos < dig.length) {
    dig[pos].v++;
    if (dig[pos].v < dig[pos].n) { break; }
    dig[pos].v=0;
    pos++;
  }

  return dig;
}

function dig_zero(dig) {
  for (let ii=0; ii<dig.length; ii++) {
    if (dig[ii].v != 0) { return false; }
  }
  return true;
}

// WIP!!!
function stickum_dock_rotate(dock_list, M) {
}


// WIP!!!
function pnt_eq(a,b, _eps) {
  _eps = ((typeof _eps === "undefined") ? (1.0/(1024.0*1024.0)) : _eps);
  for (let xyz=0; xyz<3; xyz++) {
    if (Math.abs(a[xyz] - b[xyz]) > _eps) { return false; }
  }
  return true;
}

// WIP!!!
function stickum_dock_eq(dock_a, dock_b) {

  for (let a_idx=0; a_idx < dock_a.length; a_idx++) {
    let found = false;
    let a_list = dock_a[a_idx];

    for (let b_idx=0; b_idx < dock_b.length; b_idx++) {
      let b_list = dock_b[b_idx];

      if (a_list.length != b_list.length) { continue; }

      let eq_count=0;
      for (let ii=0; ii<a_list.length; ii++) {
        for (let jj=0; jj<b_list.length; jj++) {
          if (pnt_eq(a_list[ii], b_list[jj])) { eq_count++; break; }
        }
      }

      console.log("a_idx:", a_idx, "b_idx:", b_idx, "eq_count:", eq_count);

      if (eq_count == a_list.length) { found = true; }
      break;

    }
    if (!found) { return false; }
  }
  return true;
}

// WIP!!!
// dock_list is an array of point docks,
// with each point dock an array of points
//
//
function stickum_create_rep(dock_list, sym) {
  sym = ((typeof sym === "undefined") ? '*' : sym);

  let dig = [];

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

  if ('x' in sym_code_m) { dig.push({"v":0, "n":4, "t":"x", "d": [1,0,0] }); }
  if ('y' in sym_code_m) { dig.push({"v":0, "n":4, "t":"y", "d": [0,1,0] }); }
  if ('z' in sym_code_m) { dig.push({"v":0, "n":4, "t":"z", "d": [0,0,1] }); }

  do {
    let M = m4.identity();
    let T = new Float32Array(16);

    for (let ii=0; ii<dig.length; ii++) {
      m4.axisRotation(dig[ii].d, dig[ii].v*Math.PI/2, T);
      M = m4.multiply(M,T);
    }

    console.log(JSON.stringify(dig), M);

    dig_incr(dig);
  } while (!dig_zero(dig));


}

function stickum_dock_rot(dock, M) {
  let _d = [];
  for (let idx=0; idx<dock.length; idx++) {
    let pnt_list = [];
    for (let ii=0; ii<dock[idx].length; ii++) {
      pnt_list.push( m4.mulp(M, dock[idx][ii]) );
    }
    _d.push(pnt_list);
  }
  return _d;
}


function main() {
  let d = 1/8;
  let XX = [ stickum_square(0, d), stickum_square(1,d) ];
  let YY = [ stickum_square(2, d), stickum_square(3,d) ];

  let M = m4.axisRotation([0,0,1], Math.PI);

  let XXr = stickum_dock_rot(XX, M);

  console.log("XXr,XX", stickum_dock_eq(XXr, XX));
  console.log("XXr,YY", stickum_dock_eq(XXr, YY));
  console.log("XX,YY", stickum_dock_eq(XX, YY));

  console.log("XX,XX", stickum_dock_eq(XX, XX));
  console.log("YY,YY", stickum_dock_eq(YY, YY));
  console.log("XXr,XXr", stickum_dock_eq(XXr, XXr));

}


function main0() {
  let d = 1/8;
  let s0 = [ stickum_square(0, d) ];
  let s1 = [ stickum_square(1, d) ];

  let M = m4.axisRotation([0,0,1], Math.PI);

  let X = stickum_dock_rot(s0, M);

  //console.log(X);
  for (let ii=0; ii<s0[0].length; ii++) {
    console.log( s0[0][ii][0], s0[0][ii][1], s0[0][ii][2]);
  }
  console.log( s0[0][0][0], s0[0][0][1], s0[0][0][2]);
  console.log("\n");

  for (let ii=0; ii<X[0].length; ii++) {
    console.log( X[0][ii][0], X[0][ii][1], X[0][ii][2]);
  }
  console.log( X[0][0][0], X[0][0][1], X[0][0][2]);
  console.log("\n");

  console.log(">>>", stickum_dock_eq(X, s1));
  console.log(">>>", stickum_dock_eq(X, s0));
  console.log(">>>", stickum_dock_eq(s0, s1));

  //console.log(s0, s1);
}

function _main() {

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

  stickum_create_rep();



}

main();
