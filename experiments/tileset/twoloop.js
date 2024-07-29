
var fs = require("fs");
var jimp = require("jimp");

let stride = [16,16];

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
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr",
  "tee_r", "tee_u", "tee_l", "tee_d",
  "cross"
];

let base_tiles = [ "empty" ];

let a_tiles = [
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr"
];

let b_tiles = [
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr"
];

let c_tiles = [
  "bend_rd", "bend_ru", "bend_lu", "bend_ld",
  "straight_ud", "straight_lr",
  "tee_r", "tee_u", "tee_l", "tee_d",
  "cross"
];

let rule_template = {
  "empty": [ ".", ".", ".", "." ],
  "bend_rd" : [ "o", ".", ".", "o" ],
  "bend_ru" : [ "o", ".", "o", "." ],
  "bend_lu" : [ ".", "o", "o", "." ],
  "bend_ld" : [ ".", "o", ".", "o" ],
  "straight_ud" : [ ".", ".", "o", "o" ],
  "straight_lr" : [ "o", "o", ".", "." ],
  "tee_r" : [ "o", ".", "o", "o" ],
  "tee_u" : [ "o", "o", "o", "." ],
  "tee_l" : [ ".", "o", "o", "o" ],
  "tee_d" : [ "o", "o", ".", "o" ],
  "cross" : [ "o", "o", "o", "o" ]
}

let gen_info = {
  //"tee_d": [ [ '.', '.', '.', '.' ], [ '.', '.', 'c', '.' ] ],
  //"tee_u": [ [ '.', '.', '.', '.' ], [ '.', '.', '.', 'c' ] ],
  //"tee_r": [ [ '.', '.', '.', '.' ], [ '.', 'c', '.', '.' ] ],
  //"tee_l": [ [ '.', '.', '.', '.' ], [ 'c', '.', '.', '.' ] ],

  "bend_rd": [ [ '.', '.', '.', '.' ], [ '.', 'c', '.', '.' ], [ '.', '.', 'c', '.' ], [ '.', 'c', 'c', '.' ] ],
  "bend_ru": [ [ '.', '.', '.', '.' ], [ '.', 'c', '.', '.' ], [ '.', '.', '.', 'c' ], [ '.', 'c', '.', 'c' ] ],
  "bend_lu": [ [ '.', '.', '.', '.' ], [ 'c', '.', '.', '.' ], [ '.', '.', '.', 'c' ], [ 'c', '.', '.', 'c' ] ],
  "bend_ld": [ [ '.', '.', '.', '.' ], [ 'c', '.', '.', '.' ], [ '.', '.', 'c', '.' ], [ 'c', '.', 'c', '.' ] ],

  "straight_ud" : [ [ '.', '.', '.', '.' ], [ 'c', '.', '.', '.' ], [ '.', 'c', '.', '.' ] ],
  "straight_lr" : [ [ '.', '.', '.', '.' ], [ '.', '.', 'c', '.' ], [ '.', '.', '.', 'c' ] ],

}

async function _main() {

  let mask_img = [
    await jimp.read("./img/mask_right.png"),
    await jimp.read("./img/mask_left.png"),
    await jimp.read("./img/mask_up.png"),
    await jimp.read("./img/mask_down.png")
  ];


  let src_tileset = await jimp.read("./img/vexed4col_1.png");

  let out_img_tile_size = [20,20];
  let _os = out_img_tile_size;
  let out_img = new jimp(_os[0]*stride[0], _os[1]*stride[1]);
  let out_pxy = [0,0];

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

  for (let key in gen_info) {
    
    let conn_a = gen_info[key];
    for (let ii=0; ii<conn_a.length; ii++) {
      let conn = conn_a[ii];

      console.log(key, ii, conn);
    }
  }

  let full_tilelist = [];

  let tile_group = [ base_tiles, a_tiles, b_tiles, c_tiles ];
  let tile_pfx = [ '', 'a_', 'b_', 'c_' ];
  let tile_base_idx = [0,0,1,2];

  for (let group_idx=0; group_idx<tile_pfx.length; group_idx++) {
    let _order = tile_group[group_idx];
    for (let tile_idx=0; tile_idx<_order.length; tile_idx++) {
      let name = _order[tile_idx];

      //console.log(_ii, name, name == "empty");

      let y_off = tile_base_idx[group_idx];

      let tile_pos = rel_map[name];

      let px = stride[0]*tile_pos[0];
      let py = stride[1]*tile_pos[1] + (y_off*stride[1]*3);

      console.log(name, px, py, "(", out_pxy, ")");

      out_img.blit(src_tileset, out_pxy[0], out_pxy[1], px, py, stride[0], stride[1]);

      out_pxy[0] += stride[0];
      if (out_pxy[0] >= (out_img_tile_size[0]*stride[0])) {
        out_pxy[0]=0;
        out_pxy[1] += stride[1];
      }

    }

  }



  out_img.write( "out.png" );

  return;

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
