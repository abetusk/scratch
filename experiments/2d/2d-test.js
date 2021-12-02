/* 
 * create a canvas, load an image, write image to local canvas,
 * write to file
 *
 */

/* License: CCO */

/*
 * references:
 * https://shihn.ca/posts/2020/roughjs-algorithms/
 *
 */

var _canvas = require("canvas");
var fs = require("fs");
var bez = require("bezier-js");

// Box-Muller transform
// based off of https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
//
function gaussian_rn(m,v) {
  m = ((typeof m === "undefined") ? 0.0 : m);
  v = ((typeof v === "undefined") ? 1.0 : v);

  let u0 = 1.0 - Math.random();
  let u1 = 1.0 - Math.random();

  let mag = v * Math.sqrt(-2.0 * Math.log(u0));
  let z0 = mag * Math.cos(Math.PI * 2.0 * u1) + m;
  let z1 = mag * Math.sin(Math.PI * 2.0 * u1) + m;

  return [z0,z1];
}

// See:
//   https://xilinx.github.io/Vitis_Libraries/quantitative_finance/2020.1/guide_L1/brownian/bb.html
//   https://sites.me.ucsb.edu/~moehlis/APC591/tutorials/tutorial7/node2.html
//
function brownian_bridge(n,T,a,b,m,v) {
  T = ((typeof T === "undefined") ? 1.0 : T);
  a = ((typeof a === "undefined") ? 0.0 : a);
  b = ((typeof b === "undefined") ? 0.0 : b);
  m = ((typeof m === "undefined") ? 0.0 : m);
  v = ((typeof v === "undefined") ? 1.0 : v);

  let dtsqrt = Math.sqrt(T/(n-1));

  let w = [];
  w.push(0.0);
  for (let ind=1; ind<n; ind+=2) {
    let z = gaussian_rn(m,v);

    let dw = dtsqrt*z[0];
    w.push( w[ind-1] + dw );

    if ((ind+1) < n) {
      dw = dtsqrt*z[1];
      w.push( w[ind] + dw );
    }

  }

  let p = [];
  for (let ind=0; ind<n; ind++) {
    let t = T*ind/(n-1);
    let s = t/T;
    p.push( [ t, (a*(1-s)) + (b*s) + (w[ind]  - (s*w[n-1])) ] );
  }

  return p;
}

