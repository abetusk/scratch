
var _M = numeric.dot;

function _rnd() {
  return Math.random();
}



var g_info = {
  "disp_canvas": {},
  "disp_ctx": {},

  "n_loaded": 0,

  "rock_placement": {},

  "b_canvas": {},
  "b_ctx": {},
  "subsample": 16,
  "rock": [],
  "rock_h": {},
  "data": [],

  "debug_data":[]
};

//---


function _clip_union( rop_pgns, _pgns) {
  let clpr = new ClipperLib.Clipper();
  let joinType = ClipperLib.JoinType.jtRtound;
  let fillType = ClipperLib.PolyFillType.pftPositive;
  let subjPolyType = ClipperLib.PolyType.ptSubject;
  let clipPolyType = ClipperLib.PolyType.ptClip;
  let clipType = ClipperLib.ClipType.ctUnion;

  let scale = 16384;
  let sol_polytree= new ClipperLib.PolyTree();

  let pgns = [];
  for (let i=0; i<_pgns.length; i++) {
    let idx = pgns.length;
    pgns.push([]);
    for (let j=0; j<_pgns[i].length; j++) {
      pgns[idx].push( { "X": _pgns[i][j].X, "Y": _pgns[i][j].Y } );
    }
  }

  ClipperLib.JS.ScaleUpPaths(pgns, scale);

  clpr.AddPaths( pgns, subjPolyType );
  clpr.Execute( clipType, sol_polytree, fillType, fillType);

  let sol_paths = ClipperLib.Clipper.PolyTreeToPaths(sol_polytree);
  for (let i=0; i<sol_paths.length; i++) {
    let idx = rop_pgns.length;
    rop_pgns.push([]);
    for (let j=0; j<sol_paths[i].length; j++) {
      rop_pgns[idx].push( { "X": sol_paths[i][j].X / scale, "Y": sol_paths[i][j].Y / scale } );

    }
  }

  return rop_pgns;
}

function _copy_pgns(_pgns) {
  let pgns = [];
  for (let i=0; i<_pgns.length; i++) {
    let idx = pgns.length;
    pgns.push([]);
    for (let j=0; j<_pgns[i].length; j++) {
      pgns[idx].push( { "X": _pgns[i][j].X, "Y": _pgns[i][j].Y } );
    }
  }

  return pgns;
}

function _clip_intersect( rop_pgns, _pgnsA, _pgnsB ) {
  var clpr = new ClipperLib.Clipper();
  var joinType = ClipperLib.JoinType.jtRtound;
  var fillType = ClipperLib.PolyFillType.pftPositive;
  var subjPolyType = ClipperLib.PolyType.ptSubject;
  var clipPolyType = ClipperLib.PolyType.ptClip;
  var clipType = ClipperLib.ClipType.ctIntersection;

  let scale = 16384;
  let sol_polytree= new ClipperLib.PolyTree();

  let pgnsA = _copy_pgns(_pgnsA);
  let pgnsB = _copy_pgns(_pgnsB);

  ClipperLib.JS.ScaleUpPaths(pgnsA, scale);
  ClipperLib.JS.ScaleUpPaths(pgnsB, scale);

  clpr.AddPaths( pgnsA, subjPolyType, true );
  clpr.AddPaths( pgnsB, clipPolyType, true );
  clpr.Execute( clipType, sol_polytree, fillType, fillType );
  
  let sol_paths = ClipperLib.Clipper.PolyTreeToPaths(sol_polytree);
  for (let i=0; i<sol_paths.length; i++) {
    let idx = rop_pgns.length;
    rop_pgns.push([]);
    for (let j=0; j<sol_paths[i].length; j++) {
      rop_pgns[idx].push( { "X": sol_paths[i][j].X / scale, "Y": sol_paths[i][j].Y / scale } );
    }
  }

  return rop_pgns;
}

