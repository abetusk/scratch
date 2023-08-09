// LICENSE: cc0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
//
//
//
// For reference, see:
//
//  * https://archive.org/details/stylesofornament00spel_0/page/276/mode/1up
//  * https://archive.org/details/handbookoforname1900meye/page/180/mode/1up
//  * https://archive.org/details/handbookofarchit00rose/page/503/mode/thumb
//

// pill

// column_0
// column_0_b
// column_0_m
// column_0_t
// arch_half_r0
// arch_half_l0
// arch_door_0
// arch_door_1
// stair_0
// block_0

// unless otherwise specified, x-y plane is on the floor (x right, y back)
// with z pointing upwards
//

var jscad = require('@jscad/modeling')
var io = require("@jscad/io");
const stlSerializer = require('@jscad/stl-serializer')


const { cube } = jscad.primitives

function triangulate(geom) {
  let vert = [];
  let p = jscad.modifiers.generalize({snap:true, triangulate:true}, geom).polygons;

  for (let i=0; i<p.length; i++) {
    for (let j=0; j<p[i].vertices.length; j++) {
      for (let k=0; k<p[i].vertices[j].length; k++) {
        vert.push(p[i].vertices[j][k]);
      }
    }
  }

  return vert;
}

function vert_to_gnuplot(v) {
  for (let i=0; i<v.length; i+=3) {
    if ((i%9)==0) { console.log("\n"); }
    console.log(v[i+0], v[i+1], v[i+2]); 
  }
}

function toobj(geom) {
  let obj_txt_out = io.objSerializer.serialize({}, geom);
  console.log(obj_txt_out.join("\n"));
}

function tostl(geom) {
  let stl_out = stlSerializer.serialize({binary: false}, geom);
  console.log(stl_out.join("\n"));
}


function pill(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let _cr = ((typeof info.r === "undefined") ? 0.25 : info.r );
  let _zr = ((typeof info.r_c === "undefined") ? 0.125 : info.r_c );
  let _h = ((typeof info.h === "undefined") ? 1 : info.h);
  let _h2 = _h/2;
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);

  //let seg = 64;
  //let seg = 32;

  let top_sphere = jscad.primitives.ellipsoid({"radius":[_cr,_cr,_zr], "center":[0,0,_h2-_zr], "segments":seg});
  let bot_sphere = jscad.primitives.ellipsoid({"radius":[_cr,_cr,_zr], "center":[0,0,-_h2+_zr], "segments":seg});
  let cyl = jscad.primitives.cylinder({"radius":_cr, "height":_h-2*_zr, "segments":seg, "center":[0,0,0]});

  let u = jscad.booleans.union( jscad.booleans.union( cyl, top_sphere ), bot_sphere );

  return u;
}

// looks to be a midsection, not a bsae?
//
function neocal_pillar_base() {

  let r = 0.25;
  let h = 1;
  //let seg = 64;
  let seg = 32;
  //let seg = 16;

  let pill_seg = 32;
  let pill_r = 1/32;
  let pill_h = h-(1/32);

  let p = pill({"h":pill_h, "r":pill_r, "r_c":pill_r/2, "segments":pill_seg});

  let cyl = jscad.primitives.cylinder({"radius":r, "height":h, "segments":64, "center":[0,0,0], "segments":seg});

  let dr = pill_r / (1.25);

  let n = Math.floor( Math.PI*2*r / (1.75*dr) );

  //let n = 16;
  for (let i=0; i<n; i++) {
    //console.log("i:", i, "/", n);

    let dx = (r+dr)*Math.cos(Math.PI*2*i/n);
    let dy = (r+dr)*Math.sin(Math.PI*2*i/n);

    let pp = jscad.transforms.translate([dx,dy,0], p);

    cyl = jscad.booleans.subtract( cyl, pp );

  }

  return cyl
}

// fat disc
//
function neocal_pillar_part_pancake(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/32) : info.h);;
  let r = ((typeof info.r === "undefined") ? (0.25) : info.r);
  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);

  let r_i = ((typeof info.r_i === "undefined") ? (2*h/3) : info.r_i);

  let cyl_h = h;

  let h2 = h/2;

  let el = jscad.primitives.ellipse({"radius": [r_i,h2], "center":[r-r_i,0]});
  let sn = jscad.extrusions.extrudeRotate({"segments":seg}, el);

  let cyl = jscad.primitives.cylinder({"radius":r-r_i,"height":cyl_h, "center":[0,0,0], "segments": seg});
  let _res = jscad.transforms.translate( center, jscad.booleans.union( cyl, sn ) );

  return _res;
}

// trapezoidal like structure, rounded top, goes to shar square at (smaller)
// bottom
//
function neocal_pillar_part_flare_square(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/7) : info.h);
  let r = ((typeof info.r === "undefined") ? (1/(1.75*32)) : info.r);
  let dx = ((typeof info.dx === "undefined") ? (0.5) : info.dx);
  let dy = ((typeof info.dy === "undefined") ? (0.5) : info.dy);
  let c_w = ((typeof info.c_w === "undefined") ? (2/3) : info.c_w);
  let c_h = ((typeof info.c_h === "undefined") ? (1/32) : info.c_h);
  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);

  //let h_flare = ((typeof info.h_flare === "undefined") ? (1/8) : info.h_flare);

  dx -= r;
  dy -= r;

  //let r = (1/(1.75*32));
  //let dx = 0.5 - r;
  //let dy = 0.5 - r;

  //let c_w = (2/3);
  //let c_h = (1/32);
  //let dh = (1/8);
  let dh = h/2;

  let s0 = jscad.primitives.sphere({"radius":r, "center":[-dx,-dy,dh-r]});
  let s1 = jscad.primitives.sphere({"radius":r, "center":[-dx, dy,dh-r]});
  let s2 = jscad.primitives.sphere({"radius":r, "center":[ dx,-dy,dh-r]});
  let s3 = jscad.primitives.sphere({"radius":r, "center":[ dx, dy,dh-r]});

  let cb = jscad.primitives.cuboid({"size": [c_w, c_w, c_h], "center": [0,0,-dh+c_h]});

  let _hull = jscad.hulls.hull(s0,s1,s2,s3, cb);
  let _res = jscad.transforms.translate( center, _hull );

  return _res;
}

// rouned square on tpo to flat circle underneath
//
function neocal_pillar_part_flare_circle(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/7) : info.h);
  let r = ((typeof info.r === "undefined") ? (1/(1.75*32)) : info.r);
  let dx = ((typeof info.dx === "undefined") ? (0.5) : info.dx);
  let dy = ((typeof info.dy === "undefined") ? (0.5) : info.dy);
  let c_r = ((typeof info.c_r === "undefined") ? (2/6) : info.c_r);
  let c_h = ((typeof info.c_h === "undefined") ? (1/32) : info.c_h);
  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);

  //let h_flare = ((typeof info.h_flare === "undefined") ? (1/8) : info.h_flare);

  dx -= r;
  dy -= r;

  //let r = (1/(1.75*32));
  //let dx = 0.5 - r;
  //let dy = 0.5 - r;

  //let c_w = (2/3);
  //let c_h = (1/32);
  //let dh = (1/8);
  let dh = h/2;

  let s0 = jscad.primitives.sphere({"radius":r, "center":[-dx,-dy,dh-r]});
  let s1 = jscad.primitives.sphere({"radius":r, "center":[-dx, dy,dh-r]});
  let s2 = jscad.primitives.sphere({"radius":r, "center":[ dx,-dy,dh-r]});
  let s3 = jscad.primitives.sphere({"radius":r, "center":[ dx, dy,dh-r]});

  let cb = jscad.primitives.cylinder({"radius":c_r, "height":c_h, "center": [0,0,-dh+c_h/2]});

  let _hull = jscad.hulls.hull(s0,s1,s2,s3, cb);
  let _res = jscad.transforms.translate( center, _hull );


  return _res;
}

