
var g_info = {
  "disp_canvas": {},
  "disp_ctx": {},

  "b_canvas": {},
  "b_ctx": {},
  "subsample": 16,
  "rock": [],
  "data": []
};

function label_corner() {
  let ctx = g_info.b_ctx;
  let dw = 4;
  for (let key in g_info.found_info) {
    let rc = g_info.found_info[key];
    ctx.fillStyle = "rgba(255,0,0,1.0)";
    ctx.fillRect(rc.c-dw/2, rc.r-dw/2, dw, dw);
  }
}

function square_cw_intersect(img_data, r, c, ds) {
  let path_choice = [
    { "sx": -ds, "sy":  ds, "dx":  1, "dy":  0, "ex":  ds, "ey":  ds },
    { "sx":  ds, "sy":  ds, "dx":  0, "dy": -1, "ex":  ds, "ey": -ds },
    { "sx":  ds, "sy": -ds, "dx": -1, "dy":  0, "ex": -ds, "ey": -ds },
    { "sx": -ds, "sy": -ds, "dx":  0, "dy":  1, "ex": -ds, "ey":  ds }
  ];

  let w = img_data.width;
  let h = img_data.height;
  let pix_dat = img_data.data;

  let _max = w*h*4;

  let pidx=0;
  let pc = path_choice[pidx];
  let x = pc.sx;
  let y = pc.sy;
  let dx = pc.dx;
  let dy = pc.dy;

  let found = false;
  for (; pidx<path_choice.length; pidx++) {
    let pc = path_choice[pidx];
    x = pc.sx;
    y = pc.sy;
    dx = pc.dx;
    dy = pc.dy;

    for (; (x!=pc.ex) || (y!=pc.ey); x += pc.dx, y += pc.dy ) {
      let idx = ((r+y)*w + (c+x))*4;

      if ((idx<0) || (idx>=_max)) { continue; }
      if (pix_dat[idx+3] == 0) {
        found=true;
        break;
      }
    }

    if (found) { break; }
  }

  if (!found) { return [-1,-1]; }

  found = false;

  let pidx_s = pidx;
  for (let _pidx=pidx_s; _pidx<(pidx_s+path_choice.length); _pidx++) {
    let pidx = (_pidx%path_choice.length);
    let pc = path_choice[pidx];

    if (_pidx != pidx_s) {
      x = pc.sx;
      y = pc.sy;
      dx = pc.dx;
      dy = pc.dy;
    }

    for (; (x!=pc.ex) || (y!=pc.ey); x += pc.dx, y += pc.dy ) {
      let idx = ((r+y)*w + (c+x))*4;

      if ((idx<0) || (idx>=_max)) { continue; }
      if (pix_dat[idx+3] != 0) {
        found=true;
        break;
      }
    }

    if (found) { break; }
  }

  if (!found) { return [-1,-1]; }

  return [ r+y, c+x ];
}

function construct_bounding_paths() {
  let img_data = g_info.b_img_data;
  let img_dat = img_data.data;

  let subdiv = g_info.subsample;
  for (let key in g_info.found_info) {
    let rc = g_info.found_info[key];
    let raw_path = trace_boundary_path(img_data, rc.c, rc.r);

    let sub_path = [];
    for (let i=0; i<raw_path.length; i+= subdiv) {
      sub_path.push( {"x": raw_path[i][0], "y":raw_path[i][1] } );
    }

    g_info.rock.push({"p":sub_path});
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
  
  ctx.save();

  ctx.translate(dst_x+dst_w/2, dst_y+dst_h/2);
  ctx.rotate(a);
  ctx.translate(-dst_x-dst_w/2, -dst_y-dst_h/2);

  ctx.drawImage(g_info.data[0],
    src_x, src_y, src_w, src_h,
    dst_x, dst_y, dst_w, dst_h);

  ctx.restore();
  
}

// grid 300 x 300 pixels,
// iniital offset:
//  horizontal: 0
//  vertical: 150
//

function img_load_done(x) {
  let img = g_info.data[0];

  let w = img.width;
  let h= img.height;

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

  let disp_canvas = document.getElementById("canvas");
  disp_canvas.width = w;
  disp_canvas.height = h;
  let disp_ctx = disp_canvas.getContext("2d");
  disp_ctx.width = w;
  disp_ctx.height = h;

  g_info.disp_canvas = disp_canvas;
  g_info.disp_ctx = disp_ctx;
  //uu();

  for (let i=0; i<4; i++) {
    for (let j=0; j<8; j++) {
      let a = (i/4)*(j/8)*Math.PI;
      disp_rock(g_info.disp_ctx, i, j, 140*i, 140*j, a, 0.5, true);

    }
  }

  //disp_ctx.drawImage(img, 0, 0);
  //disp_ctx.drawImage(g_info.data[0], 0, 0);
    //src_x, src_y, src_w, src_h,
    //dst_x, dst_y, dst_w, dst_h);


  //uu();
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
