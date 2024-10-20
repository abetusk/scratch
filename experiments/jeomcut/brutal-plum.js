// LICENSE: CC0
//

// Y is 'up'
// XZ plan is flat, Z comes into camera, X goes to the right
//
// Everything is centered aroudn 0 with unit cube cell (+-0.5, +-0.5, +-0.5)
//

let OUT_DIR = ".brutal-plum_tile";
let OUT_DIR_STL = ".brutal-plum_stl";
let OUT_DIR_OBJ = ".brutal-plum_obj";

var fs = require("fs");

var jscad = require("@jscad/modeling");
var array_utils = require('@jscad/array-utils')


var objectDeserializer = require('@jscad/obj-deserializer')
var objectSerializer = require('@jscad/obj-serializer')
var stlDeserializer = require('@jscad/stl-deserializer')
var stlSerializer = require('@jscad/stl-serializer')

var m4 = require("./m4.js");
var jeom = require("./jeom.js");



var op = {

  "obj_loads": objectDeserializer.deserialize,
  "obj_dumps": objectSerializer.serialize,

  "stl_loads": stlDeserializer.deserialize,
  "stl_dumps": stlSerializer.serialize,

  "flatten": array_utils.flatten,

  "clone": jscad.geometries.geom3.clone,
  "points": jscad.geometries.geom3.toPoints,
  "polygons": jscad.geometries.geom3.toPolygons,
  "validate": jscad.geometries.geom3.validate,
  "create": jscad.geometries.geom3.create,

  "add" : jscad.booleans.union,
  "sub" : jscad.booleans.subtract,
  "or" : jscad.booleans.union,
  "and" : jscad.booleans.intersect,
  "scission": jscad.booleans.scission,

  "expand": jscad.expansions.expand,
  "offset": jscad.expansions.offset,

  "cube": jscad.primitives.cube,
  "cuboid": jscad.primitives.cuboid,
  "cub": jscad.primitives.cuboid,
  "cylinder": jscad.primitives.cylinder,
  "sphere": jscad.primitives.sphere,

  "ruboid": jscad.primitives.roundedCuboid,

  "circle": jscad.primitives.circle,
  "cir": jscad.primitives.circle,

  "lift": jscad.extrusions.extrudeLinear,
  "lif": jscad.extrusions.extrudeLinear,

  "lifr": jscad.extrusions.extrudeRotate,
  "lifc": jscad.extrusions.extrudeRectangular,
  "lifh": jscad.extrusions.extrudeHelical,

  "rot": jscad.transforms.rotate,
  "rotX": jscad.transforms.rotateX,
  "rotY": jscad.transforms.rotateY,
  "rotZ": jscad.transforms.rotateZ,

  "mul": jscad.transforms.transform,

  "mov": jscad.transforms.translate,
  "movX": jscad.transforms.translateX,
  "movY": jscad.transforms.translateY,
  "movZ": jscad.transforms.translateZ,

  "flip": jscad.transforms.mirror,
  "flipX": jscad.transforms.mirrorX,
  "flipY": jscad.transforms.mirrorY,
  "flipZ": jscad.transforms.mirrorZ,

  "scale": jscad.transforms.scale,
  "scaleX": jscad.transforms.scaleX,
  "scaleY": jscad.transforms.scaleY,
  "scaleZ": jscad.transforms.scaleZ,

  "com" : jscad.measurements.measureCenterOfMass,
  "bbox" : jscad.measurements.measureBoundingBox,
  "area" : jscad.measurements.measureArea,
  "vol" : jscad.measurements.measureVolume

};