function neocal_pillar_part_bstack(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/32) : info.h);

  let r_b = ((typeof info.r_b === "undefined") ? ((1/4) + (1/128)) : info.r_b);
  let r_u = ((typeof info.r_u === "undefined") ? (1/4) : info.r_u);

  let a_b = ((typeof info.a_b === "undefined") ? (0) : info.a_b);
  let a_u = ((typeof info.a_u === "undefined") ? (-Math.PI/2) : info.a_u);

  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);

  let A = ((typeof info.A === "undefined") ? 1 : info.A);

  let bseg = seg;

  let d_u = ((typeof info.d_u === "undefined") ? [ 0, -0.5] : info.d_u);
  let d_b = ((typeof info.d_b === "undefined") ? [ 0.5 ,0] : info.d_b);

  let l = Math.abs(r_u-r_b);
  let l2 = l/2;

  let h2 = h/2;

  A *= l2;


  /*
  if (typeof info.c !== "undefined") {
    if      (info.c == 0) { d_u = [0, -0.5]; d_b = [ 0.5, 0]; }
    else if (info.c == 1) { d_u = [-0.5, 0]; d_b = [ 0.5, 0]; }
    else if (info.c == 2) { d_u = [0, -0.5]; d_b = [ 0, 0.5]; }
    else if (info.c == 3) { d_u = [-0.5, 0]; d_b = [ 0, 0.5]; }
    else if (info.c == 4) { d_u = [-0.5, 0]; d_b = [-0.5, 0]; }
  }

  let v_u = [ d_u[0]*(r_b - r_u), h*d_u[1] ];
  let v_b = [ d_b[0]*(r_b - r_u), h*d_b[1] ];
  let cp = [
    [ -r_b, -h/2 ],
    [ -r_b + v_b[0], -h/2 + v_b[1] ],
    [ -r_u + v_u[0], h/2 + v_u[1] ],
    [ -r_u, h/2 ],
  ];
  */

  let cp = [
    [ -r_b, -h2 ],
    [ -r_b + A*Math.cos(a_b), -h2 + A*Math.sin(a_b) ],
    [ -r_u + A*Math.cos(a_u),  h2 + A*Math.sin(a_u) ],
    [ -r_u,  h2 ],
  ];

  let bz = jscad.curves.bezier.create(cp);

  let pgn = [];

  for (let i=0; i<=bseg; i++) {
    pgn.push( jscad.curves.bezier.valueAt(1-i/bseg, bz) );
  }

  pgn.push( [ 0, -h/2 ] );
  pgn.push( [ 0,  h/2 ] );

  let shape = jscad.primitives.polygon({"points": pgn});

  let sn = jscad.extrusions.extrudeRotate({"segments":seg}, shape);
  let _res = jscad.transforms.translate( center, sn );

  return _res;
}


function neocal_pillar_test_top() {

  let cur_h = 1;

  let w = 1;
  let h = [1/8, 1/8, 1/128, 1/32];

  let w_mid = 2/3;
  let w_mid1 = 2/3 - (1/32);

  let part = [];

  cur_h -= h[0]/2;
  part.push( jscad.primitives.cuboid({"size": [w,w,h[0]], "center":[0,0,cur_h], "h":h[0]}) );
  cur_h -= h[0]/2;

  cur_h -= h[1]/2;
  part.push( pillar_part_flare_circle({"center":[0,0,cur_h], "c_r":w_mid/2, "h":h[1]}) );
  cur_h -= h[1]/2;

  cur_h -= h[2]/2;
  part.push( pillar_part_pancake({"center":[0,0,cur_h], "h":h[2], "r": w_mid/2 }) );
  cur_h -= h[2]/2;

  cur_h -= h[3]/2;
  part.push( pillar_part_bstack({"center":[0,0,cur_h], "h":h[3], "r_u": w_mid/2, "r_b": w_mid1/2}) );
  cur_h -= h[3]/2;


  let _res = jscad.booleans.union( part[0], part[1], part[2], part[3] );
  return _res;
}

function neocal_pillar_c_bot() {

  let n = 8;

  let r_start = 0.4;
  let r_end = 0.3;

  let h_dist = [1/8, 1/16, 10/128, 6/128, 3/128, 2/128 ];

  // c - column (cylinder)
  // g - glue (short cylinder)
  // p - pancake (fat cylinder)
  // b - bezier cylinder
  //

  let sched = [ "c", "p", "g", "b", "g", "p", "g", "b", "c" ];

}

function neocal_pillar_shelburne_bottom() {

  let seg = 64;

  let cur_h = -0.5;

  let _rest = 0;
  let h = [1/8, 5/64, 1/64, 1/16, 1/64, 3/64, 3/128, 3/128]; //, _rest];
  let r = [0.4,  0.4, 0.35, 0.32, 0.32, 0.34,  0.32,  0.30]; //, 0.3 ];

  let h_tot = 0;
  for (let i=0; i<h.length; i++) { h_tot += h[i]; };
  h.push(1-h_tot);
  r.push( r[ r.length-1 ] );

  let part = [];

  cur_h += h[0]/2;
  part.push( jscad.primitives.cylinder({"radius": r[0], "height":h[0], "center":[0,0,cur_h]}) );
  cur_h += h[0]/2;


  cur_h += h[1]/2;
  part.push( pillar_part_pancake({"center":[0,0,cur_h], "h":h[1], "r": r[1] }) );
  cur_h += h[1]/2;

  cur_h += h[2]/2;
  part.push( jscad.primitives.cylinder({"radius": r[2], "height":h[2], "center":[0,0,cur_h]}) );
  cur_h += h[2]/2;

  cur_h += h[3]/2;
  part.push( pillar_part_bstack({"center":[0,0,cur_h], "h":h[3], "a_u":0, "r_u": r[3], "a_b":0, "r_b": r[2], "A":2}) );
  cur_h += h[3]/2;

  cur_h += h[4]/2;
  part.push( jscad.primitives.cylinder({"radius": r[4], "height":h[4], "center":[0,0,cur_h]}) );
  cur_h += h[4]/2;

  cur_h += h[5]/2;
  part.push( pillar_part_pancake({"center":[0,0,cur_h], "h":h[5], "r": r[5] }) );
  cur_h += h[5]/2;

  cur_h += h[6]/2;
  part.push( jscad.primitives.cylinder({"radius": r[6], "height":h[6], "center":[0,0,cur_h]}) );
  cur_h += h[6]/2;

  cur_h += h[7]/2;
  part.push( pillar_part_bstack({"center":[0,0,cur_h], "h":h[7], "a_u":-Math.PI/2, "r_u": r[7], "a_b":0, "r_b": r[6] }) );
  cur_h += h[7]/2;

  cur_h += h[8]/2;
  part.push( jscad.primitives.cylinder({"radius": r[8], "height":h[8], "center":[0,0,cur_h], "segments": seg}) );
  cur_h += h[8]/2;

  let _res = jscad.booleans.union( part );
  //let _res = jscad.booleans.union( part[0], part[1], part[2], part[3], part[4], part[5], part[6] );
  //let _res = jscad.booleans.union( part[0], part[1], part[2], part[3] );
  //let _res = jscad.booleans.union( part[0], part[1] );
  return _res;

}

