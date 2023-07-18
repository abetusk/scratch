//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//


var fs = require("fs");

var mcut = require("./mcut.js");
var jeom = require("./jeom.js");

function _cpy_d(dst_view, src_a) {
  let dst = mcut.HEAPF64.subarray( dst_view>>3, (dst_view>>3) + src_a.length );
  for (let i=0; i<src_a.length; i++) { dst[i] = src_a[i]; }
}

function _cpy_i(dst_view, src_a) {
  let dst = mcut.HEAPU32.subarray( dst_view>>2, (dst_view>>2) + src_a.length );
  for (let i=0; i<src_a.length; i++) { dst[i] = src_a[i]; }
}


function mcut_bop(tf0, tf1, op) {
  op = ((typeof op === "undefined") ? 2 : op);
  let sz_double = 8;
  let sz_int = 4;

  let v0_ptr = mcut._malloc( tf0.v.length*sz_double );
  let f0_ptr = mcut._malloc( tf0.f.length*sz_int );

  let v1_ptr = mcut._malloc( tf1.v.length*sz_double );
  let f1_ptr = mcut._malloc( tf1.f.length*sz_int );

  let print_tri = false;

  _cpy_d(v0_ptr, tf0.v);
  _cpy_d(v1_ptr, tf1.v);

  _cpy_i(f0_ptr, tf0.f);
  _cpy_i(f1_ptr, tf1.f);

  let ret =
    mcut.ccall("mcutop",
      "number",
      ["number", "number", "number", "number",
       "number", "number", "number", "number",
        "number"],
      [ v0_ptr, tf0.v.length/3, f0_ptr, tf0.f.length/3,
        v1_ptr, tf1.v.length/3, f1_ptr, tf1.f.length/3,
        op ]);

  let n_comp = mcut.mcut_n();

  //if (n_comp !=  1) { console.log("###!!!!", n_comp); }

  let res_vf = { "v":[], "f": [] };

  for (let c=0; c<n_comp; c++) {
    let _v = mcut.mcut_v(c);
    let _f = mcut.mcut_f(c);

    for (let i=0; i<_v.length; i++) { res_vf.v.push( _v[i] ); }
    for (let i=0; i<_f.length; i++) { res_vf.f.push( _f[i] ); }

    if (print_tri) {
      console.log("#", _v.length, _f.length);
      for (let i=0; i<_f.length; i+=3) {
        let v0 = 3*_f[i+0];
        let v1 = 3*_f[i+1];
        let v2 = 3*_f[i+2];
        console.log( _v[v0+0], _v[v0+1], _v[v0+2] );
        console.log( _v[v1+0], _v[v1+1], _v[v1+2] );
        console.log( _v[v2+0], _v[v2+1], _v[v2+2] );
        console.log("\n");
      }
    }


  }

  mcut._free(v0_ptr);
  mcut._free(f0_ptr);
  mcut._free(v1_ptr);
  mcut._free(f1_ptr);

  return res_vf;
}