function debug_geom_f(size, center, opt) {

  opt = ((typeof opt === "undefined") ? [(1/32), (1/32), (1/32)] : opt);

  let _s = ((typeof size === "undefined") ? [1,1,1] : size);
  let _c = ((typeof center === "undefined") ? [0,0,0] : center);
  let _s2 = [ _s[0]/2, _s[1]/2, _s[2]/2 ];

  let _p = [
    [ _c[0]-_s2[0], _c[0]+_s2[0] ],
    [ _c[1]-_s2[1], _c[1]+_s2[1] ],
    [ _c[2]-_s2[2], _c[2]+_s2[2] ]
  ];

  let _debug_geom =
    op.add(
      op.mov([ _p[0][0], _p[1][0], _p[2][0] ], op.cub({"size":opt})),
      op.mov([ _p[0][1], _p[1][0], _p[2][0] ], op.cub({"size":opt})),
      op.mov([ _p[0][0], _p[1][1], _p[2][0] ], op.cub({"size":opt})),
      op.mov([ _p[0][0], _p[1][0], _p[2][1] ], op.cub({"size":opt})),

      op.mov([ _p[0][1], _p[1][1], _p[2][0] ], op.cub({"size":opt})),
      op.mov([ _p[0][0], _p[1][1], _p[2][1] ], op.cub({"size":opt})),
      op.mov([ _p[0][1], _p[1][0], _p[2][1] ], op.cub({"size":opt})),

      op.mov([ _p[0][1], _p[1][1], _p[2][1] ], op.cub({"size":opt}))
    );

  return _debug_geom;
}
//var DEBUG_GEOM = debug_geom_f([1,1,1], [0.5,0.5,0.5]);
var DEBUG_GEOM = debug_geom_f([1,1,1], [0,0,0]);

// untested, abandonded?
//
function make_arch(r) {
  r = ( ((typeof r) === "undefined") ? 1 : r);

  let all_pnts = [];

  for (let x=0; x<(r+1); x++) {
    let d = (r*r) - (x*x);
    if (d < 0) { continue; }
    let y = Math.sqrt(d);

    all_pnts.push([x,y]);

    console.log("x>", x,y);
  }

  for (let y=0; y<(r+1); y++) {
    let d = (r*r) - (y*y);
    if (d < 0) { continue; }
    let x = Math.sqrt(d);

    all_pnts.push([x,y]);

    console.log("y>", x,y);
  }

  all_pnts.sort(pnt_cmp);

  let pnts = [];
  pnts.push( all_pnts[0] );
  for (let ii=1; ii<all_pnts.length; ii++) {
    if (! pnt_eq(pnts[ pnts.length-1 ], all_pnts[ii])) {
      pnts.push( all_pnts[ii] );
    }
  }

  let info_a = [];

  for (let ii=1; ii<pnts.length; ii++) {

    let prv = pnts[ii-1];
    let cur = pnts[ii];

    let pxy = [ prv[0] + ((cur[0]-prv[0])/2), prv[1] + ((cur[1]-prv[1])/2) ];
    let ix = Math.floor(pxy[0]);
    let iy = Math.floor(pxy[1]);

    let theta_s = Math.atan2(prv[1], prv[0]);
    let theta_e = Math.atan2(cur[1], cur[0]);
    console.log("prv:", prv, "cur:", cur, "pxy:", pxy, "ixy:", ix, iy, "theta_se:", theta_s, theta_e);
    let info = { };
  }

  //for (let ii=0; ii<pnts.length; ii++) { console.log(pnts[ii][0], pnts[ii][1]); }

}

function _main() {
  make_arch(2);
}

function wedge_up() {
  let geom = op.sub(
    op.cub({"size":[1,1,1], "center":[0, 0, 0]}),
    op.rot([Math.PI/4,0,0], op.cub({"size":[2,2,2], "center":[0,0.0,-1.0]}))
  );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"w", "dock":[ ": .", ": .",  ".", "_",  "b", "."], "anchor":geom}
  ];
}

function wedge_down() {
  let geom = op.sub(
    op.cub({"size":[1,1,1], "center":[0, 0, 0]}),
    op.rot([Math.PI/4,0,0], op.cub({"size":[2,2,2], "center":[0,0,1]}))
  );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"m", "dock":[ ": .", ": .", "b",".", ".","b"], "anchor":geom}
  ];
}

// y up
// stairs facing -z direction, sides in +-x
// slabs in xz plane, going up y
//
// bottom step needs to start in a step and top step
// needs to be missing as the diagonal element will
// be a full block, taking the place of the steps.
//
function stair(n, _debug) {
  n = ((typeof n === "undefined") ? 3 : n);

  let geom = {};

  let N = n+1;
  for (let i=0; i<n; i++) {
    let zi = i - ((n-1)/2);

    let sx = 1,
        sy = 1/N,
        sz = (n-i)/N;

    let cx = 0,
        cy = (zi/N) - (1/(2*N)),
        cz = ((i+1)/(2*N));
    let s = op.cub({"size":[sx,sy,sz], "center":[cx,cy,cz]});


    if (i==0) { geom = s; }
    else      { geom = op.add(geom, s); }

  }

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .", ".","_", "b","."], "anchor":geom}
  ];
}