function neocal_column_mid_blasius_twist(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/32) : info.h);;
  let r = ((typeof info.r === "undefined") ? (0.25) : info.r);
  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);
  let ang = ((typeof info.a === "undefined") ? (-Math.PI/2) : info.a);
  let w = ((typeof info.w === "undefined") ? 0.5 : info.w);
  let r_c = ((typeof info.r_c === "undefined") ? (1/16) : info.r_c);

  let r_i = ((typeof info.r_i === "undefined") ? (2*h/3) : info.r_i);

  let cyl_h = h;

  let h2 = h/2;

  //let _r = 1/16;
  let _r = r_c;

  let part = [];

  //let ang = -Math.PI/2;

  //let w = 0.5;
  let w2 = w/2;

  let _ci = jscad.primitives.ellipse({"radius": [_r,_r], "center":[ -w2, -w2]});
  part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, _ci) );

  _ci = jscad.primitives.ellipse({"radius": [_r,_r], "center":[ -w2,  w2]});
  part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, _ci) );

  _ci = jscad.primitives.ellipse({"radius": [_r,_r], "center":[  w2, -w2]});
  part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, _ci) );

  _ci = jscad.primitives.ellipse({"radius": [_r,_r], "center":[  w2,  w2]});
  part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, _ci) );

  //let _rect = jscad.primitives.rectangle({"size": [0.5, 0.5], "center": [0,0]});
  let _rect = jscad.primitives.square({"size": w, "center": [0,0]});
  //let _rect = jscad.primitives.roundedRectangle({"size": [0.5,0.5], "roundRadius": 1/128, "center": [0,0], "segments":64});

  let pgn_n = 16,
      pgn_s = w;
  let pgn = [];
  let x0 = -w2, y0 = -w2;
  for (let i=0; i<pgn_n; i++) { pgn.push([ x0 + pgn_s*(i/pgn_n), y0 ]); }
  x0 =  w2; y0 = -w2
  for (let i=0; i<pgn_n; i++) { pgn.push([ x0, y0 + pgn_s*(i/pgn_n) ]); }
  x0 =  w2; y0 =  w2;
  for (let i=0; i<pgn_n; i++) { pgn.push([ x0 - pgn_s*(i/pgn_n), y0 ]); }
  x0 =  -w2; y0 = w2;
  for (let i=0; i<pgn_n; i++) { pgn.push([ x0, y0 - pgn_s*(i/pgn_n) ]); }

  let pgn_shape = jscad.primitives.polygon({ "points": pgn });

  //part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, _rect) );
  part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, pgn_shape) );

  //let _cb = jscad.primitives.cuboid({"size": [0.5,0.5,1/128], "center":[0,0,-0.5]});
  //part.push( jscad.extrusions.extrudeLinear({"height": 1.0, "twistAngle": ang, "twistSteps":32}, _cb) );

  let _res = jscad.booleans.union( part )

  return _res;
}

function neocal_twist_sq() {
  let pnt = [ ];
  let fce = [];

  let seg = 32;
  let dx = 0.5,
      dy = 0.5;

  let z0 = -0.5,
      dz = 1;

  seg = 4;

  //let v = Math.sqrt(2)/2;
  let v = Math.sqrt(dx*dx + dy*dy)

  let dst_a = 2*Math.PI;
  dst_a = Math.PI/8;

  let phi = Math.PI/2;
  let phi2 = 2*Math.PI/2;
  let phi3 = 3*Math.PI/2;

  for (let i=0; i<=seg; i++) {
    let a = ((i/seg)*dst_a) + (Math.PI/4);
    let z = (i/seg)*dz + z0;

    let _x = v*Math.cos(a);
    let _y = v*Math.sin(a);

    let xy0 = [ v*Math.cos(a),      v*Math.sin(a) ];
    let xy1 = [ v*Math.cos(a+phi),  v*Math.sin(a+phi) ];
    let xy2 = [ v*Math.cos(a+phi2), v*Math.sin(a+phi2) ];
    let xy3 = [ v*Math.cos(a+phi3), v*Math.sin(a+phi3) ];

    pnt.push( [ xy0[0], xy0[1],  z ] );
    pnt.push( [ xy3[0], xy3[1],  z ] );
    pnt.push( [ xy2[0], xy2[1],  z ] );
    pnt.push( [ xy1[0], xy1[1],  z ] );

    let i0 = 4*i+0;
    let i1 = 4*i+1;
    let i2 = 4*i+2;
    let i3 = 4*i+3;

    let j0 = 4*(i-1)+0;
    let j1 = 4*(i-1)+1;
    let j2 = 4*(i-1)+2;
    let j3 = 4*(i-1)+3;

    if (i==0) {
      fce.push( [ 0, 2, 1 ] );
      fce.push( [ 2, 0, 3 ] );
    }
    if (i==seg) {
      fce.push( [ i0, i2, i3 ] );
      fce.push( [ i0, i1, i2 ] );
    }

    if (i>0) {
      fce.push( [ i0, j0, j1 ] );
      fce.push( [ j1, i1, i0 ] );

      fce.push( [ i1, j1, j2 ] );
      fce.push( [ j2, i2, i1 ] );

      fce.push( [ i2, j2, j3 ] );
      fce.push( [ j3, i3, i2 ] );

      fce.push( [ i3, j3, j0 ] );
      fce.push( [ j0, i0, i3 ] );
    }

  }

  let shp = jscad.primitives.polyhedron({"points":pnt, "faces":fce, "orientation": "inward"});

  return shp;
}

// ioninic capital
function test_spiral() {

  let n = 1024;
  let a = 1;

  // goood
  let phi_c = 3.25;
  let alpha = 0.09;

  // experiment
  phi_c = 3.22;
  alpha = 0.07;

  //---

  //alpha = -0.5;
  //alpha = -1;

  let spiral_pnt = [];

  for (let i=0; i<n; i++) {
    let phi = phi_c*2*Math.PI*i/n;

    //let r = a*Math.pow(phi, alpha);
    let r = a*Math.pow(Math.exp(1), alpha*phi);

    let x = r*Math.cos(phi);
    let y = r*Math.sin(phi);

    spiral_pnt.push([x,y]);

    //console.log(x,y);
  }


  let dx = 6;
  let dy = 0;


  let pnt = [];
  for (let i=0; i<spiral_pnt.length; i++) {
    let x = spiral_pnt[i][0];
    let y = spiral_pnt[i][1];
    pnt.push([ x + dx, y + dy]);
  }

  let lst = spiral_pnt.length-1;
  let r_p = [ spiral_pnt[lst][0] + dx, spiral_pnt[lst][1] + dy ];
  let l_p = [-spiral_pnt[lst][0] - dx, spiral_pnt[lst][1] + dy ];

  let cp = [
    r_p,
    [ r_p[0] + (l_p[0] - r_p[0])/8, r_p[1] + (dx/8) ],
    [ l_p[0] + (r_p[0] - l_p[0])/8, l_p[1] + (dx/8) ],
    l_p
  ]


  let bz = jscad.curves.bezier.create(cp);

  let bseg = 8;
  for (let i=0; i<=bseg; i++) {
    pnt.push( jscad.curves.bezier.valueAt(i/bseg, bz) );
  }


  for (let i=(spiral_pnt.length-1); i>=0; i--) {
    let x = spiral_pnt[i][0];
    let y = spiral_pnt[i][1];
    pnt.push([ -x - dx, y + dy]);
  }

  for (let i=0; i<pnt.length; i++) {
    console.log(pnt[i][0], pnt[i][1]);
  }

  // note:
  // egg and dart
  // bead and reel

}

