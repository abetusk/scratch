// LICENSE: CC0

var fs = require("fs");
var png = require("pngjs").PNG;

function _hxs2(x) {
  let lookup = [ "0", "1", "2", "3",
                 "4", "5", "6", "7",
                 "8", "9", "a", "b",
                 "c", "d", "e", "f" ];

  let xx = Math.floor(Math.abs(x));

  if (xx < 16) {
    return "0" + lookup[xx];
  }

  let _dig = [];


  while (xx > 0) {
    let lsd = (xx % 16);
    _dig.push( lookup[lsd] );
    xx = Math.floor( xx / 16 );
  }

  return _dig.reverse().join("");
}

//
//     3
//  2     0
//     1
//
var g_info = {
  "stride": 8,
  "supertile_dim" : [ 16, 16 ],
  "supertile_offset": [ 0, 0 ],
  "supertile_neighbor_bound" : [
    [ [8, 16], [0, 16] ],
    [ [0, 16], [8, 16] ],
    [ [0, 8],  [0, 16] ],
    [ [0, 16], [0, 8]  ]
  ],
  "oob_pxl": [128, 128, 128, 255]
};

g_info.img = png.sync.read( fs.readFileSync("img/pill_mortal_map0.png") );

function build_super_tile_lib(info) {
  let img = info.img;
  let w = img.width;
  let h = img.height;
  let n = img.data.length;
  let data = img.data;
  let stride = [info.stride, g_info.stride];

  let st_w = info.supertile_dim[0];
  let st_h = info.supertile_dim[1];
  let st_ox = info.supertile_offset[0];
  let st_oy = info.supertile_offset[1];

  let oob_pxl = info.oob_pxl;

  let supertile_lib = {};

  let supertile_count = 0;

  let nei_bnd = info.supertile_neighbor_bound;

  let n_data = w*h*4;
  for (let y=0; y<h; y+=stride[1]) {
    for (let x=0; x<w; x+=stride[0]) {
      let idx = ((w*y) + x)*4;

      let _sx = (x - st_ox);
      let _sy = (y - st_ox);

      let _nx = st_w;
      let _ny = st_h;

      let supertile_buf = [];
      let supertile_buf_str = [];
      let key_buf = [];

      let supertile_nei_buf = [ [], [], [], [] ];
      let supertile_nei_str = [ [], [], [], [] ];

      for (let ty=_sy; ty<(_sy+_ny); ty++) {

        if (ty>0) { key_buf.push(";"); }
        for (let tx=_sx; tx<(_sx+_nx); tx++) {

          if (tx>0) { key_buf.push(","); }
          let idx = ((ty*w) + tx)*4;

          let rx = tx - _sx;
          let ry = ty - _sy;

          let _pxl;

          // add indexes for neighbor pixel ribbons
          //
          let nei_list = [];
          for (let ii=0; ii<nei_bnd.length; ii++) {
            if ((rx < nei_bnd[ii][0][0]) ||
                (rx > nei_bnd[ii][0][1]) ||
                (ry < nei_bnd[ii][1][0]) ||
                (ry > nei_bnd[ii][1][1])) { continue; }
            nei_list.push(ii);
          }

          if ( (tx<0) || (tx>=w) ||
               (ty<0) || (ty>=h) ) {
            _pxl = [ oob_pxl[0], oob_pxl[1], oob_pxl[2], oob_pxl[3] ];

            /*
            supertile_buf.push( oob_pxl[0] );
            supertile_buf.push( oob_pxl[1] );
            supertile_buf.push( oob_pxl[2] );
            supertile_buf.push( oob_pxl[3] );

            supertile_buf_str.push( _hxs2(oob_pxl[0]) + ":");
            supertile_buf_str.push( _hxs2(oob_pxl[1]) + ":");
            supertile_buf_str.push( _hxs2(oob_pxl[2]) + ":");
            supertile_buf_str.push( _hxs2(oob_pxl[3]) );
            */
          }
          else {
            _pxl = [ data[idx+0], data[idx+1], data[idx+2], data[idx+3] ];

            /*
            supertile_buf.push( data[idx+0] );
            supertile_buf.push( data[idx+1] );
            supertile_buf.push( data[idx+2] );
            supertile_buf.push( data[idx+3] );

            supertile_buf_str.push( _hxs2(data[idx+0]) + ":" );
            supertile_buf_str.push( _hxs2(data[idx+1]) + ":" );
            supertile_buf_str.push( _hxs2(data[idx+2]) + ":" );
            supertile_buf_str.push( _hxs2(data[idx+3]) );
            */
          }

          for (let ii=0; ii<4; ii++) {
            supertile_buf.push(_pxl[ii]);
            supertile_buf_str.push( ((ii>0) ? ":" : "" ) + _hxs2(_pxl[ii]) );
            for (let jj=0; jj<nei_list.length; jj++) {
              let nei_idx = nei_list[jj];
              supertile_nei_buf[nei_idx].push( _pxl[ii] );
              supertile_nei_str[nei_idx].push( ((ii>0) ? ":" : "" ) + _hxs2(_pxl[ii]) );
            }

          }

        }
      }

      let st_key = supertile_buf_str.join("");
      if (!(st_key in supertile_lib)) {
        supertile_lib[ st_key ] = {
          "data": supertile_buf,
          "id": supertile_count,
          "freq": 1
        };
        supertile_count++;
      }
      else {
        supertile_lib[ st_key ].freq++;
      }

      //---
      //
      //console.log("supertile:", supertile_lib[st_key].id, supertile_lib[st_key].freq);
      let st_png = new png({ "width": st_w, "height": st_h });
      let _opt = {};
      for (let ty=0; ty<st_h; ty++) {
        for (let tx=0; tx<st_w; tx++) {
          let idx = ((ty*st_w) + tx)*4;
          st_png.data[idx+0] = supertile_buf[idx+0];
          st_png.data[idx+1] = supertile_buf[idx+1];
          st_png.data[idx+2] = supertile_buf[idx+2];
          st_png.data[idx+3] = supertile_buf[idx+3];
        }
      }
      let _buf = png.sync.write(st_png, _opt);
      fs.writeFileSync( "supertile/" + supertile_lib[st_key].id.toString() + ".png", _buf);

      //
      //---

    }

  }

  info["supertile_lib"] = supertile_lib;
  info["supertile_count"] = supertile_count;

}

