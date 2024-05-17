
//WIP!!!

var jscad = require("@jscad/modeling");
var stlser = require("@jscad/stl-serializer");


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

function jscad_f() {
  let f = {
    "sub":jscad.booleans.subtract,
    "and":jscad.booleans.intersect,
    "add":jscad.booleans.union,
    "mov":jscad.transforms.translate,
    "rot":jscad.transforms.rotate,
    "lif":jscad.extrusions.extrudeLinear,
    "cub":jscad.primitives.cuboid,
    "cir":jscad.primitives.circle
  }

  return f;
}

function wedge_u() {
  let f = jscad_f();

  let geom = f.sub(
    f.cub({"size":[1,1,1], "center":[0.5, 0.5, 0.5]}),
    f.rot([Math.PI/4,0,0], f.cub({"size":[2,2,2], "center":[0,1,-1]}))
  );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"w", "nei":["w,.","w,.", ".", "b", "b","."]}
  ];
}

function wedge_d() {
  let f = jscad_f();

  let geom = f.sub(
    f.cub({"size":[1,1,1], "center":[0.5, 0.5, 0.5]}),
    f.rot([Math.PI/4,0,0], f.cub({"size":[2,2,2], "center":[0,1,1]}))
  );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"m", "nei":["m,.","m,.", "b",".", ".","b"]}
  ];
}

function stair(n) {
  n = ((typeof n === "undefined") ? 3 : n);
  let f = jscad_f();


  /*
  let geom = f.add(
    f.cub({"size":[1,3/4,1/4], "center":[1/2, 1/2+1/8, 1/2-1/4-1/8]}),
    f.cub({"size":[1,2/4,1/4], "center":[1/2, 1/2+2/8, 1/2-0/4-1/8]}),
    f.cub({"size":[1,1/4,1/4], "center":[1/2, 1/2+3/8, 1/2+1/4-1/8]})
  );
  */

  let geom = {};

  let N = n+1;
  for (let i=0; i<n; i++) {
    let yi = i - ((n-1)/2);

    let sx = 1,
        sy = (n-i)/N,
        sz = 1/N;

    let cx = 1/2,
        cy = (1/2) + ((i+1)/(2*N)),
        cz = (1/2) - (1/(2*N)) + (yi/N);
    let s = f.cub({"size":[sx,sy,sz], "center":[cx,cy,cz]});


    if (i==0) {
      geom = s;
    }
    else {
      geom = f.add(geom, s);
    }

  }

  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "nei":["s,.","s,.", "b",".", ".","b"]}
  ];
}

//WIP!!!
function block() {
  let f = jscad_f();
  let geom = f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]}));
  return [
    {"ds":[0,0,0], "geom":geom, "id":"b", "nei":["b","b", ".",".", "b,.","b"]}
  ];
}

function arch1() {
  let f = jscad_f();
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

  let geom = 
    f.mov([0.5,1.0,0.5],
      f.rot([Math.PI/2,0,0],
        f.sub(
          f.mov([0,0,0.5], f.cub({"size":[1,1,1]})),
          f.lif( {height:1}, f.cir({"radius":0.5})),
          f.mov([0,-0.5,0.5], f.cub({"size":[1,1,1]}))
        )
      )
    );

  return [
    {"ds":[0,0,0], "geom":geom, "id":"a1", "nei":["b","b",".",".","b","."]}
  ];
}

function arch2() {
  let f = jscad_f();

  /*
  let sub = jscad.booleans.subtract;
  let and = jscad.booleans.intersect;
  let add = jscad.booleans.union;

  let mov = jscad.transforms.translate;
  let rot = jscad.transforms.rotate;
  let lif = jscad.extrusions.extrudeLinear;
  let cub = jscad.primitives.cuboid;
  let cir = jscad.primitives.circle;
  */

  let geom = 
    f.mov([0,1,0],
      f.rot([Math.PI/2,0,0],
        f.sub(
          f.mov([0,0,0.5], f.cub({"size":[2,2,1]})),
          f.mov([0,0,0], f.lif( {height:1}, f.cir({"radius":1.0}))),
          f.mov([0,-1.0,0.5], f.cub({"size":[2,2,1]}))
        )
      )
    );

  let rgeom = f.and(f.mov([0,0,0],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]})));
  let lgeom = f.and(f.mov([1,0,0],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]})));

  return [
    {"ds":[ 0,0,0], "geom":rgeom, "id":"a2_0", "nei":[   "b","a2_1",".",".","b","."]},
    {"ds":[-1,0,0], "geom":lgeom, "id":"a2_1", "nei":["a2_0",   "b",".",".","b","."]},
  ];
}

function arch3() {

  let f = jscad_f();

  /*
  let sub = jscad.booleans.subtract;
  let and = jscad.booleans.intersect;
  let add = jscad.booleans.union;

  let mov = jscad.transforms.translate;
  let rot = jscad.transforms.rotate;
  let lif = jscad.extrusions.extrudeLinear;
  let cub = jscad.primitives.cuboid;
  let cir = jscad.primitives.circle;
  */

  let geom = 
    f.mov([-0.5,1,0.5],
      f.rot([Math.PI/2,0,0],
        f.sub(
          f.mov([0,0,0.5], f.cub({"size":[3,3,1]})),
          f.mov([0,0,0], f.lif( {height:1}, f.cir({"radius":1.5}))),
          f.mov([0,-1.5,0.5], f.cub({"size":[3,3,1]}))
        )
      )
    );

  //  z  y
  //  | /
  //  . --x
  //
  //     |  b   |  b   |   b  |
  //  b  | a3_3 | a3_2 | a3_1 | b
  //  b  | a3_4 |  .   | a3_0 | b
  //     |  .   |  .   |   .  |

  let info = [];

  info.push({"ds":[ 0,0,0], "geom": f.and(f.mov([ 0, 0, 0],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]}))) });
  info.push({"ds":[ 0,0,1], "geom": f.and(f.mov([ 0, 0,-1],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]}))) });
  info.push({"ds":[-1,0,1], "geom": f.and(f.mov([ 1, 0,-1],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]}))) });
  info.push({"ds":[-2,0,1], "geom": f.and(f.mov([ 2, 0,-1],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]}))) });
  info.push({"ds":[-2,0,0], "geom": f.and(f.mov([ 2, 0, 0],geom), f.mov([0.5,0.5,0.5], f.cub({"size":[1,1,1]}))) });

  info[0]["id"] = "a3_0";
  info[1]["id"] = "a3_1";
  info[2]["id"] = "a3_2";
  info[3]["id"] = "a3_3";
  info[4]["id"] = "a3_4";

  info[0]["nei"] = [    "b",    ".", ".", ".", "a3_1",    "." ];
  info[1]["nei"] = [    "b", "a3_2", ".", ".",    "b", "a3_0" ];
  info[2]["nei"] = [ "a3_1", "a3_3", ".", ".",    "b",    "." ];
  info[2]["nei"] = [ "a3_2",    "b", ".", ".",    "b", "a3_4" ];
  info[2]["nei"] = [    ".",    "b", ".", ".", "a3_3",    "." ];

  return info;
}

function construct_voxel_dock(info, rot_info) {

  let f = jscad_f();

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

  let f = jscad_f();

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
