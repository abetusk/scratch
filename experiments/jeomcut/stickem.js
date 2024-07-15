// LICENSE: CC0
//

var fs = require("fs");
var jscad = require("@jscad/modeling");
var objectDeserializer = require('@jscad/obj-deserializer')
var stlSerializer = require('@jscad/stl-serializer')
var array_utils = require('@jscad/array-utils')

var op = {

  "objload": objectDeserializer.deserialize,

  "stldumps": stlSerializer.serialize,

  "flatten": array_utils.flatten,

  "clone": jscad.geometries.geom3.clone,
  "points": jscad.geometries.geom3.toPoints,
  "polygons": jscad.geometries.geom3.toPolygons,
  "validate": jscad.geometries.geom3.validate,

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

function _simple_print(geom) {

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

function slice_idir(cfg, idir, _center) {
  _center = ((typeof _center === "undefined") ? [0,0,0] : _center);

  let dx = cfg.unit[0],
      dy = cfg.unit[1],
      dz = cfg.unit[2];
  let s = cfg.dock_slice;
  let _eps = cfg.eps;
  
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
    return op.cuboid({"size": [ dx, dz, s], "center": _center });
  }

  return null;
}

var UNIT = {
  "size": [1,1/6,1],
  "center": [0,1/12,0]
};

let vox_info = {
  "size": [5,11,5],
  "center": [0,1/12,0],
  "ds": [
    [1,0,0],
    [0,1/2,1],
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

// representative creation
//
function create_rep(cfg, geom, base_name) {

  let base = op.clone(geom);

  let rep_info = [];

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

    let found = false;
    for (let rep_idx=0; rep_idx<rep_info.length; rep_idx++) {
      if (_point_sim( rep_info[rep_idx].geom, tgeom ) > cfg.point_similarity_threshold) {
        found = true;
        break;
      }
    }

    if (!found) {

      rep_info.push({
        "name": base_name + "_" + rot_v.join(""),
        "irot": [ rot_v[0], rot_v[1], rot_v[2] ],
        "rot": [ rot_v[0]*Math.PI/2, rot_v[1]*Math.PI/2, rot_v[2]*Math.PI/2 ],
        "geom": tgeom
      });

    }

    _incr_rot_idx(rot_v, cfg.symmetry);

  } while( (rot_v[0] != 0) || (rot_v[1] != 0) || (rot_v[2] != 0) );

  return rep_info;
}

function _main() {

  var cfg = JSON.parse( fs.readFileSync("./data/stickem_minigolf.conf") );
  let base_dir = "./data/minigolf.obj";

  let stickem_info = {
    "basename": [],
    "rep" : [],
    "basename_rep_idx" : {
    }
  };

  for (let idx=0; idx<cfg.source.length; idx++) {
    let name = cfg.source[idx];

    let geom = obj2geom( base_dir + "/" + name + ".obj" )[0];
    let geom_rep = create_rep(cfg, geom, name);

    stickem_info.basename.push( name );
    stickem_info.basename_rep_idx[name] = [];

    for (let ii=0; ii<geom_rep.length; ii++) {
      stickem_info.basename_rep_idx[name].push( stickem_info.rep.length );
      stickem_info.rep.push( geom_rep[ii] );
    }

    //console.log(name, geom, geom_rep);
    //console.log(name, geom_rep);
  }

  //console.log(stickem_info);

  let rdir = [ 1,0, 3,2, 5,4 ];

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

  for (let exemplar_idx=0; exemplar_idx<cfg.dock_exemplar.length; exemplar_idx++) {

    let src_basename = cfg.dock_exemplar[exemplar_idx][0];
    let dst_basename = cfg.dock_exemplar[exemplar_idx][1];
    let idir = cfg.dock_exemplar[exemplar_idx][2];

    for (let ii=0; ii<stickem_info.basename_rep_idx[src_basename].length; ii++) {
      let rep_idx = stickem_info.basename_rep_idx[src_basename][ii];

      //console.log(src_basename, dst_basename, idir, rep_idx);

      let _c_a = [ cfg.unit_center[0], cfg.unit_center[1], cfg.unit_center[2] ];
      let _c_b = [ cfg.unit_center[0], cfg.unit_center[1], cfg.unit_center[2] ];

      _c_b[0] += idir_v[idir][0];
      _c_b[1] += idir_v[idir][1];
      _c_b[2] += idir_v[idir][2];

      let a = slice_idir(cfg, idir, _c_a);
      let b = slice_idir(cfg, rdir[idir], _c_b);

      _simple_print(a);
      console.log("\n\n");
      _simple_print(b);

      //console.log(a,b);



    }

    break;
  }

}

_main();


