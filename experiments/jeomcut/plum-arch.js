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


function pnt_eq( p0, p1, _eps) {
  _eps = ((typeof _eps === "undefined") ? (1/(1024.0*1024.0)) : _eps);

  let x0 = p0[0];
  let y0 = p0[1];

  let x1 = p1[0];
  let y1 = p1[1];

  let dx = (x0-x1),
      dy = (y0-y1);

  if (Math.abs(dx) > _eps) { return false; }
  if (Math.abs(dy) > _eps) { return false; }

  return true;
}

function pnt_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }

  if (a[1] < b[1]) { return -1; }
  if (a[1] > b[1]) { return  1; }

  return 0;
}

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
    {"ds":[0,0,0], "geom":geom, "id":"w", "nei":["w,.","w,.", ".", "b", "b","."]}
  ];
}

function wedge_down() {
  let geom = op.sub(
    op.cub({"size":[1,1,1], "center":[0, 0, 0]}),
    op.rot([Math.PI/4,0,0], op.cub({"size":[2,2,2], "center":[0,0,1]}))
  );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"m", "nei":["m,.","m,.", "b",".", ".","b"]}
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
    {"ds":[0,0,0], "geom":geom, "id":"b", "nei":["s,.","s,.", "b",".", ".","b"]}
  ];
}

function block() {

  let geom = op.mov([0,0,0], op.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "nei":["b","b", ".",".", "b,.","b"]}
  ];
}

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
    {"ds":[0,0,0], "geom":geom, "id":"a1", "nei":["b","b",".",".","b","."]}
  ];
}

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
    {"ds":[0,0,0], "geom":geom, "id":"a1", "nei":["b","b",".",".","b","."]}
  ];
}

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
    {"ds":[ 0,0,0], "geom":lgeom, "id":"a2_1", "nei":["a2_0",   "b",".",".","b","."]},
    {"ds":[ 1,0,0], "geom":rgeom, "id":"a2_0", "nei":[   "b","a2_1",".",".","b","."]}
  ];
}

function arch2(opt, _debug) {
  let geom = 
    op.mov([1,-0.0,0],
        op.sub(
          op.cub({"size":[3,3,1], "center":[0,0,0]}),
          op.mov([0,0,-0.5], op.lif( {height:1}, op.cir({"radius":1.5}))),
          op.cub({"size":[3,3,1], "center":[0,-1.5,0]})
        )
      );

  //DEBUG
  //return [ {"geom":op.add(geom, DEBUG_GEOM) }];

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

  info.push({"ds":[ 0,0,0], "geom": op.and(op.cub({"size":[1,1,1],"center":[0,0,0]}), op.mov([0,0,0], geom)) });
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

  /*
  info.push({"ds":[ 0,0,0], "geom": op.and(op.mov([ 0, 0, 0],geom), op.mov([0.5,0.5,0.5], op.cub({"size":[1,1,1]}))) });
  info.push({"ds":[ 0,0,1], "geom": op.and(op.mov([ 0, 0,-1],geom), op.mov([0.5,0.5,0.5], op.cub({"size":[1,1,1]}))) });
  info.push({"ds":[-1,0,1], "geom": op.and(op.mov([ 1, 0,-1],geom), op.mov([0.5,0.5,0.5], op.cub({"size":[1,1,1]}))) });
  info.push({"ds":[-2,0,1], "geom": op.and(op.mov([ 2, 0,-1],geom), op.mov([0.5,0.5,0.5], op.cub({"size":[1,1,1]}))) });
  info.push({"ds":[-2,0,0], "geom": op.and(op.mov([ 2, 0, 0],geom), op.mov([0.5,0.5,0.5], op.cub({"size":[1,1,1]}))) });
  */

  info[0]["id"] = "a3_0";
  info[1]["id"] = "a3_1";
  info[2]["id"] = "a3_2";
  info[3]["id"] = "a3_3";
  info[4]["id"] = "a3_4";

  info[0]["nei"] = [    ".",    "b", "$1",  ".",    "*",    "*" ];
  info[1]["nei"] = [   "$2",    "b",  "b", "$1",    "*",    "*" ];
  info[2]["nei"] = [   "$4",   "$2",  "b",  ".",    "*",    "*" ];
  info[3]["nei"] = [    "b",    ".", "$4",  ".",    "*",    "*" ];
  info[4]["nei"] = [    "b",   "$2",  "b",  ".",    "*",    "*" ];

  return info;
}