// p0 : [ x0, y0 ]
// p1 : [ x1, y1 ]
// m : control points
// n : points
// ds_u : distribution of control points on line
// dh_u : distribution of control points off the line
//
function writheLine(p0, p1, m, n, ds_u, dh_u) {
  m = ((typeof m === "undefined") ? 4 : m);
  n = ((typeof n === "undefined") ? 32 : n);
  ds_u = ((typeof ds_u === "undefined") ? (1.0/8.0): ds_u);
  dh_u = ((typeof dh_u === "undefined") ? (1.0/8.0): dh_u);

  let dx = p1[0] - p0[0],
      dy = p1[1] - p0[1];
  let len = Math.sqrt(dx*dx + dy*dy);

  let nx =  dy / len,
      ny = -dx / len;

  let tan_p = [];
  let control_p = [ [p0[0], p0[1]] ];
  for (let i=1; i<(m-1); i++) {
    let s = i/(m-1);
    let u = Math.random()*ds_u;
    let v = Math.random()*dh_u;
    control_p.push( [ p0[0] + (s*dx) + (dx*u/len) + (nx*v), p0[1] + (s*dy) + + (dy*u/len) + (ny*v)] );

    if (i==1) {
      let tx = control_p[1][0] - control_p[0][0],
          ty = control_p[1][1] - control_p[0][1];
      let lt = Math.sqrt(tx*tx + ty*ty);
      lt = 2.0;

      tan_p.push( [ tx/lt, ty/lt ] );
    }
    else {
      let tx0 = control_p[i-1][0] - control_p[i-2][0],
          ty0 = control_p[i-1][1] - control_p[i-2][1];
      let lt0 = Math.sqrt(tx0*tx0 + ty0*ty0);
      lt0 = 2.0;

      let tx1 = control_p[i][0] - control_p[i-1][0],
          ty1 = control_p[i][1] - control_p[i-1][1];
      let lt1 = Math.sqrt(tx1*tx1 + ty1*ty1);
      lt1 = 2.0;

      tan_p.push( [ ((tx0/lt0) + (tx1/lt1))/2.0, ((ty0/lt0) + (ty1/lt1))/2.0 ] );
    }
  }
  control_p.push( [p1[0], p1[1]] );

  let tx0 = control_p[m-2][0] - control_p[m-3][0],
      ty0 = control_p[m-2][1] - control_p[m-3][1];
  let lt0 = Math.sqrt(tx0*tx0 + ty0*ty0);
  lt0 = 2.0;

  let tx1 = control_p[m-1][0] - control_p[m-2][0],
      ty1 = control_p[m-1][1] - control_p[m-2][1];
  let lt1 = Math.sqrt(tx1*tx1 + ty1*ty1);
  lt1 = 2.0;

  tan_p.push( [ ((tx0/lt0) + (tx1/lt1))/2.0, ((ty0/lt0) + (ty1/lt1))/2.0 ] );

  let tx = control_p[m-1][0] - control_p[m-2][0],
      ty = control_p[m-1][1] - control_p[m-2][1];
  let lt = Math.sqrt(tx*tx + ty*ty);
  lt = 2.0;

  tan_p.push( [ tx/lt, ty/lt ] );

  let p = [];
  for (let m_idx=1; m_idx<m; m_idx++) {
    let from_x = control_p[m_idx-1][0], from_y = control_p[m_idx-1][1],
          to_x = control_p[m_idx][0],     to_y = control_p[m_idx][1];
    let from_ctl_x = from_x + tan_p[m_idx-1][0], from_ctl_y = from_y + tan_p[m_idx-1][1],
          to_ctl_x = to_x - tan_p[m_idx][0],       to_ctl_y = to_y - tan_p[m_idx][1];
    let curv = new bez.Bezier(from_x,from_y, from_ctl_x,from_ctl_y, to_ctl_x,to_ctl_y, to_x,to_y);

    let lut = curv.getLUT(n);
    for (let i=0; i<(lut.length-1); i++) {
      p.push( [lut[i].x, lut[i].y] );
    }

    if (m_idx == (m-1)) {
      p.push( [lut[lut.length-1].x, lut[lut.length-1].y] );
    }
  }

  return p;
}

