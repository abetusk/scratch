
var fs = require("fs");
var jimp = require("jimp");

let stride = [16,16];

var OUT_TILESET_FN = "vexed_twoloop.png";
var OUT_POMS_FN = "twoloop_poms.json";

let rel_map = {
  "tee_d": [0,0],
  "tee_l": [1,0],
  "tee_r": [0,1],
  "tee_u": [1,1],

  "bend_rd": [2,0],
  "bend_ru": [2,1],
  "bend_lu": [4,2],
  "bend_ld": [4,0],

  "straight_ud": [4,1],
  "straight_lr": [3,2],

  "end_r" : [2,2],
  "end_d" : [1,2],
  "end_l" : [3,1],
  "end_u" : [0,2],

  "cross": [5,0],

  "empty": [5,2]
};


let TILE_ORDER = [
  "empty",
  "end_r", "end_l", "end_u", "end_d",
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr",
  "tee_r", "tee_u", "tee_l", "tee_d",
  "cross"
];

let base_tiles = [ "empty" ];

let a_tiles = [
  "end_r", "end_l", "end_u", "end_d",
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr"
];

let b_tiles = [
  "end_r", "end_l", "end_u", "end_d",
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr"
];

let c_tiles = [
  "end_r", "end_l", "end_u", "end_d",
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr",
  "tee_r", "tee_u", "tee_l", "tee_d",
  "cross"
];

// up is down (for tiled)
//
let RULE_TEMPLATE = {
  "empty": [ ".", ".", ".", "." ],

  "end_r" : [ "o", ".", ".", "." ],
  "end_l" : [ ".", "o", ".", "." ],
  //"end_u" : [ ".", ".", "o", "." ],
  //"end_d" : [ ".", ".", ".", "o" ],
  "end_u" : [ ".", ".", ".", "o" ],
  "end_d" : [ ".", ".", "o", "." ],

  //"bend_rd" : [ "o", ".", ".", "o" ],
  //"bend_ru" : [ "o", ".", "o", "." ],
  //"bend_lu" : [ ".", "o", "o", "." ],
  //"bend_ld" : [ ".", "o", ".", "o" ],

  "bend_rd" : [ "o", ".", "o", "." ],
  "bend_ru" : [ "o", ".", ".", "o" ],
  "bend_lu" : [ ".", "o", ".", "o" ],
  "bend_ld" : [ ".", "o", "o", "." ],

  "straight_ud" : [ ".", ".", "o", "o" ],
  "straight_lr" : [ "o", "o", ".", "." ],

  //"tee_r" : [ "o", ".", "o", "o" ],
  //"tee_u" : [ "o", "o", "o", "." ],
  //"tee_l" : [ ".", "o", "o", "o" ],
  //"tee_d" : [ "o", "o", ".", "o" ],

  "tee_r" : [ "o", ".", "o", "o" ],
  "tee_u" : [ "o", "o", ".", "o" ],
  "tee_l" : [ ".", "o", "o", "o" ],
  "tee_d" : [ "o", "o", "o", "." ],

  "cross" : [ "o", "o", "o", "o" ]
}

let gen_info = {
  //"tee_d": [ [ '.', '.', '.', '.' ], [ '.', '.', 'c', '.' ] ],
  //"tee_u": [ [ '.', '.', '.', '.' ], [ '.', '.', '.', 'c' ] ],
  //"tee_r": [ [ '.', '.', '.', '.' ], [ '.', 'c', '.', '.' ] ],
  //"tee_l": [ [ '.', '.', '.', '.' ], [ 'c', '.', '.', '.' ] ],

  //"bend_rd": [ [ '.', 'c', '.', '.' ], [ '.', '.', 'c', '.' ], [ '.', 'c', 'c', '.' ] ],
  //"bend_ru": [ [ '.', 'c', '.', '.' ], [ '.', '.', '.', 'c' ], [ '.', 'c', '.', 'c' ] ],
  //"bend_lu": [ [ 'c', '.', '.', '.' ], [ '.', '.', '.', 'c' ], [ 'c', '.', '.', 'c' ] ],
  //"bend_ld": [ [ 'c', '.', '.', '.' ], [ '.', '.', 'c', '.' ], [ 'c', '.', 'c', '.' ] ],

  "bend_rd": [ [ '.', 'c', '.', '.' ], [ '.', '.', '.', 'c' ], [ '.', 'c', '.', 'c' ] ],
  "bend_ru": [ [ '.', 'c', '.', '.' ], [ '.', '.', 'c', '.' ], [ '.', 'c', 'c', '.' ] ],
  "bend_lu": [ [ 'c', '.', '.', '.' ], [ '.', '.', 'c', '.' ], [ 'c', '.', 'c', '.' ] ],
  "bend_ld": [ [ 'c', '.', '.', '.' ], [ '.', '.', '.', 'c' ], [ 'c', '.', '.', 'c' ] ],

  //"straight_ud" : [ [ 'c', '.', '.', '.' ], [ '.', 'c', '.', '.' ], ['c', 'c', '.', '.'] ],
  //"straight_lr" : [ [ '.', '.', 'c', '.' ], [ '.', '.', '.', 'c' ], ['.', '.', 'c', 'c']  ],

  "straight_ud" : [ [ 'c', '.', '.', '.' ], [ '.', 'c', '.', '.' ], ['c', 'c', '.', '.'] ],
  "straight_lr" : [ [ '.', '.', '.', 'c' ], [ '.', '.', 'c', '.' ], ['.', '.', 'c', 'c']  ],

}

