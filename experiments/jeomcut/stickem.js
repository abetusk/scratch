// LICENSE: CC0
//

var fs = require("fs");
var jscad = require("@jscad/modeling");
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
  "cylinder": jscad.primitives.cylinder,
  "sphere": jscad.primitives.sphere,

  "ruboid": jscad.primitives.roundedCuboid,

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

/*
function _obj_simple_transform(raw_s, mov, axis, theta) {
  mov = ((typeof mov === "undefined") ? [0,0,0] : mov);
  axis = ((typeof axis === "undefined") ? "" : axis);
  theta = ((typeof theta === "undefined") ? 0 : theta);

  let json_obj = jeom.obj2json( raw_s );

  let tv = [ mov[0], mov[1], mov[2] ];

  for (let ii=0; ii<json_obj.length; ii++) {
    let ele = json_obj[ii];
    if ((ele.type != "v") && (ele.type != "vn")) { continue; }

    let _tri = [ 0, 0, 0 ];
    if (ele.type == "v") {
      _tri[0] = ele.v[0];
      _tri[1] = ele.v[1];
      if (ele.v.length > 2) { _tri[2] = ele.v[2]; }
    }
    else if (ele.type == "vn") {
      _tri[0] = ele.vn[0];
      _tri[1] = ele.vn[1];
      if (ele.vn.length > 2) { _tri[2] = ele.vn[2]; }
    }

    if (axis.length > 0) {
      if (axis == 'x') { jeom.rotx(_tri, theta); }
      if (axis == 'y') { jeom.roty(_tri, theta); }
      if (axis == 'z') { jeom.rotz(_tri, theta); }
    }

    jeom.mov(_tri, tv);

    if (ele.type == "v") {
      ele.v[0] = _tri[0];
      ele.v[1] = _tri[1];
      if (ele.v.length > 2) { ele.v[2] = _tri[2]; }
    }
    else if (ele.type == "vn") {
      ele.vn[0] = _tri[0];
      ele.vn[1] = _tri[1];
      if (ele.vn.length > 2) { ele.vn[2] = _tri[2]; }
    }

  }

  return jeom.json2obj(json_obj);
}
*/


function _simple_point_count(geom) {
  let pnts = op.points(geom);
  let n = 0;
  for (let ii=0; ii<pnts.length; ii++) {
    n += pnts[ii].length;
  }
  return n;
}

function _simple_print(geom) {

  let pnts = op.points(geom);
  for (let ii=0; ii<pnts.length; ii++) {
    for (let jj=0; jj<pnts[ii].length; jj++) {
      console.log(pnts[ii][jj].join(" "));
    }
    if (pnts[ii].length > 0) {
      console.log(pnts[ii][0].join(" "));
    }
    console.log("\n");
  }
  return;


  let pgon = geom.polygons;
  for (let ii=0; ii<pgon.length; ii++) {
    let v = pgon[ii].vertices;
    for (let jj=0; jj<v.length; jj++) {
      console.log(v[jj].join(" "));
    }
    if (v.length > 0) {
      console.log(v[0].join(" "));
    }
    console.log("\n");
  }

}

function _vcmp(a,b) {
  let m = Math.floor( 1 / (1/1024) );

  if (Math.round(m*a[0]) < Math.round(m*b[0])) { return -1; }
  if (Math.round(m*a[0]) > Math.round(m*b[0])) { return  1; }
  if (Math.round(m*a[1]) < Math.round(m*b[1])) { return -1; }
  if (Math.round(m*a[1]) > Math.round(m*b[1])) { return  1; }
  if (Math.round(m*a[2]) < Math.round(m*b[2])) { return -1; }
  if (Math.round(m*a[2]) > Math.round(m*b[2])) { return  1; }
  return 0;
}

function _point_sim(geom_a, geom_b, _eps) {
  _eps = ((typeof _eps === "undefined") ? (1/1024) : _eps);
  _eps = 1/128;

  let _ta = op.points( geom_a );
  let _tb = op.points( geom_b );

  if ((_ta.length==0) || (_tb.length==0)) { return 0; }

  let pnt_a = [];
  let pnt_b = [];

  for (let ii=0; ii<_ta.length; ii++) {
    for (let jj=0; jj<_ta[ii].length; jj++) {
      pnt_a.push( [ _ta[ii][jj][0], _ta[ii][jj][1], _ta[ii][jj][2] ] );
    }
  }

  for (let ii=0; ii<_tb.length; ii++) {
    for (let jj=0; jj<_tb[ii].length; jj++) {
      pnt_b.push( [ _tb[ii][jj][0], _tb[ii][jj][1], _tb[ii][jj][2] ] );
    }
  }

  pnt_a.sort( _vcmp );
  pnt_b.sort( _vcmp );

  let m = Math.floor( 1 / _eps );

  // deduplicate
  //
  let _tp = [ [ pnt_a[0][0], pnt_a[0][1], pnt_a[0][2] ] ];
  for (let ii=1; ii<pnt_a.length; ii++) {
    let j = _tp.length-1;
    let dx = Math.abs(Math.round( m * (pnt_a[ii][0] - _tp[j][0]) ));
    let dy = Math.abs(Math.round( m * (pnt_a[ii][1] - _tp[j][1]) ));
    let dz = Math.abs(Math.round( m * (pnt_a[ii][2] - _tp[j][2]) ));

    if ((dx < _eps) &&(dy < _eps) && (dz < _eps)) { continue; }

    _tp.push( [ pnt_a[ii][0], pnt_a[ii][1], pnt_a[ii][2] ] );
  }
  pnt_a = _tp;

  _tp = [ [ pnt_b[0][0], pnt_b[0][1], pnt_b[0][2] ] ];
  for (let ii=1; ii<pnt_b.length; ii++) {
    let j = _tp.length-1;
    let dx = Math.abs(Math.round( m * (pnt_b[ii][0] - _tp[j][0]) ));
    let dy = Math.abs(Math.round( m * (pnt_b[ii][1] - _tp[j][1]) ));
    let dz = Math.abs(Math.round( m * (pnt_b[ii][2] - _tp[j][2]) ));

    if ((dx < _eps) &&(dy < _eps) && (dz < _eps)) { continue; }

    _tp.push( [ pnt_b[ii][0], pnt_b[ii][1], pnt_b[ii][2] ] );
  }
  pnt_b = _tp;

  let n = ((pnt_a.length < pnt_b.length) ? pnt_a.length : pnt_b.length );

  let count = 0;
  for (let ii=0; ii<n; ii++) {
    let dx = Math.abs(Math.round( m * (pnt_a[ii][0] - pnt_b[ii][0]) ));
    let dy = Math.abs(Math.round( m * (pnt_a[ii][1] - pnt_b[ii][1]) ));
    let dz = Math.abs(Math.round( m * (pnt_a[ii][2] - pnt_b[ii][2]) ));

    if ((dx > _eps) || (dy > _eps) || (dz > _eps)) { continue; }

    count++;

  }

  return (count / n);
}

// create slice gemoetry to find docking information.
// This should create a thin cuboid that is thin in the plane
// perpendicular to the ddocking direction normal and unit cube dimensions
// elsewhere.
// The idea is that this thin slice can be used to find an effective profile
// of the docking geometry to use to compare against other tiles.
//
function slice_idir(cfg, idir, _center) {
  _center = ((typeof _center === "undefined") ? [cfg.unit_center[0],cfg.unit_center[1],cfg.unit_center[2]] : _center);

  let _eps = cfg.eps;
  let dx = cfg.unit[0],
      dy = cfg.unit[1],
      dz = cfg.unit[2];
  let s = cfg.dock_slice;

  dx -= _eps;
  dy -= _eps;
  dz -= _eps;
  s -= _eps;
  
  if (idir == 0) {
    _center[0] += (dx-s)/2;
    return op.cuboid({"size": [ s, dy, dz ], "center": _center });
  }
  else if (idir == 1) {
    _center[0] -= (dx-s)/2;
    return op.cuboid({"size": [ s, dy, dz ], "center": _center });
  }

  else if (idir == 2) {
    _center[1] += (dy-s)/2;
    return op.cuboid({"size": [ dx, s, dz ], "center": _center });
  }
  else if (idir == 3) {
    _center[1] -= (dy-s)/2;
    return op.cuboid({"size": [ dx, s, dz ], "center": _center });
  }

  else if (idir == 4) {
    _center[2] += (dz-s)/2;
    return op.cuboid({"size": [ dx, dy, s ], "center": _center });
  }
  else if (idir == 5) {
    _center[2] -= (dz-s)/2;
    return op.cuboid({"size": [ dx, dy, s], "center": _center });
  }

  return null;
}