// p0 : [ x0, y0 ]
// r : radius
// theta_s : start angle (radians)
// theta_d : delta angle (radians)
// m : control points
// n : points
// dh_u : distribution of control points off the line
//
function writheArc(p0, r, theta_s, theta_d, m, n, dh_u, da_u) {
  r = ((typeof r === "undefined") ? 1.0 : r);
  theta_s = ((typeof theta_s === "undefined") ? 0 : theta_s);
  theta_d = ((typeof theta_d === "undefined") ? (Math.PI*2.0) : theta_d);

  m = ((typeof m === "undefined") ? 4 : m);
  n = ((typeof n === "undefined") ? 32 : n);
  dh_u = ((typeof dh_u === "undefined") ? (1.0/8.0) : dh_u);
  da_u = ((typeof da_u === "undefined") ? (Math.PI/32.0) : da_u);

  //let ds = r*theta_d/(m-1);
  //let ds = r*theta_d/(m-1) * 0.75;
  let ds = r*theta_d/(m-1) * 0.75;
  let xx = p0[0] + r*Math.cos(theta_s),
      yy = p0[1] + r*Math.sin(theta_s);
  let control_p = [ [xx,yy] ];
  let tan_p = [ [ -ds*Math.sin(theta_s)/2, +ds*Math.cos(theta_s)/2] ];

  for (let i=1; i<(m-1); i++) {

    let a = theta_s + (i*theta_d/(m-1));

    let nx = r*Math.cos(a),
        ny = r*Math.sin(a);
    let nl = Math.sqrt(nx*nx + ny*ny);
    let x = p0[0] + nx,
        y = p0[1] + ny;
    let u = (Math.random()-0.5)*dh_u;

    let da = (Math.random()-0.5)*da_u;

    xx = x + (nx/nl)*u;
    yy = y + (ny/nl)*u;

    control_p.push( [xx,yy] );
    tan_p.push( [ -ds*Math.sin(a + da)/2, +ds*Math.cos(a + da)/2 ]);

  }
  xx = p0[0] + r*Math.cos(theta_s + theta_d);
  yy = p0[1] + r*Math.sin(theta_s + theta_d);
  control_p.push( [ xx,yy ] );
  tan_p.push( [ -ds*Math.sin(theta_s + theta_d)/2.0, +ds*Math.cos(theta_s + theta_d)/2.0 ] );

  let p = [];
  for (let m_idx=1; m_idx<m; m_idx++) {
    let from_x = control_p[m_idx-1][0], from_y = control_p[m_idx-1][1],
          to_x = control_p[m_idx][0],     to_y = control_p[m_idx][1];
    let from_ctl_x = from_x + tan_p[m_idx-1][0], from_ctl_y = from_y + tan_p[m_idx-1][1],
          to_ctl_x = to_x - tan_p[m_idx][0],       to_ctl_y = to_y - tan_p[m_idx][1];
    let curv = new bez.Bezier(from_x,from_y, from_ctl_x,from_ctl_y, to_ctl_x,to_ctl_y, to_x,to_y);

    let lut = curv.getLUT(n);
    for (let i=0; i<(lut.length-1); i++) {
      p.push( [lut[i].x, lut[i].y] );
    }

    if (m_idx == (m-1)) {
      p.push( [lut[lut.length-1].x, lut[lut.length-1].y] );
    }
  }

  return p;
}

function writheLineBanner(p0, p1, h, m, n, ds_u, dh_u) {

  let nx = p1[0] - p0[0],
      ny = p1[1] - p0[1];
  let nl = Math.sqrt(nx*nx + ny*ny);

  let dx = -ny / nl,
      dy =  nx / nl;

  let _s = writheLine(p0, p1, m, n , ds_u, dh_u);
  let _p = writheLine([p1[0] + dx, p1[1] + dy], [p0[0] +dx, p0[1] + dy], m, n , ds_u, dh_u);
  for (let i=0; i<_p.length; i++) {
    _s.push( [_p[i][0], _p[i][1]] );
  }
  _s.push( [_s[0][0], _s[0][1]] );
  return _s;

  let L = _s.length;
  for (let i=0; i<L; i++) {
    _s.push( [ _s[L-i-1][0] + dx, _s[L-i-1][1] + dy] );
  }
  _s.push( [_s[0][0], _s[0][1]] );
  return _s;
}

function writheArcBanner(p0, r, theta_s, theta_d, h, m, n, dh_u, da_u) {
  let _p = writheArc(p0, r, theta_s, theta_d, m, n, dh_u, da_u);
  let c = h/r;


  let L = _p.length;
  for (let i=0; i<L; i++) {
    _p.push( [ c*_p[L-i-1][0], c*_p[L-i-1][1] ] );
  }
  _p.push( [ _p[0][0], _p[0][1] ] );
  return _p;
}

