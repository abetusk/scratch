
var _M = numeric.dot;

function _rnd() {
  return Math.random();
}



var g_info = {
  "disp_canvas": {},
  "disp_ctx": {},

  "n_loaded": 0,

  "n_rock": 8,

  //"n_window": 20,
  //"n_board": 50,
  //"n_board": 32,

  "density_board": 1/16,
  "density_window": 1/16,

  "group": {
    "rock": [],
    "board": [],
    "house": [],
    "window": []
  },
  //"rock_placement": {},
  //"board_placement": {},
  //"window_placement": {},

  "grid": {
    "width": 300,
    "height": 300,
    "x_offset": 300,
    "y_offset" : 150
  },

  "img_location": {
    "rock": [
      "img/Tinyrocks_l1_1.png",
      "img/Tinyrocks_l1_2.png",
      "img/Tinyrocks_l1_3.png",
      "img/Tinyrocks_l1_4.png",
      "img/Tinyrocks_l2_1.png",
      "img/Tinyrocks_l2_2.png",
      "img/Tinyrocks_l2_3.png",
      "img/Tinyrocks_l2_4.png",
      "img/Tinyrocks_l2_5.png",
      "img/Tinyrocks_l3.png"
    ],

    "house": [
      "img/house_123_0.png",
      "img/house_123_1.png",
      "img/house_123_2.png",
      "img/house_123_6.png",
      "img/house_123_12.png"
    ],

    "window": [
      "img/window_h4_0.png",
      "img/window_h4_1.png",
      "img/window_h4_2.png",
      "img/window_h4_3.png",
      "img/window_h4_4.png",
      "img/window_h4_5.png",
      "img/window_h4_6.png",
      "img/window_h4_7.png",
      "img/window_h4_8.png",
      "img/window_h4_9.png",
      "img/window_h4_10.png",
      "img/window_h4_11.png",
      "img/window_h4_12.png",
      "img/window_h4_13.png",
      "img/window_h4_14.png",
      "img/window_h4_15.png",
      "img/window_h4_16.png",
      "img/window_h4_17.png",
      "img/window_h4_18.png",
      "img/window_h4_19.png",
      "img/window_h4_20.png",
      "img/window_h4_21.png",
      "img/window_h4_22.png",
      "img/window_h4_23.png",
      "img/window_h4_24.png",
      "img/window_h4_25.png",
      "img/window_h4_26.png",
      "img/window_h4_27.png",
      "img/window_h4_28.png",
      "img/window_h4_29.png",
      "img/window_h4_30.png",
      "img/window_h4_31.png",
      "img/window_h4_32.png",
      "img/window_h4_33.png",
      "img/window_h4_34.png",
      "img/window_h4_35.png",
      "img/window_h4_36.png"
    ],
    "board": [
      "img/board_h4_1.png",
      "img/board_h4_2.png",
      "img/board_h4_3.png",
      "img/board_h4_4.png",
      "img/board_h4_5.png",
      "img/board_h4_6.png",
      "img/board_h4_7.png",
      "img/board_h4_8.png",
      "img/board_h4_9.png",
      "img/board_h4_10.png",
      "img/board_h4_11.png",
      "img/board_h4_12.png",
      "img/board_h4_13.png",
      "img/board_h4_14.png",
      "img/board_h4_15.png",
      "img/board_h4_16.png",
      "img/board_h4_17.png",
      "img/board_h4_18.png",
      "img/board_h4_19.png",
      "img/board_h4_20.png",
      "img/board_h4_21.png",
      "img/board_h4_22.png",
      "img/board_h4_23.png",
      "img/board_h4_24.png",
      "img/board_h4_25.png",
      "img/board_h4_26.png",
      "img/board_h4_27.png",
      "img/board_h4_28.png",
      "img/board_h4_29.png",
      "img/board_h4_30.png",
      "img/board_h4_32.png",
      "img/board_h4_33.png",
      "img/board_h4_34.png",
      "img/board_h4_35.png",
      "img/board_h4_36.png",
      "img/board_h4_37.png",
      "img/board_h4_38.png",
      "img/board_h4_39.png",
      "img/board_h4_40.png",
      "img/board_h4_41.png",
      "img/board_h4_42.png",
      "img/board_h4_43.png"
    ]
  },

  "b_canvas": {},
  "b_ctx": {},
  "subsample": 16,
  "rock": [],
  "rock_h": {},
  "data": {
    "house": [],
    "rock": [],
    "window": [],
    "board": []
  },

  "debug_data":[]
};

