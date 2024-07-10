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
    else if (_m=line.match( '^(\\w+) *= *(\\d+) *,')) {
      cur_field_obj[ _m[1] ] = parseFloat( _m[2] );
    }

    // hacky field number value
    //
    else if (_m=line.match( '^(\\w+) *= *{ *(\\d+) *,')) {
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

async function _main() {

  for (let name in INFO.tileset) {
    g_suralos_info.tileset_img[name] = await jimp.read(INFO.tileset[name].png);
    g_suralos_info.tileset_data[name] = load_lua_dat(INFO.tileset[name].data);
  }

  for (let name in INFO.map) {
    g_suralos_info.map[name] = load_lua_dat(INFO.map[name]);
  }


  console.log("done loading");

  let tileset_name = "oceanset_outside";
  console.log(">>>", g_suralos_info.tileset_data[tileset_name].get("tile_pattern", "106_2"));

  console.log(">>>>", g_suralos_info.get(tileset_name, "tile_pattern", "106_2"));
}

_main();