function test__() {
  let _s;

  _s = writheLineBanner([0,0], [30,3], 0.125, 7, 8, 0.25, 0.25, Math.PI/8.0);
  for (let i=0; i<_s.length; i++) {
    console.log(_s[i][0], _s[i][1]);
  }
  process.exit();

  _s = writheArcBanner([0,0], 15, Math.PI/3.0, Math.PI/3.0, 14.75, 4, 32, 1/8.0);
  for (let i=0; i<_s.length; i++) {
    console.log(_s[i][0], _s[i][1]);
  }
  console.log("")
  process.exit();

  //let _s = writheArc([0,0], 15, 0.0, Math.PI/2.0, 4, 32, 1/8.0);
  _s = writheArc([0,0], 15, Math.PI/3.0, Math.PI/3.0, 4, 32, 1/8.0);
  for (let i=0; i<_s.length; i++) {
    console.log(_s[i][0], _s[i][1]);
  }
  console.log("")

  let _f = .983;
  for (let i=0; i<_s.length; i++) {
    console.log(_f*_s[i][0], _f*_s[i][1]);
  }
  console.log("")

  /*
  _s = writheArc([0,0], 14.75, Math.PI/3.0, Math.PI/3.0, 4, 32, 1/8.0);
  for (let i=0; i<_s.length; i++) {
    console.log(_s[i][0], _s[i][1]);
  }
  console.log("")
  */

  process.exit();



  /*
  //writheLine(4, [0,0], [10,3], 12, 0.25, 0.25, Math.PI/8.0);
  let _s = writheLine([0,0], [10,3], 7, 8, 0.25, 0.25, Math.PI/8.0);
  for (let i=0; i<_s.length; i++) {
    console.log(_s[i][0], _s[i][1]);
  }


  process.exit();
  */
}

function poly_path(n,T,m,u) {
  m = ((typeof m === "undefined") ? 1 : m);
  u = ((typeof u === "undefined") ? 1.0 : u);

  let c = [];
  for (let i=0; i<m; i++) {
    c.push( (Math.random() - 0.5)*u );
  }

  let p = [];
  for (let i=0; i<n; i++) {

    let x0 = T*i/(n-1),
        x = 1.0,
        y = 0;
    for (let j=0; j<m; j++) {
      y += c[j]*x;
      x *= x0;
    }

    y *= (x0)*(T - x0);
    p.push([x0, y]);
  }

  return p

}

/*
let _p = [];

//_p = poly_path(100, 10, 2, 0.025);
_p = poly_path(100, 10, 1, 0.025);
for (let i=0; i<_p.length; i++) {
  console.log(_p[i][0], _p[i][1]);
}
process.exit();

_p = brownian_bridge(1000,10.0, 0.0, 0.0, 0.0, 1.0);
for (let i=0; i<_p.length; i++) {
  console.log(_p[i][0], _p[i][1]);
}
process.exit();
*/

function _write_img(ctx, fn) {
  let buf = canvas.toBuffer("image/png");
  fs.writeFileSync(fn, buf);
}

// crazyLine
// Ported from Crazyline. By Steve Hanov, 2008
// http://stevehanov.ca/blog/index.php?id=33
// Originally released to the public domain.
//
function crazyLine(fromX, fromY, toX, toY) {

  // The idea is to draw a curve, setting two control points at random 
  // close to each side of the line. The longer the line, the sloppier it's drawn.
  var control1x, control1y;
  var control2x, control2y;

  // calculate the length of the line.
  var length = Math.sqrt( (toX-fromX)*(toX-fromX) + (toY-fromY)*(toY-fromY));
  
  // This offset determines how sloppy the line is drawn. It depends on the 
  // length, but maxes out at 20.
  var offset = length/20;
  if (offset > 20) { offset = 20; }

  // Overshoot the destination a little, as one might if drawing with a pen.
  toX += (Math.random())*offset/4;
  toY += (Math.random())*offset/4;

  var t1X = fromX, t1Y = fromY;
  var t2X = toX, t2Y = toY;

  // t1 and t2 are coordinates of a line shifted under or to the right of 
  // our original.
  t1X += offset;
  t2X += offset;
  t1Y += offset;
  t2Y += offset;

  // create a control point at random along our shifted line.
  var r = Math.random();
  control1X = t1Y + r * (t2X-t1X);
  control1Y = t1Y + r * (t2Y-t1Y);

  // now make t1 and t2 the coordinates of our line shifted above 
  // and to the left of the original.

  t1X = fromX - offset;
  t2X = toX - offset;
  t1Y = fromY - offset;
  t2Y = toY - offset;

  // create a second control point at random along the shifted line.
  r = Math.random();
  control2X = t1X + r * (t2X-t1X);
  control2Y = t1Y + r * (t2Y-t1Y);

  return new bez.Bezier(fromX,fromY, control1X,control1Y, control2X,control2Y, toX,toY);
}