//---

function _clip_area( _pgns ) {
  let clpr = new ClipperLib.Clipper();
  let scale = 16384;

  let pgns = [];
  for (let i=0; i<_pgns.length; i++) {
    let idx = pgns.length;
    pgns.push([]);
    for (let j=0; j<_pgns[i].length; j++) {
      pgns[idx].push( { "X": _pgns[i][j].X, "Y": _pgns[i][j].Y } );
    }
  }

  ClipperLib.JS.ScaleUpPaths(pgns, scale);

  clpr.Area( pgns[0] );

}

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

function _copy_pgn(_pgn) {
  let pgn = [];
	for (let j=0; j<_pgn.length; j++) {
		pgn.push( { "X": _pgn[j].X, "Y": _pgn[j].Y } );
	}

  return pgn;
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

function construct_bounding_paths(img_data, z_idx, found_info) {
  z_idx = ((typeof z_idx === "undefined") ? 0 : z_idx);

  //let img_data = g_info.b_img_data;
  //let img_dat = img_data.data;

  //let x_offset = 300;
  //let y_offset = 150;

  //let x_width = 300;
  //let y_height = 300;

  let x_offset = g_info.grid.x_offset;
  let y_offset = g_info.grid.y_offset;

  let x_width = g_info.grid.width;
  let y_height = g_info.grid.height;

  let _scale = 1.0;

  let subdiv = g_info.subsample;
  //for (let key in g_info.found_info) {
  for (let key in found_info) {
    //let rc = g_info.found_info[key];
    let rc = found_info[key];
    let raw_path = trace_boundary_path(img_data, rc.c, rc.r);

    let sub_path = [];
    for (let i=0; i<raw_path.length; i+= subdiv) {
      sub_path.push( {"x": raw_path[i][0], "y":raw_path[i][1] } );
    }

    //g_info.rock.push({"p":sub_path});

    let x_idx = Math.floor((sub_path[0].x - x_offset)/x_width);
    let y_idx = Math.floor((sub_path[0].y - y_offset)/y_height);
    let hkey = x_idx.toString() + ":" + y_idx.toString() + ":" + z_idx.toString() ;

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

// use a small 8 pixel window to trace the path
//
function trace_boundary_path(img_data, c,r) {

  // relative pixel locations (x,y)
  //
  let _dwin = [
    [-1,-1], [0,-1], [1,-1],
    [-1 ,0],         [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  // cw order of pixel testing
  //
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

  // alpha channel, test the pixel
  //
  let _s = 3;
  let idx = (r*w + c)*4;
  if (pix_data[idx+_s] == 0) { return -1; }

  _path.push( [c,r] );

  let max_iter = 1000;
  let cur_r = r;
  let cur_c = c;

  let iter=0;

  for (; iter<max_iter; iter++) {

    let found = false;
    //for (let i=0; i<8; i++) {
    for (let i=0; i<_dwin_idx.length; i++) {
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

  /*
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
  */

  return _path;

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


function disp_rock(ctx, rock_idx_x, rock_idx_y, rock_idx_z, x, y, a, s, debug) {

  let x_offset = g_info.grid.x_offset;
  let y_offset = g_info.grid.y_offset;

  let src_w = g_info.grid.width;
  let src_h = g_info.grid.height;

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

  ctx.drawImage(g_info.data.rock[rock_idx_z],
    src_x, src_y, src_w, src_h,
    dst_x, dst_y, dst_w, dst_h);

  ctx.restore();
  
}

function rock_info(idx_x, idx_y, idx_z, opt) {
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

  let ri = g_info.rock_h[ idx_x.toString() + ":" + idx_y.toString()  + ":" + idx_z.toString() ];
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

function house_info(img_idx, opt) {
  opt = ((typeof opt === "undefined") ? {} : opt);

  let a = ((typeof opt.a === "undefined") ? 0 : opt.a);
  let s = ((typeof opt.s === "undefined") ? 1 : opt.s);
  let x = ((typeof opt.x === "undefined") ? 0 : opt.x);
  let y = ((typeof opt.y === "undefined") ? 0 : opt.y);

  let w = ((typeof opt.w === "undefined") ? 300 : opt.w);
  let h = ((typeof opt.h === "undefined") ? 300 : opt.h);

  let img = g_info.data.house[img_idx];
  let _w = img.width;
  let _h = img.height;

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

  // this is an approoximation...
  //
  let dw = img.width/4;
  let dh = img.height/4 + 35;
  let v = [
    [ -dw + _w/2, -dh + _h/2 ],
    [  dw + _w/2, -dh + _h/2 ],
    [  dw + _w/2,  dh + _h/2 ],
    [ -dw + _w/2,  dh + _h/2 ]
  ];

  for (let i=0; i<v.length; i++) {
    let pnt = _M( _m, [v[i][0], v[i][1], 1 ]);
    info.boundary.push(pnt);
  }

  for (let i=0; i<v.length; i++) {
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

  info.com[0] /= v.length;
  info.com[1] /= v.length;

  return info;
}

function place_house( _collision_info ) {
  let _debug = false;

  let w = g_info.width;
  let h = g_info.height;

  let house_placement = [];

  let margin_w = w/24;
  let margin_h = h/24;


  let max_iter = 10;

  let collision_info = [];
  for (let ii=0; ii<_collision_info.length; ii++) {
    collision_info.push( {"b": _copy_pgn( _collision_info[ii].b )} );
  }

  console.log(">>", collision_info);

  let N = 2;
  for (let idx=0; idx<N; idx++) {
    //let s = (idx/(N-1));

    let house_data = {
      "X": 0,
      "Y": 0,
      "s": 0,
      "w": 0,
      "h": 0,
      "a": 0,
      "b": [],
      "img_idx": -1
    };


    let _stop = false;
    let _reject = false;
    for (let iter=0; iter<max_iter; iter++) {
      _reject = false;

      let _scale = _rnd()*0.25 + .125;
      let _img_idx = Math.floor(_rnd()*g_info.data.house.length);
      let _img = g_info.data.house[_img_idx];
      let _ang = _rnd()*Math.PI*2;


      let cx = _rnd()*(w - margin_w*2) + margin_w ;
      let cy = _rnd()*(h - margin_h*2) + margin_h ;


      //_scale = 0.25;
      //_ang = 0;

      house_data = {
        "X": cx,
        "Y": cy,
        "s": _scale,
        "w": _scale * _img.width,
        "h": _scale * _img.height,
        "a": _ang,
        "b": [],
        "img_idx": _img_idx
      };


      let opt = {
        "x": 0,
        "y": 0,
        "a": _ang,
        "w": _scale * _img.width,
        "h": _scale * _img.height,
        "s": _scale
      };

      let hi = house_info(_img_idx, opt);
      for (let ii=0; ii<hi.boundary.length; ii++) {
        hi.boundary[ii][0] += cx;
        hi.boundary[ii][1] += cy;
        house_data.b.push( { "X": hi.boundary[ii][0], "Y": hi.boundary[ii][1] } );
      }

      // simple brute force comparison collision detection
      //
      for (let ii=0; ii<collision_info.length; ii++) {
        let rop = [];

        let u = _clip_intersect( rop, [collision_info[ii].b], [house_data.b] );

        g_info.debug_data.push( [house_data.b] );

        if (rop.length > 0) {
          console.log("...collision...");
          _reject = true;
          break;
        }

      }

      if (_reject) { continue; }
      _stop = true;
      break;
    }

    if (_stop && (!_reject)) {
      console.log("adding...");
      house_placement.push(house_data);

      collision_info.push( {"b": house_data.b} );
    }
    else {
      console.log("rejecting!");
    }

  }

  return house_placement;
}

function place_rocks() {
  let _debug = false;

  let w = g_info.width;
  let h = g_info.height;

  let rock_placement = [];

  let _iter = 200;
  let _step_y = 10;

  let area_threshold = 10*_step_y*_step_y;

  let N = g_info.n_rock;
  for (let idx=0; idx<N; idx++) {

    let a = (_rnd() - 0.5)*Math.PI*2;
    let x_idx = Math.floor(_rnd()*4);
    let y_idx = Math.floor(_rnd()*8);
    let z_idx = Math.floor(_rnd()*3);

    let opt = {
      "x": 0,
      "y": 0,
      "a": a,
      "w": 150,
      "h": 150,
      "s": 0.5
    };

    let _px = 0;

    let _py_start = -100;

    let _py = 0;
    let _py_prv = 0;
    let ri = rock_info(x_idx, y_idx, z_idx, opt);

    let rock_data = {
      "x": _px,
      "y": _py,
      "a": a,
      "s": 0.5,
      "opt": opt,
      "x_idx" : x_idx,
      "y_idx": y_idx,
      "z_idx": z_idx,
      "b": [],
      "info": ri
    };

    _px = w/2  + (_rnd() - 0.5)*2*w/3 - 150/2;

    let _stop = false;
    let _reject = false;
    for (let _it=1; _it<_iter; _it++) {

      console.log("??");

      ri = rock_info(x_idx, y_idx, z_idx, opt);

      _py_prv = (_step_y * (_it-1)) + _py_start;
      _py = _step_y * _it + _py_start;

      //let _py = h - ri.u[1] - idx*90;


      rock_data = {
        "x": _px,
        "y": _py,
        "a": a,
        "s": 0.5,
        "opt": opt,
        "x_idx" : x_idx,
        "y_idx": y_idx,
        "z_idx": z_idx,
        "b": [],
        "info": ri
      };

      for (let ii=0; ii<ri.boundary.length; ii++) {
        ri.boundary[ii][0] += _px;
        ri.boundary[ii][1] += _py;
        rock_data.b.push( { "X": ri.boundary[ii][0], "Y": ri.boundary[ii][1] } );
      }

      if (_py > (h - ri.u[1])) {
        _stop=true;
      }

      if (_stop) { break; }

      for (let ii=0; ii<rock_placement.length; ii++) {

        let rop = [];
        let u = _clip_intersect( rop, [rock_placement[ii].b], [rock_data.b] );

        if (rop.length > 0) {

          //g_info.debug_data.push(rop);

          let _area = ClipperLib.JS.AreaOfPolygons( rop );

          if (_area < area_threshold) {
            _stop=true;
            break;
          }
          else {
            console.log("rejecting", _area);
            _reject = true;
            break;
          }
        }


      }

      if (_reject) { continue; }

      if (_stop) { break; }
      _py_prv = _py;

    }

    if (_stop && (!_reject)) {
      rock_placement.push(rock_data);
    }

    //disp_rock(ctx, x_idx, y_idx, _px, _py, opt.a, opt.s);

    //DEBUG
    //
    if (_debug) {
      let ctx = g_info.disp_ctx;
      for (let ii=0; ii<ri.boundary.length; ii++) {
        ctx.fillStyle = "rgba(255,0,0,0.9)";
        ctx.fillRect( rock_data.info.boundary[ii][0], rock_data.info.boundary[ii][1], 2, 2 );
      }
      for (let key in ri) {
        ctx.fillStyle = "rgba(0,255,255,0.05)";
        ctx.fillRect(ri[key][0] + _px, ri[key][1] + _py, 10,10);
      }
    }

  }

  //g_info.rock_placement = rock_placement;

  return rock_placement;
}

function ellipse_pos(t, rx, ry, alpha, cx, cy) {
  t = ((typeof t === "undefined") ? 0.0 : t);
  rx = ((typeof rx === "undefined") ? 1.0 : rx);
  ry = ((typeof ry === "undefined") ? 1.0 : ry);
  alpha = ((typeof alpha === "undefined") ? 0 : alpha);
  cx = ((typeof cx === "undefined") ? 0 : cx);
  cy = ((typeof cy === "undefined") ? 0 : cy);

  //console.log(t, rx, ry, alpha, cx, cy);

  let _ca = Math.cos(alpha);
  let _sa = Math.sin(alpha);

  let _ct = Math.cos(t*Math.PI*2);
  let _st = Math.sin(t*Math.PI*2);

  //console.log("ca:", _ca, "sa:", _sa, "ct:", _ct, "st:", _st);

  let x = rx*_ca*_ct - ry*_sa*_st + cx;
  let y = rx*_sa*_ct + ry*_ca*_st + cy;

  return { "X": x, "Y": y };
}

function place_boards() {
  let w = g_info.width;
  let h = g_info.height;

  let margin_w = w/12;
  let margin_h = h/12;

  let line = [];

  line.push({
    "X": _rnd()*(w - margin_w*2) + margin_w,
    "Y": _rnd()*(h - h/2) + margin_h,
  });

  line.push({
    "X": _rnd()*(w - margin_w*2) + margin_w,
    "Y": _rnd()*(h - margin_h*2) + margin_h,
  });

  let board_placement = [];

  let _img_idx = Math.floor(_rnd()*g_info.data.board.length);

  let sweep_range = ((_rnd() < 0.5) ? 0.5 : 1);
  let cx = _rnd()*(w - margin_w*2) + margin_w;
  let cy = _rnd()*(h - h/2) + margin_h;

  let ex = _rnd()*(w - margin_w)/2;
  let ey = _rnd()*(h - margin_h)/2;

  let ea = _rnd()*2*Math.PI;

  let len_approx = 4*Math.sqrt(ex*ex + ey*ey);

  //let N = g_info.n_board;
  //let N = 32;
  let N = Math.ceil(len_approx * g_info.density_board * sweep_range);

  console.log(">>>", N, ex, ey, len_approx);

  for (let idx=0; idx<N; idx++) {
    let s = (idx/(N-1));

    let _scale = 0.25;
    let _img = g_info.data.board[_img_idx];

    let xy = ellipse_pos(s*sweep_range, ex, ey, ea, cx, cy);

    let board_info = {
      "X": xy.X,
      "Y": xy.Y,
      "s": 0.25,
      "w": _scale * _img.width,
      "h": _scale * _img.height,
      "a": (_rnd()/3+ s/2) * Math.PI*2,
      "img_idx": _img_idx
    };

    board_placement.push(board_info);

  }

  return board_placement;
}

function place_windows() {
  let w = g_info.width;
  let h = g_info.height;

  let win_placement = [];

  let margin_w = w/6;
  let margin_h = h/6;

  //let cx = margin_w + (_rnd()*(w - 2*margin_w));
  //let cy = margin_h + (_rnd()*(h - 2*margin_h));
  //let r = margin_w*2;

  let sweep_range = ((_rnd() < 0.5) ? 0.5 : 1);
  let cx = _rnd()*(w - margin_w*2) + margin_w;
  let cy = _rnd()*(h - h/2) + margin_h;

  let ex = _rnd()*(w - margin_w)/2;
  let ey = _rnd()*(h - margin_h)/2;

  let ea = _rnd()*2*Math.PI;

  let len_approx = 4*Math.sqrt(ex*ex + ey*ey);

  //let N = g_info.n_window;
  let N = Math.ceil( g_info.density_window * len_approx * sweep_range );

  for (let idx=0; idx<N; idx++) {
    let s = (idx/(N-1));

    //let _scale = 0.25;
    let _img_idx = Math.floor(_rnd()*g_info.data.window.length);
    let _img = g_info.data.window[_img_idx];

    //let pos_a = Math.PI*2*_rnd();
    //let pos_r = r*_rnd();

    //let x = cx + Math.cos(pos_a)*pos_r;
    //let y = cy + Math.sin(pos_a)*pos_r;

    let xy = ellipse_pos(s, ex, ey, ea, cx, cy);

    let _scale = _rnd()*0.25 + .125;
    let _ang = _rnd()*Math.PI*2;

    let win_info = {
      //"X": x,
      //"Y": y,
      "X": xy.X,
      "Y": xy.Y,
      //"s": 0.25,
      "s": _scale,
      "w": _scale * _img.width,
      "h": _scale * _img.height,
      "a": _ang,
      "img_idx": _img_idx
    };

    win_placement.push(win_info);

  }

  g_info.window_placement = win_placement;

  return win_placement;
}

function anim_setup() {

  //---

  g_info.group.rock.push(place_rocks());
  g_info.group.board.push(place_boards());
  g_info.group.board.push(place_boards());
  g_info.group.window.push(place_windows());
  g_info.group.window.push(place_windows());

  g_info.group.house.push(place_house( g_info.group.rock[0] ));

}

function anim() {
  let _debug = false;

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

  anim_setup();


  for (let g=0; g<g_info.group.board.length; g++) {

    let board_placement = g_info.group.board[g];
    for (let i=0; i<board_placement.length; i++) {
      let _board = board_placement[i];

      ctx.save();
      ctx.globalAlpha = 0.5;

      let dx = _board.X + _board.w/2;
      let dy = _board.Y + _board.h/2;

      ctx.translate(dx, dy);
      ctx.rotate(_board.a);
      ctx.translate(-dx, -dy);

      let _img = g_info.data.board[_board.img_idx];

      ctx.drawImage(_img,
        0, 0, _img.width, _img.height,
        _board.X, _board.Y, _board.w, _board.h);

      ctx.restore();

    }
  }

  for (let g=0; g<g_info.group.window.length; g++) {

    let window_placement = g_info.group.window[g];
    for (let i=0; i<window_placement.length; i++) {
      let _win = window_placement[i];

      ctx.save();
      ctx.globalAlpha = 0.35;

      let dx = _win.X + _win.w/2;
      let dy = _win.Y + _win.h/2;

      ctx.translate(dx,dy);
      ctx.rotate(_win.a);
      ctx.translate(-dx,-dy);

      let _img = g_info.data.window[_win.img_idx];

      ctx.drawImage(_img,
        0, 0, _img.width, _img.height,
        _win.X, _win.Y, _win.w, _win.h);

      ctx.restore();

    }
  }

  for (let g=0; g<g_info.group.house.length; g++) {

    let house_placement = g_info.group.house[g];
    for (let i=0; i<house_placement.length; i++) {
      let _house = house_placement[i];

      ctx.save();

      let dx = _house.X + _house.w/2;
      let dy = _house.Y + _house.h/2;

      ctx.translate(dx,dy);
      ctx.rotate(_house.a);
      ctx.translate(-dx,-dy);

      let _img = g_info.data.house[_house.img_idx];

      ctx.drawImage(_img,
        0, 0, _img.width, _img.height,
        _house.X, _house.Y, _house.w, _house.h);

      ctx.restore();

    }
  }

  for (let g=0; g<g_info.group.rock.length; g++) {

    let rock_placement = g_info.group.rock[g];

    for (let i=0; i<rock_placement.length; i++) {
      let _rock = rock_placement[i];
      disp_rock(ctx,
        _rock.x_idx,
        _rock.y_idx,
        _rock.z_idx,
        _rock.x,
        _rock.y,
        _rock.a,
        _rock.s);

    }
  }

  // DEBUG
  //
  if (_debug) {
    for (let i=0; i<g_info.debug_data.length; i++) {
      let rop = g_info.debug_data[i];

            //ctx.fillStyle = "rgba(255,255,0,0.05)";
            ctx.fillStyle = "rgba(255,255,0,0.05)";
            ctx.beginPath();
            ctx.moveTo(rop[0][0].X, rop[0][0].Y);
            for (let _i=1; _i<rop[0].length; _i++) {
              ctx.lineTo(rop[0][_i].X, rop[0][_i].Y);
            }
            ctx.closePath();
            ctx.fill();
    }
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

}



// grid 300 x 300 pixels,
// iniital offset:
//  horizontal: 0
//  vertical: 150
//
//
// img_load_done ->
//   init_fin ->
//     calc_outline ->
//       construct_bounding_paths ->
//         trace_boundary_paths
//   

function img_load_done(x) {

  g_info.n_loaded++;

  let tot = g_info.img_location.rock.length +
            g_info.img_location.house.length +
            g_info.img_location.window.length +
            g_info.img_location.board.length;


  //if (g_info.n_loaded==g_info.img_location.rock.length) {
  if (g_info.n_loaded==tot) {
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

  for (let i=0; i<g_info.data.rock.length; i++) {
    calc_outline(g_info.data.rock[i], i);
  }



  anim();
}

function calc_outline(img, z_idx) {
  z_idx = ((typeof z_idx === "undefined") ? 0 : z_idx);

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

  ctx.fillStyle = "rgba(255,255,255,1.0)";
  ctx.fillRect(0, 0, w, h);
  ctx.clearRect(0,0,w,h);
  ctx.drawImage(img, 0, 0);

  let img_data = ctx.getImageData(0,0,w,h);

  g_info.b_img_data = img_data;

  let img_dat = img_data.data;

  let grid_w = 300;
  let grid_h = 300;
  let grid_offset_w = 0;
  let grid_offset_h = 150;

  let found_info = {};

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

  //g_info.found_info = found_info;

  construct_bounding_paths(img_data, z_idx, found_info);

  return found_info;
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
  let img = g_info.data.rock[1];

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

  for (let i=0; i<g_info.img_location.rock.length; i++) {
    let img = new Image();
    img.src = g_info.img_location.rock[i];
    img.addEventListener('load', img_load_done);
    g_info.data.rock.push(img);
  }

  for (let i=0; i<g_info.img_location.window.length; i++) {
    let img = new Image();
    img.src = g_info.img_location.window[i];
    img.addEventListener('load', img_load_done);
    g_info.data.window.push(img);
  }

  for (let i=0; i<g_info.img_location.board.length; i++) {
    let img = new Image();
    img.src = g_info.img_location.board[i];
    img.addEventListener('load', img_load_done);
    g_info.data.board.push(img);
  }

  for (let i=0; i<g_info.img_location.house.length; i++) {
    let img = new Image();
    img.src = g_info.img_location.house[i];
    img.addEventListener('load', img_load_done);
    g_info.data.house.push(img);
  }

}