function xxx() {
  /*
  for (let _ii=0; _ii<3; _ii++) {

    for (let tile_idx=0; tile_idx<order.length; tile_idx++) {
      let name = order[tile_idx];

      if ((_ii>0) && (name == "empty")) { continue; }

      //console.log(_ii, name, name == "empty");

      let tile_pos = rel_map[name];

      let px = stride[0]*tile_pos[0];
      let py = stride[1]*tile_pos[1] + (_ii*stride[1]*3);

      console.log(name, px, py, "(", out_pxy, ")");

      out_img.blit(src_tileset, out_pxy[0], out_pxy[1], px, py, stride[0], stride[1]);

      out_pxy[0] += stride[0];
      if (out_pxy[0] >= (out_img_tile_size[0]*stride[0])) {
        out_pxy[0]=0;
        out_pxy[1] += stride[1];
      }

    }

  }
  out_img.write("out.png");
  */


}

async function _main() {

  let mask_img = [
    await jimp.read("./img/mask_right.png"),
    await jimp.read("./img/mask_left.png"),
    await jimp.read("./img/mask_up.png"),
    await jimp.read("./img/mask_down.png")
  ];

  let src_tileset = await jimp.read("./img/vexed4col_1.png");

  let out_img_tile_size = [9,9];
  let _os = out_img_tile_size;
  let out_img = new jimp(_os[0]*stride[0], _os[1]*stride[1]);
  let out_pxy = [0,0];

  let full_tilelist = [];

  let tile_group = [ base_tiles, a_tiles, b_tiles, c_tiles ];
  let tile_pfx = [ '', 'a_', 'b_', 'c_' ];
  let tile_base_idx = [0,0,1,2];

  let cur_tile_id = 1;

  for (let group_idx=0; group_idx<tile_pfx.length; group_idx++) {
    let _order = tile_group[group_idx];
    for (let tile_idx=0; tile_idx<_order.length; tile_idx++) {
      let template_name = _order[tile_idx];

      name = tile_pfx[group_idx] + template_name;

      let y_off = tile_base_idx[group_idx];
      let tile_pos = rel_map[template_name];
      let px = stride[0]*tile_pos[0];
      let py = stride[1]*tile_pos[1] + (3*y_off*stride[1]);

      //console.log(template_name, name, px, py, "(", out_pxy, ")");

      out_img.blit(src_tileset, out_pxy[0], out_pxy[1], px, py, stride[0], stride[1]);

      out_pxy[0] += stride[0];
      if (out_pxy[0] >= (out_img_tile_size[0]*stride[0])) {
        out_pxy[0]=0;
        out_pxy[1] += stride[1];
      }


      let dock_template = RULE_TEMPLATE[template_name];
      let tile_dock = [ 0, 0, 0, 0 ];
      for (let idir=0; idir<4; idir++) {
        if      (dock_template[idir] == '.') { tile_dock[idir] = 0; }
        else if (dock_template[idir] == 'o') { tile_dock[idir] = group_idx; }
      }


      full_tilelist.push({"name":name, "dock":tile_dock, "id": cur_tile_id});
      cur_tile_id++;

    }

  }

  //console.log(">>>>", out_pxy);

  let join_buf = new jimp(stride[0], stride[1]);
  let mask_buf = new jimp(stride[0], stride[1]);

  for (let group_idx=0; group_idx<2; group_idx++) {

    let src_group_id = group_idx+1;
    let dst_group_id = 3;

    for (let ii=0; ii<a_tiles.length; ii++) {

      let base_name = a_tiles[ii];

      let y_off = group_idx;
      let tile_pos = rel_map[base_name];
      let px = stride[0]*tile_pos[0];
      let py = stride[1]*tile_pos[1] + (3*y_off*stride[1]);

      let c_y_off = 2;
      let c_tile_pos = rel_map["cross"];
      let c_px = stride[0]*c_tile_pos[0];
      let c_py = stride[1]*c_tile_pos[1] + (3*c_y_off*stride[1]);


      if (!(base_name in gen_info)) { continue; }

      for (let dock_idx=0; dock_idx<gen_info[base_name].length; dock_idx++) {
        let dock = gen_info[base_name][dock_idx];

        let pfx = ((group_idx==0) ? "a_" : "b_");
        let new_tile_name = pfx + base_name + "_c" + dock_idx.toString();

        let src_dock = RULE_TEMPLATE[base_name];

        //console.log(base_name, dock, src_dock, new_tile_name);

        let tile_dock = [ 0, 0, 0, 0 ];

        join_buf.blit( src_tileset, 0, 0, px, py, stride[0], stride[1] );

        for (let idir=0; idir<4; idir++) {

          if      (src_dock[idir] == '.') { tile_dock[idir] = 0; }
          else if (src_dock[idir] == 'o') { tile_dock[idir] = src_group_id; }

          if (dock[idir] == '.') { continue; }

          mask_buf.blit( src_tileset, 0,0, c_px,c_py, stride[0], stride[1] );
          mask_buf.mask( mask_img[idir], 0,0 );
          join_buf.blit( mask_buf, 0, 0 );

          //else if (src_dock[idir] == 'c') { tile_dock[idir] = dst_group_id; }

          //if      (dock[idir] == '.') { tile_dock[idir] = 0; }
          //else if (dock[idir] == 'o') { tile_dock[idir] = src_group_id; }
          if (dock[idir] == 'c') { tile_dock[idir] = dst_group_id; }


        }

        out_img.blit(join_buf, out_pxy[0], out_pxy[1], 0,0, stride[0],stride[1]);

        out_pxy[0] += stride[0];
        if (out_pxy[0] >= (out_img_tile_size[0]*stride[0])) {
          out_pxy[0]=0;
          out_pxy[1] += stride[1];
        }


        full_tilelist.push({"name":new_tile_name, "dock":tile_dock, "id":cur_tile_id});
        cur_tile_id++;

      }

    }

  }

  let rule_list = [];

  let oppo_idir = [1,0, 3,2, 5,4];

  let base_tile_id = 1;
  for (let src_tile_idx=0; src_tile_idx<full_tilelist.length; src_tile_idx++) {

    let _src = full_tilelist[src_tile_idx];
    for (let dst_tile_idx=0; dst_tile_idx<full_tilelist.length; dst_tile_idx++) {

      let _dst = full_tilelist[dst_tile_idx];

      for (let idir=0; idir<4; idir++) {
        let rdir = oppo_idir[idir];

        if (_src.dock[idir] == _dst.dock[rdir]) {
          rule_list.push([ _src.id, _dst.id, idir, 1 ]);
          //rule_list.push([ _dst.id, _src.id, rdir, 1 ]);
        }



      }

      rule_list.push( [_src.id, 0, 4, 1] );
      rule_list.push( [_src.id, 0, 5, 1] );

      rule_list.push( [0, _src.id, 4, 1] );
      rule_list.push( [0, _src.id, 5, 1] );

    }

    for (let idir=0; idir<4; idir++) {
      let rdir = oppo_idir[idir];
      if (_src.dock[idir] == 0) { rule_list.push([ _src.id, 0, idir, 1 ]); }
      if (_src.dock[idir] == 0) { rule_list.push([ 0, _src.id, rdir, 1 ]); }
    }


  }




  let tile_name = [ "." ];
  for (let ii=0; ii<full_tilelist.length; ii++) {
    //console.log("tile[", ii, "]:", JSON.stringify(full_tilelist[ii]));
    tile_name.push( full_tilelist[ii].name );
  }

  out_img.write( OUT_TILESET_FN );

  let _sz = [8,8];

  let poms = {
    "rule": rule_list,
    "name": tile_name,
    "constraint": [
      {"type":"remove", "range":{"tile":[0,1],"x":[], "y":[], "z":[]}}
    ],
    "tileset": {
      "image": OUT_TILESET_FN,
      "tilecount": full_tilelist.length,
      "imagewidth" : stride[0]*out_img_tile_size[0],
      "imageheight" : stride[1]*out_img_tile_size[1],
      "tilewidth": stride[0],
      "tileheight": stride[1]
    },
    "size" :      [_sz[0],_sz[1],1],
    "quiltSize" : [_sz[0],_sz[1],1],
    "boundaryCondition" : {
      "x+":{"type":"tile","value":0}, "x-":{"type":"tile","value":0},
      "y+":{"type":"tile","value":0}, "y-":{"type":"tile","value":0},
      "z+":{"type":"tile","value":0}, "z-":{"type":"tile","value":0}
    }
  };

  fs.writeFileSync( OUT_POMS_FN, JSON.stringify(poms, undefined, 2) );

  //console.log( JSON.stringify(poms, undefined, 2) );


  return;

}

function xxxy() {

  //----


  let test_img = new jimp(stride[0], stride[1]);
  let mask_buf = new jimp(stride[0], stride[1]);

  mask_buf.blit( src_tileset, 0,0, 0,0, 16,16 );
  mask_buf.mask( mask_img[0], 0,0 );
  test_img.blit(mask_buf, 0, 0);

  mask_buf.blit( src_tileset, 0,0, 0,16*3, 16,16 );
  mask_buf.mask( mask_img[1], 0,0 );
  test_img.blit(mask_buf, 0, 0);

  mask_buf.blit( src_tileset, 0,0, 0,16*6, 16,16 );
  mask_buf.mask( mask_img[2], 0,0 );
  test_img.blit(mask_buf, 0, 0);

  mask_buf.blit( src_tileset, 0,0, 0,16*9, 16,16 );
  mask_buf.mask( mask_img[3], 0,0 );
  test_img.blit(mask_buf, 0, 0);


  test_img.write("xxx.png");







}

_main();