function neocal_column_end_0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  // bound box size
  //
  let default_info = {
    "size": [0.25, 0.25, 0.05],
    "columnRadius": 0.12/2,
    "roundRadius": 0.05/4,
    "segments": 32,
    "center": [0,0,0]
  };
  for (let _k in default_info) {
    info[_k] = default_info[_k];
    if (_k in _info) { info[_k] = _info[_k]; }
  }

  let h = info.size[2];

  let r = info.roundRadius;
  let dx = (info.size[0]/2) - r + info.center[0];
  let dy = (info.size[1]/2) - r + info.center[1];
  let dz = (info.size[2]/2) - r + info.center[2];

  let s0 = jscad.primitives.sphere({"radius":r, "center":[-dx, -dy, dz]});
  let s1 = jscad.primitives.sphere({"radius":r, "center":[ dx, -dy, dz]});
  let s2 = jscad.primitives.sphere({"radius":r, "center":[ dx,  dy, dz]});
  let s3 = jscad.primitives.sphere({"radius":r, "center":[-dx,  dy, dz]});

  let c_r = info.columnRadius;

  let cy = jscad.primitives.cylinder({"radius": c_r, "height": h, "center": [ info.center[0], info.center[1], info.center[2] ]});

  let _hull = jscad.hulls.hull(s0,s1,s2,s3, cy);
  return _hull;

}

function neocal_column_end_1(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  // bound box size
  //
  let default_info = {
    "size": [0.25, 0.25, 0.05],
    "columnRadius": 0.12/2,
    "capitalHeight": 0.05,
    "capitalWidth": .3,
    "segments": 32,
    "center": [0,0,0]
  };
  for (let _k in default_info) {
    info[_k] = default_info[_k];
    if (_k in _info) { info[_k] = _info[_k]; }
  }

  let w = info.capitalWidth;
  let h = info.size[2];

  let _ch = info.capitalHeight;
  let dx = (info.size[0]/2) - _ch + info.center[0];
  let dy = (info.size[1]/2) - _ch + info.center[1];
  let dz = (info.size[2]/2) - (_ch/2) + info.center[2];

  let _cuboid = jscad.primitives.cuboid({"size": [ w, w,  _ch], "center": [ 0,0,dz ]});

  let c_r = info.columnRadius;
  let cy = jscad.primitives.cylinder({"radius": c_r, "height": h, "center": [ info.center[0], info.center[1], info.center[2] ]});

  let _fin = jscad.booleans.union(_cuboid, cy);
  return _fin;
}

function neocal_column_center_1(_info) {
  return neocal_column_center_0(_info);
}

// top and bottom flange column are cylinders with
// donuts subtrated off of them, with angle of top
// flang intersection at pi/4.
//
function neocal_column_center_0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "height_mid": .8,
    "height_end": 0.05,
    //"innerRadius": 0.125,
    "outerRadius": 0.13,
    "segments": 32,

    "theta": Math.PI / 4.0,

    "pill_n" : 16,
    "pill_width_percent": 0.55,
    //"pill_cap": "blunt",
    "pill_cap": "sphere",
    "pill_segments": 16
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }



  let pill_n = info.pill_n;

  //let _seg = 32;
  let _seg = info.segments;

  //let t_ri_theta = Math.PI / 4.0;
  let t_ri_theta = info.theta;

  //let c_hm = 0.8;
  let c_hm = info.height_mid;

  //let c_ri = 0.125;
  //let c_ht = 0.05;
  let c_ht = info.height_end;

  //c_ri = info.innerRadius;


  let t_ri = c_ht / Math.sin(t_ri_theta);
  let c_del = c_ht / Math.tan( (Math.PI - t_ri_theta) / 2 );

  let c_ro = info.outerRadius;
  let c_ri = c_ro - c_del;

  //let c_ro = c_ri + c_del;

  let t_or = c_ri + t_ri;

  let c_circ_i = 2.0 * Math.PI * c_ri;


  let _top_c = jscad.primitives.cylinder({"radius": c_ro, "height":c_ht, "segments": _seg, "center":[ 0,0,  c_ht/2]});
  let _bot_c = jscad.primitives.cylinder({"radius": c_ro, "height":c_ht, "segments": _seg, "center":[ 0,0, -c_ht/2]});
  let _tor = jscad.primitives.torus({"innerRadius": t_ri, "outerRadius": t_or, "segments": _seg });

  //let _top = jscad.booleans.union( _top_c, _tor );
  let _top = jscad.transforms.translate([0,0, c_hm/2], jscad.booleans.subtract( _top_c, _tor ));
  let _bot = jscad.transforms.translate([0,0,-c_hm/2], jscad.booleans.subtract( _bot_c, _tor ));

  let _mid = jscad.primitives.cylinder({"radius": c_ri, "height": c_hm, "segments": _seg, "center":[0,0,0]});

  let _res = jscad.booleans.union([_top, _mid, _bot]);

  if (info.pill_n > 0) {

    //let _pill_r = 0.01;
    //let _pill_r = .75*(c_circ_i / pill_n)/2;
    let _pill_r = info.pill_width_percent*(c_circ_i / pill_n)/2;
    let _pill_h = c_hm - 0.015;
    //let _pill_seg = 16;
    let _pill_seg = info.pill_segments;

    let pill_geom = [];
    for (let i=0; i<pill_n; i++) {
      let _a = 2.0*Math.PI*i/pill_n;

      let _x = Math.cos(_a) * (c_ri);
      let _y = Math.sin(_a) * (c_ri);

      //let _x = Math.cos(_a) * (c_ri )
      //let _y = Math.sin(_a) * (c_ri );

      let _p = {};

      if (info.pill_cap == "blunt") {
        _p = jscad.transforms.translate([ _x, _y, 0], jscad.primitives.cylinder({"radius": _pill_r, "height": _pill_h, "segments": _pill_seg}));
      }
      else {
        _p = jscad.transforms.translate([ _x, _y, 0], pill({ "r": _pill_r, "r_c": _pill_r, "h": _pill_h, "segments": _pill_seg }));
      }

      pill_geom.push(_p);

    }

    _res = jscad.booleans.subtract( _res, pill_geom);

    //let _res = jscad.booleans.union( jscad.booleans.union([_top, _mid, _bot]), pill_geom);
    //let _res = jscad.booleans.union(pill_geom);

  }

  return _res;
}

function debug_marker(info) {
  info = ((typeof info === "undefined") ? {} : info);

  let cx = 0, cy = 0, cz = 0;

  if ("center" in info) {
    cx = info.center[0];
    cy = info.center[1];
    cz = info.center[2];
  }

  let ds = 1/64;

  let geom_list = [];

  for (let ix=0; ix<2; ix++) {
    for (let iy=0; iy<2; iy++) {
      for (let iz=0; iz<2; iz++) {

        let dx = (ix-0.5) + cx;
        let dy = (iy-0.5) + cy;
        let dz = (iz-0.5) + cz;

        let c = jscad.primitives.cube({"size":ds, "center": [dx, dy, dz]});
        geom_list.push(c);

      }
    }
  }


  return geom_list;
}

// base column 0
//
function neocal_column_2_b( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_2( info );

  _c = jscad.transforms.translate([0,0,0.5], _c);
  _c = jscad.transforms.scale([3,3,3], _c);
  _c = jscad.booleans.intersect( _c, jscad.primitives.cube({"size":1, "center":[0,0,0.5]}));
  _c = jscad.transforms.translate([0,0,-0.5], _c)

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }

  return _c;
}

// base column 0
//
function neocal_column_1_b( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_1( info );

  _c = jscad.transforms.translate([0,0,0.5], _c);
  _c = jscad.transforms.scale([3,3,3], _c);
  _c = jscad.booleans.intersect( _c, jscad.primitives.cube({"size":1, "center":[0,0,0.5]}));
  _c = jscad.transforms.translate([0,0,-0.5], _c)

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }

  return _c;
}

// base column 0
//
function neocal_column_0_b( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_0( info );

  _c = jscad.transforms.translate([0,0,0.5], _c);
  _c = jscad.transforms.scale([3,3,3], _c);
  _c = jscad.booleans.intersect( _c, jscad.primitives.cube({"size":1, "center":[0,0,0.5]}));
  _c = jscad.transforms.translate([0,0,-0.5], _c)

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }

  return _c;
}

