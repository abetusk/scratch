// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//

// point highlight (list of points -> sphere/shape)
// obj transform
// obj merge

var fs = require("fs");
var getopt = require("posix-getopt");
var jeom = require("./jeom.js");

var OSAJUST_VERSION = "0.2.0";

var parser, opt;

function main_nop() {
}

var g_ctx = {
  // point-highlight
  // transform
  // merge
  //
  "op" : "nop",
  "theta": 0,
  "tv": [0,0,0],
  "s": 1.0,
  "data_a": {},
  "data_b": {},
  "." : {},

  "opt": {
    "op": "obj",
    "fn":"",
    "merge_fn":"",
    "axis": "",
    "r": 1/8,
    "shape": "sphere",
    "rot": 0,
    "com": [0,0,0],
    "mov": [0,0,0]
  },

  "op_list": [
    [ "obj", main_transform ],
    [ "json", main_json ],
    [ "obj-st", main_obj_simple_transform ],
    [ "transform", main_transform ],
    [ "highlight", main_highlight ],
    [ "occupancy", main_block_occupancy],
    [ "gnuplot", main_gnuplot ],
    [ "bound", main_bound ],
    [ "create", main_nop ]
  ],

  "verbose": 0
};


parser = new getopt.BasicParser("hvVR:(rotate)T:(translate)m:(merge)A:(op)c:(com)r:(radius)S:(shape)", process.argv);


function show_help() {
  console.log("\nusage:");
  console.log("");
  console.log("  osajust [-h] [-v] [-V] [-R axis,angle] [-T x,y,z] [-m merge_fn] [-c x,y,z] [-r r] [-A op] [-S shape] fn");
  console.log("");
  console.log("  op list:");
  for (let ii=0; ii<g_ctx.op_list.length; ii++) {
    console.log("    ", g_ctx.op_list[ii][0]);
  }
  console.log("\n\n");
}

function show_version(preamble) {
  preamble = ((typeof preamble === "undefined") ? false : preamble);
  let pfx = (preamble ? "version: " : "" );
  console.log(pfx + OSAJUST_VERSION);
}

let tok = [];

while ((opt = parser.getopt()) !== undefined) {
  switch (opt.option) {

    case 'h':
      show_version(true);
      show_help();
      process.exit(0);
      break;
    case 'v':
      g_ctx.verbose++;
      break;
    case 'V':
      show_version();
      process.exit(0);
      break;

    case 'A':
      g_ctx.opt.op = opt.optarg;
      break;

    case 'R':
      tok = opt.optarg.split(",");
      if (tok.length < 2) {
        console.log("provide axis and rotation amount");
        show_help();
        process.exit(-1);
      }
      g_ctx.opt.axis = tok[0];

      if      (tok[1] == "pi")    { g_ctx.opt.rot = Math.PI; }
      else if (tok[1] == "-pi")   { g_ctx.opt.rot = Math.PI; }
      else if (tok[1] == "pi/2")  { g_ctx.opt.rot = Math.PI/2; }
      else if (tok[1] == "-pi/2") { g_ctx.opt.rot = -Math.PI/2; }
      else { g_ctx.opt.rot = parseFloat(tok[1]); }
      break;

    case 'T':
      tok = opt.optarg.split(",");
      if (tok.length != 3) {
        console.log("provide x,y,z translate coords");
        show_help();
        process.exit(-1);
      }
      g_ctx.opt.mov[0] = parseFloat(tok[0]);
      g_ctx.opt.mov[1] = parseFloat(tok[1]);
      g_ctx.opt.mov[2] = parseFloat(tok[2]);
      break;

    case 'c':
      tok = opt.optarg.split(",");
      if (tok.length != 3) {
        console.log("provide x,y,z center of mass coords");
        show_help();
        process.exit(-1);
      }
      g_ctx.opt.com[0] = parseFloat(tok[0]);
      g_ctx.opt.com[1] = parseFloat(tok[1]);
      g_ctx.opt.com[2] = parseFloat(tok[2]);
      break;

    case 'r':
      g_ctx.opt.r = parseFloat(opt.optarg);
      break;
    case 'S':
      g_ctx.opt.shape = opt.optarg;
      break;

    case 'm':
      g_ctx.opt.merge_fn = opt.optarg;
      break;

    default:
      console.log("nope");
      show_help();
      process.exit();
      break;
  }
}

if (parser.optind() >= process.argv.length) {
  console.log("provide input obj file");
  show_help();
  process.exit();
}

g_ctx.opt.fn = process.argv[ parser.optind() ];


function load_obj(fn) {
  let sdat = fs.readFileSync(fn);
  let _obj = jeom.obj_split_loads(sdat.toString());
  let flat_obj = jeom.obj2flat(_obj);
  let tri = jeom.obj2tri(_obj);

  let dat = { 
    "orig_obj": _obj,
    "obj": flat_obj,
    "tri": tri
  }

  return dat;
}

function merge_tri(tri_a, tri_b) {
  let tri = [];
  for (let i=0; i<tri_a.length; i++) { tri.push(tri_a[i]); }
  for (let i=0; i<tri_b.length; i++) { tri.push(tri_b[i]); }
  return tri;
}


// display point bounds
//
function main_bound() {
  g_ctx.data_a = load_obj( g_ctx.opt.fn );

  let out_tri = jeom.dup( g_ctx.data_a.tri );

  g_ctx.theta = g_ctx.opt.rot;
  g_ctx.tv[0] = g_ctx.opt.mov[0];
  g_ctx.tv[1] = g_ctx.opt.mov[1];
  g_ctx.tv[2] = g_ctx.opt.mov[2];

  if (g_ctx.opt.axis.length > 0) {
    if (g_ctx.opt.axis == 'x') { jeom.rotx(out_tri, g_ctx.theta); }
    if (g_ctx.opt.axis == 'y') { jeom.roty(out_tri, g_ctx.theta); }
    if (g_ctx.opt.axis == 'z') { jeom.rotz(out_tri, g_ctx.theta); }
  }

  jeom.mov(out_tri, g_ctx.tv);

  let bb = jeom.bounding_box( out_tri );
  console.log(bb);

}

