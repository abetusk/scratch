
var g_info = {
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

  let ctx = g_info.b_ctx;

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

      ctx.fillStyle = "rgba(255,0,255,1.0)";
      ctx.fillRect(c+x, r+y, 1, 1);

      if (pix_dat[idx+3] == 0) {
        ctx.fillStyle= "rgba(0,255,0,1.0)";
        ctx.fillRect(c+x, r+y, 3, 3);
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

      ctx.fillStyle = "rgba(255,0,255,1.0)";
      ctx.fillRect(c+x, r+y, 1, 1);

      if (pix_dat[idx+3] != 0) {
        ctx.fillStyle= "rgba(0,0,255,1.0)";
        ctx.fillRect(c+x, r+y, 3, 3);
        found=true;
        break;
      }
    }

    if (found) { break; }
  }

  if (!found) { return [-1,-1]; }

  return [ r+y, c+x ];

}

function rect_path(ctx,p) {
  for (let i=0; i<p.length; i++) {
    ctx.fillStyle = "rgba(255,0,255,1.0)";
    ctx.fillRect(p[i].x, p[i].y, 3, 3);
  }
}

function construct_bounding_paths() {
  let ctx = g_info.b_ctx;
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

    rect_path(ctx, sub_path);
  }

  console.log("done");
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

  //DEBUG
  let ctx = g_info.b_ctx;
  //DEBUG

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

    //DEBUG
    //ctx.fillStyle = "rgba(255,0,0,1.0)";
    //ctx.fillRect(cur_c, cur_r, 3, 3);

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



function fufu() {
  let img = g_info.data[0];

  let w = img.width;
  let h = img.height;

  let canvas = g_info.b_canvas;
  let ctx = g_info.b_ctx;

  let grid_w = 300;
  let grid_h = 300;
  let grid_offset_w = 0;
  let grid_offset_h = 150;

  let count1 = 0;


  let img_data = g_info.b_img_data;
  let img_dat = img_data.data;

  for (let gr=grid_offset_h; gr<(h); gr+=grid_h) {
    for (let gc=grid_offset_w; gc<(w); gc+=grid_w) {

      for (let jj=0; jj<grid_h; jj++) {
        for (let ii=0; ii<grid_w; ii++) {
          let _c = gc + ii;
          let _r = gr + jj;
          let idx = 4*(_c + w*_r);
          for (let p=0; p<4; p++) {
            if (img_dat[idx+p] != 0) {
              count1++;
            }
          }

        }
      }


      let found=false;
      let pilot_r = -1, pilot_c = -1;

      for (let idx=0; idx<grid_w; idx++) {
        let _c = gc + idx;
        let _r = gr + idx;

        if ((_c >= w) || (_r >= h)) { continue; }
        let pix_idx = 4*(_c + _r*w);

        console.log(">>", _r, _c, 4*(_c + _r*w), "(", w, ")", img_dat[pix_idx], img_dat[pix_idx+1], img_dat[pix_idx+2], img_dat[pix_idx+3]);



        if (img_dat[pix_idx+1] != 0) {

          console.log(">>", gr, gc, _r, _c, pix_idx, img_dat[pix_idx]);

          found=true;
          pilot_r = _r;
          pilot_c = _c;
          break;
        }
        else {
          //console.log(img_dat[pix_idx], img_dat[pix_idx+1], img_dat[pix_idx+2], img_dat[pix_idx+2]);

          //img_dat[pix_idx+0] = 128;
          //img_dat[pix_idx+1] = 0;
          //img_dat[pix_idx+2] = 0;
          //img_dat[pix_idx+3] = 255;
        }


      }

      if (found) {
        console.log("FOUND", gr, gc, pilot_r, pilot_c);
      }
      else {
        console.log("not found", gr, gc);
      }

    }
  }

  ctx.putImageData(img_data, 0, 0);

  console.log("count1", count1);

}

// grid 300 x 300 pixels,
// iniital offset:
//  horizontal: 0
//  vertical: 150
//

function img_load_done(x) {
  console.log("done", x);

  console.log(g_info.data[0]);

  let img = g_info.data[0];

  let w = img.width;
  let h= img.height;

  //let canvas = document.createElement("canvas");
  let canvas = document.getElementById("canvas");
  canvas.width = w;
  canvas.height = h;
  let ctx = canvas.getContext("2d");
  ctx.width = w;
  ctx.height = h;

  g_info.b_canvas = canvas;
  g_info.b_ctx = ctx;

  ctx.drawImage(img, 0, 0);

  //let img_data = ctx.createImageData(w,h);
  let img_data = ctx.getImageData(0,0,w,h);

  g_info.b_img_data = img_data;

  console.log(img_data);

  let img_dat = img_data.data;

  let count=0;
  /*
  for (let i=0; i<img_dat.length; i++) {
    if (img_dat[i] != 0) {
      count++;
      //img_dat[i] = 128;
    }
  }
  */


  console.log(count);

  let grid_w = 300;
  let grid_h = 300;
  let grid_offset_w = 0;
  let grid_offset_h = 150;

  let count1 = 0;

  let found_info = {};

  for (let gr=grid_offset_h; gr<(h); gr+=grid_h) {
    for (let gc=grid_offset_w; gc<(w); gc+=grid_w) {

      /*
      for (let jj=0; jj<grid_h; jj++) {
        for (let ii=0; ii<grid_w; ii++) {
          let _c = gc + ii;
          let _r = gr + jj;
          let idx = 4*(_c + w*_r);
          for (let p=0; p<4; p++) {
            if (img_dat[idx+p] != 0) {
              count1++;
              //img_dat[idx+p] = 128;
            }
          }
        }
      }
      */


      let found=false;
      let pilot_r = -1, pilot_c = -1;

      for (let idx=0; idx<grid_w; idx++) {
        let _c = gc + idx;
        let _r = gr + idx;

        if ((_c >= w) || (_r >= h)) { continue; }
        let pix_idx = 4*(_c + _r*w);

        //console.log(">>", _r, _c, 4*(_c + _r*w), "(", w, ")", img_dat[pix_idx], img_dat[pix_idx+1], img_dat[pix_idx+2], img_dat[pix_idx+3]);

        if (img_dat[pix_idx+3] != 0) {

          //console.log(">>", gr, gc, _r, _c, pix_idx, img_dat[pix_idx], img_dat[pix_idx+1], img_dat[pix_idx+2], img_dat[pix_idx+3]);

          found_info[pix_idx] = {"r": _r, "c": _c };

          found=true;
          pilot_r = _r;
          pilot_c = _c;
          break;
        }
        else {
          //console.log(img_dat[pix_idx], img_dat[pix_idx+1], img_dat[pix_idx+2], img_dat[pix_idx+2]);

          //img_dat[pix_idx+0] = 128;
          //img_dat[pix_idx+1] = 0;
          //img_dat[pix_idx+2] = 0;
          //img_dat[pix_idx+3] = 255;
        }


      }

      if (found) {
        //console.log("FOUND", gr, gc, pilot_r, pilot_c);
      }
      else {
        //console.log("not found", gr, gc);
      }

    }
  }

  //ctx.putImageData(img_data, 0, 0);

  //DEBUG
  //ctx.putImageData(img_data, 0, 0);
  //return;

  g_info.found_info = found_info;

  console.log("count1", count1);

  construct_bounding_paths();

}

function init() {
  console.log("ok");

  let img = new Image();
  img.src = "img/Tinyrocks_l2_1.png";
  img.addEventListener('load', img_load_done);

  g_info.data.push(img);
}