function wobbleArc(cx, cy, r, rad_s, rad_d, urange, n_control, n_sample) {
  cx = ((typeof cx === "undefined") ? 0.0 : cx );
  cy = ((typeof cy === "undefined") ? 0.0 : cy );
  r = ((typeof r === "undefined") ? 1.0 : r );
  rad_s = ((typeof rad_s === "undefined") ? 0.0 : rad_s );
  rad_d = ((typeof rad_d === "undefined") ? (Math.PI*2.0)  : rad_d );
  urange = ((typeof urange === "undefined") ? 1.0 : urange);
  n_contol = ((typeof n_control === "undefined") ? 8 : n_control);
  n_sample = ((typeof n_sample === "undefined") ? 32 : n_sample);

  let p = [];

  //p.push( [ cx + Math.cos(rad_s)*r , cy + Math.sin(rad_s)*r ] );

  for (let i=0; i<n_sample; i++) {
    let theta = rad_s + (rad_d*(i/(n_sample-1)));
    p.push( [ cx + Math.cos(theta)*r, cy + Math.sin(theta)*r ] )
  }

  return p;
}

function crazyArc(centerX, centerY, radius, angleStart, angleDelta) {

  // The idea is to draw a curve, setting two control points at random 
  // close to each side of the line. The longer the line, the sloppier it's drawn.
  var control1x, control1y;
  var control2x, control2y;

  // calculate the length of the line.
  var length = Math.sqrt( (toX-fromX)*(toX-fromX) + (toY-fromY)*(toY-fromY));
  
  // This offset determines how sloppy the line is drawn. It depends on the 
  // length, but maxes out at 20.
  var offset = length/20;
  if (offset > 20) { offset = 20; }

  // Overshoot the destination a little, as one might if drawing with a pen.
  toX += (Math.random())*offset/4;
  toY += (Math.random())*offset/4;

  var t1X = fromX, t1Y = fromY;
  var t2X = toX, t2Y = toY;

  // t1 and t2 are coordinates of a line shifted under or to the right of 
  // our original.
  t1X += offset;
  t2X += offset;
  t1Y += offset;
  t2Y += offset;

  // create a control point at random along our shifted line.
  var r = Math.random();
  control1X = t1Y + r * (t2X-t1X);
  control1Y = t1Y + r * (t2Y-t1Y);

  // now make t1 and t2 the coordinates of our line shifted above 
  // and to the left of the original.

  t1X = fromX - offset;
  t2X = toX - offset;
  t1Y = fromY - offset;
  t2Y = toY - offset;

  // create a second control point at random along the shifted line.
  r = Math.random();
  control2X = t1X + r * (t2X-t1X);
  control2Y = t1Y + r * (t2Y-t1Y);

  return new bez.Bezier(fromX,fromY, control1X,control1Y, control2X,control2Y, toX,toY);
}