function _clip_difference ( rop_pgns, _pgnsA, _pgnsB ) {
  var clpr = new ClipperLib.Clipper();
  var joinType = ClipperLib.JoinType.jtRtound;
  var fillType = ClipperLib.PolyFillType.pftPositive;
  var subjPolyType = ClipperLib.PolyType.ptSubject;
  var clipPolyType = ClipperLib.PolyType.ptClip;
  var clipType = ClipperLib.ClipType.ctDifference;

  let scale = 16384;
  let sol_polytree= new ClipperLib.PolyTree();

  let pgnsA = _copy_pgns(_pgnsA);
  let pgnsB = _copy_pgns(_pgnsB);

  ClipperLib.JS.ScaleUpPaths(pgnsA, scale);
  ClipperLib.JS.ScaleUpPaths(pgnsB, scale);

  clpr.AddPaths( pgnsA, subjPolyType, true );
  clpr.AddPaths( pgnsB, clipPolyType, true );
  clpr.Execute( clipType, sol_polytree, fillType, fillType );

  let sol_paths = ClipperLib.Clipper.PolyTreeToPaths(sol_polytree);
  for (let i=0; i<sol_paths.length; i++) {
    let idx = rop_pgns.length;
    rop_pgns.push([]);
    for (let j=0; j<sol_paths[i].length; j++) {
      rop_pgns[idx].push( { "X": sol_paths[i][j].X / scale, "Y": sol_paths[i][j].Y / scale } );
    }
  }

  return rop_pgns;
}

function _clip_xor( rop_pgns, _pgnsA, _pgnsB ) {
  var clpr = new ClipperLib.Clipper();
  var joinType = ClipperLib.JoinType.jtRtound;
  var fillType = ClipperLib.PolyFillType.pftPositive;
  var subjPolyType = ClipperLib.PolyType.ptSubject;
  var clipPolyType = ClipperLib.PolyType.ptClip;
  var clipType = ClipperLib.ClipType.ctXor;
  
  let scale = 16384;
  let sol_polytree= new ClipperLib.PolyTree();

  let pgnsA = _copy_pgns(_pgnsA);
  let pgnsB = _copy_pgns(_pgnsB);

  ClipperLib.JS.ScaleUpPaths(pgnsA, scale);
  ClipperLib.JS.ScaleUpPaths(pgnsB, scale);

  clpr.AddPaths( pgnsA, subjPolyType, true );
  clpr.AddPaths( pgnsB, clipPolyType, true );
  clpr.Execute( clipType, sol_polytree, fillType, fillType );

  let sol_paths = ClipperLib.Clipper.PolyTreeToPaths(sol_polytree);
  for (let i=0; i<sol_paths.length; i++) {
    let idx = rop_pgns.length;
    rop_pgns.push([]);
    for (let j=0; j<sol_paths[i].length; j++) {
      rop_pgns[idx].push( { "X": sol_paths[i][j].X / scale, "Y": sol_paths[i][j].Y / scale } );
    }
  }

  return rop_pgns;
}

function _clip_offset( ofs_pgns, inp_pgns, ds ) {
  var joinType = ClipperLib.JoinType.jtRound;
  var miterLimit = 10;
  var autoFix = true;

  var clpr = new ClipperLib.Clipper();

  var t_pgns = clpr.OffsetPolygons( inp_pgns, ds, joinType, miterLimit, autoFix );

  for (var ind in t_pgns) {
    ofs_pgns.push(t_pgns[ind]);
  }

}

function polygon_with_holes(ctx, x, y, pgn, color) {
  ctx.lineWidth = 0;
  ctx.fillStyle = color;
  ctx.beginPath();

  ctx.moveTo(x,y);
  for (let i=0; i<pgn.length; i++) {
    for (let j=0; j<pgn[i].length; j++) {
      if (j==0) {
        ctx.moveTo(x + pgn[i][j].X, y + pgn[i][j].Y);
        continue;
      }
      ctx.lineTo(x + pgn[i][j].X, y + pgn[i][j].Y);
    }
  }

  ctx.fill();
}