// top column 0
//
function neocal_column_2_t( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_2_b( info );
  _c = jscad.transforms.rotateX( Math.PI, _c );

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }
  return _c;
}

// top column 0
//
function neocal_column_1_t( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_1_b( info );
  _c = jscad.transforms.rotateX( Math.PI, _c );

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }
  return _c;
}

// top column 0
//
function neocal_column_0_t( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_0_b( info );
  _c = jscad.transforms.rotateX( Math.PI, _c );

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }
  return _c;
}

// mid column 0
//
function neocal_column_2_m( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_2( info );

  _c = jscad.transforms.scale([3,3,3], _c);
  _c = jscad.booleans.intersect( _c, jscad.primitives.cube({"size":1}));

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }

  return _c;
}

// mid column 0
//
function neocal_column_1_m( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_1( info );

  _c = jscad.transforms.scale([3,3,3], _c);
  _c = jscad.booleans.intersect( _c, jscad.primitives.cube({"size":1}));

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }

  return _c;
}

// mid column 0
//
function neocal_column_0_m( _info ) {
  _info = ((typeof _info === "undefined") ? {} : _info);

  let info = Object.assign({}, _info);
  info.center = [0,0,0];

  let _c = neocal_column_0( info );

  _c = jscad.transforms.scale([3,3,3], _c);
  _c = jscad.booleans.intersect( _c, jscad.primitives.cube({"size":1}));

  if ("center" in _info) {
    _c = jscad.transforms.translate(_info.center, _c);
  }

  return _c;
}

function neocal_column_0( _info ) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "height_mid": .8,
    "height_end": 0.05,
    //"innerRadius": 0.125,
    "outerRadius": 0.13,
    "segments": 32,

    "center": [0,0,0],

    "theta": Math.PI / 4.0,

    "pill_n" : 16,
    "pill_width_percent": 0.55,
    //"pill_cap": "blunt",
    "pill_cap": "sphere",
    "pill_segments": 16
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }



  //let base_s = 0.18/2;
  let base_s = 0.3;
  let col_r = 0.15;
  let _seg = 32;

  let _top_h = 0.05;
  let _mid_ch = 0.8;
  let _mid_th = 0.05;

  let dz = (_mid_ch/2) + _mid_th + (_top_h/2);

  let _t = neocal_column_end_0({
    "size": [base_s, base_s, _top_h],
    "columnRadius": col_r,
    "roundRadius": _top_h/4,
    "segments": _seg,
    "center": [0,0, dz]
  });

  let _b = neocal_column_end_0({
    "size": [base_s, base_s, _top_h],
    "columnRadius": col_r,
    "roundRadius": _top_h/4,
    "segments": _seg,
    "center": [0,0, dz]
  });
  _b = jscad.transforms.rotateX(Math.PI, _b);

  let _m = neocal_column_center_0({
    "outerRadius": col_r,
    "height_mid": _mid_ch,
    "height_end": _mid_th
  });

  let _res = jscad.booleans.union(_t, _m, _b);

  _res = jscad.transforms.translate( info.center, _res);
  return _res;

}

function neocal_column_1( _info ) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "height_mid": .8,
    "height_end": 0.05,
    //"innerRadius": 0.125,
    "outerRadius": 0.13,
    "segments": 32,

    "center": [0,0,0],

    "theta": Math.PI / 4.0,

    "pill_n" : 16,
    "pill_width_percent": 0.55,
    //"pill_cap": "blunt",
    "pill_cap": "sphere",
    "pill_segments": 16
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  //let base_s = 0.18/2;
  let base_s = 0.3;
  let col_r = 0.15;
  let _seg = 32;

  let _top_h = 0.05;
  let _mid_ch = 0.8;
  let _mid_th = 0.05;

  let dz = (_mid_ch/2) + _mid_th + (_top_h/2);

  let _t = neocal_column_end_1({
    "size": [base_s, base_s, _top_h],
    "columnRadius": col_r,
    "capitalHeight": 0.05,
    "capitalWidth": 2*col_r*1.15,
    "segments": _seg,
    "center": [0,0, dz]
  });

  let _b = neocal_column_end_1({
    "size": [base_s, base_s, _top_h],
    "columnRadius": col_r,
    "capitalHeight": 0.05,
    "capitalWidth": 2*col_r*1.15,
    "segments": _seg,
    "center": [0,0, dz]
  });
  _b = jscad.transforms.rotateX(Math.PI, _b);

  let _m = neocal_column_center_1({
    "outerRadius": col_r,
    "height_mid": _mid_ch,
    "height_end": _mid_th
  });

  let _res = jscad.booleans.union(_t, _m, _b);

  _res = jscad.transforms.translate( info.center, _res);
  return _res;

}

function neocal_arch_half_r0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "segments":32,
    "rotateZ": 0,
    "center": [0,0,0],
    "radius": 0.85,
    "height": 0.85
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let h = info.height;
  let r = info.radius;
  let a = info.rotateZ;
  let _o = info.center;
  let _seg = info.segments;

  let _res = jscad.primitives.cuboid({"size":[1,1,1]});

  let _cyl = jscad.primitives.cylinder({"radius":r, "height":1.125, "segments":_seg});
  _cyl = jscad.transforms.rotateX(Math.PI/2, _cyl);
  _cyl = jscad.transforms.translate([-0.5, 0,-0.5 + h-r], _cyl);

  if ((h-r) > 0) {
    let _b = jscad.primitives.cuboid({"size":[2*r, 1.0, h-r], "center":[-0.5, 0, -0.5+((h-r)/2)]});
    _res = jscad.booleans.subtract(_res, _cyl, _b);
  }
  else {
    _res = jscad.booleans.subtract(_res, _cyl);
  }
  _res = jscad.transforms.rotateZ(a, _res);
  _res = jscad.transforms.translate(_o, _res);

  return _res;
}

function neocal_arch_half_l0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "segments":32,
    "rotateZ": 0,
    "center": [0,0,0],
    "radius": 0.85,
    "height": 0.85
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let h = info.height;
  let r = info.radius;
  let a = info.rotateZ;
  let _o = info.center;
  let _seg = info.segments;

  let _res = jscad.primitives.cuboid({"size":[1,1,1]});

  let _cyl = jscad.primitives.cylinder({"radius":r, "height":1.125, "segments":_seg});
  _cyl = jscad.transforms.rotateX(Math.PI/2, _cyl);
  _cyl = jscad.transforms.translate([ 0.5, 0,-0.5 + h-r], _cyl);

  if ((h-r) > 0) {
    let _b = jscad.primitives.cuboid({"size":[2*r, 1.0, h-r], "center":[ 0.5, 0, -0.5+((h-r)/2)]});
    _res = jscad.booleans.subtract(_res, _cyl, _b);
  }
  else {
    _res = jscad.booleans.subtract(_res, _cyl);
  }
  _res = jscad.transforms.rotateZ(a, _res);
  _res = jscad.transforms.translate(_o, _res);

  return _res;
}

