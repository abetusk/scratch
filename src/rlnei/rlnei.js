#!/usr/bin/env node

let N = 10;

function generic_point(n, D) {
  D = ((typeof D === "undefined") ? 2 : D);
  let pnt = [];
  for (let i=0; i<n; i++) {
    let p = [];
    for (let j=0; j<D; j++) {
      p.push(Math.random());
    }
    pnt.push(p);
  }
  return pnt;
}

function printpoint(pnt) {
  for (let i=0; i<pnt.length; i++) {
    console.log(pnt[i].join(" "));
  }
  console.log("");
}

function norm2(a,b) {
  let s = 0.0;
  for (let i=0; i<a.length; i++) {
    s += (a[i] - b[i])*(a[i] - b[i]);
  }
  return Math.sqrt(s);
}

function _gencmp(p) {
  return (function(_t) {
    return function(a,b) {
      let l0 = norm2(a,_t);
      let l1 = norm2(b,_t);
      if (l0<l1) { return -1; }
      if (l0>l1) { return  1; }
      return 0;
    }
  })(p);
}

// see if v is in the lune of p,q
//
function in_lune(v, p,q) {
  let r_pq = norm2(p,q);

}

function rng_On3(pnt) {

  for (let i_p=0; i_p<pnt.length; i_p++) {
    let p = pnt[i_p];

    let u = [];
    for (let i_q=0; i_q<pnt.length; i_q++) {
      if (i_q == i_p) { continue; }
      u.push(pnt[i_q]);
    }

    u.sort( _gencmp(p) );

    for (let i_u=0; i_u<u.length; i_u++) {

    }

  }

}

let pnt = generic_point(N);


rng_On3(pnt);