function block() {

  let geom = op.mov([0,0,0], op.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .", "b .","_", ": .", ": ."], "anchor":geom}
  ];
}

function platform_bend() {
  let geom = op.mov([0,0,0], op.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"pb", "dock":[ "P", ".", "b .","_", ".", "P"], "anchor":geom}
  ];
}

function platform_tee() {
  let geom = op.mov([0,0,0], op.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"pt", "dock":[ "P", "P", "b .","_", ".", "P"], "anchor":geom}
  ];
}

function platform_straight() {
  let geom = op.mov([0,0,0], op.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"ps", "dock":[ "P", "P", "b .","_", ".", "."], "anchor":geom}
  ];
}

function column2() {

  let geom = op.mov([0,0,0], op.cub({"size":[1,2,1], "center": [0,0.5,0] }));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .",  "$1",  "_", ": .", ": ."], "anchor":geom},
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .", "b .", "$0", ": .", ": ."]}
  ];
}

function column3() {

  let geom = op.mov([0,0,0], op.cub({"size":[1,3,1], "center": [0,1,0] }));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .",  "$1",  "_", ": .", ": ."], "anchor":geom},
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .",  "$2", "$0", ": .", ": ."] },
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":[ ": .", ": .", "b .", "$1", ": .", ": ."] }
  ];
}


// smaller arch taken out of block
//
function doorway(opt, _debug) {

  opt = ((typeof opt === "undefined") ? {"r":0.25, "h":0.75}:opt);

  let r = (("r" in opt) ? opt.r : 0.25);
  let h = (("h" in opt) ? opt.h : 0.75);

  let _h = (h-r)/2;
  let _c = h-r-0.5;

  let geom =
    op.sub(
      op.mov([0,0,0], op.cub({"size":[1,1,1]})),
      op.mov([0,_c,-0.6], op.lif( {height:1.2}, op.cir({"radius":r})) ),
      op.mov([0,-_h,0], op.cub({"size":[2*r,2*_h,1.2]}))
    );

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":["b .", "b .",  "b", "_", ".", "."], "anchor":geom}
  ];
}

// smaller arch taken out of block
//
function double_doorway(opt, _debug) {

  opt = ((typeof opt === "undefined") ? {"r":0.25, "h":0.75}:opt);

  let r = (("r" in opt) ? opt.r : 0.25);
  let h = (("h" in opt) ? opt.h : 0.75);

  let _h = (h-r)/2;
  let _c = h-r-0.5;

  let geom =
    op.sub(
      op.mov([0,0,0], op.cub({"size":[1,1,1]})),
      op.mov([0,_c,-0.6], op.lif( {height:1.2}, op.cir({"radius":r})) ),
      op.rot([0,Math.PI/2,0], op.mov([0,_c,-0.6], op.lif( {height:1.2}, op.cir({"radius":r})) ) ),
      op.mov([0,-_h,0], op.cub({"size":[2*r,2*_h,1.2]})),
      op.mov([0,-_h,0], op.cub({"size":[1.2,2*_h,2*r]})),
    );

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":[ ".", ".", "b","_ 4",  ".", "."], "anchor":geom}
  ];
}

function block_2x2(opt, _debug) {

  opt = ((typeof opt === "undefined") ? {"r":0.25, "h":0.75}:opt);

  let r = (("r" in opt) ? opt.r : 0.25);

  let geom =
    op.sub(
      op.mov([0,0,0], op.cub({"size":[1,1,1]})),
      op.cub({"size":[2*r,1.2,1.2]}),
      op.cub({"size":[1.2,1.2,2*r]})
    );

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":[ ": .", ": .",  "4","_ 4", ": .", ": ."], "anchor":geom}
  ];

}

