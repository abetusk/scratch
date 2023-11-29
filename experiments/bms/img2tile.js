// LICENSE: CC0

var DEBUG = false;

var fs = require("fs");
var PNG = require("pngjs").PNG;

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
//         (+y)
//          2
//  (-x) 1     0 (+x)
//          3
//         (-y)
//
var g_info = {
  "stride": 8,
  "supertile_dim" : [ 16, 16 ],
  "supertile_offset": [ 0, 0 ],
  "supertile_neighbor_bound" : [
    [ [8, 16], [0, 16] ],
    [ [0, 8],  [0, 16] ],
    [ [0, 16], [0, 8]  ],
    [ [0, 16], [8, 16] ]
  ],
  "opposite_dir": [ 1, 0, 3, 2 ],
  "oob_pxl": [128, 128, 128, 255],

  "example_fn" : "img/pill_mortal_map0.png",
  "supertile_dir" : ".out/supertile"
};

//g_info.img = PNG.sync.read( fs.readFileSync("img/pill_mortal_map0.png") );
g_info.img = PNG.sync.read( fs.readFileSync(g_info.example_fn) );

function build_null_tile(info) {
  let img = info.img;
  let w = img.width;
  let h = img.height;
  let stride = [info.stride, g_info.stride];

  let st_w = info.supertile_dim[0];
  let st_h = info.supertile_dim[1];
  let st_ox = info.supertile_offset[0];
  let st_oy = info.supertile_offset[1];

  let oob_pxl = info.oob_pxl;
  let nei_bnd = info.supertile_neighbor_bound;

  let supertile_buf = [];
  let supertile_buf_str = [];
  let key_buf = [];

  let supertile_nei_buf = [ [], [], [], [] ];
  let supertile_nei_str = [ [], [], [], [] ];

  let nei_key_map = {};

  let supertile_count = info["supertile_count"];
  let supertile_key = info["supertile_key"];
  let supertile_lib = info["supertile_lib"];

  for (let y=0; y<st_h; y++) {

    for (let x=0; x<st_w; x++) {

      if (x>0) { key_buf.push(","); }
      let idx = ((y*w) + x)*4;

      let _pxl;
      let nei_pfx_char = [ "", "", "", "" ];

      // add indexes for neighbor pixel ribbons
      //
      let nei_list = [];
      for (let ii=0; ii<nei_bnd.length; ii++) {

        if ((x <  nei_bnd[ii][0][0]) ||
            (x >= nei_bnd[ii][0][1]) ||
            (y <  nei_bnd[ii][1][0]) ||
            (y >= nei_bnd[ii][1][1])) { continue; }
        nei_list.push(ii);

        // we want ';' at row breaks and ',' between
        // string representation of pixels
        //
        if ((x == nei_bnd[ii][0][0]) &&
            (y >  nei_bnd[ii][1][0])) {
          nei_pfx_char[ii] = ";\n";
        }
        else if (x > nei_bnd[ii][0][0]) { nei_pfx_char[ii] = ","; }

      }

      _pxl = [ oob_pxl[0], oob_pxl[1], oob_pxl[2], oob_pxl[3] ];

      for (let ii=0; ii<4; ii++) {
        supertile_buf.push(_pxl[ii]);
        supertile_buf_str.push( ((ii>0) ? ":" : "" ) + _hxs2(_pxl[ii]) );
        for (let jj=0; jj<nei_list.length; jj++) {
          let nei_idx = nei_list[jj];
          //if (ii==0) { supertile_nei_str[nei_idx].push( nei_pfx_char[ii] ); }
          if (ii==0) { supertile_nei_str[nei_idx].push( nei_pfx_char[nei_idx] ); }
          supertile_nei_buf[nei_idx].push( _pxl[ii] );
          supertile_nei_str[nei_idx].push( ((ii>0) ? ":" : "" ) + _hxs2(_pxl[ii]) );
        }

      }

    }
  }

  let st_key = supertile_buf_str.join("");

  let nei_key_str = [];
  for (let ii=0; ii<supertile_nei_str.length; ii++) {
    nei_key_str.push( supertile_nei_str[ii].join("") );
  }

  supertile_key.push(st_key);
  supertile_lib[ st_key ] = {
    "nei_buf": supertile_nei_buf,
    "nei_key": nei_key_str,
    "data": supertile_buf,
    "id": 0,
    "freq": 1
  };

  //DEBUG
  console.log("adding st_key (null):");
  console.log(st_key);

  for (let ii=0; ii<nei_bnd.length; ii++) {
    let nei_key = supertile_nei_str[ii].join("");
  }

  info.supertile_count++;

}

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

  // we force a 'null' tile with id of 0
  //
  let supertile_count = 0;
  let supertile_key = [];
  let supertile_lib = {};

  info["supertile_count"] = supertile_count;
  info["supertile_key"] = supertile_key;
  info["supertile_lib"] = supertile_lib;


  let nei_bnd = info.supertile_neighbor_bound;

  let map_w = Math.floor(w / stride[0]);
  let map_h = Math.floor(h / stride[1]);
  let map_array = Array(map_w*map_h).fill(-1);

  build_null_tile(info);
  supertile_count = info["supertile_count"];

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

      let nei_key_map = {};

      for (let ty=_sy; ty<(_sy+_ny); ty++) {

        if (ty>0) { key_buf.push(";"); }
        for (let tx=_sx; tx<(_sx+_nx); tx++) {

          if (tx>0) { key_buf.push(","); }
          let idx = ((ty*w) + tx)*4;

          let rx = tx - _sx;
          let ry = ty - _sy;

          let _pxl;

          let nei_pfx_char = [ "", "", "", "" ];

          // add indexes for neighbor pixel ribbons
          //
          let nei_list = [];
          for (let ii=0; ii<nei_bnd.length; ii++) {


            if ((rx < nei_bnd[ii][0][0]) ||
                (rx >= nei_bnd[ii][0][1]) ||
                (ry < nei_bnd[ii][1][0]) ||
                (ry >= nei_bnd[ii][1][1])) { continue; }
            nei_list.push(ii);

            // we want ';' at row breaks and ',' between
            // string representation of pixels
            //
            if ((rx == nei_bnd[ii][0][0]) &&
                (ry > nei_bnd[ii][1][0])) {
              nei_pfx_char[ii] = ";\n";
            }
            else if (rx > nei_bnd[ii][0][0]) { nei_pfx_char[ii] = ","; }
            //else  { nei_pfx_char[ii] = ""; }

          }

          if ( (tx<0) || (tx>=w) ||
               (ty<0) || (ty>=h) ) {
            _pxl = [ oob_pxl[0], oob_pxl[1], oob_pxl[2], oob_pxl[3] ];
          }
          else {
            _pxl = [ data[idx+0], data[idx+1], data[idx+2], data[idx+3] ];
          }

          for (let ii=0; ii<4; ii++) {
            supertile_buf.push(_pxl[ii]);
            supertile_buf_str.push( ((ii>0) ? ":" : "" ) + _hxs2(_pxl[ii]) );
            for (let jj=0; jj<nei_list.length; jj++) {
              let nei_idx = nei_list[jj];
              //if (ii==0) { supertile_nei_str[nei_idx].push( nei_pfx_char[ii] ); }
              if (ii==0) { supertile_nei_str[nei_idx].push( nei_pfx_char[nei_idx] ); }
              supertile_nei_buf[nei_idx].push( _pxl[ii] );
              supertile_nei_str[nei_idx].push( ((ii>0) ? ":" : "" ) + _hxs2(_pxl[ii]) );
            }

          }

        }
      }

      let st_key = supertile_buf_str.join("");

      if (!(st_key in supertile_lib)) {

        let nei_key_str = [];
        for (let ii=0; ii<supertile_nei_str.length; ii++) {
          nei_key_str.push( supertile_nei_str[ii].join("") );
        }

        supertile_key.push(st_key);
        supertile_lib[ st_key ] = {
          "nei_buf": supertile_nei_buf,
          "nei_key": nei_key_str,
          "data": supertile_buf,
          "id": supertile_count,
          "freq": 1
        };
        supertile_count++;


        for (let ii=0; ii<nei_bnd.length; ii++) {
          let nei_key = supertile_nei_str[ii].join("");
        }
      }
      else {
        supertile_lib[ st_key ].freq++;
      }

      // create map
      //
      //
      let _m_x = Math.floor(x / stride[0]);
      let _m_y = Math.floor(y / stride[1]);
      let _m_id = supertile_lib[st_key].id;
      map_array[ _m_y*map_w + _m_x ] = _m_id;


      //---
      //
      //console.log("supertile:", supertile_lib[st_key].id, supertile_lib[st_key].freq);

      let _odir = info.supertile_dir;

      let st_png = new PNG({ "width": st_w, "height": st_h });
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
      let _buf = PNG.sync.write(st_png, _opt);
      //fs.writeFileSync( "supertile/" + supertile_lib[st_key].id.toString() + ".png", _buf);
      fs.writeFileSync( _odir + "/" + supertile_lib[st_key].id.toString() + ".png", _buf);
      //
      //---

    }

  }

  let supertile_adj_map = {};
  let supertile_adj_list = [];
  for (let st_idx=0; st_idx < supertile_count; st_idx++) {
    let st_key = supertile_key[st_idx];

    let st_info = supertile_lib[ st_key ];
    let st_nei_key = st_info.nei_key;

    for (let dir_idx=0; dir_idx<st_nei_key.length; dir_idx++) {

      if (!(st_nei_key in supertile_adj_map)) {
        supertile_adj_map[st_nei_key] = {
          "tileBoundaryDir" : { dir_idx : 1 }
        };
      }

    }
  }

  let name_list = [];
  let adj_list = [];

  for (let st_idx=0; st_idx < supertile_count; st_idx++) {
    name_list.push( [ st_idx, st_idx ] );
  }

  // construct adjacency matrix
  //
  for (let st_a_idx=0; st_a_idx < supertile_count; st_a_idx++) {
    for (let st_b_idx=0; st_b_idx < supertile_count; st_b_idx++) {

      let st_a_key  = supertile_key[st_a_idx];
      let st_a_info = supertile_lib[st_a_key];

      let st_b_key  = supertile_key[st_b_idx];
      let st_b_info = supertile_lib[st_b_key];

      for (let dir_idx=0; dir_idx<nei_bnd.length; dir_idx++) {

        let oppo_dir_idx = info.opposite_dir[dir_idx];

        let dir_code = [ ">", "<", "^", "v" ];
        let _d0 = dir_code[dir_idx];
        let _d1 = dir_code[oppo_dir_idx];

        if ( st_a_info.nei_key[dir_idx] == st_b_info.nei_key[oppo_dir_idx] ) {
          adj_list.push( [ st_a_idx, st_b_idx, dir_idx, 1 ] );

          if (DEBUG) {
            console.log("a[" + _d0  +  "]:", st_a_idx, "-> b[" + _d1 + "]:", st_b_idx);
          }
        }
        //if ( st_a_info.nei_key[oppo_dir_idx] == st_b_info.nei_key[dir_idx] ) {
        //  console.log("a[" + _d1 +  "]:", st_a_idx, "<- b[" +  _d0 + "]:", st_b_idx);
        //}

      }

    }
  }

  if (DEBUG) {
    console.log("\n\n");
    console.log("#NAME");
    console.log("#tile_id,tile_name");
    for (let ii=0; ii<name_list.length; ii++) {
      console.log( name_list[ii].join(",") );
    }


    console.log("\n\n");
    console.log("#RULE");
    console.log("#atile,btile,diridx,weight");
    for (let ii=0; ii<adj_list.length; ii++) {
      console.log( adj_list[ii].join(",") );
    }
  }


  info["supertile_key"] = supertile_key;
  info["supertile_lib"] = supertile_lib;
  info["supertile_count"] = supertile_count;
  info["tile_rule"] = adj_list;
  info["tile_name"] = name_list;

  info["map_w"] = map_w;
  info["map_h"] = map_h;
  info["map_array"] = map_array;

  //DEBUG
  console.log("------", map_w, map_h);
  for (let _y=0; _y<map_h; _y++) {
    let row_a = [];
    for (let _x=0; _x<map_w; _x++) {
      row_a.push(map_array[ _y*map_w + _x ]);
    }
    console.log(row_a.join(","));
  }
  console.log("------");

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