function _romcol() {
  let base_r = 0.5;
  let base_c = 2.0*Math.PI*base_r;
  let sub_r = 0.125;
  let _otr = 0.6;

  //let pill_r = 0.2255;
  let pill_r = 0.226;
  let pill_h = 0.855;

  let slice = 32;
  //let slice = 128;

  //let pl = jeom.stitch(jeom.pillar({"r":base_r, "slice":64 }));
  let pl = jeom.stitch(jeom.pillar({"r":base_r, "slice":slice }));

  //let _fp = fs.openSync("./data/base.off", "w");
  //jeom.off_print(_fp, pl.v, pl.f);
  //fs.close(fp);

  let _fp = fs.createWriteStream("./data/base.off");
  jeom.off_print(_fp, pl.v, pl.f);
  _fp.close();


  let n = 26;
  for (let i=0; i<n; i++) {
    let dx = _otr*Math.cos(2.0*Math.PI*i/n);
    let dy = _otr*Math.sin(2.0*Math.PI*i/n);

    //if ((i%3)==0) { continue; }

    //let ps = jeom.pillar({"r":0.125, "slice":32});
    //let ps = jeom.pillar({"r":0.125, "slice":slice});

    //let pp = _pill(0.1, 0.1, 0.9);
    let pp = _pill(pill_r, pill_r, pill_h, slice);

    //console.log("??", pp.v.length, pp.f.length);

    jeom.mov(pp.v, [dx,dy,0]);
    //pp = jeom.stitch(pp.v);


    let __fp = fs.createWriteStream("./data/pill" + i + ".off");
    jeom.off_print(__fp, pp.v, pp.f);
    __fp.close();

    /*
    jeom.scale(ps, [1,1,0.95]);
    jeom.mov(ps, [dx,dy,0]);
    ps = jeom.stitch(ps);
    pl = mcut_bop(pl, ps, 0);
    */
    pl = mcut_bop(pl, pp, 0);
  }

  jeom.off_print(process.stdout, pl.v, pl.f);

  //jeom.stl_print(process.stdout, pl.v);

  //DEBUG
  //console.log(pl.v, pl.f);

}

function _pill(x,y,z, slice) {
  let base_r = 0.5;
  let base_c = 2.0*Math.PI*base_r;

  //let slice = 32;
  slice = ((typeof slice === "undefined") ? 32 : slice);

  let s_r = 0.125;
  s_r = 0.25;
  s_r = 0.2;

  let pl = jeom.pillar({"r":base_r, "slice":slice});
  //jeom.scale(pl, [1,1, 0.5]);
  jeom.scale(pl, [1,1, 1-s_r]);
  pl = jeom.stitch(pl);

  let us0 = jeom.sphere({"r":s_r, "slice": slice, "slice_v": slice/2});
  jeom.scale(us0, [1/(2*s_r), 1/(2*s_r), 1.0]);
  jeom.mov(us0, [0,0,0.5 - s_r/2])
  us0 = jeom.stitch(us0);

  let us1 = jeom.sphere({"r":s_r, "slice": slice, "slice_v": slice/2});
  jeom.scale(us1, [1/(2*s_r), 1/(2*s_r), 1.0]);
  jeom.mov(us1, [0,0,-0.5 + s_r/2])
  us1 = jeom.stitch(us1);

  //console.log("pl:", pl.v.length, pl.f.length, "us0:", us0.v.length, us0.f.length, "us1:", us1.v.length, us1.f.length);

  let ok = mcut_bop(pl, us0, 2);

  //console.log("  pl+us0:", ok.v.length, ok.f.length);

  ok = mcut_bop(ok, us1, 2);

  //console.log("  xx+us1:", ok.v.length, ok.f.length);

  //jeom.scale(ok.v, [0.5,0.5,0.9]);
  jeom.scale(ok.v, [x,y,z]);

  //jeom.off_print(process.stdout, ok.v, ok.f);
  return ok;
}

function _column() {
  let base_r = 0.5;
  let base_c = 2.0*Math.PI*base_r;

  let sub_r = 0.125;

  let pl = jeom.stitch(jeom.pillar({"r":base_r, "slice":64 }));

  let _otr = 0.61;

  let n = 26;
  for (let i=0; i<n; i++) {
    let dx = _otr*Math.cos(2.0*Math.PI*i/n);
    let dy = _otr*Math.sin(2.0*Math.PI*i/n);


    let ps = jeom.pillar({"r":0.125, "slice":32});
    //jeom.scale(ps, [1,1,1.125]);
    jeom.scale(ps, [1,1,0.95]);
    jeom.mov(ps, [dx,dy,0]);
    ps = jeom.stitch(ps);

    pl = mcut_bop(pl, ps, 0);
  }

  jeom.off_print(process.stdout, pl.v, pl.f);
}

function _main() {
  //_pill();
  _romcol();
}

function _wait_lib_load() {
  if (!mcut.calledRun) {
    setTimeout(_wait_lib_load, 1);
    return;
  }
  _main();
}

_wait_lib_load();