var UNIT = {
  "size": [1,1/6,1],
  "center": [0,1/12,0]
};

let vox_info = {
  "size": [5,11,5],
  "center": [0,1/4,0],
  "ds": [
    [1,0,0],
    [0,1/2,0],
    [0,0,1]
  ],
  "grid": []
};

let _eps = 1/1024.0;

for (let z=0; z<vox_info.size[2]; z++) {
  vox_info.grid.push([]);
  for (let y=0; y<vox_info.size[1]; y++) {
    vox_info.grid[z].push([]);
    for (let x=0; x<vox_info.size[0]; x++) {
      vox_info.grid[z][y].push(0);
    }
  }
}

let _opt = {
  "size": [ UNIT.size[0] - _eps, UNIT.size[1] - _eps, UNIT.size[2] - _eps ],
  "center": [ UNIT.center[0], UNIT.center[1], UNIT.center[2] ]
};

var unitc = op.cuboid(_opt);

function obj2geom(fn_name) {
  let rawData = fs.readFileSync(fn_name);
  var geom = op.objload({"output":"geometry"}, rawData.toString());
  return geom;
}

function block_occupancy(cfg, geom, name) {
  name = ((typeof name === "undefined") ? "" : name);

  let S = [
    cfg.unit[0],
    cfg.unit[1],
    cfg.unit[2]
  ];

  let B = [ 5,5,5 ];
  let C = [ 2, 2, 2 ];

  let _opt = {
    "size": [ S[0] - _eps, S[1] - _eps, S[2] - _eps ],
    "center": cfg.unit_center
  };

  let tri_pnt = op.points(geom);
  let pnt = [];

  let _bbox_init = false;
  let _bbox = [[0,0,0], [0,0,0]];


  for (let tri_idx=0; tri_idx < tri_pnt.length; tri_idx++) {
    for (let ii=0; ii < tri_pnt[tri_idx].length; ii++) {
      pnt.push( [ tri_pnt[tri_idx][ii][0], tri_pnt[tri_idx][ii][1], tri_pnt[tri_idx][ii][2] ] );

      // pathetic attempt at subdivision...
      //
      if (ii>0) {
        let _nterp=4;
        for (let _ii=1; _ii<_nterp; _ii++) {
          let p = _ii / _nterp;
          let axyz = [
            tri_pnt[tri_idx][ii-1][0] + (p*(tri_pnt[tri_idx][ii][0] - tri_pnt[tri_idx][ii-1][0])),
            tri_pnt[tri_idx][ii-1][1] + (p*(tri_pnt[tri_idx][ii][1] - tri_pnt[tri_idx][ii-1][1])),
            tri_pnt[tri_idx][ii-1][2] + (p*(tri_pnt[tri_idx][ii][2] - tri_pnt[tri_idx][ii-1][2]))
          ];
          pnt.push(axyz);

          if (!_bbox_init) {
            _bbox[0][0] = axyz[0]; _bbox[0][1] = axyz[1]; _bbox[0][2] = axyz[2];
            _bbox[1][0] = axyz[0]; _bbox[1][1] = axyz[1]; _bbox[1][2] = axyz[2];
          }
          _bbox_init=true;

          if (_bbox[0][0] > axyz[0]) { _bbox[0][0] = axyz[0]; }
          if (_bbox[1][0] < axyz[0]) { _bbox[1][0] = axyz[0]; }

          if (_bbox[0][1] > axyz[1]) { _bbox[0][1] = axyz[1]; }
          if (_bbox[1][1] < axyz[1]) { _bbox[1][1] = axyz[1]; }

          if (_bbox[0][2] > axyz[2]) { _bbox[0][2] = axyz[2]; }
          if (_bbox[1][2] < axyz[2]) { _bbox[1][2] = axyz[2]; }

        }
      }
    }
  }

  //console.log("##", name, "bbox:", JSON.stringify(_bbox));

  //console.log(pnt);

  let block_list = [];

  for (let iz=0; iz<B[2]; iz++) {
    for (let iy=0; iy<B[1]; iy++) {
      for (let ix=0; ix<B[0]; ix++) {
        //let dx = (ix*S[0]) + C[0];
        //let dy = (iy*S[1]) + C[1];
        //let dz = (iz*S[2]) + C[2];

        let dx = ((ix - C[0])*S[0]) + cfg.unit_center[0];
        let dy = ((iy - C[1])*S[1]) + cfg.unit_center[1];
        let dz = ((iz - C[2])*S[2]) + cfg.unit_center[2];


        let sx = ((ix - C[0])*S[0]) + cfg.unit_center[0] - cfg.unit[0]/2 + _eps;
        let sy = ((iy - C[1])*S[1]) + cfg.unit_center[1] - cfg.unit[1]/2 + _eps;
        let sz = ((iz - C[2])*S[2]) + cfg.unit_center[2] - cfg.unit[2]/2 + _eps;

        let ex = ((ix - C[0])*S[0]) + cfg.unit_center[0] + cfg.unit[0]/2 - _eps;
        let ey = ((iy - C[1])*S[1]) + cfg.unit_center[1] + cfg.unit[1]/2 - _eps;
        let ez = ((iz - C[2])*S[2]) + cfg.unit_center[2] + cfg.unit[2]/2 - _eps;

        //if (name == "skew-large-corner_000") { console.log("##", name, ix, iy, iz, "::", dx, dy, dz, "s:", sx,sy,sz, "e:", ex,ey,ez); }

        found = false;
        for (let ii=0; ii<pnt.length; ii++) {
          if ((pnt[ii][0] < sx) ||
              (pnt[ii][0] > ex) ||
              (pnt[ii][1] < sy) ||
              (pnt[ii][1] > ey) ||
              (pnt[ii][2] < sz) ||
              (pnt[ii][2] > ez)) { continue; }
          block_list.push({ "ds": [dx,dy,dz] });

          //console.log("   !!!", name, dx, dy, dz, "(pnt:", pnt[ii][0], pnt[ii][1], pnt[ii][2], ")");

          found=true;
          break;
        }

        //if (found) { break; }

      }
    }
  }

  //console.log(block_list);

  return block_list;

  // volume calculations have problems with the arbitrary geometry of the objs...
  //

  console.log("#unit_block:", JSON.stringify(_opt));

  let _unit_block = op.cuboid(_opt);
  for (let iz=0; iz<B[2]; iz++) {
    for (let iy=0; iy<B[1]; iy++) {
      for (let ix=0; ix<B[0]; ix++) {
        let dx = (ix*S[0]) - C[0];
        let dy = (iy*S[1]) - C[1];
        let dz = (iz*S[2]) - C[2];

        let _r = op.vol( op.and( op.mov( [dx,dy,dz], _unit_block), geom ) )

        //console.log("#dxyz:", dx, dy, dz, ", vol:", _r);

        if (_r>_eps) {
          block_list.push({ "ds": [dx,dy,dz] });
          console.log(dx,dy,dz, _r);
        }
        else {
          //console.log("#", ix, iy, iz);
        }

      }
    }
  }

  return block_list;
}

function bvox_occupancy(fn_name) {

  console.log("\n----");
  console.log(fn_name);

  let rawData = fs.readFileSync(fn_name);

  //var rawData = fs.readFileSync('src/gap.obj')
  //var rawData = fs.readFileSync('src/castle.obj')
  //var rawData = fs.readFileSync('src/ramp.obj')
  //var rawData = fs.readFileSync('src/ramp.obj')
  //var opt = {"output":"geometry"};
  var geom = op.objload({"output":"geometry"}, rawData.toString());

  let S = [
    vox_info.ds[0][0],
    vox_info.ds[1][1],
    vox_info.ds[2][2]
  ];

  let sxyz = [
    Math.floor(vox_info.size[0]/2) * vox_info.ds[0][0],
    Math.floor(vox_info.size[1]/2) * vox_info.ds[1][1],
    Math.floor(vox_info.size[2]/2) * vox_info.ds[2][2]
  ];

  for (let iz=0; iz<vox_info.size[2]; iz++) {
    for (let iy=0; iy<vox_info.size[1]; iy++) {
      for (let ix=0; ix<vox_info.size[0]; ix++) {
        let dx = (ix*S[0]) - sxyz[0];
        let dy = (iy*S[1]) - sxyz[1];
        let dz = (iz*S[2]) - sxyz[2];

        let _r = op.vol( op.and( op.mov( [dx,dy,dz], unitc ), geom[0] ) )

        if (_r>_eps) {
          console.log(dx,dy,dz, _r);
        }
        else {
          //console.log("#", ix, iy, iz);
        }

      }
    }
  }

}