function neocal_arch_door_1(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "rotateZ": 0,
    "center": [0,0,0],
    "radius": 0.35,
    "height": 0.8
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let h = info.height;
  let r = info.radius;
  let a = info.rotateZ;
  let _o = info.center;

  let _res = jscad.primitives.cuboid({"size":[1,1,1]});

  let _cyl0 = jscad.primitives.cylinder({"radius":r, "height":1.125});
  _cyl0 = jscad.transforms.rotateX(Math.PI/2, _cyl0);
  _cyl0 = jscad.transforms.translate([0,0,-0.5 + h-r], _cyl0);
  let _b0 = jscad.primitives.cuboid({"size":[2*r, 1.0, h-r], "center":[0, 0, -0.5+((h-r)/2)]});

  let _cyl1 = jscad.primitives.cylinder({"radius":r, "height":1.125});
  _cyl1 = jscad.transforms.rotateY(Math.PI/2, _cyl1);
  _cyl1 = jscad.transforms.translate([0,0,-0.5 + h-r], _cyl1);
  let _b1 = jscad.primitives.cuboid({"size":[1.0, 2*r, h-r], "center":[0, 0, -0.5+((h-r)/2)]});

  _res = jscad.booleans.subtract(_res, _cyl0, _b0, _cyl1, _b1);
  _res = jscad.transforms.translate(_o, _res);

  return _res;
}

function neocal_arch_door_0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "rotateZ": 0,
    "center": [0,0,0],
    "radius": 0.3,
    "height": 0.8
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let h = info.height;
  let r = info.radius;
  let a = info.rotateZ;
  let _o = info.center;

  let _res = jscad.primitives.cuboid({"size":[1,1,1]});
  let _cyl = jscad.primitives.cylinder({"radius":r, "height":1.125});
  _cyl = jscad.transforms.rotateX(Math.PI/2, _cyl);
  _cyl = jscad.transforms.translate([0,0,-0.5 + h-r], _cyl);

  let _b = jscad.primitives.cuboid({"size":[2*r, 1.0, h-r], "center":[0, 0, -0.5+((h-r)/2)]});

  _res = jscad.booleans.subtract(_res, _cyl, _b);
  _res = jscad.transforms.translate(_o, _res);

  return _res;
}

function neocal_stair_spiral_0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "innerRadius": 0.05,
    "outerRadius": 0.45,

    "rotateZ": 0,
    "center": [0,0,0],
    "stair_n" : 16
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let step_h = 1.0 / info.stair_n;
  let stair_n = info.stair_n;

  let r_i = info.innerRadius;
  let r_o = info.outerRadius;

  let _res = [];

  for (let idx=0; idx<stair_n; idx++) {
    let a0 = (idx / stair_n) * Math.PI * 2.0;
    let a1 = ((idx + 1) / stair_n) * Math.PI * 2.0;

    let x0i = r_i * Math.cos(a0);
    let y0i = r_i * Math.sin(a0);

    let x0o = r_o * Math.cos(a0);
    let y0o = r_o * Math.sin(a0);

    let x1i = r_i * Math.cos(a1);
    let y1i = r_i * Math.sin(a1);

    let x1o = r_o * Math.cos(a1);
    let y1o = r_o * Math.sin(a1);

    let pnts = [
      [ x0i, y0i ],
      [ x0o, y0o ],
      [ x1o, y1o ],
      [ x1i, y1i ]
    ];

    let dz = (idx / stair_n) - 0.5;

    let pgn = jscad.primitives.polygon({"points": pnts});
    let _step = jscad.extrusions.extrudeLinear({"height": step_h}, pgn);
    _step = jscad.transforms.rotateZ(info.rotateZ, _step);
    _step = jscad.transforms.translate([0,0,dz], _step);
    _step = jscad.transforms.translate( info.center, _step );

    _res.push(_step);

    //---

    if (idx==0)  { continue; }

    // backing/under polyhedron
    //

    let dzm = ((idx-1) / stair_n) - 0.5;

    let pnts3 = [
      [ x0i, y0i, dzm ],
      [ x0i, y0i, dz  ],

      [ x0o, y0o, dzm ],
      [ x0o, y0o, dz  ],

      [ x1i, y1i, dz ],
      [ x1o, y1o, dz ]

    ];

    let faces = [

      // back face
      //
      [ 0, 3, 1 ],
      [ 0, 2, 3 ],

      // side faces
      //
      [ 0, 1, 4 ],
      [ 3, 2, 5 ],

      // top face (not visible)
      //
      [ 1, 3, 4],
      [ 4, 3, 5],

      [ 0, 4, 2 ],
      [ 2, 4, 5 ]

    ];

    let pdn = jscad.primitives.polyhedron({"points": pnts3, "faces": faces });
    pdn = jscad.transforms.rotateZ(info.rotateZ, pdn);
    pdn = jscad.transforms.translate(info.center, pdn);
    _res.push(pdn);

  }

  return _res;
}


function neocal_stair_0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "rotateZ": 0,
    "center": [0,0,0],
    "stair_n" : 16,
    "width": 1
    //"width": 0.9
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let stair_n = info.stair_n;
  let w = info.width;

  let dx = 1/stair_n;
  let dy = 1/stair_n;

  let x = -0.5;
  let y = -0.5;


  let p2 = [];
  for (let i=0; i<stair_n; i++) {

    x = -0.5 + (i*dx);
    y = -0.5 + (i*dy);

    p2.push( [x, y] );
    p2.push( [x, y+dy] );
    p2.push( [x+dx, y+dy] );

  }

  p2.push( [0.5, -0.5 ] );

  p2.reverse();

  let _pgn = jscad.primitives.polygon({ "points": p2 });
  let _stair = jscad.extrusions.extrudeLinear({"height":w}, _pgn);
  let _res = jscad.transforms.translate([0,0,-w/2], _stair);
  _res = jscad.transforms.rotateX(Math.PI/2, _res);
  _res = jscad.transforms.rotateZ(Math.PI/2, _res);

  _res = jscad.transforms.rotateZ(info.rotateZ, _res);

  _res = jscad.transforms.translate( info.center, _res );

  return _res;

}

function neocal_block_0(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "size" : [1,1,1],
    "center": [0,0,0]
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  let _c = jscad.primitives.cuboid({"size":info.size, "center":info.center});
  return _c;

  //let _res = jscad.booleans.union( _c, marker());
  //return _res;
}

//-------------------------
//-------------------------
//-------------------------

function scene_experiment_0() {

  let dx = 2.0, dy = 2.0;

  dx = 1.0;
  dy = 1.0;

  //let _column = column_center_0();
  let _column = neocal_column_0();

  let n = 2;

  let o = [];
  for (i=0; i<n; i++) {
    for (j=0; j<n; j++) {
      o.push( jscad.transforms.translate([i*dx, j*dy, 0], _column) );
    }
  }

  return o;
  //return jscad.booleans.union(o);
}

function scene_experiment_1() {

  let dx=1, dy=1, dz=1;
  let nx = 4, ny = 3;

  let mx = nx/2 - 0.5;
  let my = ny/2 - 0.5;

  let geom = [];

  for (ix=0; ix<nx; ix++) {
    for (iy=0; iy<ny; iy++) {
      let x = dx*ix - mx;
      let y = dx*iy - my;

      let z = 1;

      geom.push( neocal_block_0({"center": [x,y,0]}) );

      geom.push( neocal_column_0({ "center": [x,y,z] }) );

    }
  }

  
  geom.push( neocal_stair_0({"center":[0,-2,0]}) );
  

  return geom;
}