// display block occupancy
//
function main_block_occupancy() {
  g_ctx.data_a = load_obj( g_ctx.opt.fn );

  let out_tri = jeom.dup( g_ctx.data_a.tri );

  g_ctx.theta = g_ctx.opt.rot;
  g_ctx.tv[0] = g_ctx.opt.mov[0];
  g_ctx.tv[1] = g_ctx.opt.mov[1];
  g_ctx.tv[2] = g_ctx.opt.mov[2];

  if (g_ctx.opt.axis.length > 0) {
    if (g_ctx.opt.axis == 'x') { jeom.rotx(out_tri, g_ctx.theta); }
    if (g_ctx.opt.axis == 'y') { jeom.roty(out_tri, g_ctx.theta); }
    if (g_ctx.opt.axis == 'z') { jeom.rotz(out_tri, g_ctx.theta); }
  }

  jeom.mov(out_tri, g_ctx.tv);

  let b = jeom.occupancy_block_map(out_tri, [0.5,0,0], 1/64);

  for (let key in b) {
    let pnt = key.split(":").map( parseFloat );
    console.log(pnt[0] + g_ctx.opt.com[0], pnt[1] + g_ctx.opt.com[1], pnt[2] + g_ctx.opt.com[2]);
  }
  //console.log(b);
}

function main_gnuplot() {
  g_ctx.data_a = load_obj( g_ctx.opt.fn );

  let out_tri = jeom.dup( g_ctx.data_a.tri );

  jeom.gnuplot_print( process.stdout, out_tri );
}

// rotations happen before translation
//
function main_transform() {
  g_ctx.data_a = load_obj( g_ctx.opt.fn );
  if (g_ctx.opt.merge_fn.length > 0) {
    g_ctx.data_b = load_obj( g_ctx.opt.merge_fn );
  }

  let out_tri = jeom.dup( g_ctx.data_a.tri );

  g_ctx.theta = g_ctx.opt.rot;
  g_ctx.tv[0] = g_ctx.opt.mov[0];
  g_ctx.tv[1] = g_ctx.opt.mov[1];
  g_ctx.tv[2] = g_ctx.opt.mov[2];

  if (g_ctx.opt.axis.length > 0) {
    if (g_ctx.opt.axis == 'x') { jeom.rotx(out_tri, g_ctx.theta); }
    if (g_ctx.opt.axis == 'y') { jeom.roty(out_tri, g_ctx.theta); }
    if (g_ctx.opt.axis == 'z') { jeom.rotz(out_tri, g_ctx.theta); }
  }

  jeom.mov(out_tri, g_ctx.tv);

  if (g_ctx.opt.merge_fn.length > 0) {
    out_tri = merge_tri( out_tri, g_ctx.data_b.tri );
  }

  console.log( jeom.stl_stringify(out_tri) );

}


// put an object at each of the points (sphere).
//
function main_highlight() {
  let _tri_list = [];

  let _all = {};

  let lines = fs.readFileSync( g_ctx.opt.fn ).toString().split("\n");

  for (let ii=0; ii<lines.length; ii++) {
    let _l = lines[ii].trim();
    if (_l.length == 0) { continue; }
    if (_l[0] == '#') { continue; }
    let tok = _l.split(" ");

    let xyz = [ parseFloat(tok[0]), parseFloat(tok[1]), parseFloat(tok[2]) ];

    let _tri = [];

    if (g_ctx.opt.shape == "sphere") {
      _tri = jeom.sphere({ "r": g_ctx.opt.r });
    }
    else {
      _tri = jeom.cube({ "dx": 2*g_ctx.opt.r, "dy": 2*g_ctx.opt.r, "dz": 2*g_ctx.opt.r });
    }
    jeom.mov( _tri, xyz );

    _tri_list.push( _tri );

    if (ii==0) { _all = _tri; }
    else {
      _all = merge_tri( _all, _tri );
    }

  }

  console.log( jeom.stl_stringify(_all) );
}

function main_json() {
  let raw_s = fs.readFileSync( g_ctx.opt.fn ).toString();
  let json_obj = jeom.obj2json( raw_s );

  console.log( JSON.stringify(json_obj, undefined, 2) );
}

function main_obj_simple_transform() {
  let raw_s = fs.readFileSync( g_ctx.opt.fn ).toString();
  let json_obj = jeom.obj2json( raw_s );

  let theta = g_ctx.opt.rot;
  let tv = [
    g_ctx.opt.mov[0],
    g_ctx.opt.mov[1],
    g_ctx.opt.mov[2]
  ];

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

    //console.log(g_ctx.opt.axis, theta, tv);
    //console.log("bef:", _tri);

    if (g_ctx.opt.axis.length > 0) {
      if (g_ctx.opt.axis == 'x') { jeom.rotx(_tri, theta); }
      if (g_ctx.opt.axis == 'y') { jeom.roty(_tri, theta); }
      if (g_ctx.opt.axis == 'z') { jeom.rotz(_tri, theta); }
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

    //console.log("aft:", _tri);
    //console.log("");


  }

  console.log( jeom.json2obj( json_obj ) );
}

for (let ii=0; ii<g_ctx.op_list.length; ii++) {
  if (g_ctx.opt.op == g_ctx.op_list[ii][0]) {
    g_ctx.op_list[ii][1]();
  }
}
