// LICENSE: CC0
//

var bez = require("./bez.cjs");
var hob = require("./mp_path.js");
var njs = require("./numeric.js");

function _bez_example() {
  let b = new bez.Bezier(100,25, 10,90, 110, 100, 160,195);
  //console.log(b);


  let n = 100;
  let lut = b.getLUT(n);
  //console.log(lut);
  for (let i=0; i<lut.length; i++) {
    console.log(lut[i].x, lut[i].y);
  }

}

function _hob_example() {
  let p = [[0, 0], [200, 133], [130, 300], [33, 233], [100, 167]];

  //let knots = hob.makeknots(p,1,false);
  //hob.mp_make_choices(knots[0]);

  let knots = hob.Hobby(p);

  let bez_chain = [];
  for (let i=0; i<(knots.length-1); i++) {

    let _b = new bez.Bezier( knots[i].x_pt, knots[i].y_pt,
                             knots[i].rx_pt, knots[i].ry_pt,
                             knots[i+1].lx_pt, knots[i+1].ly_pt,
                             knots[i+1].x_pt, knots[i+1].y_pt );

    bez_chain.push( _b );
  }

  for (let i=0; i<bez_chain.length; i++) {
    let lut = bez_chain[i].getLUT(16);
    for (let j=0; j<lut.length; j++) {
      console.log(lut[j].x, lut[j].y);
    }
  }

}

function _Bezier(x,y, rx,ry, lx,ly, xn,yn) {
  return new bez.Bezier( x,y,
                         rx,ry,
                         lx,ly,
                         xn,yn );
}

function HobbyLUT(p, seg, tension, isloop) {
  seg = ((typeof seg === "undefined") ? 100 : seg);
  tension = ((typeof tension === "undefined") ? 1 : tension);
  isloop = ((typeof isloop === "undefined") ? false : isloop);

  let knots = hob.Hobby(p, tension, isloop);

  let bez_chain = [];
  for (let i=0; i<(knots.length-1); i++) {
    let _b = new bez.Bezier( knots[i].x_pt, knots[i].y_pt,
                             knots[i].rx_pt, knots[i].ry_pt,
                             knots[i+1].lx_pt, knots[i+1].ly_pt,
                             knots[i+1].x_pt, knots[i+1].y_pt );
    bez_chain.push( _b );
  }

  if (isloop) {
    let m = knots.length;
    if (m > 1) {
      let _b = new bez.Bezier( knots[m-1].x_pt, knots[m-1].y_pt,
                               knots[m-1].rx_pt, knots[m-1].ry_pt,
                               knots[0].lx_pt, knots[0].ly_pt,
                               knots[0].x_pt, knots[0].y_pt );
      bez_chain.push( _b );
    }
  }

  let out_pnt = [];
  for (let i=0; i<bez_chain.length; i++) {
    let lut = bez_chain[i].getLUT(seg);
    if (i==0) { out_pnt.push( [ lut[0].x, lut[0].y ] ); }
    for (let j=1; j<lut.length; j++) {
      out_pnt.push([ lut[j].x, lut[j].y ]);
    }
  }

  return out_pnt;
}


// EXPERIMENTAL
//


// Solve tridiagonal system
//
// - a,b,c,d have the same length, n
// - a_0 and c_{n-1} are not used
//
// Solves Ax=d
// where A=
// [ b_0 c_0
//   a_1 b_1 c_1
//       ......
//         a_{n-2} b_{n-2} c_{n-2}
//                 a_{n-1}   b_{n-1}   ]
//
function thomas(a,b,c,d) {
  let n = a.length;

  for (let i=1; i<n; i++) {
    let w = a[i] / b[i-1];
    b[i] = b[i] - w*c[i-1];
    d[i] = d[i] - w*d[i-1];
  }

  let x = njs.rep([n], 0);
  x[n-1] = d[n-1] / b[n-1];
  for (i=(n-2); i>0; i--) {
    x[i] = (d[i] - (c[i]*x[i+1])) / b[i];
  }

  return x;
}

// Solve cyclic tridiagonal system
//
// - a,b,c,d have the same length, n
//
// Solves Ax=d
// where A=
// [ b_0 c_0                         a_0
//   a_1 b_1 c_1
//           ......
//                   a_{n-2} b_{n-2} c_{n-2}
//  c_{n-1}                  a_{n-1} b_{n-1}     ]
//
function thomas_cyclic(a,b,c,d) {
  let n = a.length;

  let u = njs.rep([n], 0);
  u[0] = a[0];
  u[n-1] = c[n-1];

  let v = njs.rep([n], 0);
  v[0] = 1;
  v[n-1] = 1;

  let bp = njs.sub(b,u);
  let y = thomas(a,bp,c,d);
  let z = thomas(a,bp,c,u);

  return njs.sub(y, njs.mul( njs.dot(v,y) / (1+njs.dot(v,z)), z ) );
}

function hobby2cubic_open(points, ta, tb, rho, omega) {
  let n = points.length;

  if (typeof ta === "undefined") { ta = njs.rep([n-1], 1); }
  if (typeof tb === "undefined") { tb = njs.rep([n-1], 1); }
  if (typeof rho === "undefined") {
    rho = function(_a,_b) {
      return  (2 + ( calc.sqrt(2) *
                    (calc.sin(a) - (calc.sin(b)/16)) *
                    (calc.sin(b) - (calc.sin(a)/16)) *
                    (calc.cos(a) - (calc.cos(b))) ) ) /
              (1 + ( calc.cos(a) * ((calc.sqrt(5)-1)/2)) +
                    (calc.cos(b)*(3-calc.sqrt(5))/2)) ;
    }
  }

  let v = njs.rep([n,2], 0);
}

//
// EXPERIMENTAL

//_hob_example();

if (typeof module !== "undefined") {
  module.exports["HobbyLib"] = hob;
  module.exports["BezierLib"] = bez;

  module.exports["Hobby"] = hob.Hobby;
  module.exports["Bezier"] = _Bezier;

  module.exports["HobbyLUT"] = HobbyLUT;
}