function render_grid(gr, _info) {
  let info = Object.assign({}, _info);

  let center = [0,0,0];

  let geom = [];

  let dx = 1, dy = 1, dz = 1;

  let geom_lib = {
    "B": neocal_block_0(),

    "cb": neocal_column_0_b(),
    "cm": neocal_column_0_m(),
    "ct": neocal_column_0_t(),

    "Cb": neocal_column_1_b(),
    "Cm": neocal_column_1_m(),
    "Ct": neocal_column_1_t(),

    "Ib": neocal_column_2_b(),
    "Im": neocal_column_2_m(),
    "It": neocal_column_2_t(),

    "s0": neocal_stair_0({"rotateZ":  Math.PI}),
    "s1": neocal_stair_0({"rotateZ":  Math.PI/2}),
    "s2": neocal_stair_0(),
    "s3": neocal_stair_0({"rotateZ": -Math.PI/2}),

    "p3": neocal_stair_spiral_0(),
    "p2": neocal_stair_spiral_0({"rotateZ":  Math.PI/2}),
    "p1": neocal_stair_spiral_0({"rotateZ": -Math.PI/2}),
    "p0": neocal_stair_spiral_0({"rotateZ":  Math.PI}),

    "h0": neocal_arch_half_l0({"rotateZ": 0, "radius":1, "height":1}),
    "h1": neocal_arch_half_l0({"rotateZ":  Math.PI/2, "radius":1, "height":1 }),
    "h2": neocal_arch_half_l0({"rotateZ":  Math.PI  , "radius":1, "height":1 }),
    "h3": neocal_arch_half_l0({"rotateZ": -Math.PI/2, "radius":1, "height":1 })

  };

  for (let iz=0; iz<gr.length; iz++) {
    for (let iy=0; iy<gr[iz].length; iy++) {
      for (let ix=0; ix<gr[iz][iy].length; ix++) {

        let x = ix*dx + center[0];
        let y = iy*dy + center[1];
        let z = iz*dz + center[2];

        let _o = [ x, y, z ];

        let ele = gr[iz][iy][ix];

        //geom.push(marker({"center":_o}));

        //console.log(ix,iy,iz, ele);

        if (ele in geom_lib) {
          geom.push( jscad.transforms.translate( _o, geom_lib[ele] ) );
        }

        /*
        if      (ele == "cb") { geom.push( column_0_b({"center":_o}) ); }
        else if (ele == "cm") { geom.push( column_0_m({"center":_o}) ); }
        else if (ele == "ct") { geom.push( column_0_t({"center":_o}) ); }
        else if (ele == "B")  { geom.push( block_0({"center":_o}) ); }
        else if (ele == "s3") { geom.push( stair_0({"center":_o, "rotateZ": 0}) ); }
        else if (ele == "s2") { geom.push( stair_0({"center":_o, "rotateZ": Math.PI/2}) ); }
        else if (ele == "s1") { geom.push( stair_0({"center":_o, "rotateZ": Math.PI}) ); }
        else if (ele == "s0") { geom.push( stair_0({"center":_o, "rotateZ": -Math.PI}) ); }
        */

      }
    }
  }

  return geom;

}

function scene_experiment_2() {
  let g = [

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B", "s0",  "B",  "B",  "B" ]
    ],

    [
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "h1",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "h3",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ]
    ],

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B", "s0",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  ".",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  ".",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ]
    ],

    [
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "s1",  "B",  ".",  ".",  ".",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".", "s1", "h0",  ".", "h2",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".", "s1",  "B",  "B",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s1",  "B",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".", "s1",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ]
    ],

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  ".", "s1",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ]
    ]

  ];

  tostl(render_grid(g));

}

function scene_experiment_3() {
  let g = [

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B", "s0",  "B",  "B",  "B" ]
    ],

    [
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".", "p0",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".", "p0",  ".", "h1",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "h3",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".", "p0",  ".",  "B",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s0",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ],
      [  ".",  ".",  ".",  "B",  ".",  ".",  "." ],
      [  ".", "p0",  ".", "s0",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ]
    ],

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B", "s0",  "B",  "B",  "B" ],
      [  "B", "p0",  "B",  ".",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  ".",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ]
    ],

    [
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "s1",  "B",  ".",  ".",  ".",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cb",  ".",  ".",  ".",  ".",  ".", "cb" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".", "s1", "h0",  ".", "h2",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".", "s1",  "B",  "B",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".", "s1",  "B",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "cm",  ".",  ".",  ".",  ".",  ".", "cm" ]
    ],

    [
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".", "s1",  "B",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  "." ],
      [ "ct",  ".",  ".",  ".",  ".",  ".", "ct" ]
    ],

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  ".", "s1",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B" ]
    ]

  ];

  tostl(render_grid(g));

}