// 3x2 cell occupancy to try and get ride of staircases on ends.
//
function arch0(opt, _debug) {
  let geom =
    op.mov([1,0,0],
      op.sub(
        op.mov([0,0.5,0], op.cub({"size":[3,2,1]})),
        op.mov([0,0,-0.5], op.lif( {height:1}, op.cir({"radius":0.5})) ),
        op.mov([0,-0.5,0], op.cub({"size":[1,1,1]}))
      )
    );

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[0,0,0], "geom":geom, "dock":[ "$1","b .", "$3", "b #",  ": .", ": ."], "anchor":geom},
    {"ds":[0,0,0], "geom":geom, "dock":[ "$2","$0",  "$4", ".",  ": .", ": ."] },
    {"ds":[0,0,0], "geom":geom, "dock":["b .","$1",  "$5", "b #",  ": .", ": ."] },

    {"ds":[0,0,0], "geom":geom, "dock":[ "$4","b .", "b .","$0", ": .", ": ."] },
    {"ds":[0,0,0], "geom":geom, "dock":[ "$5","$3",  "b .","$1", ": .", ": ."] },
    {"ds":[0,0,0], "geom":geom, "dock":["b .","$4",  "b .","$2", ": .", ": ."] }
  ]

}

//var x = arch0(null, true)
//console.log( op.obj_dumps({}, x[0].anchor).join("") );
//process.exit();

// one cell occupancy.
// Half height up arch
//
function _arch0(opt, _debug) {
  let geom =
    op.sub(
      op.mov([0,0,0], op.cub({"size":[1,1,1]})),
      op.mov([0,0,-0.5], op.lif( {height:1}, op.cir({"radius":0.5})) ),
      op.mov([0,-0.5,0], op.cub({"size":[1,1,1]}))
    );

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":[ "b", "b",  "b", ".",  ": .", ": ."], "anchor":geom}
  ];
}

// 4x3 occupancy to try to get rid of staircase on ends
//
function arch1(opt, _debug) {

  // left geom centered at (0,0,0)
  //
  let geom =
    op.mov([1.5,0,0],
      op.sub(
        op.mov([0,  0.5,    0], op.cub({"size":[4,2,1]})),
        op.mov([0, -0.5, -0.5], op.lif( {height:1}, op.cir({"radius":1.0}))),
        op.mov([0, -0.5,    0], op.cub({"size":[2,2,1.2], "center":[0,-1,0]}))
      )
    );

  if (_debug) {
    geom = op.add(geom, DEBUG_GEOM);
  }

  return [
    {"ds":[ 0,0,0], "geom":geom, "dock":[  "$1","b .", "$4", "_",  ": .", ": ."], "anchor": geom},
    {"ds":[ 0,0,0], "geom":geom, "dock":[  "$2", "$0", "$5", ".",  ": .", ": ."] },
    {"ds":[ 0,0,0], "geom":geom, "dock":[  "$3", "$1", "$6", ".",  ": .", ": ."] },
    {"ds":[ 0,0,0], "geom":geom, "dock":[ "b .", "$2", "$7", "_",  ": .", ": ."] },

    {"ds":[ 0,0,0], "geom":geom, "dock":[  "$5","b .","b .", "$0",  ": .", ": ."] },
    {"ds":[ 0,0,0], "geom":geom, "dock":[  "$6", "$4","b .", "$1",  ": .", ": ."] },
    {"ds":[ 0,0,0], "geom":geom, "dock":[  "$7", "$5","b .", "$2",  ": .", ": ."] },
    {"ds":[ 0,0,0], "geom":geom, "dock":[ "b .", "$6","b .", "$3",  ": .", ": ."] }
  ];
}

//var x = arch1(null, true);
//console.log( op.obj_dumps({}, x[0].anchor).join("") );
//process.exit();

// 2x1 top portion of arch
//
function _arch1(opt, _debug) {

  // left geom centered at (0,0,0)
  //
  let geom =
    op.mov([0.5,-0.5,0],
      op.sub(
        op.cub({"size":[2,2,1], "center":[0,0,0]}),
        op.mov([0,0,-0.5], op.lif( {height:1}, op.cir({"radius":1.0}))),
        op.cub({"size":[2,2,1.2], "center":[0,-1,0]})
      )
    );

  let lgeom = op.and(geom, op.cub({"size":[1,1,1], "center":[0,0,0]}));
  let rgeom = op.and(op.mov([-1,0,0],geom), op.cub({"size":[1,1,1], "center":[0,0,0]}));

  if (_debug) {
    lgeom = op.add(lgeom, DEBUG_GEOM);
    rgeom = op.add(rgeom, DEBUG_GEOM);
  }

  return [
    {"ds":[ 0,0,0], "geom":lgeom, "id":"a1_0", "dock":[  "$1",  "b", "b", ".",  ": .", ": ."], "anchor": geom},
    {"ds":[ 1,0,0], "geom":rgeom, "id":"a1_1", "dock":[   "b", "$0", "b", ".",  ": .", ": ."]}
  ];
}