function build_simple_tile_lib(info) {

  let img = info.img;

  let w = img.width;
  let h = img.height;
  let n = img.data.length;

  let data = img.data;

  let tile_count = 0;

  let pxl_lib = {};

  let stride = [info.stride, g_info.stride];

  for (let y=0; y<h; y+=stride[1]) {
    for (let x=0; x<w; x+=stride[0]) {

      let key_buf = [];
      for (let jj=0; jj<stride[1]; jj++) {
        if (jj>0) { key_buf.push(";"); }
        for (let ii=0; ii<stride[0]; ii++) {

          if (ii>0) { key_buf.push(","); }

          let idx = ((w*(y+jj) + (x+ii)))*4;

          key_buf.push( _hxs2( data[idx+0] ) + ":" );
          key_buf.push( _hxs2( data[idx+1] ) + ":" );
          key_buf.push( _hxs2( data[idx+2] ) + ":" );
          key_buf.push( _hxs2( data[idx+3] ) );
        }
      }

      let key_str = key_buf.join("");
      if (!(key_str in pxl_lib)) {
        pxl_lib[key_str] = {
          "key": key_str,
          "data": key_buf,
          "id": tile_count,
          "freq": 1
        };
        tile_count++;
      }
      else {
        pxl_lib[key_str].freq++;
      }

    }
  }

  info.pxl_lib = pxl_lib;
  info.pxl_lib_tile_count = tile_count;

}

console.log("# building simple tile lib...");
build_simple_tile_lib(g_info);

console.log("# building super tile lib...");
build_super_tile_lib(g_info);

//for (let key in g_info.pxl_lib) { console.log(g_info.pxl_lib[key].id, g_info.pxl_lib[key].freq); }
//console.log("tile_count:", g_info.pxl_lib_tile_count);

