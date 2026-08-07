
var CANVAS_ID = 'twojs_canvas';

var g_ctx = {
  "canvas_id": CANVAS_ID,
  "two": null,
  "merw_info": {},

  "ok": 0,
  "rect_tjs": [],

  "gnuplot_print" : false
};

//  https://stackoverflow.com/a/17243070
// From user Paul S. (https://stackoverflow.com/users/1615483/paul-s)
//
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
 * 0 <= h,s,v, <=1
*/
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) { s = h.s, v = h.v, h = h.h; }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}



if (typeof njs !== "undefined") { var njs = null; }
if (typeof numeric !== "undefined") { njs = numeric; }

function print_grid( grid ) {
  let X = grid[0].length,
      Y = grid.length;

  for (let y=0; y<Y; y++) {
    let a = [];
    for (let x=0; x<X; x++) {
      a.push( (grid[y][x] < 0) ? '*' : '_' );
    }
    console.log("#", a.join(""));
  }

}

function lambda_psi_estimate(A, T) {
  let v = [];
  let n = A.length;
  for (let i=0; i<n; i++) { v.push( Math.random() ); }

  let lambda = njs.norm2(v);
  v = njs.mul( 1/lambda, v);

  for (let t=0; t<T; t++) {
    let u = njs.dot(A, v);
    lambda  = njs.norm2(u);
    u = njs.mul(1/lambda, u);
    let d = 0;
    for (let i=0; i<n; i++) { d += Math.abs(u[i]-v[i]); };
    v = u;
  }

  return { "lambda" : lambda, "psi": v };
}


function mdist1(ixy,jxy,X,Y) {
  let idir_v = [ [1,0], [-1,0], [0,1], [0,-1] ];
  for (let idir=0; idir<idir_v.length; idir++) {
    let u = njs.add( ixy, idir_v[idir] );
    u[0] = (u[0] + X)%X;
    u[1] = (u[1] + Y)%Y;
    if ((u[0] == jxy[0]) && (u[1] == jxy[1])) { return 1; }
  }
  return 0;
}

function init_grid() {
  let X = 40, Y = 40;
  let grid = [];
  let gridF = [];

  let _eps = (1/(1024*1024*1024));

  for (let y=0; y<Y; y++) {
    grid.push([]);
    gridF.push([]);
    for (let x=0; x<X; x++) {
      grid[y].push(0);
      gridF[y].push(0);
    }
  }

  let q = 0.1;
  let q_count = 0;

  let ixy2idx = {};
  let idx2ixy = {};
  let n_idx = 0;

  for (let y=0; y<Y; y++) {
    for (let x=0; x<X; x++) {
      let p = Math.random();
      if (p < q) { grid[y][x] = -1; q_count++;  continue; }

      let key = x.toString() + ":" + y.toString();
      ixy2idx[key] = n_idx;
      idx2ixy[n_idx] = [x,y];
      n_idx++;

    }
  }

  //print_grid( grid );

  let A = [];
  for (let i=0; i<n_idx; i++) {
    let ixy = idx2ixy[i];

    A.push([]);
    for (let j=0; j<n_idx; j++) {
      A[i].push(0);

      let jxy = idx2ixy[j];

      if ((ixy[0] == jxy[0]) &&
          (ixy[1] == jxy[1])) { continue; }

      let _f = 0;

      if (mdist1(ixy,jxy,X,Y)) {
        A[i][j] = 1;
        _f = 1;
      }

    }
  }


  for (let i=0; i<A.length; i++) {
    let c = 0;
    for (let j=0; j<A[i].length; j++) {
      c += ((A[i][j] > 0.5) ? 1 : 0);
    }

    //if (c==0) { console.log("#!!!!!!i:", i, c); }
  }

  return {
    "A": A,
    "X": X,
    "Y": Y,
    "idx2ixy" : idx2ixy,
    "ixy2idx" : ixy2idx,
    "n_idx": n_idx,
    "grid": grid,
    "gridF": gridF
  };

}

function init_U( ctx ) {

  let A = ctx.A;
  let idx2ixy = ctx.idx2ixy;
  let n_idx = ctx.A.length;

  let res = lambda_psi_estimate(A, 1000);

  let psi = res.psi;

  let U = [];
  for (let i=0; i<n_idx; i++) {
    U.push([]);

    let s = 0;
    let ixy = idx2ixy[i];
    for (let j=0; j<n_idx; j++) {
      if (A[i][j] == 0) { continue; }

      let jxy = idx2ixy[j];
      let m = U[i].length;

      U[i].push( {"idx": j, "xy": jxy, "p": (res.psi[j] / (res.lambda*res.psi[i])), "s": s } );
      s += U[i][m].p;
    }

  }

  ctx["U"] = U;
  ctx["lambda"] = res.lambda;
  ctx["psi"] = res.psi;

  return ctx;
}

var walk_i = 0;