// 5x3 top portion of arch
// middle empty region not returned, so only 5 blocks
//
function arch2(opt, _debug) {

  let geom =
    op.mov([2,0,0],
        op.sub(
          op.cub({"size":[5,4,1], "center":[0,-0.5,0]}),
          op.mov([0,0,-0.5], op.lif( {height:1}, op.cir({"radius":1.5}))),
          op.cub({"size":[5,3,1], "center":[0,-2.0,0]}),
          op.cub({"size":[3,2,1], "center":[0,-1.0,0]})
        )
      );


  //    y
  //    |
  //    . --x
  //   /
  //  z
  //     |  b   |  b   |   b   |   b  |   b  |
  //  b  |  $4  |  $5  |  $6   |  $7  |  $8  |  b
  //  b  |  $0  |  $1  |   .   |  $2  |  $3  |  b
  //     |   b  |   .  |   .   |   .  |   b  |

  let info = [];

  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([ 0, 0, 0], geom)), "anchor": geom  });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-1, 0, 0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-3, 0, 0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-4, 0, 0], geom)) });

  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([ 0,-1, 0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-1,-1, 0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-2,-1, 0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-3,-1, 0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-4,-1, 0], geom)) });

  if (_debug) {
    info[0].anchor =  op.add( info[0].anchor, DEBUG_GEOM );
    for (let ii=0; ii<info.length; ii++) {
      info[ii].geom = op.add( info[ii].geom, DEBUG_GEOM );
    }
  }

  info[0]["dock"] = [   "$1",    "b", "$4",  "_",    ": .",    ": ." ];
  info[1]["dock"] = [    ".",   "$0", "$5",  ".",    ": .",    ": ." ];
  info[2]["dock"] = [   "$3",    ".", "$7",  ".",    ": .",    ": ." ];
  info[3]["dock"] = [    "b",   "$2", "$8",  "_",    ": .",    ": ." ];

  info[4]["dock"] = [   "$5",    "b",  "b", "$0",    ": .",    ": ." ];
  info[5]["dock"] = [   "$6",   "$4",  "b", "$1",    ": .",    ": ." ];
  info[6]["dock"] = [   "$7",   "$5",  "b",  ".",    ": .",    ": ." ];
  info[7]["dock"] = [   "$8",   "$6",  "b", "$2",    ": .",    ": ." ];
  info[8]["dock"] = [    "b",   "$7",  "b", "$3",    ": .",    ": ." ];

  return info;
}

// 3x2 top portion of arch
// middle empty region not returned, so only 5 blocks
//
function _arch2(opt, _debug) {

  let geom =
    op.mov([1,-0.0,0],
        op.sub(
          op.cub({"size":[3,3,1], "center":[0,0,0]}),
          op.mov([0,0,-0.5], op.lif( {height:1}, op.cir({"radius":1.5}))),
          op.cub({"size":[3,3,1], "center":[0,-1.5,0]})
        )
      );

  //    y
  //    |
  //    . --x
  //   /
  //  z
  //     |  b   |  b   |   b  |
  //  b  | a2_1 | a2_2 | a2_4 | b
  //  b  | a2_0 |  .   | a2_3 | b
  //     |  .   |  .   |   .  |

  let info = [];

  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([0,0,0], geom)), "anchor": geom  });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([0,-1,0], geom)) });
  //info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-1,0,0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-1,-1,0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-2,0,0], geom)) });
  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([-2,-1,0], geom)) });

  if (_debug) {
    for (let ii=0; ii<info.length; ii++) {
      info[ii].geom = op.add( info[ii].geom, DEBUG_GEOM );
    }
  }

  info[0]["id"] = "a3_0";
  info[1]["id"] = "a3_1";
  info[2]["id"] = "a3_2";
  info[3]["id"] = "a3_3";
  info[4]["id"] = "a3_4";

  info[0]["dock"] = [    ".",    "b", "$1",  ".",    ": .",    ": ." ];
  info[1]["dock"] = [   "$2",    "b",  "b", "$0",    ": .",    ": ." ];
  info[2]["dock"] = [   "$4",   "$1",  "b",  ".",    ": .",    ": ." ];
  info[3]["dock"] = [    "b",    ".", "$4",  ".",    ": .",    ": ." ];
  info[4]["dock"] = [    "b",   "$2",  "b", "$3",    ": .",    ": ." ];

  return info;
}