function polygons(ctx, x, y, pgn, color) {
  ctx.lineWidth = 0;
  ctx.fillStyle = color;
  ctx.beginPath();

  ctx.moveTo(x,y);
  for (let i=0; i<pgn.length; i++) {
    for (let j=0; j<pgn[i].length; j++) {
      if (j==0) {
        ctx.moveTo(x + pgn[i][j].X, y + pgn[i][j].Y);
        continue;
      }
      ctx.lineTo(x + pgn[i][j].X, y + pgn[i][j].Y);
    }
  }
  ctx.fill();

}

//---

function label_corner() {
  let ctx = g_info.b_ctx;
  let dw = 4;
  for (let key in g_info.found_info) {
    let rc = g_info.found_info[key];
    ctx.fillStyle = "rgba(255,0,0,1.0)";
    ctx.fillRect(rc.c-dw/2, rc.r-dw/2, dw, dw);
  }
}

function vec2a(u) {
  let v = [];
  for (let i=0; i<u.length; i++) {
    v.push( [ u[i].x, u[i].y ] );
  }
  return v;
}

function construct_bounding_paths() {
  let img_data = g_info.b_img_data;
  let img_dat = img_data.data;

  let x_offset = 300;
  let y_offset = 150;

  let x_width = 300;
  let y_height = 300;

  let _scale = 1.0;

  let subdiv = g_info.subsample;
  for (let key in g_info.found_info) {
    let rc = g_info.found_info[key];
    let raw_path = trace_boundary_path(img_data, rc.c, rc.r);

    let sub_path = [];
    for (let i=0; i<raw_path.length; i+= subdiv) {
      sub_path.push( {"x": raw_path[i][0], "y":raw_path[i][1] } );
    }

    g_info.rock.push({"p":sub_path});

    let x_idx = Math.floor((sub_path[0].x - x_offset)/x_width);
    let y_idx = Math.floor((sub_path[0].y - y_offset)/y_height);
    let hkey = x_idx.toString() + ":" + y_idx.toString();

    let v = vec2a(sub_path);

    for (let i=0; i<v.length; i++) {
      v[i][0] = _scale*((v[i][0] - x_offset) - x_width*x_idx);
      v[i][1] = _scale*((v[i][1] - y_offset) - y_height*y_idx);
    }

    g_info.rock_h[hkey] = {"p": sub_path, "v": v};
  }

}

function rect_path(ctx,p) {
  for (let i=0; i<p.length; i++) {
    ctx.fillStyle = "rgba(255,0,255,1.0)";
    ctx.fillRect(p[i].x, p[i].y, 3, 3);
  }
}


function debug_path() {
  let ctx = g_info.b_ctx;
  for (let i=0; i<g_info.rock.length; i++) {
    rect_path(ctx, g_info.rock[i].p);
  }
}