function walk( ctx, n_it ) {

  let pos = ctx.pos;
  let gridF = ctx.gridF;
  let grid = ctx.grid;
  let idx2ixy = ctx.idx2ixy;
  let U = ctx.U;
  let psi = ctx.psi;

  pos = Math.floor( Math.random() * ctx.A.length );

  console.log("walk:", walk_i, "pos:", pos, "n_it:", n_it );
  walk_i++;

  //let n_it = 100000;
  //let pos = Math.floor( n_idx * Math.random() );

  for (let it=0; it < n_it; it++) {

    let src_xy = idx2ixy[pos];
    gridF[ src_xy[1] ][ src_xy[0] ]++;

    let u_info = U[pos];

    let u_idx = 0;
    let p = Math.random();
    for (; u_idx<(u_info.length-1); u_idx++) {
      if ( (p > u_info[u_idx].s) && (p < u_info[u_idx+1].s) ) { break; }
    }

    pos = u_info[u_idx].idx;
    ctx.pos = pos;

    //console.log(pos);

  }

  /*
  if (g_ctx.gnuplot_print) {
    for (let y=0; y<Y; y++) {
      for (let x=0; x<X; x++) {
        console.log(x, y, gridF[y][x]);
      }
    }
  }
  */


  /*
  let zc = 0;
  for (let i=0; i<psi.length; i++) {
    if (psi[i] < (1/(1024*1024))) { zc++; }
  }
  */


  //return { "psi": psi, "lambda": res.lambda, "A": A, "U": U, "grid": grid, "gridF": gridF };
}

function initTwoJS() {
  let two = new Two({"fitted":true});

  let ele = document.getElementById(CANVAS_ID);
  two.appendTo(ele);

  /*

  // centered at (150,150)
  // be careful with using rgba for color as this has problems
  // with converting to SVG. Better to use opacity explicitely
  //
  let rect = two.makeRectangle(150,150,100,80);
  rect.fill = "rgb(32,50,70)";
  rect.linewidth = 10;
  rect.stroke = "rgb(50,32,60)";
  rect.opacity = 0.9;

  let circle = two.makeCircle(150,150,5);
  circle.noStroke();
  circle.fill = "rgb(200,200,200)";
  circle.opacity = 0.8;
  */

  let frame = two.makeRectangle( two.width/2, two.height/2, two.width, two.height );
  frame.linewidth = 2;
  frame.noFill();



  g_ctx.merw_info = init_grid();
  g_ctx.merw_info = init_U(g_ctx.merw_info);

  g_ctx.merw_info["pos"] = Math.floor( g_ctx.merw_info.A.length * Math.random() );
  g_ctx.merw_info["it"] = 0;
  g_ctx.merw_info["d_it"] = 1000;
  g_ctx.merw_info["n_it"] = 1000000;

  two.update();

  g_ctx.two = two;

  requestAnimationFrame(walk_cb);
}

function walk_cb(ts) {

  let two = g_ctx.two;
  let info = g_ctx.merw_info;

  let d_it = info.d_it;

  walk( info, d_it );
  info.it += d_it;

  let grid = info.grid;
  let gridF = info.gridF;

  let Y = grid.length;
  let X = grid[0].length;

  let ds = 8;
  let cx = 100,
      cy = 100;

  let lw = 2;

  let max_f = 1;
  for (let y=0; y<Y; y++) {
    for (let x=0; x<X; x++) {
      max_f = Math.max( max_f, gridF[y][x] );
    }
  }


  if (g_ctx.ok == 0) {

    for (let y=0; y<Y; y++) {
      g_ctx.rect_tjs.push([]);
      for (let x=0; x<X; x++) {




        let _r = two.makeRectangle( cx + ds*x + (lw), cy + ds*y + (lw), ds-(lw), ds - (lw) );
        //_r.noFill();
        _r.linewidth = lw;
        _r.stroke = ((grid[y][x] < 0) ? "rgb(100,100,100)" : "rgb(255,255,255)" );

        if (gridF[y][x] > 0) {
          let v = gridF[y][x] / max_f ;
          let rgb = HSVtoRGB( 0, v, 1 );

          let c = "rgb(" + rgb.r.toString() + "," + rgb.g.toString() + "," + rgb.b.toString() + ")";
          _r.fill = c;
          _r.stroke = c;
        }
        else { _r.noFill(); }

        g_ctx.rect_tjs[y].push( _r );

      }
    }

  }

  else {
    for (let y=0; y<Y; y++) {
      for (let x=0; x<X; x++) {

        let _r = g_ctx.rect_tjs[y][x];

        if (gridF[y][x] > 0) {
          let v = gridF[y][x] / max_f ;
          let rgb = HSVtoRGB( 0, v, 1 );

          let c = "rgb(" + rgb.r.toString() + "," + rgb.g.toString() + "," + rgb.b.toString() + ")";
          _r.fill = c;
          _r.stroke = c;
        }
        else { _r.noFill(); }

      }
    }

  }

  g_ctx.ok = 1;

  two.update();

  if (info.it < info.n_it) { requestAnimationFrame(walk_cb); }
}


function export_f() {
}

function cli_main(argv) {

  g_ctx.gnuplot_print = true;
  njs = require("./numeric.js");
  init_grid();
}

if      (typeof require === "undefined")  { export_f(); }
else if (require.main === module)         { cli_main(process.argv.slice(1)); }
else                                      { export_f(); }