function _print_stickem_conf(info) {

  console.log("{");

  if ("comment" in info) {
    console.log("  \"comment\": ", JSON.stringify(info.comment) + ",");
  }

  console.log("  \"unit\": ", JSON.stringify(info.unit) + ",");
  console.log("  \"unit_center\": ", JSON.stringify(info.unit_center) + ",");
  console.log("  \"up\": ", JSON.stringify(info.up) + ",");
  console.log("  \"symmetry\": ", JSON.stringify(info.symmetry) + ",");

  console.log("  \"dock\": {");
  let dock_key_a = [];
  for (let dock_key in info.dock) {
    dock_key_a.push(dock_key);
  }

  for (let dock_key_idx=0; dock_key_idx<dock_key_a.length; dock_key_idx++) {
    let dock_key = dock_key_a[dock_key_idx];
    let sfx = ",";
    if (dock_key_idx == (dock_key_a.length-1)) { sfx = ""; }
    console.log("    \"" + dock_key.toString() + "\" :", JSON.stringify(info.dock[dock_key]) + sfx);
  }
  console.log("  },");

  console.log("  \"tile\": {");
  let tile_key_a = [];
  for (let tile_key in info.tile) {
    tile_key_a.push(tile_key);
  }

  for (let tile_key_idx=0; tile_key_idx<tile_key_a.length; tile_key_idx++) {
    let tile_key = tile_key_a[tile_key_idx];
    let sfx = ",";
    if (tile_key_idx == (tile_key_a.length-1)) { sfx = ""; }
    console.log("    \"" + tile_key.toString() + "\" :", JSON.stringify(info.tile[tile_key]) + sfx);
  }
  console.log("  },");

  console.log("  \"source\": [");
  for (let idx=0; idx<info.source.length; idx++) {
    let sfx = ",";
    if (idx == (info.source.length-1)) { sfx = ""; }

    console.log("    " + JSON.stringify(info.source[idx]) + sfx);

    //console.log("  {");
    //console.log("  { \"name\":", JSON.stringify(info.source[idx].name) + ",")
    //console.log("    \"dock\":", JSON.stringify(info.source[idx].dock) + "}" + sfx)

    //console.log("  }" + sfx);
  }
  console.log("  ],");

  if ("constraint" in info) {
    console.log("  \"constraint\": [");
    for (let ii=0; ii < info.constraint.length; ii++) {
      sfx = ((ii == (info.constraint.length-1)) ? "" : ",");
      console.log("    " + JSON.stringify(info.constraint[ii]) + sfx);
    }
    console.log("  ],");
  }

  console.log("  \"weight\": {");
  if ("weight" in info) {
    let weight_key_a = [];
    for (let weight_key in info.weight) { weight_key_a.push(weight_key); }
    for (let weight_key_idx=0; weight_key_idx<weight_key_a.length; weight_key_idx++) {
      let weight_key = weight_key_a[weight_key_idx];
      let sfx = ",";
      if (weight_key_idx == (weight_key_a.length-1)) { sfx = ""; }
      console.log("    \"" + weight_key + "\" : " + info.weight[weight_key].toString() + sfx);
    }
  }
  console.log("  }");

  console.log("}");
}

