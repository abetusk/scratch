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

var jscad = require('@jscad/modeling')
var io = require("@jscad/io");

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

function pillar_base() {

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

function sconut(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/32) : info.h);;
  let r0 = 2*h/3;
  let r1 = h;
  //let c = 0.25;
  let c = ((typeof info.r === "undefined") ? (0.25) : info.r);
  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);

  let cyl_h = 2*h;

  let el = jscad.primitives.ellipse({"radius": [r0,r1], "center":[c,0]});
  let sn = jscad.extrusions.extrudeRotate({"segments":seg}, el);

  let cyl = jscad.primitives.cylinder({"radius":c,"height":cyl_h, "center":[0,0,0], "segments": seg});
  let _res = jscad.transforms.translate( center, jscad.booleans.union( cyl, sn ) );

  return _res;
}

function scinut(info) {
  info = ((typeof info === "undefined") ? {} : info);
  let seg = ((typeof info.segments === "undefined") ? 64 : info.segments);
  let h = ((typeof info.h === "undefined") ? (1/32) : info.h);;
  let r0 = 2*h/3;
  let r1 = h;
  //let c = 0.25;
  let c = ((typeof info.r === "undefined") ? (0.25) : info.r);

  let cyl_h = 2*h;
  let center = ((typeof info.center === "undefined") ? [0,0,0] : info.center);

  let el = jscad.primitives.ellipse({"radius": [r0,r1], "center":[c,0]});
  let sn = jscad.extrusions.extrudeRotate({"segments":seg}, el);

  let cyl = jscad.primitives.cylinder({"radius":c,"height":cyl_h, "center":[0,0,0], "segments": seg});

  let _res = jscad.transforms.translate( center, jscad.booleans.subtract( cyl, sn ) );

  return _res;
}

function pillar_part_pancake(info) {
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

function pillar_part_flare_square(info) {
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

function pillar_part_flare_circle(info) {
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

function pillar_part_bstack(info) {
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


//function pillar_part_

//let pb = pillar_base();
//toobj(pb);

function _play() {

  let h = 1/32;

  let a = sconut({"center":[0,0,0], "r":0.25});
  let b = scinut({"center":[0,0,2*h], "r": 0.18});
  let c = sconut({"center":[0,0,4*h], "r": 0.2});
  let _r = jscad.booleans.union( jscad.booleans.union( a, b ), c );
  toobj(_r);

}

function pillar_test_top() {

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

function pillar_c_bot() {

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

function pillar_shelburne_bottom() {

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

function column_mid_blasius_twist(info) {
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

function column_() {
}

function twist_sq() {
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

// top and bottom flange column are cylinders with
// donuts subtrated off of them, with angle of top
// flang intersection at pi/4.
//
function center_column_0() {

  let config = {
    "pill_n" : 0,
    "pill_width_percent": 0.75,
    //"pill_cap": "blunt",
    "pill_cap": "sphere",
    "pill_segments": 16
  };

  let pill_n = config.pill_n;

  let _seg = 32;

  let t_ri_theta = Math.PI / 4.0;

  let c_hm = 0.8;

  let c_ri = 0.125;
  let c_ht = 0.05;

  let t_ri = c_ht / Math.sin(t_ri_theta);
  let c_del = c_ht / Math.tan((Math.PI/2) - t_ri_theta);

  let c_ro = c_ri + c_del;

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

  if (config.pill_n > 0) {

    //let _pill_r = 0.01;
    //let _pill_r = .75*(c_circ_i / pill_n)/2;
    let _pill_r = config.pill_width_percent*(c_circ_i / pill_n)/2;
    let _pill_h = c_hm - 0.015;
    //let _pill_seg = 16;
    let _pill_seg = config.pill_segments;

    let pill_geom = [];
    for (let i=0; i<pill_n; i++) {
      let _a = 2.0*Math.PI*i/pill_n;

      let _x = Math.cos(_a) * (c_ri);
      let _y = Math.sin(_a) * (c_ri);

      //let _x = Math.cos(_a) * (c_ri )
      //let _y = Math.sin(_a) * (c_ri );

      let _p = {};

      if (config.pill_cap == "blunt") {
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

function _center_column_0() {

  let _ch_e = 0.05;
  let _ch_m = 0.8;
  let _cr = 0.125;
  let _seg = 32;

  let _eh = 0.1;

  let _ch_t = 0.05;


  let _t_theta = Math.PI / 4;

  let _t_ri = _ch_t / Math.sin(_t_theta);

  //let _c_ri = 0.125;
  let _c_ri = _t_ri * Math.cos(_t_theta);
  let _c_ro = _c_ri + (_t_ri * Math.sqrt(2) / 2.0);

  let _t_or = _c_ri + _t_ri;

  //let _tor = jscad.primitives.torus({"innerRadius":_t_ri, "outerRadius": _t_or, "segments": _seg, "center": [0,0,(_ch_m+_ch_e)/2] });
  //let _top_c = jscad.primitives.cylinder({"radius": _cr + 0.1, "height":_ch_e, "center":[0,0,(_ch_m+_ch_e)/2], "segments": _seg});

  let _tor = jscad.primitives.torus({"innerRadius":_t_ri, "outerRadius": _t_or, "segments": _seg });
  //let _top_c = jscad.primitives.cylinder({"radius": _cr + _t_ri, "height":_ch_e, "segments": _seg, "center":[ 0,0, _ch_e/2] });
  let _top_c = jscad.primitives.cylinder({"radius": _c_ro, "height":_ch_e, "segments": _seg, "center":[ 0,0, _ch_e/2] });

  //let _top = jscad.booleans.subtract( _top_c, _tor );
  let _top = jscad.booleans.union( _top_c, _tor );
  return _top;


  let c = jscad.primitives.cylinder({"radius": _cr, "height":_ch_m, "center":[0,0,0], "segments": _seg});


  return c;
}

toobj(center_column_0());

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
