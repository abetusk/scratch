// LICENSE: CC0
//

// Y is 'up'
// XZ plan is flat, Z comes into camera, X goes to the right
//
// Everything is centered aroudn 0 with unit cube cell (+-0.5, +-0.5, +-0.5)
//

var fs = require("fs");

var jscad = require("@jscad/modeling");
var stlser = require("@jscad/stl-serializer");
var objectDeserializer = require('@jscad/obj-deserializer')
var stlSerializer = require('@jscad/stl-serializer')
var array_utils = require('@jscad/array-utils')
var m4 = require("./m4.js");
var jeom = require("./jeom.js");



var op = {

  "objload": objectDeserializer.deserialize,

  "stldumps": stlSerializer.serialize,

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
    {"ds":[0,0,0], "geom":geom, "id":"w", "dock":["w .","W .", ".", "b", "b", "."], "anchor":geom}
  ];
}

function wedge_down() {
  let geom = op.sub(
    op.cub({"size":[1,1,1], "center":[0, 0, 0]}),
    op.rot([Math.PI/4,0,0], op.cub({"size":[2,2,2], "center":[0,0,1]}))
  );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"m", "dock":["m .","M .", "b",".", ".","b"], "anchor":geom}
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
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":["s .","S .", ".","b", "b","."], "anchor":geom}
  ];
}

function block() {

  let geom = op.mov([0,0,0], op.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "dock":["b a .","b a .", "b .","b A", "b a .","b a ."], "anchor":geom}
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
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":["b .","b .","b","b",".","."], "anchor":geom}
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
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":[".",".","b","b 4",".","."], "anchor":geom}
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
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":[".",".","4.","4 b",".","."], "anchor":geom}
  ];

}

// one cell occupancy.
// Half height up arch
//
function arch0(opt, _debug) {
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
    {"ds":[0,0,0], "geom":geom, "id":"a1", "dock":["b","b","b",".","$0 .","$0 ."], "anchor":geom}
  ];
}

// 2x1 top portion of arch
//
function arch1(opt, _debug) {

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
    {"ds":[ 0,0,0], "geom":lgeom, "id":"a2_1", "dock":[  "$1",  "b", "b",".","$0 .","$0 ."], "anchor": geom},
    {"ds":[ 1,0,0], "geom":rgeom, "id":"a2_0", "dock":[   "b", "$0", "b",".","$1 .","$1 ."]}
  ];
}

// 3x2 top portion of arch
// middle empty region not returned, so only 5 blocks
//
function arch2(opt, _debug) {

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

  info[0]["dock"] = [    ".",    "b", "$1",  ".",    "$0 .",    "$0 ." ];
  info[1]["dock"] = [   "$2",    "b",  "b", "$1",    "$1 .",    "$1 ." ];
  info[2]["dock"] = [   "$4",   "$2",  "b",  ".",    "$2 .",    "$2 ." ];
  info[3]["dock"] = [    "b",    ".", "$4",  ".",    "$3 .",    "$3 ." ];
  info[4]["dock"] = [    "b",   "$2",  "b",  ".",    "$4 .",    "$4 ." ];

  return info;
}

function main() {

  let stickem_info = {
    "unit": [1,1,1],
    "unit_center":[0,0,0],
    "up":[0,1,0],
    "symmetry":"y",
    "dock": {
      "." : { "type":"!", "tile":[0], "description":"empty space (.)" },
      "#" : { "type":"!", "tile":[1], "description":"ground (#)" },

      "w" : { "type":"&", "dock":"W", "description":"wedge (down) side dock" },
      "W" : { "type":"&", "dock":"w", "description":"wedge (down) side dock" },

      "m" : { "type":"&", "dock":"M", "description":"wedge (up) side dock" },
      "M" : { "type":"&", "dock":"m", "description":"wedge (up) side dock" },

      "s" : { "type":"&", "dock":"S", "description":"stair side dock" },
      "S" : { "type":"&", "dock":"s", "description":"stair side dock" },

      "b" : { "type":"@", "description":"block" },
      "4" : { "type":"@", "description":"2x2 blocks (for under double doorway)" },
      "a" : { "type":"@", "description":"xz dock for arch (side arch)" },

      "A" : { "type":"@", "description":"top arch (y+-) dock connector" }
    },
    "tile": {
      "0": {"name":"0", "description":"empty" },
      "1": {"name":"1", "description":"ground" }
    },
    "source": [
    ]
  };

  let lib_info = [
    { "name": "block",        "f": function() { return block(); } },
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



  for (let li_idx=0; li_idx<lib_info.length; li_idx++) {
    let li = lib_info[li_idx];

    let shape_info = li.f();

    let stl_data = stlser.serialize({"binary":false}, shape_info[0].anchor).join("");
    fs.writeFileSync(".plum_stl/" + li.name + ".stl", stl_data);

    let src_idx = stickem_info.source.length;
    stickem_info.source.push({"name":li.name, "dock":[ shape_info[0].dock ]});
    for (let ii=1; ii<shape_info.length; ii++) {
      stickem_info.source[src_idx].dock.push( shape_info[ii].dock );
    }

  }

  console.log(JSON.stringify(stickem_info, undefined, 2));

  return;
}

main();
