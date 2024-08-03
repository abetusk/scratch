// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


// output:
// - vexed_twoloop.png
// - twoloop_poms.json
//
//
// Create a local rule tileset that replicates the "Loop Constraint"
// functionality in DeBroglie (https://github.com/BorisTheBrave/DeBroglie/blob/master/docs/articles/path_constraints.md)
// using only nearest neighbor tile rules and tileset.
//


var fs = require("fs");
var jimp = require("jimp");

let STRIDE = [16,16];

var OUT_TILESET_FN = "vexed_acylic.png";
var OUT_POMS_FN = "acyclic_poms.json";

let REL_MAP = {
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

// up is down (for tiled)
//
let RULE_TEMPLATE = {
  "empty": [ ".", ".", ".", "." ],

  "end_r" : [ "o", ".", ".", "." ], "end_l" : [ ".", "o", ".", "." ],
  "end_u" : [ ".", ".", ".", "o" ], "end_d" : [ ".", ".", "o", "." ],

  "bend_rd" : [ "o", ".", "o", "." ], "bend_ru" : [ "o", ".", ".", "o" ],
  "bend_lu" : [ ".", "o", ".", "o" ], "bend_ld" : [ ".", "o", "o", "." ],

  "straight_ud" : [ ".", ".", "o", "o" ], "straight_lr" : [ "o", "o", ".", "." ],

  "tee_r" : [ "o", ".", "o", "o" ], "tee_u" : [ "o", "o", ".", "o" ],
  "tee_l" : [ ".", "o", "o", "o" ], "tee_d" : [ "o", "o", "o", "." ],

  "cross" : [ "o", "o", "o", "o" ]
}

let LEVEL_TEMPLATE = {
  "end_r_p" : [ "p$$", ".", ".", "." ],
  "end_l_p" : [ ".", "p$$", ".", "." ],
  "end_u_p" : [ ".", ".", ".", "p$$" ],
  "end_d_p" : [ ".", ".", "p$$", "." ],

  "end_r_q" : [ "q$$", ".", ".", "." ],
  "end_l_q" : [ ".", "q$$", ".", "." ],
  "end_u_q" : [ ".", ".", ".", "q$$" ],
  "end_d_q" : [ ".", ".", "q$$", "." ],

  "bend_rd_p" : [ "p$$", ".", "q$$", "." ],
  "bend_rd_q" : [ "q$$", ".", "p$$", "." ],

  "bend_ru_p" : [ "p$$", ".", ".", "q$$" ],
  "bend_ru_q" : [ "q$$", ".", ".", "p$$" ],

  "bend_lu_p" : [ ".", "p$$", ".", "q$$" ],
  "bend_lu_q" : [ ".", "q$$", ".", "p$$" ],

  "bend_ld_p" : [ ".", "p$$", "q$$", "." ],
  "bend_ld_q" : [ ".", "q$$", "p$$", "." ],

  "straight_ud_p" : [ ".", ".", "p$$", "q$$" ],
  "straight_ud_q" : [ ".", ".", "q$$", "p$$" ],

  "straight_lr_p" : [ "p$$", "q$$", ".", "." ],
  "straight_lr_q" : [ "q$$", "p$$", ".", "." ]
};


//---
//
// output name:
//
// <type>_<subtype>_[pq](\d+)_D(\d+)
//
// for example:
//
//   bend_rd_q0_D3
//   |    |  |  |
//   |    |  |  .- 4th branch dock
//   |    |  |
//   |    |  .---- p/q parity dock, 0th level
//   |    |
//   |    .------- subtype (right/down)
//   |
//   .------------ type (bend)
//
//
function create_acyclic_level_tiles(template, cur_id, nxt_id) {

  let out = [ ];

  for (let key in template) {

    let _dock = template[key];

    let empty_count = 0;
    let empty_pos = [];

    let tmp_dock = [];
    for (let idir=0; idir<4; idir++) {
      let v = _dock[idir].replace( '$$', cur_id.toString() );
      tmp_dock.push(v);

      if (v == '.') {
        empty_pos.push(idir);
        empty_count++;
      }
    }

    if (nxt_id < 0) {
      let sfx = cur_id.toString() + "_" + "D0";
      out.push({"name": key + sfx, "dock": tmp_dock});
      continue;
    }

    for (bcount=0; bcount < (1<<empty_count); bcount++) {

      let v = [];

      let cur_dock = [];
      for (let _pos=0; _pos<tmp_dock.length; _pos++) {
        cur_dock.push(tmp_dock[_pos]);
      }

      for (let bpos=0; bpos<empty_pos.length; bpos++) {
        let _val = ((bcount & (1<<bpos))  ? 1 : 0);

        if (_val != 0) {
          cur_dock[ empty_pos[bpos] ] = 'p' + nxt_id.toString();
        }
      }

      let sfx = cur_id.toString() + "_" + "D" + bcount;
      out.push({"name": key + sfx, "dock": cur_dock });

    }

  }

  return out;

}

async function _main() {

  let l_list = [];
  let full_tilelist = [
    {"name":"0", "dock":["*", "*", "*", "*"], "id":0},
    {"name":"empty", "dock":[".", ".", ".", "."], "id":1}
  ];

  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 0, 1) );
  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 1, 2) );
  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 2, 3) );
  l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 3, -1) );

  //DEBUG
  //l_list = [];
  //l_list.push( create_acyclic_level_tiles(LEVEL_TEMPLATE, 0, -1) );


  // flatten/..
  //
  cur_id = full_tilelist.length;
  for (let idx=0; idx<l_list.length; idx++) {
    for (let ii=0; ii<l_list[idx].length; ii++) {
      full_tilelist.push( l_list[idx][ii] );
      full_tilelist[ full_tilelist.length-1 ]["id"] = cur_id;
      cur_id++;
    }
  }

  // DEBUG
  for (let ii=0; ii<full_tilelist.length; ii++) {
    console.log(JSON.stringify(full_tilelist[ii]));
  }

  let n_tile = full_tilelist.length;
  let wh_cell = Math.ceil( Math.sqrt(n_tile) );

  let src_tileset = await jimp.read("./img/vexed4col_1.png");
  let out_img_tile_size = [wh_cell,wh_cell];
  let _os = out_img_tile_size;
  let out_img = new jimp(_os[0]*STRIDE[0], _os[1]*STRIDE[1]);
  let out_pxy = [0,0];

  let mask_img = [
    await jimp.read("./img/mask_right.png"),
    await jimp.read("./img/mask_left.png"),
    await jimp.read("./img/mask_up.png"),
    await jimp.read("./img/mask_down.png")
  ];

  let join_buf = new jimp(STRIDE[0], STRIDE[1]);
  let mask_buf = new jimp(STRIDE[0], STRIDE[1]);


  for (let tile_idx=1; tile_idx<full_tilelist.length; tile_idx++) {
    let ele = full_tilelist[tile_idx];

    if ( ele.name == "empty" ) {

      let y_off = 3*0;
      let tile_pos = REL_MAP[ele.name];
      let px = STRIDE[0]*tile_pos[0];
      let py = STRIDE[1]*tile_pos[1] + (y_off*STRIDE[1]);

      out_img.blit( src_tileset, out_pxy[0], out_pxy[1], px, py, STRIDE[0], STRIDE[1] );

    }
    else {

      let name_tok = ele.name.split("_");

      let _rm_name = name_tok.slice(0,2).join("_");
      let _lvl = parseInt(name_tok[2].slice(1));

      let src_conn = name_tok[2];
      let src_group = parseInt(src_conn.slice(1));

      let y_off = 3*_lvl;
      let tile_pos = REL_MAP[_rm_name];
      let px = STRIDE[0]*tile_pos[0];
      let py = STRIDE[1]*tile_pos[1] + (y_off*STRIDE[1]);

      let dock = ele.dock;

      join_buf.blit( src_tileset, 0, 0, px, py, STRIDE[0], STRIDE[1] );

      for (let idir=0; idir<4; idir++) {

        if (dock[idir] == '.') { continue; }

        let dst_conn = dock[idir];
        let dst_group = parseInt(dst_conn.slice(1));

        //let dst_partner_dock = ((dst_conn == 'p') ? 'q' : 'p') + dst_conn.slice(1);

        if (src_group == dst_group) { continue; }

        let c_y_off = dst_group;

        let c_tile_pos = REL_MAP["cross"];
        let c_px = STRIDE[0]*c_tile_pos[0];
        let c_py = STRIDE[1]*c_tile_pos[1] + (3*c_y_off*STRIDE[1]);

        mask_buf.blit( src_tileset, 0,0, c_px,c_py, STRIDE[0], STRIDE[1] );
        mask_buf.mask( mask_img[idir], 0,0 );
        join_buf.blit( mask_buf, 0, 0 );

      }

      out_img.blit(join_buf, out_pxy[0], out_pxy[1], 0,0, STRIDE[0],STRIDE[1]);

    }

    out_pxy[0] += STRIDE[0];
    if (out_pxy[0] >= (out_img_tile_size[0]*STRIDE[0])) {
      out_pxy[0]=0;
      out_pxy[1] += STRIDE[1];
    }


  }

  console.log("## writing", OUT_TILESET_FN);
  out_img.write( OUT_TILESET_FN );

  //------
  //------
  // create rules
  //

  let oppo_idir = [1,0, 3,2, 5,4];

  let rule_list = [];
  for (let src_tile_idx=1; src_tile_idx<full_tilelist.length; src_tile_idx++) {
    let _src = full_tilelist[src_tile_idx];

    for (let dst_tile_idx=1; dst_tile_idx<full_tilelist.length; dst_tile_idx++) {
      let _dst = full_tilelist[dst_tile_idx];

      for (let idir=0; idir<4; idir++) {
        let rdir = oppo_idir[idir];

        let src_dock = _src.dock[idir];
        let dst_dock = _dst.dock[rdir];

        let dst_dock_partner = dst_dock;

        if ((dst_dock.slice(0,1) == 'p') ||
            (dst_dock.slice(0,1) == 'q')) {
          dst_dock_partner = ((dst_dock.slice(0,1) == 'p') ? 'q' : 'p')  + dst_dock.slice(1);
        }

        //DEBUG
        //if ((_src.name == "bend_lu_q0_D3") || (_dst.name == "bend_lu_q0_D3")) {
        //  console.log( "src:", _src.name, "dock:", src_dock, ", dst:", _dst.name, "dock:", dst_dock, "partner:", dst_dock_partner);
        //}

        //if (_src.dock[idir] == _dst.dock[rdir]) {
        if (src_dock == dst_dock_partner) {
          rule_list.push([ _src.id, _dst.id, idir, 1 ]);
        }

      }

    }

    for (let idir=0; idir<4; idir++) {
      let rdir = oppo_idir[idir];

      if ( _src.dock[idir] == '.' ) {
        rule_list.push([ _src.id, 0, idir, 1 ]);
        rule_list.push([ 0, _src.id, rdir, 1 ]);
      }

    }

    // add in 0 rule to z in both directions for src
    //
    rule_list.push( [_src.id, 0, 4, 1] );
    rule_list.push( [_src.id, 0, 5, 1] );

    rule_list.push( [0, _src.id, 4, 1] );
    rule_list.push( [0, _src.id, 5, 1] );

    /*
    for (let idir=0; idir<4; idir++) {
      let rdir = oppo_idir[idir];
      if (_src.dock[idir] == '.') { rule_list.push([ _src.id, 0, idir, 1 ]); }
      if (_src.dock[idir] == '.') { rule_list.push([ 0, _src.id, rdir, 1 ]); }
    }
    */


  }

  //------
  //------
  // create name list.
  //

  //let tile_name = [ "." ];
  let tile_name = [ ];
  for (let ii=0; ii<full_tilelist.length; ii++) {
    tile_name.push( full_tilelist[ii].name );
  }

  //------
  //------
  // create weight listt.
  // weight the named empty tile more heavily to cut down on density.
  //


  let tile_weight = [];
  for (let i=0; i<tile_name.length; i++) {
    tile_weight.push(1);
  }
  tile_weight[1] = 10;

  //------
  //------
  // constraint filtering
  //

  let _constraint = [];

  // remove all boundary tiles
  //
  _constraint.push({"type":"remove", "range":{"tile":[0,1],"x":[], "y":[], "z":[]}});

  let empty_tile_id = 1;

  let end0_p_id = -1;
  let end0_q_id = -1;

  for (let ii=0; ii<full_tilelist.length; ii++) {
    if (full_tilelist[ii].name == "end_r_p0_D0") { end0_p_id = full_tilelist[ii].id; }
    if (full_tilelist[ii].name == "end_l_q0_D0") { end0_q_id = full_tilelist[ii].id; }
  }

  let remove_name_pattern = [
    //"end_[rlud]_[pq]\\d+_"
    "end_[rlud]_[pq]0_"
  ];
  let remove_tile_id = [];

  // order matters on constraints
  // we want to:
  // * first remove tiles everywhere
  // * then add back in the ones we want at specific locations
  // * remove all other tiles from that location
  //
  for (let ii=0; ii<full_tilelist.length; ii++) {
    for (let jj=0; jj<remove_name_pattern.length; jj++) {
      if ( full_tilelist[ii].name.match( remove_name_pattern[jj] ) ) {
        remove_tile_id.push( full_tilelist[ii].id );
        let _id = full_tilelist[ii].id;
        _constraint.push({"type":"remove", "range":{"tile":[_id,_id+1], "x":[], "y":[], "z":[] }});
      }
    }

  }

  _constraint.push({"type":"add",  "range":{"tile":[end0_p_id,end0_p_id+1],"x":[1,2], "y":[1,2], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[end0_q_id,end0_q_id+1],"x":[-2,-1], "y":[-2,-1], "z":[0,1]}});

  _constraint.push({"type":"force",  "range":{"tile":[end0_p_id,end0_p_id+1],"x":[1,2], "y":[1,2], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[end0_q_id,end0_q_id+1],"x":[-2,-1], "y":[-2,-1], "z":[0,1]}});

  /*
  _constraint.push({"type":"add",  "range":{"tile":[a_end_r,a_end_r+1],"x":[1,2], "y":[0,1], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[a_end_u,a_end_u+1],"x":[-1,0], "y":[-2,-1], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[b_end_d,b_end_d+1],"x":[0,1], "y":[1,2], "z":[0,1]}});
  _constraint.push({"type":"add",  "range":{"tile":[b_end_l,b_end_l+1],"x":[-2,-1], "y":[-1,0], "z":[0,1]}});

  _constraint.push({"type":"force",  "range":{"tile":[a_end_r,a_end_r+1],"x":[1,2], "y":[0,1], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[a_end_u,a_end_u+1],"x":[-1,0], "y":[-2,-1], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[b_end_d,b_end_d+1],"x":[0,1], "y":[1,2], "z":[0,1]}});
  _constraint.push({"type":"force",  "range":{"tile":[b_end_l,b_end_l+1],"x":[-2,-1], "y":[-1,0], "z":[0,1]}});
  */



  //------
  //------
  // poms structure
  //


  let grid_sz = [32,32];

  let poms = {
    "rule": rule_list,
    "name": tile_name,
    "weight" : tile_weight,
    "constraint": _constraint,
    "tileset": {
      "image": OUT_TILESET_FN,
      "tilecount": full_tilelist.length,
      "imagewidth" : STRIDE[0]*out_img_tile_size[0],
      "imageheight" : STRIDE[1]*out_img_tile_size[1],
      "tilewidth": STRIDE[0],
      "tileheight": STRIDE[1]
    },
    "size" :      [grid_sz[0],grid_sz[1],1],
    "quiltSize" : [grid_sz[0],grid_sz[1],1],
    "boundaryCondition" : {
      "x+":{"type":"tile","value":0}, "x-":{"type":"tile","value":0},
      "y+":{"type":"tile","value":0}, "y-":{"type":"tile","value":0},
      "z+":{"type":"tile","value":0}, "z-":{"type":"tile","value":0}
    }
  };

  console.log("## writing", OUT_POMS_FN);
  fs.writeFileSync( OUT_POMS_FN, JSON.stringify(poms, undefined, 2) );

  return 0;
}

_main();