function build_tilemap(info) {
  let tile_count = info.supertile_count;
  let oob_pxl = info.oob_pxl;

  let stride = [info.stride, info.stride];
  let N = Math.ceil( Math.sqrt( tile_count ) );

  let _png = new PNG({
    "width": stride[0]*N,
    "height": stride[1]*N
  });


  let data = _png.data;

  let pxl_w = stride[0]*N;
  let pxl_h = stride[1]*N;

  let tile_id = 0;
  for (let y=0; y<N; y++) {
    for (let x=0; x<N; x++, tile_id++) {

      if (tile_id >= tile_count) {
        for (let dy=0; dy<stride[1]; dy++) {
          for (let dx=0; dx<stride[0]; dx++) {
            let png_idx = (((y*stride[1])+dy)*pxl_w + ((x*stride[0])+dx))*4;
            data[png_idx+0] = oob_pxl[0];
            data[png_idx+1] = oob_pxl[1];
            data[png_idx+2] = oob_pxl[2];
            data[png_idx+3] = oob_pxl[3];
          }
        }

        continue;
      }

      let st_key = info.supertile_key[tile_id];
      let tile_dat = info.supertile_lib[ st_key ].data;

      let st_sx = info.supertile_offset[0];
      let st_sy = info.supertile_offset[1];
      let st_w = info.supertile_dim[0];
      let st_h = info.supertile_dim[1];

      for (let dy=0; dy<stride[1]; dy++) {
        for (let dx=0; dx<stride[0]; dx++) {

          let png_idx = (((y*stride[1])+dy)*pxl_w + ((x*stride[0])+dx))*4;
          let st_idx = ( ((st_sy + dy)*st_w) + (st_sx + dx) )*4;

          data[png_idx+0] = tile_dat[st_idx+0];
          data[png_idx+1] = tile_dat[st_idx+1];
          data[png_idx+2] = tile_dat[st_idx+2];
          data[png_idx+3] = tile_dat[st_idx+3];

        }
      }

    }
  }

  info["tilemap_png"] = _png;
}