//  https://stackoverflow.com/a/18690585
// CC-BY-SA user1693593
//
function handDrawnArc(cx, cy, r, a_s, a_e) {

  let x, y,                                      /// the calced point
      tol = Math.random() * (r * 0.03) + (r * 0.025), ///tolerance / fluctation
      dx = Math.random() * tol * 0.75,           /// "bouncer" values
      dy = Math.random() * tol * 0.75,
      ix = (Math.random() - 1) * (r * 0.0044),   /// speed /incremental
      iy = (Math.random() - 1) * (r * 0.0033),
      rx = r + Math.random() * tol,              /// radius X 
      ry = (r + Math.random() * tol) * 0.8,      /// radius Y
      a = 0,                                     /// angle
      ad = 3*Math.PI/180.0,                                    /// angle delta (resolution)
      i = 0,                                     /// counter
      start = Math.random() + 50,                /// random delta start
      tot = 360 + Math.random() * 50 - 100,  /// end angle
      points = [],                               /// the points array
      deg2rad = Math.PI / 180;                   /// degrees to radians

  let n = Math.floor( Math.abs((a_e - a_s)/ad) + 0.5 );


  for (let idx=0; idx < n; idx++) {
    dx += ix;
    dy += iy;

    if (dx < -tol || dx > tol) ix = -ix;
    if (dy < -tol || dy > tol) iy = -iy;

    let cur_ang = a_s + ((i*(a_e - a_s))/n);

    x = cx + (rx + dx * 2) * Math.cos(cur_ang);
    y = cy + (ry + dy * 2) * Math.sin(cur_ang);

    //points.push(x, y);
    points.push(x);
    points.push(y);
  }

  for (let i=0; i<points.length; i+=2) {
    console.log(points[i], points[i+1]);
  }

  return points;
}

function drawHumanLine(ctx, srcx,srcy, dstx,dsty, subdiv) {
  subdiv = ((typeof subdiv === "undefined") ? 64 : subdiv);
  var cl = crazyLine(srcx,srcy, dstx,dsty);
  ctx.beginPath();
  let lut = cl.getLUT(subdiv);
  ctx.moveTo(lut[0].x, lut[0].y);
  for (let ii=1; ii<lut.length; ii++) {
    ctx.lineTo(lut[ii].x, lut[ii].y);
  }
  ctx.stroke();
}

function bez_example(ctx) {

  //var b = new bez.Bezier(

}


function drawHouseOutline(ctx, lx, ly, w, h, roofh) {

  let p;

  p = writheLine([lx, ly], [lx+w,ly+0]);
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
  console.log();

  p = writheLine([lx+w, ly], [lx+w,ly+h]);
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
  console.log();

  p = writheLine([lx+w, ly+h], [lx+w/2,ly+h+roofh]);
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
  console.log();

  p = writheLine([lx+w/2, ly+h+roofh], [lx,ly+h]);
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
  console.log();

  p = writheLine([lx, ly+h], [lx,ly]);
  for (let i=0; i<p.length; i++) {
    console.log(p[i][0], p[i][1]);
  }
  console.log();

}

drawHouseOutline(undefined, 0, 0, 10, 10, 5);
process.exit();



var info = {
  "width": 512,
  "height":512
};

var canvas = _canvas.createCanvas(info.width, info.height);
var ctx = canvas.getContext("2d");

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, 50, 50);


let cx = 512/2;
let cy = 512/2;
let rad = 30;
let rho_s = Math.pi/4.0;
let rho_e = Math.pi/6.0;

let dx_s = Math.cos(rho_s)*rad;
let dy_s = Math.sin(rho_s)*rad;

let dx_e = Math.cos(rho_e)*rad;
let dy_e = Math.sin(rho_e)*rad;

//drawHumanLine(ctx, 20, 20, 100, 200);
//drawHumanLine(ctx, 20, 20, 100, 200);
//drawHumanLine(ctx, 20, 20, 100, 200);
//_write_img(ctx, "./out.png");

//let p = handDrawnArc(256, 256, 100, Math.PI/3.0, Math.PI);
//console.log(p);

//let pz = carzyArc(100, 100, 50, 0, 40);

/*
let p = wobbleArc(0, 0, 4, Math.PI / 8, Math.PI / 3.0 );
for (let i=0; i<p.length; i++) {
  console.log(p[i][0], p[i][1]);
}
*/


/*(
_canvas.loadImage("./3cat-hart.png").then(img => {
  ctx.drawImage(img, 128, 128, 256, 256);
});
*/

