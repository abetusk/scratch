// LICENSE: CC0
//
// reference:
//
// https://www.npmjs.com/package/jimp
// https://doxygen.solarus-games.org/latest/quest_map_data_file.html
//

var jimp = require("jimp");
var fs = require("fs");

var DAT = {
  "a1" : "../a1.dat",
  "a2" : "../a2.dat",
  "a3" : "../a3.dat",
  "a4" : "../a4.dat",

  "b1" : "../b1.dat",
  "b2" : "../b2.dat",
  "b3" : "../b3.dat",
  "b4" : "../b4.dat"
};

var g_suralos_info = {
  "get" : function(tileset_name, _type, _id) {
    if (!(tileset_name in this.tileset_data)) { return null; }
    return this.tileset_data[tileset_name].get(_type,_id);
  },
  "tileset_img": {},
  "tileset_data": {},
  "map" : {}
};


var INFO = {
  "tileset": {
    "oceanset_outside" :              { "png": "data/oceanset_outside.tiles.png", "data": "data/oceanset_outside.dat" },
    "outside" :                       { "png": "data/outside.tiles.png",          "data": "data/outside.dat" },
    "oceanset_inside" :               { "png": "data/oceanset_inside.tiles.png",  "data": "data/oceanset_inside.dat" },
    "house" :                         { "png": "data/house.tiles.png",            "data": "data/house.dat" },
    "cos_unique_overworld_tiles" :    { "png": "data/cos_unique_overworld_tiles.tiles.png", "data": "data/cos_unique_overworld_tiles.dat" }
  },
  "map": {
    "a1" : "data/a1.dat",
    "a2" : "data/a2.dat",
    "a3" : "data/a3.dat",
    "a4" : "data/a4.dat",

    "b1" : "data/b1.dat",
    "b2" : "data/b2.dat",
    "b3" : "data/b3.dat",
    "b4" : "data/b4.dat"
  }
}

var TILESET = {
  "oceanset_outside" : "data/oceanset_outside.tiles.png",
  "outside" : "data/outside.tiles.png",
  "oceanset_inside" : "data/oceanset_inside.tiles.png",
  "house" : "data/house.tiles.png",
  "cos_unique_overworld_tiles" : "data/cos_unique_overworld_tiles.tiles.png"
};

var IMG = {
};


function load_lua_dat(lua_dat_fn) {

  let lua_dat_str_a = fs.readFileSync(lua_dat_fn).toString().split("\n");

  let bg_color = [0,0,0];
  let cur_field_name = '';
  let cur_field_obj = {};

  let struct = {
    "get" : function(t,id) {
      let idx = this.global[t + ":" + id];
      if (typeof idx !== "number") { return null; }
      return this[t][idx];
    },
    "global": {}
  };

  for (line_no=0; line_no<lua_dat_str_a.length; line_no++) {

    let line = lua_dat_str_a[line_no];

    line = line.trim();
    if (line.length == 0) { continue; }

    let _m = null;

    //if (_m=line.match( '^background_color *\{ *(\d+), *(\d+), *(\d+) *\}$')) {
    if (_m=line.match( '^background_color *{ *(\\d+) *, *(\\d+) *, *(\\d+) *}' )) {
      bg_color[0] = parseInt(_m[1]);
      bg_color[1] = parseInt(_m[2]);
      bg_color[2] = parseInt(_m[3]);
    }

    else if (_m=line.match( '^(\\w+) *{' )) {
      cur_field_name = _m[1];
      cur_field_obj = {};
    }

    // field number value
    //
    else if (_m=line.match( '^(\\w+) *= *(-?\\d+) *,')) {
      cur_field_obj[ _m[1] ] = parseFloat( _m[2] );
    }

    // hacky field number value
    //
    else if (_m=line.match( '^(\\w+) *= *{ *(-?\\d+) *,')) {
      cur_field_obj[ _m[1] ] = parseFloat( _m[2] );
    }

    // field string value (simple)
    //
    else if (_m=line.match( '^(\\w+) *= *\"(\\w+)\" *,')) {
      cur_field_obj[ _m[1] ] = _m[2];
    }

    else if (_m=line.match( '^}' )) {
      if (!(cur_field_name in struct)) {
        struct[cur_field_name] = [];
      }

      struct.global[ cur_field_name + ":" + cur_field_obj["id"] ] = struct[cur_field_name].length;
      struct[cur_field_name].push( cur_field_obj );

      cur_field_obj = {};
    }


  }

  return struct;
}

function process_map(dat) {

  let prop = {};

  for (let idx=0; idx<dat.length; idx++) {
    let ele = dat[idx];
    if ("properties" in ele) {
      prop = ele["properties"];
      break;
    }
  }



  let outimg = new jimp(prop.width, prop.height);
  let tileset_img = IMG[prop.tileset];

  console.log(">>>", prop, outimg, tileset_img);

  for (let idx=0; idx<dat.length; idx++) {
  }
}