function scene_experiment_4() {
  let g = [

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],

      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "s0", "s0", "s0", "s0", "s0", "s0", "s0","s0","s0","s0","s0", "s0", "s0" ]
    ],

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],

      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "s0", "s0", "s0", "s0", "s0", "s0", "s0","s0","s0","s0","s0", "s0", "s0" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ],

    [
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "s0", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "s1",  ".", "s3", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "s1",  ".", "s3", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "s1",  ".", "s3", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "s2", "B", "B", "B", "B", "B", "B" ],

      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "B",  "B",  "B",  "B",  "B",  "B",  "B", "B", "B", "B", "B", "B", "B" ],
      [  "s0", "s0", "s0", "s0", "s0", "s0", "s0","s0","s0","s0","s0", "s0", "s0" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ],

    [
      [  "Ib",  "Ib",  "Ib",  "Ib", ".", ".", ".", ".", ".", "Ib", "Ib",  "Ib",  "Ib" ],
      [  "Ib",  "Ib",  "Ib",  "Ib", ".", ".", ".", ".", ".", "Ib", "Ib",  "Ib",  "Ib" ],
      [  "Ib",  "Ib",  "Ib",  "Ib", ".", ".", ".", ".", ".", "Ib", "Ib",  "Ib",  "Ib" ],
      [  "Ib",  "Ib",  "Ib",  "Ib", ".", ".", ".", ".", ".", "Ib", "Ib",  "Ib",  "Ib" ],
      [  "Ib",  "Ib",  "Ib",  "Ib", ".", ".", ".", ".", ".", "Ib", "Ib",  "Ib",  "Ib" ],
      [  "Ib",  "Ib",  "Ib",  "Ib", ".", ".", ".", ".", ".", "Ib", "Ib",  "Ib",  "Ib" ],

      [  "Ib",  "Ib",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Ib",  "Ib" ],
      [  "Ib",  "Ib",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Ib",  "Ib" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ],

    [
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],

      [  "Im",  "Im",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Im",  "Im" ],
      [  "Im",  "Im",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Im",  "Im" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ],

    [
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],

      [  "Im",  "Im",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Im",  "Im" ],
      [  "Im",  "Im",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Im",  "Im" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ],

    [
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],
      [  "Im",  "Im",  "Im",  "Im", ".", ".", ".", ".", ".", "Im", "Im",  "Im",  "Im" ],

      [  "Im",  "Im",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Im",  "Im" ],
      [  "Im",  "Im",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "Im",  "Im" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ],

    [
      [  "It",  "It",  "It",  "It", ".", ".", ".", ".", ".", "It", "It",  "It",  "It" ],
      [  "It",  "It",  "It",  "It", ".", ".", ".", ".", ".", "It", "It",  "It",  "It" ],
      [  "It",  "It",  "It",  "It", ".", ".", ".", ".", ".", "It", "It",  "It",  "It" ],
      [  "It",  "It",  "It",  "It", ".", ".", ".", ".", ".", "It", "It",  "It",  "It" ],
      [  "It",  "It",  "It",  "It", ".", ".", ".", ".", ".", "It", "It",  "It",  "It" ],
      [  "It",  "It",  "It",  "It", ".", ".", ".", ".", ".", "It", "It",  "It",  "It" ],

      [  "It",  "It",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "It",  "It" ],
      [  "It",  "It",  ".",  ".", ".", ".", ".", ".", ".", ".", ".",  "It",  "It" ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ],
      [  ".",  ".",  ".",  ".",  ".",  ".",  ".", ".", ".", ".", ".", ".", "." ]
    ]

  ];

  /*
  console.log(">>", g.length);
  for (let i =0; i<g.length; i++) {
    console.log(i, g[i].length);
    for (let j=0; j<g[i].length; j++) {
      console.log(i, j, g[i][j].length);
    }
  }
  */

  tostl(render_grid(g));

}


//---------------------------
//---------------------------
//---------------------------
//---------------------------

// bottom captial pillow
//
function neocal_capital_pillow(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  // bound box size
  //
  let default_info = {
    "height": 0.05,
    "innerRadius": 0.125,
    "outerRadius": 0.125/2,
    "segments": 32,
    "center": [0,0,0]
  };
  for (let _k in default_info) {
    info[_k] = default_info[_k];
    if (_k in _info) { info[_k] = _info[_k]; }
  }

  let center = info.center;

  let bez = jscad.curves.bezier;

  let w_i = info.innerRadius;
  let w_o = info.outerRadius;
  let h = info.height;
  let _dx0 = w_o / 32;
  let _dy0 = 0;

  let dx = w_i;
  let dy = 0;

  let _cp = [[0,0], [_dx0/2, 0], [_dx0, 0], [w_o/2, 0], [2*w_o/3,0], [w_o,_dy0], [_dx0,h], [_dx0/2,h], [0, h]];
  let b = bez.create( _cp );

  /*
  for (let i=0; i<_cp.length; i++) {
    console.log(_cp[i][0], _cp[i][1]);
  }
  console.log("\n");

  let N = 32;
  for (let i=0; i<=N; i++) {
    let p = bez.valueAt( (i/N), b );
    console.log(p[0], p[1]);
  }

  return;
  */
  
  let bseg = 32;
  let pgn = [];
  pgn.push( [0,0] );
  for (let i=0; i<=bseg; i++) {
    let pnt = bez.valueAt((i/bseg), b) ;
    pnt[0] += dx;
    pnt[1] += dy;

    pgn.push( pnt );
  }
  pgn.push( [ 0, h ] );
  let shape = jscad.primitives.polygon({"points": pgn});

  let _s = jscad.transforms.translate( [0,0,-h/2], jscad.extrusions.extrudeRotate({"segments":64, "angle": Math.PI*2.0}, shape) );
  let _res = jscad.transforms.translate( center, _s );
  return _res;

}

function neocal_column_end_2(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  // bound box size
  //
  let default_info = {
    "size": [0.25, 0.25, 0.05],
    "columnRadius": 0.11,
    //"capitalHeight": 0.05,
    //"capitalWidth": .3,
    "segments": 32,
    "center": [0,0,0]
  };
  for (let _k in default_info) {
    info[_k] = default_info[_k];
    if (_k in _info) { info[_k] = _info[_k]; }
  }

  let center = info.center;

  let _seg = info.segments;

  let r_p = info.columnRadius;
  let r_c = info.columnRadius;

  //let h_p = 0.05;
  //let h_c = 0.00625;
  //let h_b = 0.05 ;

  let h_p = (6/12)*info.size[2];
  let h_b = (5/12)*info.size[2];
  let h_c = (1/12)*info.size[2];


  //let w = 2 * 1.125 * r_p;

  let w0 = info.size[0];
  let w1 = info.size[1];

  let _H = info.size[2];

  let _block = jscad.primitives.cuboid({"size": [w0,w1,h_b], "center":[0,0,0 + h_b/2 ]});
  let _pillow = neocal_capital_pillow({"height": h_p, "center":[0,0, h_b + h_p/2], "innerRadius":r_p, "outerRadius":r_p/4});
  let _cyl0 = jscad.primitives.cylinder({"height": h_c, "radius": r_c, "center":[0,0,h_b + h_p + h_c/2], "segments":_seg});

  let _cent = [ center[0], center[1], center[2] - info.size[2]/2 ];

  let _res = jscad.transforms.translate( _cent, jscad.booleans.union( _pillow, _cyl0, _block ) );

  return _res;
}

//_testbez();


function neocal_column_2(_info) {
  if (typeof _info === "undefined") { _info = {}; }
  let info = {};

  let default_info = {
    "height_mid": .8,
    "height_end": 0.05,
    //"innerRadius": 0.125,
    "outerRadius": 0.13,
    "segments": 32,

    "center": [0,0,0],

    "theta": Math.PI / 4.0,

    "pill_n" : 16,
    "pill_width_percent": 0.55,
    //"pill_cap": "blunt",
    "pill_cap": "sphere",
    "pill_segments": 16
  };
  for (let _k in default_info) {
    if (_k in _info) { info[_k] = _info[_k]; }
    else { info[_k] = default_info[_k]; }
  }

  //let base_s = 0.18/2;
  let base_s = 0.335;
  let col_r = 0.15;
  let _seg = 32;

  base_s = 0.2;
  col_r = (base_s/2)*0.9;


  let _top_h = 0.075;
  let _mid_th = 0.05;
  let _mid_ch = 1 - 2*_top_h - 2*_mid_th;

  let dz = (_mid_ch/2) + _mid_th + (_top_h/2);


  let bb = neocal_column_end_2({
    "size": [base_s, base_s, _top_h],
    "columnRadius": col_r,
    "center": [0,0,-dz]
  });

  let bb1 = neocal_column_end_2({
    "size": [base_s, base_s, _top_h],
    "columnRadius": col_r,
    "center": [0,0,-dz]
  });
  bb1 = jscad.transforms.rotateX( Math.PI, bb1 );

  let cc = neocal_column_center_1({
    "outerRadius": col_r,
    "height_mid": _mid_ch,
    "height_end": _mid_th
  });

  let _res = jscad.booleans.union( bb, cc, bb1 );
  return _res;
}

//tostl( [neocal_column_2(), debug_marker() ]);

//tostl([ debug_marker(), neocal_column_end_2() ]);
//tostl([ jscad.trasnneocal_capital_pillow({"height":0.07}) ] );


//tostl( [debug_marker(), neocal_column_2()] );
//
//

//---------------------------
//---------------------------
//---------------------------
//---------------------------

//toobj(center_column_0());

//toobj(scene_experiment_0());
//tostl(scene_experiment_0());

//tostl(stair_0());

//tostl( block_0() );

//tostl( scene_experiment_1() );
//tostl( [column_0_b(), column_0_m({"center":[0,0,1]}), column_0_t({"center":[0,0,2]}), block_0({"center":[0,0,-1]}) ] );

//tostl( [ marker(), column_0_t({"center":[0,0,2]}) ] );

//scene_experiment_2();
//scene_experiment_3();
scene_experiment_4();

//tostl( [marker(), stair_spiral_0({"center":[2,3,1]}), stair_spiral_0({"center":[1,3,1], "rotateZ":Math.PI/2}) ] );

//tostl( [marker(), arch_half_l0({"radius":1, "height":1 }) ] );

//tostl( pillar_part_flare_circle() );
//tostl( column_0() );

//tostl(column_end_0());
//tostl(jscad.booleans.union( column_end_0({"center":[0,0,0.5], "roundRadius":0.0125}), marker() ));

//test_spiral();

//toobj(column_mid_blasius_twist({"a": Math.PI, "w": 0.25, "r_c": (1/32) }));

//toobj(twist_sq());

//toobj(pillar_test_top());
//toobj(pillar_test_bot());

//toobj(pillar_part_bstack({"c":3}));

//toobj(pillar_part_flare_square());
//toobj(pillar_part_flare_circle());
//toobj(pillar_part_pancake());

//let p = pill({ "r": 0.125, "r_c": 0.125, "h": 1, "segments": 32 });
//toobj(p);

//let p = pill({"h":0.85, "r":1/32, "r_c":1/48});
//toobj(p);

//let cyl = jscad.primitives.cylinder({"radius":0.25, "height":1, "segments":64, "center":[0,0,0]});
//toobj(cyl);


//----

//let z = cube({"size":1});
//toobj(z);

function main () {
  return cube({ size: 1 })
}
module.exports = { main }