function trace_boundary_path(img_data, c,r) {

  let _dwin = [
    [-1,-1], [0,-1], [1,-1],
    [-1 ,0],         [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  let _dwin_idx = [
    [0,1,2],
    [1,2,4],
    [2,4,7],
    [4,7,6],
    [7,6,5],
    [6,5,3],
    [5,3,0],
    [3,0,1]
  ];

  let _path = [];

  let w = img_data.width;
  let h = img_data.height;
  let pix_data = img_data.data;

  let _s = 3;

  let idx = (r*w + c)*4;

  if (pix_data[idx+_s] == 0) { return -1; }

  _path.push( [c,r] );

  let max_iter = 1000;
  let cur_r = r;
  let cur_c = c;

  let iter=0;

  for (; iter<max_iter; iter++) {

    for (let i=0; i<8; i++) {
      let sched_win = _dwin_idx[i];
      let pi = sched_win[0];
      let mi = sched_win[1];
      let ni = sched_win[2];

      let pix_prv = ((w*(cur_r + _dwin[pi][1])) + (cur_c + _dwin[pi][0]))*4;
      let pix_mid = ((w*(cur_r + _dwin[mi][1])) + (cur_c + _dwin[mi][0]))*4;
      let pix_nxt = ((w*(cur_r + _dwin[ni][1])) + (cur_c + _dwin[ni][0]))*4;

      if ((pix_data[pix_prv+_s] == 0) &&
          (pix_data[pix_mid+_s] != 0) &&
          (pix_data[pix_nxt+_s] != 0)) {
        found = true;
        cur_r += _dwin[mi][1];
        cur_c += _dwin[mi][0];

        _path.push( [cur_c, cur_r] );
        break;
      }

    }

    if (!found) { return []; }

    if ((cur_r==r) && (cur_c==c)) { break; }

    if (_path.length>10) {
      let dx = (_path[0][0] - _path[_path.length-1][0]);
      let dy = (_path[0][1] - _path[_path.length-1][1]);
      let len = Math.sqrt(dx*dx + dy*dy);
      if (len<2) { break; }
    }

  }

  if (iter==1000) {
    console.log("!!", iter);

    for (let i=10; i<_path.length; i++) {
      let dx = (_path[0][0] - _path[i][0]);
      let dy = (_path[0][1] - _path[i][1]);

      let len = Math.sqrt(dx*dx + dy*dy);

      if (len < 2) {
        console.log(">>>", 0, i, _path[0], _path[i]);
      }

    }
  }

  return _path;

}

function uu(a) {
  let ctx = g_info.disp_ctx;

  let src_x = 300;
  let src_y = 150;
  let src_w = 300;
  let src_h = 300;

  let dst_x = 200;
  let dst_y = 200;
  let dst_w = 150;
  let dst_h = 150;

  ctx.save();

  ctx.translate(dst_x+dst_w/2, dst_y+dst_h/2);
  //ctx.rotate(12*Math.PI/7);
  ctx.rotate(a);
  ctx.translate(-dst_x-dst_w/2, -dst_y-dst_h/2);

  ctx.drawImage(g_info.data[0],
    src_x, src_y, src_w, src_h,
    dst_x, dst_y, dst_w, dst_h);

  ctx.restore();
}

function v_transform(u, dx, dy, s, a) {
  let v = [];

  let _c = Math.cos(a);
  let _s = Math.sin(a);

  for (let i=0; i<u.length; i++) {
    let _x = s*(u[i][0]) ;
    let _y = s*(u[i][1]) ;
    
    v.push( [ _c*_x - _s*_y + dx, _s*_x + _c*_y + dy ] );
  }
  return v;
}

function mat3_t(dx, dy) {
  let u = [
    [ 1, 0, dx ],
    [ 0, 1, dy ],
    [ 0, 0, 1 ]
  ];
  return u;
}

function mat3_r(a) {
  let _c = Math.cos(a);
  let _s = Math.sin(a);

  let u = [
    [ _c, -_s, 0 ],
    [ _s,  _c, 0 ],
    [  0,   0, 1 ]
  ];
  return u;
}

function mat3_s(s) {
  let u = [
    [ s, 0, 0 ],
    [ 0, s, 0 ],
    [ 0, 0, 1 ]
  ];
  return u;
}

function mat3_i() {
  return [
    [ 1, 0, 0 ],
    [ 0, 1, 0 ],
    [ 0, 0, 1 ]
  ];
}


function disp_rock(ctx, rock_idx_x, rock_idx_y, x, y, a, s, debug) {
  let x_offset = 300;
  let y_offset = 150;

  let src_w = 300;
  let src_h = 300;

  let src_x = rock_idx_x*src_w + x_offset;
  let src_y = rock_idx_y*src_h + y_offset;

  let dst_x = x;
  let dst_y = y;
  let dst_w = src_w*s;
  let dst_h = src_h*s;

  let _scale = dst_w / src_w;
 
  ctx.save();

  ctx.translate(dst_x+dst_w/2, dst_y+dst_h/2);
  ctx.rotate(a);
  ctx.translate(-dst_x-dst_w/2, -dst_y-dst_h/2);

  ctx.drawImage(g_info.data[0],
    src_x, src_y, src_w, src_h,
    dst_x, dst_y, dst_w, dst_h);

  ctx.restore();

  /*
  let ri = g_info.rock_h[ rock_idx_x.toString() + ":" + rock_idx_y.toString() ];
  if (typeof ri !== "undefined") {
    let p = ri.p;
    let v = ri.v;

    let _m = _M( mat3_t(dst_x, dst_y),
                 _M( mat3_t(dst_w/2, dst_h/2),
                     _M( mat3_r(a),
                         _M( mat3_t(-dst_w/2, -dst_h/2),
                         mat3_s(0.5) ))));

    for (let i=0; i<p.length; i++) {
      let pnt = _M( _m, [v[i][0], v[i][1], 1 ]);

      ctx.fillStyle = "rgba(255,0,0,1.0)";
      ctx.fillRect( pnt[0], pnt[1], 2, 2 );
    }
  }
  */

  
}

function rock_info(idx_x, idx_y, opt) {
  opt = ((typeof opt === "undefined") ? {} : opt);

  let a = ((typeof opt.a === "undefined") ? 0 : opt.a);
  let s = ((typeof opt.s === "undefined") ? 1 : opt.s);
  let x = ((typeof opt.x === "undefined") ? 0 : opt.x);
  let y = ((typeof opt.y === "undefined") ? 0 : opt.y);

  let w = ((typeof opt.w === "undefined") ? 300 : opt.w);
  let h = ((typeof opt.h === "undefined") ? 300 : opt.h);

  let _m = _M( mat3_t(x, y),
               _M( mat3_t(w/2, h/2),
                   _M( mat3_r(a),
                       _M( mat3_t(-w/2, -h/2),
                       mat3_s(s) ))));

  let info = {
    "d": [0,0],
    "u": [0,0],
    "l": [0,0],
    "r": [0,0],
    "com": [0,0],
    "boundary": [],
    "info": {}
  };

  let ri = g_info.rock_h[ idx_x.toString() + ":" + idx_y.toString() ];
  if (typeof ri === "undefined") { return undefined; }

  info.info = ri;

  let p = ri.p;
  let v = ri.v;
  for (let i=0; i<p.length; i++) {
    let pnt = _M( _m, [v[i][0], v[i][1], 1 ]);
    info.boundary.push(pnt);
  }

  for (let i=0; i<p.length; i++) {
    let pnt = _M( _m, [v[i][0], v[i][1], 1 ]);

    info.com[0] += pnt[0];
    info.com[1] += pnt[1];

    if (i==0) {
      info.d[0] = pnt[0]; info.d[1] = pnt[1];
      info.u[0] = pnt[0]; info.u[1] = pnt[1];
      info.r[0] = pnt[0]; info.r[1] = pnt[1];
      info.l[0] = pnt[0]; info.l[1] = pnt[1];
    }

    if (info.d[1] > pnt[1]) {
      info.d[0] = pnt[0]; info.d[1] = pnt[1];
    }
    if (info.u[1] < pnt[1]) {
      info.u[0] = pnt[0]; info.u[1] = pnt[1];
    }

    if (info.l[0] > pnt[0]) {
      info.l[0] = pnt[0]; info.l[1] = pnt[1];
    }
    if (info.r[0] < pnt[0] ) {
      info.r[0] = pnt[0]; info.r[1] = pnt[1];
    }

  }

  info.com[0] /= p.length;
  info.com[1] /= p.length;

  return info;
}

function anim() {
  let w = g_info.width;
  let h = g_info.height;

  let ctx = g_info.disp_ctx;

  // outline (frame)
  //
  ctx.fillStyle = "rgba(50,50,50,0.9)";
  ctx.fillRect(0,0,w, 4);
  ctx.fillRect(0,h-4,w, 4);
  ctx.fillRect(0,0,4,h);
  ctx.fillRect(w-4,0,4,h);

  //---

  let rock_placement = [];

  let _iter = 200;
  let _step_y = 10;
  let N = 10;
  for (let idx=0; idx<N; idx++) {

    let a = (_rnd() - 0.5)*Math.PI*2;
    let x_idx = Math.floor(_rnd()*4);
    let y_idx = Math.floor(_rnd()*8);

    let opt = {
      "x": 0,
      "y": 0,
      "a": a,
      "w": 150,
      "h": 150,
      "s": 0.5
    };

    let _px = 0;
    let _py = 0;
    let _py_prv = 0;
    let ri = rock_info(x_idx,y_idx,opt);

    let rock_data = {
      "x": _px,
      "y": _py,
      "a": a,
      "s": 0.5,
      "opt": opt,
      "x_idx" : x_idx,
      "y_idx": y_idx,
      "b": [],
      "info": ri
    };

    _px = w/2  + (_rnd() - 0.5)*2*w/3 - 150/2;

    let _stop = false;
    for (let _it=1; _it<_iter; _it++) {

      ri = rock_info(x_idx,y_idx,opt);

      _py_prv = (_step_y * (_it-1));
      _py = _step_y * _it;

      //let _py = h - ri.u[1] - idx*90;


      rock_data = {
        "x": _px,
        "y": _py,
        "a": a,
        "s": 0.5,
        "opt": opt,
        "x_idx" : x_idx,
        "y_idx": y_idx,
        "b": [],
        "info": ri
      };

      for (let ii=0; ii<ri.boundary.length; ii++) {
        ri.boundary[ii][0] += _px;
        ri.boundary[ii][1] += _py;
        rock_data.b.push( { "X": ri.boundary[ii][0], "Y": ri.boundary[ii][1] } );
      }

      if (_py > (h - ri.u[1])) {

        console.log("cp0");

        _stop=true;
      }

      if (_stop) { break; }

      for (let ii=0; ii<idx; ii++) {

        let rop = [];
        let u = _clip_intersect( rop, [rock_placement[ii].b], [rock_data.b] );

        if (rop.length > 0) {

          g_info.debug_data.push(rop);

          console.log("cp1", idx, ii, rop);

          ctx.fillStyle = "rgba(255,255,255,1.0)";
          ctx.beginPath();
          ctx.moveTo(rop[0][0].X, rop[0][0].Y);
          for (let _i=1; _i<rop[0].length; _i++) {
            ctx.lineTo(rop[0][_i].X, rop[0][_i].Y);
          }
          ctx.closePath();
          ctx.fill();

          _stop=true;
          break;
        }


      }

      if (_stop) { break; }
      _py_prv = _py;

    }

    rock_placement.push(rock_data);

    //disp_rock(ctx, x_idx, y_idx, _px, _py, opt.a, opt.s);

    //DEBUG
    //
    for (let ii=0; ii<ri.boundary.length; ii++) {
      ctx.fillStyle = "rgba(255,0,0,0.9)";
      ctx.fillRect( rock_data.info.boundary[ii][0], rock_data.info.boundary[ii][1], 2, 2 );
    }
    for (let key in ri) {
      ctx.fillStyle = "rgba(0,255,255,0.9)";
      ctx.fillRect(ri[key][0] + _px, ri[key][1] + _py, 10,10);
    }

  }

  g_info.rock_placement = rock_placement;

  for (let i=0; i<g_info.rock_placement.length; i++) {
    let _rock = g_info.rock_placement[i];
    disp_rock(ctx,
      _rock.x_idx,
      _rock.y_idx,
      _rock.x,
      _rock.y,
      _rock.a,
      _rock.s);

  }

  for (let i=0; i<g_info.debug_data.length; i++) {
    let rop = g_info.debug_data[i];

          ctx.fillStyle = "rgba(255,255,0,1.0)";
          ctx.beginPath();
          ctx.moveTo(rop[0][0].X, rop[0][0].Y);
          for (let _i=1; _i<rop[0].length; _i++) {
            ctx.lineTo(rop[0][_i].X, rop[0][_i].Y);
          }
          ctx.closePath();
          ctx.fill();
  }

  // DEBUG
  /*
  for (let idx_a=0; idx_a<rock_placement.length; idx_a++) {
    for (let idx_b=idx_a+1; idx_b<rock_placement.length; idx_b++) {
      let rop = [];
      let u = _clip_intersect( rop, [rock_placement[idx_a].b], [rock_placement[idx_b].b] );
      console.log(idx_a, idx_b, u, rop);
    }
  }
  */

  return;

  let opt = {
    "x": 0,
    "y": 0,

    "a": Math.PI/12,
    //"a": 0,

    "w": 150,
    "h": 150,
    "s": 0.5
  };
  let ri = rock_info(1,1,opt);
  console.log(">>", ri);

  let _px = w/2;
  let _py = h - ri.u[1];


  for (let key in ri) {
    ctx.fillStyle = "rgba(0,255,255,0.9)";
    ctx.fillRect(ri[key][0] + _px, ri[key][1] + _py, 10,10);
  }
  //disp_rock(ctx, 1, 1, 200, h-100, 0, 0.5);
  //disp_rock(ctx, 1, 1, opt.x, opt.y, opt.a, opt.s);
  disp_rock(ctx, 1, 1, _px, _py, opt.a, opt.s);

  //---

  let opt1 = {
    "x": 0,
    "y": 0,

    "a": -Math.PI/12,

    "w": 150,
    "h": 150,
    "s": 0.5
  };
  let ri1 = rock_info(1,2,opt1);

  let _px1 = w/8;
  let _py1 = h - ri1.u[1];


  for (let key in ri1) {
    ctx.fillStyle = "rgba(0,255,255,0.9)";
    ctx.fillRect(ri1[key][0] + _px1, ri1[key][1] + _py1, 10,10);
  }
  disp_rock(ctx, 1, 2, _px1, _py1, opt1.a, opt1.s);

}



// grid 300 x 300 pixels,
// iniital offset:
//  horizontal: 0
//  vertical: 150
//

function img_load_done(x) {

  g_info.n_loaded++;

  if (g_info.n_loaded==1) {
    init_fin();
  }
}

function init_fin() {


  g_info.width = 500;
  g_info.height = 700;

  let w = g_info.width;
  let h = g_info.height;

  let disp_canvas = document.getElementById("canvas");
  disp_canvas.width = w;
  disp_canvas.height = h;
  let disp_ctx = disp_canvas.getContext("2d");
  disp_ctx.width = w;
  disp_ctx.height = h;

  g_info.disp_canvas = disp_canvas;
  g_info.disp_ctx = disp_ctx;

  calc_outline(g_info.data[0]);
  anim();
}

function calc_outline(img) {

  //let img = g_info.data[0];

  let w = img.width;
  let h = img.height;

  //g_info.width = w;
  //g_info.height = h;

  //let canvas = document.getElementById("canvas");
  let canvas = document.getElementById("back_canvas");
  canvas.width = w;
  canvas.height = h;
  let ctx = canvas.getContext("2d");
  ctx.width = w;
  ctx.height = h;

  g_info.b_canvas = canvas;
  g_info.b_ctx = ctx;

  ctx.drawImage(img, 0, 0);

  let img_data = ctx.getImageData(0,0,w,h);

  g_info.b_img_data = img_data;

  let img_dat = img_data.data;

  let grid_w = 300;
  let grid_h = 300;
  let grid_offset_w = 0;
  let grid_offset_h = 150;

  let found_info = {};

  //DEBUG
  //
  let t_img = ctx.getImageData(300,150,300,300);

  g_info.sub_img = t_img;

  //
  //DEBUG

  for (let gr=grid_offset_h; gr<(h); gr+=grid_h) {
    for (let gc=grid_offset_w; gc<(w); gc+=grid_w) {

      let found=false;
      let pilot_r = -1, pilot_c = -1;

      for (let idx=0; idx<grid_w; idx++) {
        let _c = gc + idx;
        let _r = gr + idx;

        if ((_c >= w) || (_r >= h)) { continue; }
        let pix_idx = 4*(_c + _r*w);

        if (img_dat[pix_idx+3] != 0) {

          found_info[pix_idx] = {"r": _r, "c": _c };

          found=true;
          pilot_r = _r;
          pilot_c = _c;
          break;
        }
        else {
        }

      }

      if (found) {
      }
      else {
      }

    }
  }

  g_info.found_info = found_info;

  construct_bounding_paths();
}

function img_stick_load_done() {
  console.log("...");
}

function flood_fill(img_data) {
  let pix_data = img_data.data;

  let w = img_data.width;
  let h = img_data.height;

  let _h = {};

  let iter = 0;
  let _max_count = w*h;

  let xcount=0;

  _h[0] = 1;
  let _h_count=1;
  let zz=0;

  let neg = 0;
  while ((_h_count>0) && (iter < _max_count)) {

    for (let key in _h) {

      let idx = parseInt(key);

      if (pix_data[idx] != 127) {

        zz++;

        let idx_l = idx - 4;
        let idx_r = idx + 4;
        let idx_u = idx - 4*w;
        let idx_d = idx + 4*w;

        if ((idx_l >= 0) && (pix_data[idx_l] != 127)) {
          _h[idx_l] = 1;
          _h_count++;
        }

        if ((idx_u >= 0) && (pix_data[idx_u] != 127)) {
          _h[idx_u] = 1;
          _h_count++;
        }

        if ((idx_r < (4*w*h)) && (pix_data[idx_r] != 127)) {
          _h[idx_r] = 1;
          _h_count++;
        }

        if ((idx_d < (4*w*h)) && (pix_data[idx_d] != 127)) {
          _h[idx_d] = 1;
          _h_count++;
        }

      }

      if ((pix_data[idx+0] == 0) &&
          (pix_data[idx+1] == 0) &&
          (pix_data[idx+2] == 0) &&
          (pix_data[idx+3] == 0)) {
        pix_data[idx+0] = 127;
        pix_data[idx+3] = 255;
        xcount++;
      }
      else {
        pix_data[idx] = 127;
        pix_data[idx+1] = 127;
        pix_data[idx+3] = 255;
      }

      _h_count--;
      delete _h[key];

      neg++;

      if (key in _h) {
        console.log(">>> wtf" );
      }

      break;
    }

    iter++;

    if ((iter%10000)==0) {
      console.log(iter, _h_count, xcount, zz, neg);
    }
  }

  console.log(">>>", iter, _h_count);
}

function img_stick_display() {
  let img = g_info.data[1];

  let w = img.width;
  let h = img.height;

  let canvas = document.getElementById("back_canvas");
  canvas.width = w;
  canvas.height = h;
  let ctx = canvas.getContext("2d");
  ctx.width = w;
  ctx.height = h;

  g_info.b_canvas = canvas;
  g_info.b_ctx = ctx;

  ctx.drawImage(img, 0, 0);
  let img_data = ctx.getImageData(0,0,w,h);

  let pix_data = img_data.data;

  // count
  /*
  let count_0 = 0;
  let count_255 = 0;
  let count_tot = 0;
  let count_nz=0;
  let alpha_freq = [];
  for (let i=0; i<256; i++) { alpha_freq.push(0); }
  for (let i=0; i<pix_data.length; i+=4) {
    count_tot++;

    alpha_freq[ pix_data[i+3] ]++;

    if (pix_data[i+3] == 0) {
      count_0++;
    }
    else if (pix_data[i+3]==255) {
      count_255++;
    }

    if ((pix_data[i+0] > 0) ||
        (pix_data[i+1] > 0) ||
        (pix_data[i+2] > 0) ||
        (pix_data[i+3] > 0)) {
      count_nz++;
    }
  }
  console.log(count_0, count_255, count_tot, count_nz);

  for (let i=0; i<alpha_freq.length; i++) {
    if (alpha_freq[i]>0) {
      console.log(i, alpha_freq[i]);
    }
  }
  */

  console.log("cp");
  flood_fill(img_data);

  for (let r=0; r<h; r++) {
    for (let c=0; c<w; c++) {
      let idx = 4*(r*w + c);

      if (pix_data[idx+3] == 255) {
        pix_data[idx+0] = 127;
        pix_data[idx+3] = 255;
      }

    }
  }

  ctx.putImageData(img_data, 0, 0);

}

function init() {
  console.log("ok");

  let img = new Image();
  img.src = "img/Tinyrocks_l2_1.png";
  img.addEventListener('load', img_load_done);
  g_info.data.push(img);

  let img_stick = new Image();
  img_stick.src = "img/sticks.png";
  img_stick.addEventListener("load", img_stick_load_done);
  g_info.data.push(img_stick);

}