function blit_rep(img, src,
                  dst_x, dst_y, dst_w, dst_h,
                  src_x, src_y, src_w, src_h) {


  let end_x = dst_x + dst_w;
  let end_y = dst_y + dst_h;

  for (let _ix = dst_x; _ix < (dst_x+dst_w); _ix += src_w) {
    for (let _iy = dst_y; _iy < (dst_y+dst_h); _iy += src_h) {

      let _x = _ix;
      let _y = _iy;

      if (_x < 0) { _x = 0; }
      if (_y < 0) { _y = 0; }

      let _rel_x = _x - dst_x;
      let _rel_y = _y - dst_y;

      let _rem_x = _rel_x % src_w;
      let _rem_y = _rel_y % src_h;

      let _rel_sx = _rem_x;
      let _rel_sy = _rem_y;

      let _w = src_w - _rel_sx;
      let _h = src_h - _rel_sy;

      let _sx = src_x + _rel_sx;
      let _sy = src_y + _rel_sy;

      // if dst blit would fall of end, truncate (w,h)
      //
      if ( (_x+_w) > (dst_x+dst_w) ) { _w = (dst_x+dst_w-_x); }
      if ( (_y+_h) > (dst_y+dst_h) ) { _h = (dst_y+dst_h-_y); }

      if ((_w <= 0) || (_h <= 0)) { continue; }

      img.blit( src, _x, _y, _sx, _sy, _w, _h );
    }
  }
}


async function _main() {

  for (let name in INFO.tileset) {
    g_suralos_info.tileset_img[name] = await jimp.read(INFO.tileset[name].png);
    g_suralos_info.tileset_data[name] = load_lua_dat(INFO.tileset[name].data);

    fs.writeFileSync( "data/" + name + ".json", JSON.stringify(g_suralos_info.tileset_data[name], undefined, 2));
  }

  for (let name in INFO.map) {
    g_suralos_info.map[name] = load_lua_dat(INFO.map[name]);
  }


  let out_img_map = {};

  for (map_name in g_suralos_info.map) {

    //let map_name = "a1";
    let _map = g_suralos_info.map[map_name];

    let map_w = _map.properties[0].width;
    let map_h = _map.properties[0].height;
    let map_default_tileset = _map.properties[0].tileset;

    let out_img = new jimp(map_w, map_h);
    out_img_map[map_name] = out_img;

    for (let tile_info_idx=0; tile_info_idx<_map.tile.length; tile_info_idx++) {

      let tileset_name = map_default_tileset;

      let tile_info = _map.tile[tile_info_idx];
      if ("tileset" in tile_info) { tileset_name = tile_info.tileset; }

      let tile_pattern = g_suralos_info.get( tileset_name, "tile_pattern", tile_info.pattern );


      if (tile_pattern === null) { console.log("!!!!", tile_info); }

      let _srcimg = g_suralos_info.tileset_img[ tileset_name ];


      let dst_x = tile_info.x;
      let dst_y = tile_info.y;
      let dst_w = tile_info.width;
      let dst_h = tile_info.height;

      if (!("x" in tile_pattern)) {
        console.log("!!!!", "idx:", tile_info_idx, "...", tile_pattern);
      }

      let src_x = tile_pattern.x;
      let src_y = tile_pattern.y;
      let src_w = tile_pattern.width;
      let src_h = tile_pattern.height;

      blit_rep( out_img, _srcimg, dst_x, dst_y, dst_w, dst_h, src_x, src_y, src_w, src_h );

      //out_img.blit( _srcimg, dst_x, dst_y, src_x, src_y, src_w, src_h );

      //console.log(tile_info_idx, tile_info, tile_pattern);
      //break;
    }

    console.log("writing:", map_name + ".png");
    out_img.write("img/" + map_name + ".png");

  }

  let fin_w = 1280*2;
  let fin_h = 720 + (3*960);
  let fin_img = new jimp( fin_w, fin_h );


  fin_img.blit( out_img_map['a1'], 0,     0 );
  fin_img.blit( out_img_map['b1'], 1280,  0 );

  fin_img.blit( out_img_map['a2'], 0,     720 );
  fin_img.blit( out_img_map['b2'], 1280,  720 );

  fin_img.blit( out_img_map['a3'], 0,     720+960 );
  fin_img.blit( out_img_map['b3'], 1280,  720+960 );

  fin_img.blit( out_img_map['a4'], 0,     720+(2*960) );
  fin_img.blit( out_img_map['b4'], 1280,  720+(2*960) );

  fin_img.write("img/fin.png");

  /*
  console.log("done loading");
  let tileset_name = "oceanset_outside";
  console.log(">>>", g_suralos_info.tileset_data[tileset_name].get("tile_pattern", "106_2"));
  console.log(">>>>", g_suralos_info.get(tileset_name, "tile_pattern", "106_2"));
  */
}

_main();