function write_tilemap_png(info, out_fn) {
  let _opt = {};
  let _buf = PNG.sync.write(info.tilemap_png, _opt);
  fs.writeFileSync( out_fn, _buf);
}

function write_tiled_json(info, out_fn) {

  let stride = [ info.stride, info.stride ];

  let template = {
    "backgroundcolor":"#ffffff",
    "height": -1, // ****
    "width": -1, // ****
    "layers": [
      {
        "data": [], // ****
        "width":-1, // ****
        "height":-1, // ***
        "x":0,
        "y":0,
        "name": "main",
        "opacity": 1,
        "type":"tilelayer",
        "visible":true
      }
    ],
    "nextobjectid":1,
    "orientation": "orthogonal",
    "properties":[],
    "renderorder": "right-down",
    "tileheight": -1, // ****
    "tilewidth": -1, // ****
    "tilesets": [{
      "columns": -1, // ****
      "image": "", // ****
      "imageheight": -1, // ****
      "imagewidth": -1, // ****
      "tilecount": -1, // ****
      "tileheight": -1, // ****
      "tilewidth": -1, // ****
      "margin": 0,
      "spacing": 0,
      "name": "tileset",
      "firstgid": 1
    }],
    "version": 1
  };

  template.width = info.map_w;
  template.height = info.map_h;
  template.tileheight = stride[1];
  template.tilewidth = stride[0];

  //template.layers[0].data = info.

  template.tilesets[0].image = ".out/tilemap.png";
  template.tilesets[0].tileheight = stride[1];
  template.tilesets[0].tilewidth = stride[0];
  template.tilesets[0].tilecount = info.supertile_count-1;
  template.tilesets[0].columns = info.map_w;
  template.tilesets[0].rows = info.map_w;



}

console.log("# building simple tile lib...");
build_simple_tile_lib(g_info);

console.log("# building super tile lib...");
build_super_tile_lib(g_info);

console.log("# building tilemap...");
build_tilemap(g_info);

console.log("# writing tilemap 'tilemap.png'");
write_tilemap_png(g_info, ".out/tilemap.png");

if (DEBUG) {
  let st_lib = g_info.supertile_lib;
  for (let key in st_lib) {
    console.log(">>>", st_lib[key].id);
    for (let ii=0; ii<st_lib[key].nei_key.length; ii++) {
      console.log("[", ii, "]:\n", st_lib[key].nei_key[ii]);
    }
  }
}



//for (let key in g_info.pxl_lib) { console.log(g_info.pxl_lib[key].id, g_info.pxl_lib[key].freq); }
//console.log("tile_count:", g_info.pxl_lib_tile_count);

