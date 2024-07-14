// LICENSE: CC0
//

var fs = require("fs");
var jscad = require("@jscad/modeling");
var objectDeserializer = require('@jscad/obj-deserializer')

var op = {

  "objload": objectDeserializer.deserialize,

  "clone": jscad.geometries.geom3.clone,

  "add" : jscad.booleans.union,
  "sub" : jscad.booleans.subtract,
  "and" : jscad.booleans.intersect,

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

// representative creation
//
function create_rep(cfg, geom, base_name) {

  let base = op.clone(geom);

  let rep_info = [
    { "name": base_name + "_000", "irot": [0,0,0], "rot":[0,0,0], "geom": base }
  ];

  let rot_v = [0,0,0];

  let vol_thresh = 1.0 - cfg.eps;

  do {

    // TODO: make sure to cycle through integer index rotations based on symmetry
    // in cfg (currently only 'y', so incrementing only y index component)
    //
    rot_v[1]++;
    rot_v[1] %= 4;

    let tgeom = op.clone(base);

    if (rot_v[0] > 0) { tgeom = op.rotX( rot_v[0]*Math.PI/2, tgeom ); }
    if (rot_v[1] > 0) { tgeom = op.rotY( rot_v[1]*Math.PI/2, tgeom ); }
    if (rot_v[2] > 0) { tgeom = op.rotZ( rot_v[2]*Math.PI/2, tgeom ); }

    let found = false;
    for (let rep_idx=0; rep_idx<rep_info.length; rep_idx++) {

      let rep_vol = op.vol(rep_info[rep_idx].geom);
      let and_vol = op.vol( op.and(tgeom, rep_info[rep_idx].geom) );

      let p_vol = and_vol / rep_vol;

      if (p_vol > vol_thresh) { found = true; break; }
    }


    if (!found) {

      rep_info.push({
        "name": base_name + "_" + rot_v.join(""),
        "irot": [ rot_v[0], rot_v[1], rot_v[2] ],
        "rot": [ rot_v[0]*Math.PI/2, rot_v[1]*Math.PI/2, rot_v[2]*Math.PI/2 ],
        "geom": tgeom
      });

    }

  } while( (rot_v[0] != 0) || (rot_v[1] != 0) || (rot_v[2] != 0) );

  return rep_info;
}

function _main() {

  var cfg = JSON.parse( fs.readFileSync("./data/stickem_minigolf.conf") );

  let gap = obj2geom("./data/minigolf.obj/gap.obj")[0];
  let gap_rep = create_rep(cfg, gap, "gap");

  let ramp = obj2geom("./data/minigolf.obj/ramp.obj")[0];
  let ramp_rep = create_rep(cfg, ramp, "ramp");

  console.log(gap_rep);
  console.log(ramp_rep);


  return;

  var src_obj_list = fs.readFileSync("./data/source.list").toString().split("\n");
  for (let ii=0; ii<src_obj_list.length; ii++) {
    let fn = src_obj_list[ii].trim();
    if (fn.length == 0) { continue; }
    console.log(fn);
  }

}

_main();