function main() {

  let stickem_info = {
    "comment": "stl out dir: '" + OUT_DIR_STL + "/', OBJ out dir: '" + OUT_DIR_OBJ + "/'",
    "unit": [1,1,1],
    "unit_center":[0,0,0],
    "up":[0,1,0],
    "symmetry":"y",
    "dock": {
      "." : { "type":"!", "dock":[0], "description":"empty space (.)" },
      "#" : { "type":"!", "dock":[1], "description":"ground (#)" },

      "_" : { "type":"%", "dock":"b #", "description":"general wildcard like dock" },
      ":" : { "type":"@", "description":"general wildcard like dock" },

      //"w" : { "type":"&", "dock":"W", "description":"wedge (down) side dock" },
      //"W" : { "type":"&", "dock":"w", "description":"wedge (down) side dock" },

      //"m" : { "type":"&", "dock":"M", "description":"wedge (up) side dock" },
      //"M" : { "type":"&", "dock":"m", "description":"wedge (up) side dock" },

      //"s" : { "type":"&", "dock":"S", "description":"stair side dock" },
      //"S" : { "type":"&", "dock":"s", "description":"stair side dock" },

      "b" : { "type":"!", "dock":["block"], "description":"block" },
      "4" : { "type":"@", "description":"2x2 blocks (y+-) (for under double doorway)" },
      //"a" : { "type":"@", "description":"xz dock for arch (side arch)" },

      "A" : { "type":"@", "description":"top arch (y+-) dock connector" }
    },
    "tile": {
      "0": {"name":"0", "description":"empty" },
      "1": {"name":"1", "description":"ground" }
    },
    "source": [
    ],

    "constraint": [
      {"type": "quiltRemove",  "range": { "x": [], "y":[1], "z":[], "tile":"#"} },
      {"type": "quiltForce",   "range" : { "x":[],"y":[0,1],"z":[], "tile":"#"}},
      {"type": "quiltPin",     "range" : { "x":[],"y":[0,1],"z":[], "tile":"#"}}
    ],

    "weight": {
      ".": 1000,
      "#": 1,
      "block": 10,
      "column2": 5,
      "column3": 5,
      "wedge_up": 100,
      "wedge_down": 1,
      "doorway": 1,
      "double-doorway": 1,
      "block-2x2": 1,
      "arch0": 100,
      "arch1": 100,
      "arch2": 100,
      "stair": 50
    }
  };

  let lib_info = [
    { "name": "block",        "f": function() { return block(); } },

    { "name": "column2",        "f": function() { return column2(); } },
    { "name": "column3",        "f": function() { return column3(); } },

    { "name": "wedge_up",     "f": function() { return wedge_up(); } },
    { "name": "wedge_down",   "f": function() { return wedge_down(); } },
    { "name": "doorway",      "f": function() { return doorway(); } },
    { "name": "double-doorway",      "f": function() { return double_doorway(); } },
    { "name": "block-2x2",      "f": function() { return block_2x2(); } },
    { "name": "arch0",        "f": function() { return arch0(); } },
    { "name": "arch1",        "f": function() { return arch1(); } },
    { "name": "arch2",        "f": function() { return arch2(); } },
    { "name": "stair",        "f": (function(_n){ return function() { return stair(_n); } })(5)  }
  ];

  let _lib_info= [
    //{ "name": "arch0",        "f": function() { return arch0(); } },
    //{ "name": "arch1",        "f": function() { return arch1(); } },
    //{ "name": "arch2",        "f": function() { return arch2(); } },
    { "name": "wedge_up",        "f": function() { return wedge_up(); } },
    { "name": "block",        "f": function() { return block(); } }
  ];



  for (let li_idx=0; li_idx<lib_info.length; li_idx++) {
    let li = lib_info[li_idx];

    let shape_info = li.f();

    let stl_data = op.stl_dumps({"binary":false}, shape_info[0].anchor).join("");
    fs.writeFileSync(OUT_DIR_STL + "/" + li.name + ".stl", stl_data);

    let obj_data = op.obj_dumps({}, shape_info[0].anchor).join("");
    fs.writeFileSync(OUT_DIR_OBJ + "/" + li.name + ".obj", obj_data);

    let src_idx = stickem_info.source.length;
    stickem_info.source.push({"name":li.name, "dock":[ shape_info[0].dock ]});
    for (let ii=1; ii<shape_info.length; ii++) {
      stickem_info.source[src_idx].dock.push( shape_info[ii].dock );
    }

  }

  _print_stickem_conf(stickem_info);
  //console.log(JSON.stringify(stickem_info, undefined, 2));

  return;
}

main();