function construct_voxel_dock(info, rot_info) {
  //let f = jscad_f();
  let f = op;

  let irot = 1;

  for (let idx=0; idx<info.length; idx++) {
    let ele = info[idx];

    let theta = irot*Math.PI/2;

    let inst = { "id":"", "ds":[ele.ds[0],ele.ds[1],ele.ds[2]], "geom":{}, "nei":[] };

    inst.id = ele.id + "_00" +  irot.toString();

    // lazy rot
    //
    for (let ii=0; ii<irot; ii++) {
      let ts = [ inst.ds[1], -inst.ds[0], inst.ds[2] ];
      inst.ds = ts;
    }
    inst.geom = f.rot( [0,0,theta], ele.geom );



  }
}

function main() {

  let _lib_info = [
    { "name": "stair", "f": stair },
    { "name": "block", "f": block },
    { "name": "wedge_up", "f": wedge_up },
    { "name": "wedge_down", "f": wedge_down },
    { "name": "arch", "f": null }
  ];

  let lib_info = [
    { "name": "block",        "f": function() { return block(); } },
    { "name": "wedge_up",     "f": function() { return wedge_up(); } },
    { "name": "wedge_down",   "f": function() { return wedge_down(); } },
    { "name": "doorway",      "f": function() { return doorway(); } },
    { "name": "arch0",        "f": function() { return arch0(); } },
    { "name": "arch1",        "f": function() { return arch1(); } },
    { "name": "arch2",        "f": function() { return arch2(); } },
    { "name": "stair",        "f": (function(_n){ return function() { return stair(_n); } })(5)  }
  ];


  for (let li_idx=0; li_idx<lib_info.length; li_idx++) {
    let li = lib_info[li_idx];

    console.log(">>", li.name);

    let shape_info = li.f();

    if (shape_info.length == 1) {
      let stl_data = stlser.serialize({"binary":false}, shape_info[0].geom).join("");
      fs.writeFileSync(".plum_stl/" + li.name + ".stl", stl_data);
    }
    else {
      for (let ii=0; ii<shape_info.length; ii++) {
        let stl_data = stlser.serialize({"binary":false}, shape_info[ii].geom).join("");
        fs.writeFileSync(".plum_stl/" + li.name + "_" + ii.toString() + ".stl", stl_data);
      }
    }
  }

  return;

  /*
  let sub = jscad.booleans.subtract;
  let and = jscad.booleans.intersection;
  let add = jscad.booleans.union;

  let mov = jscad.transforms.translate;
  let rot = jscad.transforms.rotate;
  let lif = jscad.extrusions.extrudeLinear;
  let cub = jscad.primitives.cuboid;
  let cir = jscad.primitives.circle;
  */

  let ds = 1/32;

  //let f = jscad_f();
  let f = op;

  let refcubes =
    f.add(
      f.mov([0,0,0], f.cub({"size":[ds,ds,ds]})),
      f.mov([1,0,0], f.cub({"size":[ds,ds,ds]})),
      f.mov([0,1,0], f.cub({"size":[ds,ds,ds]})),
      f.mov([0,0,1], f.cub({"size":[ds,ds,ds]})),

      f.mov([1,1,0], f.cub({"size":[ds,ds,ds]})),
      f.mov([0,1,1], f.cub({"size":[ds,ds,ds]})),
      f.mov([1,0,1], f.cub({"size":[ds,ds,ds]})),

      f.mov([1,1,1], f.cub({"size":[ds,ds,ds]}))
    );



  //let info = arch1();
  //let fin = add(refcubes, geom);

  //let info = arch2();
  //let fin = add(refcubes, geom[0], geom[1]);


  //let info = arch3();
  //let info = block();
  //let info = stair();
  //let info = stair(5);
  //let info = wedge_u();
  let info = wedge_d();

  let geom = refcubes;
  for (let ii=0; ii<info.length; ii++) {
    geom = f.add(geom, f.mov(info[ii].ds, info[ii].geom));
  }
  let fin = geom;



  /*
  let geom = 
    mov([0.5,1.0,0.5],
      rot([Math.PI/2,0,0],
        sub(
          mov([0,0,0.5], cub({"size":[1,1,1]})),
          lif( {height:1}, cir({"radius":0.5})),
          mov([0,-0.5,0.5], cub({"size":[1,1,1]}))
        )
      )
    );
    */


  /*
  let geom = jscad.primitives.cuboid({"size": [4,1,4]});

  jscad.booleans.subtract(
    jscad.primitives.cuboid({"size": [4,1,4]}),
    jscad.extrusions.extrudeLinear({"height":1}, jscad.primitives.circle({"radius":0.5}))
  );
  */

  let dat = stlser.serialize({"binary": false}, fin);
  console.log(dat[0]);

}

main();
