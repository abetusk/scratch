//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//

var numeric = require("./numeric.js");
var jeom = require("./jeom.js");

let JEOMOP_VERSION = "0.2.0";

var getopt = require("posix-getopt");

function show_version(fp) {
  fp.write("version: " + JEOMOP_VERSION + "\n");
}

let shape_choice = [
  "cube",
  "pillar",
  "sphere",
  "cross",
  "road",
  "stair",
  "bend",
  "tee",
  "torus"

];

function show_help(fp) {
  show_version(fp);
  fp.write("\n");
  fp.write("usage:\n");
  fp.write("\n");
  fp.write("    jeomop [-h] [-v] [options]\n");
  fp.write("\n");
  fp.write("  [-s shape]      shape (" + shape_choice.join(",") + ")\n");
  fp.write("  [-X a]          rotate around x axis by angle a (radians)\n");
  fp.write("  [-Y a]          rotate around y axis by angle a (radians)\n");
  fp.write("  [-Z a]          rotate around z axis by angle a (radians)\n");
  fp.write("  [-x dx]         translate by x\n");
  fp.write("  [-y dy]         translate by y\n");
  fp.write("  [-z dz]         translate by z\n");
  fp.write("  [-S s]          scale by s\n");
  fp.write("  [-o fn]         output file (default stdout)\n");
  fp.write("  [-O fmt]        output format (obj,stl,gnuplot,off)\n");
  fp.write("  [-D]            stitch flag\n");
  fp.write("  [-v]            show version\n");
  fp.write("  [-h]            show help (this screen)\n");
  fp.write("\n");
  fp.write("\n");
}

let jeom_opt = {
  "ofp": process.stdout,
  "outfmt": "gnuplot",
  "outfn": "-",
  "stitch": false,
  "shape": "",
  "scale": 1.0,
  "dx": 0.0,
  "dy": 0.0,
  "dz": 0.0,
  "rx": 0.0,
  "ry": 0.0,
  "rz": 0.0
};

let long_opt = [
  "X", ":(rx)",
  "Y", ":(ry)",
  "Z", ":(rz)",
  "x", ":(dx)",
  "y", ":(dy)",
  "z", ":(dz)",
  "s", ":(shape)",
  "S", ":(scale)",
  "o", ":(output)",
  "O", ":(output-format)"
];


let parser = new getopt.BasicParser("vhD" + long_opt.join(""), process.argv);

if (parser.optind() == process.argv.length) {
  show_help(process.stderr);
  process.exit(-1);
}

while ((opt = parser.getopt()) !== undefined) {
  switch(opt.option) {
    case 'v':
      show_version(process.stdout);
      process.exit(0);
      break;
    case 'h':
      show_help(process.stdout);
      process.exit(0);
      break;

    case 's':
      jeom_opt.shape = opt.optarg;
      break;

    case 'D':
      jeom_opt.stitch = true;
      break;

    case 'x':
      jeom_opt.dx = parseFloat(opt.optarg);
      break;
    case 'y':
      jeom_opt.dy = parseFloat(opt.optarg);
      break;
    case 'z':
      jeom_opt.dz = parseFloat(opt.optarg);
      break;

    case 'X':
      jeom_opt.rx = parseFloat(opt.optarg);
      break;
    case 'Y':
      jeom_opt.ry = parseFloat(opt.optarg);
      break;
    case 'Z':
      jeom_opt.rz = parseFloat(opt.optarg);
      break;

    case 'S':
      jeom_opt.scale = parseFloat(opt.optarg);
      break;

    case 'o':
      jeom_opt.outfn = opt.optarg;
      if (jeom_opt.outfn == "-") { jeom_opt.ofp = process.stdout; }
      break;
    case 'O':
      jeom_opt.outfmt = opt.optarg;
      break;

    default:
      show_help(process.stderr);
      process.exit(-1);
      break;
  }
}

//-----------
//-----------

function _main(_opt) {

  let _geom = [];

  if      (_opt.shape == "cube") {
    _geom = jeom.cube();
  }
  else if (_opt.shape == "pillar") {
    _geom = jeom.pillar();
  }
  else if (_opt.shape == "sphere") {
    _geom = jeom.sphere();
  }
  else if (_opt.shape == "cross") {
    _geom = jeom.cross();
  }
  else if (_opt.shape == "road") {
    _geom = jeom.road();
  }
  else if (_opt.shape == "stair") {
    _geom = jeom.stair();
  }
  else if (_opt.shape == "bend") {
    _geom = jeom.bend();
  }
  else if (_opt.shape == "tee") {
    _geom = jeom.tee();
  }
  else if (_opt.shape == "torus") {
    _geom = jeom.torus();
  }


  jeom.scale(_geom, [ _opt.scale, _opt.scale, _opt.scale ] );
  jeom.mov(_geom, [ _opt.dx, _opt.dy, _opt.dz ] );

  jeom.rotx(_geom, _opt.rx);
  jeom.roty(_geom, _opt.ry);
  jeom.rotz(_geom, _opt.rz);

  if      (_opt.outfmt == "stl") { jeom.stl_print(_opt.ofp, _geom); }
  else if (_opt.outfmt == "off") {
    if (_opt.stitch) {

      let vf = jeom.stitch(_geom);
      jeom.off_print(_opt.ofp, vf.v, vf.f);

    }
    else {
      jeom.off_print(_opt.ofp, _geom);
    }
  }
  else if (_opt.outfmt == "obj") { jeom.obj_print(_opt.ofp, _geom); }
  else if (_opt.outfmt == "gnuplot") { jeom.gnuplot_print(_opt.ofp, _geom); }
  else {
    jeom.gnuplot_print(_opt.ofp, _geom);
  }

}

function _debug() {
  let _n = 16, _r = 0.25;
  let _test_pgn = [];
  for (let ii=0; ii<_n; ii++) {
    let theta = 2.0*Math.PI*ii/_n;
    let f = Math.random()/4 + 0.8;
    _test_pgn.push({ "X": f*Math.cos(theta)*_r, "Y": -f*Math.sin(theta)*_r });
  }
  //_test_pgn.push({"X": 0, "Y":0.0});

  //for (let ii=0; ii<_test_pgn.length; ii++) {
  //  console.log(_test_pgn[ii].X, _test_pgn[ii].Y);
  //}

  let _debug_tri = jeom_extrude(_test_pgn);
  jeom_stl_print(_debug_tri);

}

_main(jeom_opt);
//_debug();