function _debug_print_dock_lib(dock_lib) {

  // debug...
  //
  for (i=0; i<dock_lib.length; i++)  {

    let dx = 4;
    let dy = 6;
    let dz = 6;

    console.log("##\n##", dock_lib[i].exemplar);

    let _pgn = op.mov( [i*dx,0,0], dock_lib[i].src_pos );
    _simple_print(_pgn);
    console.log("\n\n");

    _pgn = op.mov( [i*dx,0,0], dock_lib[i].dst_pos );
    _simple_print(_pgn);
    console.log("\n\n");

    _pgn = op.mov( [i*dx,0,dz], dock_lib[i].src_neg );
    _simple_print(_pgn);
    console.log("\n\n");

    _pgn = op.mov( [i*dx,0,dz], dock_lib[i].dst_neg);
    _simple_print(_pgn);
    console.log("\n\n");

    // slices...
    //
    //_pgn = op.mov( [i*dx,0,dz*2], dock_lib[i].src_slice);
    //_simple_print(_pgn);
    //console.log("\n\n");

    //_pgn = op.mov( [i*dx,0,dz*2], dock_lib[i].dst_slice);
    //_simple_print(_pgn);
    //console.log("\n\n");

  }

}



function __sandbox() {
  let _slice = 1/32;
  let _gap_geom = obj2geom("src/gap.obj")[0];
  let _ramp_geom = obj2geom("src/ramp.obj")[0];
  let _nr_geom = obj2geom("src/narrow-round.obj")[0];
  let _od_geom = obj2geom("src/obstacle-diamond.obj")[0];
  let _ic_geom = obj2geom("src/inner-corner.obj")[0];
  let _rc_geom = obj2geom("src/round-corner-a.obj")[0];



  zm_dock = op.and( op.cuboid({"size":[1,0.5,_slice], "center":[0,0.25,0.5-_slice/2]}), _gap_geom );
  _simple_print( zm_dock );

  var qdock = op.and( op.mov([0,0,-(1-_slice)],zm_dock), _ramp_geom );
  console.log( "dock - ramp", op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  var qdock = op.and( op.mov([0,0,-(1-_slice)],zm_dock), _nr_geom );
  console.log( "dock - narrow-round", op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  var qdock = op.and( op.mov([0,0,-(1-_slice)],zm_dock), _od_geom );
  console.log( "dock - obstacle-diamond", op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  var qdock = op.and( op.mov([0,0,-(1-_slice)],zm_dock), _ic_geom );
  console.log( "dock - inner-corner", op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  var qdock = op.and( op.mov([0,0,0],zm_dock), _ic_geom );
  console.log( op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  var qdock = op.and( op.mov([0,0,-(1-_slice)],zm_dock), _rc_geom );
  console.log( op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  var qdock = op.and( op.mov([0,0,0],zm_dock), _rc_geom );
  console.log( op.vol(zm_dock), op.vol(qdock), "(", op.vol(qdock) / op.vol(zm_dock), ")" );

  process.exit();



  console.log(">>>", op.bbox( obj2geom("src/ramp.obj")[0] ));


  bvox_occupancy("src/gap.obj");
  bvox_occupancy("src/ramp.obj");
  bvox_occupancy("src/hill-corner.obj");
  bvox_occupancy("src/ramp-a.obj");
  bvox_occupancy("src/ramp-large.obj");

  /*
  let _slice = 1/32;
  let _gap_geom = obj2geom("src/gap.obj")[0];
  zm_dock = op.and( op.cuboid({"size":[1,0.5,_slice], "center":[0,0.25,0.5-_slice/2]}), _gap_geom );
  _simple_print( zm_dock );
  */

  process.exit();

  //console.log(JSON.stringify(geometries, undefined, 2));

  //---



  //for (z in op) { console.log(z, op[z]); }

  //console.log( op.cuboid( [1,2,3], [-1,-3,0] ) );

  //_simple_print( op.cuboid( {"size":[1,2,3], "center":[-1,-3,0] }) );

  let dock_geom = op.cuboid({"size":[1, 1/6, 1/32], "center":[0, 1/12, -0.5]});
  let dock_t = op.and( dock_geom, geom[0] );

  //console.log(JSON.stringify(dock_t, undefined, 2));

  //_simple_print( geom[0] );
  //_simple_print( dock_geom);
  _simple_print( dock_t );

  //console.log(">>>", op.bbox(geom), op.com(geom), op.vol( geom ));

}

function _incr_rot_idx(rot_v, symmetry) {

  let tok = symmetry.split(",");

  for (let tok_idx=0; tok_idx<tok.length; tok_idx++) {

    let sub_tok = tok[tok_idx].split("");

    let _carry = 0;
    for (let sub_tok_idx=0; sub_tok_idx<sub_tok.length; sub_tok_idx++) {

      let _axis = sub_tok[sub_tok_idx];

      if (_axis == "x") { rot_v[0] = (rot_v[0] + 1) % 4; _carry = ((rot_v[0]==0) ? 1 : _carry); }
      if (_axis == "y") { rot_v[1] = (rot_v[1] + 1) % 4; _carry = ((rot_v[1]==0) ? 1 : _carry); }
      if (_axis == "z") { rot_v[2] = (rot_v[2] + 1) % 4; _carry = ((rot_v[2]==0) ? 1 : _carry); }

    }

    if (_carry==0) { break; }
  }

}

// takes in idir and irot (3vec) and
// return idir of resulting direction.
//
function idir_irot(idir, irot) {
  let v = [ 0, 0, 0, 1 ];

  if      (idir == 0) { v[0] =  1; }
  else if (idir == 1) { v[0] = -1; }
  else if (idir == 2) { v[1] =  1; }
  else if (idir == 3) { v[1] = -1; }
  else if (idir == 4) { v[2] =  1; }
  else if (idir == 5) { v[2] = -1; }
  else { return -1; }

  let Mx = m4.xRotation( irot[0]*Math.PI/2 );
  let My = m4.yRotation( irot[1]*Math.PI/2 );
  let Mz = m4.zRotation( irot[2]*Math.PI/2 );

  let M = m4.mul( Mz, m4.mul( My, Mx ) );

  let v_r = m4.mulp(M, v);

  if      (v_r[0] >  0.5) { return 0; }
  else if (v_r[0] < -0.5) { return 1; }
  else if (v_r[1] >  0.5) { return 2; }
  else if (v_r[1] < -0.5) { return 3; }
  else if (v_r[2] >  0.5) { return 4; }
  else if (v_r[2] < -0.5) { return 5; }

  return -1;
}

// src/dst_block are arrays of structures, currently each element is object
// with 'ds' element that holds center position.
//
function block_collision( src_block, dst_block, src_ds, dst_ds ) {
  let _eps = 1/1024;

  let _s = [];
  let _d = [];

  for (let s_i=0; s_i<src_block.length; s_i++) {
    _s.push({
      "ds": [ src_block[s_i].ds[0] + src_ds[0],
              src_block[s_i].ds[1] + src_ds[1],
              src_block[s_i].ds[2] + src_ds[2]
      ]
    });
  }

  for (let d_i=0; d_i<dst_block.length; d_i++) {
    _d.push({
      "ds": [ dst_block[d_i].ds[0] + dst_ds[0],
              dst_block[d_i].ds[1] + dst_ds[1],
              dst_block[d_i].ds[2] + dst_ds[2]
      ]
    });
  }

  //console.log("##??", src_block, dst_block, src_ds, dst_ds, _s.length, _d.length);
  //console.log("##?? src_ds:", JSON.stringify(src_ds), "dst_ds:", JSON.stringify(dst_ds));
  //console.log("##???? _s:", JSON.stringify(_s));
  //console.log("##???? _d:", JSON.stringify(_d));

  for (let s_i=0; s_i<_s.length; s_i++) {
    for (let d_i=0; d_i<_d.length; d_i++) {
      let dist1 = 0;
      for (let ii=0; ii<3; ii++) {
        dist1 += Math.abs( _s[s_i].ds[ii] - _d[d_i].ds[ii] );
      }

      //console.log("#####", JSON.stringify(_s[s_i]), "-", JSON.stringify(_d[d_i]), "==>", dist1, "(?", 3*_eps, ")");

      if (dist1 < 3*_eps) { return true; }
    }
  }


  return false;
}

// representative creation
//
function create_rep(cfg, geom, base_name) {

  let base = op.clone(geom);

  let rep_info = {
    "list": [],
    "repr_idx": {},
    "name_repr_map": {}
  };
  let rep_list = [];

  let rot_v = [0,0,0];

  let vol_thresh = 1.0 - cfg.eps;

  // rotate through each of the provided symmetries
  // and take only the unique representative
  //
  do {

    let tgeom = op.clone(base);

    if (rot_v[0] > 0) { tgeom = op.rotX( rot_v[0]*Math.PI/2, tgeom ); }
    if (rot_v[1] > 0) { tgeom = op.rotY( rot_v[1]*Math.PI/2, tgeom ); }
    if (rot_v[2] > 0) { tgeom = op.rotZ( rot_v[2]*Math.PI/2, tgeom ); }

    let name = base_name + "_" + rot_v.join("");

    let found = false;
    for (let rep_idx=0; rep_idx<rep_list.length; rep_idx++) {
      if (_point_sim( rep_list[rep_idx].geom, tgeom ) > cfg.point_similarity_threshold) {
        found = true;

        rep_info.repr_idx[name] = rep_idx;
        rep_info.name_repr_map[name] = rep_list[rep_idx].name;
        break;
      }
    }

    if (!found) {

      rep_info.repr_idx[name] = rep_list.length;

      console.log("\n##", name);

      rep_list.push({
        //"name": base_name + "_" + rot_v.join(""),
        "name": name,
        "irot": [ rot_v[0], rot_v[1], rot_v[2] ],
        "rot": [ rot_v[0]*Math.PI/2, rot_v[1]*Math.PI/2, rot_v[2]*Math.PI/2 ],
        "block": block_occupancy(cfg, tgeom, name),
        "geom": tgeom
      });

      console.log("#>>>", name, JSON.stringify(rep_list[ rep_list.length-1 ].block));

      rep_info.name_repr_map[name] = rep_list[rep_list.length-1].name;

    }

    _incr_rot_idx(rot_v, cfg.symmetry);

  } while( (rot_v[0] != 0) ||
           (rot_v[1] != 0) ||
           (rot_v[2] != 0) );

  rep_info.list = rep_list;

  return rep_info;
  //return rep_list;
}

// The recipe is as follows:
//
// * Read cfg file
// * From cfg, read in each of the base obj geometries
// * find the representative of each geometry, rotated around
//   with the mappings to the representative from other 'raw' names
// * take cfg.dock_exemplar to find docking geometry, both positive and negative,
//   rotating each exemplar pair (by the same rotation) for all cfg.symmetry
//   to find all directions
// * go through all representative pairings to see if there's a dock match
//   (must match both positive and negative) to construct rules

function _main_blech() {

  var cfg = JSON.parse( fs.readFileSync("./data/stickem_minigolf.conf") );
  let base_dir = "./data/minigolf.obj";

  let stickem_info = {
    "basename": [],
    "rep" : [],

    "repr_idx_map": {},
    "name_repr_map": {},

    "basename_rep_idx" : {}
  };

  for (let idx=0; idx<cfg.source.length; idx++) {
    let name = cfg.source[idx];

    let geom = obj2geom( base_dir + "/" + name + ".obj" )[0];

    if (name in cfg.source_info) {
      if ("offset" in cfg.source_info[name]) {
        console.log("## MOV", name, cfg.source_info[name].offset);
        geom = op.mov(cfg.source_info[name].offset, geom);
      }
    }

    let geom_rep = create_rep(cfg, geom, name);

    stickem_info.basename.push( name );
    stickem_info.basename_rep_idx[name] = [];

    for (let ii=0; ii<geom_rep.list.length; ii++) {
      stickem_info.basename_rep_idx[name].push( stickem_info.rep.length );
      stickem_info.repr_idx_map[ geom_rep.list[ii].name ] = stickem_info.rep.length;
      stickem_info.rep.push( geom_rep.list[ii] );
    }

    for (let _name in geom_rep.name_repr_map) {
      stickem_info.name_repr_map[_name] = geom_rep.name_repr_map[_name];

      console.log("##>>", _name, "->", geom_rep.name_repr_map[_name]);

    }

  }


  // add 'empty' tile representative
  //
  stickem_info.basename_rep_idx['.'] = [ stickem_info.rep.length ];
  stickem_info.rep.push({
    "name": "._000",
    "irot": [0,0,0],
    "rot": [0,0,0],
    "block": [ {"ds":[0, 0.25, 0]} ],
    "geom": op.create()
  });
  stickem_info.repr_idx_map["._000"] = stickem_info.rep.length-1;
  stickem_info.name_repr_map["._000"] = "._000";
  stickem_info.name_repr_map["._010"] = "._000";
  stickem_info.name_repr_map["._020"] = "._000";
  stickem_info.name_repr_map["._030"] = "._000";

  // 'underground' tile, so we have something for the base supports
  // to build on top of, or other tiles...
  //
  // needs some thinking....
  //
  stickem_info.basename_rep_idx['_'] = [ stickem_info.rep.length ];
  stickem_info.rep.push({
    "name": "__000",
    "irot": [0,0,0],
    "rot": [0,0,0],
    "block": [ { "ds": [0, 0.25, 0] } ],
    "geom": op.create()
  });
  stickem_info.repr_idx_map["__000"] = stickem_info.rep.length-1;
  stickem_info.name_repr_map["__000"] = "__000";
  stickem_info.name_repr_map["__010"] = "__000";
  stickem_info.name_repr_map["__020"] = "__000";
  stickem_info.name_repr_map["__030"] = "__000";

  //console.log(stickem_info);

  let oppo_dir = [ 1,0, 3,2, 5,4 ];
  let dir_descr = [ "x+", "x-", "y+", "y-", "z+", "z-" ];

  let idir_v = [
    [ 1, 0, 0 ], [ -1,  0,  0 ],
    [ 0, 1, 0 ], [  0, -1,  0 ],
    [ 0, 0, 1 ], [  0,  0, -1 ]
  ];

  for (let ii=0; ii<idir_v.length; ii++) {
    for (let jj=0; jj<3; jj++) {
      idir_v[ii][jj] *= cfg.unit[jj];
    }
  }

  console.log("#tilecount:", stickem_info.rep.length);

  let dock_seen = {};
  let dock_lib = [];

  // construct docking information/list from cfg.dock_exemplar
  //
  for (let exemplar_idx=0; exemplar_idx<cfg.dock_exemplar.length; exemplar_idx++) {

    // exemplar src/dst are themselves lists, with '|' as the string separator.
    //
    let _src_list = cfg.dock_exemplar[exemplar_idx][0].split("|");
    let _dst_list = cfg.dock_exemplar[exemplar_idx][1].split("|");
    let exemplar_idir = cfg.dock_exemplar[exemplar_idx][2];

    // we want to rotate each of the exemplars by the symmetry specified in the configuration
    // but we need to make sure we're taking the representative. So the idea is to rotate
    // each exemplar pair by the same rotation, map each to their representative and worry
    // about deduplicating the rules later, after we've collected all relevant pairings.
    //
    // Though not strictly necessary, we try and limit the number of redundnat docking structures
    // by noticing when there's an identical mapping (src,dst,irot). Hopefully redundant docking
    // information won't be an error as we'll need to deduplicate the rules at the end anyway
    // but it should cut down on the noise by only having docking information that's needed.
    // This is all the `dock_seen` stuff below.
    //
    // The exemplars are used to create "template" docking information, so the docking information
    // will be used later on to find matches between other tile pairings.
    // The src tile is take at the origin cell with the dst shifted in the appropriate idir.
    // Right now, multi block tiles aren't supported, so it's assumed that the the dock happens
    // from 1 manhatten distance to the source block.
    // When doing docking pairing below, the blocks are considered, so it can test all relevant
    // blocks for a multi-block tile.
    //
    for (let _src_list_idx=0; _src_list_idx<_src_list.length; _src_list_idx++) {
      for (let _dst_list_idx=0; _dst_list_idx<_dst_list.length; _dst_list_idx++) {

      let src_basename = _src_list[_src_list_idx];
      let dst_basename = _dst_list[_dst_list_idx];

      let exemplar_irot = [0,0,0];
      do {

        let sfx = "_" + exemplar_irot.join("");

        let src_name = stickem_info.name_repr_map[ src_basename + sfx ];
        let dst_name = stickem_info.name_repr_map[ dst_basename + sfx ];

        let idir = idir_irot(exemplar_idir, exemplar_irot);
        _incr_rot_idx(exemplar_irot, cfg.symmetry);

        let seen_key = src_name + ":" + dst_name + ":" + idir.toString();
        if (seen_key in dock_seen) {

          console.log("#SKIPPING", seen_key);
          continue;

        }

        //----------
        //----------
        //----------
        // create new dock
        //

        dock_seen[seen_key] = true;

        console.log("#TT::", src_basename, dst_basename, sfx, "...",
          src_name, dst_name, "(", exemplar_irot, ")", "(idir:", exemplar_idir, "-->", idir, ")");

        //let rep_idx = stickem_info.basename_rep_idx[src_name][ii];

        // centers of src and dst
        //
        let _c_a = [ cfg.unit_center[0], cfg.unit_center[1], cfg.unit_center[2] ];
        let _c_b = [ cfg.unit_center[0], cfg.unit_center[1], cfg.unit_center[2] ];

        // move dst to neighboring position
        //
        _c_b[0] += idir_v[idir][0];
        _c_b[1] += idir_v[idir][1];
        _c_b[2] += idir_v[idir][2];

        // create docking slices
        //
        let a_slice = slice_idir(cfg, idir, _c_a);
        let b_slice = slice_idir(cfg, oppo_dir[idir], _c_b);

        //_simple_print(a_slice);
        //console.log("\n\n");
        //_simple_print(b_slice);

        let dock_ele = {
          "exemplar":[ src_basename, dst_basename],
          "exemplar_realized": [ src_name, dst_name ],

          "idir": idir,
          "vdir": idir_v[idir],

          "src_slice": a_slice,
          "dst_slice": b_slice,

          "src_pos": {},
          "src_neg": {},

          "dst_pos": {},
          "dst_neg": {},

          "src_dock_pos_vol": 0.0,
          "src_dock_neg_vol": 0.0,

          "dst_dock_pos_vol": 0.0,
          "dst_dock_neg_vol": 0.0
        };

        let _src_idx = stickem_info.repr_idx_map[ src_name ];
        let _dst_idx = stickem_info.repr_idx_map[ dst_name ];


        let src_geom = stickem_info.rep[ _src_idx ].geom;
        let dst_geom = stickem_info.rep[ _dst_idx ].geom;

        dock_ele.src_pos = op.and( a_slice, src_geom );
        dock_ele.dst_pos = op.and( b_slice, op.mov( idir_v[idir], dst_geom ) );

        dock_ele.src_neg = op.sub( a_slice, src_geom );
        dock_ele.dst_neg = op.sub( b_slice, op.mov( idir_v[idir], dst_geom ) );

        dock_ele.src_dock_pos_vol = op.vol( dock_ele.src_pos );
        dock_ele.dst_dock_pos_vol = op.vol( dock_ele.dst_pos );

        dock_ele.src_dock_neg_vol = op.vol( dock_ele.src_neg );
        dock_ele.dst_dock_neg_vol = op.vol( dock_ele.dst_neg );

        let __idx  = dock_lib.length;

        dock_lib.push( dock_ele );

        /*
        console.log("##", __idx, src_name, _src_idx, ",", dst_name, _dst_idx, "(vol:",

            "src+/dst+:",
          dock_ele.src_dock_pos_vol,
          dock_ele.dst_dock_pos_vol,

            "src-/dst-:",
          dock_ele.src_dock_neg_vol,
          dock_ele.dst_dock_neg_vol,

          ")",
          "(pntsim:",
          ")",
          "(pnts:",
            "src+/dst+:",
          _simple_point_count( dock_ele.src_pos ),
          _simple_point_count( dock_ele.dst_pos ),
            "src-/dst-:",
          _simple_point_count( dock_ele.src_neg ),
          _simple_point_count( dock_ele.dst_neg ),
          ")"
        );
        */

        //
        //----------
        //----------
        //----------

        //_incr_rot_idx(exemplar_irot, cfg.symmetry);
      } while ((exemplar_irot[0] != 0) ||
               (exemplar_irot[1] != 0) ||
               (exemplar_irot[2] != 0));
      }
    }
  }

  
  console.log("###================");
  for (let ii=0; ii<dock_lib.length; ii++) {
    console.log("#dock[", ii, "]",
      JSON.stringify( dock_lib[ii].exemplar_realized ),
      "idir:", dock_lib[ii].idir,
      dock_lib[ii].vdir,
      "srcvol+-(", dock_lib[ii].src_dock_pos_vol, dock_lib[ii].src_dock_neg_vol, ")",
      "dstvol+-(", dock_lib[ii].dst_dock_pos_vol, dock_lib[ii].dst_dock_neg_vol, ")",
      "srcpnt+-(", _simple_point_count(dock_lib[ii].src_pos), _simple_point_count(dock_lib[ii].src_neg), ")",
      "dstpnt+-(", _simple_point_count(dock_lib[ii].dst_pos), _simple_point_count(dock_lib[ii].dst_neg), ")"
    );
  }
  console.log("###================");

  //DEBUG
  //console.log("DEBUG!!!");
  //return;

  //_debug_print_dock_lib(dock_lib);
  //return;

  let debug_counter = 0;

  for (let src_rep_idx=0; src_rep_idx<stickem_info.rep.length; src_rep_idx++) {
    for (let dst_rep_idx=0; dst_rep_idx<stickem_info.rep.length; dst_rep_idx++) {

      let _src = stickem_info.rep[src_rep_idx];
      let _dst = stickem_info.rep[dst_rep_idx];

      //console.log("src:", _src);
      //console.log("dst:", _dst);

      for (let src_block_idx=0; src_block_idx < _src.block.length; src_block_idx++) {
        for (let dst_block_idx=0; dst_block_idx < _dst.block.length; dst_block_idx++) {

          let _src_block = _src.block[src_block_idx];
          let _dst_block = _dst.block[dst_block_idx];

          //let src_geom = _src.geom;
          //let dst_geom = _dst.geom;

          let _src_ds = [
            -(_src_block.ds[0] - cfg.unit_center[0]),
            -(_src_block.ds[1] - cfg.unit_center[1]),
            -(_src_block.ds[2] - cfg.unit_center[2])
          ];

          let _dst_ds = [
            -(_dst_block.ds[0] - cfg.unit_center[0]),
            -(_dst_block.ds[1] - cfg.unit_center[1]),
            -(_dst_block.ds[2] - cfg.unit_center[2])
          ];

          let src_geom = op.mov( _src_ds, _src.geom );
          let dst_geom = op.mov( _dst_ds, _dst.geom );

          console.log("##_src_ds:", _src_ds, "_dst_ds:", _dst_ds, "(counter:", debug_counter, ")");
          if (debug_counter==-1) {
            _simple_print(src_geom);
            console.log("\n\n");
            _simple_print(dst_geom);
            return;
          }
          debug_counter++;

          for (let dock_idx=0; dock_idx<dock_lib.length; dock_idx++) {

            let idir = dock_lib[dock_idx].idir;

            let _block_src_ds = [ _src_ds[0], _src_ds[1], _src_ds[2] ];
            let _block_dst_ds = [
              _dst_ds[0] + dock_lib[dock_idx].vdir[0],
              _dst_ds[1] + dock_lib[dock_idx].vdir[1],
              _dst_ds[2] + dock_lib[dock_idx].vdir[2]
            ];

            if (block_collision( _src.block, _dst.block, _block_src_ds, _block_dst_ds )) {
              console.log("## COLLISION (should skip)");
              continue;
            }

            let sdv_p = dock_lib[dock_idx].src_dock_pos_vol;
            let ddv_p = dock_lib[dock_idx].dst_dock_pos_vol;

            let sdv_n = dock_lib[dock_idx].src_dock_neg_vol;
            let ddv_n = dock_lib[dock_idx].dst_dock_neg_vol;

            let _sdv_p = ((sdv_p < _eps) ? 1.0 : sdv_p);
            let _ddv_n = ((ddv_n < _eps) ? 1.0 : ddv_n);

            let _ddv_p = ((ddv_p < _eps) ? 1.0 : ddv_p);
            let _sdv_n = ((sdv_n < _eps) ? 1.0 : sdv_n);

            let vol_dock_res = {
              "s+": op.vol( op.and( dock_lib[dock_idx].src_pos, src_geom ) ) / _sdv_p,
              "d+": op.vol( op.and( dock_lib[dock_idx].dst_pos, op.mov( dock_lib[dock_idx].vdir, dst_geom ) ) ) / _ddv_p,

              "s-": op.vol( op.and( dock_lib[dock_idx].src_neg, op.sub( dock_lib[dock_idx].src_slice, src_geom ) ) ) / _sdv_n,
              "d-": op.vol( op.and( dock_lib[dock_idx].dst_neg, op.sub( dock_lib[dock_idx].dst_slice, op.mov( dock_lib[dock_idx].vdir, dst_geom ) ) ) ) / _ddv_n
            };

            if ((dock_idx == 13) && (debug_counter == 1)) {
              console.log("#!!! dock_idx:", dock_idx, "debug_counter:", debug_counter);
              _simple_print( op.and( dock_lib[dock_idx].src_pos, src_geom ) );
              console.log("\n\n");
              _simple_print(op.and( dock_lib[dock_idx].dst_pos, op.mov( dock_lib[dock_idx].vdir, dst_geom ) ) );
              console.log("\n\n");

              _simple_print( op.and( dock_lib[dock_idx].src_neg, op.sub( dock_lib[dock_idx].src_slice, src_geom ) ) );
              console.log("\n\n");
              _simple_print( op.and( dock_lib[dock_idx].dst_neg, op.sub( dock_lib[dock_idx].dst_slice, op.mov( dock_lib[dock_idx].vdir, dst_geom ) ) ) );
              return;
            }

            /*
            let _nmatch = 0;
            if ((_dock_res["s+"] > 0.95) ||
                ((_dock_res["s+"] < _eps) && (sdv_p < _eps))) { _nmatch++; }
            if ((_dock_res["s-"] > 0.95) ||
                ((_dock_res["s-"] < _eps) && (sdv_n < _eps))) { _nmatch++; }

            if ((_dock_res["d+"] > 0.95) ||
                ((_dock_res["d+"] < _eps) && (ddv_p < _eps))) { _nmatch++; }
            if ((_dock_res["d-"] > 0.95) ||
                ((_dock_res["d-"] < _eps) && (ddv_n < _eps))) { _nmatch++; }
            */

            let pnt_dock_res = {
              "s+": _point_sim( dock_lib[dock_idx].src_pos, op.and( dock_lib[dock_idx].src_slice, src_geom ) ),
              "d+": _point_sim( dock_lib[dock_idx].dst_pos, op.and( dock_lib[dock_idx].dst_slice, op.mov( dock_lib[dock_idx].vdir, dst_geom ) ) ),

              "s-": _point_sim( dock_lib[dock_idx].src_neg, op.and( op.sub( dock_lib[dock_idx].src_slice, src_geom ) ) ),
              "d-": _point_sim( dock_lib[dock_idx].dst_neg, op.and( op.sub( dock_lib[dock_idx].dst_slice, op.mov( dock_lib[dock_idx].vdir, dst_geom ) ) ) )
            };

            let nmatch=0;
            if ((pnt_dock_res["s+"] > 0.95) ||
                ((pnt_dock_res["s+"] < _eps) && (_simple_point_count( dock_lib[dock_idx].src_pos ) == 0))) { nmatch++; }
            if ((pnt_dock_res["s-"] > 0.95) ||
                ((pnt_dock_res["s-"] < _eps) && (_simple_point_count( dock_lib[dock_idx].src_neg ) == 0))) { nmatch++; }

            if ((pnt_dock_res["d+"] > 0.95) ||
                ((pnt_dock_res["d+"] < _eps) && (_simple_point_count( dock_lib[dock_idx].dst_pos ) == 0))) { nmatch++; }
            if ((pnt_dock_res["d-"] > 0.95) ||
                ((pnt_dock_res["d-"] < _eps) && (_simple_point_count( dock_lib[dock_idx].dst_neg ) == 0))) { nmatch++; }

            let vol_match = false;
            if ( (vol_dock_res["s+"] > 0.95) &&
                 (vol_dock_res["d+"] > 0.95) &&
                 (vol_dock_res["s-"] > 0.95) &&
                 (vol_dock_res["d-"] > 0.95) ) { vol_match=true; }

            let pnt_match = false;
            if (nmatch==4) { pnt_match = true; }

            let _xx = ((pnt_match || vol_match) ? "match!!" : "nomatch");

            console.log("###", _xx, "(#match:", nmatch, ")", "(block:", src_block_idx, dst_block_idx, ") >>>", _src.name, _dst.name, dir_descr[idir],
              "(", idir, ")", "dock(idx:", dock_idx, "):",JSON.stringify(pnt_dock_res), JSON.stringify( [ sdv_p, ddv_p, sdv_n, ddv_n ] ), JSON.stringify(vol_dock_res) );

            //console.log("##  dock vdir:", dock_lib[dock_idx].vdir);

            //_simple_print( op.and( dock_lib[dock_idx].dst_slice, op.mov( dock_lib[dock_idx].vdir, dst_geom )  ) );
            //console.log("\n\n");
            //_simple_print( op.and( dock_lib[dock_idx].src_slice, src_geom ) );
            //return;


            continue;

            let dock_src_pos = op.and( dock_lib[dock_idx].src_pos, src_geom );
            //let dock_dst_pos = 

            let dock_a = op.clone( dock_lib[dockidx].src );
            let dock_b = op.mov( idir_v[idir], dock_lib[dockidx].dst );

            let geom_a = op.clone( src_geom );
            let geom_b = op.mov( idir_v[idir], dst_geom );

            let pos_dock_a = op.and( geom_a, src_dock_geom );
            let pos_dock_b = op.and( geom_b, dst_dock_geom );

            let slice_a = dock_lib[dock_idx].src_slice;
            let slice_b = dock_lib[dock_idx].dst_slice;

            let vol_a = op.vol( test_dock_a );
            let vol_b = op.vol( test_dock_b );


            let vol_a_den = op.vol( src_dock_geom );
            let vol_b_den = op.vol( dst_dock_geom );

            if ((vol_a_den < _eps) || (vol_b_den < _eps)) { continue; }

            let p_a_vol = vol_a / vol_a_den;
            let p_b_vol = vol_b / vol_b_den;

            if ((p_a_vol > 0.95) &&
                (p_b_vol > 0.95)) {

              let rdir = oppo_dir[idir];
              console.log( _src.name, "--(", idir, ")-->", _dst.name );
              console.log( _dst.name, "--(", rdir, ")-->", _src.name );

              /*
              console.log("src:", _src.name, "dst:", _dst.name,
                "vol_ab(", vol_a / vol_a_den, vol_b / vol_b_den, ")",
                "pnt_sim_ab(",
                  _point_sim(test_dock_a, src_dock_geom),
                  _point_sim(test_dock_b, dst_dock_geom),
                ")");
                */
            }

          }

        }
      }

    }
  }

}

//            2 (y+)
//            ^
//            |   5 (z-)
//            |  / 
// 1 (x-) ____. /___> 0 (x+)
//           /|
//          / |
//         /  |
//        L   |
//    4 (z+)  3 (y-)

function dock_permutation(sym, dock) {
  let perm_dock = [ dock[0], dock[1], dock[2], dock[3], dock[4], dock[5] ];
  if (sym == 'y') {
    perm_dock[4] = dock[0];
    perm_dock[1] = dock[4];
    perm_dock[5] = dock[1];
    perm_dock[0] = dock[5];
  }

  if (sym == 'x') {
    perm_dock[3] = dock[5];
    perm_dock[4] = dock[3];
    perm_dock[2] = dock[4];
    perm_dock[5] = dock[2];
  }

  if (sym == 'z') {
    perm_dock[0] = dock[2];
    perm_dock[3] = dock[0];
    perm_dock[1] = dock[3];
    perm_dock[2] = dock[1];
  }

  return perm_dock;
}

function _mprint(m) {
  let count = 0;
  for (let ii=0; ii<4; ii++) {

    let t = [];
    for (let jj=0; jj<4; jj++) {
      t.push(m[count]);
      count++;
    }
    console.log("  " + t.join(" "));
  }
}

function blockRotate(cell, rot) {

  let rcell = [0,0,0];

  Mz = m4.zRotation(rot[2]);
  My = m4.yRotation(rot[1]);
  Mx = m4.xRotation(rot[0]);

  var _v = Array.from(m4.mulp( My, cell ));

  /*
  console.log("\n");
  console.log("  ::", rot);
  console.log("  ymul:", JSON.stringify(_v), m4.mulp( My, cell ));
  console.log("  My:", rot[1]);
  _mprint(My);
  */
  //console.log("  rcell:", rcell, "cell:", cell);

  rcell = m4.mulp( Mz, m4.mulp( My, m4.mulp( Mx, cell ) ) );

  //console.log("    cell:", cell, "rcell:", rcell);

  for (let ii=0; ii<rcell.length; ii++) {
    rcell[ii] = Math.round(rcell[ii]);
  }

  //console.log("    ---> rcell:", rcell);

  return Array.from(rcell);
}

function createRepresentative(cfg, geom, info) {

  let name = info.name;
  let dock_block_list = info.dock;
  let d_cell = (("d_cell" in info) ? info.d_cell : [[0,0,0]]);

  let rot_lib = {};

  let sym = [];
  let _syms_ = cfg.symmetry.split(",");
  for (let ii=0; ii<_syms_.length; ii++) {
    sym.push( _syms_[ii].split("") );
  }

  let rep_list = [];

  for (let dock_idx=0; dock_idx<info.dock.length; dock_idx++) {

    let cur_dock = info.dock[dock_idx];

    let irot=[0,0,0];
    let rot_sfx = '';

    do {

      let dock_key = cur_dock.join("");
      if (!(dock_key in rot_lib)) {

        rot_sfx = "_" + irot.join("") + "_" + dock_idx.toString();

        let tile_name = name + rot_sfx;
        let tile_irot = [ irot[0], irot[1], irot[2] ];
        let tile_rad_rot = [ Math.PI*irot[0]/2, Math.PI*irot[1]/2, Math.PI*irot[2]/2 ];

        let tile_geom = op.rotZ( tile_rad_rot[2],
                        op.rotY( tile_rad_rot[1],
                        op.rotX( tile_rad_rot[0], geom ) ) );

        let tile_block = [[0,0,0]];

        for (let cidx=1; cidx<d_cell.length; cidx++) {
          tile_block.push( blockRotate( d_cell[cidx], tile_rad_rot ) );
        }

        rep_list.push({
          "name": tile_name,
          "irot": tile_irot,
          "rot": tile_rad_rot,
          "block" : tile_block,
          "dock": cur_dock,
          "geom": tile_geom
        });

        rot_lib[dock_key] = true;
      }

      cur_dock = dock_permutation(cfg.symmetry, cur_dock);
      _incr_rot_idx(irot, cfg.symmetry);
    } while ((irot[0] != 0) ||
             (irot[1] != 0) ||
             (irot[2] != 0));

  }

  return rep_list;
}

// still some hardcoded values but getting closer to being finished.
//
// stickem...conf file has a character (string) with space seperator
// to denote which other valid tiles it can dock with.
// There are special codes beginning with a dollar sign that represent
// internal neighbors, for geometries that would span multiple unit tiles.
//
// Here y+ is considered 'up'
//
// * Create representatives
//   - rotate each base `.obj` around the axies of symmetry and deduplicate
//   - keep mappings of deduplicated names to representative
//   - special consideration for empty tile '.' (tile id 0)
//     and ground tile '#' (tile id 1)
//   - naming conviention is `<basename>_<rotcode>_<ele>` with
//     ele increasing for geometries that span multiple unit blocks
// * assign ids to represntatives
//   - again, special consideration for empty tile '.' (tile id 0) and
//     ground tile '#' (tile id 1)
// * create rules
//   - hard code empty and ground tile rules, with empty-empty in all directions,
//     ground-ground in all directions, and ground-empty in all directions except
//     ground-empty in the downward direction (empty can't be below ground)
//   - create map from dock token and idir to array of representatives for
//     easy lookup
//   - match up all representatives to each other if they share a docking token
//     in the appropriate direction (src idir to dst, dst rdir to src)
//   - special considering for empty ('.'), 'underneath' ('_'), ground ('#') and
//     pylon (':') docking tokens is taken
//     + empty docking token forces empty tile neighboring (so don't connect
//       representatives that both have a '.' docking token and only allow them
//       to connect to the empty tile)
//     + same with ground docking token ('#')
//     + underneath docking token ('_') forces either an empty or ground
//     + pylon docking token (':') allows empty or ground but still allows other
//       tiles to connect to it
//
// That last one with the pylon can be taken care of by adding a '_' to the pylon docking
// token.
//
//
function _main() {

  var cfg = JSON.parse( fs.readFileSync("./data/stickem_minigolf.conf") );
  let base_dir = "./data/minigolf.obj";

  let stickem_info = {
    "basename": [],
    "repr" : [],

    "repr_idx_map": {},
    "name_repr_map": {},

    "basename_rep_idx" : {}
  };

  let = dock_info = {
    "force_token" : {},
    "pair_token": {},
    "expand_token" : {},
    "simple_token": {}
  };

  for (let dock_tok in cfg.dock) {
    let dock_ele = cfg.dock[dock_tok];

    if (dock_ele.type == '!') {
      dock_info.force_token[dock_tok] = dock_ele.tile;
    }
    else if (dock_ele.type == '%') {
      dock_info.expand_token[dock_tok] = dock_ele.dock;
    }
    else if (dock_ele.type == '@') {
      dock_info.simple_token[dock_tok] = dock_tok;
    }
    else if (dock_ele.type == '&') {
      dock_info.pair_token[dock_tok] = dock_ele.dock;
    }
  }

  for (let idx=0; idx<cfg.source.length; idx++) {
    let src_ele = cfg.source[idx];

    for (let dock_idx=0; dock_idx<src_ele.dock.length; dock_idx++) {
      for (let idir=0; idir<src_ele.dock[dock_idx].length; idir++) {

        for (let expand_tok in dock_info.expand_token) {
          src_ele.dock[dock_idx][idir] = src_ele.dock[dock_idx][idir].replace( expand_tok, dock_info.expand_token[expand_tok]);
        }

      }
    }

  }


  // create representative list, deduplicating identical docking patterns
  // depending on rotation from symmetry
  //
  for (let idx=0; idx<cfg.source.length; idx++) {
    let name = cfg.source[idx].name;
    let geom = obj2geom( base_dir + "/" + name + ".obj" )[0];
    let rl = createRepresentative(cfg, geom, cfg.source[idx]);
    for (let ii=0; ii<rl.length; ii++) {
      stickem_info.repr.push(rl[ii]);
    }
  }

  let tile_name = [];
  tile_name.push("._000_0");
  tile_name.push("#_000_0");

  let tile_name_to_id = {};
  tile_name_to_id['._000_0'] = 0;
  tile_name_to_id['#_000_0'] = 1;

  // assign ids to representatives
  //
  let cur_id = tile_name.length;

  let _rep_list = stickem_info.repr;
  for (let ii=0; ii<_rep_list.length; ii++) {

    tile_name.push( _rep_list[ii].name );
    tile_name_to_id[ _rep_list[ii].name ] = cur_id;
    _rep_list[ii]["id"] = cur_id;
    cur_id++;
  }

  // create rules
  //
  let rule_list = [];
  let rule_map = {};
  let dock_tok_to_id = {};

  // rules for empty-empty, empty-ground and ground-ground connections
  let _empty_tile = 0,
      _ground_tile = 1;
  for (let idir=0; idir<6; idir++) { rule_list.push( [_empty_tile,_empty_tile, idir, 1] ); }
  rule_list.push([_empty_tile, _ground_tile, 0, 1]);
  rule_list.push([_empty_tile, _ground_tile, 1, 1]);
  rule_list.push([_empty_tile, _ground_tile, 4, 1]);
  rule_list.push([_empty_tile, _ground_tile, 5, 1]);
  rule_list.push([_empty_tile, _ground_tile, 3, 1]);

  rule_list.push([_ground_tile, _empty_tile, 0, 1]);
  rule_list.push([_ground_tile, _empty_tile, 1, 1]);
  rule_list.push([_ground_tile, _empty_tile, 4, 1]);
  rule_list.push([_ground_tile, _empty_tile, 5, 1]);
  rule_list.push([_ground_tile, _empty_tile, 2, 1]);

  rule_list.push([_ground_tile, _ground_tile, 0, 1]);
  rule_list.push([_ground_tile, _ground_tile, 1, 1]);
  rule_list.push([_ground_tile, _ground_tile, 2, 1]);
  rule_list.push([_ground_tile, _ground_tile, 3, 1]);
  rule_list.push([_ground_tile, _ground_tile, 4, 1]);
  rule_list.push([_ground_tile, _ground_tile, 5, 1]);


  let opp_idir = [ 1,0, 3,2, 5,4 ];

  let docktok_to_id = [ {}, {}, {}, {}, {}, {} ];

  // build structure for easy lookup
  //
  for (let repr_idx=0; repr_idx<_rep_list.length; repr_idx++) {
    let _repr = _rep_list[repr_idx];
    let _dock = _repr.dock;

    for (let idir=0; idir<_dock.length; idir++) {
      let toks = _dock[idir].split(" ");
      for (let tok_idx=0; tok_idx<toks.length; tok_idx++) {
        let tok = toks[tok_idx];

        if (tok == '.') { continue; }

        if (!(tok in dock_tok_to_id)) { dock_tok_to_id[tok] = [ [], [], [], [], [], [] ]; }

        dock_tok_to_id[tok][idir].push( {"id": _repr.id, "idir": idir } );
      }
    }
  }

  // now use it to build rule list
  //
  for (let repr_idx=0; repr_idx<_rep_list.length; repr_idx++) {

    let _repr = _rep_list[repr_idx];
    let _dock = _repr.dock;

    let src_tile_id = _repr.id;

    for (let idir=0; idir<_dock.length; idir++) {
      let toks = _dock[idir].split(" ");

      let rdir = opp_idir[idir];

      for (let tok_idx=0; tok_idx<toks.length; tok_idx++) {
        let tok = toks[tok_idx];

        // '!' docking token
        //
        if (tok in dock_info.force_token) {
          for (let tile_idx=0; tile_idx<dock_info.force_token[tok].length; tile_idx++) {
            rule_list.push( [_repr.id, dock_info.force_token[tok][tile_idx], idir, 1 ] );
            rule_list.push( [dock_info.force_token[tok][tile_idx], _repr.id, rdir, 1 ] );
          }
          continue;
        }

        // If we've matched an internal link, add the rule and
        // move on.
        //
        let tok_r = tok.match( '^\\$(\\d+)' );
        if (tok_r) {

          let nei_tile_name = _repr.name.split("_").slice(0,-1).join("_") + "_" + tok_r[1];

          let nei_tile_id = tile_name_to_id[ nei_tile_name ];
          rule_list.push( [src_tile_id, nei_tile_id, idir, 1] );
          rule_list.push( [nei_tile_id, src_tile_id, rdir, 1] );

          continue;
        }

        // change destination docking token if it's a pair token
        //
        if (tok in dock_info.pair_token) {
          tok = dock_info.pair_token[tok];
        }


        // Otherwise pair up all other tiles with the same docking token
        // in the relevant direction.
        //
        let nei_list = dock_tok_to_id[tok][rdir];
        for (let nei_idx=0; nei_idx < nei_list.length; nei_idx++) {
          rule_list.push( [src_tile_id, nei_list[nei_idx].id, idir, 1] );
        }

      }
    }

  }

  let idir_name = [ "x+", "x-", "y+", "y-", "z+", "z-" ];

  let poms_data = {
    "rule": [],
    "name": [],
    "weight": [],
    "objMap": [],
    "constraint": [
      {"type":"quiltForce", "range": {"tile":[1,2], "x":[], "y":[0,1], "z":[], "note": "force ground tile on bottom xz plane, y+ up"} },
      {"type":  "quiltPin", "range": {"tile":[1,2], "x":[], "y":[0,1], "z":[], "note": "pin previously forced operation"} }
    ],
    "boundaryCondition":{
      "x+":{"type":"tile","value":0},
      "x-":{"type":"tile","value":0},
      "y+":{"type":"tile","value":0},
      "y-":{"type":"tile","value":0},
      "z+":{"type":"tile","value":0},
      "z-":{"type":"tile","value":0}
    },
    "size": [8,8,8],
    "quiltSize": [8,8,8]
  };


  let out_base_dir = ".minigolf_tile";

  poms_data.rule = rule_list;
  poms_data.name = tile_name;
  for (let ii=0; ii<poms_data.name.length; ii++) {
    poms_data.weight.push(1);
  }

  //----
  // reweight
  //
  poms_data.weight[0] = 600;
  for (let ii=0; ii<poms_data.name.length; ii++) {
    if (poms_data.name[ii].match( 'ramp' )) {
      poms_data.weight[ii] *= 50;
    }
    if (poms_data.name[ii].match( '^(end|hole-round|hole-square)_')) {
      poms_data.weight[ii] *= 1/1000;
    }
  }

  //
  //----

  let empty_obj = out_base_dir + "/" + "._000_0.obj";
  //let empty_mtl = out_base_dir + "/" + "._000_0.mtl";

  for (let ii=0; ii<poms_data.name.length; ii++) {
    poms_data.objMap.push( out_base_dir + "/" + poms_data.name[ii] + ".obj" );

    //console.log(poms_data.name[ii]);

    let tok = poms_data.name[ii].split("_");
    let subtile_id = tok.slice(-1);
    let rotcode = tok.slice(-2).slice(0,1).join("");

    let source_name = tok.slice(0, tok.length-2).join("_") ;

    //console.log(">>>", source_name, rotcode);

    if ((source_name == '.') ||
        (source_name == '#')) { continue; }

    let json_obj = jeom.obj2json( fs.readFileSync(base_dir + "/" + source_name + ".obj") );

    let axis = '';
    let theta = 0;
    let _rc = rotcode.split("");
    if (_rc[2] != '0') {
      theta = -parseFloat(_rc[2])*Math.PI/2.0;
      json_obj = jeom.json_obj_transform(json_obj, [0,0,0], theta, 'z');
    }

    if (_rc[1] != '0') {
      theta = -parseFloat(_rc[1])*Math.PI/2.0;

      json_obj = jeom.json_obj_transform(json_obj, [0,0,0], theta, 'y');
    }

    if (_rc[0] != '0') {
      theta = -parseFloat(_rc[0])*Math.PI/2.0;
      json_obj = jeom.json_obj_transform(json_obj, [0,0,0], theta, 'x');
    }

    let sfx = poms_data.name[ii].split("_").slice(-1).join("");
    if (sfx == "0") {
      fs.writeFileSync( out_base_dir + "/" + poms_data.name[ii] + ".obj", jeom.json2obj(json_obj) );
      fs.writeFileSync( out_base_dir + "/" + poms_data.name[ii] + ".mtl", fs.readFileSync( base_dir + "/" + source_name + ".mtl" ));
    }
    else {
      fs.writeFileSync( out_base_dir + "/" + poms_data.name[ii] + ".obj", "" );
      fs.writeFileSync( out_base_dir + "/" + poms_data.name[ii] + ".mtl", "" );
    }

  }

  console.log(JSON.stringify(poms_data, undefined, 2));

}

_main();


