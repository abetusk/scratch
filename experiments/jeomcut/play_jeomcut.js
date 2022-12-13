//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//


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


function _pill() {
  let base_r = 0.5;
  let base_c = 2.0*Math.PI*base_r;

  let pl = jeom.stitch(jeom.pillar({"r":base_r, "slice":64 }));

  let s_r = 0.125;

  let us = jeom.sphere({"r":s_r, "slice": 64, "slice_v": 64});
  //jeom.scale(us, [1/(2*s_r), 1/(2*s_r), 1.0]);
  jeom.mov(us, [0,0,0.5])
  us = jeom.stitch(us);

  //console.log(us);

  //jeom.off_print(process.stdout, us.v, us.f);
  //return;

  //jeom.off_print(process.stdout, pl.v, pl.f);
  //return;


  let ok = mcut_bop(pl, us, 0);
  jeom.off_print(process.stdout, ok.v, ok.f);
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

    //ps = jeom.stitch(ps);
  //jeom.off_print(process.stdout, ps.v, ps.f);
  //return;

    pl = mcut_bop(pl, ps, 0);
  }


  jeom.off_print(process.stdout, pl.v, pl.f);

}

function _main() {

  _pill();

}

function _wait_lib_load() {
  if (!mcut.calledRun) {
    setTimeout(_wait_lib_load, 1);
    return;
  }

  _main();
}
_wait_lib_load();

